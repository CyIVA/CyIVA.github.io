# 파일 역할 지도

기준: 2026-09-05. 실제 존재하는 직접 관리 대상만 기록한다. 계획된 파일 구조는 DEVELOPMENT_PLAN.md를 참고한다.

| 경로 | 한 줄 역할 |
| --- | --- |
| `AGENTS.md` | 작업 시작·구현·검증·문서 갱신 시 따라야 할 개발 규칙. |
| `README.md` | 블로그 개요, 로컬 실행과 게시 안내 진입점을 제공한다. |
| `.nvmrc` | 로컬과 GitHub Actions가 사용할 Node.js 버전을 고정한다. |
| `.github/workflows/deploy.yml` | `main` 변경 시 검사·빌드 후 GitHub Pages에 배포한다. |
| `docs/` | 개발 계획, 파일 역할과 기능별 진행 현황을 관리하는 문서 디렉토리. |
| `docs/DEVELOPMENT_PLAN.md` | 확정 요구사항, 권장 기본값, 데이터·화면 설계와 단계별 개발 계획의 기준 원본. |
| `docs/FILE_MAP.md` | 현재 디렉토리와 파일의 기능을 한 줄씩 설명하는 작업 탐색 지도. |
| `docs/DEVELOPMENT_STATUS.md` | 기능별 구현·검증 상태, 미완료 작업과 주요 설계 결정을 기록하는 현황 문서. |
| `docs/POSTING_GUIDE.md` | Markdown 작성 양식, 게시 순서와 Actions 오류 확인법을 안내한다. |
| `all_collections/` | 포스트·연혁·프로젝트 Markdown의 유일한 콘텐츠 원본 디렉토리. |
| `all_collections/_posts/` | 포스트 메타데이터와 본문을 보관하는 디렉토리. |
| `all_collections/_posts/*.md` | 제목·날짜·카테고리와 일반 Markdown 본문을 담은 기존 포스트 16개. 실행용 Liquid는 일회성 변환 완료. |
| `all_collections/_history/` | 날짜 기반 연혁으로 전환할 기존 이력의 원본 디렉토리. |
| `all_collections/_history/*.md` | `title`, `date`, 선택 본문을 가진 날짜 기반 연혁 9개. |
| `all_collections/_projects/` | 프로젝트 소개 팝업에 사용할 콘텐츠 디렉토리. |
| `all_collections/_projects/*.md` | 기존 샘플 1개와 대표 프로젝트 2개의 소개·기술·사진·링크 메타데이터를 관리한다. |
| `package.json` | Astro 개발·빌드 명령과 고정한 프로젝트 의존성을 정의한다. |
| `package-lock.json` | 재현 가능한 npm 의존성 설치 상태를 고정한다. |
| `astro.config.mjs` | 정적 Astro 사이트, canonical 기준 주소와 개발 툴바 제외를 설정한다. |
| `tsconfig.json` | Astro TypeScript 검사 기준을 설정한다. |
| `src/content.config.ts` | 기존 세 컬렉션의 Markdown 로더와 메타데이터 스키마를 정의한다. |
| `src/lib/content.ts` | 게시 필터, 날짜·slug·카테고리 정규화와 정렬을 공통 처리한다. |
| `src/layouts/BaseLayout.astro` | 공통 메타데이터, 헤더·푸터와 저장되는 테마 전환을 제공한다. |
| `src/components/DotMatrix.astro` | 홈 배경의 포인터 반응형 Canvas 점 패턴을 그린다. |
| `src/components/CategoryButton.astro` | 목록과 상세 화면에서 공통 카테고리 팝업을 여는 버튼이다. |
| `src/components/CategoryDialogs.astro` | 모든 공개 글을 기준으로 카테고리별 글 목록 dialog와 공통 동작을 제공한다. |
| `src/styles/global.css` | 라이트·다크 토큰과 공통 반응형 화면 스타일을 관리한다. |
| `src/pages/index.astro` | 소개, dot matrix, 대표 프로젝트와 최근 글을 보여주는 홈이다. |
| `src/pages/posts/index.astro` | 전체 글, 카테고리 건수와 카테고리 팝업을 제공한다. |
| `src/pages/posts/[slug].astro` | Markdown 본문과 전체 시간순 이전·다음 링크를 만드는 공통 글 상세 경로다. |
| `src/pages/history/index.astro` | 기존 날짜 필드 호환을 포함한 최신순 단일 연혁 화면이다. |
| `src/pages/projects/index.astro` | 프로젝트 목록과 해시 주소 기반 소개 팝업을 제공한다. |
| `src/pages/404.astro` | 존재하지 않는 주소의 안내 화면이다. |
| `scripts/validate-content.mjs` | 필수 필드, 날짜, 중복 slug, 공개 링크, Liquid와 기존 콘텐츠 보존 기준을 검증한다. |
| `public/favicon.svg` | cyiva를 표현하는 브라우저 탭 아이콘이다. |

제외: `.git/`, 설치 의존성, 빌드 산출물, 자동 생성 캐시. 콘텐츠 수는 이관 기준이며 추가·삭제 시 갱신한다. 기능이 다른 콘텐츠 파일이 생기면 별도 행으로 기록한다.

저장소 외부의 설계 폴더에 있는 `개발자-블로그-요구사항-및-개발계획.md`는 이 저장소 문서로 연결하는 안내 파일이다.
