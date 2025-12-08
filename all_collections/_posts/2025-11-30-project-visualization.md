---
layout: post
title:  "[HeimerRuri] 3. 결과 시각화 및 해석 (Visualization & XAI)"
date:   2025-11-30
categories: [HeimerRuri, Project]
---

의료 인공지능 모델에서 높은 정확도만큼 중요한 것은 "모델이 왜 그렇게 판단했는가?"를 이해하는 것이다. 특히 알츠하이머 진단과 같은 과제에서는 모델의 신뢰성을 확보하기 위해 설명 가능한 인공지능(XAI, Explainable AI) 기법이 필수적이다. 본 포스트에서는 모델의 성능 지표 시각화부터 Grad-CAM, 특징 맵(Feature Map) 분석을 통해 모델의 동작을 해석한 방법을 공유한다.

## 1. 성능 메트릭 시각화 (Performance Metrics)

학습된 모델의 객관적인 성능을 평가하기 위해 다양한 지표를 시각화했다. `plot_all_metrics` 함수를 통해 구현된 시각화는 다음 네 가지 요소를 포함한다.

1.  **Accuracy & Loss Curve**: 학습이 진행됨에 따라 Train/Validation 셋의 정확도와 손실 값이 정상적으로 수렴하는지를 확인한다. 과적합이나 학습 부진 여부를 판단하는 가장 기초적인 자료다.
2.  **ROC Curve & AUC**: 이진 분류 모델의 성능을 나타내는 결정적인 척도다. False Positive Rate(FPR) 대비 True Positive Rate(TPR)의 비율을 곡선으로 그리며, 곡선 아래 면적(AUC)이 1에 가까울수록 우수한 모델임을 의미한다.
3.  **Prediction Score Histogram**: 모델이 예측한 확률값(0~1)의 분포를 히스토그램으로 표현했다. AD(빨강)와 CN(파랑) 클래스가 명확하게 분리(Separation)될수록 모델이 확신을 가지고 분류하고 있음을 보여준다.

최종적으로 프로젝트에서 얻은 그래프는 아래와 같다. 여러 문제가 해결되지 못한채 프로젝트가 마무리되어서 신뢰할 수 없지만, 유효한 시각화 방법을 찾는 과정이었다.

![image.png](https://i.postimg.cc/WzcKhrLQ/image.png)


## 2. Grad-CAM: 모델의 시선 추적

Grad-CAM(Gradient-weighted Class Activation Mapping)은 모델이 특정 클래스(예: 알츠하이머)로 판단할 때 이미지의 어느 영역을 중요하게 보았는지를 히트맵(Heatmap)으로 시각화하는 기술이다.

`compute_gradcam_volume` 함수를 통해 3D Grad-CAM을 계산하고, 이를 원본 3D MRI (`plot_gradcam_overlay`) 위에 오버레이했다.
*   **분석 포인트**: 모델이 알츠하이머를 진단할 때, 실제로 임상에서 중요하게 보는 **해마(Hippocampus)와 측뇌실(Lateral Ventricle)** 주변 영역을 활성화(Activation)하고 있는지 확인했다.
*   만약 모델이 두개골이나 배경 노이즈를 보고 판단했다면 이는 잘못 학습된 것이며, Grad-CAM은 이러한 오류를 잡아내는 디버깅 도구로 활용되었다.

## 3. 특징 맵 분석 (Feature Map Analysis)

모델 내부의 Conv 레이어가 실제로 어떤 특징(Feature)을 추출하고 있는지 알아보기 위해 특징 맵을 분석했다.

### 평균 특징 맵 (Average Feature Maps)
AD 환자 그룹과 CN 환자 그룹의 특징 맵을 각각 평균 내어 비교했다(`plot_average_feature_maps_fast`).
*   단순히 하나의 이미지로는 개인차가 크기 때문에, 그룹별 평균을 통해 각 클래스의 일반적인 활성화 패턴 차이를 관찰했다.
*   특정 필터에서는 뇌척수액(CSF) 영역이 도드라지거나, 회백질(Gray Matter)의 경계를 강조하는 등 모델이 스스로 해부학적 구조를 인지하고 있음을 확인할 수 있었다.

### 차분 맵 (Difference Maps)
AD와 CN의 특징 맵 간의 차이(`AD - CN`)를 계산하여 `plot_single_diff_maps` 등으로 시각화했다.
*   양의 값(Red)이나 음의 값(Blue)이 강하게 나타나는 영역은 두 그룹 간의 차이가 가장 극명한 부위를 의미한다.
*   이는 모델이 알츠하이머 병변을 감지하기 위해 뇌의 어느 부분이 '달라졌는지'를 포착하는 과정을 시각적으로 보여준다.

### Raw Data Difference
모델을 통하지 않고, 전처리된 원본 MRI 데이터 자체의 평균 차이(`Raw mean(AD - CN)`)도 함께 시각화했다. 이는 딥러닝 모델이 학습한 차이가 실제 데이터의 물리적 차이와 일치하는지 검증하는 기준점(Baseline)이 된다.

---

이러한 다각도의 시각화 과정은 단순히 높은 정확도를 얻는 것을 넘어, 모델이 의학적으로 타당한 근거를 바탕으로 판단을 내리고 있는지 검증하고 이를 시각화 하였다.
