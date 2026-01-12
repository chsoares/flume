# Flume

Sistema completo de gestão financeira pessoal com projeções mensais, controle de investimentos e planejamento de viagens.

## 🚀 Funcionalidades

- **Gestão de Receitas**: Salário base com aumentos programados e receitas extraordinárias
- **Controle de Despesas**: Despesas fixas, cotidianas e extraordinárias com parcelamento
- **Investimentos**: Configuração de estratégia de alocação com metas mínimas e distribuição percentual
- **Viagens**: Planejamento detalhado com orçamento diário e pré-gastos parcelados
- **Fluxo de Caixa**: Visualização mensal com projeções vs valores reais
- **Persistência Automática**: Dados salvos automaticamente no localStorage

## 📦 Instalação

```bash
cd app
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173)

## 🏗️ Estrutura

```
flumen/
├── app/                    # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes por domínio
│   │   ├── pages/          # Páginas principais
│   │   ├── store/          # Zustand store
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helpers e utilitários
│   ├── package.json
│   └── vite.config.ts
├── ORIENTADOR.md          # Documentação orientadora
├── prototype.html         # Protótipo original
└── README.md              # Este arquivo
```
