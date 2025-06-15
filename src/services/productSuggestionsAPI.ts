
import { supabase } from "@/integrations/supabase/client";

export interface ProductSuggestion {
  id: string;
  name: string;
  description?: string;
  category: string;
  price?: number;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export const productSuggestionsAPI = {
  getAll: async (): Promise<ProductSuggestion[]> => {
    const { data, error } = await supabase
      .from('product_suggestions')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      isActive: item.is_active,
      usageCount: item.usage_count,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  },

  getPopular: async (limit: number = 10): Promise<ProductSuggestion[]> => {
    const { data, error } = await supabase
      .from('product_suggestions')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      isActive: item.is_active,
      usageCount: item.usage_count,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  },

  create: async (data: Omit<ProductSuggestion, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<ProductSuggestion> => {
    const { data: created, error } = await supabase
      .from('product_suggestions')
      .insert([{
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        is_active: data.isActive
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: created.id,
      name: created.name,
      description: created.description,
      category: created.category,
      price: created.price,
      isActive: created.is_active,
      usageCount: created.usage_count,
      createdAt: created.created_at,
      updatedAt: created.updated_at
    };
  },

  update: async (id: string, data: Partial<Omit<ProductSuggestion, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProductSuggestion> => {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    
    updateData.updated_at = new Date().toISOString();
    
    const { data: updated, error } = await supabase
      .from('product_suggestions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      category: updated.category,
      price: updated.price,
      isActive: updated.is_active,
      usageCount: updated.usage_count,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at
    };
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('product_suggestions')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  incrementUsage: async (productName: string): Promise<void> => {
    const { error } = await supabase.rpc('increment_product_usage', {
      product_name: productName
    });
    
    if (error) {
      console.error("Error incrementing product usage:", error);
    }
  }
};
