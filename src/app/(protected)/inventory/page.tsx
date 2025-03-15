import { createClient } from "@/lib/supabase/server";

async function getAccountBalances() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounting_items")
    .select(
      `
      *,
      entries:accounting_entries(amount, side)
    `
    )
    .eq("accounting_type", "asset")
    .eq("selectable", true);

  if (error) throw error;

  return data.map((account) => {
    const balance = account.entries.reduce((sum: number, entry) => {
      return sum + (entry.side === "debit" ? entry.amount : -entry.amount);
    }, 0);
    return { ...account, balance };
  });
}

export default async function InventoryPage() {
  const accounts = await getAccountBalances();

  return (
    <div className="pb-16">
      <h1 className="text-xl font-bold p-4">棚卸管理</h1>

      <div className="space-y-4 p-4">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center">
              <div className="font-medium">{account.name}</div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {account.balance.toLocaleString()}円
                </div>
                <button className="text-sm text-blue-600 mt-2">
                  棚卸を記録
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
