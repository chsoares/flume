# Projeto Flumen - Sistema de Fluxo de Caixa Pessoal

Você é um desenvolvedor full-stack especializado em React e TypeScript. Vou te fornecer um protótipo HTML (`prototype.html` na raiz do diretório) de uma aplicação de fluxo de caixa pessoal que precisa ser transformada em uma aplicação web moderna, robusta e totalmente configurável.

## 📋 Contexto

O protótipo atual é um arquivo HTML único com dados hardcoded. Precisamos criar uma aplicação React completa onde **NADA** seja hardcoded - tudo deve ser configurável pela interface.

**CRÍTICO**: A aplicação será executada localmente apenas quando necessária (não 24/7), portanto **TODO O ESTADO DEVE SER PERSISTIDO AUTOMATICAMENTE** no localStorage a cada mudança. O usuário deve poder fechar o navegador e ao reabrir encontrar todos os dados exatamente como deixou.

## 🎯 Objetivo

Criar uma SPA (Single Page Application) em React + TypeScript que permita:
- Gerenciar receitas (salário + extraordinárias)
- Gerenciar despesas (fixas + cotidianas + extraordinárias)
- Gerenciar investimentos com estratégia de alocação configurável
- Planejar viagens com orçamento detalhado
- Visualizar fluxo de caixa mensal com projeções e valores reais
- Diferenciar visualmente dados projetados vs concretizados
- **Persistir automaticamente todos os dados no localStorage**

## 🏗️ Arquitetura Técnica

### Stack
- **React 18** com TypeScript
- **Vite** como build tool
- **Tailwind CSS** para estilização (manter o design do protótipo)
- **Zustand** para state management
- **date-fns** para manipulação de datas
- **Recharts** para gráficos (dashboard de investimentos)
- **Lucide React** para ícones
- **localStorage** para persistência de dados (auto-save em TODA mudança)

### Estrutura de Pastas
```
flumen/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── flow/
│   │   │   ├── FlowTable.tsx
│   │   │   └── MonthDetailModal.tsx
│   │   ├── income/
│   │   │   ├── SalaryConfig.tsx
│   │   │   └── ExtraordinaryIncomeList.tsx
│   │   ├── expenses/
│   │   │   ├── FixedExpensesList.tsx
│   │   │   ├── ExtraordinaryExpensesList.tsx
│   │   │   └── DailyExpensesCalculator.tsx
│   │   ├── investments/
│   │   │   ├── InvestmentsList.tsx
│   │   │   ├── InvestmentStrategy.tsx
│   │   │   └── InvestmentDashboard.tsx
│   │   ├── trips/
│   │   │   ├── TripsList.tsx
│   │   │   └── TripForm.tsx
│   │   └── shared/
│   │       ├── CurrencyInput.tsx
│   │       ├── MonthPicker.tsx
│   │       └── Modal.tsx
│   ├── pages/
│   │   ├── FlowPage.tsx
│   │   ├── IncomePage.tsx
│   │   ├── ExpensesPage.tsx
│   │   ├── InvestmentsPage.tsx
│   │   └── TripsPage.tsx
│   ├── store/
│   │   └── financialStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── calculations.ts
│   │   ├── formatters.ts
│   │   └── persistence.ts
│   ├── hooks/
│   │   └── useAutoSave.ts
│   ├── App.tsx
│   └── main.tsx
├── prototype.html (referência)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 📊 Modelo de Dados (TypeScript Types)

```typescript
// types/index.ts

export type MonthStatus = 'projected' | 'ongoing' | 'finalized';

export interface ScheduledIncrease {
  month: string; // format: 'YYYY-MM'
  value: number;
}

export interface SalaryConfig {
  baseValue: number;
  increases: ScheduledIncrease[];
}

export interface ExtraordinaryIncome {
  id: string;
  month: string; // format: 'YYYY-MM'
  description: string;
  value: number;
}

export interface FixedExpense {
  id: string;
  name: string;
  value: number;
  increases: ScheduledIncrease[];
}

export interface ExtraordinaryExpense {
  id: string;
  description: string;
  startMonth: string; // format: 'YYYY-MM'
  installments: number;
  installmentValue: number;
}

export interface Investment {
  id: string;
  name: string;
  monthlyRate: number; // taxa mensal (ex: 0.009 = 0.9%)
  minValueTarget: number | null; // valor mínimo antes de alocar em outros (null = sem mínimo)
  allocationPercent: number; // % de alocação após atingir mínimos
  initialBalance: number;
}

