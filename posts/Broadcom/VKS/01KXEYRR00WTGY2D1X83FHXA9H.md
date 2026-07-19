---
title: "[VKS]vSphere Kubernetes Service"
domain: "Broadcom"
category: "VKS"
date: 2026-07-14
thumbnail: ""
description: ""
featured: false
---

# vSphere Kubernetes Service(VKS)란?

**vSphere Kubernetes Service(VKS)**는 VMware Cloud Foundation(VCF) 9에서 제공하는 Kubernetes 서비스로, **Supervisor**를 기반으로 표준 Kubernetes 클러스터를 생성하고 운영할 수 있도록 지원하는 기능이다.

기존에는 Kubernetes 클러스터를 구축하기 위해 관리 클러스터를 직접 설치하고 운영해야 했지만, VKS는 Supervisor가 클러스터의 생성부터 업그레이드, 확장, 삭제까지의 생명주기(Lifecycle)를 관리하여 운영 부담을 크게 줄여준다.

VKS는 CNCF Certified Kubernetes를 기반으로 하며, 표준 Kubernetes API와 생태계를 그대로 활용할 수 있다.

---

## 1. VKS의 특징

### 1-1. 표준 Kubernetes 제공

VKS는 Kubernetes 표준을 그대로 따르므로 일반적인 Kubernetes 애플리케이션을 별도의 수정 없이 배포할 수 있다.

즉, 온프레미스 환경에서도 클라우드와 동일한 Kubernetes 경험을 제공한다.

---

### 1-2. Supervisor 기반 Lifecycle 관리

VKS Cluster는 Supervisor가 관리하는 하나의 리소스이다.

Supervisor는 다음 작업을 자동으로 수행한다.

- Kubernetes Cluster 생성
- Control Plane 구성
- Worker Node 생성
- Cluster Upgrade
- Scale Out / Scale In
- 장애 복구
- Cluster 삭제

사용자는 Kubernetes Cluster 자체를 직접 설치하는 것이 아니라 Supervisor에게 원하는 Cluster 사양을 선언하면 된다.

---

### 1-3. Cluster API(CAPI) 기반

VCF 9의 VKS는 Cluster API(CAPI)를 기반으로 Cluster Lifecycle을 관리한다.

이를 통해 Kubernetes 커뮤니티에서 사용하는 표준 방식으로 Cluster를 관리할 수 있으며 향후 Kubernetes 버전 변경이나 기능 추가에도 유연하게 대응할 수 있다.

대표적으로 다음 리소스들이 사용된다.

- Cluster
- MachineDeployment
- MachineHealthCheck
- KubeadmControlPlane
- Infrastructure Provider

---

### 1-4. vSphere 리소스와 통합

VKS는 Kubernetes Cluster를 생성하면서 vSphere 인프라와 긴밀하게 연동된다.

대표적으로 다음 기능을 사용할 수 있다.

- vSphere Storage Policy
- VM Class
- Content Library
- NSX 또는 vSphere Networking
- Load Balancer
- CSI(Container Storage Interface)

덕분에 Kubernetes 관리자는 별도의 Infrastructure Provider를 직접 구성하지 않아도 된다.

---

## 2. VKS Cluster 생성 과정

VKS Cluster는 일반적으로 다음 순서로 생성된다.

```text
사용자
    │
    ▼
Supervisor
    │
    ▼
Cluster API
    │
    ▼
Virtual Machine 생성
    │
    ▼
Control Plane 구성
    │
    ▼
Worker Node 구성
    │
    ▼
Kubernetes Cluster Ready
```

사용자는 Cluster 스펙만 정의하면 Supervisor가 필요한 Virtual Machine을 생성하고 Kubernetes Cluster를 자동으로 구성한다.

---

## 3. VKS와 Supervisor의 관계

Supervisor와 VKS는 서로 다른 역할을 수행한다.

| 구성 요소 | 역할 |
|-----------|------|
| Supervisor | Kubernetes 플랫폼 및 인프라 관리 |
| VKS | 사용자 애플리케이션을 실행하는 Kubernetes Cluster |

간단한 구조는 다음과 같다.

```text
                 vCenter
                     │
             Supervisor Cluster
                     │
     ┌───────────────┴───────────────┐
     │                               │
 Namespace A                   Namespace B
     │                               │
 VKS Cluster A                 VKS Cluster B
     │                               │
 Applications                 Applications
```

Supervisor는 여러 개의 VKS Cluster를 생성하고 관리하며, 실제 워크로드는 각 VKS Cluster에서 실행된다.

---

## 4. VKS의 장점

VKS를 사용하면 다음과 같은 이점을 얻을 수 있다.

- 표준 Kubernetes 환경 제공
- Kubernetes Cluster 구축 자동화
- Cluster Lifecycle 자동 관리
- vSphere 리소스와의 통합
- Kubernetes 업그레이드 간소화
- 여러 Cluster를 일관된 방식으로 관리
- GitOps 및 DevOps 도구와의 높은 호환성

---

## 정리

vSphere Kubernetes Service(VKS)는 VCF 9에서 Kubernetes 클러스터를 제공하는 핵심 서비스이다.

Supervisor를 기반으로 Kubernetes Cluster의 생성부터 운영, 업그레이드, 삭제까지의 전 과정을 자동화하며, 사용자는 표준 Kubernetes 환경에서 애플리케이션을 실행하는 데 집중할 수 있다.

즉, Supervisor가 Kubernetes 플랫폼을 제공하는 관리 계층이라면, VKS는 실제 애플리케이션이 실행되는 **Workload Kubernetes Cluster**를 제공하는 서비스라고 이해하면 된다.