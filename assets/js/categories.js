---
---

const rawLiquidCategories = { {% for category in site.categories %}{% capture category_name %}{{ category | first }}{% endcapture %}{{ category_name | replace: " ", "_" }}: [{% for post in site.categories[category_name] %}{ url: `{{ site.baseurl }}{{ post.url }}`, date: `{{post.date | date_to_string}}`, title: `{{post.title}}`},{% endfor %}],{% endfor %} };

// Merge categories case-insensitively
const categories = {};
Object.keys(rawLiquidCategories).forEach(key => {
    const unifiedKey = key.toUpperCase();
    if (!categories[unifiedKey]) {
        categories[unifiedKey] = [];
    }
    // Concat and sort checks could be added here if needed, but for now just merging arrays
    categories[unifiedKey] = categories[unifiedKey].concat(rawLiquidCategories[key]);
});

// duplicate checks or sorting by date could be done here if 'Dev' and 'DEV' have different post lists (likely overlapping or distinct sets)

// console.log(categories)

window.onload = function () {
  document.querySelectorAll(".category").forEach((category) => {
    category.addEventListener("click", function (e) {
      const originalName = e.currentTarget.dataset.category;
      const categoryName = originalName.replace(" ", "_").toUpperCase(); // Use unified key
      const posts = categories[categoryName];
      
      if (!posts) {
          console.error("No posts found for category:", categoryName);
          return;
      }

      let html = ``
      // Sort posts by date desc just in case merge messed up order
      // (Optional, assuming Liquid already sorted them effectively per key)
      
      posts.forEach(post=>{
        html += `
        <a class="modal-article" href="${post.url}">
          <h4>${post.title}</h4>
          <small class="modal-article-date">${post.date}</small>
        </a>
        `
      })
      document.querySelector("#category-modal-title").innerText = categoryName; // Show Uppercase Title
      document.querySelector("#category-modal-content").innerHTML = html;
      document.querySelector("#category-modal-bg").classList.toggle("open");
      document.querySelector("#category-modal").classList.toggle("open");
    });
  });

  document.querySelector("#category-modal-bg").addEventListener("click", function(){
    document.querySelector("#category-modal-title").innerText = "";
    document.querySelector("#category-modal-content").innerHTML = "";
    document.querySelector("#category-modal-bg").classList.toggle("open");
    document.querySelector("#category-modal").classList.toggle("open");
  })
};