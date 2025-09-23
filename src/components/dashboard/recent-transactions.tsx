import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Transaction, Category } from '@/lib/data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getIconForCategory } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

type RecentTransactionsProps = {
  transactions: Transaction[];
  categories: Category[];
};

export function RecentTransactions({ transactions, categories }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>
            Suas 5 transações mais recentes.
          </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/transactions">
            Ver Todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const category = categories.find(c => c.id === transaction.categoryId);
            const Icon = getIconForCategory(category?.icon || '');
            const date = typeof transaction.date === 'string' 
              ? transaction.date 
              : (transaction.date as any).toDate().toISOString();

            return (
              <div
                key={transaction.id}
                className="flex items-center gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="grid flex-1 gap-1">
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(date)}
                  </p>
                </div>
                <div
                  className={cn(
                    'font-semibold',
                    transaction.type === 'income'
                      ? 'text-positive'
                      : 'text-destructive'
                  )}
                >
                  {transaction.type === 'expense' && '-'}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  );
}
