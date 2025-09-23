

import { Transaction, Category } from './data';
import { format, startOfMonth, getMonth, subMonths } from 'date-fns';
import { formatCurrency } from './utils';

const getDateFromTransaction = (date: string | { toDate: () => Date }): Date => {
  if (typeof date === 'object' && date && date.toDate) {
    return date.toDate();
  }
  return new Date(date as any);
}

export function calculateMetrics(transactions: Transaction[]) {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = startOfMonth(now);

  const balance = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  const monthlyIncome = transactions
    .filter((t) => {
      const tDate = getDateFromTransaction(t.date);
      return t.type === 'income' && tDate >= currentMonthStart;
    })
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpenses = transactions
    .filter((t) => {
      const tDate = getDateFromTransaction(t.date);
      return t.type === 'expense' && tDate >= currentMonthStart;
    })
    .reduce((acc, t) => acc + t.amount, 0);

  const lastMonthExpenses = transactions
    .filter((t) => {
      const tDate = getDateFromTransaction(t.date);
      return (
        t.type === 'expense' &&
        tDate >= lastMonthStart &&
        tDate < lastMonthEnd
      );
    })
    .reduce((acc, t) => acc + t.amount, 0);

  const expensesExceededIncome = monthlyExpenses > monthlyIncome && monthlyIncome > 0;
  const expensesExceededLastMonth = monthlyExpenses > lastMonthExpenses && lastMonthExpenses > 0;

  return {
    balance,
    monthlyIncome,
    monthlyExpenses,
    lastMonthExpenses,
    expensesExceededIncome,
    expensesExceededLastMonth,
  };
}

export function getMonthlyChartData(transactions: Transaction[]) {
  const monthlyData: { [key: string]: { month: string, income: number, expenses: number } } = {};

  transactions.forEach(t => {
    const tDate = getDateFromTransaction(t.date);
    const month = format(tDate, 'MMM');
    if (!monthlyData[month]) {
      monthlyData[month] = { month, income: 0, expenses: 0 };
    }
    if (t.type === 'income') {
      monthlyData[month].income += t.amount;
    } else {
      monthlyData[month].expenses += t.amount;
    }
  });

  return Object.values(monthlyData).sort((a, b) => {
    const monthA = new Date(Date.parse(a.month +" 1, 2012")).getMonth();
    const monthB = new Date(Date.parse(b.month +" 1, 2012")).getMonth();
    return monthA - monthB;
  });
}

export function getExpenseHistoryChartData(transactions: Transaction[]) {
  const expenseData: { [key: string]: { month: string, expenses: number } } = {};
  const sixMonthsAgo = subMonths(new Date(), 5);
  sixMonthsAgo.setDate(1);

  // Initialize last 6 months
  for (let i = 0; i < 6; i++) {
    const monthKey = format(subMonths(new Date(), i), 'yyyy-MM');
    const monthName = format(subMonths(new Date(), i), 'MMM');
    expenseData[monthKey] = { month: monthName, expenses: 0 };
  }
  
  transactions
    .filter(t => t.type === 'expense' && getDateFromTransaction(t.date) >= sixMonthsAgo)
    .forEach(t => {
      const tDate = getDateFromTransaction(t.date);
      const monthKey = format(tDate, 'yyyy-MM');
      if (expenseData[monthKey]) {
        expenseData[monthKey].expenses += t.amount;
      }
    });

  return Object.values(expenseData).reverse();
}

export function getCategoryChartData(transactions: Transaction[], categories: Category[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
  
    const categorySpending: { [key: string]: number } = {};
  
    transactions
      .filter(t => {
        const tDate = getDateFromTransaction(t.date);
        return t.type === 'expense' &&
               tDate.getMonth() === currentMonth &&
               tDate.getFullYear() === currentYear;
      })
      .forEach(t => {
        if (!categorySpending[t.categoryId]) {
          categorySpending[t.categoryId] = 0;
        }
        categorySpending[t.categoryId] += t.amount;
      });
  
    return Object.entries(categorySpending)
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          name: category ? category.name : 'Uncategorized',
          value: amount,
        };
      })
      .sort((a, b) => b.value - a.value);
  }

export type RuleBasedInsights = {
    warnings: string[];
    opportunities: string[];
    investmentIdeas: string[];
};

