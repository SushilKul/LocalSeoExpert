## Backend Architecture Summary

LocalSEOExpert uses a token-protected RPC-style backend that serves shared-location access, review management, and post management over flat POST endpoints. The backend reads the authenticated identity from the Bearer token through the platform extractor, resolves product-domain access through application tables, and returns only persisted mocked GBP-style data for current-version workflows.

The architecture is organized around compact endpoint handlers plus reusable Rust data-model libraries. Product-domain authorization is enforced through `location_memberships`, not `auth.users`. `auth.users` is used only for identity linkage to `user_profiles`. Because `Google Business Profile API is not integrated in the MVP. All GBP-related APIs should return simulated/mock data.`, all location, review, and post operations execute entirely against the application database. `The backend should be designed so that adding GBP OAuth and real API integration later is straightforward.` This is supported by preserving `external_ref` fields on domain tables and keeping endpoint payloads GBP-shaped but app-owned.

Authentication workflows are handled by the platform SDK and are not part of the backend scope.

## Backend Components

### Libraries

#### user_profile_model
**Data Models**

```rust
use chrono::{DateTime, Utc};
use metatable_sdk_macro::OpenApiSchema;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone, OpenApiSchema)]
pub struct UserProfile {
    pub id: i32,
    pub auth_user_id: Uuid,
    pub display_name: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl UserProfile {
    pub fn from_row(row: &tokio_postgres::Row) -> Self {
        Self {
            id: row.get("id"),
            auth_user_id: row.get("auth_user_id"),
            display_name: row.get("display_name"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }
    }
}
```

**Serialization**

`UserProfile` is serialized to JSON with field names `id`, `auth_user_id`, `display_name`, `created_at`, and `updated_at`.

**Database Conversion**

`from_row(row: &tokio_postgres::Row) -> Self` maps `user_profiles.id int4` to `i32`, `auth_user_id uuid` to `Uuid`, and timestamps to `DateTime<Utc>`.

#### location_model
**Data Models**

```rust
use chrono::{DateTime, Utc};
use metatable_sdk_macro::OpenApiSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, OpenApiSchema)]
pub struct Location {
    pub id: i32,
    pub external_ref: Option<String>,
    pub name: String,
    pub address: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Location {
    pub fn from_row(row: &tokio_postgres::Row) -> Self {
        Self {
            id: row.get("id"),
            external_ref: row.get("external_ref"),
            name: row.get("name"),
            address: row.get("address"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }
    }
}

#[derive(Serialize, Deserialize, Clone, OpenApiSchema)]
pub struct LocationAccessItem {
    pub id: i32,
    pub external_ref: Option<String>,
    pub name: String,
    pub address: String,
    pub role: String,
}
```

**Serialization**

`Location` and `LocationAccessItem` serialize using DBR-aligned field names. `role` must preserve the exact values `owner` and `mambers`.

**Database Conversion**

`Location::from_row(row: &tokio_postgres::Row) -> Self` maps `locations` rows directly. `LocationAccessItem` is assembled from a joined `locations` + `location_memberships` query.

#### review_model
**Data Models**

```rust
use chrono::{DateTime, Utc};
use metatable_sdk_macro::OpenApiSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, OpenApiSchema)]
pub struct Review {
    pub id: i32,
    pub location_id: i32,
    pub external_ref: Option<String>,
    pub reviewer_name: String,
    pub rating: i32,
    pub comment: String,
    pub reply_status: String,
    pub reply_content: Option<String>,
    pub replied_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Review {
    pub fn from_row(row: &tokio_postgres::Row) -> Self {
        Self {
            id: row.get("id"),
            location_id: row.get("location_id"),
            external_ref: row.get("external_ref"),
            reviewer_name: row.get("reviewer_name"),
            rating: row.get("rating"),
            comment: row.get("comment"),
            reply_status: row.get("reply_status"),
            reply_content: row.get("reply_content"),
            replied_at: row.get("replied_at"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }
    }
}

#[derive(Serialize, Deserialize, Clone, OpenApiSchema)]
pub struct ReviewListItem {
    pub id: i32,
    pub reviewer_name: String,
    pub rating: i32,
    pub comment: String,
    pub reply_status: String,
    pub reply_content: Option<String>,
    pub replied_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}
```

**Serialization**

`reply_status` is serialized exactly as `no_reply` or `replied`. Nullable reply fields remain `null` when no reply exists.

