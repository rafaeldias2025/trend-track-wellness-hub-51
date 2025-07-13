-- Criar tabela para armazenar dados das pesagens da balança
CREATE TABLE public.pesagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  peso_kg NUMERIC NOT NULL,
  imc NUMERIC,
  gordura_corporal_pct NUMERIC,
  agua_corporal_pct NUMERIC,
  massa_muscular_kg NUMERIC,
  massa_ossea_kg NUMERIC,
  taxa_metabolica_basal INTEGER,
  idade_metabolica INTEGER,
  gordura_visceral INTEGER,
  tipo_corpo TEXT,
  circunferencia_abdominal_cm NUMERIC,
  origem_medicao TEXT NOT NULL DEFAULT 'balança',
  data_medicao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pesagens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pesagens
CREATE POLICY "Usuários podem ver suas próprias pesagens" 
ON public.pesagens 
FOR SELECT 
USING (user_id IN (
  SELECT profiles.id 
  FROM profiles 
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Usuários podem criar suas próprias pesagens" 
ON public.pesagens 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT profiles.id 
  FROM profiles 
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Usuários podem atualizar suas próprias pesagens" 
ON public.pesagens 
FOR UPDATE 
USING (user_id IN (
  SELECT profiles.id 
  FROM profiles 
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Admins podem ver todas as pesagens" 
ON public.pesagens 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pesagens_updated_at
BEFORE UPDATE ON public.pesagens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();