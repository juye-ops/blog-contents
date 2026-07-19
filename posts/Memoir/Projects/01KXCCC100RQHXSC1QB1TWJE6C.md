---
title: 쿠버네티스 홈랩 구성
domain: Memoir
category: Projects
date: 2026-07-13
thumbnail: ""
description: |-
  쿠버네티스 테스트베드 및 운영 개인 운영 환경을 위한 홈랩을 구성합니다.
  CNCF가 정의한 클라우드 네이티브 아키텍처를 준수하여 오픈소스 기반 플랫폼을 구축합니다.
featured: true
---

>[!info] 프로젝트 정보
> - 개발 기간: 2025.12. ~
> - 소속: 개인

# 📘 **프로젝트 소개**
## **개요**
미니 PC와 소형 NAS를 설치하여 개인 서버를 구성하였습니다.
쿠버네티스 환경을 로컬 디바이스에 종속되지 않기 위해 홈랩을 구성하여 VPN을 통해 외부에서도 접속 가능하도록 구현하였습니다. 특히 DevOps, Observability, Connectivity&Security,  K8S Management 등 K8S의 다양한 도메인에 대한 운영을 경험하고 있습니다.
CNCF 아키텍처를 최대한 준수하고 있으며, 오픈소스를 통해 한계없는 생태계를 구성하는 데에 힘쓰고 있습니다.

## **개발 환경 & 아키텍처**
![[file-20260713211826963.png]]

### Infrastructure
- 하이퍼바이저: `Proxmox`
- 네트워크: `OPNSense`
	- 로드밸런서: `KeepAlived`&`HAProxy`
	- 웹 서버: `Nginx`
	- VPN: `OpenVPN`
- 스토리지: `TrueNAS`

### Kubernetes
- 클러스터 관리: `Rancher`, `Helm`, `Docker`, `Harbor`, `Cert Manager`
- 네트워크: `Calico`, `Istio`, `MetalLB`
- 보안: `Authentik`
- 스토리지:`MinIO`, `Democratic CSI`
- DevOps: `ArgoCD`, `GithubARC`
- Observability: `Grafana`, `Kiali`

---

# 📜 **개발 방법**
> [!quote] 참조 용 콜아웃(필요 없을 시 제거)
## 1. 관리 생태계 구성
### 1-1. 인프라 구성
- 오픈소스 Hypervisor인 `Proxmox`를 통해 VM 생성 및 관리
- 오픈소스 NAS OS인 `TrueNAS`를 통해 스토리지 구성 및 개인 앱 배포
- 오픈소스 네트워크 OS인 `OPNSense`를 통해 네트워크 컴포넌트 배포 및 환경 마련
- `HAProxy` 및 `Nginx`를 통해 소프트웨어 로드밸런싱 기능 지원

### 1-2. 클러스터 관리
- `Rancher`의 On-premise에 대한 `Ansible` 기반 자동화 구성
- 헬름 차트의 Values를 버전별로 관리하여 History 구성
- 소프트웨어 로드밸런서와 BGP 연결을 통해 `ServiceType: LoadBalancer`의 다른 대역 아이피 지원
- GatewayAPI를 도입하여 Istio Gateway를 통한 플랫폼 통합
- `Cert Manager`를 통해 클러스터 내 사용할 인증서 관리


## 2. 플랫폼 환경 구성
### 2-1. DevOps 환경 구성
- `ArgoCD`의 App-of-Apps 패턴을 통해 Application 중앙 관리
- `GithubARC`를 통해 별도의 형상관리 툴 배포 없이 저비용의 Runner 기능 이용
- `Harbor`에 대해 Github Secret을 통한 Continuous Dellivery 지원
- `Grafana`, `Kiali`를 통한 모니터링 대시보드 제공
- `Prometheus`, `Loki`, `Jaeger`를 통해 메트릭/앱 로그 전송

### 2-2. IdP 구성 테스트
- `Authentik`을 통해 클러스터 내 플랫폼에 대한 OIDC 연동
- RBAC 관리 테스트 진행

---

# ✍ **개발 경험 및 후기**
### 1. 홈랩: 나만의 프라이빗 클라우드 구축

퍼블릭 클라우드의 비용 부담을 해소하고, 인프라의 전체 생명주기를 직접 운영하며 학습하고자 홈랩을 구성했습니다. 이론 학습을 넘어 실제 인프라를 설계하며 오픈소스 생태계를 깊이 있게 이해하는 것이 목표였습니다.

- **네트워크 아키텍처**: OPNsense를 도입하여 네트워크 분리 및 보안을 강화했습니다. 이를 통해 개발/운영 환경을 가상으로 분리하고, DNS/DHCP 등 네트워크 컴포넌트를 자체 관리하여 운영 오버헤드를 최적화했습니다. 또한 OpenVPN을 구축해 외부에서도 동일한 인프라 환경에 접근 가능한 하이브리드 환경을 구현했습니다.
- **성과**: 이 환경을 통해 쿠버네티스를 부담 없이 배포하고 다양한 오픈소스를 직접 운영하며 실무적인 인사이트를 얻었습니다. 이 경험은 현재 사내 쿠버네티스 오픈소스 지원 업무를 수행하는 핵심 역량이 되었습니다.

### 2. DevOps: CI/CD 파이프라인 및 자동화

하이브리드 클라우드 환경에서 Terraform을 활용한 IaC(Infrastructure as Code)를 처음 도입하며 자동화의 중요성을 체감했습니다. 이를 바탕으로 Micro-Service 아키텍처에 최적화된 CI/CD 파이프라인을 구축했습니다.

- **보안 및 자동화 설계**
    - GitHub(Public)와 Harbor(Private) 간의 안전한 통신을 위해 Secret 관리 및 Deploy Key를 통한 SSH 접근 방식을 적용했습니다.
    - **Workflow:** `Git Push` → `GitHub ARC(쿠버네티스 파드 러너) 기반 빌드` → `Harbor 이미지 푸시` → `Helm Chart 태그 업데이트` → `ArgoCD의 지속적 배포(CD)`로 이어지는 End-to-End 시퀀스를 완성했습니다.
- **학습 내용**: 'App-of-apps' 패턴을 실무에 적용하며 배포 효율성을 극대화했고, 현업에서 권장하는 베스트 프랙티스를 직접 체득하여 CI/CD의 기술적 효용과 중요성을 이해했습니다.
    

### 3. 플랫폼 구성: 사용자 중심의 인증 시스템(IdP)

혼자 사용하는 환경이지만, 다수의 사용자가 협업하는 환경을 가정한 플랫폼 아키텍처를 지향했습니다.


- **인증 및 인가 시스템 도입:** Authentik을 도입하여 OIDC 및 SSO 환경을 구축했습니다. 여러 플랫폼을 연동하여 중앙 인증 체계를 마련하고, RBAC(Role-Based Access Control)을 실험하며 권한 관리의 복잡성을 해소했습니다.
- **기술적 판단:** 사내에서 사용 중인 Keycloak은 기능은 강력하지만 인프라 운영 오버헤드가 크다고 판단했습니다. 반면, Authentik은 직관적인 UI/UX와 우수한 확장성을 갖춰 운영 효율성 측면에서 더 적합하다고 결론 내렸습니다. 이를 통해 단순한 '사용'을 넘어 IdP의 핵심 개념과 워크플로우를 완벽히 이해하는 계기가 되었습니다.
