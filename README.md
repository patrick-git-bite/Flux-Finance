<div align="center">
  <img src="/public/logo.png" alt="Flux Finance Banner"/>
</div>

# Flux Finance

**[English Below]**

Flux Finance é um painel de finanças pessoais moderno e intuitivo, construído com Next.js e Firebase. Ele permite que os usuários gerenciem suas transações, visualizem seus hábitos de consumo e explorem cenários de investimento de forma educacional.

---

## ✨ Funcionalidades Principais

- **Painel de Controle Intuitivo**: Resumo visual do saldo, receitas e despesas mensais. Gráficos interativos mostram a evolução financeira e a distribuição de gastos por categoria.
- **Gerenciamento de Transações**: Sistema completo para adicionar, editar, excluir e filtrar transações.
- **Painel do Mercado (Educacional)**: Uma página com indicadores do mercado brasileiro e um simulador de investimentos para fins didáticos.
- **Autenticação Segura**: Sistema completo de login e cadastro de usuários com Firebase Authentication.
- **Banco de Dados Individual**: Cada usuário tem seus dados armazenados de forma segura e separada no Firestore.

## 💡 Painel do Mercado — Visão Educacional

Uma das funcionalidades de destaque do Flux Finance é o **Painel do Mercado**. Esta seção foi criada com um propósito puramente educacional, para familiarizar os usuários com conceitos básicos do mercado financeiro brasileiro.

- **Indicadores Chave**: Apresenta gráficos com dados (estáticos) de indicadores importantes como a **Taxa Selic**, **IPCA (Inflação)** e **CDI**.
- **Simulador de Rendimentos**: Uma ferramenta interativa que permite simular o rendimento bruto do saldo atual do usuário ou de aportes mensais em diferentes tipos de investimentos fictícios, como Tesouro Selic, CDB, LCI/LCA e Tesouro IPCA+.
- **Plataformas de Investimento**: Para completar a jornada educacional, a página apresenta um carrossel com informações sobre corretoras e plataformas reais do mercado, como **XP**, **Rico** e **Grão (Grupo Primo)**. O conteúdo exibido é apenas para fins de demonstração.

**Importante**: Todos os dados nesta seção são estáticos e não representam o mercado em tempo real. A funcionalidade não deve ser considerada como uma recomendação de investimento.

## 🚀 Stack de Tecnologia

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Hospedagem e Backend**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Validação de Formulários**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## ⚙️ Configuração e Execução Local

Siga os passos abaixo para executar o projeto em seu ambiente de desenvolvimento.

### Pré-requisitos

- O projeto requer [Node.js](https://nodejs.org/) (versão 18.x ou superior).
- Um gerenciador de pacotes, como [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), ou [pnpm](https://pnpm.io/).
- Uma conta gratuita no [Firebase](https://firebase.google.com/) para configurar o backend.

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/flux-finance.git
   cd flux-finance
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
   ```

5. **Abra o navegador:**
   Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação em execução.

---

## 🌐 English

Flux Finance is a modern and intuitive personal finance dashboard built with Next.js and Firebase. It allows users to manage their transactions, visualize their spending habits, and explore educational investment scenarios.

Key features and tech stack are the same as listed above. Follow the setup steps to run it locally, using the Firebase credentials from your own project.
