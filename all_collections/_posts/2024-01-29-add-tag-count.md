---
layout: post
title: add-tag-count
date: 2024-01-29
categories: [jekyll, html, javascript]
---

[![image.png](https://i.postimg.cc/wvRZSf65/image.png)](https://postimg.cc/k69TSyRD)

위와 같은 tag에 해당하는 포스트 수를 구현하고자 한다.

```javascript

var js_categories = {% raw %}{{CATEGORY | split: ',' | join: ','}}{% endraw %};
var js_category_list = {% raw %}{{CATEGORYS|split:','|join:','}}{%endraw%};

// console.log(js_categories);
// console.log(js_category_list);

let js_category = {};
for (var now in js_category_list) {
    js_category[js_category_list[now]] = 0;
}
for (var now in js_categories) {
    var text = js_categories[now];
    js_category[text] = js_category[text] + 1;
}
// console.log(js_category);
for (var now in js_category) {
    var text = "(" + js_category[now] + ")";
    // console.log(text);
    document.getElementById(now).innerText =text;
}
//



```

liquid와 javaScript를 동시에 사용하기에 구조적으로 난해하다.

```javascript
const categories = { {% raw %}
{% for category in site.categories %}
    {% capture category_name %}
    {{ category | first }}
    {% endcapture %}

    {{ category_name | replace: " ", "_" }}:

    [{% for post in site.categories[category_name] %}
            { url: `{{ site.baseurl }}{{ post.url }}`,
            date: `{{post.date | date_to_string}}`,
            title: `{{post.title}}`},
    {% endfor %}],
{% endfor %} }
{% endraw %}
```

사용중이던 프로그램에서 제시한 방식이지만 이것은 더 난해하고, html + jekyll 지식이 더 필요한것같아 나중에 익숙해지면 해석해보고자 한다.
