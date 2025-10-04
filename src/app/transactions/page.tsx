'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { DataTable } from '@/components/transactions/data-table';
import { columns } from '@/components/transactions/columns';
import {
  Transaction,
  Category,
} from '@/lib/data';
import { CategoryManager } from '@/components/transactions/category-manager';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { addMonths } from 'date-fns';

export default function TransactionsPage() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!user) {
      if (!authLoading) setDataLoading(false);
      return;
    };

    setDataLoading(true);

    const transactionsQuery = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
    const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const userTransactions = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Transaction)
      );
      setTransactions(userTransactions);
      setDataLoading(false);
    }, (error) => {
      console.error("Firestore (transactions) error: ", error);
      toast({ variant: 'destructive', title: 'Erro ao carregar transações', description: 'Por favor, verifique suas regras do Firestore e a conexão com a internet.' });
      setDataLoading(false);
    });

    const categoriesQuery = query(
      collection(db, 'users', user.uid, 'categories'),
      orderBy('name', 'asc')
    );
    const unsubCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const userCategories = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Category)
      );
      setCategories(userCategories);
    }, (error) => {
      console.error("Firestore (categories) error: ", error);
      toast({ variant: 'destructive', title: 'Erro ao carregar categorias' });
    });

    return () => {
      unsubTransactions();
      unsubCategories();
    };
  }, [user, authLoading, toast]);

  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id'> & { isInstallment?: boolean, installments?: number }) => {
    if (!user) return;
    try {
      const { isInstallment, installments, ...transactionData } = newTransaction;

      if (isInstallment && installments && installments > 1) {
        const batch = writeBatch(db);
        const baseDate = new Date(transactionData.date);
        const totalAmount = transactionData.amount;
        const perInstallmentAmount = parseFloat((totalAmount / installments).toFixed(2));

        for (let i = 0; i < installments; i++) {
          const installmentDate = addMonths(baseDate, i);
          const newDocRef = doc(collection(db, 'users', user.uid, 'transactions'));
          batch.set(newDocRef, {
            ...transactionData,
            amount: perInstallmentAmount,
            date: installmentDate,
            description: `${transactionData.description} (${i + 1}/${installments})`,
          });
        }
        await batch.commit();
        toast({
          title: 'Transações Parceladas Adicionadas',
          description: `${installments} transações foram registradas com sucesso.`,
        });

      } else {
        const date = transactionData.date instanceof Date 
          ? transactionData.date 
          : new Date(transactionData.date);

        await addDoc(
          collection(db, 'users', user.uid, 'transactions'),
          {...transactionData, date}
        );
        toast({
          title: 'Transação Adicionada',
          description: 'Sua nova transação foi registrada com sucesso.',
        });
      }
    } catch (error) {
      console.error('Error adding transaction: ', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Adicionar',
        description: 'Não foi possível adicionar a transação.',
      });
    }
  };

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
     if (!user) return;
    try {
      const { id, ...data } = updatedTransaction;
      const date = data.date instanceof Date 
        ? data.date 
        : new Date(data.date);

      await updateDoc(doc(db, 'users', user.uid, 'transactions', id), {...data, date});
      toast({
        title: 'Transação Atualizada',
        description: 'A transação foi atualizada com sucesso.',
      });
    } catch (error) {
      console.error('Error updating transaction: ', error);
       toast({
        variant: 'destructive',
        title: 'Erro ao Atualizar',
        description: 'Não foi possível atualizar a transação.',
      });
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) return;
    try {
       await deleteDoc(doc(db, 'users', user.uid, 'transactions', transactionId));
       toast({
        title: 'Transação Excluída',
        description: 'A transação foi excluída com sucesso.',
        variant: 'destructive'
      });
    } catch (error) {
      console.error('Error deleting transaction: ', error);
       toast({
        variant: 'destructive',
        title: 'Erro ao Excluir',
        description: 'Não foi possível excluir a transação.',
      });
    }
  };
  
  const handleAddCategory = async (newCategory: Omit<Category, 'id'>) => {
     if (!user) return;
    try {
      await addDoc(
        collection(db, 'users', user.uid, 'categories'),
        newCategory
      );
       toast({
        title: 'Categoria Adicionada',
        description: 'Nova categoria criada com sucesso.',
      });
    } catch (error) {
      console.error('Error adding category: ', error);
       toast({
        variant: 'destructive',
        title: 'Erro ao Adicionar Categoria',
        description: 'Não foi possível criar a categoria.',
      });
    }
  };
  
  const handleDeleteCategory = async (categoryId: string) => {
    if (!user) return;

    try {
      const batch = writeBatch(db);
      
      // Delete the category
      const categoryRef = doc(db, 'users', user.uid, 'categories', categoryId);
      batch.delete(categoryRef);

      // Find and delete all transactions associated with this category
      const transactionsToDelete = transactions.filter(t => t.categoryId === categoryId);
      transactionsToDelete.forEach(t => {
        const transactionRef = doc(db, 'users', user.uid, 'transactions', t.id);
        batch.delete(transactionRef);
      });

      await batch.commit();

      toast({
        title: 'Categoria Excluída',
        description: 'A categoria e suas transações foram excluídas.',
        variant: 'destructive'
      });
    } catch (error) {
      console.error('Error deleting category and transactions: ', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Excluir Categoria',
        description: 'Não foi possível excluir a categoria e suas transações.',
      });
    }
  }

  if (authLoading || dataLoading) {
    return (
      <AppLayout title="Transações">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }


  return (
    <AppLayout title="Transações">
      <div className="flex flex-col gap-8">
        <DataTable
          columns={columns({
            categories,
            onUpdate: handleUpdateTransaction,
            onDelete: handleDeleteTransaction,
          })}
          data={transactions}
          categories={categories}
          onAdd={handleAddTransaction}
        />
        <CategoryManager categories={categories} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />
      </div>
    </AppLayout>
  );
}
