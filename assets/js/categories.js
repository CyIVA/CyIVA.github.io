---
---

const rawLiquidCategories = { {% for category in site.categories %}{% capture category_name %}{{ category | first }}{% endcapture %}{{ category_name | replace: " ", "_" }}: [{% for post in site.categories[category_name] %}{ url: `{{ site.baseurl }}{{ post.url }}`, date: `{{post.date | date_to_string}}`, title: `{{post.title}}`},{% endfor %}],{% endfor %} };

// Merge categories case-insensitively
const categories = {};
let allPosts = [];

Object.keys(rawLiquidCategories).forEach(key => {
    const unifiedKey = key.toUpperCase();
    if (!categories[unifiedKey]) {
        categories[unifiedKey] = [];
    }
    categories[unifiedKey] = categories[unifiedKey].concat(rawLiquidCategories[key]);
});

// Create an "ALL" category containing all unique posts
const seenUrls = new Set();
Object.values(categories).forEach(postList => {
    postList.forEach(post => {
        if (!seenUrls.has(post.url)) {
            allPosts.push(post);
            seenUrls.add(post.url);
        }
    });
});
// Sort all posts by date desc
allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
categories["ALL"] = allPosts;

window.onload = function () {
  // Handle individual category clicks
  document.querySelectorAll(".category").forEach((category) => {
    category.addEventListener("click", function (e) {
      const originalName = e.currentTarget.dataset.category;
      if (!originalName) return;
      const categoryName = originalName.trim().toUpperCase();
      const posts = categories[categoryName];
      
      if (!posts) {
          console.error("No posts found for category:", categoryName);
          return;
      }

      showModal(categoryName, posts);
    });
  });

  // Handle "View all" click
  const viewAllBtn = document.querySelector(".view-all");
  if (viewAllBtn) {
    viewAllBtn.addEventListener("click", function(e) {
      e.preventDefault();
      let html = `<div class="modal-topic-list">`;
      // Sort category names alphabetically (excluding ALL)
      const catNames = Object.keys(categories).filter(c => c !== "ALL").sort();
      catNames.forEach(cat => {
        html += `
          <a href="#!" class="category modal-cat-item" data-category="${cat}" onclick="handleModalCatClick(this)">
            ${cat} <span class="count">(${categories[cat].length})</span>
          </a>
        `;
      });
      html += `</div>`;
      showModal("All Topics", [], html);
    });
  }

  const modalBg = document.querySelector("#category-modal-bg");
  if (modalBg) {
    modalBg.addEventListener("click", closeModal);
  }
};

function showModal(title, posts, customHtml = null) {
  let html = customHtml;
  if (!html) {
    html = ``;
    posts.forEach(post => {
      html += `
      <a class="modal-article" href="${post.url}">
        <h4>${post.title}</h4>
        <small class="modal-article-date">${post.date}</small>
      </a>
      `;
    });
  }
  
  const modalTitle = document.querySelector("#category-modal-title");
  const modalContent = document.querySelector("#category-modal-content");
  const modalBg = document.querySelector("#category-modal-bg");
  const modal = document.querySelector("#category-modal");

  if (modalTitle) modalTitle.innerText = title;
  if (modalContent) modalContent.innerHTML = html;
  if (modalBg) modalBg.classList.add("open");
  if (modal) modal.classList.add("open");

  // Re-apply category colors to tags inside the modal if applyCategoryColors is defined
  if (typeof applyCategoryColors === "function") {
    applyCategoryColors();
  }
}

function closeModal() {
  const modalTitle = document.querySelector("#category-modal-title");
  const modalContent = document.querySelector("#category-modal-content");
  const modalBg = document.querySelector("#category-modal-bg");
  const modal = document.querySelector("#category-modal");

  if (modalTitle) modalTitle.innerText = "";
  if (modalContent) modalContent.innerHTML = "";
  if (modalBg) modalBg.classList.remove("open");
  if (modal) modal.classList.remove("open");
}

// Global helper for topic clicks inside modal
window.handleModalCatClick = function(el) {
  const catName = el.dataset.category;
  showModal(catName, categories[catName]);
};
