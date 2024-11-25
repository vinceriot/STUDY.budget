'use strict'

window.addEventListener("DOMContentLoaded", function() {
const budgetForm = document.getElementById('budget-form');
const budgetTable = document.getElementById('budget-table');

let budgetData = JSON.parse(localStorage.getItem('budgetData')) || [];

function saveData() {
    localStorage.setItem('budgetData', JSON.stringify(budgetData))
}

function renderTable() {
    budgetTable.innerHTML = '';
    budgetData.forEach((item, index) => {
        const row =document.createElement('tr');
        row.innerHTML = `
        <td>${item.description}</td>
        <td>${item.amount}</td>
        <td>${item.type}</td>
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
    });
}

budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    
    budgetData.push({description, amount, type});
    saveData();
    renderTable();
    budgetForm.reset();
});

function deleteRecord(index){
    budgetData.splice(index, 1);
    saveData();
    renderTable();
}

function editRecord(index) {
    const item = budgetData[index];
    document.getElementById('description').value = item.description;
    document.getElementById('amount').value = item.amount;
    document.getElementById('type').value = item.type;
    deleteRecord(index);
}

 renderTable();
})