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
공식 요청 절차 소개 : https://adni.loni.usc.edu/data-samples/adni-data/

1. ADNI 웹사이트에서 계정 생성
2. 연구 목적 및 소속 기관 정보 입력
3. Data Use Agreement(DUA) 동의
4. 승인 대기 (통상 7-8일 소요)

### 2. 데이터 검색 및 다운로드
승인 후 LONI IDA(Image & Data Archive) 시스템을 통해 데이터에 접근할 수 있다.

- **검색 조건 설정**: Modality(MRI), Visit Type, Diagnosis(AD/CN) 등
- **다운로드 방식**: 웹 인터페이스 또는 CLI 도구 활용

## 본 프로젝트에서 사용한 데이터
- **PROJECT/PHASE**: ADNI 2
- **Modality**: T1-weighted MRI
- **대상**: AD(Alzheimer's Disease) 및 CN(Cognitively Normal) 그룹
- **전처리 상태**: Raw DICOM 파일

### 3. 사용할 형태로 변환

ADNI에서 제공한 DICOM 파일은 MRI영상을 촬영한 3D 이미지를 하나의 축으로 슬라이싱을 진행해서 저장된 상태이다.

이를 모델이나 다른 전처리에 사용하기에는 데이터 관리에 많은 어려움이 발생하기에 이를 하나의 파일로 변환하는 작업으로 이를 개선하는것이 좋다.

이때 사용하는 확장자가 NII.GZ이다. 이를 변환하는 도구는 dcm2niix이다.

DCM2NIIX : https://github.com/rordenlab/dcm2niix

프로젝트에서 사용한 코드는 아래와 같다. 이를 참고하여 변환을 진행한다.

#### 1. 필요한 폴더 구조

예제 코드를 실행하기 위해서는 다음과 같은 폴더 구조가 필요하다:

```
프로젝트 루트/
├── TOOL/
│   └── dcm2niix.exe          # dcm2niix 실행 파일
├── INPUT_DATASET/            # ADNI에서 다운로드한 DICOM 파일
│   └── [Collection Name]/    # 다운로드 받은 콜렉션 이름
│       └── ADNI/
│           └── [Subject ID]/  # 환자 식별 번호 (예: 002_S_0295)
│               └── MPRAGE/    # 촬영 방식
│                   └── [Acquisition Date]/  # 촬영 날짜 (예: 2012-05-10_15_44_50.0)
│                       └── [Image Data ID]/  # 촬영 식별번호 (예: I303066)
│                           └── *.dcm  # DICOM 파일들
└── your_script.py            # 변환 코드를 실행하는 파이썬 스크립트
```

**주요 구성 요소:**
- `TOOL/dcm2niix.exe`: [dcm2niix](https://github.com/rordenlab/dcm2niix)에서 다운로드한 실행 파일
- `INPUT_DATASET/`: ADNI에서 다운로드한 원본 DICOM 파일들이 위치하는 디렉토리
- `your_script.py`: 아래 변환 함수들을 포함하는 스크립트 (스크립트와 같은 레벨에 TOOL 폴더가 있어야 함)

#### 2. dcm → nii 변환
```python
def convert_dcm_to_nii(dicom_dir:Path, output_dir:Path):

    output_dir.mkdir(parents=True, exist_ok=True)
    LOADER_DIR = Path(__file__).resolve().parent
    dcm2niixLink = LOADER_DIR/"TOOL"/"dcm2niix.exe"

    command = [
        str(dcm2niixLink),
        "-z", "y",
        "-o", str(output_dir),
        str(dicom_dir)
    ]
    result = subprocess.run(command,capture_output=True, text=True)

    if result.returncode == 0:
        
        # print("변환 성공 :\n",result.stdout)
        pass
    else:
        print("변환 실패 :\n",result.stderr)

```

#### 3. 여러 데이터 일괄처리 (참고)
```python
def load_dcm_to_nii(input_dataset_path):
    _path = input_dataset_path

    collections = [f.name for f in input_dataset_path.iterdir() if f.is_dir()]
    
    mri_count = 0

    convert_targets = []

    for collection in collections:
        _collectionPath = _path
        _path = _path / collection / 'ADNI'
        subjects = [f.name for f in _path.iterdir() if f.is_dir()]
        
        for subject in subjects:
            _subjectPath = _path
            _path = _path / subject / 'MPRAGE'
            acqDates = [f.name for f in _path.iterdir() if f.is_dir()]
            
            for acqDate in acqDates:
                _acqDatePath = _path
                _path = _path / acqDate
                imageDataIDs = [f.name for f in _path.iterdir() if f.is_dir()]
                
                for imageDataID in imageDataIDs:
                    _imageDataIDPath = _path
                    dcm_path = _path / imageDataID
                    convert_targets.append(dcm_path)
                    _path = _imageDataIDPath

                _path = _acqDatePath
            _path = _subjectPath
        _path = _collectionPath

    for idx, dcm_path in enumerate(tqdm(convert_targets, desc="dcm → nii 변환")):
        convert_dcm_to_nii(dcm_path, input_dataset_path)

 
    
    print(f"확인된 mri 개수 : {mri_count}")
```


