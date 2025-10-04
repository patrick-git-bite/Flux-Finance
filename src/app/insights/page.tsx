'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Transaction, Category } from '@/lib/data';
import {
  Loader2, 
  Lightbulb, 
  AlertTriangle, 
  LineChart, 
  HeartPulse, 
  BarChart, 
  Donut
} from 'lucide-react';
import {
  generateRuleBasedInsights,
  RuleBasedInsights,
  calculateFinancialHealthScore,
  FinancialHealth,
  getExpenseBreakdownData,
  getIncomeSourcesData
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
import { 
  BarChart as RechartsBarChart, 
  ResponsiveContainer, 
  XAxis, YAxis, 
  Tooltip, 
  Legend, 
  Bar,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';

// --- Reusable & Custom Components ---

const CustomBarChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const fixedValue = payload.find(p => p.dataKey === 'fixed')?.value || 0;
    const variableValue = payload.find(p => p.dataKey === 'variable')?.value || 0;
    const total = fixedValue + variableValue;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
            <span className="font-bold text-lg">{formatCurrency(total)}</span>
          </div>
          <div className="flex flex-col space-y-1 text-right">
            <div className="flex items-center justify-end gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                <span className="text-xs text-muted-foreground">Fixas: {formatCurrency(fixedValue)}</span>
            </div>
            <div className="flex items-center justify-end gap-1.5">
                 <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
                <span className="text-xs text-muted-foreground">Variáveis: {formatCurrency(variableValue)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const HealthIndicator = ({ score, description, emoji }: FinancialHealth) => (
  <Card className="bg-muted/30">
    <CardHeader>
      <CardTitle className="flex items-center gap-3"><HeartPulse className="size-6 text-primary" />Saúde Financeira</CardTitle>
      <CardDescription>Uma pontuação geral dos seus hábitos financeiros recentes.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium">{description}</span>
          <span className="text-4xl">{emoji}</span>
        </div>
        <Progress value={score} className="h-3" />
        <p className="text-sm text-muted-foreground pt-2">Sua pontuação é <strong>{score}/100</strong>. Continue aprimorando.</p>
    </CardContent>
  </Card>
);

const InsightsList = ({ title, items, icon, variant }: { title: string, items: string[], icon: React.ReactNode, variant: 'warnings' | 'opportunities' | 'ideas' }) => {
  const colors = {
    warnings: 'text-destructive',
    opportunities: 'text-positive',
    ideas: 'text-primary'
  }
  return (
    <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
            {React.cloneElement(icon as React.ReactElement, { className: `size-5 ${colors[variant]}` })}
            <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="list-disc space-y-2 pl-5">
                {items.map((item, index) => (<li key={index} className="text-sm text-muted-foreground">{item}</li>))}
            </ul>
        </CardContent>
    </Card>
  )
};

const barChartConfig = {
    fixed: { label: "Fixas", color: "hsl(var(--chart-2))" },
    variable: { label: "Variáveis", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

// --- Main Page Component ---

export default function InsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  
  const [insights, setInsights] = React.useState<RuleBasedInsights | null>(null);
  const [financialHealth, setFinancialHealth] = React.useState<FinancialHealth | null>(null);
  const [expenseBreakdown, setExpenseBreakdown] = React.useState<any[]>([]);
  const [incomeSources, setIncomeSources] = React.useState<any[]>([]);

  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    setLoading(true);
    const transactionsQuery = query(
        collection(db, 'users', user.uid, 'transactions'), 
        orderBy('date', 'desc')
    );
    const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const userTransactions = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: data.date && data.date.toDate ? data.date.toDate() : new Date(data.date),
        } as Transaction;
      });
      setTransactions(userTransactions);
      setLoading(false);
    }, () => { setError('Não foi possível carregar as transações.'); setLoading(false); });

    const categoriesQuery = query(collection(db, 'users', user.uid, 'categories'));
    const unsubCategories = onSnapshot(categoriesQuery, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, () => setError('Não foi possível carregar as categorias.'));

    return () => { unsubTransactions(); unsubCategories(); };
  }, [user]);

  const handleGenerateInsights = () => {
    if (transactions.length === 0) {
        setError('Não há transações suficientes para gerar insights.');
        return;
    }
    setGenerating(true);
    setError(null);
    setTimeout(() => {
        try {
          const referenceDate = transactions.length > 0 ? transactions[0].date : new Date();
          setInsights(generateRuleBasedInsights(transactions, categories, referenceDate));
          setFinancialHealth(calculateFinancialHealthScore(transactions, referenceDate));
          setExpenseBreakdown(getExpenseBreakdownData(transactions, referenceDate));
          setIncomeSources(getIncomeSourcesData(transactions, referenceDate));
        } catch (e) {
          console.error(e);
          setError('Ocorreu um erro ao gerar os insights.');
        } finally {
          setGenerating(false);
        }
    }, 500); 
  };
  
  if (authLoading || loading) {
      return (
        <AppLayout title="Insights Financeiros"><div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>
      );
  }

  const hasData = transactions.length > 0;
  const showInsights = insights && financialHealth && expenseBreakdown.length > 0;

  return (
    <AppLayout title="Insights Financeiros">
      <div className="space-y-6">
        {error && (
            <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
        )}

        {showInsights ? (
            <div className="grid animate-in fade-in-50 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-3 flex items-center justify-end">
                  <Button size="sm" variant="outline" onClick={handleGenerateInsights} disabled={generating}>
                      {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Atualizar Análise
                  </Button>
                </div>

                <HealthIndicator {...financialHealth!} />

                <Card className="md:col-span-2">
                    <CardHeader><CardTitle className="flex items-center gap-3"><BarChart className="size-5"/>Despesas: Fixas vs. Variáveis</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ChartContainer config={barChartConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={expenseBreakdown} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value, 0)}/>
                                    <Tooltip cursor={false} content={<CustomBarChartTooltip />}/>
                                    <Legend wrapperStyle={{fontSize: "14px"}}/>
                                    <Bar dataKey="fixed" name="Fixas" stackId="a" fill="var(--color-fixed)" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="variable" name="Variáveis" stackId="a" fill="var(--color-variable)" radius={[4, 4, 0, 0]}/>
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-3"><Donut className="size-5"/>Maiores Fontes de Renda</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                         <ChartContainer config={{}} className="h-full w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(value) => formatCurrency(value as number)}/>} />
                                    <Pie data={incomeSources} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="80%" >
                                        {incomeSources.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.fill} />))}
                                    </Pie>
                                    <Legend wrapperStyle={{fontSize: "14px"}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <InsightsList title="Pontos de Atenção" items={insights.warnings} icon={<AlertTriangle/>} variant="warnings"/>
                <InsightsList title="Oportunidades de Melhoria" items={insights.opportunities} icon={<LineChart/>} variant="opportunities"/>
                
            </div>
        ) : (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed">
                <Lightbulb className="size-12 text-muted-foreground" />
                <div className="space-y-1 text-center">
                    <h3 className="text-xl font-semibold">Gere sua Análise Financeira</h3>
                    <p className="text-muted-foreground">Clique no botão para ter uma visão completa de sua saúde financeira.</p>
                </div>
                <Button onClick={handleGenerateInsights} disabled={generating || !hasData}>
                    {generating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analisando...</>) : ('Gerar Análise Financeira')}
                </Button>
            </div>
        )}

      </div>
    </AppLayout>
  );
}
