
-- Corrigir problema: criar perfil do usuário e depois promover para admin
DO $$
DECLARE
    user_record RECORD;
    profile_exists BOOLEAN;
BEGIN
    RAISE NOTICE '=== CORRIGINDO PROBLEMA DO PERFIL AUSENTE ===';
    
    -- Encontrar o usuário na tabela auth.users
    FOR user_record IN 
        SELECT u.id, u.email, u.raw_user_meta_data, u.created_at 
        FROM auth.users u 
        WHERE u.email = 'mizaellimadesigner@gmail.com'
    LOOP
        RAISE NOTICE 'Usuário encontrado na auth.users: ID=%, Email=%', user_record.id, user_record.email;
        
        -- Verificar se já existe perfil
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_record.id) INTO profile_exists;
        
        IF NOT profile_exists THEN
            RAISE NOTICE 'Criando perfil ausente para o usuário %', user_record.id;
            
            -- Criar perfil que está faltando
            INSERT INTO public.profiles (id, email, first_name, last_name, created_at)
            VALUES (
                user_record.id,
                user_record.email,
                user_record.raw_user_meta_data ->> 'first_name',
                user_record.raw_user_meta_data ->> 'last_name',
                user_record.created_at
            );
            
            RAISE NOTICE 'Perfil criado com sucesso para %', user_record.email;
        ELSE
            RAISE NOTICE 'Perfil já existe para %', user_record.email;
        END IF;
        
        -- Agora remover papéis existentes e adicionar admin
        DELETE FROM public.user_roles WHERE user_id = user_record.id;
        
        -- Adicionar papel de admin
        INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
        VALUES (user_record.id, 'admin', user_record.id, now());
        
        RAISE NOTICE 'Usuário % promovido para administrador com sucesso!', user_record.id;
    END LOOP;
    
    -- Verificação final
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    FOR user_record IN 
        SELECT ur.user_id, ur.role, p.email, p.first_name, p.last_name
        FROM public.user_roles ur 
        INNER JOIN public.profiles p ON ur.user_id = p.id
        WHERE ur.role = 'admin'
    LOOP
        RAISE NOTICE 'Admin confirmado - Email: %, Nome: % %', 
                     user_record.email, user_record.first_name, user_record.last_name;
    END LOOP;
    
    RAISE NOTICE '=== CORREÇÃO COMPLETA ===';
END $$;
