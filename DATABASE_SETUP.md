# Database Setup Guide for CookFort Phase 6

## Current Status

The Prisma schema has been updated with Phase 6 models, but the database migration cannot be completed because the database credentials in [.env](file://.env) are placeholder values.

## Issue

The current `DATABASE_URL` in [.env](file://.env):
```
DATABASE_URL="postgresql://user:password@localhost:5432/cookfort?schema=public"
```

This uses placeholder credentials (`user:password`) which don't authenticate with your PostgreSQL server.

## Solution: Configure Database Credentials

### Option 1: Use Existing PostgreSQL User (Recommended for Development)

1. **Check if you have an existing PostgreSQL user:**
   ```bash
   sudo -u postgres psql -c "\du"
   ```

2. **If you have a user, update [.env](file://.env) with actual credentials:**
   ```bash
   DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/cookfort?schema=public"
   ```

3. **Create the database if it doesn't exist:**
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE cookfort;"
   ```

### Option 2: Create New PostgreSQL User for CookFort

1. **Access PostgreSQL as superuser:**
   ```bash
   sudo -u postgres psql
   ```

2. **Create a new user and database:**
   ```sql
   -- Create user
   CREATE USER cookfort_user WITH PASSWORD 'your_secure_password';

   -- Create database
   CREATE DATABASE cookfort OWNER cookfort_user;

   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE cookfort TO cookfort_user;

   -- Exit
   \q
   ```

3. **Update [.env](file://.env) with new credentials:**
   ```bash
   DATABASE_URL="postgresql://cookfort_user:your_secure_password@localhost:5432/cookfort?schema=public"
   ```

### Option 3: Use Current System User (Simplest for Development)

1. **Create PostgreSQL role matching your system username:**
   ```bash
   sudo -u postgres createuser -s oyinkuro
   ```

2. **Create the database:**
   ```bash
   createdb cookfort
   ```

3. **Update [.env](file://.env) (no password needed for peer authentication):**
   ```bash
   DATABASE_URL="postgresql://oyinkuro@localhost:5432/cookfort?schema=public"
   ```

## Running the Migration

Once you've configured proper database credentials:

1. **Verify database connection:**
   ```bash
   npx prisma db pull
   ```

2. **Run the migration:**
   ```bash
   npx prisma migrate dev --name add_phase6_models
   ```

This will create and apply a migration that adds:
- **Subscription** model - For chef subscription management
- **AnalyticsEvent** model - For tracking user events
- **ApiClient** model - For API key management
- **Extended ActivityLog** - With severity levels and metadata

3. **Verify migration:**
   ```bash
   npx prisma studio
   ```

## What the Migration Adds

### New Models

**Subscription** - Stripe subscription management:
- `stripeSubId` - Stripe subscription ID
- `stripeCustomerId` - Stripe customer ID
- `plan` - BASIC, PRO, or ELITE
- `status` - ACTIVE, CANCELED, PAST_DUE, etc.
- Period tracking and cancellation flags

**AnalyticsEvent** - Event tracking:
- `type` - Event type (page_view, booking_create, etc.)
- `userId` - Optional user ID
- `entity` / `entityId` - Related entity reference
- `metadata` - JSON metadata
- Indexed for efficient querying

**ApiClient** - API key management:
- `key` and `secret` - Authentication credentials
- `planTier` - FREE, BASIC, PRO, ENTERPRISE
- `usageCount` and `usageLimit` - Rate limiting
- `isActive` - Enable/disable flag

### Modified Models

**ActivityLog** - Enhanced logging:
- `severity` - DEBUG, INFO, WARN, ERROR, CRITICAL
- `component` - System component identifier
- `metadata` - Additional JSON data
- New indexes for filtering

**User** - New relations:
- `subscriptions[]` - Subscription records
- `apiClients[]` - API key records

## Troubleshooting

### Error: "Authentication failed"
- Check DATABASE_URL credentials are correct
- Verify PostgreSQL is running: `pg_isready`
- Test connection: `psql $DATABASE_URL`

### Error: "Database does not exist"
- Create database: `createdb cookfort`
- Or: `sudo -u postgres psql -c "CREATE DATABASE cookfort;"`

### Error: "Role does not exist"
- Create the user role as shown in Option 2 or 3 above

### Error: "Peer authentication failed"
- Either create a role matching your system username (Option 3)
- Or configure password authentication in `/etc/postgresql/*/main/pg_hba.conf`

## Next Steps After Migration

1. **Test the health check endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Configure Stripe webhook secret:**
   - Add to [.env](file://.env): `STRIPE_WEBHOOK_SECRET=whsec_...`
   - Get from Stripe Dashboard → Developers → Webhooks

3. **Add Stripe price IDs to [.env](file://.env):**
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_BASIC_PRICE_ID=price_...
   STRIPE_PRO_PRICE_ID=price_...
   STRIPE_ELITE_PRICE_ID=price_...
   ```

4. **Begin Phase 6 UI development:**
   - Admin billing dashboard
   - Subscription management pages
   - Analytics dashboards
   - System logs UI

## Environment Variables Checklist

Ensure your [.env](file://.env) has:

```bash
# Database
DATABASE_URL="postgresql://..." # ← Configure this first!

# Auth (existing)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stripe (add these)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_BASIC_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_ELITE_PRICE_ID="price_..."

# Optional: Redis (for distributed caching)
REDIS_URL="redis://localhost:6379"

# Optional: Sentry (for error tracking)
SENTRY_DSN="https://..."

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY="..."
NEXT_PUBLIC_POSTHOG_HOST="..."
```

## Production Deployment

For production:

1. **Use managed PostgreSQL** (AWS RDS, Supabase, etc.)
2. **Use environment-specific database URLs**
3. **Run migrations in CI/CD pipeline:**
   ```bash
   npx prisma migrate deploy
   ```
4. **Never commit [.env](file://.env) to version control**
5. **Use secrets management** (GitHub Secrets, AWS Secrets Manager, etc.)

---

**Need Help?** Check the main [PHASE6_SUMMARY.md](file:///home/oyinkuro/projects/cookfort/cookish/PHASE6_SUMMARY.md) for full Phase 6 documentation.
