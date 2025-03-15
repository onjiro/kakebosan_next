"use client";

import { Tables } from "@/types/supabase";
import { useState } from "react";
import TransactionModal from "../features/TransactionModal";
import { useRouter } from "next/navigation";

type Transaction = Tables<"accounting_transactions"> & {
  entries: (Tables<"accounting_entries"> & {
    item: Tables<"accounting_items">;
  })[];
};

type Props = {
  transaction: Transaction;
  items: Tables<"accounting_items">[];
};

export default function TransactionCard({ transaction, items }: Props) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className="bg-(--background) rounded-lg shadow p-4 cursor-pointer hover:bg-(--foreground)/5 transition-colors duration-200"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="text-sm text-gray-500">
              {new Date(transaction.date).toLocaleDateString("ja-JP")}
            </div>
            <div className="font-medium">{transaction.description}</div>
          </div>
          <div className="text-right">
            {transaction.entries.map((entry) => (
              <div key={entry.id} className="text-sm">
                {entry.item.name}: {entry.side === "debit" ? "借方" : "貸方"}
                {entry.amount.toLocaleString()}円
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <TransactionModal
          transaction={transaction}
          items={items}
          onSubmit={() => {
            setIsModalOpen(false);
            router.refresh();
          }}
          onDelete={() => {
            setIsModalOpen(false);
            router.refresh();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
