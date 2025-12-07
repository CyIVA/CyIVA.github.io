---
layout: post
title:  "[HeimerRuri] ADNI 데이터셋 접근 및 다운로드"
date:   2025-11-26
categories: [HeimerRuri, Data]
---

알츠하이머병 연구를 위한 대표적인 공개 데이터셋인 ADNI(Alzheimer's Disease Neuroimaging Initiative)에서 MRI 데이터를 받아 프로젝트에 활용했다. 본 포스트에서는 ADNI 데이터에 접근하고 다운로드하는 과정을 간략히 정리한다.

## ADNI란?

ADNI는 알츠하이머병의 조기 진단 및 추적을 위해 수집된 대규모 종단 연구 데이터셋이다. MRI, PET, 유전자 정보, 임상 평가 등 다양한 모달리티의 데이터를 제공한다.

- **공식 웹사이트**: [https://adni.loni.usc.edu/](https://adni.loni.usc.edu/)

## 데이터 접근 절차

### 1. 계정 신청
ADNI 데이터는 연구 목적으로만 제공되며, 사용을 위해서는 계정 승인이 필요하다.

1. ADNI 웹사이트에서 계정 생성
2. 연구 목적 및 소속 기관 정보 입력
3. Data Use Agreement(DUA) 동의
4. 승인 대기 (통상 수일 소요)

### 2. 데이터 검색 및 다운로드
승인 후 LONI IDA(Image & Data Archive) 시스템을 통해 데이터에 접근할 수 있다.

- **검색 조건 설정**: Modality(MRI), Visit Type, Diagnosis(AD/CN) 등
- **다운로드 방식**: 웹 인터페이스 또는 CLI 도구 활용

## 본 프로젝트에서 사용한 데이터

- **Modality**: T1-weighted MRI
- **대상**: AD(Alzheimer's Disease) 및 CN(Cognitively Normal) 그룹
- **전처리 상태**: Raw DICOM 파일

---

*상세한 다운로드 절차 및 데이터 구조는 추후 업데이트 예정*
