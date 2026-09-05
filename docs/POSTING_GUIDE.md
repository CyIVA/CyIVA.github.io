# 글 작성 및 게시 안내

## 새 글 작성

`all_collections/_posts/`에 `YYYY-MM-DD-영문-slug.md` 형식으로 파일을 추가한다. 파일명에서 날짜를 제외한 부분이 글 주소가 된다.

```markdown
---
title: 새 개발 기록
date: 2026-09-05
categories: [JavaScript, Blog]
---

## 오늘 구현한 내용

여기에 일반 Markdown으로 본문을 작성합니다.
```

- `title`과 `date`는 필수다.
- `date`는 `YYYY-MM-DD` 형식으로 작성한다.
- `categories`의 새 이름은 별도 설정 없이 자동으로 등록된다.
- 같은 카테고리는 대소문자를 구분하지 않고 함께 집계한다.
- 게시하지 않을 콘텐츠에는 `published: false`를 추가한다. 이 항목은 상세 페이지, 목록, 카테고리 수와 이전·다음 글에서 모두 제외된다.
- Jekyll/Liquid 문법은 사용하지 않는다.

## 이미지와 글 링크

외부 이미지는 일반 Markdown 이미지 문법을 사용한다.

```markdown
![이미지 설명](https://example.com/image.png)
```

로컬 이미지는 `public/images/` 아래에 저장한 뒤 `/images/파일명.png`로 연결한다. 다른 글은 생성되는 주소를 직접 사용한다.

```markdown
[관련 글 보기](/posts/related-post/)
```

## GitHub에서 게시

1. 새 Markdown 파일을 추가하고 `main` 브랜치에 커밋한다.
2. 저장소의 **Actions** 탭에서 `Build and deploy GitHub Pages` 실행을 확인한다.
3. 검증과 빌드, 배포가 모두 성공하면 사이트에 자동 반영된다.

GitHub 웹 화면에서 파일을 올려도 과정은 같다. 여러 파일을 한 번에 올린 경우에도 한 번의 빌드에서 전체 글 수, 카테고리 수, 카테고리 팝업, 이전·다음 글이 다시 계산된다.

## 오류 확인

배포가 실패하면 기존에 공개된 사이트는 그대로 유지된다. Actions의 실패한 실행을 열고 다음 단계를 확인한다.

- **Validate content**: 필수 제목·날짜, 날짜 형식, 중복 주소, 비공개 글 링크 또는 실행 가능한 Liquid 문법 문제
- **Build site**: Markdown이나 메타데이터가 Astro 스키마와 맞지 않는 문제
- **Deploy to GitHub Pages**: 저장소의 Pages 게시 원본이 GitHub Actions로 설정되지 않았거나 배포 권한이 부족한 문제

로컬에서는 `npm run check`로 같은 콘텐츠 검사와 정적 빌드를 실행할 수 있다.

## 최초 한 번 필요한 GitHub 설정

저장소의 **Settings → Pages → Build and deployment → Source**에서 **GitHub Actions**를 선택한다. 이후에는 `main` 브랜치에 Markdown을 반영하는 것만으로 게시된다.
