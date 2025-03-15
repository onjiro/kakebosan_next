export type Transaction = {
    id: string;
    date: string;
    description: string;
    entries: AccountingEntry[];
};

export type AccountingEntry = {
    id: string;
    transaction_id: string;
    amount: number;
    side: "debit" | "credit";
    item: AccountingItem;
};

export type AccountingItem = {
    id: number;
    name: string;
    description: string;
    accounting_type: "asset" | "liability" | "income" | "expense";
    selectable: boolean;
};
