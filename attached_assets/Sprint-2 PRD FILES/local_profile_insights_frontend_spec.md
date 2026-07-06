## 0. Authentication & Available Libraries

**Authentication approach**
- Do not build custom login or registration screens.
- `LocalSEOExpert` uses the platform authentication popup for sign-in.
- The frontend must provide one unauthenticated landing view with a visible **"Sign In"** button and authenticated app chrome with **"Sign Out"** and user profile display.

**Popup behavior**
- Clicking **"Sign In"** opens a centered popup at `400×600`.
- On successful authentication, the popup closes automatically and the app stores the returned API token and signed-in user context for authenticated requests.
- If the popup is closed by the user before completion, show **"Sign-in was cancelled. Try again to continue."**
- If authentication takes longer than 60 seconds, show **"Sign-in timed out. Please try again."**
- If the authentication popup returns an error, show **"Sign-in failed. Please try again."**

**Frontend stack assumptions grounded by project context**
- Web application with React frontend.
- Protected API calls use the generated API client from the backend OpenAPI spec.
- All current-version screens are authenticated except the landing view.

## 1. What We’re Building

`LocalSEOExpert` is a responsive web application for shared-location local SEO work. In the current version, signed-in users open a shared location, review customer feedback, submit or update a review reply, and manage location posts with persisted mocked GBP-style data in a fast, lightweight interface.

**Visual Inspiration:**
- **Looks like:** GMB Briefcase — a consolidated local SEO workspace focused on GBP-related operations in one dashboard-like environment
- **Navigates like:** GMB Briefcase — a simple entry from a location list into location-specific work areas
- **Feels like:** a lighter, faster productivity tool with low-friction scanning, direct actions, and minimal visual clutter

## 2. Design System

### 2.1 Overview
The interface should feel like a modern operations desk for local marketing work: clear, practical, and calm rather than flashy. The emotional response should be confident and dependable, with compact-enough density for busy work while keeping enough spacing to remain readable on smaller screens. The product should feel lighter than an enterprise dashboard but more structured than a marketing landing page.

### 2.2 Colors

| Token | Hex | Role | Usage |
|-------|-----|------|-------|
| primary | `#0D9488` | Primary action color | Main CTA buttons, active tabs, focus accents, key links |
| primary-hover | `#0B7F75` | Hover state for primary | Primary button hover, active interactive hover |
| primary-soft | `#CCFBF1` | Soft highlight | Active chips, selected row background, informational highlights |
| secondary | `#F97316` | Accent color | Secondary emphasis, warning-adjacent highlights, rating accents |
| secondary-soft | `#FFEDD5` | Soft accent background | Accent badges, secondary empty-state illustrations |
| tertiary | `#14B8A6` | Supporting brand tone | Secondary charts, supportive UI markers |
| neutral | `#E2E8F0` | Neutral border/background token | Dividers, disabled surfaces, subtle chips |
| surface | `#F0FDFA` | App background and large surfaces | Page background, soft panels |
| surface-raised | `#FFFFFF` | Elevated content surface | Cards, modals, forms, sticky bars |
| on-surface | `#134E4A` | Main text color | Headlines, body text, icons |
| on-surface-muted | `#4B6B68` | Secondary text color | Metadata, helper text, empty-state body copy |
| error | `#DC2626` | Error state | Validation, destructive alerts, failure banners |
| error-soft | `#FEE2E2` | Error background | Inline error banners, destructive confirmation surface |
| success | `#15803D` | Success state | Success toasts, saved indicators |
| success-soft | `#DCFCE7` | Success background | Confirmation banners, saved badges |

### 2.3 Typography
Use `Inter SemiBold` for headlines to match the required direction and create clear hierarchy in dense workflow screens. Use `Inter` for body text, labels, and form content for high legibility. `JetBrains Mono` may be used only for IDs or timestamp-like technical metadata when needed in small supporting text.

| Token | Font | Size | Weight | Line-height | Letter-spacing | Usage |
|-------|------|------|--------|-------------|----------------|-------|
| headline-lg | Inter SemiBold | 40px | 600 | 1.1 | -0.02em | Landing headline, page hero title |
| headline-md | Inter SemiBold | 32px | 600 | 1.2 | -0.02em | Main page titles |
| headline-sm | Inter SemiBold | 24px | 600 | 1.25 | -0.01em | Section headers, modal titles |
| body-lg | Inter | 18px | 400 | 1.6 | 0 | Lead supporting copy |
| body-md | Inter | 16px | 400 | 1.6 | 0 | Standard body text |
| body-sm | Inter | 14px | 400 | 1.5 | 0 | Secondary content, helper text |
| label-md | Inter | 14px | 500 | 1.2 | 0 | Buttons, tabs, form labels |
| label-sm | Inter | 12px | 500 | 1.2 | 0.04em | Metadata, timestamps, badges |

### 2.4 Layout & Spacing
**Grid model:** Fluid on mobile, then constrained content widths on larger screens. Desktop uses a `12-column` layout with `24px` gutters and a max content width of `1280px`. Tablet uses `8 columns`; mobile collapses to `4 columns` with `16px` side padding.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight inline spacing, icon-to-label gaps |
| sm | 8px | List rows, compact grouped controls |
| md | 16px | Card padding on mobile, form field gaps |
| lg | 24px | Standard section spacing, desktop card padding |
| xl | 32px | Major group separation |
| 2xl | 48px | Page section separation on desktop |
| 3xl | 64px | Landing-page vertical spacing |

### 2.5 Elevation & Depth
Use subtle shadows consistently.

| Level | Usage | Treatment |
|-------|-------|-----------|
| 1 | Subtle separation | `0 1px 2px rgba(19, 78, 74, 0.06)` |
| 2 | Cards | `0 6px 18px rgba(19, 78, 74, 0.08)` |
| 3 | Dropdowns, sticky bars | `0 10px 24px rgba(19, 78, 74, 0.12)` |
| 4 | Modals, overlays | `0 18px 40px rgba(19, 78, 74, 0.18)` |

### 2.6 Shapes
**Corner philosophy:** Soft. Use the required `10px` corners as the base shape language.

| Token | Value | Usage |
|-------|-------|-------|
| sm | 10px | Inputs, compact buttons, tabs |
| md | 10px | Cards, standard buttons, panels |
| lg | 16px | Modals, sheets, large empty-state containers |
| full | 9999px | Status pills, role chips |

**Icons:** Outline icons from Lucide. Sizes: `16px` inline, `20px` controls, `24px` section and empty-state icons. Icon stroke weight should visually match `Inter` medium labels.

### 2.7 Components

