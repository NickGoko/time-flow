

## Helper Text and Label Consistency Improvements

### Files to Edit (2 files)

| File | Changes |
|------|---------|
| `src/components/WeeklyTimesheet.tsx` | Add tooltip imports; wrap tab triggers with tooltips; update empty state text |
| `src/components/DailyGridEntry.tsx` | Rename "Add row" button to "Add activity" |

### Exact String Changes

| File | Before | After |
|------|--------|-------|
| `WeeklyTimesheet.tsx` line 229 | `Single entry` (tab trigger, no tooltip) | `Single entry` + tooltip: "Log a single time entry via a form" |
| `WeeklyTimesheet.tsx` line 230 | `Grid view` (tab trigger, no tooltip) | `Grid view` + tooltip: "Log multiple entries at once in a table" |
| `WeeklyTimesheet.tsx` line 258 | `Click "Log time" to add an entry` | `Click "Log time" to add an activity` |
| `DailyGridEntry.tsx` line 189 | `Add row` | `Add activity` |

Note: The labels "Single entry" and "Grid view" on the tab triggers are already correct per the spec. No "One" label exists, and no "Add Entry" label exists. The closest matches are "Add row" (grid) and "Log time" (single entry button) -- "Add row" becomes "Add activity" for clarity.

### Tooltip Implementation

- Use existing `Tooltip`, `TooltipTrigger`, `TooltipContent` from `@/components/ui/tooltip` (already installed)
- Wrap the `TooltipProvider` around the `Tabs` component
- Each `TabsTrigger` gets wrapped in a `Tooltip` + `TooltipTrigger` (using `asChild`) with a `TooltipContent` below it
- Placement: `side="bottom"` so tooltips appear below the toggle without obscuring it

### Test Steps

1. Hover over the "Single entry" tab -- tooltip reads "Log a single time entry via a form"
2. Hover over the "Grid view" tab -- tooltip reads "Log multiple entries at once in a table"
3. Switch to Grid view -- confirm button reads "Add activity" (not "Add row")
4. Switch to Single entry with no entries -- confirm empty state reads `Click "Log time" to add an activity`
5. Confirm no visual/layout changes beyond the tooltip and label text
6. Confirm tooltips do not appear on touch/mobile (default Radix behaviour)

