# Database Compatibility Strategy

## Overview

This document explains our database design approach to ensure compatibility with both **CockroachDB Cloud (current)** and **AWS RDS PostgreSQL (future migration)**.

## Problem Statement

CockroachDB and PostgreSQL have different levels of feature parity around DDL operations:

- CockroachDB doesn't support `DROP TRIGGER IF EXISTS` syntax
- CockroachDB can't replace trigger functions with active triggers
- CockroachDB doesn't support `CASCADE` on triggers
- CockroachDB doesn't allow `DROP TRIGGER` inside PL/pgSQL functions

This made database trigger management problematic during migrations.

## Solution: Application-Level Timestamp Management

Instead of relying on database triggers to automatically update `updated_at` timestamps, we moved this logic to the application layer.

### Implementation

**Schema Changes** (`src/database/schema.sql`):
- Removed all `CREATE TRIGGER` statements
- Removed the `update_updated_at_column()` function
- Kept `updated_at` columns on all tables (default to `NOW()` for new records)

**Model Changes**:
- **User Model** (`src/models/User.ts`): `update()` method now sets `updated_at = NOW()` before executing the SQL
- **Shipment Model** (`src/models/Shipment.ts`): `update()` method now sets `updated_at = NOW()` before executing the SQL

### Code Example

```typescript
// In UserModel.update()
fields.push(`updated_at = $${paramCount++}`);
values.push(new Date());
```

When `UserModel.update()` is called, it automatically includes `updated_at` in the SET clause with the current timestamp.

## Benefits

✅ **Maximum Portability**: Works on any SQL database (CockroachDB, PostgreSQL, MySQL, etc.)
✅ **Simplified Migrations**: Schema is pure DDL with no complex procedural logic
✅ **Explicit Logic**: Timestamp updates are visible in the code, not hidden in database triggers
✅ **Future-Proof**: Migration from CockroachDB to AWS RDS PostgreSQL requires no schema changes

## Trade-offs

⚠️ **Application Discipline**: All updates must use the model's `update()` method
⚠️ **Direct SQL Bypass**: Direct SQL updates (e.g., from admin tools) won't update `updated_at`

For a business application like this shipment portal, these trade-offs are acceptable since:
- All data changes go through the application layer
- Admin tools can also use the model layer for consistency

## Migration Path to AWS RDS

When migrating from CockroachDB Cloud to AWS RDS PostgreSQL:

1. Schema is already compatible - no DDL changes needed
2. No application logic changes required
3. Dump from CockroachDB, restore to RDS - timestamps preserved
4. Application code works identically on both databases

## Audit Trail

For complete audit trails, the system uses the `audit_logs` table which captures:
- `action`: The operation performed (LOGIN, CREATE, UPDATE, DELETE, etc.)
- `entity_type`: Type of entity modified (USER, SHIPMENT, etc.)
- `entity_id`: Which record was affected
- `details`: JSON data about the change
- `created_at`: When the action occurred

This provides a complete history separate from `updated_at` timestamps.

## Testing

All 39 unit and integration tests pass with this approach:
- User update operations
- Shipment lifecycle management
- RBAC enforcement
- End-to-end workflows

## References

- CockroachDB Issue #134555: Cannot replace trigger functions
- CockroachDB Issue #128151: Cascade dropping triggers not supported
- CockroachDB Issue #110080: DROP TRIGGER inside functions not supported
