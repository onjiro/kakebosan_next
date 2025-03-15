"use client";

import { useState } from "react";
import TransactionModal from "../features/TransactionModal";
import { Tables } from "@/types/supabase";
import { useRouter } from "next/navigation";

type Props = {
  items: Tables<"accounting_items">[];
};

export default function NewTransactionFormButton(props: Props) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* モーダル表示のトリガーとなるボタン。右下固定表示 */}
      <div className="fixed bottom-16 right-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 w-15 h-15 shadow-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
        >
          <span className="text-2xl">+</span>
        </button>
      </div>

      {/* 新規取引登録用モーダルウィンドウ */}
      {isModalOpen && (
        <TransactionModal
          items={props.items}
          onSubmit={async () => {
            setIsModalOpen(false);
            router.refresh();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
