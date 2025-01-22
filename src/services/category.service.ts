import { config } from '../extension/config';
import { store } from '../store';
import { ICategory, ICreateCategory } from '../types/category.types';

const API_URL = config.API_URL;

export class CategoryService {
    private static async request<T>(
        endpoint: string,
        method: string = 'GET',
        body?: any
    ): Promise<T> {
        const token = store.getState().auth.token;
        
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await fetch(`${API_URL}/categories${endpoint}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            return response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static async getAllCategories(): Promise<ICategory[]> {
        return this.request<ICategory[]>('/');
    }

    static async createCategory(category: ICreateCategory): Promise<ICategory> {
        return this.request<ICategory>('/', 'POST', category);
    }

    static async updateCategory(id: string, category: Partial<ICreateCategory>): Promise<ICategory> {
        return this.request<ICategory>(`/${id}`, 'PUT', category);
    }

    static async deleteCategory(id: string): Promise<void> {
        return this.request<void>(`/${id}`, 'DELETE');
    }
}