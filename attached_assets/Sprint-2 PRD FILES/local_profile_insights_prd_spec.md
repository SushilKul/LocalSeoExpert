# Product Requirements Document

## 1. Product Overview

### 1.1 Product Vision
LocalSEOExpert is a lightweight Local SEO and Google Business Profile (GBP) management MVP that enables SMBs and agencies to monitor and manage GBP locations, reviews, and posts, track local keywords, and view aggregated insights with a simple, extensible backend and React frontend for rapid iteration.

### 1.2 Problem Statement
Current problem: Small businesses and agencies often manage Google Business Profile activity through fragmented tools and manual console workflows, making it slow to monitor reviews and publish posts consistently across shared locations.  
Why now: Teams want a simpler workflow they can start using quickly, while also preparing for a future transition from mocked data to real GBP integration.  
What success looks like: A user can open one web app, choose a shared location, review customer feedback, publish or update location posts, and see those actions persist without needing the GBP console.  
Success signals: users can access a shared location, paginate through reviews, reply to a review, create or edit a post, delete a post, and see persisted changes reflected immediately in the interface.

### 1.3 Target Audience
Primary Users: SEO agencies and small business owners.  
Secondary Users: SMB and SME marketing managers.

User Personas:  
Agency Specialist manages multiple client locations and needs a shared workspace to handle reviews and posts efficiently.  
Local Business Owner wants a simple interface to respond to customer feedback and publish updates without navigating the GBP console.  
Marketing Manager needs a dependable way to coordinate local content and review responses across shared business locations.

Role differences that affect access, visibility, approvals, or actions: Shared locations support two roles. Owners can access and manage all available review and post actions for locations they belong to. Members can work on the same shared locations within the same collaborative workspace for this release; no more granular permission matrix is introduced yet.

### 1.4 Business Objectives
The business goal is to prove that LocalSEOExpert can replace the most common day-to-day GBP engagement tasks with a simpler web experience for shared teams. The MVP should let users collaborate on location-level review handling and post management using persisted mocked data, while keeping the product structure ready for future GBP integration.

Key KPIs for this release are fast first use of a shared location workflow, reliable persistence of review replies and posts, and a product shape that can later expand into broader location management and reporting. The broader business targets remain onboarding a new location in under 10 minutes in a mocked setup, supporting up to 500 managed locations per user in simulated conditions, and enabling 100+ tracked keywords per account in later planned scope.

Operational/business rules that later documents must preserve: a location can be shared by multiple team members; each participating user belongs to a location as either `owner` or `mambers`; review replies and posts are managed at the shared location level rather than as private user-only records.

### 1.5 UX/UI Direction
The interface should feel like a crisp functional productivity tool optimized for busy local marketing workflows: fast to scan, low-friction, and clear on desktop while remaining usable on mobile browsers. As a reference point, GMB Briefcase provides relevant product inspiration in how it frames a single dashboard for review management, posting, and multi-location collaboration; for this release, LocalSEOExpert should use a simpler, lighter version of that pattern with a primary color of `#0D9488`, accent `#F97316`, background `#F0FDFA`, and text `#134E4A`, with `Inter SemiBold` for headings and `Inter` for body text. Use a soft-functional visual language with 10px corners, subtle low-elevation shadows, restrained motion, and a layout where the page header stays fixed, the main content area owns vertical scrolling, and dense controls stack into vertical groups on smaller widths instead of shrinking.

## 2. Scope & Boundaries

### 2.1 In Scope
This version delivers one primary workflow: team members open a shared location, read paginated reviews, reply to a review, and manage location posts using persisted mocked GBP-style data in a responsive web app.

Included user-visible capabilities are shared-location access for authenticated users, review list and review reply handling for a selected location, and post management for a selected location including listing, creating, editing, and deleting posts. The product also includes the minimum interface needed to reach those actions, including a location selection view and location detail context for reviews and posts.

### 2.2 Out of Scope
Location profile editing may be assumed because the broader product vision references GBP management, but direct editing of location business information is not part of this version. Keyword tracking, dashboard insights, photo handling beyond placeholder UI, and real GBP OAuth or live Google API connectivity are deferred to later versions.

### 2.3 Future Scope
- Real Google Business Profile OAuth and live API synchronization.
- Agency-ready team administration and richer shared workspace controls.
- Media and photo management beyond placeholder behavior.

## 3. Product Features and Requirements

### 3.1 Core Features

#### Feature 1: Shared Location Review Management
**Description**  
This feature enables users assigned to a shared location to view customer reviews and publish a reply to a selected review using mocked GBP-style data that persists in the application. It is the main review-handling workflow for this release.

**Priority**  
Must

**Primary actor(s) and affected user roles**  
Owners and mambers assigned to a shared location.

**User Story**  
A signed-in user opens the app, selects a location they have access to, opens the reviews view for that location, reads a paginated list of reviews, opens one review in context, submits a reply, and then sees the reply status updated in the interface.

