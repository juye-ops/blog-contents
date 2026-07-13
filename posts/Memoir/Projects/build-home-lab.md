---
title: 쿠버네티스 홈랩 구성
domain: Memoir
category: Projects
date: 2026-07-13
thumbnail:
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
## 나만의 무료 클라우드
퍼블릭 클라우드가 개발 혹은 QA 환경에 있어 금전적인 부담이 잇따른다고 생각합니다. 이에 개인이 지속적으로 구축 및 운영의 환경을 경험할 수 있도록 홈랩을 구성하였습니다. 비록 퍼블릭 클라우드가 우수한 인프라 환경을 구성할 수 있지만, 이론적인 학습만으로 이들 각각의 이점을 이해하기엔 어려움이 있었습니다. 오픈소스로 퍼블릭/프라이빗 클라우드 환경을 개념적으로 이해하되 이를 최대한 녹여내는 데에 힘썼던 것 같습니다. 특히 OPNSense를 도입한 것은 우려한 한계들을 대다수 타개할 수 있었던 핵심 소프트웨어 였습니다. 네트워크 분리를 적절히 구성하여 가상의 개발/운영 환경 등을 분리할 수 있었으며 DNS, DHCP와 같은 네트워크 컴포넌트를 별도 구축하지 않아도 되어 오버헤드를 크게 줄일 수 있었습니다. 또한 OpenVPN을 통해 외부 환경에서도 접근하여 동일한 환경으로 이용할 수 있었습니다. 이로써 쿠버네티스를 부담없이 배포할 수 있었고, 그 내에서도 다양한 오픈소스를 배포하며 유관 경험을 쌓을 수 있었습니다. 현재 다니는 회사에서 쿠버네티스 오픈소스 지원의 핵심 인력으로 활동하고 있으며, 본 프로젝트의 경험이 크게 작용했다고 생각합니다.

## 첫 DevOps 경험
[[2024-03-05-Hybrid-Cloud|하이브리드 클라우드 구축]]을 경험하면서 Terraform을 통해 현대 자동화를 처음 경험했습니다. 특히 이러한 IaC를 통해 인프라를 자동화할 수 있다는 점이 인상 깊었습니다. Micro-Service를 직접 개발하고 이를 CI/CD로 배포할 때 유사한 느낌을 받았습니다. 애플리케이션의 Helm chart를 직접 배포하고 이를 통해 

# 🔗 관련 링크
- 내용