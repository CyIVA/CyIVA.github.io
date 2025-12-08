---
layout: post
title:  "[HeimerRuri] 1. 데이터 전처리 및 증강 (Preprocessing & Augmentation)"
date:   2025-11-28
categories: [HeimerRuri, Project]
---

의료 영상 분석, 특히 3D MRI를 이용한 알츠하이머 진단 모델에서 데이터 전처리는 모델의 성능을 결정짓는 가장 중요한 요소 중 하나다. 원본 MRI 데이터는 촬영 장비, 프로토콜, 환자의 위치 등에 따라 서로 상이하기 때문에, 이를 표준화하고 모델이 학습하기 용이한 형태로 가공하는 과정이 필수적이다. 본 포스트에서는 **HD-BET**를 이용한 뇌 추출(Skull Stripping)부터 **ANTsPy**를 활용한 정합(Registration) 및 ROI 추출, 그리고 **TorchIO** 기반의 증강(Augmentation) 파이프라인까지의 과정을 다룬다.

## 1. 뇌 추출 (Brain Extraction: HD-BET)

ADNI에서 제공받은 T1-weighted MRI 영상에는 뇌 조직뿐만 아니라 두개골, 두피, 목 등 분석에 불필요한 영역이 포함되어 있다. 이러한 비뇌(Non-brain) 조직은 모델 학습에 노이즈로 작용할 수 있으므로 제거해야 한다. 이를 위해 **HD-BET(High-Definition Brain Extraction Tool)**를 사용했다.

HD-BET는 딥러닝 기반의 뇌 추출 도구로, 기존의 FSL BET 등 전통적인 알고리즘보다 정교한 마스킹 성능을 보여준다. 스크립트에서는 `HD-BET` 라이브러리를 통해 입력된 NIfTI 파일에서 뇌 영역 마스크를 생성하고, 이를 원본 영상에 적용하여 두개골이 제거된 순수 뇌 영상만을 추출하도록 구성했다.

## 2. 영상 정합 (Registration: ANTsPy)

모든 환자의 뇌는 크기와 모양, 촬영된 각도가 다르다. 3D CNN 모델이 해부학적 위치를 일관되게 학습하기 위해서는 모든 영상을 표준 뇌 공간(Template Space)에 맞추는 정합(Registration) 과정이 필요하다.

본 프로젝트에서는 **ANTsPy (Advanced Normalization Tools in Python)** 라이브러리를 사용했으며, 표준 템플릿으로는 `MNI152_T1_1mm_brain`을 채택했다.

### SyN (Symmetric Normalization)
단순한 선형 변환(Affine Transform)만으로는 뇌의 미세한 굴곡과 변형을 완벽하게 보정하기 어렵다. 따라서 비선형 변환인 **SyN(Symmetric Normalization)** 알고리즘을 적용했다. `registration.ipynb`의 `_register_fast` 함수를 살펴보면, 속도와 정확도의 균형을 맞추기 위해 영상을 2mm 해상도로 다운샘플링한 후 SyN 등록을 수행하는 `down2mm_syn` 모드를 기본으로 사용하고 있음을 확인할 수 있다.

```python
# registration.ipynb (Concept)
tpl_ds = ants.resample_image(tpl_img, (2.0, 2.0, 2.0), ...)  # 템플릿 다운샘플링
sub_ds = ants.resample_image(sub_img, (2.0, 2.0, 2.0), ...)  # 대상 영상 다운샘플링
reg = ants.registration(fixed=tpl_ds, moving=sub_ds, type_of_transform="SyN", ...)
```

이 과정을 통해 공간적 정합성을 확보함과 동시에 대량의 데이터 처리 시간을 단축시키는 최적화를 수행했다.
~~처리 리소스가 말도안되게 많이 요구되어 현실적인 타협~~

## 3. 해마 ROI 추출 (ROI Extraction)(옵션)

