'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { OverviewCharts } from '@/components/dashboard/overview-charts';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { Transaction, Category } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Loader2 } from 'lucide-react';
import {
  calculateMetrics,
  getMonthlyChartData,
  getCategoryChartData,
} from '@/lib/financials';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [dataLoading, setDataLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;

    setDataLoading(true);
    setError(null);

    const transactionsQuery = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
    const unsubTransactions = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const userTransactions = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Transaction)
        );
        setTransactions(userTransactions);
        setDataLoading(false);
      },
      (err) => {
        console.error("Firestore (transactions) error:", err);
        setError("Não foi possível carregar os dados das transações. Verifique sua conexão ou as configurações do Firestore.");
        setDataLoading(false);
      }
    );

    const categoriesQuery = query(
      collection(db, 'users', user.uid, 'categories'),
      orderBy('name', 'asc')
    );
    const unsubCategories = onSnapshot(
        categoriesQuery, 
        (snapshot) => {
            const userCategories = snapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() } as Category)
            );
            setCategories(userCategories);
        },
        (err) => {
            console.error("Firestore (categories) error:", err);
            setError("Não foi possível carregar os dados das categorias. Tente recarregar a página.");
        }
    );


    return () => {
      unsubTransactions();
      unsubCategories();
    };
  }, [user]);

  if (authLoading || dataLoading) {
    return (
      <AppLayout title="Painel">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Painel">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Dados</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  const {
    balance,
    monthlyIncome,
    monthlyExpenses,
    expensesExceededIncome,
    expensesExceededLastMonth,
  } = calculateMetrics(transactions);
  const monthlyChartData = getMonthlyChartData(transactions);
  const categoryChartData = getCategoryChartData(transactions, categories);


  return (
    <AppLayout title="Painel">
      <div className="flex flex-col gap-6">
        {expensesExceededIncome && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Alerta de Gastos</AlertTitle>
            <AlertDescription>
              Suas despesas este mês excederam sua renda.
            </AlertDescription>
          </Alert>
        )}
        {expensesExceededLastMonth && (
           <Alert>
             <TrendingUp className="h-4 w-4" />
             <AlertTitle>Atenção aos Gastos</AlertTitle>
             <AlertDescription>
                Seus gastos este mês já ultrapassaram o total do mês anterior.
             </AlertDescription>
           </Alert>
        )}
        <SummaryCards
          balance={balance}
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <OverviewCharts
            monthlyData={monthlyChartData}
            categoryData={categoryChartData}
          />
        </div>
        <RecentTransactions
          transactions={transactions.slice(0, 5)}
          categories={categories}
        />
      </div>
    </AppLayout>
  );
}
