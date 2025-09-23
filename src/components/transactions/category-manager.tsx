'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { getIconForCategory, iconList } from "@/lib/icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const formSchema = z.object({
  name: z.string().min(2, 'O nome da categoria é muito curto.'),
  icon: z.string().min(1, 'Por favor, selecione um ícone.'),
});


type CategoryManagerProps = {
  categories: Category[];
  onAddCategory: (data: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
};

export function CategoryManager({ categories, onAddCategory, onDeleteCategory }: CategoryManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      icon: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddCategory(values);
    form.reset();
    setIsDialogOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciador de Categorias</CardTitle>
        <CardDescription>Crie e gerencie suas categorias de transação.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map(category => {
            const Icon = getIconForCategory(category.icon);
            return (
              <div key={category.id} className="group relative flex flex-col items-center justify-center gap-2 rounded-lg border p-4">
                 <Icon className="h-6 w-6" />
                 <span className="text-sm font-medium text-center">{category.name}</span>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso excluirá permanentemente a categoria "{category.name}" e todas as suas transações associadas. Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteCategory(category.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                 </AlertDialog>
              </div>
            )
          })}
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <button className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <PlusCircle className="h-6 w-6" />
                  <span className="text-sm font-medium">Adicionar Categoria</span>
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Nova Categoria</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Categoria</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: Compras" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ícone</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um ícone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(iconList).map(([name, Icon]) => (
                                <SelectItem key={name} value={name}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Criar Categoria</Button>
                  </form>
                </Form>
            </DialogContent>
           </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
