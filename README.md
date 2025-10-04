
      <div align="center">
        <img src="https://i.imgur.com/g9n03p7.png" alt="Flux Finance Banner"/>
      </div>
      
# Flux Finance

**[English Below]**

Flux Finance é um painel de finanças pessoais moderno e intuitivo, construído com Next.js e Firebase. Ele permite que os usuários gerenciem suas transações, visualizem seus hábitos de consumo e explorem cenários de investimento de forma educacional.

---

## ✨ Funcionalidades Principais

- **Dashboard Interativo:** Visualize seu saldo, receitas, despesas e saúde financeira em um só lugar.
- **Registro de Transações:** Adicione, edite e exclua transações de forma rápida e fácil.
- **Categorização Automática:** As transações são categorizadas para facilitar a análise.
- **Insights Financeiros:** Receba avisos, oportunidades de melhoria e ideias de investimento com base em seus dados.
- **Análise de Despesas:** Gráficos detalhados sobre a distribuição de suas despesas.
- **Mercado (Educacional):** Explore informações sobre diferentes plataformas e produtos de investimento.
- **Autenticação Segura:** Login e cadastro com o Firebase Authentication.

## 🛠️ Tecnologias Utilizadas

- **Next.js:** Framework React para produção.
- **Firebase:** Plataforma para desenvolvimento de aplicativos (Authentication, Firestore, App Hosting).
- **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
- **Tailwind CSS:** Framework CSS utility-first para estilização rápida.
- **Shadcn/ui:** Componentes de UI reusáveis e acessíveis.
- **Recharts:** Biblioteca de gráficos para React.
- **Date-fns:** Manipulação de datas em JavaScript.

## 🚀 Começando

Siga estas instruções para obter uma cópia do projeto em execução na sua máquina local para desenvolvimento e testes.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 20.x ou superior)
- [Firebase Account](https://firebase.google.com/)

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/patrick-git-bite/Flux-Finance.git
   cd Flux-Finance
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Configure as variáveis de ambiente:**
   - Crie um arquivo `.env.local` na raiz do projeto.
   - Adicione as credenciais do seu projeto Firebase a este arquivo. Você pode encontrar essas credenciais no console do Firebase, nas configurações do seu projeto (> Configurações do Projeto > Geral > Seus apps > App da Web > SDK do Firebase).

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
   ```

4. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

   Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

---

##  English

# Flux Finance

Flux Finance is a modern and intuitive personal finance dashboard built with Next.js and Firebase. It allows users to manage their transactions, visualize their spending habits, and explore investment scenarios in an educational way.

### Key Features

- **Interactive Dashboard:** View your balance, income, expenses, and financial health in one place.
- **Transaction Logging:** Add, edit, and delete transactions quickly and easily.
- **Automatic Categorization:** Transactions are categorized for easy analysis.
- **Financial Insights:** Receive warnings, improvement opportunities, and investment ideas based on your data.
- **Expense Analysis:** Detailed charts on the distribution of your expenses.
- **Market (Educational):** Explore information about different investment platforms and products.
- **Secure Authentication:** Login and registration with Firebase Authentication.

### Technologies Used

- **Next.js:** React framework for production.
- **Firebase:** Application development platform (Authentication, Firestore, App Hosting).
- **TypeScript:** Superset of JavaScript that adds static typing.
- **Tailwind CSS:** Utility-first CSS framework for rapid styling.
- **Shadcn/ui:** Reusable and accessible UI components.
- **Recharts:** Charting library for React.
- **Date-fns:** JavaScript date manipulation.
