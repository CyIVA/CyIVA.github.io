---
layout: post
title: "자동 카테고리 색상 부여 기능 개발 (Auto Category Coloring)"
date: 2025-12-07
categories: [Jekyll, JavaScript, CSS]
---

## 배경 (Background)

블로그를 운영하다 보면 태그나 카테고리가 늘어날 때마다 매번 CSS 색상을 지정해주는 것이 번거로울 때가 있습니다. 
다른 웹사이트들을 탐방하다가, 각 카테고리마다 고유한 색상을 가지면서도 자동으로 배색이 되는 기능을 발견했고, 이를 제 블로그에도 적용해보고 싶었습니다.

### 목표 (Goal)
1.  **자동화**: 새로운 태그가 추가되어도 CSS 수정 없이 자동으로 색상이 부여되어야 함.
2.  **가독성**: 배경색에 따라 텍스트 색상(검정/흰색)이 자동으로 조절되어야 함.
3.  **확장성**: GitHub Pages 환경(정적 사이트)에서도 잘 동작해야 함.

---

## 해결 방법 (Solution)

Jekyll은 정적 사이트 생성기이므로, 빌드 타임에 랜덤 색상을 부여하면 사이트를 다시 빌드할 때마다 색이 바뀔 수 있습니다. 
따라서 **클라이언트 사이드 JavaScript**를 사용하여, **카테고리 이름을 해시(Hash)화하고 이를 고유한 색상으로 변환**하는 방식을 채택했습니다.

### 1. 문자열을 색상으로 변환하기 (String to Color)

문자열의 각 문자의 아스키 코드를 이용해 고유한 숫자(Hash)를 만들고, 이를 `HSL` 색상 공간으로 변환합니다.

```javascript
// assets/js/color_tags.js

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Hue: 0-360 전체 범위 사용
  const h = Math.abs(hash % 360);
  // Saturation: 60-89% (채도를 높게 유지하여 선명하게)
  const s = 60 + (Math.abs(hash) % 30); 
  // Lightness: 30-79% (너무 어둡거나 너무 밝지 않게)
  const l = 30 + (Math.abs(hash) % 50); 
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}
```

HSL을 사용한 이유는 RGB보다 색상의 밝기(Lightness)와 채도(Saturation)를 제어하기 쉽기 때문입니다. 
채도를 높게 고정하여 "파스텔 톤"이나 "비비드 톤"으로 통일감을 줄 수 있습니다.

### 2. 가독성을 위한 텍스트 색상 자동 조정

배경색이 어두우면 흰색 글씨, 밝으면 검은색 글씨를 써야 합니다.
Lightness(L) 값을 기준으로 간단하게 분기 처리했습니다.

```javascript
function getContrastColor(h, s, l) {
  // Lightness가 60% 이상이면 배경이 밝으므로 검은색 글씨
  return l > 60 ? '#000000' : '#ffffff';
}
```

### 3. 적용 (Implementation)

페이지가 로드되면 `.category` 클래스를 가진 모든 요소를 찾아 색상을 입혀줍니다.
이때 `innerText`보다 `data-category` 속성을 우선하여, 화면에 표시되는 텍스트가 달라도(예: "Python (3)") 정확한 카테고리 키("Python")로 색상을 생성하도록 했습니다.

```javascript
function applyCategoryColors() {
  const categories = document.querySelectorAll('.category');
  categories.forEach(cat => {
    // data-category 속성을 우선 사용
    const text = cat.dataset.category ? cat.dataset.category.trim() : cat.innerText.trim();
    
    // ... 색상 생성 로직 ...
    
    cat.style.backgroundColor = bgColor;
    cat.style.color = textColor;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyCategoryColors();
});
```

---

## 결과 (Result)

이제 새로운 카테고리를 포스트에 추가하기만 하면, 별도의 설정 없이도 자신만의 고유한 색상을 가진 "뱃지"가 생성됩니다.
블로그의 전체적인 디자인이 알록달록하면서도 통일감 있게 변경되었습니다!

> **참고**: 이 기능은 `assets/js/color_tags.js`에 구현되어 있으며, `ui.html`을 통해 모든 페이지에 로드됩니다.
