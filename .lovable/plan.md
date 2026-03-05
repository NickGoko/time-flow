

# Plan: Harmonise Labels in Admin Reference Data & Related Components

The entry form labels are already correct (Category, Project, Activity/task). The admin Reference Data page and its sub-components still use old terminology (Workstreams, Phases, Work Areas, Activity Types). These need renaming to match the harmonised labels.

## Label Mapping

| Current | New |
|---|---|
| "Workstreams" (tab) | "Categories" |
| "Workstreams" (section heading) | "Categories" |
| "Add Workstream" / "workstream" entity | "Add category" / "category" |
| "Search workstreams…" | "Search categories…" |
| "Workstream deactivated/activated" (toast) | "Category deactivated/activated" |
| "Phases" (tab) | "Projects" |
| "Phase Name" (column) | "Project name" |
| "Add Phase" / "phase" entity | "Add project" / "project" |
| "Search phases…" | "Search projects…" |
| "Phase deactivated/activated" (toast) | "Project deactivated/activated" |
| "Phase updated/added" (toast) | "Project updated/added" |
| "Activity Types by Phase" (heading) | "Activities/tasks by project" |
| "Activity Type Name" (column) | "Activity/task name" |
| "Add Activity Type" / "activity type" entity | "Add activity/task" / "activity/task" |
| "Activity type updated/added" (toast) | "Activity/task updated/added" |
| "Activity deactivated/activated" (toast) | "Activity/task deactivated/activated" |
| "Work Areas" (tab) | "Work areas" (sentence case only) |
| "Add Work Area" / "work area" entity | "Add work area" / "work area" (keep) |
| "Edit Work Area" / "Add Work Area" (dialog) | "Edit work area" / "Add work area" |
| "Edit Phase" / "Add Phase" (PhaseDialog) | "Edit project" / "Add project" |
| "Edit Activity Type" / "Add Activity Type" (PhaseDialog) | "Edit activity/task" / "Add activity/task" |
| "Select phase…" placeholder | "Select project…" |
| "Phase" label in PhaseDialog | "Project" |
| "Phase" label in WorkAreaDialog | "Project" |
| "Select phase" placeholder in WorkAreaDialog | "Select project" |
| WorkstreamDialog title "Edit/Add Workstream" | "Edit/Add category" |

Also in `TimeEntryForm.tsx` and `DailyGridEntry.tsx`: remove leftover comments referencing old names (e.g. `/* Workstream (grouped) */`, `/* Phase / Work area */`).

## Files to Change (6)

| # | File | Changes |
|---|---|---|
| 1 | `src/pages/admin/AdminReferenceData.tsx` | Tab labels: Workstreams→Categories, Phases→Projects, Work Areas→Work areas. Section heading "Workstreams"→"Categories". |
| 2 | `src/components/admin/WorkstreamsTable.tsx` | addLabel, entityLabel, searchPlaceholder, toast messages. |
| 3 | `src/components/admin/PhasesTable.tsx` | Column headers, addLabel, entityLabel, searchPlaceholder, toast messages, "Activity Types by Phase" heading. |
| 4 | `src/components/admin/PhaseDialog.tsx` | Dialog title, "Phase" label → "Project", placeholder. |
| 5 | `src/components/admin/WorkAreaDialog.tsx` | Dialog title sentence case, "Phase" label → "Project", placeholder. |
| 6 | `src/components/admin/WorkstreamDialog.tsx` | Dialog title. |

## No Logic Changes

Only display strings change. No filtering, no data model, no routing changes.

## Test Checklist

1. Open Reference Data page — tabs read "Categories", "Projects", "Work areas", "Deliverables"
2. Categories tab: section heading "Categories", table shows categories, add button says "Add category"
3. Projects tab: column "Project name", expandable section "Activities/tasks by project", nested table column "Activity/task name"
4. Add/edit dialogs show harmonised titles
5. Toast messages use new terminology
6. Entry form labels unchanged (already correct)

