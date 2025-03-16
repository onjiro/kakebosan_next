import { DateRangeSelector } from "@/components/DateRangeSelector";
import { createClient } from "@/lib/supabase/server";

async function getAccountSummary(startDate: string, endDate: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounting_transactions")
    .select(
      `
      entries:accounting_entries(
        amount,
        side,
        item:accounting_items(
          id,
          name,
          accounting_type
        )
      )
    `
    )
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) throw error;

  const summary = data.reduce((acc, transaction) => {
    transaction.entries.forEach((entry) => {
      const itemId = entry.item.id;
      if (!acc[itemId]) {
        acc[itemId] = {
          name: entry.item.name,
          type: entry.item.accounting_type,
          total: 0,
        };
      }

      // 収入・費用の計算ロジック
      if (entry.item.accounting_type === "revenue") {
        acc[itemId].total +=
          entry.side === "debit" ? -entry.amount : entry.amount;
      } else if (entry.item.accounting_type === "expense") {
        acc[itemId].total +=
          entry.side === "debit" ? entry.amount : -entry.amount;
      }
    });
    return acc;
  }, {} as Record<number, { name: string; type: string; total: number }>);

  return Object.values(summary);
}

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>;
};

export default async function ReportsPage(props: Props) {
  const { start, end } = await props.searchParams;
  const startDate = start || new Date().toISOString().split("T")[0];
  const endDate = end || new Date().toISOString().split("T")[0];

  const summary = await getAccountSummary(startDate, endDate);

  const income = summary.filter((item) => item.type === "income");
  const expense = summary.filter((item) => item.type === "expense");

  const totalIncome = income.reduce((sum, item) => sum + item.total, 0);
  const totalExpense = expense.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="pb-16">
      <h1 className="text-xl font-bold p-4">集計</h1>

      <DateRangeSelector startDate={startDate} endDate={endDate} />

      <div className="p-4 space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-4">収支サマリー</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>収入合計</span>
              <span className="text-green-600">
                {totalIncome.toLocaleString()}円
              </span>
            </div>
            <div className="flex justify-between">
              <span>支出合計</span>
              <span className="text-red-600">
                {totalExpense.toLocaleString()}円
              </span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>収支差額</span>
              <span
                className={
                  totalIncome - totalExpense >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {(totalIncome - totalExpense).toLocaleString()}円
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-4">収入内訳</h2>
          <div className="space-y-2">
            {income.map((item) => (
              <div key={item.name} className="flex justify-between">
                <span>{item.name}</span>
                <span>{item.total.toLocaleString()}円</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-4">支出内訳</h2>
          <div className="space-y-2">
            {expense.map((item) => (
              <div key={item.name} className="flex justify-between">
                <span>{item.name}</span>
                <span>{item.total.toLocaleString()}円</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
