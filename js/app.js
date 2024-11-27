'use strict'

window.addEventListener("DOMContentLoaded", function() {

const budgetData = JSON.parse(localStorage.getItem('budgetData')) || [];

// === DOM элементы
const budgetForm = document.getElementById('budget-form'); //форма
const budgetTable = document.getElementById('budget-table'); //таблица с записями
const typeSelect = document.getElementById('type'); //выбранный тип записи (Доход, Расход)
const submitButton = budgetForm.querySelector('button[type="submit"]'); //кнопка добавления записи
const categorySelect = document.getElementById('category'); //Элемент с категориями
const formSection = document.getElementById('edit-section');
const formTitle = document.getElementById('title-added-form');

// === DOM элементы фильтра 
const filterCategorySelect = document.getElementById('filter-category'); //Фильтр по категориям
const filterTypeSelect = document.getElementById('filter-type');
const filterStartDate = document.getElementById('filter-start-date');
const filterEndDate = document.getElementById('filter-end-date');
const toggleFilterBtn = document.getElementById("toggle-filter-btn");
const filterSection = document.getElementById("filter-section");

// === Начальные данные
let incomeCategories = ["Зарплата", "Подарки", "Инвестиции"]; //категории доходов
let expenseCategories = ["Транспорт", "Еда", "Одежда", "Медицина", "Подарки"]; //категории расходов
let editIndex = null; //сохранение индекса редактируемой записи 


// === Основные функции

// Cохранение записей в localStorage 
function saveData() {
    budgetData.sort((a, b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem('budgetData', JSON.stringify(budgetData))
}

// Рендер таблицы с записями 
function renderTable(data = budgetData) {
    budgetTable.innerHTML = '';
    data.forEach((item, index) => {
        const row =document.createElement('tr');

        row.classList.add(item.type === 'Расход' ? 'expense' : 'income');

        row.innerHTML = `
        <td>${item.category}</td> 
        <td>${item.description}</td>
        <td class= "amount-cell">${item.amount.toLocaleString()} ₽</td>
        <td>${item.date}</td>
        <td>
           <button class="edit-btn">✏️</button>
            <button class="delete-btn">🗑️</button>
        </td>
        `;
        budgetTable.appendChild(row);

        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => editRecord(index));
        deleteBtn.addEventListener('click', () => deleteRecord(index));
        updateBalance();
    });
}

// Обновление общего состояния счёта
function updateBalance(){
    const balance = budgetData.reduce((total, item) => {
        return item.type === 'Доход' 
        ? total + item.amount 
        : total - item.amount;
    }, 0);

    const balanceElement = document.getElementById('current-balance');
    balanceElement.textContent = `Баланс: ${balance.toLocaleString()} ₽`;

    balanceElement.classList.remove('income', 'expense');
    if (balance < 0) {
        balanceElement.classList.add('expense');
    } else {
        balanceElement.classList.add('income')
    }
}

// Обновление категории в основной форме зависимости от выбранного типа записи
function updateCategoryOptions(type) {
    categorySelect.innerHTML = ''; // очистка всех опций
    const categories = type === 'Расход' ? expenseCategories : incomeCategories;

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Обновление категории для формы-фильтра 
function updateFilterCategory (type = "") {
    filterCategorySelect.innerHTML = '<option value="">Все</option>'; 
    let categories;

    if (type) {
        categories = type === 'Расход' ? expenseCategories : incomeCategories;
    } else {
        categories =[...incomeCategories, ...expenseCategories];
    }

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterCategorySelect.appendChild(option);
    });
}

// Удаление записи
function deleteRecord(index){
    budgetData.splice(index, 1);
    saveData();
    renderTable();
    updateBalance();
    showNotification('Запись успешно удалена!');
}

// Изменение записи
function editRecord(index) {
    formTitle.textContent = "Изменить запись"
    const item = budgetData[index];

    document.getElementById('description').value = item.description;
    document.getElementById('amount').value = item.amount;
    typeSelect.value = item.type;
    updateCategoryOptions(item.type);
    categorySelect.value = item.category;
    document.getElementById('date').value = item.date;

    submitButton.textContent = 'Сохранить изменения';
    editIndex = index;

    
      // Подсветить форму и прокрутить к ней
      formSection.classList.add('highlight');
  
      // Прокрутить страницу к форме
      formSection.scrollIntoView({ behavior: 'smooth' });

      
}

// Уведомления для пользователя
function showNotification(message) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = message;
    notification.classList.remove('hidden');
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 2000);
}

// Применение фильтров
function applyFilters() {
    debugger;
    const filterCategorySelectValue = filterCategorySelect.value;
    const filterTypeSelectValue = filterTypeSelect.value;
    const filterStartDateValue = filterStartDate.value;
    const filterEndDateValue = filterEndDate.value;

    const filteredData = budgetData.filter(item => {
        const matchesType = !filterTypeSelectValue || item.type === filterTypeSelectValue;
        const matchesCategory = !filterCategorySelectValue || item.category === filterCategorySelectValue;
        const matchesStartDate = !filterStartDateValue || new Date(item.date) >= new Date(filterStartDateValue);
        const matchesEndDate = !filterEndDateValue || new Date(item.date) <= new Date(filterEndDateValue);

        return matchesType && matchesCategory && matchesStartDate && matchesEndDate
    });

    renderTable(filteredData);
}


// === События
 
// Отправка основной формы формы (Добавление и редактирование записи)
budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value || new Date().toISOString().split('T')[0];
    
    const newRecord = { description, amount, type, category, date };
    if(editIndex !== null) {
        budgetData[editIndex] = newRecord;
        editIndex = null;
        showNotification('Запись успешно изменена!');
        formSection.classList.remove("highlight")
        submitButton.textContent = 'Добавить';
        formTitle.textContent = "Добавить запись";
    } else {
        budgetData.push(newRecord);
    }
    saveData();
    renderTable();
    updateBalance();
    budgetForm.reset();
    updateCategoryOptions('Расход');
});

// Обработка изменения типа записи для основной формы
typeSelect.addEventListener('change', (e) => {
    updateCategoryOptions(e.target.value);
});

// Открытие\закрытие формы с фильтрами
toggleFilterBtn.addEventListener("click", function(){
    filterSection.classList.toggle("hidden");
    if (filterSection.classList.contains("hidden")) {
        toggleFilterBtn.textContent = "Показать фильтры";
    } else {
        toggleFilterBtn.textContent = "Скрыть фильтры";
    }
});

// Отправка формы-фильтра
document.getElementById('filter-form').addEventListener('submit', (e) => {
    e.preventDefault(); // отключение перезагрузки страницы
    applyFilters();
});

// Обработка изменения типа записи для формы-фильтра 
filterTypeSelect.addEventListener('change', (e) => {
    updateFilterCategory(e.target.value);
});



 updateBalance();
 renderTable();
 updateCategoryOptions(typeSelect.value);
 updateFilterCategory();

})