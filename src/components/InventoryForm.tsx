"use client";

import { useState } from "react";

type Props = {
  accountId: number;
  accountName: string;
  calculatedAmount: number;
  onSubmit: (data: {
    accountId: number;
    actualAmount: number;
  }) => Promise<void>;
  onClose: () => void;
};

export function InventoryForm({
  accountId,
  accountName,
  calculatedAmount,
  onSubmit,
  onClose,
}: Props) {
  const [actualAmount, setActualAmount] = useState(calculatedAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      accountId,
      actualAmount,
    });
    onClose();
  };

  const difference = actualAmount - calculatedAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">{accountName}の棚卸</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              帳簿残高
            </label>
            <div className="mt-1 text-lg">
              {calculatedAmount.toLocaleString()}円
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              実際の残高
            </label>
            <input
              type="number"
              value={actualAmount}
              onChange={(e) => setActualAmount(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          {difference !== 0 && (
            <div className="text-sm">
              <span className="font-medium">差額: </span>
              <span
                className={difference > 0 ? "text-green-600" : "text-red-600"}
              >
                {difference.toLocaleString()}円
              </span>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 rounded-md py-2"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white rounded-md py-2"
            >
              記録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
