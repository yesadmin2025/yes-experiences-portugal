-- Configurable mapping rules for the YES experiences importer.
CREATE TABLE public.import_mapping_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  notes text,
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.import_mapping_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read mapping rules"
ON public.import_mapping_rules
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert mapping rules"
ON public.import_mapping_rules
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update mapping rules"
ON public.import_mapping_rules
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete mapping rules"
ON public.import_mapping_rules
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_import_mapping_rules_updated_at
BEFORE UPDATE ON public.import_mapping_rules
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Only one active ruleset at a time.
CREATE UNIQUE INDEX import_mapping_rules_one_active
ON public.import_mapping_rules ((true))
WHERE is_active;