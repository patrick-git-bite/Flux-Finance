import { ComponentType } from 'react';

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string; // Icon name from lucide-react
};

export const initialCategories: Category[] = [
  { id: 'cat_1', name: 'Salário', icon: 'Landmark' },
  { id: 'cat_2', name: 'Compras', icon: 'ShoppingCart' },
  { id: 'cat_3', name: 'Moradia', icon: 'Home' },
  { id: 'cat_4', name: 'Transporte', icon: 'Car' },
  { id: 'cat_5', name: 'Entretenimento', icon: 'Ticket' },
  { id: 'cat_6', name: 'Saúde', icon: 'HeartPulse' },
  { id: 'cat_7', name: 'Restaurantes', icon: 'UtensilsCrossed' },
  { id: 'cat_8', name: 'Roupas', icon: 'Shirt' },
  { id: 'cat_9', name: 'Contas', icon: 'Lightbulb' },
];

export const initialTransactions: Transaction[] = [
  {
    id: 'txn_1',
    date: '2024-07-25',
    description: 'Salário Mensal',
    amount: 5000,
    type: 'income',
    categoryId: 'cat_1',
  },
  {
    id: 'txn_2',
    date: '2024-07-24',
    description: 'Compras da Semana',
    amount: 150.75,
    type: 'expense',
    categoryId: 'cat_2',
  },
  {
    id: 'txn_3',
    date: '2024-07-22',
    description: 'Pagamento do Aluguel',
    amount: 1200,
    type: 'expense',
    categoryId: 'cat_3',
  },
  {
    id: 'txn_4',
    date: '2024-07-20',
    description: 'Gasolina',
    amount: 55.3,
    type: 'expense',
    categoryId: 'cat_4',
  },
  {
    id: 'txn_5',
    date: '2024-07-18',
    description: 'Ingressos de Cinema',
    amount: 30,
    type: 'expense',
    categoryId: 'cat_5',
  },
];
