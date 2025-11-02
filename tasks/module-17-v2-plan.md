# Module 17: Cerebryx v2 - Landing, Auth & Advanced Features

## Scope

Transform the app to include a marketing landing page, Microsoft Clarity analytics, Supabase authentication, and dual-mode operation (anonymous + registered users) with advanced features for registered users including saved documents with tags/search and comprehensive reading goals.

## Overview

This v2 implementation adds:
- **Landing Page**: Marketing/product page at `/` route
- **Analytics**: Microsoft Clarity integration for comprehensive user behavior tracking
- **Authentication**: Supabase Auth with Google OAuth and OTP (phone/email)
- **Dual-Mode Operation**: Anonymous users can use app without registration, registered users get additional features
- **Saved Documents**: Registered users can save documents for "read after" with tags, search, and filter
- **Reading Goals**: Comprehensive goal tracking (time-based, document-based, per-document) with progress visualization

## Route Restructuring

- **`/`**: New marketing landing page
- **`/study`**: Move current app flow (input → read → quiz → results)
- **`/auth`**: Authentication routes (login, signup, OTP verification)
- **`/saved`**: Saved documents management (registered users only)
- **`/goals`**: Reading goals dashboard (registered users only)

## Phase 1: Project Setup & Dependencies

- Install Supabase client: `@supabase/supabase-js`
- Install Microsoft Clarity: `@microsoft/clarity`
- Set up environment variables for Supabase (URL, anon key)
- Configure Supabase client utilities in `lib/supabase/`

## Phase 2: Route Restructuring

- Create new landing page at `app/page.tsx` (marketing content)
- Move current app to `app/study/page.tsx`
- Move study flow routes to `app/study/(flow)/`
- Update Navigation component to handle new route structure
- Add redirects for old routes if needed

## Phase 3: Microsoft Clarity Integration

- Create Clarity provider component in `providers/ClarityProvider.tsx`
- Add Clarity script initialization in root layout
- Set up event tracking for key user actions:
  - Session start/completion
  - Document upload/paste
  - Quiz generation/completion
  - Authentication events
  - Goal creation/updates
  - Document saves

## Phase 4: Supabase Authentication Setup

- Create Supabase client utilities in `lib/supabase/client.ts` and `lib/supabase/server.ts`
- Create authentication provider in `providers/AuthProvider.tsx`
- Implement authentication hooks: `hooks/useAuth.ts`
- Create auth UI components:
  - Login modal/page
  - Signup modal/page  
  - OTP verification component
  - Google OAuth button
- Update root layout to include AuthProvider
- Create middleware for protected routes (optional, since we support anonymous)

## Phase 5: Database Schema & Migration

- Create SQL migration files for all tables:
  - Profiles table with user metadata
  - Saved documents with text/content storage
  - Tags table
  - Junction table for document-tag relationships
  - Reading goals tables (time-based and document-based)
  - Reading sessions for tracking
  - Goal progress tracking
- Set up Row Level Security (RLS) policies:
  - Users can only access their own data
  - Public read access for anonymous mode features
- Create database helper functions in `lib/supabase/queries/`

## Phase 6: Dual-Mode Operation

- Update SessionProvider to detect authentication state
- Modify UI to show/hide features based on auth status:
  - Show "Sign in to save" prompts for anonymous users
  - Enable save functionality for authenticated users
- Create anonymous session handling (temporary storage only)

## Phase 7: Saved Documents Feature (Registered Users)

- Create `app/saved/page.tsx` for saved documents list
- Implement document saving:
  - Save button in input/results pages
  - Store text content, metadata (reading time, word count)
  - Extract/allow manual title
- Implement tagging system:
  - Tag input component
  - Tag autocomplete/create
  - Display tags on documents
- Implement search/filter:
  - Full-text search on document content
  - Filter by tags
  - Sort options (date, title, reading time)
- Create document detail/edit view
- Add delete/archive functionality

## Phase 8: Reading Goals Feature (Registered Users)

- Create `app/goals/page.tsx` for goals dashboard
- Implement goal types:
  - **Time-based goals**: Daily/weekly/monthly reading time targets
  - **Document goals**: Target number of documents to read per period
  - **Per-document goals**: Reading goals for specific saved documents
- Create goal creation/editing UI:
  - Goal type selector
  - Period selection (daily/weekly/monthly)
  - Target value input
  - Start/end dates
- Implement progress tracking:
  - Track reading sessions from study flow
  - Calculate progress toward goals
  - Display progress bars/charts
- Create goal visualization components:
  - Progress indicators
  - Goal cards
  - Statistics dashboard
- Add goal notifications/reminders (future enhancement placeholder)

## Phase 9: Integration & Polish

