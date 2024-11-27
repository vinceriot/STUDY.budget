window.addEventListener('DOMContentLoaded', function() {
    const MONTH_NAMES = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    // === Элементы DOM и графики
    const pieExpenseDom = document.getElementById('pie-expense-chart');
    const pieExpenseChart = echarts.init(pieExpenseDom);

    const pieIncomeDom = document.getElementById('pie-income-chart');
    const pieIncomeChart = echarts.init(pieIncomeDom);

    const barDom = document.getElementById('bar-chart');
    const barChart = echarts.init(barDom);

    // === Загрузка записей
    let budgetData = JSON.parse(localStorage.getItem('budgetData')) || [];



    // === Функции для группировки данных

    // Группировка данных по месяцам
    function groupByMonth(data) {
        return data.reduce((acc, item) => {
            const month = new Date(item.date).getMonth();  // Получаем месяц (0-11)
            if (!acc[month]) {
                acc[month] = { expense: 0, income: 0 };
            }
            if (item.type === 'Расход') {
                acc[month].expense += item.amount;
            } else if (item.type === 'Доход') {
                acc[month].income += item.amount;
            }
            return acc;
        }, {});
    }

    // Группировка данных по категориям
    function groupByCategory(data) {
        return data.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = 0;
            }
            acc[item.category] += item.amount;
            return acc;
        }, {});
    }

    // === Круговая диаграмма расходов
    const groupedExpenses = groupByCategory(budgetData.filter(item => item.type === 'Расход'));
    const expenseData = Object.keys(groupedExpenses).map(category => ({
        name: category,
        value: groupedExpenses[category]
    }));

    // Настройки для круговой диагрммы расходов
    const pieExpenseOption = {
        title: {
            text: 'Траты по категориям',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ₽ ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: expenseData.map(item => item.name)
        },
        series: [
            {
                name: 'Траты',
                type: 'pie',
                radius: '50%',
                data: expenseData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    // === Круговая диаграмма доходов
    const groupedIncome = groupByCategory(budgetData.filter(item => item.type === 'Доход'));
    
    const incomeData = Object.keys(groupedIncome).map(category => ({
        name: category,
        value: groupedIncome[category]
    }));

    // Настройки для круговой диагрммы доходов
    const pieIncomeOption = {
        title: {
            text: 'Доходы по категориям',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ₽ ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: incomeData.map(item => item.name)
        },
        series: [
            {
                name: 'Траты',
                type: 'pie',
                radius: '50%',
                data: incomeData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };


     // === Столбчатая диаграмма для доходов и расходов по месяцам
     
     const groupedData = groupByMonth(budgetData);
     const months = Object.keys(groupedData).map(month => MONTH_NAMES[parseInt(month)]); // Преобразуем ключи в числа

     const expenses = months.map((_, index) => {
        const monthIndex = parseInt(Object.keys(groupedData)[index]);
        return groupedData[monthIndex]?.expense || 0;
        });

    const incomes = months.map((_, index) => {
        const monthIndex = parseInt(Object.keys(groupedData)[index]);
        return groupedData[monthIndex]?.income || 0;
        });
    
    // Настройки для столбчатой диаграммы
    const barOption = {
        title: {
            text: 'Доходы и Расходы по месяцам',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        legend: {
            data: ['Расходы', 'Доходы'],
            left: 'left'
        },
        xAxis: {
            type: 'category',
            data: months,
            axisTick: { alignWithLabel: true }
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'Расходы',
                type: 'bar',
                stack: 'one',
                data: expenses,
                itemStyle: {
                    color: '#FF6F61'
                }
            },
            {
                name: 'Доходы',
                type: 'bar',
                stack: 'one',
                data: incomes,
                itemStyle: {
                    color: '#4CAF50'
                }
            }
        ]
    };
    
    
    barChart.setOption(barOption);
    pieExpenseChart.setOption(pieExpenseOption);
    pieIncomeChart.setOption(pieIncomeOption);
    
});
