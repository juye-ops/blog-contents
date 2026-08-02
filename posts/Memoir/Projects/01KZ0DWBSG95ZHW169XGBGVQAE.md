---
title: "Kluster: 클러스터 프로비저닝 Operator 생성"
domain: Memoir
category: Projects
date: 2026-08-02
thumbnail: ""
description: "Kluster은 플랫폼 종속성 없이 추상화 된 쿠버네티스 Cluster의 프로비저닝을 지원합니다."
featured: true
---

>[!info] 프로젝트 정보
> - 개발 기간: 2026.07.27
> - 소속: 개인

# 📘 **프로젝트 소개**
## **개요**
Kluster는 `Kubebuilder` 기반 쿠버네티스 Cluster 배포를 관리하기 위한 Operator입니다.
> Kubebuilder는 Operator 

특히 Cluster 리소스를 추상화하여 배포 Provisioner Provider에 대한 종속성을 완전 해제하는 것을 목표로 개발합니다.

배포 절차는 다음과 같습니다.
`Cluster CRD 배포 > ControlPlane CRD 생성 > WorkerNode CRD 생성 > Machines 생성`

## **개발 환경 & 아키텍처**
- `Kubebuilder`
---

# 📜 **개발 방법**
> [!quote] 참조 용 콜아웃(필요 없을 시 제거)
## 1. Initialize
Kubebuilder는 `init` 명령어를 통해 Operator에 대한 go template을 생성합니다. 

```bash
kubebuilder init \
    --domain="infrastructure.kluster.io" \
    --repo="github.com/kluster-sigs/kluster"
```

> [!info]- 최초 폴더 구조
> ```
> .
> ├── AGENTS.md
> ├── Dockerfile
> ├── Makefile
> ├── PROJECT
> ├── README.md
> ├── cmd
> │   └── main.go
> ├── config
> │   ├── default
> │   │   ├── cert_metrics_manager_patch.yaml
> │   │   ├── kustomization.yaml
> │   │   ├── manager_metrics_patch.yaml
> │   │   └── metrics_service.yaml
> │   ├── manager
> │   │   ├── kustomization.yaml
> │   │   └── manager.yaml
> │   ├── network-policy
> │   │   ├── allow-metrics-traffic.yaml
> │   │   └── kustomization.yaml
> │   ├── prometheus
> │   │   ├── kustomization.yaml
> │   │   ├── monitor.yaml
> │   │   └── monitor_tls_patch.yaml
> │   └── rbac
> │       ├── kustomization.yaml
> │       ├── leader_election_role.yaml
> │       ├── leader_election_role_binding.yaml
> │       ├── metrics_auth_role.yaml
> │       ├── metrics_auth_role_binding.yaml
> │       ├── metrics_reader_role.yaml
> │       ├── role.yaml
> │       ├── role_binding.yaml
> │       └── service_account.yaml
> ├── go.mod
> ├── go.sum
> ├── hack
> │   └── boilerplate.go.txt
> └── test
>     ├── e2e
>     │   ├── e2e_suite_test.go
>     │   └── e2e_test.go
>     └── utils
>         └── utils.go
> ```

## 2. API 선언
### 2-1. API 생성
Kluster의 CRD가 사용할 Types를 지정한다. Kubebuilder는 이를 바탕으로 CRD를 생성한다.
```
kubebuilder create api --group infrastructure.kluster.io --version v1 --kind Cluster
kubebuilder create api --group infrastructure.kluster.io --version v1 --kind ControlPlane
kubebuilder create api --group infrastructure.kluster.io --version v1 --kind WorkerNode
kubebuilder create api --group infrastructure.kluster.io --version v1 --kind InfrastructureTemplate
```

### 2-2. Type 정의
`./api/v1/{apiName}_types.go` 에서 Type을 지정한다.

```go:cluster_types.go
...
type ClusterSpec struct {
	ClusterName        string             `json:"clusterName"`
	KubernetesVersion  string             `json:"kubernetesVersion"`
	ControlPlaneConfig ControlPlaneConfig `json:"controlPlaneRef"`
	WorkerNodeConfigs  []WorkerNodeConfig `json:"workerNodeRefs,omitempty"`
}
...
```

```go:controlplane_types.go
...
type ControlPlaneConfig struct {
	Replicas    int    `json:"replicas"`
	TemplateRef string `json:"templateRef"`
}

type ControlPlaneSpec struct {
	ControlPlaneConfig `json:",inline"`
	KubernetesVersion  string `json:"kubernetesVersion"`
}
...
```

```go:workernode_types.go
...
type WorkerNodeConfig struct {
	NodePool    string `json:"nodePool"`
	Replicas    int    `json:"replicas"`
	TemplateRef string `json:"templateRef"`
}

type WorkerNodeSpec struct {
	WorkerNodeConfig  `json:",inline"`
	KubernetesVersion string `json:"kubernetesVersion"`
}
...
```

```go:infrastructuretemplate_types.go
...
type InfrastructureTemplateSpec struct {
	CPU    string `json:"cpu"`
	Memory string `json:"memory"`
}
...
```

### 2-3. Custom resource 생성
make 명령어를 통해 API에 대한 제어를 지원한다.
`make manifests`: CRD 등 manifests를 생성한다.
`make install`: 
`make generate`


---

# ✍ **개발 경험 및 후기**
## 제목
내용


# 🔗 관련 링크
- 내용