| Component | Background | Text | Rounded | Padding | Notes |
|-----------|-----------|------|---------|---------|-------|
| button-primary | primary | `#FFFFFF` | md | `12px 20px` | Hover uses `primary-hover`; disabled uses `neutral` with muted text |
| button-secondary | surface-raised | primary | md | `12px 20px` | `1px solid #0D9488` border |
| button-destructive | error | `#FFFFFF` | md | `12px 20px` | Used only in delete confirmations |
| input | surface-raised | on-surface | sm | `12px 14px` | `1px solid #CBD5E1`; focus ring `0 0 0 3px rgba(13,148,136,0.18)` |
| textarea | surface-raised | on-surface | sm | `12px 14px` | Resize vertical only |
| tab | transparent | on-surface-muted | sm | `10px 14px` | Active tab uses `primary-soft` background and `primary` text |
| chip | neutral | on-surface | full | `6px 12px` | Reply status and role treatments |
| card | surface-raised | on-surface | md | `24px` | Elevation 2 |
| banner-info | primary-soft | on-surface | md | `12px 16px` | Used for guidance and first-run prompts |
| banner-error | error-soft | error | md | `12px 16px` | Includes retry or sign-in action |
| table-row | surface-raised | on-surface | sm | `16px` | Hover tint `#F8FAFC` |
| modal | surface-raised | on-surface | lg | `24px` | Elevation 4 |

### 2.8 Dos and Don’ts
- Do use `primary` for the single clearest action per screen.
- Do keep the page header fixed and let the main content region own vertical scrolling.
- Do preserve visible focus states on every interactive element.
- Do pair reply status and destructive actions with text, not color alone.
- Don’t shrink dense controls to unreadable sizes on mobile; stack them vertically instead.
- Don’t add navigation items for deferred features.
- Don’t imply live Google synchronization anywhere in copy.

## 3. Voice & Content

### Brand Personality
Clear, dependable, practical, collaborative.

### Writing Patterns

**Messages:**
- Success: outcome + next confidence. Example: **"Reply saved. Your response is now visible on this review."**
- Errors: problem + recovery. Example: **"Couldn’t save your post. Check the fields below and try again."**
- Empty: context + encouragement + action. Example: **"No posts yet for this location. Create your first post to get started."**

**Buttons:**
- Primary: action-first verbs such as **"Sign In"**, **"Open location"**, **"Save reply"**, **"Create post"**, **"Save changes"**
- Secondary: neutral actions such as **"Cancel"**, **"Retry"**, **"Back to locations"**
- Destructive: explicit warnings such as **"Delete post"**

**Forms:**
- Labels are descriptive and direct, such as **"Post summary"** and **"Media URL"**.
- Placeholders provide realistic guidance, such as **"Share a quick update for this location"** and **"https://example.com/image.jpg"**.

**Style:** calm, direct, second-person "you", sentence case, no hype language.

## 4. Screens

### Unauthenticated Landing

**Purpose:** Give signed-out visitors a clear entry point into the protected product.

#### Layout Structure

**📍 Top Bar**
- **Position:** Fixed top
- **Size:** Standard height `72px`
- **Style:** Background `surface-raised`, bottom border `1px solid #E2E8F0`, shadow level 1
- **Contains:**
  - **Logo text:** brand mark — "LocalSEOExpert" — returns to landing top — Visibility: Always
  - **Sign In button:** primary button — "Sign In" — opens auth popup — Visibility: Always

**📍 Hero Section**
- **Position:** Scrolls with content
- **Size:** Flexible, centered, min-height `calc(100vh - 72px)`
- **Style:** Background `surface`
- **Contains:**
  - **Headline:** text — "Manage shared locations, reviews, and posts in one place" — Visibility: Always
  - **Body copy:** text — "Sign in to open your shared locations, reply to reviews, and manage location posts with persisted mocked GBP-style data." — Visibility: Always
  - **Primary CTA:** button — "Sign In" — opens auth popup — Visibility: Always
  - **Auth feedback area:** inline banner region for popup timeout, cancel, or error — Visibility: Conditional: when auth issue occurs

**Visual Hierarchy:**
1. Headline — strongest page anchor
2. Sign In button — single primary action
3. Supporting copy — explains what happens after sign-in

#### Layout Composition & Collision Prevention
Desktop: top bar fixed, hero centered in one column. Mobile: headline, body, CTA, then auth feedback stack vertically with `16px` spacing. Error banners push content down below the CTA; they never overlay the button.

#### Data Requirements

**API Endpoints Used by This Screen (REQUIRED):**

| Trigger | BER Endpoint | Purpose | Auth Required |
|---------|-------------|---------|---------------|
| After successful sign-in bootstrap | `user_profile_get` | Confirm the authenticated user has an application profile before entering the app | Yes |

**Data Entities**

| Entity | Description | Key Fields Displayed | Detail Source |
|--------|------------|---------------------|---------------|
| UserProfile | Signed-in app identity used to enter the product | `display_name` | separate fetch needed |

**Data Operations**

| UI Action | What It Does | On Success | On Failure |
|-----------|-------------|------------|------------|
| Sign in | Opens popup and attempts authentication | App loads authenticated workspace | Show popup-specific error banner with retry |
| Bootstrap profile | Fetches authenticated application profile | Redirect to `LocationList` | Show profile provisioning error with sign-out and retry |

#### Content & Copy
**Text:**
- Headline: "Manage shared locations, reviews, and posts in one place"
- Subtext: "Sign in to open your shared locations, reply to reviews, and manage location posts with persisted mocked GBP-style data."
- Buttons: "Sign In"

#### Interactions & States

**User Actions:**

| UI Action | Trigger | What Happens | Loading Feedback | State Change |
|-----------|---------|-------------|-----------------|-------------|
| Tap sign in | Sign In button | Opens auth popup | Button disabled with spinner label "Signing in..." | Enters auth-pending state |
| Auth success | Popup completes | Store token, fetch profile | Full-page loading state | Redirect to `LocationList` |
| Auth cancel | Popup closed | Show cancellation banner | None | Returns to idle state |

**Initialization**
- **Auto-load:** No
- **Pre-condition:** None

**Refresh Triggers:** User retries sign-in

**Screen States:**

| State | When Shown | What User Sees | Message | Available Action | Active Controls |
|-------|-----------|----------------|---------|------------------|-----------------|
| **Default** | Signed out, idle | Hero content and sign-in CTA | — | Sign in | Sign In button |
| **Loading** | Popup or bootstrap in progress | Hero with disabled CTA and inline spinner | "Signing you in..." | Wait | None |
| **Error** | Popup timeout, cancel, auth failure, or missing profile | Error banner above CTA | "Sign-in didn’t complete. Please try again." or "Your account is missing an app profile. Contact support or try another account." | "Sign In", "Retry", "Sign Out" when token exists | Sign In button |
| **Success** | Authentication complete | Redirect transition only | "Signed in." | Continue | None |

