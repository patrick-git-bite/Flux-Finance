'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { Transaction, Category } from '@/lib/data';
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
  Timestamp,
} from 'firebase/firestore';

/**
 * A custom hook to manage all transaction and category data for the current user.
 * It centralizes data fetching, state management, and CRUD operations.
 */
export function useTransactions() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      if (!authLoading) setLoading(false);
      return;
    }

    setLoading(true);

    const transactionsQuery = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
    const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const userTransactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: (data.date as Timestamp).toDate(), // Convert Timestamp to JS Date
        } as Transaction;
      });
      setTransactions(userTransactions);
      setLoading(false);
    }, (error) => {
      console.error("Firestore (transactions) error: ", error);
      toast({ variant: 'destructive', title: 'Erro ao carregar transações' });
      setLoading(false);
    });

    const categoriesQuery = query(
      collection(db, 'users', user.uid, 'categories'),
      orderBy('name', 'asc')
    );
    const unsubCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const userCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
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

  // --- CRUD Operations --- //

  const handleAddTransaction = async (data: Omit<Transaction, 'id'> | Omit<Transaction, 'id'>[]) => {
    if (!user) return;
    try {
        const transactionsToAdd = Array.isArray(data) ? data : [data];
        const batch = writeBatch(db);

        transactionsToAdd.forEach(transaction => {
            const newDocRef = doc(collection(db, 'users', user.uid, 'transactions'));
            batch.set(newDocRef, { ...transaction, date: new Date(transaction.date) });
        });

        await batch.commit();
        toast({ title: transactionsToAdd.length > 1 ? 'Parcelamento Registrado' : 'Transação Adicionada' });
    } catch (error) {
        console.error('Error adding transaction(s): ', error);
        toast({ variant: 'destructive', title: 'Erro ao Adicionar Transação' });
    }
  };

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    if (!user) return;
    try {
      const { id, ...data } = updatedTransaction;
      await updateDoc(doc(db, 'users', user.uid, 'transactions', id), { ...data, date: new Date(data.date) });
      toast({ title: 'Transação Atualizada' });
    } catch (error) {
      console.error('Error updating transaction: ', error);
      toast({ variant: 'destructive', title: 'Erro ao Atualizar Transação' });
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) return;
    try {
       await deleteDoc(doc(db, 'users', user.uid, 'transactions', transactionId));
       toast({ title: 'Transação Excluída', variant: 'destructive' });
    } catch (error) {
      console.error('Error deleting transaction: ', error);
       toast({ variant: 'destructive', title: 'Erro ao Excluir Transação' });
    }
  };
  
  const handleAddCategory = async (newCategory: Omit<Category, 'id'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'categories'), newCategory);
      toast({ title: 'Categoria Adicionada' });
    } catch (error) {
      console.error('Error adding category: ', error);
      toast({ variant: 'destructive', title: 'Erro ao Adicionar Categoria' });
    }
  };
  
  const handleDeleteCategory = async (categoryId: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      const categoryRef = doc(db, 'users', user.uid, 'categories', categoryId);
      batch.delete(categoryRef);

      const relatedTransactions = transactions.filter(t => t.categoryId === categoryId);
      relatedTransactions.forEach(t => {
        const transactionRef = doc(db, 'users', user.uid, 'transactions', t.id);
        batch.delete(transactionRef);
      });

      await batch.commit();
      toast({ title: 'Categoria e Transações Excluídas', variant: 'destructive' });
    } catch (error) {
      console.error('Error deleting category: ', error);
      toast({ variant: 'destructive', title: 'Erro ao Excluir Categoria' });
    }
  }

  return {
    user,
    transactions,
    categories,
    loading: authLoading || loading,
    addTransaction: handleAddTransaction,
    updateTransaction: handleUpdateTransaction,
    deleteTransaction: handleDeleteTransaction,
    addCategory: handleAddCategory,
    deleteCategory: handleDeleteCategory,
  };
}