export function generateRuleBasedInsights(transactions: Transaction[], categories: Category[]): RuleBasedInsights {
    const warnings: string[] = [];
    const opportunities: string[] = [];
    const investmentIdeas: string[] = [];
    
    const { monthlyExpenses, monthlyIncome, lastMonthExpenses } = calculateMetrics(transactions);
    const categoryChartData = getCategoryChartData(transactions, categories);

    if (monthlyExpenses > monthlyIncome && monthlyIncome > 0) {
        warnings.push(`Suas despesas (${formatCurrency(monthlyExpenses)}) ultrapassaram sua renda este mês.`);
    }

    if (monthlyExpenses > lastMonthExpenses && lastMonthExpenses > 0) {
        const increase = ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
        warnings.push(`Seus gastos aumentaram ${increase.toFixed(0)}% em comparação com o mês passado.`);
    }

    if (categoryChartData.length > 0) {
        const topCategory = categoryChartData[0];
        const totalExpenses = categoryChartData.reduce((acc, cat) => acc + cat.value, 0);
        const topCategoryPercentage = (topCategory.value / totalExpenses) * 100;

        if (topCategoryPercentage > 35) {
            warnings.push(`${topCategoryPercentage.toFixed(0)}% dos seus gastos mensais estão concentrados em "${topCategory.name}".`);
        }
        
        opportunities.push(`Sua maior despesa este mês foi com "${topCategory.name}". Avalie esses gastos para encontrar possíveis economias.`);
    }

    if (transactions.length < 15) {
        opportunities.push("Continue adicionando suas transações para receber insights cada vez mais precisos sobre seus hábitos financeiros.");
    } else {
         opportunities.push("Considere criar metas de orçamento para suas principais categorias de despesa para ter um controle ainda maior.");
    }
    
    const savings = monthlyIncome - monthlyExpenses;
    if (savings > 0 && monthlyIncome > 0) {
        const savingRate = (savings / monthlyIncome) * 100;
        opportunities.push(`Você economizou ${savingRate.toFixed(0)}% da sua renda este mês. Parabéns!`);
    }

    if (savings < 0 || monthlyExpenses > monthlyIncome * 0.8) {
      investmentIdeas.push("Seu foco principal deve ser criar ou fortalecer sua reserva de emergência. Tente guardar o equivalente a 3-6 meses de suas despesas.");
      investmentIdeas.push("Para a reserva de emergência, estude investimentos de baixíssimo risco com liquidez diária, como Tesouro Selic ou CDBs de grandes bancos.");
    } else {
      investmentIdeas.push("Com as contas sob controle, você pode começar a diversificar. Estude sobre fundos de investimento ou ETFs que replicam índices da bolsa.");
      investmentIdeas.push("Considere definir metas de longo prazo (aposentadoria, compra de imóvel) e pesquisar investimentos que se alinhem a esses objetivos.");
    }

    if (warnings.length === 0) {
        warnings.push("Nenhum alerta crítico este mês. Excelente controle financeiro!");
    }

    return { warnings, opportunities, investmentIdeas };
}

export type FinancialHealth = {
    score: number;
    description: string;
    emoji: string;
}

export function calculateFinancialHealthScore(transactions: Transaction[]): FinancialHealth {
    let score = 0;
    const { monthlyIncome, monthlyExpenses } = calculateMetrics(transactions);

    // 1. Savings Rate (50 points)
    if (monthlyIncome > 0) {
        const savingsRate = (monthlyIncome - monthlyExpenses) / monthlyIncome;
        if (savingsRate >= 0.3) score += 50; // saving 30% or more
        else if (savingsRate >= 0.1) score += 30; // saving 10%-30%
        else if (savingsRate > 0) score += 15; // saving something
    }

    // 2. Expense Control (30 points)
    const { lastMonthExpenses } = calculateMetrics(transactions);
    if (lastMonthExpenses > 0) {
      if (monthlyExpenses <= lastMonthExpenses) score += 30;
      else if (monthlyExpenses <= lastMonthExpenses * 1.1) score += 15; // increased by less than 10%
    } else {
      score += 15; // No historical data, give half points
    }

    // 3. Transaction consistency (20 points)
    if (transactions.length > 20) score += 20;
    else if (transactions.length > 10) score += 10;
    else if (transactions.length > 5) score += 5;
    
    score = Math.round(score);

    if (score >= 80) return { score, description: "Excelente", emoji: "🏆" };
    if (score >= 60) return { score, description: "Bom", emoji: "👍" };
    if (score >= 40) return { score, description: "Regular", emoji: "😐" };
    return { score, description: "Precisa de Atenção", emoji: "😟" };
}