export interface TripExpense {
  id: string;
  month: string; // format: 'YYYY-MM'
  description: string;
  installments: number;
  installmentValue: number;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string; // format: 'YYYY-MM-DD'
  endDate: string; // format: 'YYYY-MM-DD'
  dailyBudget: {
    food: number;
    leisure: number;
    transport: number;
  };
  preExpenses: TripExpense[]; // passagens, hotel, etc
}

export interface InvestmentMonthData {
  previousBalance: number;
  deposit: number;
  yield: number;
  finalBalance: number;
}

export interface MonthData {
  month: string; // format: 'YYYY-MM'
  status: MonthStatus;
  income: {
    salary: number;
    extraordinary: number;
  };
  expenses: {
    fixed: number;
    daily: number;
    extraordinary: number;
    trips: number;
  };
  investments: {
    [investmentId: string]: InvestmentMonthData;
  };
  // Valores reais (quando status = 'finalized')
  realData?: {
    income: {
      salary: number;
      extraordinary: number;
    };
    expenses: {
      daily: number;
    };
    investments: {
      [investmentId: string]: {
        finalBalance: number;
      };
    };
  };
}

export interface FinancialState {
  year: number;
  config: {
    salary: SalaryConfig;
    extraordinaryIncome: ExtraordinaryIncome[];
    fixedExpenses: FixedExpense[];
    dailyExpensesEstimate: number;
    extraordinaryExpenses: ExtraordinaryExpense[];
    investments: Investment[];
    trips: Trip[];
  };
  months: MonthData[];
}
```

## 🧮 Lógica de Cálculos (utils/calculations.ts)

### Funções Principais

#### 1. **calculateProjectedMonth**
```typescript
function calculateProjectedMonth(
  monthStr: string,
  config: FinancialState['config'],
  previousMonthInvestments: MonthData['investments'] | null
): MonthData
```

**Algoritmo:**
1. **Calcular receitas**
   - Salário: `getSalaryForMonth(monthStr, config.salary)`
   - Extraordinárias: somar valores de `config.extraordinaryIncome` onde `month === monthStr`

2. **Calcular despesas fixas**
   - Somar: `getFixedExpensesForMonth(monthStr, config.fixedExpenses)`

3. **Calcular despesas extraordinárias**
   - Para cada item em `config.extraordinaryExpenses`:
     - Se o mês está dentro do range [startMonth, startMonth + installments - 1], incluir `installmentValue`

4. **Calcular despesas de viagens**
   - Para cada viagem em `config.trips`:
     - Somar pré-gastos (`preExpenses`) que caem no mês atual
     - Se a viagem ocorre no mês (data entre startDate e endDate):
       - Calcular dias: `differenceInDays(endDate, startDate) + 1`
       - Somar: `dias * (dailyBudget.food + dailyBudget.leisure + dailyBudget.transport)`

5. **Calcular aportes disponíveis**
   ```
   disponivel = receitas_totais - despesas_fixas - despesas_extraordinarias - despesas_viagens
   ```

6. **Distribuir aportes nos investimentos**
   - Ordenar investimentos por prioridade:
     - Primeiro: investimentos com `minValueTarget` não atingido
     - Depois: os demais pela ordem de `allocationPercent`
   - Algoritmo de distribuição:
     ```
     Para cada investimento com minValueTarget:
       saldo_atual = previousBalance + rendimento_calculado
       se saldo_atual < minValueTarget:
         aportar = min(disponivel, minValueTarget - saldo_atual)
         disponivel -= aportar
     
     Se ainda sobrou disponivel:
       distribuir proporcionalmente pelos allocationPercent
     ```

7. **Calcular rendimentos**
   - Para cada investimento:
     ```
     rendimento = (previousBalance + deposit) * monthlyRate
     finalBalance = previousBalance + deposit + rendimento
     ```

8. **Calcular despesas cotidianas**
   ```
   despesas_cotidianas = disponivel_inicial - soma_de_todos_aportes_feitos
   ```
   **IMPORTANTE**: Usar os aportes (deposits), NÃO o saldo final (que inclui rendimento)

9. **Retornar MonthData completo**

#### 2. **recalculateDailyExpenses**
```typescript
function recalculateDailyExpenses(
  months: MonthData[],
  period: 'all' | 3 | 6 | 12
): number
```

**Lógica:**
- Filtrar meses com `status === 'finalized'`
- Se period !== 'all', pegar apenas os últimos N meses
- Calcular média de `realData.expenses.daily` desses meses
- Retornar a média (ou 0 se não houver dados)

#### 3. **getSalaryForMonth**
```typescript
function getSalaryForMonth(monthStr: string, salaryConfig: SalaryConfig): number
```

**Lógica:**
- Ordenar `increases` por mês crescente
- Iterar pelos aumentos e retornar o último `value` onde `month <= monthStr`
- Se nenhum aumento aplicável, retornar `baseValue`

#### 4. **getFixedExpensesForMonth**
```typescript
function getFixedExpensesForMonth(
  monthStr: string,
  fixedExpenses: FixedExpense[]
): number
```

**Lógica similar ao salário:**
- Para cada despesa fixa:
  - Ordenar `increases` por mês
  - Pegar o último valor válido até `monthStr`
- Somar todas as despesas fixas

#### 5. **generateMonthsForYear**
```typescript
function generateMonthsForYear(
  year: number,
  config: FinancialState['config']
): MonthData[]
```

**Lógica:**
- Gerar array de meses de Janeiro a Dezembro
- Para cada mês, chamar `calculateProjectedMonth`
- Usar investimentos do mês anterior como `previousMonthInvestments`
- Retornar array de 12 MonthData

## 💾 Persistência (utils/persistence.ts)

```typescript
const STORAGE_KEY = 'flumen-financial-data';

