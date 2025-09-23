import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

type SummaryCardsProps = {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
};

export function SummaryCards({
  balance,
  monthlyIncome,
  monthlyExpenses,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'font-headline text-2xl font-bold',
              balance >= 0 ? 'text-positive' : 'text-destructive'
            )}
          >
            {formatCurrency(balance)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Renda Mensal</CardTitle>
          <ArrowUp className="h-4 w-4 text-positive" />
        </CardHeader>
        <CardContent>
          <div className="font-headline text-2xl font-bold text-positive">
            {formatCurrency(monthlyIncome)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas Mensais</CardTitle>
          <ArrowDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="font-headline text-2xl font-bold text-destructive">
            {formatCurrency(monthlyExpenses)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
