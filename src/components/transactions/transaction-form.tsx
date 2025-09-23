'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Category, Transaction } from '@/lib/data';
import { getIconForCategory } from '@/lib/icons.tsx';
import { Textarea } from '../ui/textarea';
import { suggestTransactionCategory } from '@/ai/flows/suggest-transaction-category';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  date: z.date({ required_error: 'A data é obrigatória.' }),
  amount: z.coerce.number().positive('O valor deve ser positivo.'),
  categoryId: z.string().min(1, 'Por favor, selecione uma categoria.'),
  description: z.string().min(2, 'A descrição é muito curta.'),
});

type TransactionFormProps = {
  categories: Category[];
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
  defaultValues?: Partial<Omit<Transaction, 'id'> & { date: Date | string }>;
};

export function TransactionForm({
  categories,
  onSubmit,
  defaultValues,
}: TransactionFormProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: defaultValues?.type || 'expense',
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      amount: defaultValues?.amount ?? '',
      categoryId: defaultValues?.categoryId || '',
      description: defaultValues?.description || '',
    },
  });

  const handleSuggestCategory = async () => {
    const description = form.getValues('description');
    if (description.length < 5 || isSuggesting) return;

    setIsSuggesting(true);
    try {
      const { categoryId } = await suggestTransactionCategory({
        description,
        categories,
      });

      if (categoryId && categories.some(c => c.id === categoryId)) {
        form.setValue('categoryId', categoryId, { shouldValidate: true });
        toast({
          title: 'Categoria Sugerida!',
          description: (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Nossa IA sugeriu uma categoria para você.</span>
            </div>
          ),
        });
      }
    } catch (error) {
      console.error('Falha ao sugerir categoria:', error);
      // Não exibe toast de erro para não interromper o usuário
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleUpdateWithDateConversion = (values: z.infer<typeof formSchema>) => {
    const dataToSubmit = {
      ...values,
      date: values.date.toISOString(),
    };
    onSubmit(dataToSubmit);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpdateWithDateConversion)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="expense" />
                    </FormControl>
                    <FormLabel className="font-normal">Despesa</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="income" />
                    </FormControl>
                    <FormLabel className="font-normal">Renda</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: ptBR })
                        ) : (
                          <span>Escolha uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0,00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="ex: Café com amigos"
                  {...field}
                  onBlur={handleSuggestCategory}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Categoria
                {isSuggesting && <Sparkles className="ml-2 h-4 w-4 animate-pulse text-primary" />}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => {
                    const Icon = getIconForCategory(category.icon);
                    return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {category.name}
                      </div>
                    </SelectItem>
                  )})}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {defaultValues ? 'Salvar Alterações' : 'Adicionar Transação'}
        </Button>
      </form>
    </Form>
  );
}