**Acceptance Criteria**  
The user can open a location they are allowed to access and see a paginated review list.  
Each review visibly includes reviewer name, rating, comment, and reply status.  
The user can submit a reply to a review from the location context.  
After saving, the reply remains visible when the user returns to the same review.  
Users cannot access reviews for locations they are not assigned to.  
If a token is missing or invalid, the user is blocked from protected review actions.

**Preconditions / trigger conditions**  
The user is signed in.  
The user is assigned to at least one location.  
The selected location has mocked persisted review data available.

**Postconditions / resulting state visible to the user**  
The review reply is saved against the selected review and the review status reflects that a reply exists.

**First-run / bootstrap path**  
A newly signed-in user with access to at least one seeded shared location lands on the location list, selects a location, and can immediately open its reviews even if no reply has been posted yet. If the location has no reviews, the page shows an empty state explaining that no mocked reviews are available yet for that location.

**User-visible statuses, modes, phases, or lifecycle states**  
Reply status values are `no_reply` and `replied`.

**Ownership, permissions, and visibility rules**  
A user can only see reviews for locations they are linked to. Shared locations can be accessed by multiple users. Owners and mambers operate on the same location-level review data for this release.

**Business rules and validation rules in product terms**  
Replies are attached to one review only.  
A reply action is always performed within a single selected location.  
Reviews are read-only except for the ability to add or update the reply content.  
Pagination must keep the user within the same selected location context.

**Edge cases & failure states**  
If the selected location is not assigned to the user, show an access-denied state.  
If the reply cannot be saved, keep the user on the review and show a visible save error.  
If a location has no reviews, show an empty review state with the location context still visible.

#### Feature 2: Shared Location Post Management
**Description**  
This feature allows users assigned to a shared location to view, create, edit, and delete mocked GBP-style posts that persist in the application database. It gives teams a practical publishing workflow without requiring live GBP connectivity.

**Priority**  
Must

**Primary actor(s) and affected user roles**  
Owners and mambers assigned to a shared location.

**User Story**  
A signed-in user opens a shared location, goes to posts, reviews the current post list, creates a new post with core fields, edits a post if needed, or deletes a post they no longer want visible.

**Acceptance Criteria**  
The user can view a list of posts for a selected location.  
The user can create a post with summary, CTA, type, and optional media URL.  
The user can edit an existing post and see the updated content reflected in the list and detail view.  
The user can delete a post and see it removed from the visible list.  
All changes remain persisted when the user reloads the location.  
Users cannot manage posts for locations they are not assigned to.

**Preconditions / trigger conditions**  
The user is signed in.  
The user is assigned to the selected location.

**Postconditions / resulting state visible to the user**  
The selected location shows an updated posts list that reflects the latest create, edit, or delete action.

**First-run / bootstrap path**  
A newly signed-in user with one seeded shared location can open the posts view from that location. If no posts exist yet, the page shows an empty state with a clear create-post action.

**Content creation/edit/delete/share/archive expectations**  
Users can create, edit, and delete posts for shared locations they can access. Sharing, scheduling, and archiving are not included in this release.

**Ownership, permissions, and visibility rules**  
Posts belong to a shared location, not to an individual user’s private workspace. Owners and mambers can act on the same set of posts for locations they are assigned to.

**Business rules and validation rules in product terms**  
A post requires summary, CTA, and type.  
Media URL is optional.  
Each post belongs to exactly one location.  
Post actions occur only from within a selected location context.

**Edge cases & failure states**  
If required post fields are missing, show inline validation and block save.  
If a delete action fails, keep the post visible and show an error message.  
If no posts exist for the location, show an empty state with the create action.

#### Feature 3: Shared Location Access and Context Selection
**Description**  
This feature provides the minimum location access layer needed to make the review and post workflow usable. Users can view the list of locations shared with them and open a location detail context where review and post management happens.

**Priority**  
Must

**Primary actor(s) and affected user roles**  
Owners and mambers.

**User Story**  
A signed-in user opens the app, sees the locations available to them, selects one location, and then navigates between review and post views within that location.

**Acceptance Criteria**  
The user can see a list of locations they are assigned to.  
The user can open one location and view its basic context.  
The location detail view provides navigation into reviews and posts.  
Users do not see locations they are not assigned to.  
The app remains usable on first run with seeded mocked location records.

**Preconditions / trigger conditions**  
The user is signed in.

**Postconditions / resulting state visible to the user**  
The user is placed in a specific location context from which review and post actions can be completed.

**First-run / bootstrap path**  
On first use, the user lands on the location list populated with mocked seeded locations shared to that user account. Selecting one location opens a detail page that acts as the starting point for review and post tasks.

**Ownership, permissions, and visibility rules**  
Locations are shared resources that may belong to multiple users. Only assigned users can see or enter a location.

**Business rules and validation rules in product terms**  
A location must exist before reviews or posts can be managed.  
A user’s visible location list is limited to their assignments.  
Location access is the gateway to all current-version features.

**Edge cases & failure states**  
If the user has no assigned locations, show an empty state explaining that no shared locations are available yet.  
If a location cannot be loaded, show a non-technical error and a retry action.  
If the signed-in session is invalid, redirect the user to sign in again through the platform flow.

