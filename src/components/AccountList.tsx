"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/types/supabase";

type Props = {
  items: Tables<"accounting_items">[];
};

export function AccountList({ items }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const handleEdit = async (accountId: number) => {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("accounting_items")
        .update({ name: editName })
        .eq("id", accountId);

      if (error) throw error;

      setEditingId(null);
      router.refresh();
    } catch (error) {
      console.error("Error updating account:", error);
      alert("勘定科目の更新に失敗しました");
    }
  };

  const handleToggleActive = async (item: Tables<"accounting_items">) => {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("accounting_items")
        .update({ selectable: !item.selectable })
        .eq("id", item.id);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("Error toggling account status:", error);
      alert("勘定科目の状態変更に失敗しました");
    }
  };

  const itemsByType = items.reduce((acc, item) => {
    if (!acc[item.accounting_type]) {
      acc[item.accounting_type] = [];
    }
    acc[item.accounting_type].push(item);
    return acc;
  }, {} as Record<string, Tables<"accounting_items">[]>);

  const typeLabels = {
    asset: "資産",
    liability: "負債",
    income: "収入",
    expense: "支出",
  };

  return (
    <div className="space-y-6">
      {Object.entries(itemsByType).map(([type, items]) => (
        <div key={type}>
          <h3 className="text-md font-bold mb-2">
            {typeLabels[type as keyof typeof typeLabels]}
          </h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2 rounded ${
                  item.selectable ? "bg-(--background)" : "bg-(--foreground)/5"
                }`}
              >
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm mr-2"
                  />
                ) : (
                  <span className={!item.selectable ? "text-gray-500" : ""}>
                    {item.name}
                  </span>
                )}

                <div className="flex gap-2">
                  {editingId === item.id ? (
                    <>
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="text-sm text-blue-600 cursor-pointer"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-sm text-gray-600 cursor-pointer"
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditName(item.name);
                        }}
                        className="text-sm text-blue-600 cursor-pointer"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleToggleActive(item)}
                        className="text-sm text-gray-600 cursor-pointer"
                      >
                        {item.selectable ? "無効化" : "有効化"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
