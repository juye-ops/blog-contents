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


> [!quote] vs Appcation
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


