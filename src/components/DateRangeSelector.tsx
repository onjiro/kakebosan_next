"use client";

import { useRouter } from "next/navigation";

type Props = {
  startDate: string;
  endDate: string;
};

export function DateRangeSelector({ startDate, endDate }: Props) {
  const router = useRouter();

  const handleDateChange = (start: string, end: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set("start", start);
    searchParams.set("end", end);
    router.push(`/reports?${searchParams.toString()}`);
  };

  return (
    <div className="p-4 bg-white border-b">
      <div className="flex gap-4">
        <div>
          <label className="block text-sm text-gray-600">開始日</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange(e.target.value, endDate)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">終了日</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange(startDate, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
