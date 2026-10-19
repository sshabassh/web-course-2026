// 1. Состояние приложения (массив объектов)
let tasks = [];
let currentFilter = 'all';

// 2. Получение DOM-элементов
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const errorMsg = document.getElementById('error-msg');
const filterBtns = document.querySelectorAll('.filter-btn');
const countActiveEl = document.getElementById('count-active');
const countCompletedEl = document.getElementById('count-completed');

// 3. Функция добавления задачи
function addTask() {
    const text = taskInput.value.trim();

    // Проверка на пустую строку
    if (text === '') {
        errorMsg.classList.add('visible');
        return;
    }

    errorMsg.classList.remove('visible');

    // Создаем объект задачи с уникальным ID (используем Date.now())
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    taskInput.value = ''; // Очищаем поле
    render(); // Перерисовываем интерфейс
}

// 4. Функция рендеринга (перерисовки списка)
function render() {
    // Очищаем список
    taskList.innerHTML = '';

    // Отрисовка каждой задачи через forEach
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        
        // Добавляем класс completed, если задача выполнена
        if (task.completed) {
            li.classList.add('completed');
        }

        // Проверяем, нужно ли скрыть задачу в зависимости от фильтра
        if (
            (currentFilter === 'active' && task.completed) ||
            (currentFilter === 'completed' && !task.completed)
        ) {
            li.classList.add('hidden');
        }

        // Внутренняя разметка задачи через innerHTML (требование)
        li.innerHTML = `
            <label class="task-content">
                <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <span class="task-text">${task.text}</span>
            </label>
            <button class="delete-btn" data-id="${task.id}">&times;</button>
        `;

        taskList.appendChild(li);
    });

    // Обновление счетчика (используем filter)
    const activeCount = tasks.filter(t => !t.completed).length;
    const completedCount = tasks.filter(t => t.completed).length;
    
    countActiveEl.textContent = activeCount;
    countCompletedEl.textContent = completedCount;
}

// 5. Обработчики событий

// Добавление по клику на кнопку
addBtn.addEventListener('click', addTask);

// Добавление по нажатию на Enter
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Делегирование событий для списка задач (изменение статуса и удаление)
taskList.addEventListener('click', (e) => {
    const target = e.target;
    const id = Number(target.getAttribute('data-id'));

    // Если кликнули на чекбокс (или на текст рядом с ним)
    if (target.matches('input[type="checkbox"]') || target.closest('.task-content')) {
        // Находим задачу в массиве и меняем статус
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            render();
        }
    }

    // Если кликнули на кнопку удаления
    if (target.matches('.delete-btn')) {
        tasks = tasks.filter(t => t.id !== id);
        render();
    }
});

// Переключение фильтров
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Меняем активный класс у кнопок
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Обновляем текущий фильтр и перерисовываем
        currentFilter = e.target.getAttribute('data-filter');
        render();
    });
});

// Первичный рендер при загрузке страницы
render();