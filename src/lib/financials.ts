import { Transaction, Category } from './data';
import { subMonths, format, parseISO, startOfMonth, endOfMonth, isWithinInterval, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- CONSTANTS --- //
const INSIGHTS_THRESHOLDS = {
  HIGH_EXPENSE_RATIO: 0.8,
  HIGH_CATEGORY_EXPENSE_RATIO: 0.3, 
  MINIMUM_SAVINGS_FOR_OPPORTUNITY: 250, 
};
const HEALTH_SCORE_BOUNDARIES = [
  { threshold: 0.5, score: 100, description: 'Excelente', emoji: '🚀' },
  { threshold: 0.2, score: 80, description: 'Muito Boa', emoji: '😄' },
  { threshold: 0.1, score: 60, description: 'Boa', emoji: '😊' },
  { threshold: 0.0, score: 40, description: 'Regular', emoji: '😐' },
  { threshold: -0.1, score: 20, description: 'Atenção', emoji: '😟' },
  { threshold: -Infinity, score: 10, description: 'Crítica', emoji: '🚨' },
];
const DEFAULT_CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

// --- HELPERS --- //

function getDate(dateInput: any): Date | null {
  if (!dateInput) return null;

  let date: Date;
  if (typeof dateInput === 'object' && 'toDate' in dateInput) {
    date = dateInput.toDate();
  } else if (typeof dateInput === 'string') {
    date = parseISO(dateInput);
  } else {
    date = new Date(dateInput);
  }

  return isValid(date) ? date : null;
}

// --- CORE METRICS --- //

export function calculateMetrics(transactions: Transaction[], referenceDate: Date) {
  const emptyMetrics = { balance: 0, monthlyIncome: 0, monthlyExpenses: 0, previousMonthlyIncome: 0, previousMonthlyExpenses: 0 };
  if (!isValid(referenceDate)) return emptyMetrics;

  const balance = transactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
  if (transactions.length === 0) return { ...emptyMetrics, balance };

  const thisMonthInterval = { start: startOfMonth(referenceDate), end: endOfMonth(referenceDate) };
  const lastMonthReference = subMonths(referenceDate, 1);
  const lastMonthInterval = { start: startOfMonth(lastMonthReference), end: endOfMonth(lastMonthReference) };

  const thisMonthTransactions = transactions.filter(t => {
      const date = getDate(t.date);
      return date && isWithinInterval(date, thisMonthInterval);
  });
  const lastMonthTransactions = transactions.filter(t => {
      const date = getDate(t.date);
      return date && isWithinInterval(date, lastMonthInterval);
  });

  const monthlyIncome = thisMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = thisMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const previousMonthlyIncome = lastMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const previousMonthlyExpenses = lastMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  return { balance, monthlyIncome, monthlyExpenses, previousMonthlyIncome, previousMonthlyExpenses };
}

// --- CHART DATA GENERATION --- //

export function getMonthlyChartData(transactions: Transaction[], referenceDate: Date) {
  if (!isValid(referenceDate)) return [];

  const monthlyData = new Map<string, { income: number; fixed: number; variable: number }>();

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(referenceDate, i);
    const key = format(date, 'yyyy-MM');
    monthlyData.set(key, { income: 0, fixed: 0, variable: 0 });
  }

  transactions.forEach(t => {
    const date = getDate(t.date);
    if (!date) return;

    const key = format(date, 'yyyy-MM');
    if (monthlyData.has(key)) {
      const currentData = monthlyData.get(key)!;
      if (t.type === 'income') {
        currentData.income += t.amount;
      } else if (t.type === 'expense') {
        if (t.expenseType === 'fixed') {
          currentData.fixed += t.amount;
        } else if (t.expenseType === 'variable') {
          currentData.variable += t.amount;
        }
      }
    }
  });

  return Array.from(monthlyData.entries()).map(([key, data]) => {
    const monthLabel = format(parseISO(`${key}-01`), 'MMM', { locale: ptBR });
    return {
        month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        ...data,
    };
  });
}

export function getCategoryDistributionData(transactions: Transaction[], categories: Category[], referenceDate: Date) {
  if (categories.length === 0 || !isValid(referenceDate)) return [];

  const monthInterval = { start: startOfMonth(referenceDate), end: endOfMonth(referenceDate) };
  const thisMonthExpenses = transactions.filter(t => {
    const date = getDate(t.date);
    return t.type === 'expense' && date && isWithinInterval(date, monthInterval);
  });

  if (thisMonthExpenses.length === 0) return [];

  const expenseByCategory = new Map<string, number>();
  thisMonthExpenses.forEach(t => {
      expenseByCategory.set(t.categoryId, (expenseByCategory.get(t.categoryId) || 0) + t.amount);
    });
  
  return Array.from(expenseByCategory.entries()).map(([categoryId, amount], index) => {
    const category = categories.find(c => c.id === categoryId);
    return {
      name: category?.name || 'Outros',
      value: amount,
      fill: category?.color || DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length], 
    };
  }).sort((a, b) => b.value - a.value);
}

export function getExpenseBreakdownData(transactions: Transaction[], referenceDate: Date) {
  if (transactions.length === 0 || !isValid(referenceDate)) return [];

  const monthInterval = { start: startOfMonth(referenceDate), end: endOfMonth(referenceDate) };
  const thisMonthExpenses = transactions.filter(t => {
    const date = getDate(t.date);
    return t.type === 'expense' && date && isWithinInterval(date, monthInterval);
  });

  if (thisMonthExpenses.length === 0) return [];

  const breakdown = {
    fixed: 0,
    variable: 0,
  };

  thisMonthExpenses.forEach(t => {
    if (t.expenseType === 'fixed') {
      breakdown.fixed += t.amount;
    } else if (t.expenseType === 'variable') {
      breakdown.variable += t.amount;
    }
  });
  
  const monthLabel = format(referenceDate, 'MMM', { locale: ptBR });
  const formattedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return [{
      month: formattedMonth,
      fixed: breakdown.fixed,
      variable: breakdown.variable
  }];
}

