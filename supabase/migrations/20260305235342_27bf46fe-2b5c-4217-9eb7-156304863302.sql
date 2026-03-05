CREATE TABLE public.validation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL DEFAULT 'cap_blocked',
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.validation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own validation_events"
  ON public.validation_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "validation_events_select"
  ON public.validation_events FOR SELECT
  USING (
    user_id = auth.uid()
    OR has_permission(auth.uid(), 'time:read_all')
    OR (has_permission(auth.uid(), 'time:read_department')
        AND is_department_scoped(auth.uid(), (SELECT department_id FROM profiles WHERE id = validation_events.user_id)))
  );