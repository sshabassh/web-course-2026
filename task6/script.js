// --- Настройки и DOM ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');

const GRID_SIZE = 20;         // Размер одной клетки (20px)
const TILE_COUNT = 20;        // 400 / 20 = 20 клеток по ширине/высоте
const MOVE_INTERVAL = 150;    // Время между шагами змейки в мс (150мс = 6.6 шагов в секунду)

// --- Состояние игры ---
let snake = [];
let direction = { x: 1, y: 0 };      // Текущее направление (изначально вправо)
let nextDirection = { x: 1, y: 0 };  // Буфер для нажатий клавиш
let apple = { x: 0, y: 0 };
let score = 0;
let isGameOver = false;
let lastMoveTime = 0;

// --- Инициализация (Сброс) ---
function initGame() {
    // Изначально 3 сегмента
    snake = [
        { x: 10, y: 10 }, // Голова
        { x: 9, y: 10 },  
        { x: 8, y: 10 }   // Хвост
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    isGameOver = false;
    scoreElement.textContent = score;
    
    spawnApple();
    
    lastMoveTime = performance.now();
    // Запуск игрового цикла
    requestAnimationFrame(gameLoop);
}

// --- Генерация яблока в свободной клетке ---
function spawnApple() {
    let newApple;
    let isOccupied = true;

    while (isOccupied) {
        newApple = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
        // Проверяем, не находится ли яблоко внутри змейки
        isOccupied = snake.some(segment => segment.x === newApple.x && segment.y === newApple.y);
    }
    
    apple = newApple;
}

// --- Логика движения ---
function moveSnake() {
    // Применяем накопленное направление
    direction = { ...nextDirection };
    
    // Вычисляем новую голову
    const head = snake[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };

    // Добавляем новую голову в начало массива
    snake.unshift(newHead);

    // Проверка: съели ли яблоко?
    if (newHead.x === apple.x && newHead.y === apple.y) {
        score++;
        scoreElement.textContent = score;
        spawnApple();
    } else {
        // Если не съели, удаляем последний сегмент (хвост)
        snake.pop();
    }
}

// --- Проверка столкновений ---
function checkCollision() {
    const head = snake[0];

    // Столкновение со стеной
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        isGameOver = true;
        return;
    }

    // Столкновение с собственным телом (начиная со 2-го сегмента)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            isGameOver = true;
            return;
        }
    }
}

// --- Обновление состояния ---
function update(currentTime) {
    if (isGameOver) return;

    // Проверяем, прошло ли достаточно времени с последнего шага
    if (currentTime - lastMoveTime >= MOVE_INTERVAL) {
        lastMoveTime = currentTime;
        moveSnake();
        checkCollision();
    }
}

// --- Отрисовка ---
function draw() {
    // Очищаем холст
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Отрисовка яблока (красный круг)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(
        apple.x * GRID_SIZE + GRID_SIZE / 2, 
        apple.y * GRID_SIZE + GRID_SIZE / 2, 
        GRID_SIZE / 2 - 2, 
        0, 
        Math.PI * 2
    );
    ctx.fill();

    // Отрисовка змейки (зеленые квадраты)
    snake.forEach((segment, index) => {
        // Голова светлее, хвост темнее
        ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
        
        ctx.fillRect(
            segment.x * GRID_SIZE + 1, 
            segment.y * GRID_SIZE + 1, 
            GRID_SIZE - 2, 
            GRID_SIZE - 2
        );
    });

    // Отрисовка экрана Game Over
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Игра окончена!', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = '20px sans-serif';
        ctx.fillText(`Ваш счёт: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
}

// --- Игровой цикл ---
function gameLoop(currentTime) {
    update(currentTime);
    draw();

    // Продолжаем цикл, даже если gameOver, чтобы отрисовать финальный экран
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// --- Управление клавиатурой ---
function handleKeyDown(e) {
    if (isGameOver) return;

    // Блокируем прокрутку страницы стрелками
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }

    // Запрет на разворот на 180 градусов
    switch (e.key) {
        case 'ArrowUp':
            if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
            break;
    }
}

// --- Слушатели событий ---
document.addEventListener('keydown', handleKeyDown);
restartBtn.addEventListener('click', initGame);

// Запуск при загрузке страницы
initGame();