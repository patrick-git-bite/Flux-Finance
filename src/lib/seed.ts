import { collection, writeBatch, getDocs, query, doc } from 'firebase/firestore';
import { db } from './firebase';
import { Category, Transaction } from './data';
import { subMonths, getYear, getMonth, startOfMonth, addMonths, eachDayOfInterval, endOfMonth, set } from 'date-fns';

/**
 * Returns a random date within a given month and year.
 */
function getRandomDateInMonth(month: number, year: number): Date {
    const startDate = startOfMonth(new Date(year, month));
    const endDate = endOfMonth(new Date(year, month));
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return days[Math.floor(Math.random() * days.length)];
}

/**
 * Generates a realistic and parameterized set of transactions for the last 6 months.
 * This creates a guided-tour-like experience for new users.
 */
function generateTransactions(categories: Category[]): Omit<Transaction, 'id'>[] {
    const transactions: Omit<Transaction, 'id'>[] = [];
    const now = new Date();

    // Find essential categories by name
    const incomeCategory = categories.find(c => c.name === 'Salário')!;
    const housingCategory = categories.find(c => c.name === 'Moradia')!;
    const billsCategory = categories.find(c => c.name === 'Contas')!;
    const techCategory = categories.find(c => c.name === 'Eletrônicos')!;
    const foodCategory = categories.find(c => c.name === 'Alimentação')!;
    const leisureCategory = categories.find(c => c.name === 'Lazer')!;
    const transportCategory = categories.find(c => c.name === 'Transporte')!;

    // --- INSTALLMENT PURCHASE DEMO ---
    // Simulates buying a notebook 3 months ago in 3 installments.
    const purchaseDate = subMonths(now, 3);
    const notebookValue = 3600;
    const installmentValue = notebookValue / 3;

    for (let i = 0; i < 3; i++) {
        const installmentDate = addMonths(purchaseDate, i);
        transactions.push({
            type: 'expense',
            expenseType: 'fixed', // Installments are treated as fixed expenses
            amount: installmentValue,
            categoryId: techCategory.id,
            description: `Notebook (Parcela ${i + 1}/3)`,
            date: installmentDate,
            isInstallment: true,
            installmentNumber: i + 1,
            totalInstallments: 3,
        });
    }

    // --- RECURRING & VARIABLE TRANSACTIONS FOR THE LAST 6 MONTHS ---
    for (let i = 5; i >= 0; i--) {
        const targetMonthDate = subMonths(now, i);
        const month = getMonth(targetMonthDate);
        const year = getYear(targetMonthDate);
        const baseDateForMonth = new Date(year, month);

        // 1. Monthly Salary
        transactions.push({
            type: 'income',
            amount: 5200,
            categoryId: incomeCategory.id,
            description: 'Salário Mensal',
            date: startOfMonth(targetMonthDate),
        });

        // 2. Fixed Expenses (Rent & Bills)
        transactions.push({
            type: 'expense',
            expenseType: 'fixed',
            amount: 1500,
            categoryId: housingCategory.id,
            description: 'Aluguel & Condomínio',
            date: set(baseDateForMonth, { date: 5 }),
        });
         transactions.push({
            type: 'expense',
            expenseType: 'fixed',
            amount: 120,
            categoryId: billsCategory.id,
            description: 'Plano de Internet e Celular',
            date: set(baseDateForMonth, { date: 10 }),
        });

        // 3. Variable Expenses (Groceries, Restaurants, etc.)
        const variableExpenses = [
            { cat: foodCategory, desc: 'Supermercado do Mês', amount: 450 },
            { cat: foodCategory, desc: 'Restaurante com amigos', amount: 120 },
            { cat: transportCategory, desc: 'Crédito para Transporte', amount: 150 },
            { cat: leisureCategory, desc: 'Ingresso de Cinema', amount: 45 },
            { cat: foodCategory, desc: 'Padaria', amount: 30 },
            { cat: leisureCategory, desc: 'Livro ou Revista', amount: 50 },
        ];

        variableExpenses.forEach(exp => {
             transactions.push({
                type: 'expense',
                expenseType: 'variable',
                amount: exp.amount * (0.9 + Math.random() * 0.2), // Add small variation
                categoryId: exp.cat.id,
                description: exp.desc,
                date: getRandomDateInMonth(month, year),
            });
        });
    }

    return transactions;
}

/**
 * Seeds the user's database with a set of initial categories and 6 months of sample transactions.
 * This function will not run if the user already has transactions.
 * @param userId The ID of the user for whom to seed the database.
 */
export async function seedDatabase(userId: string) {
    try {
        const transactionsCheckRef = collection(db, 'users', userId, 'transactions');
        const q = query(transactionsCheckRef);
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            console.log('Database already seeded. Aborting.');
            throw new Error('Sua conta já possui dados. O preenchimento com dados de exemplo foi cancelado.');
        }
        
        const batch = writeBatch(db);
        
        const categoriesRef = collection(db, 'users', userId, 'categories');
        const addedCategories: Category[] = [];

        // Use a predefined list of categories for consistency
        const categoriesToCreate = [
            { name: 'Salário', color: '#16a34a' }, // Green
            { name: 'Moradia', color: '#f97316' }, // Orange
            { name: 'Contas', color: '#3b82f6' }, // Blue
            { name: 'Alimentação', color: '#ef4444' }, // Red
            { name: 'Transporte', color: '#8b5cf6' }, // Violet
            { name: 'Lazer', color: '#ec4899' }, // Pink
            { name: 'Saúde', color: '#14b8a6' }, // Teal
            { name: 'Eletrônicos', color: '#64748b' }, // Slate
            { name: 'Outros', color: '#9ca3af' }, // Gray
        ];

        categoriesToCreate.forEach(category => {
            const docRef = doc(categoriesRef);
            batch.set(docRef, category);
            addedCategories.push({ id: docRef.id, ...category });
        });

        const transactionsRef = collection(db, 'users', userId, 'transactions');
        const transactions = generateTransactions(addedCategories);
        transactions.forEach(transaction => {
            const docRef = doc(transactionsRef);
            batch.set(docRef, {
                ...transaction,
                date: transaction.date
            });
        });

        await batch.commit();

    } catch (error) {
        console.error("Error seeding database:", error);
        throw new Error("Ocorreu um erro ao tentar preencher os dados. Verifique o console.");
    }
}
