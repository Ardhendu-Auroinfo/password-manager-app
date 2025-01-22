export interface ICategory {
    id: string;
    vault_id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateCategory {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
}