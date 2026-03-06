A gap list is a simple artefact that captures the differences between **what exists now** and **what you need for the solution to be “done”**./

In structured software development, it usually shows up right after discovery or assessment, and it becomes a controlled list of “missing things” you must close before you can confidently ship.


----
## Entry form features
- [ ] allow time spent to go over 10hr if one of the selected categories is travel 
- [x] **Visual Progress Indicators:** The dashboard should more clearly show progress towards daily and weekly goals, such as using a **"8 hours / 100%"** label or better colour-coding to indicate when a day’s tracking is complete.
- [ ] Missing L&D 
- [x] Standardize all dropdowns and labels to "Sentence case" (first letter capitalized only).
	- **Why it matters**: Improves professional look and feel by removing erratic capitalization.
	- **Current behavior**: Mixed casing in dropdowns (e.g., all caps vs sentence case).
	- **Expected behavior**: All dropdown items and labels use Sentence case (e.g., "Project name").
	- **Scope boundaries**:
	    - In-scope: Phase dropdown, Activity Type dropdown, Project dropdown.
	    - Out-of-scope: Database column names.
	- **Acceptance criteria**:
	    - Verify "Phase" dropdown items are Sentence case.
	    - Verify "Project" list items are Sentence case.
	- **Dependencies**: None
	- **Risks & edge cases**: Ensure acronyms (if any) remain capitalized.
	- **Open questions**: None
	- **Evidence**: "The first word should be first letter capital and subsequent letters are all non capital".
- [ ] Implement a "Traffic Light" system for progress bars (<75% Red, 75-90% Yellow, 90-100% Green).
- [x] Maximum 10 hours per day (except Travel); 40-hour weekly target.
	- Prevent entries >10hrs unless categorized as Travel.
	- "Any other time than the travel cannot exceed 10 hours but travel can an exception".
	- **Why it matters:** Enforces labor policy while allowing for legitimate long-travel days.
	- **Current behavior:** Users can report above 10 hours for any category.
	- **Expected behavior:** System rejects entries >10 hours unless the category "Travel" is selected.
	- **Scope boundaries:**
	    - **In-scope:** Form validation, error messaging for >10hrs.
	    - **Out-of-scope:** Managing overnight travel spanning two days.
	- **Acceptance criteria:**
	    - Attempting to save 11 hours for "Project Support" fails.
	    - Saving 12 hours for "Travel" succeeds.
	- **Dependencies:** Category taxonomy must include "Travel."
	- **Risks & edge cases:** Users might misclassify work as travel to bypass the cap.
	- **Open questions:** None.
	- **Evidence:** "Any other time than the travel cannot exceed 10 hours but travel can an exception".
- [x] Rename "History & Insights" to "Dashboard"; change "Row 1" to "Entry 1".
- [ ] Selecting "Leave/Absence" or "Public Holiday" as a Project auto-fills Phase and Activity Type with matching values; Deliverable Type set to "Other".
	- **Acceptance criteria**:
	    - [ ] Select "Public Holiday" -> Phase auto-sets to "Public Holiday".
	    - [ ] Select "Leave/Absence" -> Phase auto-sets to "Leave/Absence".
	- **Risks & edge cases**: Handling manual overrides if a user tries to change an auto-filled field.
	-  **Why it matters**: Streamlines non-billable entries and ensures accurate time categorization.
	- **Current behavior**: User manually selects Phase/Activity for absences.
- [x] Set default state of entry lists to "collapsed".
- [x] Group Deliverable and Deliverable Description visually when it comes to bulk entries/multiple entries. 
- [ ] RLS/Security validation for individual vs. department dashboard data.
- [x] Let harmonise the form entry/field entry names/titles as: 
	- Category
		- Project
			- Activity/task
				- Task description
					- Deliverable type
						- Deliverable description
	The values within those fields should remain as they accurate and working appropriately for each department - showing the right details for the department the user belongs to. What we want to do is give the form fields a better more agreeable name across all departments 

### Bugs
- [x] The wrong deliverables are showing up in Finance & admin department entries and possible for other departments. I saw the wrong entries- phases and work areas and tasks when logged from the Productivity(IT) department I only saw the Impact- external project option 
- [ ] Selected Leave as a category which is under external projects fine but maybe it should a whole different category not external or internal but Leave its own category since it cuts across all categories and departments. Nevertherless the real problem was once I selected the other fields specifically compulsory Phase field was black and greyed out which means i could make an entry and the functionality of the form couldn't allow use to save entry. So locked out of filling out leave as an entry. The auto-fill for 8hrs works at least. 
- [ ] 




## Dashboard reports

Core roles
- Employee
- HOD - department members dashboards
- Leadership/Partner - entire organisation - their individual ones 
- System-Admin - everything every type of dashboard report


> All three leadership are also HOD of their own departments so does that mean they get three dashboard views - their own individual ones, HOD dashboards, organisation dashboard


### Employee Dashboard
- [ ] Breaking down employee individual dashboard pages - total time spent(day/month/quarter/annual) time range, time spent by/per project, by billable/maybe billable/not billable, on each project time spent on which phase & activities per project(dropdown change) - the language or taxonomy is different for each department
- [ ] Time spent vs other employees overall and in same department



### Leadership/partner - role

All leaders need to have whole organisation dashboard 

- [ ] Have all the all employee and project dashboard
- [x] Need to be able to log their time as well
	- [ ] Johnni
	- [ ] Patricia 
	- [ ] Ian

### Department Head
- [ ] All dashboards of their department 
	- [ ] Ian - Business development department, Comms Department, Productivity & IT department 
	- [ ] Patricia - Impact department, HR department 
	- [ ] Johnni - Finance & admin department 
	      
- [x] As HOD i need to have a dashboard view of employees performance and my own dashboard since they are also participating in the time registration for the own time.
	- [x] But as HOD how does the system recognize this user need to have such a dashboard view of all the team members under that department dashboard. Because the current department user reference data is used mostly to decide which form entries layout to provide the user/leadership role. But now since 2 of the department heads have 2 departments under their belt how do we determine how to assign leadership departments that determines which dashboard to reveal and show to them. 
- [x] Since some department heads are leaders they would essentially have 3 types of dashboard views - individual, departments, full organisations

### Bugs - UX & business logic

- [ ] The admin user account overview or main page - shows both Dashboard and reports - why the need for the extra page. When i click dashboard it opens up a  page showing admin dashboard - coming soon. Then there is a button for reports overview that now take me to reports page which was already accessible in overview - appearing to the right of the dashboard page label - why don't we remove the Dashboard part and rename the reports label in the overview to Dashboard. This should apply to all admin dashboards. 


## Admin Backend 
### Super-admin-user- role - Main role that manages all users, reference, department data

> - The other 3 admins can as well do that that, but the super-admin is a roles for the developer to manager the solution and data 

### User list or table
- [ ] Add specific roles in drop-downs format not free text
- [x] Add additional app roles - more than Admin, Employee
- [ ] Time spent per employee
	- [ ] time spent on what areas in individual employee views


