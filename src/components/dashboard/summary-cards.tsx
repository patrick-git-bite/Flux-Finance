import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

// --- Reusable Sub-components --- //

/**
 * A reusable component to display a percentage change with an appropriate icon and color.
 */
const ChangeIndicator = ({ value, type }: { value: number; type: 'income' | 'expense' }) => {
  const isPositive = value >= 0;
  
  // For expenses, a decrease is good (positive), and an increase is bad (destructive).
  const isGoodChange = type === 'income' ? isPositive : !isPositive;

  const colorClass = isGoodChange ? 'text-positive' : 'text-destructive';
  const Icon = isPositive ? ArrowUp : ArrowDown;

  return (
    <p className="text-xs text-muted-foreground flex items-center">
        <Icon className={cn('h-4 w-4', colorClass)} />
        <span className={cn('ml-1 font-semibold', colorClass)}>
            {value.toFixed(1)}%
        </span>
        <span className="ml-1">em relação ao mês passado</span>
    </p>
  );
};

/**
 * A specific summary card for displaying a single metric.
 */
const SummaryCard = ({ title, value, icon, change, changeType, valueClass } : {
    title: string;
    value: number;
    icon: React.ReactNode;
    change?: number;
    changeType?: 'income' | 'expense';
    valueClass?: string;
}) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className={cn('font-headline text-2xl font-bold', valueClass)}>
                {formatCurrency(value)}
            </div>
            {change !== undefined && changeType && (
                <ChangeIndicator value={change} type={changeType} />
            )}
        </CardContent>
    </Card>
);

// --- Main Component --- //

type SummaryCardsProps = {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  previousMonthlyIncome: number;
  previousMonthlyExpenses: number;
};

/**
 * Displays a set of summary cards for key financial metrics: balance, income, and expenses.
 */
export function SummaryCards({
  balance,
  monthlyIncome,
  monthlyExpenses,
  previousMonthlyIncome,
  previousMonthlyExpenses,
}: SummaryCardsProps) {

  // Helper to calculate percentage change, avoiding division by zero.
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const incomeChange = calculateChange(monthlyIncome, previousMonthlyIncome);
  const expensesChange = calculateChange(monthlyExpenses, previousMonthlyExpenses);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <SummaryCard
        title="Saldo Atual"
        value={balance}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        valueClass={balance >= 0 ? 'text-foreground' : 'text-destructive'}
      />
      <SummaryCard
        title="Renda Mensal"
        value={monthlyIncome}
        icon={<ArrowUp className="h-4 w-4 text-positive" />}
        valueClass="text-positive"
        change={incomeChange}
        changeType="income"
      />
      <SummaryCard
        title="Despesas Mensais"
        value={monthlyExpenses}
        icon={<ArrowDown className="h-4 w-4 text-destructive" />}
        valueClass="text-destructive"
        change={expensesChange}
        changeType="expense"
      />
    </div>
  );
}
