---
layout: post
title:  "[HeimerRuri] 0. 프로젝트 개요 (Project Overview)"
date:   2025-11-27
categories: [HeimerRuri, Project]
---

알츠하이머병(Alzheimer's Disease, AD)은 전 세계적으로 가장 흔한 치매 원인 질환이다. 조기 진단이 중요하지만, 현재의 임상 진단 방식은 주관적 평가에 의존하는 경우가 많아 객관성과 재현성에 한계가 있다. 본 프로젝트 **HeimerRuri**는 3D MRI 영상을 활용한 딥러닝 기반 알츠하이머 진단 모델을 구축하여, 의료 영상 분석의 자동화 및 정량화 가능성을 탐구하는 것을 목표로 한다.

## 프로젝트 배경 및 목적

MRI는 뇌의 구조적 변화를 비침습적으로 관찰할 수 있는 강력한 도구다. 특히 알츠하이머 환자의 경우 해마(Hippocampus)와 측뇌실(Lateral Ventricle) 주변의 위축이 두드러지게 나타난다. 그러나 이러한 변화를 육안으로 정확히 판별하기는 어렵고, 영상의 품질과 촬영 조건에 따라 판독 결과가 달라질 수 있다.

딥러닝, 특히 3D Convolutional Neural Network(3D CNN)는 복잡한 3차원 공간 패턴을 학습할 수 있어 의료 영상 분석에 적합하다. 본 프로젝트는 다음과 같은 핵심 질문에 답하고자 했다:

1. **전처리**: 이질적인 MRI 데이터를 어떻게 표준화할 것인가?
2. **모델링**: 제한된 3D 데이터로 과적합을 방지하며 학습할 수 있는가?
3. **해석성**: 모델이 실제로 의학적으로 타당한 영역을 보고 판단하는가?

## 기술 스택 (Tech Stack)

본 프로젝트에서 사용한 주요 도구와 라이브러리는 다음과 같다:

### 데이터 전처리
- **HD-BET**: 딥러닝 기반 뇌 추출(Skull Stripping) 도구. 두개골과 비뇌 조직을 제거하여 순수 뇌 영상만 추출.
- **ANTsPy**: Advanced Normalization Tools의 Python 구현체. MNI152 표준 공간으로의 정합(Registration) 및 해마 ROI 추출에 사용.
- **TorchIO**: 3D 의료 영상 증강(Augmentation) 라이브러리. Elastic Deformation, Affine Transform 등을 통해 데이터 다양성 확보.

### 모델 아키텍처
- **Custom 3D ResNet**: Residual Block 기반의 3D CNN. `Conv3D`, `BatchNormalization`, `GlobalAveragePooling3D`로 구성.
- **TensorFlow/Keras**: 모델 구축 및 학습 프레임워크.
- **K-Fold Cross Validation**: 5-Fold 교차 검증을 통한 앙상블(Ensemble) 학습.

### 해석 및 시각화
- **Grad-CAM**: 모델이 주목한 영역을 히트맵으로 시각화하여 판단 근거 확인.
- **Feature Map Analysis**: Conv 레이어의 특징 맵을 추출하여 AD/CN 그룹 간 차이 분석.
- **Matplotlib/Seaborn**: ROC Curve, Prediction Histogram 등 성능 메트릭 시각화.

## 시리즈 구성

본 프로젝트의 전체 과정은 다음 세 개의 포스트로 나누어 상세히 다룬다:

1. **[데이터 전처리 및 증강 (Preprocessing & Augmentation)]({% post_url 2025-11-28-project-preprocessing %})**  
   HD-BET를 이용한 뇌 추출, ANTsPy 기반 정합 및 ROI 추출, TorchIO를 활용한 고정 증강 시스템 구축.

2. **[3D ResNet 모델 설계 및 학습 (Model Architecture)]({% post_url 2025-11-29-project-modeling %})**  
   3D ResNet 블록 구조, Custom Early Stopping 메커니즘, K-Fold 앙상블 전략.

3. **[결과 시각화 및 해석 (Visualization & XAI)]({% post_url 2025-11-30-project-visualization %})**  
   성능 메트릭(ROC, AUC), Grad-CAM을 통한 XAI, 특징 맵 분석.

---

의료 AI는 단순히 높은 정확도를 넘어, **왜 그렇게 판단했는가**를 설명할 수 있어야 한다. 본 프로젝트는 기술적 구현뿐만 아니라, 모델의 해석 가능성과 임상적 타당성을 검증하는 과정까지 포함한다.
