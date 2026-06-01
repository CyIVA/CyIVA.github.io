---
description: A description of your rule
---

# 프로젝트 규칙 및 지침

이 프로젝트는 **Jekyll**을 기반으로 하며, 템플릿 엔진으로 **Liquid**를 사용합니다. 최종 결과물은 **GitHub Pages**를 통해 호스팅됩니다. 모든 코드는 아래 규칙을 준수해야 합니다.

## 1. 기술 스택 및 환경

- **Framework:** Jekyll (Ruby 기반 정적 사이트 생성기)
- **Template Engine:** Liquid (변수 처리, 필터, 태그 사용)
- **Hosting:** GitHub Pages
- **Markdown:** 표준 Markdown 문법을 기반으로 하되, Jekyll의 Front Matter(YAML)를 필수 포함.

## 2. 코드 스타일 및 작성 규칙

- **Front Matter:** 모든 마크다운 파일 상단에는 반드시 적절한 `layout`, `title`, `date`, `categories` 등이 포함된 YAML Front Matter를 유지하십시오.
- **Liquid 태그 사용:**
  - 사이트 변수는 `{{ site.variable }}` 형식을 사용합니다.
  - 로직 태그는 `{% if ... %}` 또는 `{% for ... %}`와 같이 명확하게 들여쓰기합니다.
- **경로 관리:** Jekyll의 `{{ site.baseurl }}`과 `{{ "/path/to/file" | relative_url }}` 필터를 사용하여 링크를 생성하세요. 절대 경로(`http://...`) 사용을 지양합니다.
- **이미지 및 애셋:** `/assets/` 디렉토리 아래의 경로를 참조하세요.

## 3. GitHub Pages 최적화

- **성능:** 빌드 시간을 고려하여 과도하게 복잡한 Liquid 로직은 피하고, 가능하면 정적 HTML로 작성하십시오.
- **보안:** 외부 API 호출은 지양하며, 데이터가 필요한 경우 `_data/` 폴더 내의 YAML/JSON 파일을 활용하세요.

## 4. 커뮤니케이션 스타일

- 질문이나 제안 시 Jekyll과 Liquid의 모범 사례(Best Practice)에 기반하여 답변하십시오.
- 코드를 수정할 때 기존 프로젝트의 디렉토리 구조를 변경하지 마십시오.