**Database Conversion**

`Review::from_row(row: &tokio_postgres::Row) -> Self` maps `reviews.id int4`, `reviews.location_id int4`, and `reviews.rating int4` to `i32`; nullable timestamps map to `Option<DateTime<Utc>>`.

#### post_model
**Data Models**

```rust
use chrono::{DateTime, Utc};
use metatable_sdk_macro::OpenApiSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, OpenApiSchema)]
pub struct PostRecord {
    pub id: i32,
    pub location_id: i32,
    pub external_ref: Option<String>,
    pub summary: String,
    pub cta: String,
    pub post_type: String,
    pub media_url: Option<String>,
    pub created_by_user_profile_id: Option<i32>,
    pub updated_by_user_profile_id: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl PostRecord {
    pub fn from_row(row: &tokio_postgres::Row) -> Self {
        Self {
            id: row.get("id"),
            location_id: row.get("location_id"),
            external_ref: row.get("external_ref"),
            summary: row.get("summary"),
            cta: row.get("cta"),
            post_type: row.get("post_type"),
            media_url: row.get("media_url"),
            created_by_user_profile_id: row.get("created_by_user_profile_id"),
            updated_by_user_profile_id: row.get("updated_by_user_profile_id"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }
    }
}
```

**Serialization**

`PostRecord` serializes using the DB column names so downstream handlers and frontend bindings remain aligned with the database.

**Database Conversion**

`from_row(row: &tokio_postgres::Row) -> Self` maps all `int4` IDs to `i32` and timestamps to `DateTime<Utc>`.

### Endpoints

#### user_profile_get
**Purpose**

Returns the authenticated user’s application profile. This endpoint supports initial app bootstrap and lets the frontend confirm that a signed-in identity is linked to a `user_profiles` record.

**Path**

`POST /user_profile_get`

**Authentication**

Yes — Authenticated. `user_id` is extracted server-side from the Bearer token and is never accepted from the client.

**Headers**

`Content-Type: application/json`  
`Authorization: Bearer <token>`

**Request Payload**

`{}`

**Validation**

The request body must be an empty JSON object.

**Data Flow**

Tables READ: `[user_profiles]`  
Tables WRITTEN: `[]`

Order of operations: resolve authenticated identity from token, load matching `user_profiles` row by `auth_user_id`.

**Business Logic**

If the authenticated identity is linked to a profile, return it. `auth.users` is used only to supply the authenticated identity; business data comes from `user_profiles`.

**First-run / zero-data behavior**

If the authenticated user has no `user_profiles` row yet, return `404 NOT_FOUND` with guidance that the application profile has not been provisioned.

**Response**

Success payload:

```json
{
  "profile": {
    "id": 1,
    "auth_user_id": "550e8400-e29b-41d4-a716-446655440000",
    "display_name": "Alex Rivera",
    "created_at": "2026-01-10T12:00:00Z",
    "updated_at": "2026-01-10T12:00:00Z"
  }
}
```

Field types:
- `profile.id`: number (`i32`)
- `profile.auth_user_id`: UUID string
- `profile.display_name`: string
- `profile.created_at`: ISO 8601 datetime string
- `profile.updated_at`: ISO 8601 datetime string

HTTP status codes used: `200 OK`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

**Error Taxonomy**

- `401 { "code": "UNAUTHORIZED" }` — Bearer token missing or invalid
- `404 { "code": "NOT_FOUND" }` — no application profile exists for the authenticated identity
- `500 { "code": "INTERNAL_ERROR" }` — unexpected database or serialization failure

**Dependencies**

`user_profile_model`

#### location_list
**Purpose**

Returns the set of shared locations visible to the authenticated user.

**Path**

`POST /location_list`

**Authentication**

Yes — Authenticated. `user_id` is extracted server-side from the Bearer token.

**Headers**

`Content-Type: application/json`  
`Authorization: Bearer <token>`

**Request Payload**

```json
{
  "limit": "number (optional, default 20, min 1, max 100)",
  "offset": "number (optional, default 0, min 0)"
}
```

**Validation**

- `limit` must be an integer from 1 to 100
- `offset` must be an integer greater than or equal to 0

**Data Flow**

Tables READ: `[user_profiles, location_memberships, locations]`  
Tables WRITTEN: `[]`

