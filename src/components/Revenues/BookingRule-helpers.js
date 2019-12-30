// BookingRule-helpers.js
export const newRuleOrder = (newRule, revenueRules = []) => {
    const rules = revenueRules.map(rule => JSON.parse(rule.data));
    const relevantRules = rules.filter(rule => rule.account === newRule.account && rule.isPositive === newRule.isPositive);
    const maxOrder = relevantRules.reduce((oldMaxOrder, rule) => {
        const order = rule.order || 0;
        return order > oldMaxOrder ? order : oldMaxOrder
    }, 0);
    return maxOrder + 1;
}

export const inSameGroup = (ruleA, ruleB) => {
    const dataA = ruleA && ruleA.data;
    const dataB = ruleB && ruleB.data;
    return dataA && dataB && dataA.account === dataB.account && dataA.isPositive === dataB.isPositive;
}

export const ruleSort = (aRule, bRule) => {
    const a = aRule.data;
    const b = bRule.data;
    const aKey = a.account + a.isPositive + a.order;
    const bKey = b.account + b.isPositive + b.order;
    return aKey > bKey ? 1
        : aKey < bKey ? -1
            : 0;
}