export function saveToLocalStorage(state: FinancialState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function loadFromLocalStorage(): FinancialState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return null;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}

export function exportToJSON(state: FinancialState): string {
  return JSON.stringify(state, null, 2);
}

export function importFromJSON(json: string): FinancialState {
  return JSON.parse(json);
}

export function clearLocalStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}
```

## 🗄️ Zustand Store (store/financialStore.ts)

```typescript
import create from 'zustand';
import { FinancialState, /* outros types */ } from '../types';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/persistence';
import { generateMonthsForYear } from '../utils/calculations';

interface FinancialStore extends FinancialState {
  // Actions
  setYear: (year: number) => void;
  
  // Salary
  updateSalary: (salary: SalaryConfig) => void;
  
  // Extraordinary Income
  addExtraordinaryIncome: (income: ExtraordinaryIncome) => void;
  updateExtraordinaryIncome: (id: string, income: Partial<ExtraordinaryIncome>) => void;
  removeExtraordinaryIncome: (id: string) => void;
  
  // Fixed Expenses
  addFixedExpense: (expense: FixedExpense) => void;
  updateFixedExpense: (id: string, expense: Partial<FixedExpense>) => void;
  removeFixedExpense: (id: string) => void;
  
  // Daily Expenses
  updateDailyExpensesEstimate: (value: number) => void;
  
  // Extraordinary Expenses
  addExtraordinaryExpense: (expense: ExtraordinaryExpense) => void;
  updateExtraordinaryExpense: (id: string, expense: Partial<ExtraordinaryExpense>) => void;
  removeExtraordinaryExpense: (id: string) => void;
  
  // Investments
  addInvestment: (investment: Investment) => void;
  updateInvestment: (id: string, investment: Partial<Investment>) => void;
  removeInvestment: (id: string) => void;
  
  // Trips
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
  removeTrip: (id: string) => void;
  
  // Months
  finalizeMonth: (monthStr: string) => void;
  updateMonthRealData: (monthStr: string, realData: MonthData['realData']) => void;
  
  // Recalculations
  recalculateAllMonths: () => void;
  
  // Persistence
  persist: () => void;
  loadFromStorage: () => void;
  resetStore: () => void;
}

const createDefaultState = (): FinancialState => ({
  year: new Date().getFullYear(),
  config: {
    salary: {
      baseValue: 0,
      increases: []
    },
    extraordinaryIncome: [],
    fixedExpenses: [],
    dailyExpensesEstimate: 0,
    extraordinaryExpenses: [],
    investments: [],
    trips: []
  },
  months: []
});

