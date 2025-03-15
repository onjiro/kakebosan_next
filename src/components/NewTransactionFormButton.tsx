"use client";

import { useState } from "react";
import NewTransactionForm from "./NewTransactionForm";
import { Tables } from "@/types/supabase";

type Props = {
  items: Tables<"accounting_items">[];
};

export default function NewTransactionFormButton(props: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* モーダル表示のトリガーとなるボタン。右下固定表示 */}
      <div className="fixed bottom-16 right-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 w-15 h-15 shadow-lg hover:bg-blue-700"
        >
          <span className="text-2xl">+</span>
        </button>
      </div>

      {/* 新規取引登録用モーダルウィンドウ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 w-full h-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="ml-2 h-10 w-10 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            >
              <span className="text-2xl">×</span>
            </button>
            <NewTransactionForm
              items={props.items}
              onSubmit={async () => {
                setIsModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
