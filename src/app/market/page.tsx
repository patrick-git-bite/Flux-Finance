'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
} from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Info,
  TrendingDown,
  TrendingUp,
  Loader2,
  Wallet,
  PiggyBank,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction } from '@/lib/data';
import { calculateMetrics } from '@/lib/financials';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Dados estáticos de exemplo
const indicators = {
  selic: {
    name: 'Taxa Selic',
    data: [
      { month: 'Jan', rate: 11.75 },
      { month: 'Fev', rate: 11.25 },
      { month: 'Mar', rate: 11.25 },
      { month: 'Abr', rate: 10.75 },
      { month: 'Mai', rate: 10.5 },
      { month: 'Jun', rate: 10.5 },
    ],
    color: 'primary',
  },
  ipca: {
    name: 'Inflação (IPCA)',
    data: [
      { month: 'Jan', rate: 4.51 },
      { month: 'Fev', rate: 4.5 },
      { month: 'Mar', rate: 3.93 },
      { month: 'Abr', rate: 3.69 },
      { month: 'Mai', rate: 3.9 },
      { month: 'Jun', rate: 4.05 },
    ],
    color: 'destructive',
  },
  cdi: {
    name: 'Taxa CDI',
    data: [
      { month: 'Jan', rate: 11.65 },
      { month: 'Fev', rate: 11.15 },
      { month: 'Mar', rate: 11.15 },
      { month: 'Abr', rate: 10.65 },
      { month: 'Mai', rate: 10.4 },
      { month: 'Jun', rate: 10.4 },
    ],
    color: 'chart-1',
  },
};

