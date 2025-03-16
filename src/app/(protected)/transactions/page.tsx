import { createClient } from "@/lib/supabase/server";
import NewTransactionFormButton from "@/components/NewTransactionFormButton";
import { TransactionList } from "@/features/TransactionList";

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
    .order("date", { ascending: false })
    .limit(20);
  if (error) throw error;

  return data;
};

const getItems = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounting_items")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;

  return data;
};

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  const items = await getItems();

  return (
    <div className="pb-16">
      <h1 className="text-xl font-bold p-8">取引履歴</h1>
      <NewTransactionFormButton items={items} />
      <TransactionList initialTransactions={transactions} items={items} />
    </div>
  );
}
