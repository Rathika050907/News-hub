function loadSavedArticles() {
    const savedNewsContainer = document.getElementById('saved-news-container');
    const savedArticles = JSON.parse(localStorage.getItem('savedArticles')) || [];

    if (savedArticles.length === 0) {
        savedNewsContainer.innerHTML = '<p>No saved articles.</p>';
        return;
    }

    savedArticles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('news-article');

        articleDiv.innerHTML = `
            <h3>${article.title}</h3>
            <a href="${article.url}" target="_blank">Read Full Article</a>
            <button onclick="removeArticle('${article.url}')">Remove</button>
        `;

        savedNewsContainer.appendChild(articleDiv);
    });
}

function removeArticle(url) {
    let savedArticles = JSON.parse(localStorage.getItem('savedArticles')) || [];
    savedArticles = savedArticles.filter(article => article.url !== url);
    localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
    location.reload();  // Refresh the page to update the list
}

window.onload = loadSavedArticles;