export function getIncomeSourcesData(transactions: Transaction[], referenceDate: Date) {
  if (transactions.length === 0 || !isValid(referenceDate)) return [];

  const monthInterval = { start: startOfMonth(referenceDate), end: endOfMonth(referenceDate) };
  const thisMonthIncomes = transactions.filter(t => {
    const date = getDate(t.date);
    return t.type === 'income' && date && isWithinInterval(date, monthInterval);
  });

  if (thisMonthIncomes.length === 0) return [];

  const incomeBySource = new Map<string, number>();
  thisMonthIncomes.forEach(t => {
      const sourceName = t.description || 'Fonte Desconhecida';
      incomeBySource.set(sourceName, (incomeBySource.get(sourceName) || 0) + t.amount);
    });
  
  return Array.from(incomeBySource.entries()).map(([name, amount], index) => ({
    name,
    value: amount,
    fill: DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length],
  })).sort((a,b) => b.value - a.value);
}

// --- FINANCIAL INSIGHTS & HEALTH --- //

export interface RuleBasedInsights { warnings: string[]; opportunities: string[]; investmentIdeas: string[]; }

export function generateRuleBasedInsights(transactions: Transaction[], categories: Category[], referenceDate: Date): RuleBasedInsights {
  const emptyInsights = { warnings: ['Nenhum dado para este mês.'], opportunities: [], investmentIdeas: [] };
  if (!isValid(referenceDate)) return emptyInsights;

  const monthInterval = { start: startOfMonth(referenceDate), end: endOfMonth(referenceDate) };
  const thisMonthTransactions = transactions.filter(t => {
      const date = getDate(t.date);
      return date && isWithinInterval(date, monthInterval);
  });

  if (thisMonthTransactions.length === 0) {
      return { warnings: ['Nenhum dado para este mês. Selecione outro período para ver os insights.'], opportunities: [], investmentIdeas: [] };
  }

  const totalIncome = thisMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = thisMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  const warnings: string[] = [];
  const opportunities: string[] = [];
  const investmentIdeas: string[] = [];

  const expenseRatio = totalIncome > 0 ? totalExpenses / totalIncome : 0;
  if (expenseRatio > INSIGHTS_THRESHOLDS.HIGH_EXPENSE_RATIO) {
    warnings.push(`Sua taxa de despesas está alta (${(expenseRatio * 100).toFixed(0)}%) em comparação com sua renda.`);
  }

  const expenseByCategory: { [key: string]: number } = {};
  thisMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
      expenseByCategory[t.categoryId] = (expenseByCategory[t.categoryId] || 0) + t.amount;
    });

  for (const categoryId in expenseByCategory) {
    const categoryTotal = expenseByCategory[categoryId];
    const category = categories.find(c => c.id === categoryId);
    if (category && totalExpenses > 0 && categoryTotal / totalExpenses > INSIGHTS_THRESHOLDS.HIGH_CATEGORY_EXPENSE_RATIO) {
      warnings.push(`Gastos elevados na categoria "${category.name}". Considere revisar suas despesas.`);
    }
  }

  const savings = totalIncome - totalExpenses;
  if (savings > INSIGHTS_THRESHOLDS.MINIMUM_SAVINGS_FOR_OPPORTUNITY) {
    opportunities.push(`Você economizou ${savings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}! Ótimo trabalho.`);
    investmentIdeas.push('Pequenos investimentos regulares em um fundo de índice (ETF) podem ser um bom começo.');
  } else if (totalIncome > 0 && savings <= 0) {
    warnings.push('Você gastou mais do que ganhou neste mês. Reavalie seu orçamento.');
  }

  investmentIdeas.push('Manter uma boa saúde financeira é a chave para realizar seus sonhos. Estamos de olho para te ajudar com ideias.');
  if (warnings.length === 0) warnings.push('Nenhum aviso crítico este mês. Continue assim!');
  if (opportunities.length === 0) opportunities.push('Continue focado em seus objetivos financeiros. Cada pequena economia conta!');

  return { warnings, opportunities, investmentIdeas };
}

export interface FinancialHealth { score: number; description: string; emoji: string; }

export function calculateFinancialHealthScore(transactions: Transaction[], referenceDate: Date): FinancialHealth {
    const defaultHealth = { score: 0, description: "Indisponível", emoji: "📊" };
    if (!isValid(referenceDate)) return defaultHealth;

    const monthInterval = { start: startOfMonth(referenceDate), end: endOfMonth(referenceDate) };
    const thisMonthTransactions = transactions.filter(t => {
        const date = getDate(t.date);
        return date && isWithinInterval(date, monthInterval);
    });

    const totalIncome = thisMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = thisMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    if (totalIncome === 0) {
        return { score: 0, description: "Sem dados de renda", emoji: "🤔" };
    }

    const savingsRatio = (totalIncome - totalExpenses) / totalIncome;

    for (const { threshold, score, description, emoji } of HEALTH_SCORE_BOUNDARIES) {
        if (savingsRatio >= threshold) {
            return { score, description, emoji };
        }
    }
    
    return defaultHealth;
}
