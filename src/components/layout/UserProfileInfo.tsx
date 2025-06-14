
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/hooks/useUserRole";

interface Profile {
  first_name: string | null;
  last_name: string | null;
}

const UserProfileInfo = () => {
  const { user } = useAuth();
  const { userRole, loading } = useUserRole();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.email || '';
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Gerente';
      default:
        return 'Usuário';
    }
  };

  const getRoleBadgeVariant = () => {
    switch (userRole) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center space-x-2">
      {!loading && (
        <Badge variant={getRoleBadgeVariant()} className="text-xs">
          {getRoleLabel()}
        </Badge>
      )}
      <span className="text-sm text-muted-foreground">
        {getUserDisplayName()}
      </span>
    </div>
  );
};

export default UserProfileInfo;
