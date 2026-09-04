import type { CategoryNavigationItem } from '../types/categories';
import { mockCategories } from '../data/categories.mock';
import { apiClient, isApiConfigured } from './apiClient';

export async function getCategories(): Promise<CategoryNavigationItem[]> {
    if( !isApiConfigured ) {
        return mockCategories;
    }
    try {
        const response = await apiClient.get<CategoryNavigationItem[]>('/categories');
        return response.data;
    }catch( error ) {
        console.warn('Failed to fetch categories from API, falling back to mock data.', error);
        return mockCategories;
    }
}