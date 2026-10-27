// --- Состояние игры ---
const state = {
    sequence: [],      // Текущая последовательность (массив чисел 0-3)
    playerIndex: 0,    // Индекс текущего клика игрока
    level: 0,          // Текущий уровень (длина последовательности)
    isPlaying: false,  // Флаг: компьютер показывает последовательность
    isGameOver: false, // Флаг: игра окончена
    isStarted: false   // Флаг: игра была запущена
};

// --- DOM Элементы ---
const buttons = document.querySelectorAll('.simon-btn');
const startBtn = document.getElementById('start-btn');
const levelDisplay = document.getElementById('level-display');
const statusText = document.getElementById('status-text');

// --- Аудио контекст (для звуков) ---
let audioCtx;
// Разные частоты для разных кнопок
const frequencies = [329.63, 261.63, 220.00, 164.81]; 

// Флаг для отмены текущей анимации (защита от "зомби-таймеров")
let isSequenceCancelled = false;

// --- Инициализация звука (требует взаимодействия с пользователем) ---
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(index) {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequencies[index];
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Плавное затухание звука
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
}

// --- Вспомогательная функция задержки ---
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Подсветка кнопки ---
async function flashButton(index) {
    const btn = buttons[index];
    btn.classList.add('active');
    playSound(index);
    await wait(300); // Кнопка горит 300мс
    btn.classList.remove('active');
    await wait(150); // Пауза перед следующей кнопкой
}

// --- Показ последовательности компьютером ---
async function playSequence() {
    state.isPlaying = true;
    state.playerIndex = 0;
    isSequenceCancelled = false;
    statusText.textContent = "Смотрите и запоминайте...";

    for (let i = 0; i < state.sequence.length; i++) {
        if (isSequenceCancelled) return; // Прерываем, если игру сбросили
        await flashButton(state.sequence[i]);
    }

    if (isSequenceCancelled) return;
    
    state.isPlaying = false;
    statusText.textContent = "Ваш ход!";
}

// --- Обработка клика по сектору ---
async function handlePlayerClick(e) {
    // Блокируем клики, если компьютер показывает, или игра окончена/не начата
    if (state.isPlaying || state.isGameOver || !state.isStarted) return;

    const clickedIndex = parseInt(e.target.getAttribute('data-id'));
    
    // Подсвечиваем кнопку, на которую нажал игрок
    // (не ждем завершения анимации, чтобы не тормозить игру)
    const btn = buttons[clickedIndex];
    btn.classList.add('active');
    playSound(clickedIndex);
    setTimeout(() => btn.classList.remove('active'), 200);

    // Проверка правильности
    if (clickedIndex === state.sequence[state.playerIndex]) {
        state.playerIndex++;

        // Если игрок повторил всю последовательность
        if (state.playerIndex === state.sequence.length) {
            state.level++;
            levelDisplay.textContent = state.level;
            
            // Небольшая пауза перед следующим раундом
            state.isPlaying = true;
            statusText.textContent = "Отлично! Следующий раунд...";
            await wait(1000);
            
            if (isSequenceCancelled) return;
            
            addStepToSequence();
            playSequence();
        }
    } else {
        // ОШИБКА
        gameOver();
    }
}

// --- Добавление шага в последовательность ---
function addStepToSequence() {
    const randomIndex = Math.floor(Math.random() * 4);
    state.sequence.push(randomIndex);
}

// --- Конец игры ---
function gameOver() {
    state.isPlaying = false;
    state.isGameOver = true;
    isSequenceCancelled = true; // Отменяем возможные анимации
    
    statusText.textContent = `Вы проиграли! Дошли до уровня ${state.level}`;
    statusText.style.color = "#e74c3c";
    startBtn.textContent = "Начать заново";
    
    // Проигрываем грустный звук
    if (audioCtx) {
        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    }
}

// --- Запуск / Сброс игры ---
function startGame() {
    initAudio(); // Инициализируем аудио по клику пользователя
    
    // Сброс состояния
    state.sequence = [];
    state.playerIndex = 0;
    state.level = 0;
    state.isGameOver = false;
    state.isStarted = true;
    isSequenceCancelled = true; // Отменяем старые таймеры
    
    // Сброс интерфейса
    levelDisplay.textContent = state.level;
    statusText.style.color = "#bdc3c7"; // Возвращаем цвет
    startBtn.textContent = "Старт";
    
    // Убираем активные классы со всех кнопок (на случай если застряли)
    buttons.forEach(btn => btn.classList.remove('active'));

    // Первый раунд
    addStepToSequence();
    state.level = 1;
    levelDisplay.textContent = state.level;
    
    // Даем небольшую паузу, чтобы интерфейс обновился
    setTimeout(() => {
        playSequence();
    }, 500);
}

// --- Слушатели событий ---
buttons.forEach(btn => {
    btn.addEventListener('click', handlePlayerClick);
});

startBtn.addEventListener('click', () => {
    // Если игра идет, кнопка старт блокируется (опционально, но правильно)
    if (state.isPlaying) return; 
    startGame();
});