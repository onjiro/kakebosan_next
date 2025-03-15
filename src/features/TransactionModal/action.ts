import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/types/supabase";
import { FormData } from "./type";

export const createTransaction = async (data: FormData, supabase: ReturnType<typeof createClient>) => {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: transaction, error } = await supabase
        .from("accounting_transactions")
        .insert({
            date: data.date,
            user_id: user!.id,
        })
        .select()
        .single();

    if (error) {
        console.error(error);
        return;
    }

    const { error: entriesError } = await supabase
        .from("accounting_entries")
        .insert([
            {
                transaction_id: transaction.id,
                user_id: user!.id,
                item_id: data.debitItemId,
                amount: data.amount,
                side: "debit",
            },
            {
                transaction_id: transaction.id,
                user_id: user!.id,
                item_id: data.creditItemId,
                amount: data.amount,
                side: "credit",
            },
        ]);

    if (entriesError) {
        console.error(entriesError);
        return;
    }
}

export const updateTransaction = async (data: FormData, transaction: Tables<"accounting_transactions"> & {
    entries: (Tables<"accounting_entries"> & {
        item: Tables<"accounting_items">;
    })[];
}, supabase: ReturnType<typeof createClient>) => {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
        .from("accounting_transactions")
        .update({
            date: data.date,
        })
        .eq("id", transaction.id);

    if (error) {
        console.error(error);
        return;
    }

    const { error: entriesDeleteError } = await supabase
        .from("accounting_entries")
        .delete()
        .eq("transaction_id", transaction.id);

    if (entriesDeleteError) {
        console.error(entriesDeleteError);
        return;
    }

    const { error: entriesError } = await supabase
        .from("accounting_entries")
        .insert([
            {
                transaction_id: transaction.id,
                user_id: user!.id,
                item_id: data.debitItemId,
                amount: data.amount,
                side: "debit",
            },
            {
                transaction_id: transaction.id,
                user_id: user!.id,
                item_id: data.creditItemId,
                amount: data.amount,
                side: "credit",
            },
        ]);

    if (entriesError) {
        console.error(entriesError);
        return;
    }
}

export const deleteTransaction = async (transaction: Tables<"accounting_transactions">, supabase: ReturnType<typeof createClient>) => {
    const { error } = await supabase
        .from("accounting_transactions")
        .delete()
        .eq("id", transaction.id);

    if (error) {
        console.error(error);
        return;
    }
}
