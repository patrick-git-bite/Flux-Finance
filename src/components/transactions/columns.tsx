'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Transaction, Category } from '@/lib/data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getIconForCategory } from '@/lib/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TransactionForm } from './transaction-form';
import { useState } from 'react';

type ColumnsProps = {
  categories: Category[];
  onUpdate: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
};

export const columns = ({ categories, onUpdate, onDelete }: ColumnsProps): ColumnDef<Transaction>[] => [
  {
    accessorKey: 'date',
    header: 'Data',
    cell: ({ row }) => {
       const dateValue = row.getValue('date');
       let date = dateValue;
       
       if (typeof dateValue === 'object' && dateValue && 'toDate' in dateValue) {
         date = (dateValue as any).toDate();
       }
       
       try {
         return formatDate(date as string);
       } catch (e) {
         return 'Data inválida';
       }
    }
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      const typeText = type === 'income' ? 'renda' : 'despesa';
      return (
        <Badge
          variant={type === 'income' ? 'default' : 'secondary'}
          className={
            type === 'income'
              ? 'bg-positive/20 text-positive hover:bg-positive/30 border-positive/20'
              : 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/10'
          }
        >
          {typeText}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'categoryId',
    header: 'Categoria',
    cell: ({ row }) => {
      const categoryId = row.getValue('categoryId') as string;
      const category = categories.find((c) => c.id === categoryId);
      const Icon = getIconForCategory(category?.icon || '');
      return (
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span>{category?.name || 'Sem categoria'}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'description',
    header: 'Descrição',
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Valor</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const type = row.original.type;
      const formatted = formatCurrency(amount);

      return (
        <div
          className={`text-right font-medium ${
            type === 'income' ? 'text-positive' : 'text-foreground'
          }`}
        >
          {type === 'expense' && '-'}
          {formatted}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const transaction = row.original;
      const [isSheetOpen, setIsSheetOpen] = useState(false);

      const handleUpdate = (data: Omit<Transaction, 'id'>) => {
        onUpdate({ ...data, id: transaction.id });
        setIsSheetOpen(false);
      }
      
      const getEditableTransaction = (trans: Transaction) => {
        let date = trans.date;
        if(typeof date === 'object' && date && 'toDate' in date){
          date = (date as any).toDate()
        }
        return {
          ...trans,
          date
        }
      }

      return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <SheetTrigger asChild>
                <DropdownMenuItem>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              </SheetTrigger>
              <DropdownMenuItem onClick={() => onDelete(transaction.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Editar Transação</SheetTitle>
            </SheetHeader>
            <TransactionForm
              categories={categories}
              onSubmit={handleUpdate}
              defaultValues={getEditableTransaction(transaction)}
            />
          </SheetContent>
        </Sheet>
      );
    },
  },
];