Order of operations: resolve `user_profiles` row from token identity, read `location_memberships` for that profile, join `locations`, order by `locations.created_at DESC`, apply limit and offset.

**Business Logic**

Only locations with a membership row for the authenticated user are returned. The role in each item must preserve the exact values `owner` or `mambers` from `location_memberships.role`.

**First-run / zero-data behavior**

If the authenticated user has zero assigned locations, return `200 OK` with `items: []`, `total: 0`, and the requested pagination values.

**Response**

Success payload:

```json
{
  "items": [
    {
      "id": 1,
      "external_ref": "loc_mock_001",
      "name": "Downtown Dental",
      "address": "123 Main St, Austin, TX",
      "role": "owner"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

Field types:
- `items`: array of location access items
- `items[].id`: number (`i32`)
- `items[].external_ref`: string or `null`
- `items[].name`: string
- `items[].address`: string
- `items[].role`: `"owner" | "mambers"`
- `total`: number (`i64` safe API integer semantics)
- `limit`: number
- `offset`: number

HTTP status codes used: `200 OK`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

**Error Taxonomy**

- `401 { "code": "UNAUTHORIZED" }` — Bearer token missing or invalid
- `404 { "code": "NOT_FOUND" }` — authenticated identity has no `user_profiles` row
- `500 { "code": "INTERNAL_ERROR" }` — unexpected database or serialization failure

**Dependencies**

`location_model`, `user_profile_model`

#### location_get
**Purpose**

Returns the selected shared location’s basic context for a user who is assigned to it.

**Path**

`POST /location_get`

**Authentication**

Yes — Authenticated. `user_id` is extracted server-side from the Bearer token.

**Headers**

`Content-Type: application/json`  
`Authorization: Bearer <token>`

**Request Payload**

```json
{
  "location_id": "number (required, i32, min 1)"
}
```

**Validation**

- `location_id` is required
- `location_id` must be an integer greater than or equal to 1

**Data Flow**

Tables READ: `[user_profiles, location_memberships, locations]`  
Tables WRITTEN: `[]`

Order of operations: resolve authenticated profile, verify membership in `location_memberships`, read the matching `locations` row.

**Business Logic**

The backend must deny access when the user lacks a membership for the requested location. Business-role checks come from `location_memberships`, never from `auth.users`.

**First-run / zero-data behavior**

If the user requests a location they are assigned to, return its basic context even when it has no reviews or no posts yet.

**Response**

Success payload:

```json
{
  "location": {
    "id": 1,
    "external_ref": "loc_mock_001",
    "name": "Downtown Dental",
    "address": "123 Main St, Austin, TX",
    "created_at": "2026-01-10T12:00:00Z",
    "updated_at": "2026-01-10T12:00:00Z"
  }
}
```

Field types:
- `location.id`: number (`i32`)
- `location.external_ref`: string or `null`
- `location.name`: string
- `location.address`: string
- `location.created_at`: ISO 8601 datetime string
- `location.updated_at`: ISO 8601 datetime string

HTTP status codes used: `200 OK`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`

**Error Taxonomy**

- `401 { "code": "UNAUTHORIZED" }` — Bearer token missing or invalid
- `403 { "code": "FORBIDDEN" }` — authenticated user is not assigned to the requested location
- `404 { "code": "NOT_FOUND" }` — location does not exist or authenticated identity has no application profile
- `500 { "code": "INTERNAL_ERROR" }` — unexpected database or serialization failure

**Dependencies**

`location_model`, `user_profile_model`

#### review_list
**Purpose**

Returns a paginated list of mocked persisted reviews for one selected shared location.

**Path**

`POST /review_list`

**Authentication**

Yes — Authenticated. `user_id` is extracted server-side from the Bearer token.

**Headers**

`Content-Type: application/json`  
`Authorization: Bearer <token>`

**Request Payload**

```json
{
  "location_id": "number (required, i32, min 1)",
  "limit": "number (optional, default 20, min 1, max 100)",
  "offset": "number (optional, default 0, min 0)"
}
```

**Validation**

- `location_id` is required and must be an integer greater than or equal to 1
- `limit` must be an integer from 1 to 100
- `offset` must be an integer greater than or equal to 0

**Data Flow**

Tables READ: `[user_profiles, location_memberships, reviews]`  
Tables WRITTEN: `[]`

Order of operations: resolve authenticated profile, verify membership for the requested location, count matching `reviews`, then read paginated `reviews` ordered by `created_at DESC, id DESC`.