#### First-Run & Prerequisite Recovery

| Scenario | What is missing | What user sees | Primary CTA | Where CTA leads |
|----------|-----------------|----------------|-------------|-----------------|
| Signed-out visitor | Authenticated session | "Please sign in to access your shared locations." | "Sign In" | Auth popup |

#### Edge Cases

| Scenario | Behavior | User Sees |
|----------|----------|-----------|
| **Slow connection (>3s)** | Keep spinner visible and preserve CTA disabled until popup resolves | "Signing you in..." |
| **Session expired mid-bootstrap** | Clear token and return to signed-out state | "Your session expired. Please sign in again." |
| **Double-tap / rapid submit** | Disable sign-in button after first click until popup resolves | Disabled button with spinner |

#### Special Rules
**User Types:** Visitors see only the landing screen and sign-in CTA. Authenticated users are redirected into the location workspace.

---

### LocationList

**Purpose:** Show the signed-in user the shared locations they are assigned to and let them open one location context.

#### Layout Structure

**📍 App Header**
- **Position:** Fixed top
- **Size:** Standard height `72px`
- **Style:** Background `surface-raised`, bottom border `1px solid #E2E8F0`, shadow level 1
- **Contains:**
  - **Product name:** text — "LocalSEOExpert" — returns to the location list — Visibility: Always
  - **Page title:** text — "Locations" — Visibility: Always
  - **User menu area:** text + button — signed-in `display_name` and "Sign Out" — sign out clears auth state and returns to landing — Visibility: Always

**📍 Toolbar Row**
- **Position:** Fixed below header on desktop/tablet; scrolls with content on mobile after header
- **Size:** Compact
- **Style:** Background `surface`
- **Contains:**
  - **Refresh button:** secondary button — "Refresh" — reloads locations — Visibility: Always
  - **Result summary:** metadata text — "X shared locations" — Visibility: Always

**📍 Main Content Area**
- **Position:** Scrolls vertically; primary scroll owner
- **Size:** Flexible
- **Style:** Background `surface`
- **Contains:**
  - **Location cards list:** card group with one card per accessible location — Visibility: Conditional: when items exist
  - **Empty state panel:** illustration area + message + CTA — Visibility: Conditional: when `items` is empty
  - **Error banner/panel:** retryable load failure state — Visibility: Conditional: on fetch failure
  - **Pagination footer:** simple next/previous controls with current range text — Visibility: Conditional: when `total > limit`

**Visual Hierarchy:**
1. Location cards — primary work entry points
2. Page title and result summary — anchors context
3. Header user area — account/session controls

#### Layout Composition & Collision Prevention
Desktop: header row, toolbar row, then scrolling card list. Tablet: same order with reduced horizontal padding. Mobile: header remains fixed; toolbar stacks with Refresh above result summary. Empty, loading, and error states appear in the content area and never hide the header or sign-out control.

#### Data Requirements

**API Endpoints Used by This Screen (REQUIRED):**

| Trigger | BER Endpoint | Purpose | Auth Required |
|---------|-------------|---------|---------------|
| On app bootstrap or route entry | `user_profile_get` | Load `display_name` for authenticated header state | Yes |
| On mount, refresh, pagination | `location_list` | Load the authenticated user’s assigned locations | Yes |

**Data Entities**

| Entity | Description | Key Fields Displayed | Detail Source |
|--------|------------|---------------------|---------------|
| UserProfile | Signed-in user identity for header display | `display_name` | separate fetch needed |
| LocationAccessItem | Shared location visible to the authenticated user | `id`, `external_ref`, `name`, `address`, `role` | list model |

**Data Operations**

| UI Action | What It Does | On Success | On Failure |
|-----------|-------------|------------|------------|
| Load locations | Retrieves the visible shared locations | Populate location cards and count | Show error panel with retry |
| Refresh | Re-fetches current page | Update list in place | Keep last successful list if present and show banner |
| Open location | Navigates into one selected location context | Go to `LocationDetail` | Show non-blocking navigation error banner if route fails |

#### Content & Copy
**Text:**
- Headline: "Locations"
- Subtext: "Open a shared location to manage reviews and posts."
- Buttons: "Refresh", "Open location", "Sign Out"
- Dynamic patterns: role chip displays as `owner` or `mambers`
- Empty state headline: "No shared locations yet"
- Empty state body: "You don’t have any shared locations available right now. Try refreshing or sign out and use another account."

#### Interactions & States

**User Actions:**

| UI Action | Trigger | What Happens | Loading Feedback | State Change |
|-----------|---------|-------------|-----------------|-------------|
| Open location | Card click or "Open location" button | Navigates to selected location context | Button-level spinner for tapped card only | Route changes to `LocationDetail` |
| Refresh list | Refresh button | Re-fetch current page | Toolbar spinner + button disabled | List updates or error banner appears |
| Paginate | Next/previous controls | Load next or previous page with same auth context | Content skeleton rows | Page content changes |
| Sign out | Header action | Clear auth and return to landing | Brief disabled state on button | Session removed |

**Initialization**
- **Auto-load:** Yes
- **Pre-condition:** Auth check — if token missing or invalid, show unauthenticated state and return to landing

**Refresh Triggers:** Initial load, manual refresh, page change, returning from a child screen when user requests refresh

**Screen States:**

| State | When Shown | What User Sees | Message | Available Action | Active Controls |
|-------|-----------|----------------|---------|------------------|-----------------|
| **Default** | Locations loaded | Location cards with name, address, role, and open action | — | Open location, refresh, paginate, sign out | Header controls, refresh, pagination |
| **Loading** | First load or page fetch | Skeleton cards in content area | "Loading locations..." | Wait, sign out | Header controls, sign out |
| **Empty** | `location_list` returns `items: []`, `total: 0` | Empty-state panel in content area | "No shared locations yet" + "You don’t have any shared locations available right now. Try refreshing or sign out and use another account." | "Refresh", "Sign Out" | Header controls, refresh, sign out |
| **Error** | `location_list` fails | Error panel in content area | "Couldn’t load your locations. Try again." | "Retry", "Sign Out" | Header controls, retry, sign out |
| **Error — auth expired** | `401 Unauthorized` | Session banner and protected-content block | "Your session expired. Please sign in again." | "Sign In" | Sign In |
| **Error — missing profile** | `404 Not Found` from `user_profile_get` or `location_list` profile resolution | Setup error panel | "Your account isn’t ready for LocalSEOExpert yet." | "Sign Out", "Retry" | Sign out, retry |

