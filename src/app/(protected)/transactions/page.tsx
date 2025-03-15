import { createClient } from "@/lib/supabase/server";
import NewTransactionFormButton from "@/components/NewTransactionFormButton";
import TransactionCard from "@/components/TransactionCard";

// 60秒ごとに再検証
export const revalidate = 60;

const getTransactions = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounting_transactions")
    .select(
      `
      *,
      entries:accounting_entries(
        *,
        item:accounting_items(
          *
        )
      )
    `
    )
    .order("date", { ascending: false });

  if (error) throw error;
  return data;
};

const getItems = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("accounting_items").select("*");
  if (error) throw error;
  return data;
};

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  const items = await getItems();

  return (
    <div className="pb-16">
      <h1 className="text-xl font-bold p-4">取引履歴</h1>

      <NewTransactionFormButton items={items} />

      <div className="space-y-4 p-4">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            items={items}
          />
        ))}
      </div>
    </div>
  );
}