const investmentOptions = {
    selic: {
        name: "Tesouro Selic",
        description: "Título público com baixo risco, acompanha a taxa básica de juros.",
        getAnnualRate: (rates: { selic: number }) => rates.selic / 100
    },
    cdb: {
        name: "CDB 110% do CDI",
        description: "Paga 110% da taxa CDI. Possui garantia do FGC.",
        getAnnualRate: (rates: { cdi: number }) => (rates.cdi * 1.10) / 100
    },
    lci_lca: {
        name: "LCI/LCA 95% do CDI",
        description: "Isento de Imposto de Renda. Acompanha 95% do CDI.",
        getAnnualRate: (rates: { cdi: number }) => (rates.cdi * 0.95) / 100
    },
    tesouro_ipca: {
        name: "Tesouro IPCA+ 6%",
        description: "Protege da inflação + um ganho real fixo de 6% a.a.",
        getAnnualRate: (rates: { ipca: number }) => (rates.ipca + 6) / 100
    },
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Mês
            </span>
            <span className="font-bold text-muted-foreground">{label}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Taxa
            </span>
            <span className="font-bold">{`${payload[0].value.toFixed(
              2
            )}%`}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const periods = [
    { label: '1 Mês', months: 1 },
    { label: '6 Meses', months: 6 },
    { label: '1 Ano', months: 12 },
    { label: '2 Anos', months: 24 },
]

const Simulator = ({ balance, rates }: { balance: number, rates: {selic: number, cdi: number, ipca: number} }) => {
    const [selectedIndex, setSelectedIndex] = React.useState<keyof typeof investmentOptions>('selic');
    const [monthlyContribution, setMonthlyContribution] = React.useState(500);
    
    const selectedOption = investmentOptions[selectedIndex];
    const annualRate = selectedOption.getAnnualRate(rates);
    const monthlyRate = Math.pow(1 + annualRate, 1/12) - 1;

    const calculateSingleYield = (principal: number, months: number) => {
      return principal * (Math.pow(1 + monthlyRate, months) - 1);
    }
    
    const calculateCompoundYield = (contribution: number, months: number) => {
        let total = 0;
        for (let i = 0; i < months; i++) {
            total = (total + contribution) * (1 + monthlyRate);
        }
        return total - (contribution * months);
    }

    return (
        <div className="space-y-4">
             <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                 <Select value={selectedIndex} onValueChange={(val) => setSelectedIndex(val as keyof typeof investmentOptions)}>
                    <SelectTrigger className="w-full md:w-[280px]">
                        <SelectValue placeholder="Selecione um indexador" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(investmentOptions).map(([key, option]) => (
                            <SelectItem key={key} value={key}>{option.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <p className="text-sm text-muted-foreground md:max-w-xs">{selectedOption.description}</p>
            </div>

            <Tabs defaultValue="single">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Se eu investir hoje</TabsTrigger>
                <TabsTrigger value="monthly">Se eu investir todo mês</TabsTrigger>
              </TabsList>
              <TabsContent value="single" className="space-y-4 pt-4">
                 <div className="text-center text-muted-foreground">
                    <p>Simulação de rendimento bruto com um único aporte do seu saldo atual de <strong className="text-foreground">{formatCurrency(balance)}</strong>.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {periods.map(period => (
                        <div key={period.months} className="rounded-lg border bg-muted/30 p-4 space-y-1">
                            <div className="font-semibold">{period.label}</div>
                            <div className="text-2xl font-bold text-positive">{formatCurrency(calculateSingleYield(balance, period.months))}</div>
                            <div className="text-xs text-muted-foreground">Rendimento bruto</div>
                        </div>
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="monthly" className="space-y-4 pt-4">
                 <div className="flex flex-col items-center gap-4 text-center">
                    <p className="text-muted-foreground">Simulação de rendimento bruto com aportes mensais.</p>
                    <div className="w-full max-w-xs space-y-2">
                      <Label htmlFor="monthly-contribution">Valor do Aporte Mensal</Label>
                      <Input
                        id="monthly-contribution"
                        type="number"
                        value={monthlyContribution}
                        onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                        className="text-center text-lg"
                      />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {periods.map(period => {
                      const totalInvested = monthlyContribution * period.months;
                      const yieldAmount = calculateCompoundYield(monthlyContribution, period.months);
                      const totalAmount = totalInvested + yieldAmount;
                      return (
                        <div key={period.months} className="rounded-lg border bg-muted/30 p-4 space-y-1">
                            <div className="font-semibold">{period.label}</div>
                            <div className="text-2xl font-bold text-positive">{formatCurrency(yieldAmount)}</div>
                            <div className="text-xs text-muted-foreground">
                              Total investido: {formatCurrency(totalInvested)}<br/>
                              Montante final: {formatCurrency(totalAmount)}
                            </div>
                        </div>
                      )
                    })}
                </div>
              </TabsContent>
            </Tabs>
            
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Próximos Passos (Educacional)</AlertTitle>
              <AlertDescription>
                <p>Gostou da simulação? Para investir, você pode procurar por esses produtos em corretoras de investimentos, bancos digitais ou seu banco tradicional. Compare as taxas e condições oferecidas por cada um.</p>
                <p className="mt-2 text-xs">Lembre-se: esta simulação é apenas para fins educacionais e não considera impostos ou taxas. Não é uma recomendação de investimento.</p>
              </AlertDescription>
            </Alert>
        </div>
    )
}

export default function MarketPage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    setDataLoading(true);

    const transactionsQuery = query(
      collection(db, 'users', user.uid, 'transactions')
    );
    const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      setTransactions(
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Transaction)
        )
      );
      setDataLoading(false);
    });

    return () => unsubTransactions();
  }, [user]);

  const lastSelic = indicators.selic.data[indicators.selic.data.length - 1].rate;
  const lastIpca = indicators.ipca.data[indicators.ipca.data.length - 1].rate;
  const lastCdi = indicators.cdi.data[indicators.cdi.data.length - 1].rate;
  const realInterestRate = lastSelic - lastIpca;

  const { balance } = calculateMetrics(transactions);

  return (
    <AppLayout title="Painel do Mercado">
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Dados Educacionais</AlertTitle>
          <AlertDescription>
            Os gráficos e indicadores abaixo utilizam dados estáticos e não são
            atualizados em tempo real. Eles servem para fins educacionais e de
            demonstração.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Taxa Selic</CardTitle>
              <CardDescription>A taxa básica de juros.</CardDescription>
            </CardHeader>
            <CardContent className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={indicators.selic.data}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSelic" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorSelic)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter>
              <p className="font-headline text-3xl font-bold">
                {lastSelic.toFixed(2)}%{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  a.a.
                </span>
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inflação (IPCA)</CardTitle>
              <CardDescription>Acumulado 12 meses.</CardDescription>
            </CardHeader>
            <CardContent className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={indicators.ipca.data}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorIpca" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--destructive))"
                        stopOpacity={0.7}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--destructive))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--destructive))"
                    fillOpacity={1}
                    fill="url(#colorIpca)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter>
              <p className="font-headline text-3xl font-bold">
                {lastIpca.toFixed(2)}%{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  a.a.
                </span>
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Taxa CDI</CardTitle>
              <CardDescription>Referência de renda fixa.</CardDescription>
            </CardHeader>
            <CardContent className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={indicators.cdi.data}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCdi" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--chart-1))"
                    fillOpacity={1}
                    fill="url(#colorCdi)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter>
              <p className="font-headline text-3xl font-bold">
                {lastCdi.toFixed(2)}%{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  a.a.
                </span>
              </p>
            </CardFooter>
          </Card>

          <Card
            className={cn(
              'flex flex-col justify-between',
              realInterestRate > 0 ? 'bg-positive/10' : 'bg-destructive/10'
            )}
          >
            <CardHeader>
              <CardTitle>Juro Real (Selic - IPCA)</CardTitle>
              <CardDescription>
                Seu poder de compra está aumentando ou diminuindo?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  'flex items-center gap-2 font-headline text-3xl font-bold',
                  realInterestRate > 0 ? 'text-positive' : 'text-destructive'
                )}
              >
                {realInterestRate > 0 ? (
                  <TrendingUp className="h-7 w-7" />
                ) : (
                  <TrendingDown className="h-7 w-7" />
                )}
                {realInterestRate.toFixed(2)}%
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                {realInterestRate > 0
                  ? 'Seu dinheiro está rendendo acima da inflação.'
                  : 'A inflação está maior que a Selic, seu dinheiro perde poder de compra.'}
              </p>
            </CardFooter>
          </Card>
        </div>

        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-6 w-6" />
                    Simulador de Rendimentos
                </CardTitle>
                <CardDescription>
                    Veja uma projeção de quanto seu saldo renderia com base nos indicadores do mercado.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {authLoading || dataLoading ? (
                    <div className="flex h-24 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <Simulator balance={balance} rates={{ selic: lastSelic, cdi: lastCdi, ipca: lastIpca }}/>
                )}
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
