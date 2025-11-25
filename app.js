/**
 * 买房投资计算器 - 主应用控制器
 * 负责UI交互、数据流转和结果渲染
 */

// 全局变量
let currentResults = null;
let profitChart = null;

/**
 * 格式化货币
 */
function formatCurrency(value) {
    if (value >= 10000) {
        return `${(value / 10000).toFixed(2)} 万元`;
    }
    return `${value.toFixed(2)} 元`;
}

/**
 * 格式化百分比
 */
function formatPercent(value) {
    return `${value.toFixed(2)}%`;
}

/**
 * 从表单获取输入参数
 */
function getInputParams() {
    return {
        housePrice: parseFloat(document.getElementById('housePrice').value),
        downPaymentRatio: parseFloat(document.getElementById('downPaymentRatio').value),
        loanYears: parseInt(document.getElementById('loanYears').value),
        interestRate: parseFloat(document.getElementById('interestRate').value),
        monthlyRent: parseFloat(document.getElementById('monthlyRent').value),
        costRatio: parseFloat(document.getElementById('costRatio').value),
        appreciationRate: parseFloat(document.getElementById('appreciationRate').value),
        holdingYears: parseInt(document.getElementById('holdingYears').value),
        emergencyFund: parseFloat(document.getElementById('emergencyFund').value),
        monthlyIncome: parseFloat(document.getElementById('monthlyIncome').value)
    };
}

/**
 * 更新实时计算的辅助信息
 */
function updateHelperTexts() {
    const params = getInputParams();

    // 更新首付金额
    const downPaymentAmount = params.housePrice * (params.downPaymentRatio / 100);
    document.getElementById('downPaymentAmount').textContent = downPaymentAmount.toFixed(2);

    // 更新贷款金额
    const loanAmount = params.housePrice - downPaymentAmount;
    document.getElementById('loanAmount').value = loanAmount.toFixed(2);

    // 更新月供
    const monthlyPayment = Calculator.calculateMonthlyPayment(
        loanAmount * 10000,
        params.interestRate / 100,
        params.loanYears
    );
    document.getElementById('monthlyPayment').textContent = monthlyPayment.toFixed(2);

    // 更新年租金
    const yearlyRent = params.monthlyRent * 12;
    document.getElementById('yearlyRent').textContent = yearlyRent.toFixed(0);
}

/**
 * 渲染收益指标
 */
function renderMetrics(results) {
    document.getElementById('cashReturn').textContent = formatPercent(results.cashReturn);
    document.getElementById('totalReturn').textContent = formatPercent(results.totalReturn);
    document.getElementById('annualReturn').textContent = formatPercent(results.annualReturn);
    document.getElementById('coverageRatio').textContent = results.coverageRatio.toFixed(2);

    document.getElementById('netRentIncome').textContent = formatCurrency(results.netRentIncome);
    document.getElementById('appreciation').textContent = formatCurrency(results.appreciation);
    document.getElementById('totalProfit').textContent = formatCurrency(results.totalProfit);
    document.getElementById('totalInterest').textContent = formatCurrency(results.totalInterest);
}

/**
 * 渲染风险评估
 */
