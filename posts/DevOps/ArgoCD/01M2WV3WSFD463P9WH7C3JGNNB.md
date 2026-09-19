---
title: "[ArgoCD] ApplicationSet 기반 멀티클러스터의 GitOps 관리 구성"
domain: "DevOps"
category: "ArgoCD"
date: 2026-09-19
thumbnail: ""
description: ""
featured: false
---

# ApplicationSet이란

ApplicationSet은 여러 개의 Argo CD `Application`을 반복해서 작성하지 않고, **하나의 규칙으로 여러 Application을 생성하고 관리하기 위한 리소스**다.

특히 여러 Kubernetes 클러스터에 동일하거나 유사한 애플리케이션을 배포해야 하는 환경에서 유용하다.

예를 들어 `dev`, `staging`, `prod`와 같이 여러 클러스터를 운영하고 있고 각각에 동일한 애플리케이션을 배포한다고 해보자. Application만 사용한다면 클러스터마다 별도의 `Application`을 만들어야 한다.

반면 ApplicationSet을 사용하면 공통적인 Application 설정을 하나의 Template으로 정의하고, Generator를 통해 배포 대상이나 애플리케이션 정보를 주입할 수 있다.

즉, **개별 Application을 관리하는 대신 Application을 생성하는 규칙을 관리하는 것이 ApplicationSet의 핵심이다.**


> [!quote]- vs Appcation CRD
> ApplicationSet을 이해하려면 먼저 Argo CD의 `Application`과 비교해보는 것이 좋다.
> 
> `Application`은 **하나의 Git Repository와 하나의 Kubernetes 배포 대상 사이의 GitOps 관계를 정의하는 리소스**다.
> 
> 예를 들어 다음과 같이 정의할 수 있다.
> 
> ```yaml
> apiVersion: argoproj.io/v1alpha1
> kind: Application
> metadata:
>   name: nginx
> spec:
>   source:
>     repoURL: https://github.com/example/gitops.git
>     targetRevision: main
>     path: nginx
> 
>   destination:
>     server: https://kubernetes.default.svc
>     namespace: nginx
>  ```


# GitOps를 활용한 멀티클러스터 운영

Kubernetes 클러스터가 여러 개로 늘어나면 각 클러스터의 애플리케이션과 설정을 일관된 방식으로 관리하는 것이 중요하다.

이때 Git을 Single Source of Truth로 사용하고, 각 Kubernetes 클러스터의 원하는 상태를 Git에 정의하는 방식으로 멀티클러스터를 운영할 수 있다.

이것이 **GitOps를 활용한 멀티클러스터 운영**이다.

GitOps에서는 Kubernetes 클러스터에 직접 접속해서 Manifest를 수정하기보다는 Git Repository에 원하는 상태를 정의하고, Argo CD와 같은 GitOps 도구가 실제 클러스터의 상태를 Git의 상태에 맞추도록 한다.


## 클러스터 등록

멀티클러스터 GitOps를 구성하려면 먼저 Argo CD가 관리할 Kubernetes 클러스터를 등록해야 한다.

Argo CD는 등록된 클러스터의 API Server에 접근할 수 있어야 하며, 해당 클러스터에 애플리케이션을 배포할 수 있는 인증 정보와 권한이 필요하다.

클러스터 등록은 Argo CD CLI를 사용하는 방법이 일반적이다.

```bash
argocd cluster add <context-name>
```

Management Cluster에 설치된 Argo CD가 `workload-dev`를 관리하도록 등록하려면 다음과 같이 실행한다.
```
kubectl config get-contexts
CURRENT   NAME
*         management
          workload-dev
          workload-prod
```

```
argocd cluster add workload-dev
```


## ApplicationSet과 함께 사용하기

클러스터를 Argo CD에 등록한 다음에는 ApplicationSet을 이용해 등록된 클러스터를 대상으로 Application을 자동으로 생성할 수 있다.

ApplicationSet은 다양한 Generator를 제공하는데, 멀티클러스터 환경에서는 `Clusters Generator`를 사용할 수 있다.

`Clusters Generator`는 Argo CD에 등록된 클러스터를 조회하고, 각 클러스터의 정보를 ApplicationSet Template에 전달한다.

예를 들어 Argo CD에 다음과 같은 클러스터가 등록되어 있다고 해보자.

```
workload-dev
workload-staging
workload-prod
```

다음과 같이 `Clusters Generator`를 사용하면 등록된 클러스터를 기반으로 Application을 생성할 수 있다.

```
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: nginx
spec:
  generators:
    - clusters: {}

  template:
    metadata:
      name: 'nginx-{{name}}'

    spec:
      project: default

      source:
        repoURL: https://github.com/example/gitops.git
        targetRevision: main
        path: nginx

      destination:
        server: '{{server}}'
        namespace: nginx
```

여기서 `clusters: {}`는 Argo CD에 등록된 클러스터를 Generator의 대상으로 사용한다는 의미다.

`{{name}}`과 `{{server}}`는 각 클러스터에서 가져온 정보를 Template에 주입한다.

따라서 등록된 클러스터를 기준으로 다음과 같은 Application이 자동으로 생성된다.

```yaml
# 공식문서 예제
# https://argo-cd.readthedocs.io/en/stable/user-guide/application-set/

apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: guestbook
spec:
  goTemplate: true
  goTemplateOptions: ["missingkey=error"]
  generators:
  - list:
      elements:
      - cluster: engineering-dev
        url: https://1.2.3.4
      - cluster: engineering-prod
        url: https://2.4.6.8
      - cluster: finance-preprod
        url: https://9.8.7.6
  template:
    metadata:
      name: '{{.cluster}}-guestbook'
    spec:
      project: my-project
      source:
        repoURL: https://github.com/infra-team/cluster-deployments.git
        targetRevision: HEAD
        path: guestbook/{{.cluster}}
      destination:
        server: '{{.url}}'
        namespace: guestbook
```