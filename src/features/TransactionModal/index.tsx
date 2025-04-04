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
import { useState } from "react";

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
  // 支出または収入の項目
  const expenseOrRevenueItems = items
    .filter((item) => item.selectable)
    .filter(
      (item) =>
        item.accounting_type === "expense" || item.accounting_type === "revenue"
    );

  // 資産、負債、純資産の項目
  const assetOrLiabilityOrEquity = items
    .filter((item) => item.selectable)
    .filter(
      (item) =>
        item.accounting_type === "asset" ||
        item.accounting_type === "liability" ||
        item.accounting_type === "equity"
    );

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
  // 支出 or 振替
  const [transactionType, setTransactionType] = useState<
    "expense" | "transfer"
  >(
    assetOrLiabilityOrEquity
      .map((item) => item.id)
      .includes(form.getValues("creditItemId"))
      ? "transfer"
      : "expense"
  );

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
            <h2 className="text-lg font-bold mb-4">
              {transaction ? "取引内容編集" : "新規取引登録"}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  取引種類
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <select
                    name="transactionType"
                    value={transactionType}
                    onChange={(e) => {
                      // 取引タイプ変更時は貸方が選択不可能な項目になっているはずなのでリセットしておく
                      form.resetField("creditItemId");
                      setTransactionType(
                        e.target.value as "expense" | "transfer"
                      );
                    }}
                    className="mt-1 w-full p-4 text-lg bg-(--base-color) rounded-md border-1 border-gray-300 inset-shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="expense">支出</option>
                    <option value="transfer">振替</option>
                  </select>
                </label>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="amount"
                >
                  金額
                </label>
                <input
                  {...form.register("amount", {
                    required: true,
                    valueAsNumber: true,
                    min: 1,
                  })}
                  type="number"
                  className="mt-1 p-4 block w-full text-lg text-right bg-(--base-color) rounded-md border-1 border-gray-300 inset-shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="date"
              >
                日付
              </label>
              <input
                {...form.register("date", {
                  required: true,
                  setValueAs: (value) =>
                    new Date(value).toISOString().split("T")[0],
                })}
                type="date"
                className="mt-1 p-4 block w-full text-lg rounded-md bg-(--base-color) border-1 border-gray-300 inset-shadow-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {transactionType === "expense" ? (
              <>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="creditItemId"
                  >
                    支出
                  </label>
                  <select
                    {...form.register("debitItemId", { required: true })}
                    className="mt-1 p-4 block w-full text-lg rounded-md bg-(--base-color) border-1 border-gray-300 inset-shadow-sm focus:border-blue-500 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="">選択してください</option>
                    {expenseOrRevenueItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="debitItemId"
                  >
                    支出元
                  </label>
                  <select
                    {...form.register("creditItemId", { required: true })}
                    className="mt-1 p-4 block w-full text-lg rounded-md bg-(--base-color) border-1 border-gray-300 inset-shadow-sm focus:border-blue-500 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="">選択してください</option>
                    {assetOrLiabilityOrEquity.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="creditItemId"
                  >
                    振替先
                  </label>
                  <select
                    {...form.register("debitItemId", { required: true })}
                    className="mt-1 p-4 block w-full text-lg rounded-md bg-(--base-color) border-1 border-gray-300 inset-shadow-sm focus:border-blue-500 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="">選択してください</option>
                    {assetOrLiabilityOrEquity.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="debitItemId"
                  >
                    振替元
                  </label>
                  <select
                    {...form.register("creditItemId", { required: true })}
                    className="mt-1 p-4 block w-full text-lg rounded-md bg-(--base-color) border-1 border-gray-300 inset-shadow-sm focus:border-blue-500 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="">選択してください</option>
                    {assetOrLiabilityOrEquity.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="absolute bottom-8 flex justify-end gap-2 w-full left-0 right-0">
              <button
                type="submit"
                className="w-full p-4 text-lg font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