#### First-Run & Prerequisite Recovery

| Scenario | What is missing | What user sees | Primary CTA | Where CTA leads |
|----------|-----------------|----------------|-------------|-----------------|
| No assigned locations | Shared location membership rows | "No shared locations yet" | "Refresh" | Re-fetch same screen |
| No assigned locations and user wants to exit | Usable workspace | "You don’t have any shared locations available right now." | "Sign Out" | Landing |

**Sticky Controls**

| Control | Type | Why Always Visible |
|---------|------|-------------------|
| Sign Out | Header button | Users must always be able to leave a blocked authenticated state |
| Refresh | Toolbar button | Users must be able to recover from empty or stale data |

#### Edge Cases

| Scenario | Behavior | User Sees |
|----------|----------|-----------|
| **Network offline** | Keep current content if available; otherwise show retryable error panel | "You’re offline. Reconnect and try again." |
| **Slow connection (>3s)** | Show skeleton cards and keep header actions available | "Loading locations..." |
| **Double-tap / rapid submit** | Disable tapped open-location button until navigation completes | Button spinner on tapped row |
| **Large dataset / pagination boundary** | Use next/previous pagination based on `limit` and `offset` | "Showing 1–20 of 53" |

#### Input Constraints & Allowed Values
**Allowed Values:**
- `role`: `"owner"` | `"mambers"` → UI element: read-only status chip

**Validation Rules:**
- `limit`: integer `1–100` → internal pagination control only, not a user text input
- `offset`: integer `0+` → internal pagination state only

#### Defaults & Initial State

| Setting / Filter | Default Value | UI Element |
|-----------------|---------------|------------|
| page size | `20` | internal pagination |
| offset | `0` | internal pagination |

#### Special Rules
Authenticated users only. If a token is missing or invalid, protected content is not shown and the user is returned to sign-in.

---

### LocationDetail

**Purpose:** Provide one selected location context and let the user switch between review and post management within that location.

#### Layout Structure

**📍 App Header**
- **Position:** Fixed top
- **Size:** `72px`
- **Style:** Background `surface-raised`, border bottom, shadow level 1
- **Contains:**
  - **Back button:** secondary button — "Back to locations" — returns to `LocationList` — Visibility: Always
  - **Product name:** text — "LocalSEOExpert" — returns to `LocationList` — Visibility: Always
  - **User area:** signed-in name + "Sign Out" — Visibility: Always

**📍 Location Context Bar**
- **Position:** Fixed below header
- **Size:** Flexible, wraps on smaller widths
- **Style:** Background `surface-raised`, shadow level 1
- **Contains:**
  - **Location name:** headline text — dynamic from `location.name` — Visibility: Always after load
  - **Location address:** secondary text — dynamic from `location.address` — Visibility: Always after load
  - **Context metadata:** small text for optional `external_ref` when present — Visibility: Conditional: when available
  - **Refresh button:** secondary button — "Refresh" — reloads location context and active tab data — Visibility: Always

**📍 Section Tab Bar**
- **Position:** Sticky below context bar
- **Size:** Compact
- **Style:** Background `surface`
- **Contains:**
  - **Tab:** "Reviews" — switches to review workspace — Visibility: Always
  - **Tab:** "Posts" — switches to post workspace — Visibility: Always

**📍 Tab Content Area**
- **Position:** Main vertical scroll owner
- **Size:** Flexible
- **Style:** Background `surface`
- **Contains:**
  - **ReviewManagement panel** when Reviews tab is active
  - **PostManagement panel** when Posts tab is active
  - **Access denied / not found / auth expired states** as full content replacements when applicable

**Visual Hierarchy:**
1. Location name and active tab
2. Review or post workspace content
3. Secondary metadata and refresh controls

#### Layout Composition & Collision Prevention
Desktop: header, context bar, then tabs stay fixed while content scrolls underneath. Tablet: context metadata wraps to a second line before actions. Mobile: back button row, location identity row, refresh row, then horizontal tab bar. Error and empty banners push tab content downward; they do not cover tabs or back navigation.

#### Data Requirements

**API Endpoints Used by This Screen (REQUIRED):**

| Trigger | BER Endpoint | Purpose | Auth Required |
|---------|-------------|---------|---------------|
| On mount and refresh | `user_profile_get` | Maintain authenticated header display | Yes |
| On mount, route change, refresh | `location_get` | Load selected location context | Yes |
| On Reviews tab mount, refresh, pagination | `review_list` | Load paginated reviews for this location | Yes |
| On save reply | `review_reply_upsert` | Create or update a reply for one review | Yes |
| On Posts tab mount, refresh, pagination | `post_list` | Load paginated posts for this location | Yes |
| On create post submit | `post_create` | Create a new post in this location | Yes |
| On edit post submit | `post_update` | Save changes to an existing post | Yes |
| On delete confirm | `post_delete` | Remove one post from this location | Yes |

**Data Entities**

| Entity | Description | Key Fields Displayed | Detail Source |
|--------|------------|---------------------|---------------|
| Location | Selected shared location context | `id`, `external_ref`, `name`, `address`, `created_at`, `updated_at` | separate fetch needed |
| ReviewListItem | Review shown in location context | `id`, `reviewer_name`, `rating`, `comment`, `reply_status`, `reply_content`, `replied_at`, `created_at` | list model |
| PostRecord | Post shown and edited in location context | `id`, `location_id`, `external_ref`, `summary`, `cta`, `post_type`, `media_url`, `created_at`, `updated_at` | list model for list and edit seed |

**Data Operations**

| UI Action | What It Does | On Success | On Failure |
|-----------|-------------|------------|------------|
| Load location context | Fetches selected location details | Show location name, address, and tabs | Show access or load failure state |
| Switch tab | Changes active workspace | Load or reveal tab data | Keep current tab and show inline error if fetch fails |
| Refresh location | Reloads location and active tab content | Refresh latest data in place | Show inline error banner |

#### Content & Copy
**Text:**
- Headline: dynamic location name
- Subtext: dynamic location address
- Buttons: "Back to locations", "Refresh", "Reviews", "Posts", "Sign Out"
- Access denied headline: "You can’t open this location"
- Access denied body: "This location isn’t shared with your account. Go back to your location list and choose another one."
- Not found headline: "Location not found"
- Not found body: "This location could not be loaded. Try again or go back to your locations."

#### Interactions & States

**User Actions:**

