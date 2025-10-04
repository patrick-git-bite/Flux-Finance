'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { TransactionForm } from './transaction-form';
import { Category, Transaction } from '@/lib/data';

interface NewTransactionSheetProps {
  categories: Category[];
  onAdd: (data: Omit<Transaction, 'id'> | Omit<Transaction, 'id'>[]) => void;
}

/**
 * A component that renders a button to open a sheet for adding a new transaction.
 * It manages the open/closed state of the sheet.
 */
export function NewTransactionSheet({ categories, onAdd }: NewTransactionSheetProps) {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleAdd = (data: Omit<Transaction, 'id'> | Omit<Transaction, 'id'>[]) => {
    onAdd(data);
    setIsSheetOpen(false);
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Transação
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar Nova Transação</SheetTitle>
        </SheetHeader>
        <TransactionForm categories={categories} onSubmit={handleAdd} />
      </SheetContent>
    </Sheet>
  );
}