알츠하이머 병변의 가장 큰 특징 중 하나는 해마(Hippocampus)의 위축이다. 전뇌(Whole Brain)를 모두 사용하는 것도 방법이지만, 해마 영역(ROI)을 집중적으로 분석하면 불필요한 배경 정보를 줄이고 학습 효율을 높일 수 있다.

전문가 멘토링에서 치매는 해마에 국한된것이 아닌 뇌 전반적인 모든 부분이 중요하다고 판단하여 최종적으로는 전체 뇌를 사용하였다.

ROI 추출은 역변환(Inverse Transform)을 활용했다.
1. 표준 MNI 공간에 정의된 해마 마스크(`MNI152_T1_1mm_Hipp_mask`)를 준비한다.
2. 앞서 계산한 정합 정보의 역변환 행렬(`invtransforms`)을 사용하여, 이 마스크를 개별 환자의 원본 공간(Subject Space)으로 변환시킨다.
3. 환자 공간으로 변환된 마스크를 기준으로, 주변 여유 공간(`MARGIN_VOX=10`)을 두고 Bounding Box를 설정하여 영상을 잘라낸다(Crop).

이렇게 추출된 ROI 영상은 `128x128x128` (또는 `64x64x64`) 크기로 리사이즈(Resize)되어 모델의 입력으로 사용된다.

## 4. 고정 증강 시스템 (Fixed Augmentation with Caching)

3D MRI 데이터는 2D 이미지에 비해 데이터 수가 적고 과적합(Overfitting) 위험이 크다. 이를 해결하기 위해 **TorchIO** 라이브러리를 이용한 데이터 증강(Augmentation)을 적용했다.

그러나 3D 영상의 증강 연산(Elastic Deformation, Affine 등)은 CPU 부하가 크고 시간이 오래 걸린다. 학습 루프 내에서 실시간으로 증강을 수행할 경우 병목이 발생하여 학습 속도가 현저히 저하되는 문제가 있었다.

### 해결책: 캐싱 및 시드 고정 (Fixed Processing)
이를 해결하기 위해 **'캐싱을 동반한 고정 증강'** 방식을 도입하였다.
1. `_process_one_nii` 함수에서 원본 영상 1개당 N개의 증강 영상을 미리 생성한다.
2. 각 증강 영상은 `make_seed` 함수를 통해 고유한 난수 시드(Seed)를 부여받아 생성되므로, 언제 실행하더라도 동일한 변형 결과를 보장한다(Reproducibility).
3. 생성된 3D 배열(.npy)을 디스크에 캐싱(Caching)해두고, 학습 시에는 연산 없이 로드(Load)만 수행한다.

사실 해당 과정은 colab이라는 환경을 사용해서 불가피하게 사용된 방법이었다.
구글 드라이브에 증강된 데이터까지 업로드 할경우 용량 문제가 발생하였기 때문이다.

로컬 환경에서 작업을 진행한다면 캐싱 작업을 할 필요 없이 필요한 데이터만큼 증강을 한후 로컬 스토리지에 저장하여 사용하면 된다.




사용가능한 주요 증강 기법은 다음과 같다:
*   **RandomAffine**: 약간의 회전, 이동, 크기 조절.
*   **RandomElasticDeformation**: 뇌 조직의 비선형적인 변형 모사.(프로젝트에서 사용)
*   **RandomNoise & RandomBiasField**: 촬영 잡음 및 자기장 불균일성 시뮬레이션.

## 5. 정규화 (Normalization)

마지막으로 각 복셀(Voxel)의 강도(Intensity) 분포를 맞추기 위해 정규화를 수행했다. MRI는 절대적인 픽셀 값이 없기 때문에 환자 간, 장비 간 편차가 크다.
코드에서는 `normalization` 함수를 통해 하위 20%(`clip_percentile`) 이하의 값을 제거하여 배경 노이즈를 날리고, 평균을 0, 표준편차를 1로 만드는 **Z-Score Normalization**을 적용했다. 이를 통해 모델이 명암 차이가 아닌 구조적 차이에 집중하도록 유도했다.
