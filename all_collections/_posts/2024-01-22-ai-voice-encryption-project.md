---
layout: post
title: "대화형 AI 기반 파일 보안 시스템"
date: 2024-01-22
categories: [Project, Python, AI, Security]
tags: [STT, TTS, SentenceTransformer, Python, Encryption]
---

## 프로젝트 개요: "내 목소리로 잠그는 파일"

"파일을 암호화해줘"라고 말하면 AI가 알아서 파일을 찾고, 내 목소리 패턴을 분석해 비밀번호를 생성하는 시스템. 영화 속 아이언맨의 자비스처럼 동작하는 보안 시스템을 직접 구현 해보고자 하였다.

이번 포스트에서는 `Ruri Web` 프로젝트의 일환으로 진행된 **"대화형 AI 기반 RSA 암호화 알고리즘 구현"** 논문과 그 구현체를 분석하고 회고해보려 한다. 이 프로젝트의 핵심 목표는 사용자의 음성을 통해 파일을 제어하고, 목소리 자체를 암호화의 키(Key)로 활용하는 것이다.

### 논문에서 제안하는 핵심 프로세스 (5 Step)

제공된 논문(`대화형 AI 기반 RSA 암호화 알고리즘 구현`)에 따르면, 이 시스템은 다음과 같은 5단계 흐름으로 설계되었습니다.

1.  **설정**: 암호화 대상을 지정.
2.  **녹음**: 마이크를 통해 사용자의 목소리를 녹음.
3.  **변환**: STT(Speech-to-Text) 기술로 음성을 텍스트로 전환.
4.  **키 생성**: 변환된 텍스트와 목소리 특성을 분석하여 암호화 키를 생성.
5.  **암호화**: 생성된 키를 이용해 파일을 암호화.

---

## 기술 스택 및 구현 분석

이 프로젝트는 파이썬(Python)을 기반으로 다양한 AI 및 음성 처리 라이브러리를 활용했습니다.

### 1. 음성 인터페이스 (UI): 듣고 말하는 AI (`project.py`)

사용자와의 소통은 `speech_recognition` 라이브러리와 구글의 STT(Speech-to-Text) API를 사용합니다. 단순히 명령을 듣는 것을 넘어, `gTTS`(Google Text-to-Speech)와 `playsound`를 이용해 AI가 대답하는 양방향 소통을 구현했습니다.

```python
# project.py 핵심 로직 발췌
import speech_recognition as sr
from gtts import gTTS

def listen(recognizer, audio):
    try:
        text = recognizer.recognize_google(audio, language='ko') # 음성을 텍스트로
        answer(text) # 대답 생성
    except sr.UnknownValueError:
        print('인식 실패')

def answer(input_text):
    if '암호화' in input_text:
        speak("어떤 파일을 암호화할까요?")
        # ... 파일 찾기 및 암호화 로직 연결 ...
```

코드를 보면 `r.listen_in_background`를 사용하여 백그라운드에서 상시 대기하며 사용자의 호출을 기다리는 구조를 취하고 있습니다.

### 2. 지능형 비밀번호 처리: 의미를 이해하는 비밀번호 (`project_lock.py`)

일반적인 비밀번호 시스템은 입력값과 설정값이 문자열 그대로 **정확히 일치(Exact Match)**해야 합니다. 하지만 음성 인식은 발음이나 주변 소음에 따라 "사과"가 "사가"로 인식될 수도 있습니다.

이 프로젝트는 **SentenceTransformer** 모델(`jhgan/ko-sroberta-multitask`)을 사용하여 이 문제를 해결했습니다.

```python
# project_lock.py
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('jhgan/ko-sroberta-multitask')

# 비밀번호 설정 시 임베딩 벡터 저장
wr.writerow([filename, file, file, list(model.encode(file))])
```

비밀번호를 텍스트 그대로 저장하는 것이 아니라, AI 모델을 거쳐 **임베딩 벡터(Embedding Vector)** 형태로 저장합니다. 검증 단계에서는 입력된 음성과 저장된 비밀번호의 **코사인 유사도(Cosine Similarity)**를 계산하여, 일정 수준 이상 비슷하면 통과시킵니다. 즉, AI가 문맥과 의미를 파악하여 유연하게 대처하는 것입니다.

### 3. 파일 암호화: RSA의 이상과 XOR의 현실 (`Custom_Encode.py`)

논문의 제목은 **RSA 암호화 알고리즘 구현**이지만, 실제 프로젝트 코드(`Custom_Encode.py`)를 분석해보면 비대칭 키 방식인 RSA 대신 **XOR 연산**을 이용한 스트림 암호화 방식이 적용되어 있습니다. 이는 개발에 사용된 컴퓨팅 자원이 제한적이여서 테스트 단계에서 XOR을 사용하였다.

> **논문의 설계 (RSA)**: 목소리에서 추출한 데이터를 기반으로 `Public Key`와 `Private Key`를 생성하여 보안성을 극대화하고자 함.
> **실제 구현 (XOR)**: 구현 난이도와 성능 이슈로 인해, 목소리 텍스트를 바이트로 변환 후 파일과 XOR 연산 수행.

```python
# Custom_Encode.py
def c_Encode(address, s):
    byte_s = s.encode('utf-8') # 텍스트(목소리 변환값)를 바이트로 변환
    # ... 파일 읽기 ...
    for i in range(len(temp_line)):
        temp_line[i] ^= byte_s[n] # XOR 연산으로 암호화
```

사용자의 목소리(STT로 변환된 텍스트)가 암호화의 `Key`가 되어 원본 파일의 바이트 데이터와 XOR 연산을 수행합니다. 이 방식은 구현이 매우 간단하고 빠르다는 장점이 있지만, 키의 길이가 파일보다 짧을 경우 패턴이 반복되어 보안에 취약해질 수 있다는 단점이 있습니다.


---

## 마무리

"대화형 AI 기반 암호화 시스템"은 딱딱한 보안 프로그램에 **대화(Conversation)**라는 감성을 불어넣은 프로젝트였습니다. AI가 내 말을 알아듣고 파일을 지켜준다는 경험은 사용자에게 새로운 가치를 제공합니다.

앞으로는 이 시스템에 **화자 인식(Speaker Verification)** 기술을 더해, 단순히 "비밀번호를 말해서"가 아니라 "내 목소리라서" 문이 열리는 진정한 생체 보안 시스템으로 발전시켜보면 좋을것 같습니다.