## 4. Integrations & System Dependencies

### 4.1 Systems (Internal + Third-Party)
**System name:** Authentication Service  
**Type:** Internal  
**Purpose:** Enable user sign-in and access control for user-owned and shared location data.  
**Notes:** Authentication flow is handled by the platform SDK popup. Project-visible scope in this release is limited to signed-in access, sign-out, and protection of review, post, and location screens.

**System name:** Mock GBP Domain Layer  
**Type:** Internal  
**Purpose:** Provide persisted GBP-like location, review, and post behavior without live Google connectivity.  
**Notes:** This layer should preserve GBP-style concepts so future integration remains low-friction. Reviews and posts are stored and served as simulated data tied to shared locations.

**System name:** GMB Briefcase website  
**Type:** Third-party  
**Purpose:** Product and UX reference for how a local SEO tool presents consolidated GBP workflows such as posting, review handling, multi-location management, and reporting.  
**Notes:** Extracted reference indicates positioning around a single dashboard for GBP posting, review management, rank tracking, and team or client management. URL: https://gmbbriefcase.com/

## 5. Assumptions & Constraints

### 5.1 Assumptions
The first release is a responsive web application used by signed-in users who need to collaborate on shared locations rather than operate in isolated personal workspaces. Mocked seeded data exists so first-run users can reach a working review and post flow immediately. The application is expected to use persisted app data for locations, reviews, and posts instead of temporary in-memory demos.

### 5.2 Constraints
Platform: Web application responsive for desktop and mobile.  
Authentication screens and flows are platform-handled and not custom project features.  
The current release uses mocked GBP behavior only and must not imply live Google synchronization.  
Accessibility should support readable contrast, visible focus states, and touch-friendly interactive controls.  
No deployment, CI/CD, or platform-specific configuration requirements are part of this document.  
This version is limited to one primary workflow centered on review and post management inside a shared location context.

## 6. Content & Assets
The user-facing content in this version consists of shared locations, location context details, customer reviews, review replies, and location posts. Location records come from persisted seeded data or app-managed mocked records prepared for shared users. Reviews are visible to users assigned to the location and support a reply lifecycle of unreplied or replied. Posts are user-managed content tied to one location and can be created, edited, or deleted. The post form includes summary, CTA, type, and an optional media URL. Empty states are required for no assigned locations, no reviews, and no posts so a first-run user is never blocked without guidance.

## 7. Required Components
Implementation summary: Responsive web app for shared-location review and post management with persisted mocked GBP-style data, protected access, and location selection UI.

- Frontend UI: YES
- Backend / API: YES
- Database: YES

## 8. Iteration Plan

### Version 1 (Current)
- Shared Location Review Management — View paginated reviews for a selected shared location and reply to a review using persisted mocked GBP-style data. Status: **In Progress**
- Shared Location Post Management — List, create, edit, and delete posts for a selected shared location using persisted mocked GBP-style data. Status: **In Progress**
- Shared Location Access and Context Selection — Show the signed-in user the locations shared with them and let them open a location detail context for review and post tasks. Status: **In Progress**

### Version 2 (Next)
**Mocked Location Profile Management** — This feature adds direct management of basic business information for each location, including name, address, phone, website, and hours. The primary actor is an owner or mambers user working on a shared location, and the main entity touched is the location profile. It is deferred because the current version only needs enough location context to unlock review and post workflows, while profile editing is an adjacent management flow.

**Keyword Tracking and Keyword Report** — This feature adds the ability to attach keywords to a location, store simulated rank and date history, and present keyword performance in a dedicated reporting view. The primary actor is a marketing-focused user managing location performance, and the main entity touched is the location keyword record. It is deferred because it introduces a second product workflow focused on search performance rather than daily GBP engagement.

**Dashboard and Simulated Insights** — This feature adds aggregated metrics such as views, searches, calls, and website clicks, along with short historical series suitable for chart displays. The primary actor is an owner, mambers user, or marketing manager reviewing performance, and the main entity touched is the location insights record. It is deferred because reporting is valuable but secondary to proving the review and post action workflow first.

### Version 3+ (Future)
- Add real Google Business Profile OAuth and API synchronization for live location, review, and post data.
- Add richer agency and team administration beyond the initial shared-location role model.
- Add photo and media handling beyond placeholder behavior.

## 9. Integration Constraints (Machine-Readable)

| Tag | Constraint | Verbatim Value |
|-----|-----------|----------------|
| DBR,BER,FER | product name | `LocalSEOExpert` |
| DBR,BER | shared role value | `owner` |
| DBR,BER | shared role value | `mambers` |
| DBR,BER | mocked GBP scope | `Google Business Profile API is not integrated in the MVP. All GBP-related APIs should return simulated/mock data.` |
| DBR,BER | future integration goal | `The backend should be designed so that adding GBP OAuth and real API integration later is straightforward.` |
| FER | required page | `LocationList` |
| FER | required page | `LocationDetail` |
| FER | UX reference URL | `https://gmbbriefcase.com/` |