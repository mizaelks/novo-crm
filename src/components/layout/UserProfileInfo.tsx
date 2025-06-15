import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

interface Profile {
  first_name: string | null;
  last_name: string | null;
}

const UserProfileInfo = () => {
  const { user } = useAuth();
  const { userRole, loading } = useUserRole();
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <User className="h-4 w-4" />
        {getUserDisplayName()}
      </Button>
    </div>
  );
};

export default UserProfileInfo;
