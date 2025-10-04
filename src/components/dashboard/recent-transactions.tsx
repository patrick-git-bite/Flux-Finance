import { Transaction, Category } from '@/lib/data';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { getIconForCategory } from '@/lib/icons';

// --- Reusable Sub-components --- //

/**
 * Represents a single row in the recent transactions list.
 */
const TransactionRow = ({ transaction, category }: { transaction: Transaction; category?: Category }) => {
    const Icon = getIconForCategory(category?.icon || 'HelpCircle');

    return (
        <div className="flex items-center gap-4 py-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid flex-1 gap-1">
                <p className="font-medium truncate">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.date as unknown as string | number | Date)}
                </p>
            </div>
            <div
                className={cn(
                    'font-semibold text-right',
                    transaction.type === 'income' ? 'text-positive' : 'text-destructive'
                )}
            >
                {transaction.type === 'expense' && '-'}
                {formatCurrency(transaction.amount)}
            </div>
        </div>
    );
};


// --- Main Component --- //

type RecentTransactionsProps = {
  transactions: Transaction[];
  categories: Category[];
};

/**
 * Renders a list of the most recent transactions.
 * This component is designed to be placed inside a Card or other container.
 */
export function RecentTransactions({ transactions, categories }: RecentTransactionsProps) {
  return (
    <div className="space-y-2">
      {transactions.map((transaction) => {
        const category = categories.find(c => c.id === transaction.categoryId);
        return (
          <TransactionRow 
            key={transaction.id} 
            transaction={transaction} 
            category={category} 
          />
        );
      })}
    </div>
  );
}
