const API_URL = 'http://localhost:3001';

// Получение данных
export const getTransactions = async () => {
    try {
        const res = await fetch(`${API_URL}/transactions`);
        if (!res.ok) throw new Error('Ошибка загрузки транзакций');
        return await res.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getCategories = async () => {
    try {
        const res = await fetch(`${API_URL}/categories`);
        if (!res.ok) throw new Error('Ошибка загрузки категорий');
        return await res.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Создание
export const addTransaction = async (data) => {
    const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Ошибка при добавлении');
    return await res.json();
};

export const addCategory = async (data) => {
    const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Ошибка при создании категории');
    return await res.json();
};

// Обновление (редактирование)
export const updateTransaction = async (id, data) => {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Ошибка при обновлении');
    return await res.json();
};

// Удаление
export const deleteTransaction = async (id) => {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Ошибка при удалении');
};