**Business Logic**

A user can only see reviews for locations they are linked to. Each returned item includes `reviewer_name`, `rating`, `comment`, and `reply_status`, with reply fields populated when `reply_status` is `replied`.

**First-run / zero-data behavior**

If the selected assigned location has zero reviews, return `200 OK` with `items: []`, `total: 0`, and the requested pagination values. This is a valid first-run state and not an error.

**Response**

Success payload:

```json
{
  "items": [
    {
      "id": 11,
      "reviewer_name": "Jamie Lee",
      "rating": 5,
      "comment": "Fast service and friendly staff.",
      "reply_status": "replied",
      "reply_content": "Thank you for your feedback!",
      "replied_at": "2026-01-12T09:30:00Z",
      "created_at": "2026-01-11T08:00:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

Field types:
- `items`: array of review list items
- `items[].id`: number (`i32`)
- `items[].reviewer_name`: string
- `items[].rating`: number (`i32`, 1–5)
- `items[].comment`: string
- `items[].reply_status`: `"no_reply" | "replied"`
- `items[].reply_content`: string or `null`
- `items[].replied_at`: ISO 8601 datetime string or `null`
- `items[].created_at`: ISO 8601 datetime string
- `total`: number (`i64` safe API integer semantics)
- `limit`: number
- `offset`: number

HTTP status codes used: `200 OK`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`

**Error Taxonomy**

- `401 { "code": "UNAUTHORIZED" }` — Bearer token missing or invalid
- `403 { "code": "FORBIDDEN" }` — authenticated user is not assigned to the requested location
- `404 { "code": "NOT_FOUND" }` — authenticated identity has no application profile or the location does not exist
- `500 { "code": "INTERNAL_ERROR" }` — unexpected database failure

**Dependencies**

`review_model`, `user_profile_model`

#### review_reply_upsert
**Purpose**

Creates or updates the reply for a single review within one selected location.

**Path**

`POST /review_reply_upsert`

**Authentication**

Yes — Authenticated. `user_id` is extracted server-side from the Bearer token.

**Headers**

`Content-Type: application/json`  
`Authorization: Bearer <token>`

**Request Payload**

```json
{
  "location_id": "number (required, i32, min 1)",
  "review_id": "number (required, i32, min 1)",
  "reply_content": "string (required, 1–5000 chars after trim)"
}
```

**Validation**

- `location_id` is required and must be an integer greater than or equal to 1
- `review_id` is required and must be an integer greater than or equal to 1
- `reply_content` is required
- `reply_content` must be 1 to 5000 characters after trim

**Data Flow**

Tables READ: `[user_profiles, location_memberships, reviews]`  
Tables WRITTEN: `[reviews (UPDATE)]`

Order of operations: resolve authenticated profile, verify membership for `location_id`, load `reviews` row by `id` and `location_id`, validate request, update `reply_content`, set `reply_status = 'replied'`, set `replied_at = NOW()`, set `updated_at = NOW()`.

**Business Logic**

Replies are attached to one review only. Reviews are read-only except for the ability to add or update reply content. If the review exists under a different location than the submitted `location_id`, the request is rejected as not found to preserve location scoping.

**First-run / zero-data behavior**

A location with reviews but no existing reply is valid. The first successful call transitions the review from `no_reply` to `replied`. No manual seed reply row is required.

**Response**

Success payload:

```json
{
  "review": {
    "id": 11,
    "location_id": 1,
    "external_ref": "rev_mock_011",
    "reviewer_name": "Jamie Lee",
    "rating": 5,
    "comment": "Fast service and friendly staff.",
    "reply_status": "replied",
    "reply_content": "Thank you for your feedback!",
    "replied_at": "2026-01-12T09:30:00Z",
    "created_at": "2026-01-11T08:00:00Z",
    "updated_at": "2026-01-12T09:30:00Z"
  }
}
```

Field types:
- `review.id`: number (`i32`)
- `review.location_id`: number (`i32`)
- `review.external_ref`: string or `null`
- `review.reviewer_name`: string
- `review.rating`: number (`i32`, 1–5)
- `review.comment`: string
- `review.reply_status`: `"no_reply" | "replied"`
- `review.reply_content`: string or `null`
- `review.replied_at`: ISO 8601 datetime string or `null`
- `review.created_at`: ISO 8601 datetime string
- `review.updated_at`: ISO 8601 datetime string

