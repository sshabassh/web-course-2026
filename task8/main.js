import * as api from './api.js';
import * as ui from './ui.js';

// --- Глобальное состояние ---
let transactions = [];
let categories = [];
let editingId = null;

// DOM Элементы
const form = document.getElementById('transaction-form');
const categoryForm = document.getElementById('category-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// Фильтры (элементы)
const filterCat = document.getElementById('filter-category');
const filterType = document.getElementById('filter-type');
const filterDateFrom = document.getElementById('filter-date-from');
const filterDateTo = document.getElementById('filter-date-to');

// --- Инициализация ---
async function init() {
    ui.toggleLoader(true);
    try {
        // Загружаем данные параллельно
        const [transData, catData] = await Promise.all([
            api.getTransactions(),
            api.getCategories()
        ]);
        transactions = transData;
        categories = catData;
        
        ui.renderCategoryOptions(categories);
        applyFilters(); // Применяем фильтры (и рендерим)
        restoreFilters(); // Восстанавливаем фильтры из localStorage
    } catch (error) {
        ui.showGlobalError('Не удалось подключиться к серверу. Убедитесь, что запущен "json-server --watch db.json --port 3001".');
    } finally {
        ui.toggleLoader(false);
    }
}

// --- Фильтрация и Рендер ---
function applyFilters() {
    // Читаем значения фильтров
    const catId = filterCat.value;
    const type = filterType.value;
    const dateFrom = filterDateFrom.value;
    const dateTo = filterDateTo.value;

    // Фильтруем массив в памяти (без запросов к серверу)
    let filtered = transactions.filter(t => {
        if (catId !== 'all' && t.categoryId !== catId) return false;
        if (type !== 'all' && t.type !== type) return false;
        if (dateFrom && t.date < dateFrom) return false;
        if (dateTo && t.date > dateTo) return false;
        return true;
    });

    // Сортируем по дате (сначала новые)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    ui.renderTransactions(filtered, categories);
    ui.renderSummary(filtered); // Сводка считается по отфильтрованным данным
    
    saveFiltersToLocalStorage();
}

// --- Сохранение и восстановление фильтров (LocalStorage) ---
function saveFiltersToLocalStorage() {
    const filters = {
        catId: filterCat.value,
        type: filterType.value,
        dateFrom: filterDateFrom.value,
        dateTo: filterDateTo.value
    };
    localStorage.setItem('zenMoneyFilters', JSON.stringify(filters));
}

function restoreFilters() {
    const saved = JSON.parse(localStorage.getItem('zenMoneyFilters'));
    if (saved) {
        filterCat.value = saved.catId || 'all';
        filterType.value = saved.type || 'all';
        filterDateFrom.value = saved.dateFrom || '';
        filterDateTo.value = saved.dateTo || '';
        applyFilters(); // Перерендериваем с сохраненными фильтрами
    }
}

// --- Валидация ---
function validateForm() {
    ui.clearErrors();
    let isValid = true;

    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    if (!amount || Number(amount) <= 0) {
        ui.showError('amount', 'Сумма должна быть больше нуля');
        isValid = false;
    }
    if (!category) {
        ui.showError('category', 'Выберите категорию');
        isValid = false;
    }
    if (!date) {
        ui.showError('date', 'Выберите дату');
        isValid = false;
    }

    return isValid;
}

// --- Обработчики событий ---

// Добавление / Редактирование транзакции
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = {
        amount: Number(document.getElementById('amount').value),
        type: document.getElementById('type').value,
        categoryId: document.getElementById('category').value,
        date: document.getElementById('date').value,
        comment: document.getElementById('comment').value.trim()
    };

    ui.toggleLoader(true);
    try {
        if (editingId) {
            // Режим редактирования (PUT)
            const updated = await api.updateTransaction(editingId, data);
            // Обновляем локальный массив
            transactions = transactions.map(t => t.id === editingId ? updated : t);
            resetForm();
        } else {
            // Режим создания (POST)
            const created = await api.addTransaction(data);
            transactions.push(created);
        }
        form.reset();
        applyFilters();
    } catch (error) {
        alert('Ошибка при сохранении');
    } finally {
        ui.toggleLoader(false);
    }
});

// Удаление и Редактирование (Делегирование событий)
document.getElementById('transaction-list').addEventListener('click', async (e) => {
    const target = e.target;
    
    // Удаление
    if (target.classList.contains('delete')) {
        const id = target.dataset.id;
        if (confirm('Удалить эту операцию?')) {
            ui.toggleLoader(true);
            try {
                await api.deleteTransaction(id);
                transactions = transactions.filter(t => t.id !== id);
                applyFilters();
            } catch (error) {
                alert('Ошибка удаления');
            } finally {
                ui.toggleLoader(false);
            }
        }
    }

    // Редактирование (заполнение формы)
    if (target.classList.contains('edit')) {
        const id = target.dataset.id;
        const t = transactions.find(item => item.id === id);
        
        if (t) {
            editingId = id;
            document.getElementById('amount').value = t.amount;
            document.getElementById('type').value = t.type;
            document.getElementById('category').value = t.categoryId;
            document.getElementById('date').value = t.date;
            document.getElementById('comment').value = t.comment;
            
            // Меняем UI формы
            formTitle.textContent = 'Редактирование операции';
            submitBtn.textContent = 'Сохранить';
            cancelEditBtn.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
});

// Отмена редактирования
cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
    editingId = null;
    form.reset();
    formTitle.textContent = 'Новая операция';
    submitBtn.textContent = 'Добавить';
    cancelEditBtn.classList.add('hidden');
    ui.clearErrors();
}

// Создание новой категории
categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('new-category-name').value.trim();
    const type = document.getElementById('new-category-type').value;

    if (!name) return;

    try {
        const newCat = await api.addCategory({ name, type });
        categories.push(newCat);
        ui.renderCategoryOptions(categories);
        categoryForm.reset();
    } catch (error) {
        alert('Ошибка при создании категории');
    }
});

// Слушатели фильтров (при изменении любого фильтра применяем их)
[filterCat, filterType, filterDateFrom, filterDateTo].forEach(el => {
    el.addEventListener('change', applyFilters);
});

// Запуск приложения
init();
