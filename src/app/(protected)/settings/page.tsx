import { createClient } from "@/lib/supabase/server";
import { AccountForm } from "@/components/AccountForm";
import { AccountList } from "@/components/AccountList";

async function getItems() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounting_items")
    .select("*")
    .order("accounting_type")
    .order("name");

  if (error) throw error;
  return data;
}

export default async function SettingsPage() {
  const items = await getItems();

  return (
    <div className="pb-16">
      <h1 className="text-xl font-bold p-4">設定</h1>

      <div className="p-4 space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-4">勘定科目管理</h2>
          <AccountForm />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-4">勘定科目一覧</h2>
          <AccountList items={items} />
        </div>
      </div>
    </div>
  );
}
