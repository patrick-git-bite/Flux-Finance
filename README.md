# Flux Finance

**[English Below]**

Flux Finance é um painel de finanças pessoais moderno, inteligente e intuitivo, construído com Next.js, Firebase e Genkit. Ele permite que os usuários gerenciem suas transações, obtenham insights sobre seus hábitos de consumo e explorem cenários de investimento de forma educacional.

---

## ✨ Funcionalidades Principais

- **Painel de Controle Intuitivo**: Resumo visual do saldo, receitas e despesas mensais. Gráficos interativos mostram a evolução financeira e a distribuição de gastos por categoria.
- **Gerenciamento de Transações**: Sistema completo para adicionar, editar, excluir e filtrar transações.
- **Categorização com IA**: Ao adicionar uma transação, uma IA (usando Genkit) analisa a descrição e sugere a categoria mais provável, agilizando o processo.
- **Insights Financeiros**: Uma seção dedicada que analisa os dados do usuário para fornecer pontos de atenção, oportunidades de melhoria e uma pontuação de "saúde financeira".
- **Simulador de Mercado**: Uma página educacional com indicadores econômicos do Brasil (SELIC, IPCA, CDI) e um simulador interativo para projetar rendimentos com base no saldo atual ou em aportes mensais.
- **Autenticação Segura**: Sistema completo de login e cadastro de usuários com Firebase Authentication.
- **Banco de Dados Individual**: Cada usuário tem seus dados armazenados de forma segura e separada no Firestore.

## 🚀 Stack de Tecnologia

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Hospedagem e Backend**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **Funcionalidades de IA**: [Google Genkit](https://firebase.google.com/docs/genkit)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Validação de Formulários**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## ⚙️ Configuração e Execução Local

Siga os passos abaixo para executar o projeto em seu ambiente de desenvolvimento.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Git](https://git-scm.com/)

### 1. Clone o Repositório

```bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd SEU_REPOSITORIO
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Firebase

O projeto precisa se conectar a um projeto Firebase para funcionar.

1.  Acesse o [console do Firebase](https://console.firebase.google.com/).
2.  Crie um novo projeto ou use um existente.
3.  Adicione um **Aplicativo da Web** (`</>`) ao seu projeto.
4.  Copie o objeto de configuração `firebaseConfig`.
5.  Cole o objeto que você copiou no arquivo `src/lib/firebase.ts`, substituindo o conteúdo existente.

### 4. Execute o Projeto

```bash
npm run dev
```

Abra [http://localhost:9002](http://localhost:9002) em seu navegador para ver o aplicativo em ação.

---
<br>

# Flux Finance (English)

Flux Finance is a modern, smart, and intuitive personal finance dashboard built with Next.js, Firebase, and Genkit. It allows users to manage their transactions, gain insights into their spending habits, and explore investment scenarios in an educational way.

---

## ✨ Key Features

- **Intuitive Dashboard**: Visual summary of current balance, monthly income, and expenses. Interactive charts show financial evolution and spending distribution by category.
- **Transaction Management**: A complete system to add, edit, delete, and filter transactions.
- **AI-Powered Categorization**: When adding a transaction, an AI (using Genkit) analyzes the description and suggests the most likely category, speeding up the process.
- **Financial Insights**: A dedicated section that analyzes user data to provide warnings, opportunities for improvement, and a "financial health" score.
- **Market Simulator**: An educational page with economic indicators from Brazil (SELIC, IPCA, CDI) and an interactive simulator to project returns based on the current balance or monthly contributions.
- **Secure Authentication**: Complete user login and registration system with Firebase Authentication.
- **Individual Database**: Each user's data is stored securely and separately in Firestore.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Hosting & Backend**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **AI Features**: [Google Genkit](https://firebase.google.com/docs/genkit)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Form Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## ⚙️ Setup and Local Execution

Follow the steps below to run the project in your development environment.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USER/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

The project needs to connect to a Firebase project to work.

1.  Go to the [Firebase console](https://console.firebase.google.com/).
2.  Create a new project or use an existing one.
3.  Add a **Web App** (`</>`) to your project.
4.  Copy the `firebaseConfig` configuration object.
5.  Paste the copied object into the `src/lib/firebase.ts` file, replacing the existing content.

### 4. Run the Project

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser to see the application in action.
