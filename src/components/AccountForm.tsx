"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AccountForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [accounting_type, setAccountingType] = useState<
    "expense" | "revenue" | "asset" | "liability" | "equity"
  >("expense");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("ユーザーが見つかりません");
      }

      const { error } = await supabase
        .from("accounting_items")
        .insert([{ name, accounting_type, user_id: user.id, description: "" }]);

      if (error) throw error;

      setName("");
      setAccountingType("expense");
      router.refresh();
    } catch (error) {
      console.error("Error adding account:", error);
      alert("勘定科目の追加に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          科目名
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          科目種別
        </label>
        <select
          value={accounting_type}
          onChange={(e) =>
            setAccountingType(
              e.target.value as
                | "expense"
                | "revenue"
                | "asset"
                | "liability"
                | "equity"
            )
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        >
          <option value="asset">資産</option>
          <option value="liability">負債</option>
          <option value="revenue">収入</option>
          <option value="expense">支出</option>
          <option value="equity">純資産</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white rounded-md py-2 disabled:bg-blue-300"
      >
        {isSubmitting ? "登録中..." : "登録する"}
      </button>
    </form>
  );
}
