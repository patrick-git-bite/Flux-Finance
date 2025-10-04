'use client';

import { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { Category, Transaction } from '@/lib/data';
import { getIconForCategory } from '@/lib/icons';
import { exportToCSV } from '@/lib/csv';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { NewTransactionSheet } from './new-transaction-sheet';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  categories: Category[];
  onAdd: (data: Omit<Transaction, 'id'> | Omit<Transaction, 'id'>[]) => void;
}

/**
 * The toolbar for the transactions data table.
 * It includes input filters, faceted filters for type and category,
 * a reset button, and controls for exporting and adding new transactions.
 */
export function DataTableToolbar<TData>({ 
  table,
  categories,
  onAdd
}: DataTableToolbarProps<TData>) {

  const isFiltered = table.getState().columnFilters.length > 0;

  const transactionTypes = [
    { value: 'income', label: 'Renda' },
    { value: 'expense', label: 'Despesa' },
  ];

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
    icon: getIconForCategory(cat.icon),
  }));

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 flex-col sm:flex-row items-start sm:items-center gap-2">
        <Input
          placeholder="Filtrar por descrição..."
          value={(table.getColumn('description')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('description')?.setFilterValue(event.target.value)
          }
          className="h-9 w-full sm:max-w-xs"
        />
        <div className="flex gap-2">
            <DataTableFacetedFilter 
                column={table.getColumn('type')}
                title="Tipo"
                options={transactionTypes}
            />
            <DataTableFacetedFilter
                column={table.getColumn('categoryId')}
                title="Categoria"
                options={categoryOptions}
            />
        </div>
        {isFiltered && (
            <Button
                variant="ghost"
                onClick={() => table.resetColumnFilters()}
                className="h-9 px-2 lg:px-3"
            >
                Limpar filtros
                <X className="ml-2 h-4 w-4" />
            </Button>
        )}
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
        <NewTransactionSheet categories={categories} onAdd={onAdd} />
      </div>
    </div>
  );
}
