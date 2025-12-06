---
layout: post
title: 포스트 내비게이션 및 연관 게시글 기능 개발 (Jekyll Liquid & Flexbox)
date: 2025-12-07
categories: [dev, jekyll, css]
---

블로그 방문자가 현재 글을 다 읽은 후, 자연스럽게 이전/다음 글로 이동하거나 관련된 다른 글을 탐색할 수 있도록 내비게이션 기능을 구현했다.
`_includes/post-nav.html`이라는 별도 컴포넌트를 생성하여 모듈화하였으며, **Prev/Next 내비게이션**과 **Related Posts** 영역으로 구성된다.

### 1. Prev/Next Navigation

Jekyll의 `page.previous`와 `page.next` 변수를 활용하여 시계열 순서로 인접한 포스트를 링크했다.

**초기 디자인 (계단식):**
처음에는 `Prev`는 왼쪽, `Next`는 오른쪽에 배치하되 수직으로 쌓이는 '계단식' 레이아웃을 시도했다. `align-self`와 `margin: auto`를 적절히 활용하여 배치했으나, 최종적으로는 공간 효율성과 직관성을 고려하여 **수평(Row) 배치**로 변경하였다.

**최종 디자인 (Horizontal Flex Row):**

{% highlight css %}
.post-nav-links {
  display: flex !important;
  flex-direction: row !important; /* 가로 배치 */
  justify-content: space-between;
  gap: 1rem;
}

.post-nav-links a {
  flex: 1; /* 균등 분할 */
  /* ... */
}
{% endhighlight %}

또한 **Light Mode**에서 기본 회색 배경이 너무 어두워 글씨가 잘 안 보이는 문제를 해결하기 위해, 미디어 쿼리를 이용해 밝은 테마일 때만 배경색을 밝은 회색(`#d1d1d6`)으로 오버라이딩하는 처리를 추가했다.

### 2. Related Posts (연관 게시글)

현재 포스트의 카테고리(`page.categories`)와 일치하는 다른 포스트를 찾아 최대 3개까지 추천하는 로직을 구현했다. Liquid 문법의 한계로 인해 루프를 돌며 카운팅하는 방식을 사용했다.

**Liquid 구현 로직:**
1. 현재 글은 제외 (`if post.url != page.url`)
2. 공통 카테고리 개수 확인 (`commonCategories > 0`)
3. 최대 3개까지만 출력 (`maxRelatedCounter < 3`)

**UI 디자인:**
초기에는 카드 형태의 그리드 뷰였으나, 가독성을 높이기 위해 **수직 리스트 뷰**로 변경했다.
각 항목은 `[제목] / [날짜]` 형식으로 한 줄에 깔끔하게 표시되며, 항목 간 점선(Dashed Border)으로 은은하게 구분감을 주었다.

{% highlight html %}
<a href="{{ post.url | relative_url }}" class="related-post-card inline-date">
  <span class="related-post-title">
    {{ post.title }} / <span class="related-post-date">{{ post.date | date_to_string }}</span>
  </span>
</a>
{% endhighlight %}

### 3. CSS 파일 분리 이슈

작업 도중 스타일이 적용되지 않는 문제가 발생했는데, 원인은 `_layouts/post.html`에서는 `blog.css`가 아닌 `post.css`를 로드하고 있었으나, 정작 스타일 코드는 `blog.css`에 작성했기 때문이었다.
이를 확인하고 모든 내비게이션 관련 스타일을 `assets/css/post.css`로 이관하여 해결했다.
