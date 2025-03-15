"use client";

import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/types/supabase";
import { useForm } from "react-hook-form";
import { FormData } from "./type";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "./action";

type Props =
  | {
      transaction?: never;
      items: Tables<"accounting_items">[];
      onSubmit: VoidFunction;
      onCancel: VoidFunction;
      onDelete?: never;
    }
  | {
      transaction: Tables<"accounting_transactions"> & {
        entries: (Tables<"accounting_entries"> & {
          item: Tables<"accounting_items">;
        })[];
      };
      items: Tables<"accounting_items">[];
      onSubmit: VoidFunction;
      onCancel: VoidFunction;
      onDelete: VoidFunction;
    };

export default function TransactionModal({
  transaction,
  items,
  onSubmit,
  onCancel,
  onDelete,
}: Props) {
  const form = useForm<FormData>({
    defaultValues: transaction
      ? {
          id: transaction.id,
          amount: transaction.entries[0]!.amount,
          date: new Date(transaction.date).toISOString().split("T")[0],
          creditItemId: transaction.entries.find((e) => e.side === "credit")!
            .item_id,
          debitItemId: transaction.entries.find((e) => e.side === "debit")!
            .item_id,
        }
      : {
          amount: undefined as unknown as number,
          date: new Date().toISOString().split("T")[0],
          creditItemId: undefined as unknown as number,
          debitItemId: undefined as unknown as number,
        },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-(--background) rounded-lg p-4 w-full h-full">
        <div className="flex justify-between items-center">
          <button
            onClick={() => onCancel()}
            className="ml-2 h-10 w-10 rounded-full hover:bg-gray-100/20 text-gray-500 hover:text-gray-200"
          >
            <span className="text-2xl">×</span>
          </button>
          {transaction && (
            <button
              onClick={async () => {
                await deleteTransaction(transaction, createClient());
                onDelete();
              }}
              className="mr-2 p-2 rounded-full hover:bg-red-50/20 text-gray-500 hover:text-red-500"
            >
              <span>削除</span>
            </button>
          )}
        </div>
        <div className="p-4 h-full">
          <form
            onSubmit={form.handleSubmit(async (data: FormData) => {
              if (transaction) {
                await updateTransaction(data, transaction, createClient());
              } else {
                await createTransaction(data, createClient());
              }

              onSubmit();
            })}
            className="relative space-y-4 h-full"
          >
            <h2 className="text-xl font-bold mb-4">
              {transaction ? "取引内容編集" : "新規取引登録"}
            </h2>

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
                {transaction ? "更新" : "登録"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
