# Odoo Asset Management - Backend Integration Requirements

This document serves as the authoritative blueprint for the backend team taking over the REST API integration. The frontend has been scaffolded completely via local storage and mock classes, establishing clear contracts.

## 1. Authentication & Security
- **JWT Standard**: The backend must issue JSON Web Tokens (JWT) upon `/login`.
- **Stateless Verification**: The frontend will attach `Authorization: Bearer <token>` to all `api.ts` requests.
- **Secret Management**: Do NOT hardcode secrets. All JWT secrets, DB credentials, and external API keys must be loaded via server-side `.env`.
- **CORS Configuration**: Allow origins strictly tied to the frontend host URLs.
- **CSRF Protection**: If using HttpOnly cookies for tokens instead of Bearer auth, ensure CSRF token exchange is implemented.

## 2. Role-Based Access Control (RBAC)
The frontend enforces UI visibility based on the following exact roles:
- `admin`
- `asset_manager`
- `dept_head`
- `employee`

**IMPORTANT**: Frontend route-guards (`ProtectedRoute.tsx`) are strictly cosmetic and UX-driven. The backend MUST independently validate the role decoded from the JWT for EVERY write/mutation endpoint.

## 3. Data Integrity & Validation Checks
The frontend performs basic type checking and required-field marking. However, the backend must implement hard validation:
- **Allocation Overlap (Conflict Resolution)**: When assigning an asset to a user, the backend must verify `status === 'Available'` and ensure no concurrent active allocations exist for the same `assetId`.
- **Booking Overlap**: The backend must perform SQL/NoSQL interval intersection checks (e.g. `start_time < new_end_time AND end_time > new_start_time`) on the `ResourceBookings` table.
- **Audit Locking**: When an Audit Cycle is flagged as `Closed`, the database row must be marked immutable. Any subsequent updates to `status` or `discrepancies` for that `auditId` must return `403 Forbidden`.

## 4. API Response Contract
All endpoints must conform to the standard `ApiResponse` interface parsed by the frontend `ApiService`:
```typescript
{
  "data": { ... },     // The requested entity or array
  "status": 200,       // Standard HTTP code
  "message": "Success" // Human readable string
}
```

## 5. File Uploads (Maintenance & Avatar)
- The frontend currently skips multipart-form data processing.
- The backend must expose a dedicated `POST /upload` endpoint returning a CDN/Bucket URL string that the frontend can attach to standard JSON payloads (e.g., `photoUrl` in Maintenance Requests).
