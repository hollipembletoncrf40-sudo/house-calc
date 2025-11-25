/**
 * 买房投资计算器 - 核心计算模块
 * 负责所有财务计算逻辑
 */

const Calculator = {
    /**
     * 计算月供（等额本息）
     * @param {number} principal - 贷款本金（元）
     * @param {number} annualRate - 年利率（小数形式，如 0.041）
     * @param {number} years - 贷款年限
     * @returns {number} 月供金额（元）
     */
    calculateMonthlyPayment(principal, annualRate, years) {
        if (principal <= 0 || years <= 0) return 0;
        if (annualRate === 0) return principal / (years * 12);
        
        const monthlyRate = annualRate / 12;
        const months = years * 12;
        const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                       (Math.pow(1 + monthlyRate, months) - 1);
        
        return payment;
    },

    /**
     * 计算总利息
     * @param {number} monthlyPayment - 月供
     * @param {number} years - 贷款年限
     * @param {number} principal - 贷款本金
     * @returns {number} 总利息
     */
    calculateTotalInterest(monthlyPayment, years, principal) {
        const totalPayment = monthlyPayment * years * 12;
        return totalPayment - principal;
    },

    /**
     * 计算年租金净收入
     * @param {number} monthlyRent - 月租金
     * @param {number} costRatio - 持有成本比例（小数形式）
     * @returns {number} 年租金净收入
     */
    calculateNetRentIncome(monthlyRent, costRatio) {
        const yearlyRent = monthlyRent * 12;
        const costs = yearlyRent * costRatio;
        return yearlyRent - costs;
    },

    /**
     * 计算现金回报率
     * @param {number} netRentIncome - 年租金净收入
     * @param {number} downPayment - 首付金额
     * @returns {number} 现金回报率（百分比）
     */
    calculateCashReturn(netRentIncome, downPayment) {
        if (downPayment <= 0) return 0;
        return (netRentIncome / downPayment) * 100;
    },

    /**
     * 计算房价增值
     * @param {number} housePrice - 初始房价
     * @param {number} appreciationRate - 年涨幅（小数形式）
     * @param {number} years - 持有年限
     * @returns {number} 房价增值金额
     */
    calculateAppreciation(housePrice, appreciationRate, years) {
        const futurePrice = housePrice * Math.pow(1 + appreciationRate, years);
        return futurePrice - housePrice;
    },

    /**
     * 计算综合回报率
     * @param {number} appreciation - 房价增值
     * @param {number} netRentIncome - 年租金净收入
     * @param {number} years - 持有年限
     * @param {number} downPayment - 首付金额
     * @returns {object} { totalReturn: 总回报率, annualReturn: 年化回报率 }
     */
    calculateTotalReturn(appreciation, netRentIncome, years, downPayment) {
        if (downPayment <= 0) return { totalReturn: 0, annualReturn: 0 };
        
        const totalProfit = appreciation + (netRentIncome * years);
        const totalReturn = (totalProfit / downPayment) * 100;
        const annualReturn = totalReturn / years;
        
        return { totalReturn, annualReturn };
    },

    /**
     * 计算月供覆盖比
     * @param {number} monthlyRent - 月租金
     * @param {number} monthlyPayment - 月供
     * @returns {number} 月供覆盖比
     */
    calculateCoverageRatio(monthlyRent, monthlyPayment) {
        if (monthlyPayment <= 0) return 0;
        return monthlyRent / monthlyPayment;
    },

    /**
     * 执行完整计算
     * @param {object} params - 所有输入参数
     * @returns {object} 所有计算结果
     */
    calculate(params) {
        const {
            housePrice,        // 万元
            downPaymentRatio,  // 百分比
            loanYears,
            interestRate,      // 百分比
            monthlyRent,       // 元
            costRatio,         // 百分比
            appreciationRate,  // 百分比
            holdingYears,
            emergencyFund,     // 万元
            monthlyIncome      // 元
        } = params;

        // 转换单位和格式
        const housePriceYuan = housePrice * 10000;
        const downPayment = housePriceYuan * (downPaymentRatio / 100);
        const loanAmount = housePriceYuan - downPayment;
        const annualRate = interestRate / 100;
        const costRatioDecimal = costRatio / 100;
        const appreciationRateDecimal = appreciationRate / 100;

        // 计算月供
        const monthlyPayment = this.calculateMonthlyPayment(loanAmount, annualRate, loanYears);

        // 计算总利息
        const totalInterest = this.calculateTotalInterest(monthlyPayment, loanYears, loanAmount);

        // 计算租金收益
        const netRentIncome = this.calculateNetRentIncome(monthlyRent, costRatioDecimal);
        const cashReturn = this.calculateCashReturn(netRentIncome, downPayment);

        // 计算房价增值
        const appreciation = this.calculateAppreciation(housePriceYuan, appreciationRateDecimal, holdingYears);

        // 计算综合回报
        const { totalReturn, annualReturn } = this.calculateTotalReturn(
            appreciation, 
            netRentIncome, 
            holdingYears, 
            downPayment
        );

        // 计算月供覆盖比
        const coverageRatio = this.calculateCoverageRatio(monthlyRent, monthlyPayment);

        // 计算总收益
        const totalProfit = appreciation + (netRentIncome * holdingYears);

        return {
            // 基础数据
            downPayment,
            loanAmount,
            monthlyPayment,
            totalInterest,
            
            // 收益指标
            netRentIncome,
            cashReturn,
            appreciation,
            totalReturn,
            annualReturn,
            totalProfit,
            coverageRatio,
            
            // 用于风险评估
            emergencyFund: emergencyFund * 10000,
            monthlyIncome,
            
            // 原始参数（用于压力测试）
            params
        };
    },

    /**
     * 压力测试：房价下跌情景
     * @param {object} results - 原始计算结果
     * @param {number} dropPercent - 下跌百分比
     * @returns {object} 压力测试结果
     */
    stressTestPriceDrop(results, dropPercent) {
        const { params, netRentIncome, downPayment } = results;
        const housePriceYuan = params.housePrice * 10000;
        const newPrice = housePriceYuan * (1 - dropPercent / 100);
        const appreciation = newPrice - housePriceYuan;
        const totalProfit = appreciation + (netRentIncome * params.holdingYears);
        const totalReturn = (totalProfit / downPayment) * 100;
        
        return {
            appreciation,
            totalProfit,
            totalReturn,
            loss: appreciation < 0 ? Math.abs(appreciation) : 0,
            lossRatio: (appreciation / downPayment) * 100
        };
    },

    /**
     * 压力测试：租金下降情景
     * @param {object} results - 原始计算结果
     * @param {number} dropPercent - 下降百分比
     * @returns {object} 压力测试结果
     */
    stressTestRentDrop(results, dropPercent) {
        const { params, appreciation, downPayment, monthlyPayment } = results;
        const newMonthlyRent = params.monthlyRent * (1 - dropPercent / 100);
        const newNetRentIncome = this.calculateNetRentIncome(
            newMonthlyRent, 
            params.costRatio / 100
        );
        const newCoverageRatio = this.calculateCoverageRatio(newMonthlyRent, monthlyPayment);
        const totalProfit = appreciation + (newNetRentIncome * params.holdingYears);
        const totalReturn = (totalProfit / downPayment) * 100;
        
        return {
            newMonthlyRent,
            newNetRentIncome,
            newCoverageRatio,
            totalProfit,
            totalReturn,
            cashFlowGap: monthlyPayment - newMonthlyRent
        };
    },

    /**
     * 压力测试：利率上升情景
     * @param {object} results - 原始计算结果
     * @param {number} rateIncrease - 利率上升百分点
     * @returns {object} 压力测试结果
     */
    stressTestRateIncrease(results, rateIncrease) {
        const { params, appreciation, netRentIncome, downPayment } = results;
        const loanAmount = params.housePrice * 10000 * (1 - params.downPaymentRatio / 100);
        const newRate = (params.interestRate + rateIncrease) / 100;
        const newMonthlyPayment = this.calculateMonthlyPayment(loanAmount, newRate, params.loanYears);
        const paymentIncrease = newMonthlyPayment - results.monthlyPayment;
        const newCoverageRatio = this.calculateCoverageRatio(params.monthlyRent, newMonthlyPayment);
        const additionalCost = paymentIncrease * 12 * params.holdingYears;
        const totalProfit = appreciation + (netRentIncome * params.holdingYears) - additionalCost;
        const totalReturn = (totalProfit / downPayment) * 100;
        
        return {
            newMonthlyPayment,
            paymentIncrease,
            newCoverageRatio,
            additionalCost,
            totalProfit,
            totalReturn
        };
    }
};

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculator;
}
