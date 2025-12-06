---
layout: post
title: "자동 카테고리 색상 부여 기능 개발 (Auto Category Coloring)"
date: 2025-12-07
categories: [Jekyll, JavaScript, CSS]
---

블로그를 장기적으로 운영할 때, 가장 경계해야 할 것은 '반복적인 관리 비용'이다. 태그나 카테고리가 늘어날 때마다 매번 CSS 색상을 지정하는 것은 비효율적이다. 이를 해결하기 위해 **"문자열 해싱을 통한 동적 색상 부여"** 기능을 구현했다.

### 1. 정적 사이트(SSG)와 동적 스타일링의 딜레마
Jekyll은 빌드 타임에 HTML을 생성한다. 만약 Ruby(Liquid) 레벨에서 랜덤 색상을 부여한다면, 사이트를 재배포할 때마다 모든 카테고리 색상이 바뀌어 사용자 경험 일관성을 해칠 것이다. 

따라서 **'결정론적(Deterministic)'**인 방법이 필요했다. 입력값(카테고리명)이 같으면 언제나 출력값(색상)도 같아야 한다. 이를 위해 클라이언트 사이드 JavaScript에서 해시 함수를 구현하기로 결정했다.

### 2. RGB 대신 HSL을 선택한 이유
임의의 문자열을 색상으로 변환할 때, 단순히 RGB 값을 랜덤하게 뽑으면 시각적 통일성을 해칠 위험이 크다. 어떤 색은 너무 어둡고, 어떤 색은 너무 형광색일 수 있다.

나는 **HSL(Hue, Saturation, Lightness)** 색상 공간을 사용하여 이 문제를 해결했다.
- **Hue (색상)**: 해시값 전체(`0~360`)를 사용하여 다양성을 확보했다.
- **Saturation (채도)**: `60~89%`로 제한하여, 어떤 색이 나오든 선명하고 생동감 있게 만들었다.
- **Lightness (명도)**: `30~79%`로 제한하여, 지나치게 어둡거나 눈이 부신 흰색에 가까운 색이 나오지 않도록 방어했다.

```javascript
function stringToColor(str) {
  // ... hash calculation ...
  const h = Math.abs(hash % 360);
  const s = 60 + (Math.abs(hash) % 30); 
  const l = 30 + (Math.abs(hash) % 50); 
  return `hsl(${h}, ${s}%, ${l}%)`;
}
```

### 3. DOM 데이터 접근의 견고함 (Dataset vs InnerText)
초기 구현에서는 `innerText`를 키값으로 사용했으나, 이는 취약했다. 예를 들어 "Python (3)"처럼 게시글 수가 포함된 텍스트가 렌더링될 경우, "Python"과 다른 색상으로 인식되는 문제가 발생했다.

이를 해결하기 위해 HTML5 `data-*` 속성을 활용했다.
```html
<a class="category" data-category="Python">Python (3)</a>
```
UI에 표시되는 텍스트(`innerText`)가 변경되더라도, 본질적인 데이터(`dataset.category`)는 변하지 않으므로 일관된 색상을 유지할 수 있게 되었다.
