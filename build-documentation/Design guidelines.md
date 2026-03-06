---
tags:
  - growthafrica/strategic-projects/time-registration
---


## Emotional tone

- Feels like a **calm, focused studio**.
- **Warmly professional**. Never scolding.
- Designed to make daily logging feel **light and safe**.
    
## Design intent

- Entry screens: **speed + clarity**.
- Summary screens: **calm insight + gentle nudges**.
- Every interaction: **forgiving by default** (second chances, clear recovery).
    

## Visual style anchors

- Layout clarity: **Linear-style** density and hierarchy.
- Familiarity: **Apple Notes** simplicity.
- Components: **modern, neutral UI kit** (clean cards, crisp tables, subtle borders).
    

## Typography

Goal: readable at a glance, fast scanning, calm tone.

- Font style
    - Primary: clean sans-serif (high legibility).
    - Optional: monospace for numeric fields (hours totals).
        
- Hierarchy (desktop / mobile scaling)
    
    - H1: 28 / 24, weight 650, line-height 1.2
        
    - H2: 20 / 18, weight 600, line-height 1.3
        
    - H3: 16 / 16, weight 600, line-height 1.35
        
    - H4: 14 / 14, weight 600, line-height 1.4
        
    - Body: 14 / 14, weight 450–500, line-height 1.6
        
    - Caption: 12 / 12, weight 450, line-height 1.5
        
- Rules
    
    - Keep body text short. Prefer labels over sentences.
        
    - Numbers align in columns (tabular numerals if available).
        

## Color system

Principle: neutral base, one calm accent, clear semantic states.

- Base
    
    - Background: `#F8FAFC`
        
    - Surface (cards): `#FFFFFF`
        
    - Border/divider: `#E2E8F0`
        
- Text
    
    - Primary text: `#0F172A`
        
    - Secondary text: `#475569`
        
    - Muted text: `#64748B`
        
- Brand accent (calm, confident)
    
    - Primary accent: `#2563EB`
        
    - Subtle accent tint: `#DBEAFE`
        
- Semantic
    
    - Success: `#16A34A`
        
    - Warning: `#F59E0B`
        
    - Error: `#DC2626`
        
    - Info: `#0EA5E9`
        
- Contrast
    
    - All text and controls must meet **WCAG AA** (4.5:1).
        
    - Avoid low-contrast “pretty gray” placeholders.
        

## Spacing and layout

Use an **8pt grid** everywhere.

- Spacing scale
    
    - 4, 8, 12, 16, 24, 32, 48
        
- Page layout
    
    - Max content width: 1100–1200px
        
    - Two zones:
        
        - Primary: entry grid / summaries
            
        - Secondary: filters, help, status
            
- Cards
    
    - Padding: 16–24
        
    - Header spacing: 8–12
        
    - Gap between cards: 16
        
- Forms and grids
    
    - Field height: 40–44 (touch-friendly)
        
    - Row height: 40–48 (depending on density mode)
        
    - Sticky table header for long lists
        

## Motion and interaction

Tone: **gentle, confident, never flashy**.

- Durations
    
    - Hover/focus: 150ms
        
    - Expand/collapse: 200–250ms
        
    - Page transitions: 200–300ms (only if needed)
        
- Easing
    
    - Use ease-out for entering.
        
    - Use ease-in for exiting.
        
- Microinteractions (kindness)
    
    - Save success: subtle check + “Saved” toast.
        
    - Inline validation: appear calmly beside the field.
        
    - Empty states: reassuring copy + single primary action.
        

## Core UI patterns

### Time entry grid

- Default view: “Today” (or last used day).
    
- Bulk entry mode
    
    - Date pinned at top.
        
    - Add rows fast (keyboard + “Add row”).
        
    - “Duplicate row” for repeat tasks.
        
- Columns (MVP)
    
    - Date (locked in bulk mode)
        
    - Project
        
    - Phase/Category
        
    - Activity/Deliverable
        
    - Notes (short)
        
    - Duration
        
    - Billable (toggle)
        
