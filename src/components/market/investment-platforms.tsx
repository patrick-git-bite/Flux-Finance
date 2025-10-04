'use client';

import * as React from 'react';
import {
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { Link, Banknote, Landmark, ShieldCheck, Rocket, Percent } from 'lucide-react';

// Dados para o gráfico e para os textos
const platforms = [
  {
    name: 'BTG Pactual',
    id: 'btg',
    summary: 'Maior banco de investimentos da América Latina, destaca-se pela ampla oferta em renda fixa e curadoria de fundos.',
    features: {
      'Renda Fixa': 9,
      'Fundos': 8,
      'Renda Variável': 6,
      'Acessibilidade': 7,
    },
    content: {
      rendaFixa: {
        title: 'Renda Fixa',
        icon: ShieldCheck,
        points: [
          'Taxa zero de custódia.',
          'Assessoria especializada para auxiliar nas decisões.',
          'Acesso a CDBs de bancos menores com rentabilidades atrativas.',
          'Portfólio diversificado: LCIs, LCAs, CRIs, CRAs e Debêntures.'
        ],
        links: [
          { name: 'Página de Renda Fixa', url: 'https://investimentos.btgpactual.com/renda-fixa' },
          { name: 'Site Oficial', url: 'https://www.btgpactual.com/' },
        ]
      },
      fundos: {
        title: 'Fundos de Investimento',
        icon: Landmark,
        points: [
          'Curadoria especializada que seleciona os melhores fundos do mercado.',
          'Acesso a fundos de investimento exclusivos da plataforma.',
          'Grande diversidade de gestoras independentes e renomadas.'
        ],
        links: [
          { name: 'Página de Fundos', url: 'https://investimentos.btgpactual.com/fundos-de-investimento' }
        ]
      }
    }
  },
  {
    name: 'XP Investimentos',
    id: 'xp',
    summary: 'Uma das maiores corretoras independentes, conhecida pela vasta prateleira de produtos e acesso a gestoras renomadas.',
    features: {
      'Renda Fixa': 8,
      'Fundos': 9,
      'Renda Variável': 7,
      'Acessibilidade': 6,
    },
    content: {
      fundos: {
        title: 'Fundos de Investimento',
        icon: Landmark,
        points: [
          'Vasta prateleira com mais de 600 fundos disponíveis.',
          'Acesso a fundos de gestoras independentes e renomadas.',
          'Permite diversificação em diferentes classes de ativos, setores e mercados.',
          'Custos incluem taxas de administração e performance, e tributação (IR e come-cotas).'
        ],
        links: [
          { name: 'Página de Fundos', url: 'https://www.xpi.com.br/produtos/fundos-investimento/' },
          { name: 'Lista de Fundos', url: 'https://www.xpi.com.br/investimentos/fundos-de-investimento/lista/' }
        ]
      },
      rendaFixa: {
        title: 'Renda Fixa',
        icon: ShieldCheck,
        points: [
          'Dezenas de opções cobertas pelo FGC (até R$ 250 mil). ',
          'Selo CETIP Certifica, garantindo segurança e transparência.',
          'Produtos: Tesouro Direto, CDBs, LCIs, LCAs, CRIs, CRAs e Debêntures.',
          'LCI, LCA, CRI, CRA e Debêntures incentivadas são isentas de IR para pessoas físicas.'
        ],
        links: [
          { name: 'Página de Renda Fixa', url: 'https://www.xpi.com.br/produtos/renda-fixa/' },
          { name: 'Simulador de Investimentos', url: 'https://www.xpi.com.br/simulador-de-investimento/' }
        ]
      },
    }
  },
  {
    name: 'Rico',
    id: 'rico',
    summary: 'Popular pela corretagem zero em renda variável, atraindo iniciantes e traders pela acessibilidade e baixo custo.',
    features: {
      'Renda Fixa': 6,
      'Fundos': 6,
      'Renda Variável': 9,
      'Acessibilidade': 9,
    },
    content: {
      rendaVariavel: {
        title: 'Renda Variável',
        icon: Percent,
        points: [
          'Corretagem Zero para Ações, FIIs, BDRs e ETFs (via plataformas digitais).',
          'Ideal para investidores iniciantes e day traders devido aos baixos custos.',
          'Outros custos operacionais (taxas Bovespa, ISS, etc) ainda podem incidir.',
          'Oferece home broker e plataformas digitais intuitivas para negociação.'
        ],
        links: [
          { name: 'Página de Custos', url: 'https://www.rico.com.vc/custos/' },
          { name: 'Site Oficial', url: 'https://www.rico.com.vc/' }
        ]
      }
    }
  },
  {
    name: 'Grão',
    id: 'grao',
    summary: 'Gestora do Grupo Primo, focada em previdência privada (ARCA) e fundos de investimento com estratégias de longo prazo.',
    features: {
      'Renda Fixa': 5, // Foco é outro
      'Fundos': 8,
      'Renda Variável': 4, // Foco é outro
      'Acessibilidade': 10,
    },
    content: {
      fundosPrevidencia: {
        title: 'Fundos e Previdência Privada',
        icon: Rocket,
        points: [
          'Acessibilidade: Investimentos a partir de R$ 100,00.',
          'Taxas justas e competitivas (Ex: ARCA com taxa de adm de 0,59% a.a.).',
          'Estratégias baseadas na metodologia ARCA de Thiago Nigro (Primo Rico).',
          'Foco em construção de patrimônio a longo prazo de forma diversificada.'
        ],
        links: [
          { name: 'Família ARCA', url: 'https://www.grao.com.br/familia-arca' },
          { name: 'Site Oficial', url: 'https://www.grao.com.br/' }
        ]
      }
    }
  }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center justify-between">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-bold ml-2">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function InvestmentPlatforms() {
  // Transforma os dados para o gráfico
  const chartData = Object.keys(platforms[0].features).map(feature => ({
    name: feature,
    ...platforms.reduce((acc, platform) => {
      (acc as any)[platform.name] = platform.features[feature as keyof typeof platform.features];
      return acc;
    }, {})
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-6 w-6" />
          Análise de Plataformas de Investimento
        </CardTitle>
        <CardDescription>
          Uma análise comparativa de algumas das principais plataformas de investimento disponíveis no mercado brasileiro.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div>
          <h3 className="text-lg font-semibold mb-2 text-center">Pontos Fortes (Escala de 0 a 10)</h3>
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize: "14px"}}/>
                <Bar dataKey="BTG Pactual" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="XP Investimentos" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Rico" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Grão" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Tabs defaultValue={platforms[0].id} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            {platforms.map(p => (
              <TabsTrigger key={p.id} value={p.id} className="text-sm">{p.name}</TabsTrigger>
            ))}
          </TabsList>

          {platforms.map(platform => (
            <TabsContent key={platform.id} value={platform.id}>
              <div className="p-4 border rounded-md mt-2 space-y-4">
                <p className="text-sm text-muted-foreground">{platform.summary}</p>
                <Accordion type="single" collapsible defaultValue={Object.keys(platform.content)[0]}>
                  {Object.entries(platform.content).map(([key, section]) => {
                    const Icon = section.icon;
                    return (
                      <AccordionItem key={key} value={key}>
                        <AccordionTrigger className="text-base">
                            <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5" />
                                {section.title}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                          <ul className="list-disc space-y-2 pl-5 mb-4">
                            {section.points.map((point, i) => (
                              <li key={i} className="text-sm text-muted-foreground">{point}</li>
                            ))}
                          </ul>
                          <div className="flex flex-wrap gap-2">
                            {section.links.map(link => (
                              <Button key={link.url} variant="outline" size="sm" asChild>
                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                  <Link className="h-4 w-4 mr-2"/>
                                  {link.name}
                                </a>
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
