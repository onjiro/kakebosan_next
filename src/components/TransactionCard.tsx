"use client";

import { Tables } from "@/types/supabase";
import { useState } from "react";
import TransactionModal from "../features/TransactionModal";
import { useRouter } from "next/navigation";
import { FaArrowsAltH } from "@react-icons/all-files/fa/FaArrowsAltH";
import { FaCommentDollar } from "@react-icons/all-files/fa/FaCommentDollar";

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

  const debitEntries = transaction.entries.filter(
    (entry) => entry.side === "debit"
  );
  const creditEntries = transaction.entries.filter(
    (entry) => entry.side === "credit"
  );
  const isTransfer =
    debitEntries[0].item.accounting_type === "asset" ||
    debitEntries[0].item.accounting_type === "liability" ||
    debitEntries[0].item.accounting_type === "equity";

  return (
    <>
      <div
        className="bg-(--background) rounded-lg shadow p-4 cursor-pointer hover:bg-(--foreground)/5 transition-colors duration-200 flex justify-between items-start"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center gap-4">
          <div className="text-3xl">
            {isTransfer ? (
              <div className="p-2 rounded-full bg-green-500/10">
                <FaArrowsAltH className="text-green-500/50" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-orange-500/10">
                <FaCommentDollar className="text-orange-500/50" />
              </div>
            )}
          </div>
          <div>
            <div className="text-sm text-(--foreground)/60">
              {new Date(transaction.date).toLocaleDateString("ja-JP")}
            </div>
            <div className="font-xl">
              {debitEntries.map((entry) => entry.item.name).join(", ")}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-(--foreground)/60">
            {creditEntries.map((entry) => entry.item.name).join(", ")}
          </div>
          <div className="text-xl">
            {creditEntries
              .reduce((acc, entry) => acc + entry.amount, 0)
              .toLocaleString()}
            円
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
