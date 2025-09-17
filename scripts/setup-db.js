#!/usr/bin/env node

/**
 * Database Setup Script for RateVault
 * 
 * This script helps you set up the database schema in Supabase
 * Run with: node scripts/setup-db.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schemaSQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
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
CREATE TABLE IF NOT EXISTS rates (
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
CREATE TABLE IF NOT EXISTS tours (
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
CREATE TABLE IF NOT EXISTS bookings (
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
CREATE TABLE IF NOT EXISTS guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT,
  linked_tours UUID[]
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rates_supplier_id ON rates(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_supplier_id ON bookings(supplier_id);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_start_date ON tours(start_date);

-- Insert some sample data
INSERT INTO suppliers (name, region, service_type, contact_name, contact_email, phone) VALUES
('Safari Lodge Okavango', 'Okavango Delta', 'Accommodation', 'John Smith', 'john@safarilodge.com', '+267 123 4567'),
('Cape Town Tours', 'Cape Town', 'Activity', 'Sarah Johnson', 'sarah@capetowntours.com', '+27 21 123 4567'),
('Kruger Transfers', 'Kruger National Park', 'Transfer', 'Mike Wilson', 'mike@krugertransfers.com', '+27 13 123 4567')
ON CONFLICT DO NOTHING;

INSERT INTO rates (supplier_id, season, valid_from, valid_to, room_type, board_basis, price_per_person, currency) VALUES
((SELECT id FROM suppliers WHERE name = 'Safari Lodge Okavango'), 'High 2025', '2025-06-01', '2025-09-30', 'Standard Room', 'FB', 450.00, 'USD'),
((SELECT id FROM suppliers WHERE name = 'Safari Lodge Okavango'), 'Low 2025', '2025-10-01', '2025-05-31', 'Standard Room', 'FB', 350.00, 'USD'),
((SELECT id FROM suppliers WHERE name = 'Cape Town Tours'), 'High 2025', '2025-06-01', '2025-09-30', 'N/A', 'N/A', 120.00, 'USD'),
((SELECT id FROM suppliers WHERE name = 'Kruger Transfers'), 'All Year', '2025-01-01', '2025-12-31', 'N/A', 'N/A', 80.00, 'USD')
ON CONFLICT DO NOTHING;
`;

console.log('🗄️  RateVault Database Setup');
console.log('============================');
console.log('');
console.log('Copy and paste the following SQL into your Supabase SQL Editor:');
console.log('');
console.log('--- START SQL ---');
console.log(schemaSQL.trim());
console.log('--- END SQL ---');
console.log('');
console.log('📋 Instructions:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Paste the SQL above');
console.log('4. Click "Run" to execute');
console.log('');
console.log('✅ This will create all tables and insert sample data');
console.log('🚀 Your database will be ready for RateVault!');