| UI Action | Trigger | What Happens | Loading Feedback | State Change |
|-----------|---------|-------------|-----------------|-------------|
| Switch tabs | Tap Reviews or Posts | Active tab changes and relevant content loads | Tab underline + content skeleton | Workspace panel changes |
| Refresh | Tap Refresh | Reload location and current tab data | Toolbar spinner | Current content updates |
| Go back | Tap Back to locations | Navigate to location list | None | Route changes |

**Initialization**
- **Auto-load:** Yes
- **Pre-condition:** Auth check and valid `location_id`

**Refresh Triggers:** Initial mount, manual refresh, tab change, successful reply save, successful post create/edit/delete

**Screen States:**

| State | When Shown | What User Sees | Message | Available Action | Active Controls |
|-------|-----------|----------------|---------|------------------|-----------------|
| **Default** | Location loaded | Context bar, tabs, active tab content | — | Switch tabs, refresh, navigate back, sign out | Back, tabs, refresh, sign out |
| **Loading** | Initial load or refresh | Context skeleton and tab skeleton panels | "Loading location..." | Back, sign out | Back, sign out |
| **Error — access denied** | `403 Forbidden` from `location_get` or tab endpoints | Dedicated access panel | "You can’t open this location" + "This location isn’t shared with your account. Go back to your location list and choose another one." | "Back to locations" | Back, sign out |
| **Error — not found** | `404 Not Found` | Dedicated missing-location panel | "Location not found" + "This location could not be loaded. Try again or go back to your locations." | "Retry", "Back to locations" | Back, retry, sign out |
| **Error — auth expired** | `401 Unauthorized` | Protected-content block | "Your session expired. Please sign in again." | "Sign In" | Sign In |

#### First-Run & Prerequisite Recovery

| Scenario | What is missing | What user sees | Primary CTA | Where CTA leads |
|----------|-----------------|----------------|-------------|-----------------|
| Invalid deep link | Valid accessible location | "This location could not be loaded." | "Back to locations" | `LocationList` |

**Sticky Controls**

| Control | Type | Why Always Visible |
|---------|------|-------------------|
| Back to locations | Nav button | Users must always be able to exit blocked or empty location states |
| Reviews / Posts tabs | Tab bar | Users must be able to switch work areas when one tab is empty or fails |
| Refresh | Button | Users need a direct way to recover from stale or failed content |

#### Input Constraints & Allowed Values
**Validation Rules:**
- `location_id`: required numeric route parameter, integer `>= 1`; invalid values redirect to a not-found state

#### Defaults & Initial State

| Setting / Filter | Default Value | UI Element |
|-----------------|---------------|------------|
| active_tab | `"Reviews"` | tab bar |

---

### ReviewManagement Panel

**Purpose:** Let a user read paginated reviews for the selected location and create or update a reply for one review.

#### Layout Structure

**📍 Reviews Toolbar**
- **Position:** Sticky within tab content top
- **Size:** Compact
- **Style:** Background `surface`, border bottom `1px solid #E2E8F0`
- **Contains:**
  - **Section title:** text — "Reviews" — Visibility: Always
  - **Result count:** metadata — "X reviews" — Visibility: Always
  - **Refresh button:** secondary button — "Refresh reviews" — Visibility: Always

**📍 Review List Section**
- **Position:** Scrolls with content
- **Size:** Flexible
- **Style:** Background transparent
- **Contains:**
  - **Review cards or rows:** one item per review — Visibility: Conditional: when items exist
  - **Empty state panel:** no reviews state — Visibility: Conditional: when `items` is empty
  - **Error banner:** load failure within the reviews workspace — Visibility: Conditional: on fetch failure
  - **Pagination controls:** previous/next and range summary — Visibility: Conditional: when `total > limit`

**📍 Review Row / Card Content**
- **Contains:**
  - **Reviewer name**
  - **Rating display:** 1–5 star icons with matching numeric value
  - **Created date:** formatted from `created_at`
  - **Comment body**
  - **Reply status chip:** `no_reply` or `replied`
  - **Reply content block:** shows saved reply text when present
  - **Reply editor:** textarea + save action, collapsed by default until user chooses to reply or edit reply

**Visual Hierarchy:**
1. Review comment and reply action
2. Reviewer name with rating
3. Status chip and timestamps

#### Layout Composition & Collision Prevention
Desktop: toolbar row with title and count left, refresh right. Each review card stacks metadata, comment, saved reply, then editor. Mobile: each toolbar control becomes its own row; pagination sits below the list. Opening a reply editor expands the selected review card vertically and never overlays adjacent reviews.

#### Data Requirements

**API Endpoints Used by This Screen (REQUIRED):**

| Trigger | BER Endpoint | Purpose | Auth Required |
|---------|-------------|---------|---------------|
| On Reviews tab load, refresh, pagination | `review_list` | Load paginated reviews for the current location | Yes |
| On reply submit | `review_reply_upsert` | Save a new or updated reply to one review | Yes |

**Data Entities**

| Entity | Description | Key Fields Displayed | Detail Source |
|--------|------------|---------------------|---------------|
| ReviewListItem | Customer review with reply state | `id`, `reviewer_name`, `rating`, `comment`, `reply_status`, `reply_content`, `replied_at`, `created_at` | list model |

**Data Operations**

| UI Action | What It Does | On Success | On Failure |
|-----------|-------------|------------|------------|
| Load reviews | Fetches current page of reviews | Populate list and count | Show inline error state with retry |
| Save reply | Creates or updates one review reply | Update row in place, set chip to `replied`, collapse editor, show success toast | Keep editor open and show save error |
| Refresh reviews | Re-fetches current page | Replace stale data | Keep current data if present and show error banner |

#### Content & Copy
**Text:**
- Headline: "Reviews"
- Buttons: "Refresh reviews", "Reply", "Edit reply", "Save reply", "Cancel"
- Reply field label: "Reply"
- Reply placeholder: "Write a reply to this customer review"
- Empty headline: "No reviews yet"
- Empty body: "There are no mocked reviews available for this location yet. You can go to Posts or refresh to check again."
- Save success toast: "Reply saved. Your response is now visible on this review."
- Save error: "Couldn’t save your reply. Check the message and try again."

#### Interactions & States

**User Actions:**

| UI Action | Trigger | What Happens | Loading Feedback | State Change |
|-----------|---------|-------------|-----------------|-------------|
| Open reply editor | Tap Reply or Edit reply | Expands textarea for selected review | None | Selected row enters edit state |
| Type reply | Input in textarea | Updates local draft and character count | None | Draft state updates |
| Save reply | Tap Save reply | Validates draft, submits save, updates review on success | Button spinner + disable textarea | Review row changes to `replied` with new content |
| Cancel edit | Tap Cancel | Closes editor and discards unsaved local edits for that row | None | Row returns to view mode |
| Paginate | Tap next/previous | Loads adjacent page in same location | List skeleton rows | List page changes |

