window.addEventListener('DOMContentLoaded', function () {
    // === Константы
    const MONTH_NAMES = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", 
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    const budgetData = JSON.parse(localStorage.getItem('budgetData')) || [];

    // === Основные функции

    // Инициализация графика
    function initChart(domId) {
        const dom = document.getElementById(domId);
        return echarts.init(dom);
    }

    // Группировка данных по месяцам
    function groupByMonth(data) {
        return data.reduce((acc, item) => {
            const month = new Date(item.date).getMonth();
            if (!acc[month]) acc[month] = { expense: 0, income: 0 };
            if (item.type === 'Расход') acc[month].expense += item.amount;
            if (item.type === 'Доход') acc[month].income += item.amount;
            return acc;
        }, {});
    }

    // Группировка данных по категориям
    function groupByCategory(data) {
        return data.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = 0;
            acc[item.category] += item.amount;
            return acc;
        }, {});
    }

    // Подготовка данных для круговых диаграмм
    function processCategoryData(data, type) {
        const grouped = groupByCategory(data.filter(item => item.type === type));
        return Object.keys(grouped).map(category => ({
            name: category,
            value: grouped[category]
        }));
    }

    // Получение данных по месяцам
    function getMonthlyData(groupedData, field) {
        return Array.from({ length: 12 }, (_, i) => groupedData[i]?.[field] || 0);
    }

    // Создание настроек для круговых диаграмм
    function createPieChartOptions(title, data, name) {
        return {
            title: {
                text: title,
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: `{a} <br/>{b}: {c} ₽ ({d}%)`
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: data.map(item => item.name)
            },
            series: [
                {
                    name: name,
                    type: 'pie',
                    radius: '50%',
                    data: data,
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
    }

    // Создание настроек для столбчатой диаграммы
    function createBarChartOptions(groupedData, monthNames) {
        const expenses = getMonthlyData(groupedData, 'expense');
        const incomes = getMonthlyData(groupedData, 'income');

        return {
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
                data: monthNames,
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
    }

    // === Инициализация графиков 
    const pieExpenseChart = initChart('pie-expense-chart');
    const pieIncomeChart = initChart('pie-income-chart');
    const barChart = initChart('bar-chart');

    // === Подготовка данных
    const groupedData = groupByMonth(budgetData);
    const expenseData = processCategoryData(budgetData, 'Расход');
    const incomeData = processCategoryData(budgetData, 'Доход');
    console.log(groupedData);

    // === Настройки графиков 
    const barChartOptions = createBarChartOptions(groupedData, MONTH_NAMES);
    const pieExpenseOptions = createPieChartOptions('Траты по категориям', expenseData, 'Траты');
    const pieIncomeOptions = createPieChartOptions('Доходы по категориям', incomeData, 'Доходы');

    // === Установка настроек
    barChart.setOption(barChartOptions);
    pieExpenseChart.setOption(pieExpenseOptions);
    pieIncomeChart.setOption(pieIncomeOptions);
});
