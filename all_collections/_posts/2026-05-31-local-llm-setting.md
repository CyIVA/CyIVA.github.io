---
title: 로컬 LLM 세팅
date: 2026-05-31
categories: [Dev, Blog]
---

LM studio + VS Code + Continue.dev 조합으로 개발 전용 AI를 구성하고자 한다.

### 1. LM studio 설치 및 모델 받기

[LM studio 공식 홈페이지](https://lmstudio.ai/)에서 사용할 환경에 맞추어서 설치를 진행

설치가 완료되면 GUI를 이용해서 원하는 모델을 추가할수 있다.
이번에는 **gemma-4-e4b**라는 모델을 사용하고자 한다.

### 2. VS Code에 Continue 확장 프로그램 설치 및 연결

이제 에디터와 AI를 연결해보자

VS code의 Extensions에서 Continue을 설치
Continue을 설치되면 VSC의 좌측에 Continue 아이콘이 나타난것을 확인 가능하다.

Continue탭에서 models -> 우측 + 아이콘 으로 진입한 이후, LM studio 선택후 model에 autodetect를 하여 연결이 가능하다.

또한 기본 세팅으로는 자동완성이 적용되지 않기때문에 config.yaml을 수정해 자동완성을 추가 하였다.
아래는 실제 사용한 내용이다.

```
name: Local Config
version: 1.0.0
schema: v1

models:
  - name: gemma
    provider: lmstudio
    model: google/gemma-4-e4b
    apiBase: http://localhost:1234/v1/
    capabilities:
      - tool_use

  - name: gemma
    provider: lmstudio
    roles:
      - autocomplete
    model: google/gemma-4-e4b
    apiBase: http://localhost:1234/v1/
```

config.yaml을 보면 자동완성과 tool-use를 다른 모델에 할당한것을 볼수 있는데, autocomplete에 더 낮은 사양의 모델을 넣어도 autocomplete의 기능을 수행하는것에는 무리가 없기때문에 vram에 따라서 조절해도 무방하다.
