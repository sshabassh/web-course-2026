// --- Состояние приложения ---
let currentPage = 1;
let currentSearch = '';
let isLoading = false;
let hasMore = true;

// --- DOM Элементы ---
const cardsContainer = document.getElementById('cards-container');
const searchInput = document.getElementById('search-input');
const loader = document.getElementById('loader');
const messageEl = document.getElementById('message');
const sentinel = document.getElementById('sentinel');

// Базовый URL API (используем бесплатный API Rick and Morty)
const API_URL = 'https://rickandmortyapi.com/api/character/';

// --- 1. Функция загрузки данных (с обработкой ошибок) ---
async function fetchData() {
    // Если уже грузимся или данные закончились — ничего не делаем
    if (isLoading || !hasMore) return;

    isLoading = true;
    loader.classList.remove('hidden');
    messageEl.classList.add('hidden');

    try {
        // Формируем URL с учетом пагинации и поиска
        const url = `${API_URL}?page=${currentPage}&name=${currentSearch}`;
        const response = await fetch(url);

        // Если сервер вернул 404 (ничего не найдено)
        if (response.status === 404) {
            hasMore = false;
            throw new Error('Ничего не найдено по вашему запросу.');
        }

        if (!response.ok) {
            throw new Error('Ошибка при загрузке данных с сервера.');
        }

        const data = await response.json();
        
        renderCards(data.results);

        // Проверяем, есть ли следующая страница
        if (data.info.next) {
            currentPage++;
        } else {
            hasMore = false; // Данные исчерпаны
        }

    } catch (error) {
        // Обработка ошибок
        messageEl.textContent = error.message;
        messageEl.classList.remove('hidden');
        hasMore = false; // Останавливаем скролл при ошибке
    } finally {
        // Этот блок выполнится в любом случае (и при успехе, и при ошибке)
        isLoading = false;
        loader.classList.add('hidden');
    }
}

// --- 2. Функция отрисовки карточек ---
function renderCards(characters) {
    // Используем map для создания HTML и join для склейки в одну строку
    const cardsHTML = characters.map(char => `
        <article class="card">
            <img src="${char.image}" alt="${char.name}" loading="lazy">
            <div class="card-info">
                <h2>${char.name}</h2>
                <p>Статус: ${char.status}</p>
                <p>Вид: ${char.species}</p>
            </div>
        </article>
    `).join('');

    // Добавляем новые карточки в конец контейнера
    cardsContainer.insertAdjacentHTML('beforeend', cardsHTML);
}

// --- 3. Бесконечный скролл (IntersectionObserver) ---
// Этот наблюдатель следит за невидимым элементом #sentinel в конце страницы.
const observer = new IntersectionObserver((entries) => {
    // Если sentinel попал в область видимости экрана и данные еще есть
    if (entries[0].isIntersecting && hasMore) {
        fetchData();
    }
}, { rootMargin: '100px' }); // Срабатывает за 100px до конца страницы

// Начинаем следить за sentinel
observer.observe(sentinel);

// --- 4. Функция Debounce для поиска (Защита от лишних запросов) ---
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// --- 5. Обработчик поиска ---
const handleSearch = (e) => {
    currentSearch = e.target.value.trim();
    currentPage = 1;    // Сбрасываем страницу на первую
    hasMore = true;     // Разрешаем скролл
    cardsContainer.innerHTML = ''; // Очищаем экран
    messageEl.classList.add('hidden');
    
    // Запускаем загрузку
    fetchData();
};

// Оборачиваем handleSearch в debounce.
// Запрос уйдет только если пользователь не печатал 500мс.
searchInput.addEventListener('input', debounce(handleSearch, 500));

// --- 6. Первичная загрузка при открытии страницы ---
fetchData();