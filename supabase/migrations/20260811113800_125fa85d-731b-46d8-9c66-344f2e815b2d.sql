CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 1000;

CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.operator_companies(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.subscription_plans(id),
  invoice_number text NOT NULL UNIQUE DEFAULT ('SCK-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text, 5, '0')),
  billing_cycle text NOT NULL DEFAULT 'monthly',
  amount_kes numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'KES',
  status text NOT NULL DEFAULT 'pending',
  description text,
  period_start timestamp with time zone NOT NULL DEFAULT now(),
  period_end timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days'),
  due_date timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and admins view invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (public.owns_company(auth.uid(), company_id) OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  company_id uuid NOT NULL REFERENCES public.operator_companies(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'intasend',
  method text NOT NULL DEFAULT 'mpesa',
  amount_kes numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'KES',
  status text NOT NULL DEFAULT 'pending',
  api_ref text,
  provider_invoice_id text,
  provider_state text,
  mpesa_receipt text,
  payer_phone text,
  payer_email text,
  checkout_url text,
  failure_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX payments_provider_invoice_id_idx ON public.payments(provider_invoice_id);
CREATE INDEX payments_api_ref_idx ON public.payments(api_ref);

GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and admins view payments" ON public.payments
  FOR SELECT TO authenticated
  USING (public.owns_company(auth.uid(), company_id) OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.payment_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'intasend',
  event_type text NOT NULL,
  provider_invoice_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_events TO authenticated;
GRANT ALL ON public.payment_events TO service_role;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view payment events" ON public.payment_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.payment_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.operator_companies(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'renewal_upcoming',
  channel text NOT NULL DEFAULT 'email',
  message text,
  due_at timestamp with time zone NOT NULL DEFAULT now(),
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_reminders TO authenticated;
GRANT ALL ON public.payment_reminders TO service_role;
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and admins view reminders" ON public.payment_reminders
  FOR SELECT TO authenticated
  USING (public.owns_company(auth.uid(), company_id) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_reminders_updated_at BEFORE UPDATE ON public.payment_reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();