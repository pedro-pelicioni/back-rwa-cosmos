-- Adicionar coluna updated_at à tabela kyc
ALTER TABLE kyc ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_kyc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_kyc_updated_at
    BEFORE UPDATE ON kyc
    FOR EACH ROW
    EXECUTE FUNCTION update_kyc_updated_at(); 