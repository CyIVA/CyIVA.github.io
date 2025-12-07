---
layout: post
title:  "[HeimerRuri] 2. 3D ResNet 모델 설계 및 학습 (Model Architecture)"
date:   2025-11-29
categories: [HeimerRuri, Project]
---

전처리가 완료된 3D MRI 데이터를 분석하기 위해 본 프로젝트에서는 3차원 합성곱 신경망(3D CNN)을 설계했다. 특히 의료 영상 분야에서 성능이 입증된 ResNet(Residual Network) 구조를 3D로 확장하여 적용했으며, 학습 안정성을 위한 커스텀 콜백(Callback)과 앙상블(Ensemble) 전략을 도입했다. 본 포스트에서는 모델의 구체적인 아키텍처와 학습 전략에 대해 서술한다.

## 1. 3D ResNet 아키텍처

MRI는 2D 슬라이스의 연속이 아닌, 깊이(Depth) 정보를 가진 3차원 볼륨 데이터다. 따라서 일반적인 2D Conv 레이어 대신 `Conv3D` 레이어를 사용하여 가로, 세로, 깊이의 공간적 특징을 동시에 추출하도록 설계했다.

### 전체 구조 (Structure)
모델의 기본 골격은 ResNet을 따르며, 구체적인 레이어 구성은 다음과 같다.

1.  **입력층 (Input)**: `(128, 128, 128, 1)` 크기의 단일 채널 3D 텐서를 입력받는다.
2.  **초기 특징 추출 (Initial Conv)**: 
    *   `Conv3D(16 filters, 7x7x7, stride=2)`: 큰 커널(Kernel)을 사용하여 초기에 전반적인 특징을 빠르게 압축한다.
    *   `BatchNormalization` -> `ReLU` -> `MaxPool3D`: 정규화 및 다운샘플링을 거친다.
3.  **ResNet 블록 (Residual Blocks)**:
    *   기울기 소실(Vanishing Gradient) 문제를 방지하기 위해 스킵 연결(Skip Connection)이 포함된 ResNet 블록을 쌓았다.
    *   필터 수는 `16 -> 32 -> 64 -> 128`로 깊어질수록 2배씩 증가하며, 특징 맵의 크기는 절반으로 줄어든다.
    *   각 단계마다 2개의 ResNet 블록을 배치하여 충분한 깊이를 확보했다.
4.  **분류층 (Classification Head)**:
    *   `GlobalAveragePooling3D (GAP)`: 3D 특징 맵을 1차원 벡터로 변환한다. 파라미터 수를 줄이고 과적합을 방지하는 효과가 있다.
    *   `Dense(128)` -> `Dropout(0.5)` -> `Dense(1)`: 특징을 조합하여 최종적으로 AD(알츠하이머)와 CN(정상)을 구분하는 확률값(Sigmoid)을 출력한다.

```python
# HeimerRuri.ipynb (Concept)
def build_model(size):
    inputs = Input(shape=(size, size, size, 1))
    x = Conv3D(16, 7, strides=2, ...)(inputs)
    # ... ResNet Blocks ...
    x = GlobalAveragePooling3D()(x)
    output = Dense(1, activation='sigmoid')(x)
    return Model(inputs, output)
```

## 2. 학습 전략: Custom Early Stopping

딥러닝 학습 시 과적합을 막기 위해 조기 종료(Early Stopping)를 사용하는 것은 일반적이다. 그러나 기본 `EarlyStopping` 콜백은 학습 초기의 불안정한 Loss 변동(Fluctuation) 때문에 모델이 충분히 수렴하기도 전에 학습을 멈춰버리는 경우가 잦았다.

이를 해결하기 위해 **`MinEpochEarlyStopping`** 클래스를 직접 정의하여 적용했다.
*   **기능**: 지정된 최소 에폭(`min_epoch=30`)까지는 조기 종료를 수행하지 않고 학습을 강제로 진행한다.
*   **목적**: 초기의 불안정성을 견디고 모델이 충분한 패턴을 학습할 시간을 보장한 뒤, 그 이후부터 Validation Loss가 개선되지 않을 때 멈추게 한다.

## 3. 앙상블 (Ensemble Strategy)

단일 모델의 예측은 데이터의 노이즈나 초기 가중치 설정에 따라 편향(Bias)될 위험이 있다. 모델의 일반화 성능을 극대화하기 위해 **5-Fold 교차 검증(Cross Validation) 기반의 앙상블**을 수행했다.

*   전체 데이터를 5개의 폴드(Fold)로 나누고, 각 폴드마다 별도의 모델을 학습시켰다.
*   최종 추론(Inference) 단계에서는 5개 모델이 예측한 확률값을 평균 내는 **Soft Voting** 방식을 사용했다.
*   `main` 함수의 흐름을 보면, `ensemble_process` 플래그가 켜져 있을 경우 `model_list`에 저장된 모든 모델의 예측값(`predictions`)을 `np.mean`으로 평균하여 최종 결과를 도출함을 확인할 수 있다.

이러한 앙상블 접근법은 개별 모델의 오류를 상호 보완하여 단일 모델 대비 더 안정적이고 신뢰할 수 있는 진단 결과를 제공한다.
