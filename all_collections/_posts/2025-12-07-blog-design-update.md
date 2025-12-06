---
layout: post
title: 블로그 UI/UX 디자인 개편 (Dark Mode & Category Interface)
date: 2025-12-07
categories: [design, css, jekyll]
---

이번 개발에서는 전반적인 블로그의 UI/UX를 개선하는 작업을 진행했다.
주요 변경 사항은 컬러 팔레트 재정의, 카테고리 인터페이스 개선, 그리고 스크롤 버그 수정이다.

### 1. Soft Modern Dark 컬러 팔레트 적용

기존의 단순한 다크 모드 색상을 **60:30:10 규칙**에 기반한 'Soft Modern Dark' 테마로 변경했다.
눈의 피로를 줄이면서도 정보의 계층이 명확히 드러나도록 조정했다.

**수정된 CSS 변수 (`assets/css/common.css`):**

{% highlight css %}
@media (prefers-color-scheme: dark) {
  :root {
    --gray-1: #3f3f3f; /* Text Secondary */
    --gray-2: #3a3a3c; /* Components (Cards, Buttons) */
    --gray-3: #2c2c2e; /* Card Background */
    --gray-4: #1c1c1e; /* Main Background */
    --gray-5: #1c1c1e; /* ... */
    --gray-6: #1c1c1e; /* ... */
    --white-1: #f2f2f7; /* Text Primary */
    --white-2: #aeaeb2; /* Borders / Accents */
  }
}
{% endhighlight %}

특히 `--gray-2`, `--gray-3` 등의 계조를 세분화하여 카드 UI의 깊이감을 더했다.

### 2. 카테고리 UI/UX 개선

기존에는 카테고리 이름과 게시글 개수(Count)가 서로 분리된 형태(`a` 태그와 `div` 태그)로 존재하여 시각적으로 이질감이 있었고, 클릭 시 정확한 필터링에 방해가 되는 요소가 있었다.

이를 하나의 `<a>` 태그 안으로 통합하고, `span`을 이용해 개수를 표시하도록 HTML 구조를 변경했다.

**변경 전:**
```html
<a href="#!" class="category">{{c}}</a>
<div id="{{c}}" class="category_count">()</div>
```

**변경 후:**
```html
<a href="#!" class="category" data-category="{{c}}">
  {{c}} <span id="count-{{c}}" class="category_count"></span>
</a>
```

또한 CSS에서 `.category_count`의 `display: block` 속성을 `inline`으로 변경하고 불필요한 배경색을 제거하여, 텍스트와 자연스럽게 어우러지도록 수정했다.

### 3. Back-to-Top 스크롤 버그 수정

우측 하단의 'Top' 버튼을 누를 때 발생하던 스크롤 잠김(locking) 현상을 수정했다.
기존의 재귀적인 `requestAnimationFrame` 방식은 스크롤 이벤트를 과도하게 점유하는 문제가 있어, 최신 브라우저 API인 `window.scrollTo`의 `behavior: 'smooth'` 옵션을 사용하는 방식으로 간소화했다.

**수정된 JS (`assets/js/ui.js`):**

{% highlight javascript %}
function backToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
{% endhighlight %}

이로써 훨씬 부드럽고 가벼운 스크롤 경험을 제공하게 되었다.
