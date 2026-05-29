document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('article-search');
    const articles = document.querySelectorAll('.article-card');
    
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        articles.forEach(article => {
            const title = article.getAttribute('data-title') || '';
            const excerpt = article.querySelector('.article-excerpt')?.innerText.toLowerCase() || '';
            const categories = article.getAttribute('data-categories') || '';
            
            if (title.includes(searchTerm) || excerpt.includes(searchTerm) || categories.includes(searchTerm)) {
                article.style.display = 'flex';
                article.style.opacity = '1';
                article.style.transform = 'translateY(0)';
            } else {
                article.style.display = 'none';
                article.style.opacity = '0';
                article.style.transform = 'translateY(20px)';
            }
        });
    });
});
