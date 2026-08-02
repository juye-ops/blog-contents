---
title: "KubeBuilder"
domain: "Infra"
category: "Kubernetes"
date: 2026-08-02
thumbnail: ""
description: ""
featured: false
---

# Kubebuilder란?

Kubebuilder는 Kubernetes Operator를 개발하기 위한 공식 SDK이자 프로젝트 생성 도구이다.

Operator를 처음부터 직접 구현하려면 Controller, CRD(Custom Resource Definition), RBAC, Webhook, Manager 등 많은 구성 요소를 직접 작성해야 한다. Kubebuilder는 이러한 반복 작업을 자동으로 생성해주고, 개발자는 비즈니스 로직(Reconcile)에만 집중할 수 있도록 돕는다.

> Kubebuilder는 Kubernetes API Extension을 위한 표준적인 개발 프레임워크라고 생각하면 된다.

---

# Kubebuilder의 핵심 구성 요소

Kubebuilder 프로젝트는 크게 다음과 같은 요소들로 구성된다.

## CRD (Custom Resource Definition)

CRD는 Kubernetes에 새로운 리소스를 추가하는 기능이다.

예를 들어 기본 Kubernetes에는 다음과 같은 리소스가 존재한다.

- Pod
- Deployment
- Service
- Secret

Kubebuilder를 사용하면 직접 새로운 리소스를 정의할 수 있다.

```yaml
apiVersion: infrastructure.kluster.io/v1
kind: Cluster

spec:
  kubernetesVersion: v1.33.0
```

이처럼 Kubernetes가 원래 알지 못하는 `Cluster`라는 리소스를 생성할 수 있다.

---

## Controller

Controller는 원하는 상태(Desired State)와 현재 상태(Current State)를 계속 비교하는 컴포넌트이다.

예를 들어 Cluster 리소스가 생성되면

```yaml
kind: Cluster
```

Controller는 이를 감지하여

- ControlPlane 생성
- WorkerNode 생성
- Infrastructure 생성
- 상태(Status) 업데이트

등의 작업을 수행한다.

즉,

```
Cluster 생성
        │
        ▼
Controller(Reconcile)
        │
        ├── ControlPlane 생성
        ├── WorkerNode 생성
        └── Status 갱신
```

와 같은 흐름으로 동작한다.

---

## Reconcile Loop

Operator의 핵심은 Reconcile 함수이다.

```go
func (r *ClusterReconciler) Reconcile(...) {
    ...
}
```

Reconcile은 이벤트가 발생할 때마다 호출된다.

예를 들어

- Cluster 생성
- Cluster 수정
- Cluster 삭제
- ControlPlane 변경
- WorkerNode 변경

등의 이벤트가 발생하면 Kubernetes는 Controller에게 다시 상태를 맞추도록 요청한다.

이를 **Reconciliation**이라고 한다.

---

## Manager

Manager는 여러 Controller를 실행하는 엔트리 포인트이다.

```
Manager
 ├── Cluster Controller
 ├── ControlPlane Controller
 ├── WorkerNode Controller
 └── Machine Controller
```

보통 `cmd/main.go`에서 Manager를 생성하고 Controller를 등록한다.

```go
mgr.Start(...)
```

를 호출하면 모든 Controller가 동작하기 시작한다.

---

# Kubebuilder 프로젝트 구조

일반적으로 다음과 같은 구조를 가진다.

```
.
├── api/
│   └── v1/
│       ├── cluster_types.go
│       ├── controlplane_types.go
│       └── workernode_types.go
│
├── internal/
│   ├── controlplane/
│   ├── workernode/
│   └── bootstrap/
│
├── internal/controller/
│   ├── cluster_controller.go
│   ├── controlplane_controller.go
│   └── workernode_controller.go
│
└── cmd/
    └── main.go
```

각 디렉터리의 역할은 다음과 같다.

| 디렉터리 | 역할 |
|-----------|------|
| api | CRD 정의 |
| controller | Reconcile 구현 |
| internal | 비즈니스 로직 |
| cmd | Manager 실행 |

---

# Kubebuilder의 장점

- Kubernetes 공식 개발 방식
- controller-runtime 기반
- CRD 자동 생성
- RBAC 자동 생성
- Webhook 지원
- 테스트 환경(envtest) 제공
- 코드 생성 도구(controller-gen) 제공

---

# Kubebuilder와 Operator

Operator는 Kubernetes의 선언형(Declarative) 철학을 애플리케이션에도 적용하는 방법이다.

사용자는 원하는 상태만 선언한다.

```yaml
apiVersion: infrastructure.kluster.io/v1
kind: Cluster

spec:
  kubernetesVersion: v1.33.0
  controlPlaneRef:
    replicas: 3

  workerNodeRefs:
    - nodePool: default
      replicas: 3
```

Operator는 이를 감지하여 실제 리소스를 생성하고, 원하는 상태가 유지되도록 지속적으로 관리한다.

```
User
 │
 ▼
Cluster CR
 │
 ▼
Operator
 │
 ├── Create ControlPlane
 ├── Create WorkerNode
 ├── Scale
 ├── Upgrade
 └── Recover
```

---

# Kubebuilder를 사용하는 이유

Kubebuilder는 Kubernetes API를 직접 확장할 수 있게 해주는 가장 표준적인 방법이다.

특히 새로운 플랫폼이나 인프라를 Kubernetes 방식으로 추상화하고 싶다면 매우 적합하다.

예를 들어 `Kluster` 프로젝트에서는

```
Cluster
 ├── ControlPlane
 └── WorkerNode
```

와 같은 Custom Resource를 정의하고,

Controller가 이를 감지하여 실제 Infrastructure Provisioning을 수행하도록 설계하였다.

이를 통해 사용자는 Kubernetes 리소스를 생성하는 것만으로 새로운 Kubernetes Cluster를 선언적으로 생성할 수 있다.

---

# 정리

Kubebuilder는 Kubernetes Operator 개발을 위한 공식 프레임워크이다.

직접 Controller와 CRD를 구현하는 복잡한 작업을 단순화하며, Kubernetes의 선언형 모델을 그대로 활용할 수 있도록 도와준다.

Operator를 개발하거나 Kubernetes를 플랫폼으로 확장하고자 한다면 Kubebuilder는 가장 먼저 익혀야 할 도구 중 하나이다.