HTTP status codes used: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`

**Error Taxonomy**

- `400 { "code": "VALIDATION_ERROR" }` — `reply_content` is empty after trim or exceeds 5000 characters, or numeric fields are invalid
- `401 { "code": "UNAUTHORIZED" }` — Bearer token missing or invalid
- `403 { "code": "FORBIDDEN" }` — authenticated user is not assigned to the requested location
- `404 { "code": "NOT_FOUND" }` — review not found under the selected location, location not found, or authenticated identity has no application profile
- `500 { "code": "INTERNAL_ERROR" }` — unexpected database failure

**Dependencies**

`review_model`, `user_profile_model`

#### post_list
**Purpose**

Returns the posts for one selected shared location.

**Path**

`POST /post_list`

**Authentication**

Yes — Authenticated. `user_id` is extracted server-side from the Bearer token.

**Headers**

`Content-Type: application/json`  
`Authorization: Bearer <token>`

**Request Payload**

```json
{
  "location_id": "number (required, i32, min 1)",
  "limit": "number (optional, default 20, min 1, max 100)",
  "offset": "number (optional, default 0, min 0)"
}
```

**Validation**

- `location_id` is required and must be an integer greater than or equal to 1
- `limit` must be an integer from 1 to 100
- `offset` must be an integer greater than or equal to 0

**Data Flow**

Tables READ: `[user_profiles, location_memberships, posts]`  
Tables WRITTEN: `[]`

Order of operations: resolve authenticated profile, verify membership for the requested location, count matching `posts`, then read paginated `posts` ordered by `updated_at DESC, id DESC`.

**Business Logic**

Posts belong to a shared location, not to an individual user’s private workspace. Owners and `mambers` can view the same post set when assigned to the location.

**First-run / zero-data behavior**

If the selected assigned location has zero posts, return `200 OK` with `items: []`, `total: 0`, and the requested pagination values.

**Response**

Success payload:

```json
{
  "items": [
    {
      "id": 7,
      "location_id": 1,
      "external_ref": "post_mock_007",
      "summary": "Spring checkup special",
      "cta": "Book now",
      "post_type": "offer",
      "media_url": null,
      "created_by_user_profile_id": 2,
      "updated_by_user_profile_id": 2,
      "created_at": "2026-01-10T12:30:00Z",
      "updated_at": "2026-01-11T09:15:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

Field types:
- `items`: array of post records
- `items[].id`: number (`i32`)
- `items[].location_id`: number (`i32`)
- `items[].external_ref`: string or `null`
- `items[].summary`: string
- `items[].cta`: string
- `items[].post_type`: string
- `items[].media_url`: string or `null`
- `items[].created_by_user_profile_id`: number (`i32`) or `null`
- `items[].updated_by_user_profile_id`: number (`i32`) or `null`
- `items[].created_at`: ISO 8601 datetime string
- `items[].updated_at`: ISO 8601 datetime string
- `total`: number (`i64` safe API integer semantics)
- `limit`: number
- `offset`: number

HTTP status codes used: `200 OK`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`

**Error Taxonomy**

- `401 { "code": "UNAUTHORIZED" }` — Bearer token missing or invalid
- `403 { "code": "FORBIDDEN" }` — authenticated user is not assigned to the requested location
- `404 { "code": "NOT_FOUND" }` — authenticated identity has no application profile or the location does not exist
- `500 { "code": "INTERNAL_ERROR" }` — unexpected database failure

**Dependencies**

`post_model`, `user_profile_model`

#### post_create
**Purpose**

Creates a new mocked persisted post for one selected shared location.

**Path**

`POST /post_create`

**Authentication**

Yes — Authenticated. `user_id` is extracted server-side from the Bearer token.

**Headers**

`Content-Type: application/json`  
`Authorization: Bearer <token>`

**Request Payload**

```json
{
  "location_id": "number (required, i32, min 1)",
  "summary": "string (required, 1–1000 chars after trim)",
  "cta": "string (required, 1–120 chars after trim)",
  "post_type": "string (required, 1–80 chars after trim)",
  "media_url": "string (optional, max 2048 chars, must be absolute http or https URL when provided)"
}
```

**Validation**

- `location_id` is required and must be an integer greater than or equal to 1
- `summary` is required and must be 1 to 1000 characters after trim
- `cta` is required and must be 1 to 120 characters after trim
- `post_type` is required and must be 1 to 80 characters after trim
- `media_url`, when present, must be 1 to 2048 characters and start with `http://` or `https://`

**Data Flow**

Tables READ: `[user_profiles, location_memberships, locations]`  
Tables WRITTEN: `[posts (INSERT)]`

Order of operations: resolve authenticated profile, verify membership for `location_id`, confirm location exists, validate fields, insert `posts` row with `created_by_user_profile_id` and `updated_by_user_profile_id` set to the authenticated profile id, then read back the inserted row.

**Business Logic**

A post requires `summary`, `cta`, and `post_type`. `media_url` is optional. Each post belongs to exactly one location. Post creation is allowed for both `owner` and `mambers` memberships.

**First-run / zero-data behavior**

This endpoint provides the bootstrap path when a location has no posts. No prerequisite post rows or option tables are required before the first post can be created.

**Response**

Success payload:

```json
{
  "post": {
    "id": 7,
    "location_id": 1,
    "external_ref": null,
    "summary": "Spring checkup special",
    "cta": "Book now",
    "post_type": "offer",
    "media_url": null,
    "created_by_user_profile_id": 2,
    "updated_by_user_profile_id": 2,
    "created_at": "2026-01-10T12:30:00Z",
    "updated_at": "2026-01-10T12:30:00Z"
  }
}
```

Field types match `post_model.PostRecord`.

HTTP status codes used: `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`

**Error Taxonomy**

- `400 { "code": "VALIDATION_ERROR" }` — required fields are missing, blank after trim, invalid URL, or numeric fields are invalid
- `401 { "code": "UNAUTHORIZED" }` — Bearer token missing or invalid
- `403 { "code": "FORBIDDEN" }` — authenticated user is not assigned to the requested location
- `404 { "code": "NOT_FOUND" }` — location not found or authenticated identity has no application profile
- `500 { "code": "INTERNAL_ERROR" }` — unexpected database failure

**Dependencies**

`post_model`, `user_profile_model`

#### post_update
**Purpose**

Edits an existing mocked persisted post for one selected shared location.

**Path**

`POST /post_update`

**Authentication**

Yes — Authenticated. `user_id` is extracted server-side from the Bearer token.

**Headers**

`Content-Type: application/json`  
`Authorization: Bearer <token>`

**Request Payload**

```json
{
  "location_id": "number (required, i32, min 1)",
  "post_id": "number (required, i32, min 1)",
  "summary": "string (required, 1–1000 chars after trim)",
  "cta": "string (required, 1–120 chars after trim)",
  "post_type": "string (required, 1–80 chars after trim)",
  "media_url": "string | null (optional, max 2048 chars; null clears the field; non-null must be absolute http or https URL)"
}
```

**Validation**

- `location_id` is required and must be an integer greater than or equal to 1
- `post_id` is required and must be an integer greater than or equal to 1
- `summary` is required and must be 1 to 1000 characters after trim
- `cta` is required and must be 1 to 120 characters after trim
- `post_type` is required and must be 1 to 80 characters after trim
- `media_url`, when non-null, must be 1 to 2048 characters and start with `http://` or `https://`

**Data Flow**

Tables READ: `[user_profiles, location_memberships, posts]`  
Tables WRITTEN: `[posts (UPDATE)]`

Order of operations: resolve authenticated profile, verify membership for `location_id`, load the target `posts` row by `id` and `location_id`, validate fields, update editable columns, set `updated_by_user_profile_id` to the authenticated profile id, set `updated_at = NOW()`, then read back the updated row.

**Business Logic**

Only posts under the selected location may be updated. If `media_url` is explicitly `null`, the backend clears the stored media URL. The request updates the single target post only.

**First-run / zero-data behavior**

If a location has no posts yet, clients should use `post_create`; update does not create missing posts.

**Response**

Success payload:

```json
{
  "post": {
    "id": 7,
    "location_id": 1,
    "external_ref": "post_mock_007",
    "summary": "Spring checkup special extended",
    "cta": "Book now",
    "post_type": "offer",
    "media_url": "https://cdn.example.com/post-7.jpg",
    "created_by_user_profile_id": 2,
    "updated_by_user_profile_id": 3,
    "created_at": "2026-01-10T12:30:00Z",
    "updated_at": "2026-01-11T09:15:00Z"
  }
}
```

Field types match `post_model.PostRecord`.

HTTP status codes used: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`

**Error Taxonomy**

- `400 { "code": "VALIDATION_ERROR" }` — required fields are missing, blank after trim, invalid URL, or numeric fields are invalid
- `401 { "code": "UNAUTHORIZED" }` — Bearer token missing or invalid
- `403 { "code": "FORBIDDEN" }` — authenticated user is not assigned to the requested location
- `404 { "code": "NOT_FOUND" }` — post not found under the selected location, location not found, or authenticated identity has no application profile
- `500 { "code": "INTERNAL_ERROR" }` — unexpected database failure

**Dependencies**

`post_model`, `user_profile_model`

#### post_delete
**Purpose**

Deletes an existing mocked persisted post for one selected shared location.

**Path**

`POST /post_delete`

**Authentication**

Yes — Authenticated. `user_id` is extracted server-side from the Bearer token.

**Headers**

`Content-Type: application/json`  
`Authorization: Bearer <token>`

**Request Payload**

```json
{
  "location_id": "number (required, i32, min 1)",
  "post_id": "number (required, i32, min 1)"
}
```

**Validation**

- `location_id` is required and must be an integer greater than or equal to 1
- `post_id` is required and must be an integer greater than or equal to 1

**Data Flow**

Tables READ: `[user_profiles, location_memberships, posts]`  
Tables WRITTEN: `[posts (DELETE)]`

Order of operations: resolve authenticated profile, verify membership for `location_id`, verify the target post exists under that location, delete the row.

**Business Logic**

Delete operates only within the selected location context. The endpoint permanently removes the post row from `posts`; no archive state exists in this version.

**First-run / zero-data behavior**

If a location has zero posts, `post_delete` is simply not used. Missing target posts return `404 NOT_FOUND`, not a server error.

**Response**

Success payload:

```json
{
  "deleted": true,
  "post_id": 7
}
```

Field types:
- `deleted`: boolean
- `post_id`: number (`i32`)

HTTP status codes used: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`

**Error Taxonomy**

- `400 { "code": "VALIDATION_ERROR" }` — numeric fields are invalid
- `401 { "code": "UNAUTHORIZED" }` — Bearer token missing or invalid
- `403 { "code": "FORBIDDEN" }` — authenticated user is not assigned to the requested location
- `404 { "code": "NOT_FOUND" }` — post not found under the selected location, location not found, or authenticated identity has no application profile
- `500 { "code": "INTERNAL_ERROR" }` — unexpected database failure

**Dependencies**

`post_model`, `user_profile_model`

### CronJobs

No cronjobs are required for the current version because all current-version features are direct user-triggered workflows over persisted mocked data.

## Authorization and Access Rules

All protected endpoints require `Authorization: Bearer <token>`. The backend extracts the authenticated identity from the token and resolves the matching application profile through `user_profiles.auth_user_id`. Shared-location access is enforced through `location_memberships`, which is the only source of business-role and membership decisions. The exact role literals available in current-version backend responses and checks are `owner` and `mambers`.

A location-scoped endpoint must first confirm that the authenticated user has a membership row for the submitted `location_id`. If the membership check fails, the endpoint returns `403 FORBIDDEN`. If the token is missing or invalid, the endpoint returns `401 UNAUTHORIZED`.

## Data Handling and Validation Rules

Review replies and post content are stored as application-owned mocked GBP-style data. Validation occurs before any database write. Strings are trimmed before required-field validation. Pagination inputs are bounded to protect query performance. Review ratings are never client-editable in this version and are read directly from stored mocked review rows.

For list endpoints, `limit` and `offset` should be bound as `i64` SQL parameters even though request values are validated as integer JSON numbers, preventing PostgreSQL integer-width mismatches in `LIMIT` and `OFFSET` usage.

## First-Run Backend Behavior

A newly authenticated user with a provisioned `user_profiles` row and one or more assigned seeded locations can immediately call `location_list`, open a location through `location_get`, read `review_list` and `post_list`, submit a first review reply through `review_reply_upsert`, and create a first post through `post_create`.

If the authenticated user has no assigned locations, `location_list` returns an empty list. If an assigned location has no reviews or no posts, the corresponding list endpoints return empty arrays with zero totals. These conditions are valid first-run states and must never be converted into generic server errors.
