## Brick 4: Internal Work Areas CRUD — ✅ DONE

Implemented admin management for Internal Work Areas on the "Work Areas" tab. Work areas belong to a department and link to a phase. Changes propagate automatically to entry forms via `getPhasesForProject`.

### Files Changed
- `src/contexts/ReferenceDataContext.tsx` — Added `addWorkArea`, `updateWorkArea`, `toggleWorkAreaActive`
- `src/components/admin/WorkAreasTable.tsx` — NEW: table with department filter
- `src/components/admin/WorkAreaDialog.tsx` — NEW: add/edit dialog
- `src/pages/admin/AdminReferenceData.tsx` — Wired Work Areas tab
