# Life Admin OS - Setup Guide

## Prerequisites
- Node.js 20+
- A Supabase account (free tier works)
- An Anthropic API key (for AI document extraction)

---

## Step 1: Clone and Install

```bash
cd life-admin-os
npm install
```

---

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (~1-2 minutes)
3. Go to **Settings > API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 3: Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Step 4: Create Database Tables

Go to your Supabase project → **SQL Editor** → **New Query** and run:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Profile
CREATE TABLE users_profile (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly','annual','weekly','quarterly')),
  next_renewal_date DATE NOT NULL,
  category TEXT DEFAULT 'Other',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','cancelled','paused')),
  cancel_reminder BOOLEAN DEFAULT FALSE,
  notes TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deadlines
CREATE TABLE deadlines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  category TEXT DEFAULT 'personal' CHECK (category IN ('school','personal','work','financial','medical','government','other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','overdue')),
  recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  document_type TEXT DEFAULT 'other',
  vendor_name TEXT,
  amount DECIMAL(10,2),
  key_date DATE,
  expiry_date DATE,
  description TEXT,
  category TEXT DEFAULT 'other',
  ai_extracted BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bills
CREATE TABLE bills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  due_date DATE NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  recurring BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'utilities',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warranties
CREATE TABLE warranties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  product_name TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  coverage_notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Step 5: Enable Row Level Security

Run this SQL to enable RLS on all tables:

```sql
-- Enable RLS
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;

-- users_profile: users can only access their own profile
CREATE POLICY "Users can view own profile" ON users_profile
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users_profile
  FOR ALL USING (auth.uid() = id);

-- subscriptions
CREATE POLICY "Users manage own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- deadlines
CREATE POLICY "Users manage own deadlines" ON deadlines
  FOR ALL USING (auth.uid() = user_id);

-- documents
CREATE POLICY "Users manage own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);

-- bills
CREATE POLICY "Users manage own bills" ON bills
  FOR ALL USING (auth.uid() = user_id);

-- appointments
CREATE POLICY "Users manage own appointments" ON appointments
  FOR ALL USING (auth.uid() = user_id);

-- warranties
CREATE POLICY "Users manage own warranties" ON warranties
  FOR ALL USING (auth.uid() = user_id);
```

---

## Step 6: Set Up Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket named `documents`
3. Set it to **Public** (so uploaded files can be viewed via URL)
4. Add storage policy - run this SQL:

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to read their own documents
CREATE POLICY "Users can read own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to delete their own documents
CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Step 7: Configure Supabase Auth

1. Go to **Authentication > Settings**
2. Set **Site URL** to `http://localhost:3000` (development) or your Vercel URL
3. Add to **Redirect URLs**: `http://localhost:3000/auth/callback`

---

## Step 8: Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add it to `.env.local` as `ANTHROPIC_API_KEY`

---

## Step 9: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Vercel

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
4. Update Supabase Auth → Site URL and Redirect URLs to your Vercel URL

---

## Troubleshooting

- **"No auth session"** - Make sure you've run the auth callback route and your Supabase redirect URLs include your app URL
- **"AI extraction failed"** - Check your `ANTHROPIC_API_KEY` is set correctly
- **"Upload failed"** - Make sure the `documents` storage bucket exists and has the correct policies
- **RLS errors** - Make sure you ran all the `CREATE POLICY` statements
