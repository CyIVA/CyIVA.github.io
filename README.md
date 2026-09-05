# cyiva

원민철의 개발 과정과 프로젝트를 기록하는 Astro 기반 정적 블로그입니다.

## 로컬 실행

Node.js 버전은 `.nvmrc`를 기준으로 사용합니다.

```bash
npm ci
npm run dev
```

배포 전 전체 확인은 다음 명령으로 실행합니다.

```bash
npm run check
```

## 글 게시

새 글은 `all_collections/_posts/`에 Markdown 파일 하나를 추가하면 됩니다. `main` 브랜치에 반영되면 GitHub Actions가 콘텐츠를 검사하고 Astro 정적 사이트를 다시 만들어 GitHub Pages에 배포합니다.

작성 형식과 오류 확인 방법은 [글 작성 및 게시 안내](docs/POSTING_GUIDE.md)를 참고합니다.
