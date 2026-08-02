---
title: "Argo Provisioner: Argo 기반 클러스터 생성"
domain: Memoir
category: Projects
date: 2026-07-23
thumbnail: ""
description: ""
featured: true
---

>[!info] 프로젝트 정보
> - 개발 기간: 2026.07.22 ~ 
> - 소속: 개인

# 📘 **프로젝트 소개**
## **개요**
본 프로젝트에서는 다양한 오픈소스 솔루션을 결합하여 환경에 제약 없이 클러스터 생성을 자동화할 수 있는 방안을 제시합니다.
쿠버네티스를 운영하기 위한 솔루션은 여럿 있으며, 그중 오픈소스로 클러스터 관리 툴로 유명한 Rancher는 CNCF의 `Certified Kubernetes - Distribution` 소프트웨어로 등록되어 있습니다. 특히 여럿 클라우드 환경에서의 프로비저닝과 여럿 오픈소스 솔루션을 지원하는 점이 강력한 장점으로 꼽히고 있습니다. 하지만 결국 Rancher의 Node Driver 지원 여부, SUSE 생태계에 강력히 종속되어 있어 라이선스에 대한 잠재적인 우려, Rancher의 유휴 리소스가 높은 등, 커뮤니티 레벨에서 사용하기엔 많은 제약점이 잇따릅니다.. 따라서 자체 개발 Operator와 CNCF의 Argo와 OpenTofu 기반으로 한 오픈소스 기반 쿠버네티스 클러스터 프로비저너를 구현합니다.

## **개발 환경 & 아키텍처**
- Kubernetes 컴포넌트
	- `Argo CD`
	- `Argo Events`
	- `Argo Workflows`
	- ~~`Cluster API`~~
- IaC
	- `OpenTofu`
	- `Ansible`
	- ~~`Terraform`~~
- 테스트 용 HyperVisor
	- `Proxmox`
	- ~~`Harvester`~~

---

# 📜 **개발 방법**
> [!quote] 참조 용 콜아웃(필요 없을 시 제거)

## 1. Kubernetes 컴포넌트 선별
### 1-1. Kluster
[[01KZ0DWBSG95ZHW169XGBGVQAE|Kluster]]는 자체 개발 클러스터 리소스 관리용 Operator입니다. Cluster 프로비저닝을 위한 CRD를 관리합니다.

> 초안은 ClusterAPI를 통해 리소스 관리를 하고자 하였습니다. 하지만 Terraform 혹은 Proxmox의 Provider는 공식 지원이 아니며, CRD 만 사용하기엔 외의 유휴 리소스를 낭비하는 문제가 있었습니다. 따라서 Kluster Operator를 직접 개발합니다.
> Cluster API는 쿠버네티스에서 Cluster, Machine 등에 대한 리소스를 관리하는 Kubernetes-Sig의 오픈소스 입니다. 이를 통해 쿠버네티스 클러스터를 프로비저닝 하고 제어할 수 있도록 구현하고자 하였습니다.

### 1-2. Argo Project
Argo는 CNCF의 Graduated 프로젝트로서, 대표적으로 ArgoCD가 있습니다.

#### ArgoCD
Cluster 혹은 Machine 리소스를 Helm Chart로 배포하면 그를 바탕으로 쿠버네티스의 리소스를 관리하고자 합니다.

#### Argo Events
ArgoCD에서 배포된 Cluster, Machine등의 리소스를 감지하여 Machine 생성을 준비합니다.

#### Argo Workflow
Argo Events를 통해 리소스가 감지되면 이를 바탕으로 Machine을 초기화합니다. `OpenTofu`를 통해 VM을 프로비저닝하고 `Ansible`을 통해 Clustering을 진행합니다.


## 2. IaC 선별
> [!quote] 
> IaC는 현재 환경에 대해서 구성한 예시이며, 프로젝트에서 사용자의 핸들링이 필요한 영역입니다. 현재 선택한 OpenTofu와 Ansible이 아니더라도 VM을 Provisioning할 수 있는 환경이라면 [[#1. Kubernetes 컴포넌트 선별]] 기술 셋을 통해 클러스터 프로비저닝에 대한 궁극적인 목적은 달성할 수 있습니다.

### 2-1. VM Provisioner
구상 초반에는 널리 사용되는 Terraform을 고안했으나, Hashicorp 라이선스 정책의 한계로 인해OpenTofu를 결정했습니다. OpenTofu 프로젝트는 Terraform의 포크 프로젝트로, 리눅스 재단에서 관리하여 라이선스 변경 대응에 용이합니다.

### 2-2. Kubernetes Automation
Kubernetes 클러스터 자동화는 Ansible을 활용합니다. Ansible 또한 레드햇이 소유하고 있지만 핵심 엔진과 생태계가 강력한 GPLv3 오픈소스 라이선스로 보호받고 있어 테라폼처럼 일방적인 유료화 전환이 구조적으로 매우 어렵다고 판단했습니다. 설령 라이선스 변경 시도가 있더라도 OpenTofu처럼 커뮤니티가 즉각 사이드 포크를 통해 소스코드를 이어받을 수 있다고 판단했습니다.


## 3. HyperVisor 비교 및 선별
> [!quote]
> 쿠버네티스의 VM을 프로비저닝 하기 위한 Hypervisor는 IaC로의 프로비저닝 지원 여부에 종속되어 있어 중요도는 낮습니다. 따라서 개발 테스트 용으로 이용하기 위해 적은 리소스를 소요하는 Hypervisor를 선별하였습니다. [[01HR5YHX00DCQAC267MDEW7Y5X|하이브리드 클라우드 구축]]에서 클라우드 및 Hypervisor 환경을 비교했으며, 이번 프로젝트에서 해당 결과에 더해 Harvester에 대한 비교를 진행했습니다. 결과적으로 기존에 사용하던 Proxmox를 선정하였습니다.

> 비교대상
> - Proxmox
> - Harvester

### 3-1. 비교 대상 선별 사유
개인 개발 환경으로 이미 Proxmox를 사용하고 있으며, 현재 회사에서는 VCF9의 Supervisor를 통해 VKS로 쿠버네티스의 멀티 클러스터 환경을 고객사에게 제공하고 있습니다. 해당 아키텍처가 Harvester의 구조와 유사하게 HCI 구조이기 때문에 쿠버네티스 형태로 OS를 관리할 수 있다는 점이 용이하다고 판단하였습니다.

### 3-2. 비교
#### Proxmox
- 장점
	- 유휴 메모리 2GB 내외
	- 커뮤니티 활성화 및 다양한 외부 레퍼런스
	- 현재 개인 개발 환경로 운용 중
- 단점
	- 외부 소프트웨어와의 낮은 호환성
	- 인프라 레벨 A to Z 구축 필요

#### Harvester
- 장점
	- Infra 레벨 Built-in
	- Kubernetes 명령어로 Hypervisor 제어
	- HCI를 위한 다양한 오픈소스를 Add-on 형태로 지원
- 단점
	- 유휴 메모리 9GB 내외(Monitoring Add-on 배포 시 12GB 내외)
	- Rancher 별도 관리 필요

---

# ✍ **개발 경험 및 후기**
## 제목
내용


# 🔗 관련 링크
- 내용