**Initialization**
- **Auto-load:** Yes when Reviews tab is active
- **Pre-condition:** Authenticated user with valid accessible location

**Refresh Triggers:** Tab activation, manual refresh, pagination, successful reply save

**Screen States:**

| State | When Shown | What User Sees | Message | Available Action | Active Controls |
|-------|-----------|----------------|---------|------------------|-----------------|
| **Default** | Reviews loaded | Review list, reply chips, reply actions | — | Reply, edit reply, refresh, paginate | Tabs, back, refresh, pagination |
| **Loading** | Initial load or page fetch | Skeleton review cards | "Loading reviews..." | Wait, switch tabs, go back | Tabs, back, refresh |
| **Empty** | `review_list` returns `items: []`, `total: 0` | Empty-state panel in tab content | "No reviews yet" + "There are no mocked reviews available for this location yet. You can go to Posts or refresh to check again." | "Go to Posts", "Refresh reviews" | Tabs, back, refresh |
| **Error** | `review_list` fails | Inline error banner/panel | "Couldn’t load reviews. Try again." | "Retry" | Tabs, back, refresh |
| **Error — access denied** | `403 Forbidden` | Location-level access state in parent screen | "You can’t open this location" | "Back to locations" | Back, sign out |
| **Success** | Reply save succeeds | Toast and updated review row | "Reply saved. Your response is now visible on this review." | Continue editing other rows | All standard controls |

#### First-Run & Prerequisite Recovery

| Scenario | What is missing | What user sees | Primary CTA | Where CTA leads |
|----------|-----------------|----------------|-------------|-----------------|
| Location has no reviews | Review records | "No reviews yet" | "Go to Posts" | Switches active tab to Posts |

**Sticky Controls**

| Control | Type | Why Always Visible |
|---------|------|-------------------|
| Reviews / Posts tabs | Tab bar | Users can recover from an empty review state by switching work areas |
| Back to locations | Nav button | Users must always be able to leave the location context |
| Refresh reviews | Button | Users must be able to retry failed or empty review loads |

#### Edge Cases

| Scenario | Behavior | User Sees |
|----------|----------|-----------|
| **Network offline** | Prevent save, preserve local draft in memory until user retries in same session | "You’re offline. Reconnect and try saving again." |
| **Slow connection (>3s)** | Keep skeleton or button spinner visible and preserve navigation controls | "Loading reviews..." or "Saving reply..." |
| **Double-tap / rapid submit** | Disable save button immediately on first tap | Disabled button with spinner |
| **Session expired mid-action** | Stop save, clear protected content, prompt sign-in | "Your session expired. Please sign in again." |
| **Large dataset / pagination boundary** | Use previous/next page controls based on `limit` and `offset` | "Showing 21–40 of 73" |

#### Input Constraints & Allowed Values
**Allowed Values:**
- `reply_status`: `"no_reply"` | `"replied"` → UI element: read-only status chip
- `rating`: numeric `1–5` → UI element: read-only star display with exact count

**Validation Rules:**
- `reply_content`: required, trimmed, `1–5000` characters → textarea with live character count and inline error below field
- `location_id`: required integer `>= 1` → route-derived, not user-editable
- `review_id`: required integer `>= 1` → row-bound action only, not user-editable
- `limit`: integer `1–100` and `offset` integer `0+` → internal pagination only

#### Defaults & Initial State

| Setting / Filter | Default Value | UI Element |
|-----------------|---------------|------------|
| page size | `20` | internal pagination |
| offset | `0` | internal pagination |
| reply editor state | `collapsed` | per-row action |

#### Special Rules
- A review is read-only except for its reply editor.
- If `reply_status` is `no_reply`, primary row action label is **"Reply"**.
- If `reply_status` is `replied`, primary row action label is **"Edit reply"** and the saved reply remains visible above the editor.

---

### PostManagement Panel

**Purpose:** Let a user list, create, edit, and delete posts for the selected shared location.

#### Layout Structure

**📍 Posts Toolbar**
- **Position:** Sticky within tab content top
- **Size:** Compact
- **Style:** Background `surface`, border bottom `1px solid #E2E8F0`
- **Contains:**
  - **Section title:** text — "Posts" — Visibility: Always
  - **Result count:** metadata — "X posts" — Visibility: Always
  - **Create button:** primary button — "Create post" — opens create modal or full-height mobile sheet — Visibility: Always
  - **Refresh button:** secondary button — "Refresh posts" — Visibility: Always

**📍 Posts List Section**
- **Position:** Scrolls with content
- **Size:** Flexible
- **Style:** Transparent background
- **Contains:**
  - **Post cards/rows:** summary of each post — Visibility: Conditional: when items exist
  - **Empty state panel:** Visibility: Conditional: when `items` is empty
  - **Error banner/panel:** Visibility: Conditional: on load failure
  - **Pagination controls:** Visibility: Conditional: when `total > limit`

**📍 Post Card Content**
- **Contains:**
  - **Summary**
  - **Metadata row:** `post_type`, `cta`, updated timestamp
  - **Media row:** clickable URL or muted "No media URL" text
  - **Actions:** "Edit" and "Delete"

**📍 Post Form Modal / Sheet**
- **Position:** Center modal on desktop/tablet; full-height sheet on mobile
- **Style:** `surface-raised`, elevation 4
- **Contains:**
  - **Title:** "Create post" or "Edit post"
  - **Fields:** Post summary, CTA, Type, Media URL
  - **Actions:** primary submit, secondary cancel
  - **Inline validation region**

**📍 Delete Confirmation Modal**
- **Contains:**
  - **Title:** "Delete post"
  - **Body:** warning text
  - **Actions:** "Delete post", "Cancel"

**Visual Hierarchy:**
1. Create post action and post summaries
2. Edit/delete actions per post
3. Supporting metadata and media URL

#### Layout Composition & Collision Prevention
Desktop: toolbar uses one row with title/count left and action buttons right. List rows stack beneath. Form modal overlays content and traps focus. Mobile: toolbar actions stack as title row, create row, refresh row. The mobile form uses a full-height sheet with sticky footer actions so the keyboard never covers submit controls.

#### Data Requirements

**API Endpoints Used by This Screen (REQUIRED):**

| Trigger | BER Endpoint | Purpose | Auth Required |
|---------|-------------|---------|---------------|
| On Posts tab load, refresh, pagination | `post_list` | Load paginated posts for the current location | Yes |
| On create submit | `post_create` | Create a new post | Yes |
| On edit submit | `post_update` | Save edits to an existing post | Yes |
| On delete confirm | `post_delete` | Delete one post | Yes |

