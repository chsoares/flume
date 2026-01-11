# Flumen - Sistema de Fluxo de Caixa Pessoal

## 📋 Visão Geral

Sistema de gestão financeira pessoal para:
- Gerenciar receitas (salário + extraordinárias)
- Controlar despesas (fixas + cotidianas + extraordinárias)
- Planejar investimentos com alocação configurável
- Organizar viagens com orçamento detalhado
- Visualizar fluxo de caixa mensal com projeções vs valores reais

## 🏗️ Stack Tecnológico

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Zustand (state management)
- date-fns (datas)
- Recharts (gráficos)
- Lucide React (ícones)
- localStorage (persistência automática)

## 📁 Estrutura

```
app/
├── src/
│   ├── components/      # Componentes organizados por domínio
│   ├── pages/           # Páginas principais
│   ├── store/           # Zustand store
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilitários e helpers
│   ├── App.tsx          # Componente raiz
│   └── main.tsx         # Entry point
```

## 🎯 Páginas

1. **FlowPage** - Tabela mensal com resumo financeiro
2. **IncomePage** - Salário e receitas extraordinárias
3. **ExpensesPage** - Despesas fixas, cotidianas e extraordinárias
4. **InvestmentsPage** - Configuração de investimentos e dashboard
5. **TripsPage** - Planejamento de viagens

## 💾 Persistência

- **Auto-save**: Todo estado é salvo automaticamente no localStorage a cada mudança
- **Key**: `flumen-financial-data`
- **Formato**: JSON serializado
- **Import/Export**: Funcionalidades para backup e restore

## 🔑 Conceitos Chave

- **Projetado vs Concretizado**: Diferenciação visual entre dados estimados e reais
- **Status dos meses**: `projected` → `ongoing` → `finalized`
- **Alocação de investimentos**: Priorização por metas mínimas antes de distribuição percentual
- **Preservação de dados reais**: Ao recalcular, manter `realData` dos meses finalizados

## 🚀 Comandos

```bash
cd app
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run lint     # Executa ESLint
npm run preview  # Preview do build de produção
```

## ⚠️ Regras Importantes

1. Toda action que modifica o estado DEVE chamar `persist()`
2. Validações antes de salvar (ex: soma de alocação = 100%)
3. Preservar `realData` ao recalcular meses
4. Formatação correta de moedas e datas (pt-BR)