function renderRiskAssessment(riskAssessment) {
    const { overall, cashFlow, leverage, market } = riskAssessment;

    // 更新综合风险分数
    document.getElementById('riskScore').textContent = overall.score;
    document.getElementById('riskLevel').textContent = overall.level;

    // 更新风险圆环
    const circle = document.getElementById('riskCircle');
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (overall.score / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    circle.style.stroke = overall.color;

    // 更新各项风险因素
    updateRiskFactor('cashFlowRisk', 'cashFlowBar', cashFlow);
    updateRiskFactor('leverageRisk', 'leverageBar', leverage);
    updateRiskFactor('marketRisk', 'marketBar', market);
}

/**
 * 更新单个风险因素
 */
function updateRiskFactor(scoreId, barId, riskData) {
    document.getElementById(scoreId).textContent = `${riskData.score}/100`;

    const bar = document.getElementById(barId);
    bar.style.width = `${riskData.score}%`;

    // 根据风险等级设置颜色
    if (riskData.score <= 40) {
        bar.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    } else if (riskData.score <= 70) {
        bar.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    } else {
        bar.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    }
}

/**
 * 渲染压力测试结果
 */
function renderStressTests(results) {
    // 房价下跌10%
    const stress1 = Calculator.stressTestPriceDrop(results, 10);
    document.getElementById('stress1').innerHTML = `
        <p>总收益: <strong style="color: ${stress1.totalProfit >= 0 ? '#10b981' : '#ef4444'}">${formatCurrency(stress1.totalProfit)}</strong></p>
        <p>回报率: <strong style="color: ${stress1.totalReturn >= 0 ? '#10b981' : '#ef4444'}">${formatPercent(stress1.totalReturn)}</strong></p>
        ${stress1.loss > 0 ? `<p style="color: #ef4444">亏损: ${formatCurrency(stress1.loss)}</p>` : ''}
    `;

    // 房价下跌20%
    const stress2 = Calculator.stressTestPriceDrop(results, 20);
    document.getElementById('stress2').innerHTML = `
        <p>总收益: <strong style="color: ${stress2.totalProfit >= 0 ? '#10b981' : '#ef4444'}">${formatCurrency(stress2.totalProfit)}</strong></p>
        <p>回报率: <strong style="color: ${stress2.totalReturn >= 0 ? '#10b981' : '#ef4444'}">${formatPercent(stress2.totalReturn)}</strong></p>
        ${stress2.loss > 0 ? `<p style="color: #ef4444">亏损: ${formatCurrency(stress2.loss)}</p>` : ''}
    `;

    // 租金下降20%
    const stress3 = Calculator.stressTestRentDrop(results, 20);
    document.getElementById('stress3').innerHTML = `
        <p>新月租: <strong>${stress3.newMonthlyRent.toFixed(0)} 元</strong></p>
        <p>新覆盖比: <strong style="color: ${stress3.newCoverageRatio >= 0.7 ? '#10b981' : '#ef4444'}">${stress3.newCoverageRatio.toFixed(2)}</strong></p>
        ${stress3.cashFlowGap > 0 ? `<p style="color: #f59e0b">月缺口: ${stress3.cashFlowGap.toFixed(0)} 元</p>` : ''}
        <p>总回报: <strong>${formatPercent(stress3.totalReturn)}</strong></p>
    `;

    // 利率上升2%
    const stress4 = Calculator.stressTestRateIncrease(results, 2);
    document.getElementById('stress4').innerHTML = `
        <p>新月供: <strong>${stress4.newMonthlyPayment.toFixed(0)} 元</strong></p>
        <p>月供增加: <strong style="color: #f59e0b">${stress4.paymentIncrease.toFixed(0)} 元</strong></p>
        <p>新覆盖比: <strong style="color: ${stress4.newCoverageRatio >= 0.7 ? '#10b981' : '#ef4444'}">${stress4.newCoverageRatio.toFixed(2)}</strong></p>
        <p>总回报: <strong>${formatPercent(stress4.totalReturn)}</strong></p>
    `;
}

/**
 * 渲染决策建议
 */
function renderAdvice(results, riskAssessment) {
    const advice = RiskAnalyzer.generateAdvice(results, riskAssessment);
    document.getElementById('adviceContent').innerHTML = advice;
}

/**
 * 渲染图表
 */
function renderChart(results) {
    const ctx = document.getElementById('profitChart').getContext('2d');

    // 销毁旧图表
    if (profitChart) {
        profitChart.destroy();
    }

    const { params, netRentIncome, appreciation } = results;
    const years = params.holdingYears;

    // 生成数据
    const labels = [];
    const rentData = [];
    const appreciationData = [];
    const totalData = [];

    for (let i = 1; i <= years; i++) {
        labels.push(`第${i}年`);
        const cumulativeRent = netRentIncome * i;
        const yearAppreciation = Calculator.calculateAppreciation(
            params.housePrice * 10000,
            params.appreciationRate / 100,
            i
        );
        rentData.push((cumulativeRent / 10000).toFixed(2));
        appreciationData.push((yearAppreciation / 10000).toFixed(2));
        totalData.push(((cumulativeRent + yearAppreciation) / 10000).toFixed(2));
    }

    profitChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '累计租金收益',
                    data: rentData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '房价增值',
                    data: appreciationData,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '总收益',
                    data: totalData,
                    borderColor: '#ec4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#f1f5f9',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.parsed.y} 万元`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#cbd5e1',
                        callback: function (value) {
                            return value + ' 万';
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                }
            }
        }
    });
}

/**
 * 执行完整计算并渲染结果
 */
function performCalculation() {
    const params = getInputParams();

    // 执行计算
    currentResults = Calculator.calculate(params);

    // 执行风险评估
    const riskAssessment = RiskAnalyzer.assessOverallRisk(currentResults);

    // 渲染所有结果
    renderMetrics(currentResults);
    renderRiskAssessment(riskAssessment);
    renderStressTests(currentResults);
    renderAdvice(currentResults, riskAssessment);
    renderChart(currentResults);

    // 显示结果区域
    document.getElementById('resultsContainer').style.display = 'grid';

    // 平滑滚动到结果区域
    document.getElementById('resultsContainer').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

/**
 * 初始化应用
 */
function initApp() {
    // 绑定计算按钮
    document.getElementById('calculateBtn').addEventListener('click', performCalculation);

    // 绑定输入框实时更新
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', updateHelperTexts);
    });

    // 初始化辅助文本
    updateHelperTexts();

    // 添加输入验证
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            const min = parseFloat(this.min);
            const max = parseFloat(this.max);
            let value = parseFloat(this.value);

            if (isNaN(value)) {
                this.value = this.defaultValue || 0;
            } else if (!isNaN(min) && value < min) {
                this.value = min;
            } else if (!isNaN(max) && value > max) {
                this.value = max;
            }

            updateHelperTexts();
        });
    });
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
