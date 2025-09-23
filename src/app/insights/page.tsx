'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Transaction, Category } from '@/lib/data';
import { Loader2, Lightbulb, AlertTriangle, Target, LineChart, HeartPulse } from 'lucide-react';
import {
  generateRuleBasedInsights,
  RuleBasedInsights,
  getExpenseHistoryChartData,
  calculateFinancialHealthScore,
  FinancialHealth
} from '@/lib/financials';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';


const chartConfigHistory = {
  expenses: {
    label: 'Despesas',
    color: 'hsl(var(--chart-2))',
  },
};

const HealthIndicator = ({ score, description, emoji }: FinancialHealth) => (
  <Card className="bg-muted/30">
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        <HeartPulse className="size-6 text-primary" />
        Saúde Financeira
      </CardTitle>
       <CardDescription>
          Uma pontuação geral dos seus hábitos financeiros recentes.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium">{description}</span>
          <span className="text-4xl">{emoji}</span>
        </div>
        <Progress value={score} className="h-3" />
         <p className="text-sm text-muted-foreground pt-2">
            Sua pontuação é <strong>{score}/100</strong>. Continue aprimorando seus hábitos para aumentá-la.
        </p>
    </CardContent>
  </Card>
);

export default function InsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [insights, setInsights] = React.useState<RuleBasedInsights | null>(null);
  const [financialHealth, setFinancialHealth] = React.useState<FinancialHealth | null>(null);
  const [dataLoading, setDataLoading] = React.useState(true);
  const [insightsLoading, setInsightsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { theme } = useTheme();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  React.useEffect(() => {
    if (!user) return;

    setDataLoading(true);
    const transactionsQuery = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
    const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
      setDataLoading(false);
    }, (err) => {
      setError('Não foi possível carregar as transações.');
      setDataLoading(false);
    });

    const categoriesQuery = query(collection(db, 'users', user.uid, 'categories'));
    const unsubCategories = onSnapshot(categoriesQuery, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (err) => {
      setError('Não foi possível carregar as categorias.');
    });

    return () => {
      unsubTransactions();
      unsubCategories();
    };
  }, [user]);

  const handleGenerateInsights = () => {
    setInsightsLoading(true);
    setError(null);
    setInsights(null);
    setFinancialHealth(null);

    setTimeout(() => {
        try {
          if (transactions.length === 0) {
            setError('Não há transações suficientes para gerar insights. Adicione algumas transações primeiro.');
            setInsightsLoading(false);
            return;
          }
          const result = generateRuleBasedInsights(transactions, categories);
          const health = calculateFinancialHealthScore(transactions);
          setInsights(result);
          setFinancialHealth(health);
        } catch (e) {
          console.error(e);
          setError('Ocorreu um erro ao gerar os insights. Tente novamente.');
        } finally {
          setInsightsLoading(false);
        }
    }, 500); 
  };

  const renderList = (items: string[]) => (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item, index) => (
        <li key={index} className="text-sm text-muted-foreground">
          {item}
        </li>
      ))}
    </ul>
  );
  
  if (authLoading || (dataLoading && !transactions.length)) {
    return (
      <AppLayout title="Insights Financeiros">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const expenseHistoryData = getExpenseHistoryChartData(transactions);

  return (
    <AppLayout title="Insights Financeiros">
      <div className="space-y-6">
        <Card className="bg-primary/5 dark:bg-primary/10">
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lightbulb className="size-6" />
            </div>
            <div>
              <CardTitle>Seu Assistente Financeiro</CardTitle>
              <CardDescription>
                Clique no botão para uma análise completa de suas finanças com dicas personalizadas.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateInsights} disabled={insightsLoading || transactions.length === 0}>
              {insightsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                'Gerar Análise Financeira'
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {insightsLoading && (
           <div className="grid animate-pulse gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2 col-span-1 lg:col-span-2 rounded-lg bg-muted h-64" />
              <div className="space-y-2 rounded-lg bg-muted h-64" />
           </div>
        )}

        {insights && financialHealth && (
          <div className="grid animate-in fade-in-50 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="md:col-span-2 lg:col-span-2">
                 <CardHeader>
                    <CardTitle>Histórico de Despesas</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <ChartContainer config={chartConfigHistory} className="h-[250px] w-full">
                       <BarChart data={expenseHistoryData} margin={{ top: 20, right: 20, left: -10 }}>
                          <XAxis dataKey="month" stroke={isDark ? '#888' : '#555'} fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke={isDark ? '#888' : '#555'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value, 0)} />
                          <Tooltip cursor={{ fill: 'hsla(var(--muted))' }} content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />} />
                          <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
                       </BarChart>
                    </ChartContainer>
                 </CardContent>
              </Card>
            
             <HealthIndicator {...financialHealth} />
            
            <Card>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <AlertTriangle className="size-5 text-destructive" />
                <CardTitle className="text-lg">Pontos de Atenção</CardTitle>
              </CardHeader>
              <CardContent>{renderList(insights.warnings)}</CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <Target className="size-5 text-positive" />
                <CardTitle className="text-lg">Oportunidades de Melhoria</CardTitle>
              </CardHeader>
              <CardContent>{renderList(insights.opportunities)}</CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <LineChart className="size-5 text-primary" />
                <CardTitle className="text-lg">Próximos Passos (Educacional)</CardTitle>
              </CardHeader>
              <CardContent>
                {renderList(insights.investmentIdeas)}
                 <p className="mt-4 text-xs text-muted-foreground">
                    Aviso: As sugestões são para fins educacionais e não constituem aconselhamento financeiro.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
