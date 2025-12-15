export interface Balance {
    currency_code: string;
    amount: number;
}

export interface Account {
    id: string;
    name: string;
    type: string;
    color: string;
    is_archived: boolean;
    balances: Balance[];
    created_at?: string;
    updated_at?: string;
}
