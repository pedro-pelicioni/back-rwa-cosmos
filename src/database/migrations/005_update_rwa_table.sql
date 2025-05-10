-- Adicionar coluna de geometria como string se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'rwa' 
        AND column_name = 'geometry'
    ) THEN
        ALTER TABLE rwa ADD COLUMN geometry TEXT;
    END IF;
END $$;

-- Atualizar a constraint para usar o novo nome da coluna
ALTER TABLE rwa DROP CONSTRAINT IF EXISTS positive_current_value;
ALTER TABLE rwa ADD CONSTRAINT positive_current_value CHECK (current_value > 0); 