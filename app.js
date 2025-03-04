const NEWS_API_KEY = 'cc5fbad9f3fe4d539cb442e1299f2573';
const BASE_URL = 'https://newsapi.org/v2/top-headlines?country=us&apiKey=' + NEWS_API_KEY;

const toggleDarkMode = document.getElementById('dark-mode-toggle');
const newsContainer = document.getElementById('news-container');
const loader = document.getElementById('loader');

let page = 1;
const PAGE_SIZE = 10;
const loadedArticles = new Set();

// Text-to-Speech (TTS)
let speechInstance;
function readAloud(text) {
    if (speechInstance) {
        window.speechSynthesis.cancel();
    }
    speechInstance = new SpeechSynthesisUtterance(text);
    speechInstance.lang = 'en-US';
    speechInstance.rate = 1;
    speechInstance.pitch = 1;
    window.speechSynthesis.speak(speechInstance);
}

// Fetch News
function fetchNews() {
    const category = document.getElementById('category').value;
    const searchQuery = document.getElementById('searchInput').value;

    let url = `${BASE_URL}&category=${category}`;
    if (searchQuery) {
        url += `&q=${searchQuery}`;
    }

    loader.style.display = 'block';
    newsContainer.innerHTML = '';

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            loader.style.display = 'none';

            if (!data.articles || data.articles.length === 0) {
                newsContainer.innerHTML = `<p>No news found.</p>`;
                return;
            }

            data.articles.forEach(article => {
                if (!loadedArticles.has(article.url)) {
                    loadedArticles.add(article.url);

                    const articleDiv = document.createElement('div');
                    articleDiv.classList.add('news-article');

                    const timeAgo = getTimeAgo(article.publishedAt);

                    articleDiv.innerHTML = `
                        <img src="${article.urlToImage || 'https://via.placeholder.com/250'}" alt="${article.title}">
                        <h3>${article.title}</h3>
                        <p>${article.description || 'No description available.'}</p>
                        <p><small>${timeAgo}</small></p>
                        <a href="${article.url}" target="_blank">Read Full Article</a>
                        <button onclick="readAloud('${article.title}. ${article.description || ''}')">🔊 Listen</button>
                        <button onclick="shareNews('${article.title}', '${article.url}')">📢 Share</button>
                    `;
                    newsContainer.appendChild(articleDiv);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            loader.innerHTML = 'Failed to load news.';
            loader.style.color = 'red';
        });
}

// Load more news on scroll
function fetchMoreNews() {
    page++;
    const NEWS_API_URL_PAGINATED = `https://newsapi.org/v2/top-headlines?country=us&page=${page}&pageSize=${PAGE_SIZE}&apiKey=${NEWS_API_KEY}`;

    fetch(NEWS_API_URL_PAGINATED)
        .then(response => response.json())
        .then(data => {
            data.articles.forEach(article => {
                if (!loadedArticles.has(article.url)) {
                    loadedArticles.add(article.url);
                    const articleDiv = document.createElement('div');
                    articleDiv.classList.add('news-article');

                    articleDiv.innerHTML = `
                        <img src="${article.urlToImage || 'https://via.placeholder.com/250'}" alt="${article.title}">
                        <h3>${article.title}</h3>
                        <p>${article.description || 'No description available.'}</p>
                        <a href="${article.url}" target="_blank">Read Full Article</a>
                        <button onclick="readAloud('${article.title}. ${article.description || ''}')">🔊 Listen</button>
                        <button onclick="shareNews('${article.title}', '${article.url}')">📢 Share</button>
                    `;
                    newsContainer.appendChild(articleDiv);
                }
            });
        })
        .catch(error => console.error('Error loading more news:', error));
}

// Detect scroll to bottom
window.onscroll = function () {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        fetchMoreNews();
    }
};

// Share news
function shareNews(title, url) {
    const shareText = `Check out this news: ${title} - ${url}`;

    if (navigator.share) {
        navigator.share({
            title: title,
            text: shareText,
            url: url
        }).catch(err => console.error('Error sharing:', err));
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert("Link copied to clipboard!");
        });
    }
}

// Convert date to "time ago" format
function getTimeAgo(publishedAt) {
    const publishedDate = new Date(publishedAt);
    const now = new Date();
    const diffMs = now - publishedDate;
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
}

window.onload = fetchNews;
