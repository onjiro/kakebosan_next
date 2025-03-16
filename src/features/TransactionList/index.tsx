"use client";
import TransactionCard from "@/components/TransactionCard";
import { Tables } from "@/types/supabase";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Transaction = Tables<"accounting_transactions"> & {
  entries: (Tables<"accounting_entries"> & {
    item: Tables<"accounting_items">;
  })[];
};

type Props = {
  initialTransactions: Transaction[];
  items: Tables<"accounting_items">[];
};

const PAGE_SIZE = 20;

export const TransactionList = ({ initialTransactions, items }: Props) => {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMoreTransactions = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const supabase = await createClient();
      const lastTransaction = transactions[transactions.length - 1];

      const { data, error } = await supabase
        .from("accounting_transactions")
        .select(
          `
          *,
          entries:accounting_entries(
            *,
            item:accounting_items(
              *
            )
          )
        `
        )
        .order("date", { ascending: false })
        .lt("date", lastTransaction.date)
        .limit(PAGE_SIZE);

      if (error) throw error;

      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }

      if (data.length > 0) {
        setTransactions((prev) => [...prev, ...data]);
      }
    } catch (error) {
      console.error("取引履歴の取得に失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, transactions]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreTransactions();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreTransactions]);

  return (
    <div className="space-y-4 p-4">
      {transactions.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          items={items}
        />
      ))}

      <div ref={observerTarget} className="h-4">
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};
