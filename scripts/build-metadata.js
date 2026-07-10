// scripts/build-metadata.js
const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');
const { globSync } = require('glob');
const { execSync } = require('child_process');

// ==========================================
// 🔒 1. 환경 설정 및 상수 정의
// ==========================================
const GITHUB_USERNAME = 'juye-ops';
const REPO_NAME = 'blog-contents';
const RAW_URL_ROOT = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main`;
const DIST_DIR = path.join(process.cwd(), 'dist');

// 🎯 요청하신 대로 폴더명 변경
const LOCAL_MAIN_DIR = path.join(process.cwd(), 'main-branch');

// ==========================================
// 🖼️ 2. 유틸리티 함수 (텍스트 및 경로 정제)
// ==========================================

// 검색 엔진(Fuse.js) 최적화용 텍스트 정제
function sanitizeContent(content) {
  return content.replace(/[#*`~\-_[\]()]/g, '').replace(/\s+/g, ' ').trim().slice(0, 1500);
}

// ==========================================
// 🔄 3. 소스 로드 함수 (환경별 소스 확보)
// ==========================================
function prepareBaseDirectory() {
  if (process.env.TARGET_DIR) return path.resolve(process.env.TARGET_DIR);

  console.log('📦 Downloading and extracting source tarball (No .git)...');

  if (fs.existsSync(LOCAL_MAIN_DIR)) fs.rmSync(LOCAL_MAIN_DIR, { recursive: true, force: true });
  fs.mkdirSync(LOCAL_MAIN_DIR);

  const archiveUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/tarball/main`;

  try {
    // 1. curl로 tarball을 받아오고, 바로 tar로 추출
    // --strip-components=1로 불필요한 최상위 폴더 구조를 제거합니다.
    const cmd = `curl -L ${archiveUrl} | tar -xz -C "${LOCAL_MAIN_DIR}" --strip-components=1`;

    execSync(cmd, { stdio: 'inherit' });

    console.log('✨ Extraction complete. Source is ready.');
  } catch (err) {
    console.error('❌ Tarball download failed:', err);
    process.exit(1);
  }

  return LOCAL_MAIN_DIR;
}


// ==========================================
// ✍️ 4. 데이터 파싱 및 가공 핵심 함수들 (역할 분리)
// ==========================================

// [About] 파싱
function parseAbout(baseDir) {
  const aboutPath = path.join(baseDir, 'about.md');
  if (!fs.existsSync(aboutPath)) return null;

  const { data } = matter(fs.readFileSync(aboutPath, 'utf-8'));
  return {
    contentUrl: `${RAW_URL_ROOT}/about.md` // 링크로 변경
  };
}

// [Portfolio] 파싱
function parsePortfolio(baseDir) {
  const portfolioDir = path.join(baseDir, 'portfolio');
  if (!fs.existsSync(portfolioDir)) return [];

  const files = globSync(path.join(portfolioDir, '**/*.md').replace(/\\/g, '/'));

  return files.map(filePath => {
    const { data } = matter(fs.readFileSync(filePath, 'utf-8'));
    const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');

    return {
      index: data.index || 0,
      contentUrl: `${RAW_URL_ROOT}/${relativePath}` // 링크로 변경
    };
  })
}

// [Posts] 트리 구조화 헬퍼 함수
function buildCategoryTree(flatPosts) {
  return flatPosts.reduce((acc, curr) => {
    let domainNode = acc.find(d => d.domain === curr.domain);
    if (!domainNode) {
      domainNode = { domain: curr.frontmatter.domain, domainSlug: curr.frontmatter.domain.toLowerCase(), categories: [] };
      acc.push(domainNode);
    }

    const categorySlug = curr.frontmatter.category.toLowerCase().trim().replace(/[\/\s]+/g, '-');
    let categoryNode = domainNode.categories.find(c => c.frontmatter.category === curr.frontmatter.category);
    if (!categoryNode) {
      categoryNode = { category: curr.frontmatter.category, categorySlug, posts: [] };
      domainNode.categories.push(categoryNode);
    }

    categoryNode.posts.push(curr);
    return acc;
  }, []).sort((a, b) => a.domain.localeCompare(b.domain));
}

// [Posts] 파싱 메인 수정
function parsePosts(baseDir) {
  const postsDir = path.join(baseDir, 'posts');
  if (!fs.existsSync(postsDir)) return [];

  const files = globSync(path.join(postsDir, '**/*.md').replace(/\\/g, '/'));

  const flatPosts = files.map(filePath => {
    const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));

    // relative path를 이용해 나중에 fetch할 주소 생성
    const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');
    const contentUrl = `${RAW_URL_ROOT}/${relativePath}`;

    return {
      frontmatter: {
        ...data
      },
      slug: path.basename(filePath, '.md'),
      searchContent: sanitizeContent(content), // 검색용 텍스트만 유지
      contentUrl: contentUrl // 본문 대신 URL 제공
    };
  });

  return buildCategoryTree(flatPosts);
}

// ==========================================
// 🚀 5. 오케스트레이션 메인 함수 (전체 흐름 제어)
// ==========================================
async function main() {
  console.log('⏳ Starting Blog Engine...');
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // 1. 소스 준비 (로컬 clone 또는 로봇 패스)
  const baseDir = prepareBaseDirectory();

  // 2. 각 주체별 파싱 (각각의 함수가 독립적으로 연산)
  console.log('📦 Parsing data categories...');
  const postsTree = parsePosts(baseDir);
  const aboutData = parseAbout(baseDir);
  const portfolioData = parsePortfolio(baseDir);

  // 3. 분리형 JSON 파일 내보내기
  if (postsTree.length) fs.writeFileSync(path.join(DIST_DIR, 'posts.json'), JSON.stringify(postsTree, null, 2));
  if (aboutData) fs.writeFileSync(path.join(DIST_DIR, 'about.json'), JSON.stringify(aboutData, null, 2));
  if (portfolioData.length) fs.writeFileSync(path.join(DIST_DIR, 'portfolio.json'), JSON.stringify(portfolioData, null, 2));

  console.log('🚀 [SUCCESS] Metadata separated perfectly! (Cloned sources kept in main-branch/)');
}

main().catch(err => {
  console.error('❌ Build Failed:', err);
  process.exit(1);
});