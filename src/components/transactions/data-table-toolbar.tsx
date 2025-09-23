'use client';

import { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, Transaction } from '@/lib/data';
import { CategoryIcon, getIconForCategory } from '@/lib/icons';
import { exportToCSV } from '@/lib/csv';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TransactionForm } from './transaction-form';
import { useState } from 'react';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  categories: Category[];
  onAdd: (data: Omit<Transaction, 'id'|'date'> & { date: Date }) => void;
}

export function DataTableToolbar<TData>({
  table,
  categories,
  onAdd
}: DataTableToolbarProps<TData>) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleAdd = (data: Omit<Transaction, 'id' | 'date'> & { date: Date }) => {
    onAdd(data);
    setIsSheetOpen(false);
  }
  
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Filtrar transações..."
          value={(table.getColumn('description')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('description')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
          onValueChange={(value) => {
            if (value === 'all') {
               table.getColumn('categoryId')?.setFilterValue(undefined);
            } else {
               table.getColumn('categoryId')?.setFilterValue([value]);
            }
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Todas as Categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {categories.map((category) => {
              const Icon = getIconForCategory(category.icon);
              return (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToCSV(table.getFilteredRowModel().rows.map(r => r.original as Transaction), 'transacoes.csv')}
        >
          <Upload className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
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
      </div>
    </div>
  );
}
