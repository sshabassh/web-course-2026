// --- Состояние игры ---
let secretNumber = '';
let attempts = 0;
let history = [];
let isGameOver = false;

// --- DOM Элементы ---
const guessInput = document.getElementById('guess-input');
const checkBtn = document.getElementById('check-btn');
const newGameBtn = document.getElementById('new-game-btn');
const messageEl = document.getElementById('message');
const attemptsEl = document.getElementById('attempts-count');
const historyList = document.getElementById('history-list');

// --- 1. Функция генерации числа ---
function generateNumber() {
    let digits = [];
    while (digits.length < 4) {
        const randomDigit = Math.floor(Math.random() * 10);
        // Проверяем, чтобы цифры не повторялись
        if (!digits.includes(randomDigit)) {
            digits.push(randomDigit);
        }
    }
    return digits.join(''); // Возвращает строку, например "1234"
}

// --- 2. Функция валидации ввода ---
function validateInput(input) {
    if (input.length !== 4) {
        return "Нужно ввести ровно 4 цифры!";
    }
    if (!/^\d+$/.test(input)) {
        return "Можно вводить только цифры!";
    }
    const uniqueDigits = new Set(input.split(''));
    if (uniqueDigits.size !== 4) {
        return "Цифры не должны повторяться!";
    }
    return null; // Возвращаем null, если ошибок нет
}

// --- 3. Функция подсчета быков и коров ---
function countBullsAndCows(secret, guess) {
    let bulls = 0;
    let cows = 0;

    for (let i = 0; i < 4; i++) {
        if (guess[i] === secret[i]) {
            bulls++;
        } else if (secret.includes(guess[i])) {
            cows++;
        }
    }
    return { bulls, cows };
}

// --- 4. Функция рендеринга истории ---
function renderHistory() {
    // Очищаем список
    historyList.innerHTML = '';

    // Используем map для создания HTML-строк и join для склейки
    const historyHTML = history.map(item => {
        return `<li><strong>${item.guess}</strong> → ${item.bulls} бык(а), ${item.cows} коров(ы)</li>`;
    }).join('');

    historyList.innerHTML = historyHTML;
}

// --- 5. Инициализация / Сброс игры ---
function initGame() {
    secretNumber = generateNumber();
    attempts = 0;
    history = [];
    isGameOver = false;

    // Сброс UI
    guessInput.value = '';
    guessInput.disabled = false;
    checkBtn.disabled = false;
    messageEl.textContent = '';
    messageEl.className = 'message';
    attemptsEl.textContent = `Попыток: ${attempts}`;
    
    renderHistory();
    guessInput.focus();

    // Для отладки (раскомментируйте, чтобы видеть загаданное число в консоли)
    // console.log("Загадано:", secretNumber);
}

// --- 6. Обработчик проверки попытки ---
function handleCheck() {
    if (isGameOver) return;

    const guess = guessInput.value.trim();
    
    // Валидация
    const error = validateInput(guess);
    if (error) {
        messageEl.textContent = error;
        messageEl.className = 'message error';
        return;
    }

    // Если валидация пройдена
    messageEl.textContent = ''; // Очищаем ошибки
    attempts++;
    
    // Считаем результат
    const result = countBullsAndCows(secretNumber, guess);
    
    // Добавляем в историю и рендерим
    history.push({ guess, bulls: result.bulls, cows: result.cows });
    renderHistory();

    // Обновляем счетчик попыток
    attemptsEl.textContent = `Попыток: ${attempts}`;

    // Проверка на победу
    if (result.bulls === 4) {
        isGameOver = true;
        messageEl.textContent = `Победа! Угадано за ${attempts} попыток!`;
        messageEl.className = 'message success';
        
        // Блокируем поле ввода
        guessInput.disabled = true;
        checkBtn.disabled = true;
    } else {
        // Если не угадали, очищаем поле для нового ввода
        guessInput.value = '';
        guessInput.focus();
    }
}

// --- Слушатели событий ---
checkBtn.addEventListener('click', handleCheck);

// Отправка по Enter
guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleCheck();
    }
});

newGameBtn.addEventListener('click', initGame);

// Запуск игры при загрузке страницы
initGame();