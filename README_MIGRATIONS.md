# Database Migration Instructions

## Missing Tables Created

This project requires two additional tables that were missing from the initial schema:

### 1. Reviews Table
**File**: `supabase/migrations/create_reviews_table.sql`

**Purpose**: Stores customer reviews from various sources (Google, Facebook, website, manual entry) for the Reputation Management feature.

**Fields**:
- `id`: UUID primary key
- `customer_name`: Customer's name
- `customer_email`: Customer's email
- `rating`: 1-5 star rating
- `title`: Review title
- `content`: Review content/text
- `source`: Source of the review (google/facebook/website/manual)
- `status`: Review status (pending/approved/rejected/flagged)
- `response`: Business response to the review (optional)
- `response_date`: When the response was added
- `verified`: Whether the review is verified
- `helpful_votes`: Number of helpful votes
- `reported`: Whether the review has been reported
- `created_at`, `updated_at`: Timestamps

### 2. Customer Tag Assignments Table
**File**: `supabase/migrations/create_customer_tag_assignments_table.sql`

**Purpose**: Links customers to tags for segmentation and filtering in the Customer Management feature.

**Fields**:
- `id`: UUID primary key
- `customer_email`: Customer's email (foreign key reference)
- `customer_name`: Customer's name (denormalized for performance)
- `tag_id`: References the `customer_tags` table
- `created_at`, `assigned_at`: Timestamps

## How to Apply These Migrations

### Option 1: Using Supabase CLI (Recommended)
```bash
# Make sure you're in the project root
cd c:\Users\USER\holistic-payment-bounceback

# Apply the migrations
supabase db push

# Or apply individually
psql -h <your-supabase-host> -U postgres -d postgres -f supabase/migrations/create_reviews_table.sql
psql -h <your-supabase-host> -U postgres -d postgres -f supabase/migrations/create_customer_tag_assignments_table.sql
```

### Option 2: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file
4. Execute the SQL statements

### Option 3: Manual Execution
1. Open the Supabase dashboard
2. Go to Database → SQL Editor
3. Copy the content from `create_reviews_table.sql`
4. Click "Run" to execute
5. Repeat for `create_customer_tag_assignments_table.sql`

## After Migration

After running these migrations, you need to regenerate the TypeScript types:

```bash
# Generate updated types
supabase gen types typescript --local > src/integrations/supabase/types.ts

# Or if using a remote project
supabase gen types typescript --project-id <your-project-id> > src/integrations/supabase/types.ts
```

## Verification

After applying the migrations and regenerating types, verify that:

1. The TypeScript errors in `ReputationManagement.tsx` are resolved
2. The TypeScript errors in `CustomersManagement.tsx` are resolved
3. You can query the new tables without errors
4. The application builds successfully

## Notes

- Both tables have Row Level Security (RLS) enabled
- Default policies allow authenticated users to perform all operations
- You may want to adjust the RLS policies based on your security requirements
- The `customer_tag_assignments` table assumes the `customer_tags` table already exists
