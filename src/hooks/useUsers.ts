
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role?: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("useUsers: Buscando usuários...");
        
        // Buscar perfis
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name')
          .order('first_name', { ascending: true });

        if (profilesError) {
          console.error('useUsers: Erro ao buscar perfis:', profilesError);
          return;
        }

        // Buscar papéis para cada usuário
        const usersWithRoles = await Promise.all(
          (profilesData || []).map(async (profile) => {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', profile.id)
              .single();

            return {
              ...profile,
              role: roleData?.role || 'user'
            };
          })
        );

        console.log("useUsers: Usuários carregados:", usersWithRoles);
        setUsers(usersWithRoles);
      } catch (error) {
        console.error('useUsers: Erro geral:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading };
};
