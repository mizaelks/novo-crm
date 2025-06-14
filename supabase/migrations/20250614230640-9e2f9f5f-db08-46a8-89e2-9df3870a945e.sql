
-- Primeiro, vamos garantir que o usuário padrão (mizaellimadesigner@gmail.com) tenha papel de admin
-- Buscar o ID do usuário pelo email e atribuir papel de admin
DO $$
DECLARE
    default_user_id uuid;
BEGIN
    -- Buscar o ID do usuário padrão pela tabela de perfis
    SELECT id INTO default_user_id 
    FROM public.profiles 
    WHERE email = 'mizaellimadesigner@gmail.com';
    
    -- Se o usuário existir, garantir que ele tenha papel de admin
    IF default_user_id IS NOT NULL THEN
        -- Remover papel atual se existir
        DELETE FROM public.user_roles WHERE user_id = default_user_id;
        
        -- Adicionar papel de admin
        INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
        VALUES (default_user_id, 'admin', default_user_id, now())
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Usuário padrão promovido a administrador: %', default_user_id;
    ELSE
        RAISE NOTICE 'Usuário padrão não encontrado na tabela de perfis';
    END IF;
END $$;

-- Atualizar a função handle_new_user para que o primeiro usuário seja sempre admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    user_count int;
    default_role app_role;
BEGIN
    -- Inserir perfil do usuário
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data ->> 'first_name',
        new.raw_user_meta_data ->> 'last_name'
    );
    
    -- Verificar se é o usuário padrão pelo email ou se é o primeiro usuário
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    
    IF new.email = 'mizaellimadesigner@gmail.com' OR user_count = 1 THEN
        default_role := 'admin';
    ELSE
        default_role := 'user';
    END IF;
    
    -- Atribuir papel adequado
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, default_role);
    
    RETURN new;
END;
$$;
