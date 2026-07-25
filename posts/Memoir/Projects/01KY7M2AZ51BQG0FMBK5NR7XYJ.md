---
title: "Argo Provisioner: Argo 기반 클러스터 생성"
domain: Memoir
category: Projects
date: 2026-07-23
thumbnail: ""
description: "Argo "
featured: true
---


>[!info] 프로젝트 정보
> - 개발 기간: 2026.07.22 ~ 
> - 소속: 개인

# 📘 **프로젝트 소개**
## **개요**
본 프로젝트에서는 다양한 오픈소스 솔루션을 결합하여 환경에 제약 없이 클러스터 생성을 자동화할 수 있는 방안을 제시합니다.
쿠버네티스를 운영하기 위한 솔루션은 여럿 있으며, 그중 오픈소스로 클러스터 관리 툴로 유명한 Rancher는 CNCF의 `Certified Kubernetes - Distribution` 소프트웨어로 등록되어 있습니다. 특히 여럿 클라우드 환경에서의 프로비저닝과 여럿 오픈소스 솔루션을 지원하는 점이 강력한 장점으로 꼽히고 있습니다. 하지만 결국 Rancher의 Node Driver 지원 여부, SUSE 생태계에 강력히 종속되어 있어 라이선스에 대한 잠재적인 우려, Rancher의 유휴 리소스가 높은 등, 커뮤니티 레벨에서 사용하기엔 많은 제약점이 잇따릅니다.. 따라서 CNCF의 Argo와 OpenTofu, Kubernetes Sigs의 Cluster API를 기반으로 한 오픈소스 기반 쿠버네티스 클러스터 프로비저너를 구현합니다.

> 기존엔 널리 사용되는 Terraform을 고안했으나, 마찬가지로 Hashicorp 라이선스 정책의 한계로 오픈소스인 OpenTofu를 결정했습니다. OpenTofu 프로젝트는 Terraform의 포크 프로젝트로, 리눅스 재단에서 관리하여 라이선스 변경 대응에 용이합니다.

## **개발 환경 & 아키텍처**
- Kubernetes 컴포넌트
	- `Cluster API`
	- `Argo CD`
	- `Argo Events`
	- `Argo Workflows`
	- `Karmada`
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


## 2. IaC 선별


## 3. HyperVisor 비교 및 선별
쿠버네티스의 VM을 프로비저닝 하기 위한 Hypervisor는 IaC로의 프로비저닝 지원 여부에 종속되어 있어 중요도는 낮습니다. 따라서 개발 테스트 용으로 이용하기 위해 적은 리소스를 소요하는 Hypervisor를 선별하였습니다. [[01HR5YHX00DCQAC267MDEW7Y5X|하이브리드 클라우드 구축]]에서 클라우드 및 Hypervisor 환경을 비교했으며, 이를 바탕으로 
결과적으로 기존에 사용하던 Proxmox를 선정하였습니다.

비교대상
- Proxmox
- Harvester

### 3-1. 비교 대상 선별 사유
개인 개발 환경으로 이미 Proxmox를 사용하고 있으며, 현재 회사에서는 VCF9의 Supervisor를 통해 VKS로 쿠버네티스의 멀티 클러스터 환경을 고객사에게 제공하고 있습니다. 해당 아키텍처가 Harvester의 구조와 유사하게 HCI 구조이기 때문에 쿠버네티스 형태로 OS를 관리할 수 있다는 점이 용이하다고 판단하였습니다.

### 3-2. 비교
1. Proxmox
	- 유휴 리소스: 메모리 2GB이하
	- 커뮤니티 활성화 및 다양한 외부 레퍼런스
- 




---

# ✍ **개발 경험 및 후기**
## 제목
내용


# 🔗 관련 링크
- 내용