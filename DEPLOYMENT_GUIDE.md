# RateVault Deployment Guide

This guide will help you deploy RateVault to Vercel with Supabase as the database.

## Prerequisites

- GitHub account
- Vercel account
- Supabase account
- Node.js 18+ installed locally

## Step 1: Set up Supabase Database

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a region close to your users
4. Set a strong database password
5. Wait for the project to be created

### 1.2 Get Database Connection Details
1. In your Supabase dashboard, go to **Settings** → **Database**
2. Copy the **Connection string** (URI format)
3. It should look like: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

### 1.3 Set up Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Run the following SQL to create the tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create suppliers table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  service_type TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  phone TEXT,
  notes TEXT,
  rate_sheet_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rates table
CREATE TABLE rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  season TEXT NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  room_type TEXT,
  board_basis TEXT,
  price_per_person NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  notes TEXT
);

-- Create tours table
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  quote_ref TEXT NOT NULL,
  tour_type TEXT NOT NULL CHECK (tour_type IN ('FIT', 'Group')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Quote', 'Provisional', 'Confirmed', 'Cancelled')),
  deposit_due DATE,
  release_date DATE,
  final_payment DATE,
  notes TEXT,
  excel_quote_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  service_desc TEXT NOT NULL,
  check_in DATE,
  check_out DATE,
  pax INTEGER NOT NULL,
  confirmation_no TEXT,
  deposit_status TEXT NOT NULL CHECK (deposit_status IN ('Not Required', 'Pending', 'Paid')),
  notes TEXT
);

-- Create guides table
CREATE TABLE guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT,
  linked_tours UUID[]
);

-- Create indexes for better performance
CREATE INDEX idx_rates_supplier_id ON rates(supplier_id);
CREATE INDEX idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX idx_bookings_supplier_id ON bookings(supplier_id);
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tours_start_date ON tours(start_date);
```

## Step 2: Set up GitHub Repository

### 2.1 Create GitHub Repository
1. Create a new repository on GitHub
2. Push your RateVault code to the repository
3. Make sure the main branch is `main`

### 2.2 Add Environment Secrets
1. Go to your repository **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `ORG_ID`: Your Vercel organization ID
   - `PROJECT_ID`: Your Vercel project ID (will be created in next step)

## Step 3: Deploy to Vercel

### 3.1 Connect Repository to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login and click **New Project**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm ci`

### 3.2 Configure Environment Variables
In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
NODE_ENV=production
```

### 3.3 Deploy
1. Click **Deploy** in Vercel
2. Wait for the deployment to complete
3. Copy the **Project ID** from the deployment and add it to GitHub secrets

## Step 4: Configure Domain (Optional)

### 4.1 Custom Domain
1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS settings as instructed

## Step 5: Test the Deployment

### 5.1 Verify Database Connection
1. Visit your deployed app
2. Try creating a supplier and rate
3. Check if data appears in Supabase dashboard

### 5.2 Test All Features
1. Create suppliers with rates
2. Create tours with bookings
3. Test editing and deleting
4. Verify all CRUD operations work

## Troubleshooting

### Common Issues

#### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if Supabase project is active
- Ensure database password is correct

#### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies are installed
- Check for TypeScript errors

#### Environment Variables
- Ensure all required variables are set in Vercel
- Check variable names match exactly
- Verify no extra spaces or characters

### Getting Help

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Verify all environment variables
4. Test locally first with the same database

## Security Notes

- Never commit `.env` files to version control
- Use strong database passwords
- Regularly update dependencies
- Monitor your Supabase usage

## Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure backups
3. Set up custom domain
4. Add SSL certificates (handled by Vercel)
5. Consider adding authentication if needed

Your RateVault application should now be live and accessible to users!
