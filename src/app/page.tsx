'use client';

import * as React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { Transaction, Category } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Beaker, BarChart3, Trash2, ArrowRight } from 'lucide-react';
import {
  calculateMetrics,
  getMonthlyChartData,
  getCategoryDistributionData,
  generateRuleBasedInsights
} from '@/lib/financials';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { seedDatabase } from '@/lib/seed'; 
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartConfig
} from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';
import { InsightsCard } from '@/components/dashboard/insights-card';
import { Button } from '@/components/ui/button';

// --- Custom Components ---
const CustomBarChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const income = payload.find(p => p.dataKey === 'income')?.value || 0;
    const fixed = payload.find(p => p.dataKey === 'fixed')?.value || 0;
    const variable = payload.find(p => p.dataKey === 'variable')?.value || 0;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
            <span className="font-bold text-lg">{formatCurrency(income)}</span>
          </div>
          <div className="flex flex-col space-y-1 text-right">
             <div className="flex items-center justify-end gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--color-fixed)' }} />
                <span className="text-xs text-muted-foreground">Fixas: {formatCurrency(fixed)}</span>
            </div>
            <div className="flex items-center justify-end gap-1.5">
                 <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--color-variable)' }} />
                <span className="text-xs text-muted-foreground">Variáveis: {formatCurrency(variable)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [dataLoading, setDataLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [isClearing, setIsClearing] = React.useState(false);
  const [showSeedButton, setShowSeedButton] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);
  const { theme } = useTheme();

  React.useEffect(() => {
    const checkIsDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(checkIsDark);
  }, [theme]);


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
        const userTransactions = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date && data.date.toDate ? data.date.toDate() : new Date(data.date),
            } as Transaction;
        });
        setTransactions(userTransactions);
        setShowSeedButton(userTransactions.length === 0); 
        setDataLoading(false);
      },
      (err) => {
        setError("Não foi possível carregar os dados das transações.");
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
            setCategories(snapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() } as Category)
            ));
        },
        (err) => {
            setError("Não foi possível carregar os dados das categorias.");
        }
    );


    return () => {
      unsubTransactions();
      unsubCategories();
    };
  }, [user]);

  const handleSeed = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      await seedDatabase(user.uid);
      toast({ title: 'Banco de Dados Alimentado', description: 'Dados de exemplo foram carregados com sucesso!' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao Alimentar Dados', description: error.message });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    if (!user) return;
    setIsClearing(true);
    try {
      const batch = writeBatch(db);
      const transactionsQuery = query(collection(db, 'users', user.uid, 'transactions'));
      const categoriesQuery = query(collection(db, 'users', user.uid, 'categories'));
      const [transactionsSnapshot, categoriesSnapshot] = await Promise.all([
        getDocs(transactionsQuery),
        getDocs(categoriesQuery)
      ]);
      transactionsSnapshot.forEach(doc => batch.delete(doc.ref));
      categoriesSnapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      toast({ 
        title: 'Dados Apagados', 
        description: 'Todas as suas transações e categorias foram removidas.',
        variant: 'destructive'
      });
    } catch (error) {
      console.error("Clearing failed:", error);
      toast({ variant: 'destructive', title: 'Erro ao Limpar Dados', description: 'Não foi possível apagar os seus dados.' });
    } finally {
      setIsClearing(false);
    }
  };


  if (authLoading || dataLoading) {
    return (
      <AppLayout title="Painel"><div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Painel">
        <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro ao Carregar Dados</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
      </AppLayout>
    );
  }

  const referenceDate = transactions.length > 0 ? transactions[0].date : new Date();

  const {
    balance, monthlyIncome, monthlyExpenses,
    previousMonthlyIncome, previousMonthlyExpenses,
  } = calculateMetrics(transactions, referenceDate);
  
  const monthlyChartData = getMonthlyChartData(transactions, referenceDate);
  const categoryDistributionData = getCategoryDistributionData(transactions, categories, referenceDate);
  const insights = generateRuleBasedInsights(transactions, categories, referenceDate);

  const categoryMonthDescription = `Gastos por categoria em ${format(referenceDate, 'MMMM', { locale: ptBR })}`;

  const chartConfigMonthly = {
    income: { label: 'Renda', color: 'hsl(var(--chart-1))' },
    fixed: { label: 'Desp. Fixas', color: 'hsl(var(--chart-2))' },
    variable: { label: 'Desp. Variáveis', color: 'hsl(var(--chart-3))' },
  } satisfies ChartConfig;

  return (
    <AppLayout title="Painel">
        <div className="flex items-center justify-between mb-4">
            <div></div>
             <div className="flex items-center gap-2">
              {showSeedButton ? (
                <Button onClick={handleSeed} disabled={isSeeding} size="sm">
                  {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Beaker className="mr-2 h-4 w-4" /> }
                  Alimentar com Dados
                </Button>
              ) : (
                 transactions.length > 0 && (
                    <Button onClick={handleClearData} disabled={isClearing} size="sm" variant="destructive">
                    {isClearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" /> }
                    Limpar Dados
                    </Button>
                 )
              )}
            </div>
        </div>

      <div className="flex flex-col gap-6">
        {transactions.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-96 rounded-lg border-2 border-dashed border-muted-foreground/30">
                <h2 className="text-xl font-semibold mb-2">Bem-vindo ao FinTracker!</h2>
                <p className="text-muted-foreground mb-4 text-center">
                    Parece que você ainda não tem nenhuma transação.<br />
                    Clique em "Alimentar com Dados" acima para ver um exemplo ou adicione sua primeira transação.
                </p>
                <img src="/empty-state.svg" alt="Nenhuma transação" className="w-64 h-64" />
            </div>
        ) : (
          <>
            <SummaryCards
              balance={balance}
              monthlyIncome={monthlyIncome}
              monthlyExpenses={monthlyExpenses}
              previousMonthlyIncome={previousMonthlyIncome}
              previousMonthlyExpenses={previousMonthlyExpenses}
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Visão Geral Mensal</CardTitle></CardHeader>
                    <CardContent className="h-[282px]">
                        <ChartContainer config={chartConfigMonthly} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyChartData} margin={{ top: 20, right: 10, left: -10 }}>
                                <XAxis dataKey="month" stroke={isDark ? '#888' : '#555'} fontSize={12} tickLine={false} axisLine={false}/>
                                <YAxis stroke={isDark ? '#888' : '#555'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value, 0)}/>
                                <Tooltip cursor={{ fill: 'hsla(var(--muted))' }} content={<CustomBarChartTooltip />}/>
                                <Legend wrapperStyle={{fontSize: "14px"}}/>
                                <Bar dataKey="income" name="Renda" fill="var(--color-income)" radius={[4, 4, 0, 0]}/>
                                <Bar dataKey="fixed" name="Desp. Fixas" stackId="a" fill="var(--color-fixed)" />
                                <Bar dataKey="variable" name="Desp. Variáveis" stackId="a" fill="var(--color-variable)" radius={[4, 4, 0, 0]}/>
                            </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <InsightsCard insights={insights} />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                 <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5"/>
                            Distribuição de Despesas
                        </CardTitle>
                        <CardDescription>
                           {categoryMonthDescription}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[282px] overflow-y-auto pr-2 text-sm">
                        <div className="space-y-4">
                            {categoryDistributionData.length > 0 ? (
                                categoryDistributionData.map((category) => (
                                  <div key={category.name} className="flex flex-col space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.fill }} />
                                            <span className="truncate font-medium">{category.name}</span>
                                        </div>
                                        <div className="font-semibold text-right">
                                            <span>{formatCurrency(category.value)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Progress value={(category.value / monthlyExpenses) * 100} className="h-2" />
                                        <span className="text-xs text-muted-foreground w-12 text-right">
                                            {((category.value / monthlyExpenses) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground pt-10">
                                    <p>Sem despesas para exibir.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center">
                        <div className="grid gap-2">
                        <CardTitle>Transações Recentes</CardTitle>
                        <CardDescription>
                            Suas transações mais recentes.
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
                        <RecentTransactions transactions={transactions.slice(0, 5)} categories={categories}/>
                    </CardContent>
                </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
