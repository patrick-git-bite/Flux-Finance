'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, AlertTriangle, Target, Info } from 'lucide-react';
import { RuleBasedInsights } from '@/lib/financials';
import { cn } from '@/lib/utils';

// --- Reusable Sub-components --- //

/**
 * A section for displaying a list of insights, with a title and an icon.
 * Renders nothing if the list of items is empty.
 */
const InsightSection = ({
  title,
  items,
  icon: Icon,
  iconClassName,
}: {
  title: string;
  items: string[];
  icon: React.ElementType;
  iconClassName: string;
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="font-semibold mb-2 flex items-center text-md">
        <Icon className={cn("h-5 w-5 mr-2", iconClassName)} />
        {title}
      </h3>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
};


// --- Main Component --- //

type InsightsCardProps = {
    insights: RuleBasedInsights;
};

/**
 * A card component that displays financial insights, including warnings,
 * opportunities, and investment ideas.
 */
export function InsightsCard({ insights }: InsightsCardProps) {
    const { warnings, opportunities, investmentIdeas } = insights;
    const hasNoInsights = warnings.length === 0 && opportunities.length === 0 && investmentIdeas.length === 0;

    return (
        <Card className="lg:col-span-1 h-full">
            <CardHeader>
                <CardTitle>Insights e Oportunidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {hasNoInsights ? (
                    <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground py-8">
                        <Info className="h-8 w-8 mb-2"/>
                        <p className="font-semibold">Nenhum insight disponível.</p>
                        <p className="text-sm">Continue adicionando transações e nós geraremos novas ideias para você.</p>
                    </div>
                ) : (
                    <>
                        <InsightSection 
                            title="Avisos Importantes"
                            items={warnings}
                            icon={AlertTriangle}
                            iconClassName="text-yellow-500"
                        />
                        <InsightSection 
                            title="Oportunidades de Melhoria"
                            items={opportunities}
                            icon={Lightbulb}
                            iconClassName="text-sky-500"
                        />
                        <InsightSection 
                            title="Ideias para seu Dinheiro"
                            items={investmentIdeas}
                            icon={Target}
                            iconClassName="text-green-500"
                        />
                    </>
                )}
            </CardContent>
        </Card>
    );
}
