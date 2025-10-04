'use client';

import * as React from 'react';
import { Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pen, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TransactionForm } from './transaction-form';
import { Category, Transaction } from '@/lib/data';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  categories: Category[];
  onUpdate: (updatedTransaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

export function DataTableRowActions<TData extends { id: string }>({ 
    row, 
    categories, 
    onUpdate, 
    onDelete 
}: DataTableRowActionsProps<TData>) {
    const [isEditing, setIsEditing] = React.useState(false);
    
    const transaction = row.original as Transaction;

    const handleUpdateSubmit = (data: Omit<Transaction, 'id'> | Omit<Transaction, 'id'>[]) => {
        // In edit mode, we only expect a single object, not an array of installments.
        if (Array.isArray(data)) {
            console.error("Editing a transaction should not result in an array.", data);
            return;
        }

        // The onUpdate prop expects the full transaction object, including its original ID.
        onUpdate({ ...transaction, ...data });
        setIsEditing(false); // Close the sheet upon successful submission
    };

    return (
        <>
            <Sheet open={isEditing} onOpenChange={setIsEditing}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Editar Transação</SheetTitle>
                        <SheetDescription>
                            Faça alterações em sua transação aqui. Clique em salvar quando terminar.
                        </SheetDescription>
                    </SheetHeader>
                    <TransactionForm
                        isOpen={isEditing}
                        onClose={() => setIsEditing(false)}
                        onSubmit={handleUpdateSubmit}
                        categories={categories}
                        transaction={transaction}
                    />
                </SheetContent>
            </Sheet>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Pen className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(transaction.id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
