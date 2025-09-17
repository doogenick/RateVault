# RateVault - Quick Deployment Setup

## 🚀 Deploy to Vercel + Supabase

### Quick Start (5 minutes)

1. **Set up Supabase Database**
   ```bash
   # 1. Go to supabase.com and create a new project
   # 2. Copy the connection string from Settings → Database
   # 3. Run the SQL schema from DEPLOYMENT_GUIDE.md in Supabase SQL Editor
   ```

2. **Deploy to Vercel**
   ```bash
   # 1. Push code to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   
   # 2. Go to vercel.com and import your GitHub repo
   # 3. Add environment variable: DATABASE_URL=your-supabase-connection-string
   # 4. Deploy!
   ```

### Environment Variables Needed

Create a `.env` file locally with:
```env
DATABASE_URL=postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres
NODE_ENV=development
PORT=5000
```

### Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create all tables
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

CREATE TABLE guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT,
  linked_tours UUID[]
);

-- Create indexes
CREATE INDEX idx_rates_supplier_id ON rates(supplier_id);
CREATE INDEX idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX idx_bookings_supplier_id ON bookings(supplier_id);
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tours_start_date ON tours(start_date);
```

### Testing Locally

```bash
# Install dependencies
npm install

# Set up environment
cp env.example .env
# Edit .env with your Supabase connection string

# Run development server
npm run dev
```

### Vercel Configuration

The `vercel.json` file is already configured for:
- ✅ API routes (`/api/*`) → Serverless functions
- ✅ Static files → Client build
- ✅ Environment variables
- ✅ Build commands

### What's Included

- ✅ Complete database schema
- ✅ Vercel deployment configuration
- ✅ GitHub Actions workflow
- ✅ Environment setup
- ✅ Build scripts
- ✅ Production optimizations

### After Deployment

1. **Test the app** - Create suppliers, rates, tours, and bookings
2. **Check Supabase** - Verify data is being stored
3. **Monitor Vercel** - Check deployment logs
4. **Set up custom domain** (optional)

### Support

If you need help:
1. Check the detailed `DEPLOYMENT_GUIDE.md`
2. Verify all environment variables are set
3. Test locally first with the same database
4. Check Vercel and Supabase logs

**Your RateVault app will be live in minutes!** 🎉