**Data Entities**

| Entity | Description | Key Fields Displayed | Detail Source |
|--------|------------|---------------------|---------------|
| PostRecord | Shared location post | `id`, `location_id`, `external_ref`, `summary`, `cta`, `post_type`, `media_url`, `created_at`, `updated_at`, `created_by_user_profile_id`, `updated_by_user_profile_id` | list model |

**Data Operations**

| UI Action | What It Does | On Success | On Failure |
|-----------|-------------|------------|------------|
| Load posts | Fetch current page of posts | Populate list and count | Show retryable error panel |
| Create post | Submit new post form | Close modal, prepend or refresh list, show success toast | Keep form open with inline errors |
| Edit post | Submit updated form | Close modal, update row in place, show success toast | Keep form open with inline errors |
| Delete post | Confirm destructive action | Remove row from list and show success toast | Keep row visible and show delete error |
| Refresh posts | Re-fetch current page | Update list in place | Keep current data if present and show banner |

#### Content & Copy
**Text:**
- Headline: "Posts"
- Buttons: "Create post", "Refresh posts", "Edit", "Delete", "Save post", "Save changes", "Cancel", "Delete post"
- Empty headline: "No posts yet"
- Empty body: "There are no posts for this location yet. Create your first post to get started."
- Form labels: "Post summary", "CTA", "Type", "Media URL"
- Form placeholders: "Share a quick update for this location", "Book now", "Offer", "https://example.com/image.jpg"
- Create success: "Post created. Your new post is now listed."
- Update success: "Post updated. Your changes are now visible."
- Delete success: "Post deleted."
- Delete confirmation body: "This action permanently removes the post from this location."
- Generic save error: "Couldn’t save your post. Check the fields below and try again."

#### Interactions & States

**User Actions:**

| UI Action | Trigger | What Happens | Loading Feedback | State Change |
|-----------|---------|-------------|-----------------|-------------|
| Open create form | Tap Create post | Opens blank form modal/sheet | None | Enters create mode |
| Open edit form | Tap Edit on a post row | Opens form prefilled from selected post | None | Enters edit mode |
| Type in form | Input fields | Updates local draft and validation state | None | Draft state updates |
| Save create/edit | Tap Save post or Save changes | Validate fields, submit, update list on success | Submit button spinner; form inputs disabled | Modal closes and list updates |
| Confirm delete | Tap Delete then confirm | Deletes selected post | Destructive button spinner | Row removed on success |
| Cancel form | Tap Cancel or close control | Closes form without saving | None | Returns to list |
| Paginate | Tap next/previous | Loads adjacent page | List skeleton rows | Page content changes |

**Initialization**
- **Auto-load:** Yes when Posts tab is active
- **Pre-condition:** Authenticated user with valid accessible location

**Refresh Triggers:** Tab activation, manual refresh, pagination, successful create/edit/delete

**Screen States:**

| State | When Shown | What User Sees | Message | Available Action | Active Controls |
|-------|-----------|----------------|---------|------------------|-----------------|
| **Default** | Posts loaded | Posts list and create action | — | Create, edit, delete, refresh, paginate | Tabs, back, create, refresh, pagination |
| **Loading** | Initial load or page fetch | Skeleton post cards and disabled create button only during initial hard load | "Loading posts..." | Wait, switch tabs, go back | Tabs, back, refresh |
| **Empty** | `post_list` returns `items: []`, `total: 0` | Empty-state panel with primary CTA | "No posts yet" + "There are no posts for this location yet. Create your first post to get started." | "Create post" | Tabs, back, create, refresh |
| **Error** | `post_list` fails | Inline error panel in tab content | "Couldn’t load posts. Try again." | "Retry" | Tabs, back, create, refresh |
| **Success** | Create, edit, or delete succeeds | Toast and updated list | "Post created. Your new post is now listed." / "Post updated. Your changes are now visible." / "Post deleted." | Continue working | All standard controls |

#### First-Run & Prerequisite Recovery

| Scenario | What is missing | What user sees | Primary CTA | Where CTA leads |
|----------|-----------------|----------------|-------------|-----------------|
| Location has no posts | Post records | "No posts yet" | "Create post" | Opens create post modal/sheet |

**Sticky Controls**

| Control | Type | Why Always Visible |
|---------|------|-------------------|
| Reviews / Posts tabs | Tab bar | Users can recover from an empty posts state by switching work areas |
| Back to locations | Nav button | Users must always be able to leave the location context |
| Create post | Primary button | Users need a direct first-run recovery action when no posts exist |
| Refresh posts | Button | Users must be able to retry failed or stale data |

#### Edge Cases

| Scenario | Behavior | User Sees |
|----------|----------|-----------|
| **Network offline** | Block create, edit, and delete submissions | "You’re offline. Reconnect and try again." |
| **Slow connection (>3s)** | Keep list skeletons or button spinner visible | "Loading posts..." or "Saving post..." |
| **Double-tap / rapid submit** | Disable submit/delete buttons after first tap | Disabled button with spinner |
| **Session expired mid-action** | Close protected interaction and prompt sign-in | "Your session expired. Please sign in again." |
| **Large dataset / pagination boundary** | Use previous/next controls based on `limit` and `offset` | "Showing 1–20 of 84" |

#### Input Constraints & Allowed Values
**Validation Rules:**
- `summary`: required, trimmed, `1–1000` characters → multiline textarea with inline error
- `cta`: required, trimmed, `1–120` characters → single-line input with inline error
- `post_type`: required, trimmed, `1–80` characters → single-line input with inline error
- `media_url`: optional; when provided must be `1–2048` characters and an absolute `http://` or `https://` URL → single-line input with inline error
- `post_id`: required integer `>= 1` for edit/delete only → row-bound, not user-editable
- `location_id`: required integer `>= 1` → route-derived, not user-editable
- `limit`: integer `1–100` and `offset` integer `0+` → internal pagination only

**Conditional Rules:**
- When `media_url` is blank in create mode, submit without a value.
- When editing and the user clears `media_url`, submit `null` to remove the saved URL.

#### Defaults & Initial State

| Setting / Filter | Default Value | UI Element |
|-----------------|---------------|------------|
| page size | `20` | internal pagination |
| offset | `0` | internal pagination |
| form mode | `create` or `edit` based on entry action | modal/sheet title |
| media_url initial value | empty on create | text input |

#### Special Rules
- The UI must not offer archive, schedule, or share actions.
- Delete is destructive and always requires a confirmation step.
- `media_url` is shown as plain text if invalid data somehow exists in stored records, but the edit form still enforces the absolute URL rule before re-save.