- Behaviors
    
    - Cascading dropdowns show only valid options.
        
    - Keep last-used selections as defaults.
        
    - Inline totals for the day (sum of duration).
        

### Personal summary

- Top row: 3–5 calm metric cards
    
    - Week total hours
        
    - Month total hours
        
    - Billable vs non-billable
        
    - Missing hours (if applicable)
        
- Below: breakdown tables
    
    - By project
        
    - By phase/category
        
- Gentle nudges
    
    - “You’re missing 2h this week. Add time now.”
        

### Validation and errors

- Default to “helpful, not punitive.”
    
- Examples
    
    - Bad: “Invalid input.”
        
    - Good: “Enter time in 0.25h steps (e.g., 1.25).”
        
- Always pair an error with a fix suggestion.
    

## Voice and tone

Personality: **supportive, concise, quietly confident**.

- Keywords
    
    - Calm, clear, respectful, encouraging
        
- Microcopy examples
    
    - Onboarding
        
        - “Log your work in under a minute. You can always adjust later.”
            
    - Success
        
        - “Saved. Nice work staying on top of your week.”
            
    - Error
        
        - “That entry is missing a project. Pick one to continue.”
            
    - Missing time nudge
        
        - “Looks like this week is missing 3h. Want to fill it in now?”
            

## Accessibility

Non-negotiable.

- Structure
    
    - Proper headings (H1 → H2 → H3).
        
    - Landmarks (main, nav, footer).
        
- Keyboard
    
    - Full grid entry without a mouse.
        
    - Visible focus ring on every interactive element.
        
- Inputs
    
    - Labels always visible (don’t rely on placeholders).
        
    - Error text tied to fields (ARIA described-by).
        
- Color
    
    - Do not encode meaning by color alone.
        
    - Pair semantic colors with icons and text.
        
- Table/grid
    
    - Screen-reader friendly row/column semantics.
        
    - Clear focus order through cells.
        

## System consistency

Keep patterns repeatable.

- One primary action per screen (e.g., “Save”).
    
- Same column order everywhere.
    
- Same terminology everywhere (Project, Phase, Activity, Billable).
    
- “Adjustments” always means audited changes (later phase).
    

## Emotional audit checklist

- Does this screen feel calm under time pressure?
    
- Do errors guide the user without blame?
    
- Are we offering second chances (undo, edit window, drafts)?
    
- Do nudges feel supportive, not monitoring?
    

## Technical QA checklist

- Typography matches scale and spacing rhythm.
    
- Contrast meets WCAG AA+.
    
- Focus states are visible and consistent.
    
- Motion stays 150–300ms unless truly cinematic.
    
- Grid performance stays smooth at typical daily entry volumes.
    

## Adaptive system memory

- If you already have a brand palette or type choices:
    
    - We can map them into this system without changing behaviors.
        
- If you want cross-product consistency:
    
    - Reuse the same grid, summary cards, and tone across tools.
        

## Design snapshot output

**Emotional thesis:** “A calm, kind workspace that makes daily logging feel effortless.”

```text
Palette
- Background: #F8FAFC
- Surface:    #FFFFFF
- Border:     #E2E8F0
- Text:       #0F172A
- Muted:      #64748B
- Accent:     #2563EB
- AccentTint: #DBEAFE
- Success:    #16A34A
- Warning:    #F59E0B
- Error:      #DC2626
- Info:       #0EA5E9
```

|Type|Size (D/M)|Weight|Line-height|
|---|--:|--:|--:|
|H1|28 / 24|650|1.2|
|H2|20 / 18|600|1.3|
|H3|16 / 16|600|1.35|
|H4|14 / 14|600|1.4|
|Body|14 / 14|450–500|1.6|
|Caption|12 / 12|450|1.5|

Spacing summary

- 8pt grid
    
- Card padding 16–24
    
- Gaps 16
    
- Control height 40–44
    
- Row height 40–48
    

## Design integrity review

The system stays calm and fast. It prioritizes forgiveness and clear recovery.  
One improvement: add a **draft state** for bulk entry, so users can save partial work without pressure.

---

If you want me to continue, say: **“Proceed to app-flow-pages-and-roles.md”**.