export const useFinancialStore = create<FinancialStore>((set, get) => ({
  ...createDefaultState(),
  
  persist: () => {
    saveToLocalStorage(get());
  },
  
  loadFromStorage: () => {
    const loaded = loadFromLocalStorage();
    if (loaded) {
      set(loaded);
    }
  },
  
  resetStore: () => {
    set(createDefaultState());
    get().persist();
  },
  
  setYear: (year) => {
    set({ year });
    get().recalculateAllMonths();
    get().persist();
  },
  
  updateSalary: (salary) => {
    set((state) => ({
      config: { ...state.config, salary }
    }));
    get().recalculateAllMonths();
    get().persist();
  },
  
  // Implementar demais actions seguindo o padrão:
  // 1. Atualizar state
  // 2. Chamar recalculateAllMonths() se necessário
  // 3. Chamar persist()
  
  recalculateAllMonths: () => {
    const state = get();
    const newMonths = generateMonthsForYear(state.year, state.config);
    
    // Preservar realData dos meses já finalizados
    const preservedMonths = newMonths.map((newMonth) => {
      const oldMonth = state.months.find(m => m.month === newMonth.month);
      if (oldMonth && oldMonth.status === 'finalized' && oldMonth.realData) {
        return {
          ...newMonth,
          status: 'finalized' as MonthStatus,
          realData: oldMonth.realData
        };
      }
      return newMonth;
    });
    
    set({ months: preservedMonths });
  },
  
  finalizeMonth: (monthStr) => {
    set((state) => ({
      months: state.months.map((m) =>
        m.month === monthStr
          ? {
              ...m,
              status: 'finalized' as MonthStatus,
              realData: {
                income: { ...m.income },
                expenses: { daily: m.expenses.daily },
                investments: Object.fromEntries(
                  Object.entries(m.investments).map(([id, inv]) => [
                    id,
                    { finalBalance: inv.finalBalance }
                  ])
                )
              }
            }
          : m
      )
    }));
    get().persist();
  },
  
  // ... implementar todas as outras actions
}));
```

**IMPORTANTE**: Toda action que modifica o estado DEVE chamar `persist()` ao final.

## 🎨 Interface e Componentes

### Layout Principal (App.tsx)

```tsx
function App() {
  const loadFromStorage = useFinancialStore(state => state.loadFromStorage);
  
  useEffect(() => {
    loadFromStorage();
  }, []);
  
  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header />
        <main className="p-8">
          <Routes>
            <Route path="/" element={<FlowPage />} />
            <Route path="/income" element={<IncomePage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/investments" element={<InvestmentsPage />} />
            <Route path="/trips" element={<TripsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
```

### Sidebar (components/layout/Sidebar.tsx)

**Estrutura:**
- Logo/Título do projeto
- Navegação:
  - 📊 Fluxo de Caixa
  - 💰 Receitas
  - 💸 Despesas
  - 📈 Investimentos
  - ✈️ Viagens
- Resumo rápido (cards pequenos):
  - Ano selecionado
  - Saldo anual projetado
  - Saldo final projetado
- Botões de utilidade:
  - Export JSON
  - Import JSON
  - Reset (com confirmação)

**Design:**
- Fundo escuro (`bg-slate-800`)
- Itens hover com destaque
- Item ativo com borda/fundo diferenciado

### Header (components/layout/Header.tsx)

**Conteúdo:**
- Breadcrumb da página atual
- Seletor de ano (dropdown)
- Botão de recalcular tudo (força recálculo de todos os meses)

### Página de Fluxo (pages/FlowPage.tsx)

**Estrutura:**
1. **Cards de resumo** (3 cards horizontais):
   - Saldo Anual Previsto (receitas - despesas total do ano)
   - Saldo Final Previsto (último mês, saldo de investimentos)
   - Rendimento Total (soma de todos os rendimentos do ano)

2. **Tabela de Fluxo:**

| Mês | Receitas | Despesas | Aportes | Saldo Final |
|-----|----------|----------|---------|-------------|
| Jan | R$ X     | R$ Y     | R$ Z    | R$ W        |

**Estilos por status:**
- `projected`: `text-gray-400 italic`
- `ongoing`: `text-blue-600 font-medium border-l-4 border-blue-500`
- `finalized`: `text-slate-900 font-semibold`

**Interação:**
- Ao clicar em uma linha → abrir `MonthDetailModal`

### MonthDetailModal (components/flow/MonthDetailModal.tsx)

**Layout:**
```
┌──────────────────────────────────────────────┐
│ JANEIRO 2025                [Editar] [Fechar]│
├──────────────────────────────────────────────┤
│ 📥 RECEITAS                      R$ 15.344,33│
│   Salário                        R$ 15.344,33│
│   Extraordinárias                      R$ 0,00│
├──────────────────────────────────────────────┤
│ 📤 DESPESAS                       R$ 7.400,00│
│   Fixas                                       │
│     • Plano de Saúde               R$ 800,00 │
│     • Condomínio                   R$ 600,00 │
│   Cotidianas                     R$ 6.000,00 │
│   Extraordinárias                             │
│     • Notebook (1/4)             R$ 4.000,00 │
│   Viagens                                     │
│     • Londres - Hotel              R$ 1.500,00│
├──────────────────────────────────────────────┤
│ 📊 INVESTIMENTOS                             │
│   CDB                                         │
│     Saldo Anterior               R$ 2.000,00 │
│     Aportes                      R$ 1.500,00 │
│     Rendimento (0.95%)              R$ 33,25 │
│     Saldo Final                  R$ 3.533,25 │
│   Tesouro Direto                              │
│     Saldo Anterior              R$ 55.000,00 │
│     Aportes                      R$ 3.000,00 │
│     Rendimento (0.90%)             R$ 522,00 │
│     Saldo Final                 R$ 58.522,00 │
└──────────────────────────────────────────────┘

[Concretizar Mês] (se status = projected)
```

**Modo de Edição** (quando clicar em "Editar"):
- Se status = 'finalized':
  - Permitir editar valores reais:
    - Receitas: salário real, extraordinárias reais
    - Despesas cotidianas reais
    - Saldo final real de cada investimento
- Salvar alterações no `realData`
- Botão "Salvar Alterações"

**Botão "Concretizar Mês":**
- Copia valores projetados para `realData`
- Muda status para 'finalized'
- Fecha modal
- Persiste mudanças

### Página de Receitas (pages/IncomePage.tsx)

**Seção 1: Salário Líquido**
```
┌─────────────────────────────────────────┐
│ Salário Base Líquido                     │
│ [R$ 15.344,33]                           │
│                                           │
│ Aumentos Programados                     │
│ ┌───────┬─────────────┬─────────┐       │
│ │ Mês   │ Novo Valor  │ Ações   │       │
│ ├───────┼─────────────┼─────────┤       │
│ │ 07/25 │ R$ 16.000   │ [X]     │       │
│ └───────┴─────────────┴─────────┘       │
│ [+ Adicionar Aumento]                    │
└─────────────────────────────────────────┘
```

**Seção 2: Receitas Extraordinárias**
```
┌─────────────────────────────────────────────────┐
│ Lista de Receitas Extraordinárias                │
│ ┌───────┬──────────────┬─────────┬─────────┐   │
│ │ Mês   │ Descrição    │ Valor   │ Ações   │   │
│ ├───────┼──────────────┼─────────┼─────────┤   │
│ │ 11/25 │ 13º (1ª)     │ R$ 11k  │ [E][X]  │   │
│ │ 12/25 │ 13º (2ª)     │ R$ 11k  │ [E][X]  │   │
│ └───────┴──────────────┴─────────┴─────────┘   │
│ [+ Adicionar Receita Extraordinária]             │
└─────────────────────────────────────────────────┘
```

### Página de Despesas (pages/ExpensesPage.tsx)

**Seção 1: Despesas Fixas**
- Lista similar à receitas extraordinárias
- Com suporte a aumentos programados

**Seção 2: Despesas Cotidianas**
```
┌─────────────────────────────────────────┐
│ Estimativa de Despesas Cotidianas        │
│ [R$ 6.000,00]                            │
│                                           │
│ Recalcular baseado em histórico:        │
│ [Últimos 3 meses] [6 meses] [12 meses]  │
│ [Todo o histórico]                       │
│                                           │
│ Média atual: R$ 5.847,23 (8 meses)      │
└─────────────────────────────────────────┘
```

**Seção 3: Despesas Extraordinárias**
```
┌─────────────────────────────────────────────────────┐
│ Lista de Despesas Extraordinárias                    │
│ ┌─────────┬────────┬─────────┬──────┬──────────┐   │
│ │ Descrição│ Início │ Parcelas│ Valor│ Total    │   │
│ ├─────────┼────────┼─────────┼──────┼──────────┤   │
│ │ Notebook │ 01/25  │ 4x      │ R$ 4k│ R$ 16k  │   │
│ └─────────┴────────┴─────────┴──────┴──────────┘   │
│ [+ Adicionar Despesa Extraordinária]                 │
└─────────────────────────────────────────────────────┘
```

### Página de Investimentos (pages/InvestmentsPage.tsx)

**Seção 1: Dashboard (topo)**
```
┌──────────────┬──────────────┬──────────────┐
│ CDB          │ Tesouro Dir. │ Total        │
├──────────────┼──────────────┼──────────────┤
│ Atual        │ Atual        │ Atual        │
│ R$ 28.500    │ R$ 65.200    │ R$ 93.700    │
│              │              │              │
│ Projetado    │ Projetado    │ Projetado    │
│ R$ 32.000    │ R$ 89.500    │ R$ 121.500   │
│              │              │              │
│ Rendimento   │ Rendimento   │ Rendimento   │
│ R$ 1.200     │ R$ 3.800     │ R$ 5.000     │
└──────────────┴──────────────┴──────────────┘
```

**Seção 2: Configuração de Investimentos**
```
┌────────────────────────────────────────────────────┐
│ Lista de Investimentos                              │
│ ┌──────┬────────┬───────┬──────┬────────┬─────┐   │
│ │ Nome │ Taxa % │ Meta  │ Aloc%│ Inicial│ Ações│  │
│ ├──────┼────────┼───────┼──────┼────────┼─────┤   │
│ │ CDB  │ 0.95%  │ 30k   │ 20%  │ 2k     │[E][X]│  │
│ │ VT   │ 0.90%  │ -     │ 80%  │ 55k    │[E][X]│  │
│ └──────┴────────┴───────┴──────┴────────┴─────┘   │
│ [+ Adicionar Investimento]                          │
│                                                     │
│ ⚠️ Soma de alocação: 100% ✓                        │
└────────────────────────────────────────────────────┘
```

**Validações:**
- Soma de `allocationPercent` deve ser 100%
- Mostrar warning se diferente

### Página de Viagens (pages/TripsPage.tsx)

**Lista de Viagens:**
```
┌─────────────────────────────────────────────┐
│ LONDRES                                      │
│ 01/05/2025 - 10/05/2025 (10 dias)          │
├─────────────────────────────────────────────┤
│ Orçamento Diário                             │
│ • Alimentação: R$ 250/dia                   │
│ • Lazer: R$ 150/dia                         │
│ • Transporte: R$ 50/dia                     │
│                                              │
│ Pré-gastos                                   │
│ • Passagens (Fev/25): 3x R$ 2.000          │
│ • Hotel (Abr/25): R$ 5.000                 │
│                                              │
│ Total Estimado: R$ 16.500                   │
│ [Editar] [Remover]                          │
└─────────────────────────────────────────────┘

[+ Adicionar Viagem]
```

**Formulário de Viagem (modal/page):**
```
Nome: [Londres                    ]
Data Início: [01/05/2025]
Data Fim: [10/05/2025]

Orçamento Diário:
Alimentação: [R$ 250]
Lazer: [R$ 150]
Transporte: [R$ 50]

Pré-gastos:
┌──────────┬──────┬─────────┬────────┬─────┐
│ Descrição│ Mês  │ Parcelas│ Valor  │ Ação│
├──────────┼──────┼─────────┼────────┼─────┤
│ Passagens│ 02/25│ 3x      │ R$ 2k  │ [X] │
│ Hotel    │ 04/25│ 1x      │ R$ 5k  │ [X] │
└──────────┴──────┴─────────┴────────┴─────┘
[+ Adicionar Pré-gasto]

[Salvar] [Cancelar]
```

## 🎨 Design System

### Cores (Tailwind)
- **Background**: `bg-slate-900` (main), `bg-slate-800` (sidebar)
- **Cards**: `bg-white` com `shadow-lg`
- **Primary**: `blue-500/600`
- **Success/Positive**: `green-500/600` (receitas, saldos positivos)
- **Danger/Negative**: `red-500/600` (despesas, saldos negativos)
- **Investment**: `purple-500/600`
- **Status Projected**: `gray-400`
- **Status Ongoing**: `blue-600`
- **Status Finalized**: `slate-900`

### Componentes Reutilizáveis

#### CurrencyInput (components/shared/CurrencyInput.tsx)
```tsx
interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}
```
- Input com máscara de moeda brasileira (R$)
- Formatar durante digitação
- Parse para number ao onChange

#### MonthPicker (components/shared/MonthPicker.tsx)
```tsx
interface MonthPickerProps {
  value: string; // 'YYYY-MM'
  onChange: (value: string) => void;
  label?: string;
  minDate?: string;
  maxDate?: string;
}
```
- Seletor de mês/ano
- Dropdown ou input type="month"

#### Modal (components/shared/Modal.tsx)
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```
- Modal genérico com overlay
- Fechar ao clicar fora ou ESC
- Tamanhos configuráveis

## 🔄 Fluxo de Dados e Auto-Save

### Hook useAutoSave (hooks/useAutoSave.ts)

```typescript
import { useEffect, useRef } from 'react';
import { useFinancialStore } from '../store/financialStore';

export function useAutoSave() {
  const store = useFinancialStore();
  const prevState = useRef(store);
  
  useEffect(() => {
    // Comparar se houve mudança
    if (prevState.current !== store) {
      store.persist();
      prevState.current = store;
    }
  }, [store]);
}
```

**Uso**: Chamar no App.tsx para garantir auto-save global.

### Inicialização (main.tsx ou App.tsx)

```typescript
function App() {
  const loadFromStorage = useFinancialStore(state => state.loadFromStorage);
  const recalculateAllMonths = useFinancialStore(state => state.recalculateAllMonths);
  
  useEffect(() => {
    const loaded = loadFromStorage();
    
    // Se não há dados salvos, criar estado inicial
    if (!loaded) {
      // Criar estado padrão com ano atual
      // Pode mostrar wizard de onboarding
    } else {
      // Recalcular meses para garantir consistência
      recalculateAllMonths();
    }
  }, []);
  
  useAutoSave();
  
  return (
    // ...
  );
}
```

## 📝 Funcionalidades Especiais

### 1. Export/Import JSON

**Export:**
```typescript
function handleExport() {
  const state = useFinancialStore.getState();
  const json = exportToJSON(state);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `flumen-backup-${new Date().toISOString()}.json`;
  link.click();
}
```

**Import:**
```typescript
function handleImport(file: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = e.target?.result as string;
      const state = importFromJSON(json);
      // Validar estrutura
      useFinancialStore.setState(state);
      useFinancialStore.getState().persist();
      alert('Dados importados com sucesso!');
    } catch (error) {
      alert('Erro ao importar arquivo. Verifique o formato.');
    }
  };
  reader.readAsText(file);
}
```

### 2. Validações

**Antes de salvar investimento:**
```typescript
function validateInvestments(investments: Investment[]): string[] {
  const errors: string[] = [];
  
  const totalAllocation = investments.reduce((sum, inv) => sum + inv.allocationPercent, 0);
  if (Math.abs(totalAllocation - 100) > 0.01) {
    errors.push(`Soma de alocação é ${totalAllocation}%. Deve ser 100%.`);
  }
  
  return errors;
}
```

**Mostrar warnings na UI quando necessário**

### 3. Recalcular Despesas Cotidianas

```tsx
<div>
  <label>Estimativa de Despesas Cotidianas</label>
  <CurrencyInput 
    value={dailyExpensesEstimate}
    onChange={updateDailyExpensesEstimate}
  />
  
  <div className="mt-4">
    <p className="text-sm text-gray-600 mb-2">
      Recalcular baseado em histórico:
    </p>
    <div className="flex gap-2">
      <button onClick={() => handleRecalculate(3)}>
        Últimos 3 meses
      </button>
      <button onClick={() => handleRecalculate(6)}>
        6 meses
      </button>
      <button onClick={() => handleRecalculate(12)}>
        12 meses
      </button>
      <button onClick={() => handleRecalculate('all')}>
        Todo o histórico
      </button>
    </div>
    
    {average !== null && (
      <p className="text-sm text-green-600 mt-2">
        Média calculada: {formatCurrency(average)} ({monthsCount} meses)
      </p>
    )}
  </div>
</div>
```

## 🚀 Inicialização e Estado Padrão

### Estado Inicial (quando não há dados salvos)

```typescript
const initialState: FinancialState = {
  year: new Date().getFullYear(),
  config: {
    salary: {
      baseValue: 0,
      increases: []
    },
    extraordinaryIncome: [],
    fixedExpenses: [],
    dailyExpensesEstimate: 0,
    extraordinaryExpenses: [],
    investments: [],
    trips: []
  },
  months: [] // Será populado por generateMonthsForYear
};
```

### Wizard de Onboarding (Opcional)

Primeira vez que o usuário abre:
1. Tela de boas-vindas
2. "Configurar Investimentos Iniciais"
   - Pedir saldos iniciais de cada investimento
3. "Configurar Salário Base"
4. Botão "Começar"

## 📦 Dependências (package.json)

```json
{
  "name": "flumen",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.7",
    "date-fns": "^3.0.0",
    "recharts": "^2.10.3",
    "lucide-react": "^0.300.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

## ✅ Checklist de Implementação

### Fase 1: Setup e Estrutura
- [ ] Criar projeto Vite com React + TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Configurar React Router
- [ ] Criar estrutura de pastas
- [ ] Definir todos os types em `types/index.ts`

### Fase 2: Store e Lógica
- [ ] Implementar `utils/calculations.ts` (todas as funções)
- [ ] Implementar `utils/formatters.ts` (formatCurrency, formatDate, etc)
- [ ] Implementar `utils/persistence.ts`
- [ ] Criar Zustand store completo com todas as actions
- [ ] Implementar auto-save (useAutoSave hook)

### Fase 3: Componentes Compartilhados
- [ ] CurrencyInput
- [ ] MonthPicker
- [ ] Modal
- [ ] Button variants
- [ ] Card component

### Fase 4: Layout
- [ ] Sidebar com navegação
- [ ] Header com breadcrumb e seletor de ano
- [ ] App.tsx com Router

### Fase 5: Páginas (ordem de prioridade)
- [ ] FlowPage (tabela + MonthDetailModal)
- [ ] IncomePage (salário + extraordinárias)
- [ ] ExpensesPage (fixas + cotidianas + extraordinárias)
- [ ] InvestmentsPage (configuração + dashboard)
- [ ] TripsPage (lista + formulário)

### Fase 6: Funcionalidades Finais
- [ ] Export/Import JSON
- [ ] Reset com confirmação
- [ ] Validações e mensagens de erro
- [ ] Loading states
- [ ] Responsividade mobile

### Fase 7: Polimento
- [ ] Transições e animações
- [ ] Feedback visual (toasts)
- [ ] Testes manuais de todos os fluxos
- [ ] README.md com instruções

## 📚 Formatação e Utilidades

```typescript
// utils/formatters.ts

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return format(date, 'MMM/yy', { locale: ptBR });
}

export function formatMonthFull(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return format(date, 'MMMM yyyy', { locale: ptBR });
}

export function parseMonthString(date: Date): string {
  return format(date, 'yyyy-MM');
}

export function generateUUID(): string {
  return crypto.randomUUID();
}
```

## 🎯 Observações Finais

1. **Priorize persistência**: Cada mudança no store deve disparar `persist()`
2. **Validações**: Sempre validar inputs do usuário
3. **Feedback**: Mostrar loading, sucesso, erros para o usuário
4. **Recálculo inteligente**: Só recalcular quando necessário (mudança em config)
5. **Preserve dados reais**: Ao recalcular meses, preservar `realData` de meses finalizados
6. **Responsividade**: A aplicação deve funcionar em mobile/tablet
7. **Acessibilidade**: Usar labels, ARIA quando apropriado
8. **Performance**: Evitar re-renders desnecessários (React.memo, useMemo onde fizer sentido)

## 🏁 Entregáveis Esperados

1. **Projeto funcionando** com `npm run dev`
2. **Build de produção** com `npm run build`
3. **Todas as páginas** implementadas e navegáveis
4. **Persistência** funcionando perfeitamente
5. **Cálculos** corretos e testados
6. **Interface** responsiva e polida
7. **README.md** com:
   - Descrição do projeto
   - Como instalar e rodar
   - Estrutura de pastas
   - Tecnologias usadas
   - Como usar a aplicação

## 🔍 Exemplo de Uso Esperado

1. Usuário abre a aplicação pela primeira vez
2. Estado vazio é criado com ano atual
3. Usuário vai em "Investimentos" e adiciona CDB e Tesouro Direto com saldos iniciais
4. Usuário vai em "Receitas" e configura salário base
5. Usuário vai em "Despesas" e adiciona despesas fixas
6. Usuário volta para "Fluxo" e vê os meses projetados automaticamente
7. Ao final do mês, usuário clica no mês e em "Concretizar Mês"
8. Usuário edita valores reais (despesas cotidianas reais, saldo final real dos investimentos)
9. Sistema recalcula despesas cotidianas do próximo mês baseado nos dados reais
10. Usuário fecha o navegador → todos os dados estão salvos
11. Usuário reabre no dia seguinte → tudo está como deixou

---

**Boa sorte com a implementação! 🚀**