## 4.5 Cross-Screen Data Flow

| Action | Source Screen | Affected Screen | What Changes | Sync Strategy |
|--------|-------------|----------------|-------------|---------------|
| Sign in succeeds | Unauthenticated Landing | LocationList | User enters authenticated workspace | Fetch profile, then route to list |
| Open location | LocationList | LocationDetail | Selected location context becomes active | Route parameter carries `location_id`; detail screen fetches fresh data |
| Save reply | ReviewManagement Panel | ReviewManagement Panel | Review row updates with `reply_status = replied` and new `reply_content` | Optimistic local replace only after success response |
| Create post | PostManagement Panel | PostManagement Panel | Post list gains new item and count increases | Refresh current list or insert response item into list |
| Edit post | PostManagement Panel | PostManagement Panel | Post row content updates | Replace row from success response |
| Delete post | PostManagement Panel | PostManagement Panel | Post row disappears and count decreases | Remove row after success response |
| Back to locations | LocationDetail | LocationList | User returns to location list | Preserve last known pagination state in client memory |

**Shared State**
- `authSession`: read by all protected screens — managed globally
- `userProfile`: read by `LocationList` and `LocationDetail` — managed globally after `user_profile_get`
- `activeLocationId`: read by `LocationDetail`, `ReviewManagement Panel`, and `PostManagement Panel` — managed by route state

## 5. User Journeys

### Journey: Open a shared location and reply to a review

**Goal:** The user enters a shared location, reads reviews, and saves a reply.

**1. Sign in**
- Screen: Unauthenticated Landing
- User sees: Product message and a single "Sign In" CTA
- User does: Clicks "Sign In"
- System: Opens the auth popup and then fetches the authenticated profile
- If error: Show a sign-in error banner with retry
- Next: `LocationList`

**2. Choose a location**
- Screen: `LocationList`
- User sees: Shared location cards with name, address, role, and open action
- User does: Clicks "Open location"
- System: Navigates to the selected location context
- If error: Show a retryable load or session error
- Next: `LocationDetail`

**3. Open the reviews workspace**
- Screen: `LocationDetail`
- User sees: Location name, address, and tabs
- User does: Leaves the default Reviews tab active or taps "Reviews"
- System: Loads paginated reviews for that location
- If error: Show inline reviews error with retry or parent access error
- Next: Review list appears

**4. Reply to a review**
- Screen: ReviewManagement Panel
- User sees: Review rows with status and reply actions
- User does: Clicks "Reply", types a message, then clicks "Save reply"
- System: Validates the text and saves the reply for that review in the selected location
- If error: Keeps the editor open and shows inline save guidance
- Next: Updated review row with `replied` state

**5. Confirm the saved state**
- Screen: ReviewManagement Panel
- User sees: Success toast and saved reply content on the review row
- User does: Continues working or switches tabs
- System: Preserves the saved state in the refreshed review data

### Journey: Create, edit, and delete a location post

**Goal:** The user manages posts within one shared location.

**1. Open posts**
- Screen: `LocationDetail`
- User sees: Location context with tab bar
- User does: Clicks "Posts"
- System: Loads posts for the selected location
- If error: Show inline posts error with retry
- Next: Posts list or empty state

**2. Create the first post**
- Screen: PostManagement Panel
- User sees: Empty state or existing posts plus "Create post"
- User does: Clicks "Create post"
- System: Opens the post form
- If error: N/A at this step
- Next: Post form modal/sheet

**3. Save the new post**
- Screen: Post form modal/sheet
- User sees: Fields for summary, CTA, type, and media URL
- User does: Completes required fields and clicks "Save post"
- System: Validates inputs and creates the post
- If error: Shows inline field errors or save error without closing the form
- Next: Posts list with the new row and success toast

**4. Edit a post**
- Screen: PostManagement Panel
- User sees: Newly created or existing post row
- User does: Clicks "Edit", changes values, then clicks "Save changes"
- System: Validates and saves the updated post
- If error: Keeps the form open with errors
- Next: Updated row appears in the list

**5. Delete a post**
- Screen: Delete confirmation modal
- User sees: Warning that deletion permanently removes the post
- User does: Clicks "Delete post"
- System: Deletes the selected post from the location
- If error: Keeps the post visible and shows a delete error
- Next: Post row disappears and success toast confirms removal

## 6. Responsive & Scroll Behavior

| Device | Layout | Key Adjustments |
|--------|--------|-----------------|
| **Mobile** | Single-column stacked layout | Fixed header remains visible. Location context rows stack in this order: back/sign-out row → location identity row → refresh row → tab bar. In review and post panels, toolbar controls each take their own row. Main vertical scroll belongs to the content area below the fixed header/context/tabs. Reply editors and post forms use full-width layouts; post create/edit uses a full-height sheet with sticky bottom actions that respect safe-area insets and keyboard height. Horizontal overflow is allowed only for tab labels if needed; page content never scrolls sideways. |
| **Tablet** | Single-column with wider gutters and constrained content width | Fixed header, wrapped location context, and sticky tabs remain. Toolbars use two rows when actions cannot fit one row. Modals stay centered with max width `640px`. Content area remains the only vertical scroll owner. |
| **Desktop** | Full app frame with fixed header and fixed context/tab stack over a scrolling content region | LocationList uses a multi-card grid or vertical list within max width `1280px`. LocationDetail keeps header, context bar, and tabs fixed while reviews/posts content scrolls below. Review cards and post rows can use two-column metadata layouts, but actions remain right-aligned and never overlap text. Banners insert above content and push it downward rather than overlaying controls. |

Additional behavior:
- Dense control groups never compress below readable size; they wrap into vertical groups on smaller widths.
- Only one main vertical scroll region exists per screen; modals and mobile sheets create their own temporary vertical scroll container.
- If browser chrome or on-screen keyboard reduces height, sticky action footers remain visible above safe areas and content scrolls behind them with bottom padding.

## 7. Accessibility

- All interactive controls must have minimum touch targets of `48×48px`.
- Text and UI contrast must meet WCAG AA: `4.5:1` for body text and `3:1` for large text and UI boundaries where applicable.
- Focus indicators use a visible `primary` ring and are never removed.
- Reply status and errors must use text labels in addition to color.
- Tabs, buttons, modal close controls, and destructive actions require clear screen-reader labels.
- Star ratings must expose an accessible text equivalent such as **"5 out of 5 stars"**.
- Form fields announce inline validation messages and character limits when relevant.
- Modal and mobile-sheet interactions must trap focus while open and return focus to the triggering control on close.