- Update study flow to track sessions for goal progress (authenticated users)
- Add "Save for later" CTAs throughout the app
- Create onboarding flow for new registered users
- Update Navigation to show saved/goals links for authenticated users
- Add user profile menu/dropdown
- Test anonymous vs registered user flows
- Update metadata and SEO for landing page

## Phase 10: Documentation & Testing

- Update environment variable documentation
- Document Supabase setup process
- Document database schema and relationships
- Add error handling for Supabase operations
- Test authentication flows (Google OAuth, OTP)
- Test RLS policies and data security

## Files to Create

### New Routes
- `app/page.tsx` - Landing page
- `app/study/page.tsx` - Moved from app/page.tsx
- `app/auth/login/page.tsx`
- `app/auth/signup/page.tsx`
- `app/auth/verify-otp/page.tsx`
- `app/saved/page.tsx` - Saved documents list
- `app/saved/[id]/page.tsx` - Document detail
- `app/goals/page.tsx` - Goals dashboard

### API Routes
- `app/api/auth/callback/route.ts` - OAuth callback
- `app/api/documents/route.ts` - CRUD operations
- `app/api/goals/route.ts` - Goal operations

### Library Files
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/queries/documents.ts` - Document queries
- `lib/supabase/queries/goals.ts` - Goal queries
- `lib/supabase/queries/profile.ts` - Profile queries

### Providers
- `providers/AuthProvider.tsx` - Authentication context
- `providers/ClarityProvider.tsx` - Analytics provider

### Hooks
- `hooks/useAuth.ts` - Auth hooks
- `hooks/useSavedDocuments.ts` - Documents hook
- `hooks/useGoals.ts` - Goals hook

### Components
- `components/auth/LoginForm.tsx`
- `components/auth/SignupForm.tsx`
- `components/auth/OTPVerification.tsx`
- `components/auth/GoogleAuthButton.tsx`
- `components/documents/DocumentCard.tsx`
- `components/documents/DocumentList.tsx`
- `components/documents/TagInput.tsx`
- `components/documents/SearchFilter.tsx`
- `components/goals/GoalCard.tsx`
- `components/goals/GoalProgress.tsx`
- `components/goals/GoalForm.tsx`
- `components/goals/ProgressChart.tsx`

## Files to Modify

- `app/layout.tsx` - Add AuthProvider, ClarityProvider, update Navigation
- `app/page.tsx` - Replace with landing page
- `components/Navigation.tsx` - Add saved/goals links for authenticated users
- `providers/SessionProvider.tsx` - Add auth state detection
- `package.json` - Add Supabase and Clarity dependencies
- `.env.local.example` - Add new environment variables

## Database Schema

### Tables
- **`profiles`**: User profile data
- **`saved_documents`**: Saved documents for "read after"
- **`document_tags`**: Tags for organizing documents
- **`saved_document_tags`**: Many-to-many relationship
- **`reading_goals`**: Daily/weekly/monthly reading goals
- **`document_goals`**: Per-document reading goals
- **`reading_sessions`**: Track reading activity for goals
- **`goal_progress`**: Progress tracking for goals

### Row Level Security (RLS)
- Users can only access their own data
- Public read access for anonymous mode features where applicable

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_clarity_project_id
```

## Key Technical Decisions

1. **Anonymous Mode**: No data persistence, works entirely client-side like current MVP
2. **Authentication**: Supabase Auth with Google OAuth and OTP (phone/email)
3. **Data Storage**: Supabase PostgreSQL for all persisted data
4. **Analytics**: Microsoft Clarity for comprehensive user behavior tracking
5. **RLS**: Strict Row Level Security - users can only access their own data
6. **Backward Compatibility**: Existing study flow works in anonymous mode without changes

## Success Criteria

- Landing page clearly communicates product value
- Users can use app anonymously without registration
- Users can register via Google OAuth or OTP
- Registered users can save documents with tags
- Search and filter work for saved documents
- Reading goals can be created and tracked (time, documents, per-document)
- Progress tracking accurately reflects reading sessions
- Clarity analytics tracks all key user interactions
- All data is secure via RLS policies

## To-dos

- [x] Setup dependencies (Supabase, Clarity)
- [x] Route restructure (landing page + move app to /study)
- [x] Clarity integration with event tracking
- [ ] Supabase authentication (Google OAuth + OTP)
- [ ] Database schema and migrations
- [ ] Dual-mode operation (anonymous + registered)
- [ ] Saved documents feature with tags/search/filter
- [ ] Reading goals feature (time, documents, per-document)
- [ ] Integration and polish
- [ ] Testing and documentation

## Status: 📋 PLANNED

Module 17 (v2 Plan) has been created. Ready to begin implementation.

