// DOM Элементы
const transactionList = document.getElementById('transaction-list');
const categorySelect = document.getElementById('category');
const filterCategorySelect = document.getElementById('filter-category');

// Отрисовка списка транзакций
export const renderTransactions = (transactions, categories) => {
    transactionList.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionList.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">Нет операций для отображения</p>';
        return;
    }

    transactions.forEach(t => {
        // Находим имя категории по ID
        const category = categories.find(c => c.id === t.categoryId);
        const catName = category ? category.name : 'Без категории';
        
        const sign = t.type === 'income' ? '+' : '-';
        const amountClass = t.type === 'income' ? 'income' : 'expense';

        const li = document.createElement('li');
        li.className = `transaction-item ${t.type}`;
        li.innerHTML = `
            <div class="transaction-info">
                <h3>${catName}</h3>
                <p>${t.date} ${t.comment ? '• ' + t.comment : ''}</p>
            </div>
            <div style="display:flex; align-items:center;">
                <span class="transaction-amount ${amountClass}">${sign}${t.amount} ₽</span>
                <div class="actions">
                    <button class="action-btn edit" data-id="${t.id}" title="Редактировать">✏️</button>
                    <button class="action-btn delete" data-id="${t.id}" title="Удалить">❌</button>
                </div>
            </div>
        `;
        transactionList.appendChild(li);
    });
};

// Обновление селектов категорий
export const renderCategoryOptions = (categories) => {
    categorySelect.innerHTML = '<option value="">Выберите...</option>';
    filterCategorySelect.innerHTML = '<option value="all">Все категории</option>';
    
    categories.forEach(c => {
        const option = `<option value="${c.id}">${c.name} (${c.type === 'income' ? 'Доход' : 'Расход'})</option>`;
        categorySelect.insertAdjacentHTML('beforeend', option);
        filterCategorySelect.insertAdjacentHTML('beforeend', option);
    });
};

// Отрисовка сводки (Доходы, Расходы, Баланс)
export const renderSummary = (transactions) => {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') income += Number(t.amount);
        else expense += Number(t.amount);
    });

    document.getElementById('sum-income').textContent = income;
    document.getElementById('sum-expense').textContent = expense;
    document.getElementById('sum-balance').textContent = income - expense;
};

// Показ ошибок валидации
export const showError = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`error-${fieldId}`);
    field.classList.add('input-error');
    errorEl.textContent = message;
    errorEl.classList.add('visible');
};

// Очистка ошибок валидации
export const clearErrors = () => {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('visible'));
};

// Показ глобальной ошибки (например, сервер не запущен)
export const showGlobalError = (msg) => {
    const errContainer = document.getElementById('error-container');
    errContainer.textContent = msg;
    errContainer.classList.remove('hidden');
};

// Управление лоадером
export const toggleLoader = (show) => {
    const loader = document.getElementById('loader');
    if (show) loader.classList.remove('hidden');
    else loader.classList.add('hidden');
};
