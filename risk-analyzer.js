/**
 * 买房投资计算器 - 风险分析模块
 * 负责风险评估和建议生成
 */

const RiskAnalyzer = {
    /**
     * 评估现金流风险
     * @param {object} results - 计算结果
     * @returns {object} { score: 风险分数, level: 风险等级, factors: 因素说明 }
     */
    assessCashFlowRisk(results) {
        const { coverageRatio, monthlyPayment, emergencyFund, monthlyIncome } = results;
        let score = 0;
        const factors = [];

        // 1. 月供覆盖比评估 (40分权重)
        if (coverageRatio >= 1.3) {
            score += 0;
            factors.push('✅ 租金可充分覆盖月供，现金流健康');
        } else if (coverageRatio >= 0.7) {
            score += 20;
            factors.push('⚠️ 租金基本覆盖月供，但缓冲空间有限');
        } else {
            score += 40;
            factors.push('❌ 租金无法覆盖月供，需持续补贴');
        }

        // 2. 紧急备用金评估 (30分权重)
        const monthsOfReserve = emergencyFund / monthlyPayment;
        if (monthsOfReserve >= 24) {
            score += 0;
            factors.push(`✅ 备用金充足（可支撑${Math.floor(monthsOfReserve)}个月）`);
        } else if (monthsOfReserve >= 12) {
            score += 15;
            factors.push(`⚠️ 备用金良好（可支撑${Math.floor(monthsOfReserve)}个月）`);
        } else {
            score += 30;
            factors.push(`❌ 备用金不足（仅可支撑${Math.floor(monthsOfReserve)}个月）`);
        }

        // 3. 收入负债比评估 (30分权重)
        const debtToIncomeRatio = monthlyPayment / monthlyIncome;
        if (debtToIncomeRatio <= 0.3) {
            score += 0;
            factors.push(`✅ 月供占收入${(debtToIncomeRatio * 100).toFixed(1)}%，压力较小`);
        } else if (debtToIncomeRatio <= 0.5) {
            score += 15;
            factors.push(`⚠️ 月供占收入${(debtToIncomeRatio * 100).toFixed(1)}%，压力适中`);
        } else {
            score += 30;
            factors.push(`❌ 月供占收入${(debtToIncomeRatio * 100).toFixed(1)}%，压力较大`);
        }

        const level = score <= 20 ? '低风险' : score <= 50 ? '中风险' : '高风险';

        return { score, level, factors };
    },

    /**
     * 评估杠杆风险
     * @param {object} results - 计算结果
     * @returns {object} { score: 风险分数, level: 风险等级, factors: 因素说明 }
     */
    assessLeverageRisk(results) {
        const { params, downPayment, loanAmount } = results;
        const housePriceYuan = params.housePrice * 10000;
        let score = 0;
        const factors = [];

        // 1. 首付比例评估 (50分权重)
        const downPaymentRatio = params.downPaymentRatio;
        if (downPaymentRatio >= 50) {
            score += 0;
            factors.push(`✅ 首付比例${downPaymentRatio}%，杠杆适中`);
        } else if (downPaymentRatio >= 30) {
            score += 25;
            factors.push(`⚠️ 首付比例${downPaymentRatio}%，杠杆较高`);
        } else {
            score += 50;
            factors.push(`❌ 首付比例${downPaymentRatio}%，杠杆过高`);
        }

        // 2. 负债率评估 (50分权重)
        const ltvRatio = (loanAmount / housePriceYuan) * 100;
        if (ltvRatio <= 50) {
            score += 0;
            factors.push(`✅ 负债率${ltvRatio.toFixed(1)}%，安全边际高`);
        } else if (ltvRatio <= 70) {
            score += 25;
            factors.push(`⚠️ 负债率${ltvRatio.toFixed(1)}%，安全边际适中`);
        } else {
            score += 50;
            factors.push(`❌ 负债率${ltvRatio.toFixed(1)}%，安全边际低`);
        }

        const level = score <= 25 ? '低风险' : score <= 60 ? '中风险' : '高风险';

        return { score, level, factors };
    },

    /**
     * 评估市场风险
     * @param {object} results - 计算结果
     * @returns {object} { score: 风险分数, level: 风险等级, factors: 因素说明 }
     */
    assessMarketRisk(results) {
        const { params, downPayment } = results;
        let score = 0;
        const factors = [];

        // 1. 房价波动承受能力 (60分权重)
        const drop10 = Calculator.stressTestPriceDrop(results, 10);
        const drop20 = Calculator.stressTestPriceDrop(results, 20);

        if (drop20.lossRatio > -50) {
            score += 0;
            factors.push('✅ 可承受20%房价下跌，抗风险能力强');
        } else if (drop10.lossRatio > -50) {
            score += 30;
            factors.push('⚠️ 可承受10%房价下跌，抗风险能力一般');
        } else {
            score += 60;
            factors.push('❌ 房价下跌10%即面临较大损失');
        }

        // 2. 预期涨幅合理性 (40分权重)
        const appreciationRate = params.appreciationRate;
        if (appreciationRate <= 5) {
            score += 0;
            factors.push(`✅ 预期年涨幅${appreciationRate}%，较为保守合理`);
        } else if (appreciationRate <= 10) {
            score += 20;
            factors.push(`⚠️ 预期年涨幅${appreciationRate}%，需谨慎评估`);
        } else {
            score += 40;
            factors.push(`❌ 预期年涨幅${appreciationRate}%，过于乐观`);
        }

        const level = score <= 30 ? '低风险' : score <= 65 ? '中风险' : '高风险';

        return { score, level, factors };
    },

    /**
     * 综合风险评估
     * @param {object} results - 计算结果
     * @returns {object} 完整的风险评估报告
     */
    assessOverallRisk(results) {
        const cashFlowRisk = this.assessCashFlowRisk(results);
        const leverageRisk = this.assessLeverageRisk(results);
        const marketRisk = this.assessMarketRisk(results);

        // 加权计算综合风险分数
        const overallScore = Math.round(
            cashFlowRisk.score * 0.4 +
            leverageRisk.score * 0.3 +
            marketRisk.score * 0.3
        );

        let overallLevel, overallColor;
        if (overallScore <= 40) {
            overallLevel = '低风险';
            overallColor = '#10b981';
        } else if (overallScore <= 70) {
            overallLevel = '中风险';
            overallColor = '#f59e0b';
        } else {
            overallLevel = '高风险';
            overallColor = '#ef4444';
        }

        return {
            overall: {
                score: overallScore,
                level: overallLevel,
                color: overallColor
            },
            cashFlow: cashFlowRisk,
            leverage: leverageRisk,
            market: marketRisk
        };
    },

    /**
     * 生成投资建议
     * @param {object} results - 计算结果
     * @param {object} riskAssessment - 风险评估结果
     * @returns {string} HTML格式的建议内容
     */
    generateAdvice(results, riskAssessment) {
        const { cashReturn, annualReturn, coverageRatio } = results;
        const { overall, cashFlow, leverage, market } = riskAssessment;

        let advice = '';

        // 1. 总体评价
        if (overall.score <= 40) {
            advice += `<h3 style="color: #10b981;">✅ 总体评价：投资方案较为稳健</h3>`;
            advice += `<p>该投资方案风险可控，现金流健康，具备较好的投资价值。</p>`;
        } else if (overall.score <= 70) {
            advice += `<h3 style="color: #f59e0b;">⚠️ 总体评价：投资方案存在一定风险</h3>`;
            advice += `<p>该投资方案有一定风险，建议优化部分参数或增加安全垫后再决策。</p>`;
        } else {
            advice += `<h3 style="color: #ef4444;">❌ 总体评价：投资方案风险较高</h3>`;
            advice += `<p>该投资方案风险较高，不建议在当前条件下投资，建议重新评估或改善财务状况。</p>`;
        }

        // 2. 收益分析
        advice += `<h3>💰 收益分析</h3><ul>`;
        advice += `<li>现金回报率 <span class="highlight">${cashReturn.toFixed(2)}%</span>`;
        if (cashReturn >= 5) {
            advice += ` - 租金收益良好，超过多数理财产品`;
        } else if (cashReturn >= 3) {
            advice += ` - 租金收益一般，与银行理财相当`;
        } else {
            advice += ` - 租金收益较低，投资属性不强`;
        }
        advice += `</li>`;

        advice += `<li>年化综合收益率 <span class="highlight">${annualReturn.toFixed(2)}%</span>`;
        if (annualReturn >= 10) {
            advice += ` - 综合收益优秀，显著高于通胀`;
        } else if (annualReturn >= 5) {
            advice += ` - 综合收益良好，可跑赢通胀`;
        } else if (annualReturn >= 0) {
            advice += ` - 综合收益一般，需谨慎评估`;
        } else {
            advice += ` - <span class="danger">预期亏损，不建议投资</span>`;
        }
        advice += `</li></ul>`;

        // 3. 风险提示
        advice += `<h3>⚠️ 风险提示</h3><ul>`;

        if (cashFlow.score > 40) {
            advice += `<li><span class="warning">现金流风险较高</span>`;
            if (coverageRatio < 0.7) {
                advice += ` - 建议提高租金或增加首付以降低月供`;
            }
            if (results.emergencyFund / results.monthlyPayment < 12) {
                advice += ` - 建议增加紧急备用金至少12个月月供`;
            }
            advice += `</li>`;
        }

        if (leverage.score > 50) {
            advice += `<li><span class="warning">杠杆风险较高</span> - 建议提高首付比例至40%以上</li>`;
        }

        if (market.score > 50) {
            advice += `<li><span class="warning">市场风险较高</span> - 预期涨幅可能过于乐观，建议采用更保守的预期</li>`;
        }

        advice += `</ul>`;

        // 4. 行动建议
        advice += `<h3>💡 行动建议</h3><ul>`;

        if (overall.score <= 40) {
            advice += `<li>✅ 可以考虑投资，但仍需关注市场变化</li>`;
            advice += `<li>✅ 建议选择核心地段、配套成熟的房产</li>`;
            advice += `<li>✅ 保持充足的现金储备应对突发情况</li>`;
        } else if (overall.score <= 70) {
            advice += `<li>⚠️ 建议优化投资方案后再决策</li>`;
            if (cashFlow.score > 40) {
                advice += `<li>⚠️ 优先改善现金流状况（提高租金或降低月供）</li>`;
            }
            if (leverage.score > 50) {
                advice += `<li>⚠️ 考虑增加首付降低杠杆风险</li>`;
            }
            advice += `<li>⚠️ 确保有足够的紧急备用金（至少24个月月供）</li>`;
        } else {
            advice += `<li>❌ 不建议在当前条件下投资</li>`;
            advice += `<li>❌ 建议先改善财务状况，增加储蓄</li>`;
            advice += `<li>❌ 或者寻找总价更低、租金回报更高的房产</li>`;
            advice += `<li>❌ 避免在市场高位追涨</li>`;
        }

        advice += `</ul>`;

        // 5. 投资格言
        advice += `<p style="margin-top: 1.5rem; padding: 1rem; background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; border-radius: 0.5rem; font-style: italic;">`;
        advice += `"先求不败，而后求胜。做好最坏的打算，您的投资之路才会更稳健。"`;
        advice += `</p>`;

        return advice;
    }
};

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RiskAnalyzer;
}
