'use strict'

window.addEventListener("DOMContentLoaded", function() {
const budgetForm = document.getElementById('budget-form'); //форма
const budgetTable = document.getElementById('budget-table'); //таблица с записями
const typeSelect = document.getElementById('type'); //выбранный тип записи (Доход, Расход)
const submitButton = budgetForm.querySelector('button[type="submit"]'); //кнопка добавления записи
const categorySelect = document.getElementById('category'); //Элемент с категориями

let incomeCategories = ["Зарплата", "Подарки", "Инвестиции"];
let expenseCategories = ["Транспорт", "Еда", "Одежда", "Медицина", "Подарки"];

let budgetData = JSON.parse(localStorage.getItem('budgetData')) || [];
let editIndex = null; //Сохраняет индекс редактируемой записи

function saveData() {
    localStorage.setItem('budgetData', JSON.stringify(budgetData))
}


function renderTable() {
    budgetTable.innerHTML = '';
    budgetData.forEach((item, index) => {
        const row =document.createElement('tr');

        row.classList.add(item.type === 'Расход' ? 'expense' : 'income');

        row.innerHTML = `
        <td>${item.category}</td> 
        <td>${item.description}</td>
        <td class= "amount-cell">${item.amount} ₽</td>
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

function updateCategoryOptions(type) {
    categorySelect.innerHTML = ''; // Очистить текущие опции
    const categories = type === 'Расход' ? expenseCategories : incomeCategories;

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}


function editRecord(index) {
    const item = budgetData[index];

    document.getElementById('description').value = item.description;
    document.getElementById('amount').value = item.amount;
    typeSelect.value = item.type;
    updateCategoryOptions(item.type);
    categorySelect.value = item.category;
    document.getElementById('date').value = item.date;

    submitButton.textContent = 'Сохранить изменения';
    editIndex = index;
}

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
        submitButton.textContent = 'Добавить';
    } else {
        budgetData.push(newRecord);
    }
    saveData();
    renderTable();
    updateBalance();
    budgetForm.reset();
    updateCategoryOptions('Расход');
});

function updateBalance(){
    const balance = budgetData.reduce((total, item) => {
        return item.type === 'Доход' 
        ? total + item.amount 
        : total - item.amount;
    }, 0);

    const balanceElement = document.getElementById('current-balance');
    balanceElement.textContent = `Баланс: ${balance.toFixed(2)} ₽`;
}

typeSelect.addEventListener('change', (e) => {
    updateCategoryOptions(e.target.value);
});

function deleteRecord(index){
    budgetData.splice(index, 1);
    saveData();
    renderTable();
}

 updateCategoryOptions(typeSelect.value);
 renderTable();
})