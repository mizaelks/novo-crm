
-- Verificar e promover o usuário padrão para administrador
DO $$
DECLARE
    default_user_id uuid;
    existing_role text;
BEGIN
    -- Primeiro, vamos encontrar o usuário pelo email na tabela auth.users
    -- e depois localizar na tabela profiles
    SELECT p.id INTO default_user_id 
    FROM public.profiles p
    INNER JOIN auth.users u ON p.id = u.id
    WHERE u.email = 'mizaellimadesigner@gmail.com' OR p.email = 'mizaellimadesigner@gmail.com';
    
    IF default_user_id IS NOT NULL THEN
        -- Verificar papel atual
        SELECT role INTO existing_role 
        FROM public.user_roles 
        WHERE user_id = default_user_id;
        
        RAISE NOTICE 'Usuário encontrado: %, papel atual: %', default_user_id, existing_role;
        
        -- Remover todos os papéis existentes
        DELETE FROM public.user_roles WHERE user_id = default_user_id;
        
        -- Adicionar papel de admin
        INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
        VALUES (default_user_id, 'admin', default_user_id, now());
        
        RAISE NOTICE 'Usuário % promovido para administrador com sucesso!', default_user_id;
    ELSE
        RAISE NOTICE 'Usuário padrão mizaellimadesigner@gmail.com não encontrado no sistema';
        
        -- Listar todos os usuários para debug
        RAISE NOTICE 'Usuários existentes na tabela profiles:';
        FOR default_user_id IN 
            SELECT id FROM public.profiles 
        LOOP
            RAISE NOTICE 'User ID: %', default_user_id;
        END LOOP;
    END IF;
END $$;

-- Garantir que qualquer usuário que já existe com este email seja admin
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id IN (
    SELECT p.id 
    FROM public.profiles p 
    INNER JOIN auth.users u ON p.id = u.id 
    WHERE u.email = 'mizaellimadesigner@gmail.com' OR p.email = 'mizaellimadesigner@gmail.com'
);

-- Se não existe papel para este usuário, criar um
INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
SELECT p.id, 'admin', p.id, now()
FROM public.profiles p 
INNER JOIN auth.users u ON p.id = u.id 
WHERE (u.email = 'mizaellimadesigner@gmail.com' OR p.email = 'mizaellimadesigner@gmail.com')
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id
);
