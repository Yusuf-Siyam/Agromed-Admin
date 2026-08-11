import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import { useToast } from '@/components/shared/Toast';
import { Plus, Wallet, DollarSign, Calendar, ArrowRight } from 'lucide-react';

interface ExpenseItem {
  id: string;
  date: string;
  category: 'Tax' | 'Payment Gateway Fee' | 'Platform Operating Cost' | 'Marketing Cost' | 'Refund/Adjustment' | 'Other Expenses';
  description: string;
  amount: number;
}

export default function ExpensesDashboard() {
  const { success } = useToast();

  // Mock platform expenses data
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: 'EXP-101', date: '2026-08-11', category: 'Payment Gateway Fee', description: 'SSLCommerz gateway settlement charge (Aug 1-10)', amount: 12400.00 },
    { id: 'EXP-102', date: '2026-08-10', category: 'Tax', description: 'VAT withholding tax payout (COMP-002)', amount: 21000.00 },
    { id: 'EXP-103', date: '2026-08-08', category: 'Platform Operating Cost', description: 'Vercel hosting & AWS database cluster billing', amount: 8000.00 },
    { id: 'EXP-104', date: '2026-08-05', category: 'Marketing Cost', description: 'North Bengal Facebook campaign ads boost', amount: 5000.00 },
    { id: 'EXP-105', date: '2026-08-03', category: 'Refund/Adjustment', description: 'Refund adjustments payout for cancelled booking (COMP-001)', amount: 1500.00 },
    { id: 'EXP-106', date: '2026-08-01', category: 'Other Expenses', description: 'Support office utility & stationery expenses', amount: 600.00 }
  ]);

  // Form State
  const [category, setCategory] = useState<ExpenseItem['category']>('Platform Operating Cost');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-08-11');
  const [isLoading, setIsLoading] = useState(false);

  // Search filter
  const [search, setSearch] = useState('');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    setIsLoading(true);
    setTimeout(() => {
      const newItem: ExpenseItem = {
        id: `EXP-${Math.floor(Math.random() * 900) + 100}`,
        date,
        category,
        description,
        amount: val
      };

      setExpenses((prev) => [newItem, ...prev]);
      setIsLoading(false);
      setAmount('');
      setDescription('');
      success(`Expense for "${category}" of $${val} logged successfully!`);
    }, 1000);
  };

  const columns: Column<ExpenseItem>[] = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'id', label: 'ID' },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (row) => (
        <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono font-bold border border-border uppercase">
          {row.category}
        </span>
      )
    },
    { key: 'description', label: 'Description' },
    {
      key: 'amount',
      label: 'Amount spent',
      align: 'right',
      sortable: true,
      render: (row) => `$${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    }
  ];

  // Perform filtering
  const filteredExpenses = expenses.filter((item) =>
    item.description.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate category breakdowns
  const getCategoryBreakdowns = () => {
    const totals: Record<string, number> = {
      'Tax': 0,
      'Payment Gateway Fee': 0,
      'Platform Operating Cost': 0,
      'Marketing Cost': 0,
      'Refund/Adjustment': 0,
      'Other Expenses': 0
    };
    expenses.forEach((item) => {
      if (totals[item.category] !== undefined) {
        totals[item.category] += item.amount;
      }
    });
    return totals;
  };

  const categoryBreakdowns = getCategoryBreakdowns();
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const platformRevenue = 124850.00;
  const netPlatformProfit = platformRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Platform Expenses"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Financial', href: '/expenses' }, { label: 'Expenses' }]}
        action={
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm">
            <Wallet className="h-4 w-4" />
            Expenses Ledger Active
          </div>
        }
      />

      {/* Grid: FinancialSummaryCards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FinancialSummaryCard label="Consolidated Platform Revenue" amount={platformRevenue} variant="info" />
        <FinancialSummaryCard label="Total Platform Expenses" amount={totalExpenses} variant="danger" />
        <FinancialSummaryCard label="Net Platform Profit" amount={netPlatformProfit} variant="success" />
      </div>

      {/* CSS flow visualizer representing: Revenue -> Expenses -> Net Profit */}
      <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-foreground tracking-wide uppercase px-1">Earnings Flow Analysis</h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-muted/30 border border-border/40 rounded-xl">
          {/* Revenue */}
          <div className="flex-1 text-center p-4 bg-primary/10 rounded-xl border border-primary/20 w-full">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Platform Gross Revenue</span>
            <p className="text-2xl font-black text-primary font-mono mt-1">${platformRevenue.toLocaleString()}</p>
          </div>

          <ArrowRight className="h-6 w-6 text-muted-foreground/60 hidden md:block shrink-0" />

          {/* Expenses */}
          <div className="flex-1 text-center p-4 bg-destructive/10 rounded-xl border border-destructive/20 w-full">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Operating Expenses</span>
            <p className="text-2xl font-black text-destructive font-mono mt-1">-${totalExpenses.toLocaleString()}</p>
          </div>

          <ArrowRight className="h-6 w-6 text-muted-foreground/60 hidden md:block shrink-0" />

          {/* Profit */}
          <div className="flex-1 text-center p-4 bg-info/10 rounded-xl border border-info/20 w-full">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Consolidated Net Profit</span>
            <p className="text-2xl font-black text-info font-mono mt-1">${netPlatformProfit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category breakdown visualizer */}
        <div className="lg:col-span-1 bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-foreground tracking-wide uppercase">Expenses by Category</h3>
          <div className="space-y-4 pt-1">
            {Object.keys(categoryBreakdowns).map((catName) => {
              const amountVal = categoryBreakdowns[catName];
              const pct = totalExpenses > 0 ? (amountVal / totalExpenses) * 100 : 0;
              return (
                <div key={catName} className="space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80">{catName}</span>
                    <span className="text-foreground">${amountVal.toLocaleString()} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-destructive h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Expense Form */}
        <div className="lg:col-span-2 bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-foreground tracking-wide uppercase flex items-center gap-2">
            <Plus className="h-4.5 w-4.5 text-primary" />
            Log Platform Expense
          </h3>

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Tax">Tax</option>
                  <option value="Payment Gateway Fee">Payment Gateway Fee</option>
                  <option value="Platform Operating Cost">Platform Operating Cost</option>
                  <option value="Marketing Cost">Marketing Cost</option>
                  <option value="Refund/Adjustment">Refund/Adjustment</option>
                  <option value="Other Expenses">Other Expenses</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80">Amount (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isLoading}
                    placeholder="250.00"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground/80">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  placeholder="e.g., AWS EC2 servers renewal cuts..."
                  className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80">Billing Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg shadow-sm cursor-pointer disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                Add Entry
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Expenses List Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground px-1">Audited Expenses Ledger</h3>
        <DataTable
          columns={columns}
          data={filteredExpenses}
          searchPlaceholder="Search expenses by category or description..."
          searchValue={search}
          onSearchChange={setSearch}
        />
      </div>
    </div>
  );
}
