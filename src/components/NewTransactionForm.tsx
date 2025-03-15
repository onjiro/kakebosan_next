"use client";

import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";
import { useForm } from "react-hook-form";

type AccountingItem = Database["public"]["Tables"]["accounting_items"]["Row"];

type Props = {
  items: AccountingItem[];
  onSubmit: VoidFunction;
};

type FormData = {
  amount: number;
  date: string;
  creditItemId: number;
  debitItemId: number;
};

export default function NewTransactionForm({ onSubmit, items }: Props) {
  const form = useForm<FormData>({
    defaultValues: {
      amount: undefined as unknown as number,
      date: new Date().toISOString().split("T")[0],
      creditItemId: undefined as unknown as number,
      debitItemId: undefined as unknown as number,
    },
  });

  const handleSubmit = async (data: FormData) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: transaction, error } = await supabase
      .from("accounting_transactions")
      .insert({
        date: data.date,
        user_id: user!.id,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    const { error: entriesError } = await supabase
      .from("accounting_entries")
      .insert([
        {
          transaction_id: transaction.id,
          user_id: user!.id,
          item_id: data.debitItemId,
          amount: data.amount,
          side: "debit",
        },
        {
          transaction_id: transaction.id,
          user_id: user!.id,
          item_id: data.creditItemId,
          amount: data.amount,
          side: "credit",
        },
      ]);

    if (entriesError) {
      console.error(entriesError);
      return;
    }
    onSubmit();
  };

  return (
    <div className="bg-white p-6 rounded-lg h-full">
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="relative space-y-4 h-full"
      >
        <h2 className="text-xl font-bold mb-4">新規取引登録</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            金額
          </label>
          <input
            {...form.register("amount", {
              required: true,
              valueAsNumber: true,
              min: 1,
            })}
            type="number"
            className="mt-1 block w-full text-right rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            日付
          </label>
          <input
            {...form.register("date", {
              required: true,
              setValueAs: (value) =>
                new Date(value).toISOString().split("T")[0],
            })}
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            支出
          </label>
          <select
            {...form.register("creditItemId", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {items
              .filter(
                (item) =>
                  item.accounting_type === "expense" ||
                  item.accounting_type === "revenue"
              )
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            支出元
          </label>
          <select
            {...form.register("debitItemId", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {items
              .filter(
                (item) =>
                  item.accounting_type === "asset" ||
                  item.accounting_type === "liability" ||
                  item.accounting_type === "equity"
              )
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>

        <div className="absolute bottom-8 flex justify-end gap-2 w-full left-0 right-0">
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!form.formState.isValid}
          >
            登録
          </button>
        </div>
      </form>
    </div>
  );
}
