"use client";

import { useState } from "react";
import { Account } from "@/types";

type Props = {
  accounts: Account[];
  onSubmit: (data: {
    date: string;
    description: string;
    entries: {
      account_id: number;
      amount: number;
      is_debit: boolean;
    }[];
  }) => Promise<void>;
};

export function TransactionForm({ accounts, onSubmit }: Props) {
  const [entries, setEntries] = useState([
    { account_id: 0, amount: 0, is_debit: true },
    { account_id: 0, amount: 0, is_debit: false },
  ]);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      date,
      description,
      entries,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">日付</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">説明</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className="flex gap-4">
            <select
              value={entry.account_id}
              onChange={(e) => {
                const newEntries = [...entries];
                newEntries[index].account_id = Number(e.target.value);
                setEntries(newEntries);
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">科目を選択</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={entry.amount}
              onChange={(e) => {
                const newEntries = [...entries];
                newEntries[index].amount = Number(e.target.value);
                setEntries(newEntries);
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white rounded-md py-2"
      >
        登録
      </button>
    </form>
  );
}
