CREATE OR REPLACE VIEW public.time_entries_enriched AS
SELECT
  te.id              AS entry_id,
  te.date            AS entry_date,
  (te.date - ((EXTRACT(ISODOW FROM te.date) - 1)::int) * INTERVAL '1 day')::date AS week_start_date,
  te.user_id,
  p.name             AS user_name,
  p.email            AS user_email,
  p.department_id    AS user_department_id,
  d.name             AS department_name,
  pr.type            AS category,
  te.project_id,
  pr.name            AS project_name,
  ph.name            AS phase_name,
  iwa.name           AS work_area_name,
  at_ext.name        AS activity_name,
  at_int.name        AS work_area_activity_name,
  dt.name            AS deliverable_type_name,
  te.billable_status,
  (te.hours * 60 + te.minutes) AS duration_minutes,
  COALESCE(ws.is_submitted, false) AS is_submitted,
  te.task_description,
  te.deliverable_description,
  te.comments,
  te.created_at,
  te.updated_at
FROM public.time_entries te
LEFT JOIN public.profiles p           ON p.id = te.user_id
LEFT JOIN public.departments d        ON d.id = p.department_id
LEFT JOIN public.projects pr          ON pr.id = te.project_id
LEFT JOIN public.phases ph            ON ph.id = te.phase_id
LEFT JOIN public.internal_work_areas iwa ON iwa.id = te.work_area_id
LEFT JOIN public.activity_types at_ext ON at_ext.id = te.activity_type_id
LEFT JOIN public.activity_types at_int ON at_int.id = te.work_area_activity_type_id
LEFT JOIN public.deliverable_types dt  ON dt.id = te.deliverable_type
LEFT JOIN public.week_statuses ws     ON ws.user_id = te.user_id
                                      AND ws.week_start_date = (te.date - ((EXTRACT(ISODOW FROM te.date) - 1)::int) * INTERVAL '1 day')::date;