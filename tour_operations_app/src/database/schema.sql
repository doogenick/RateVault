-- Tour Operations Database Schema
-- Based on Nomad Tours SOP Requirements

-- Users and Authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) DEFAULT 'consultant',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agents and Clients
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    country VARCHAR(50),
    region VARCHAR(50),
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    payment_terms VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tour Categories
CREATE TABLE tour_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Tours
CREATE TABLE tours (
    id SERIAL PRIMARY KEY,
    tour_code VARCHAR(20) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES tour_categories(id),
    agent_id INTEGER REFERENCES agents(id),
    consultant_id INTEGER REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    duration_days INTEGER,
    max_pax INTEGER,
    confirmed_pax INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'quote', -- quote, provisional, confirmed, cancelled
    currency VARCHAR(3) DEFAULT 'ZAR',
    exchange_rate DECIMAL(10,4),
    total_cost DECIMAL(12,2),
    deposit_amount DECIMAL(12,2),
    final_payment_due DATE,
    special_requirements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quote Management
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    quote_number VARCHAR(20) UNIQUE NOT NULL,
    tour_id INTEGER REFERENCES tours(id),
    agent_id INTEGER REFERENCES agents(id),
    consultant_id INTEGER REFERENCES users(id),
    quote_date DATE NOT NULL,
    valid_until DATE,
    status VARCHAR(20) DEFAULT 'draft', -- draft, sent, accepted, declined, expired
    total_amount DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'ZAR',
    exchange_rate DECIMAL(10,4),
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quote Items (Services, Activities, Accommodation)
CREATE TABLE quote_items (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
    day_number INTEGER,
    service_type VARCHAR(50), -- accommodation, activity, transport, meal
    service_name VARCHAR(200),
    supplier VARCHAR(200),
    description TEXT,
    unit_price DECIMAL(10,2),
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(12,2),
    is_included BOOLEAN DEFAULT true,
    notes TEXT
);

-- Suppliers
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50), -- accommodation, activity, transport, meal
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    country VARCHAR(50),
    payment_terms VARCHAR(100),
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supplier Rates
CREATE TABLE supplier_rates (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    service_name VARCHAR(200),
    rate_type VARCHAR(50), -- per_person, per_room, per_vehicle, per_day
    rate DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'ZAR',
    valid_from DATE,
    valid_to DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES tours(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    booking_reference VARCHAR(100),
    service_type VARCHAR(50),
    service_name VARCHAR(200),
    booking_date DATE,
    check_in_date DATE,
    check_out_date DATE,
    pax_count INTEGER,
    room_configuration VARCHAR(100),
    total_amount DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'ZAR',
    status VARCHAR(20) DEFAULT 'provisional', -- provisional, confirmed, cancelled
    confirmation_date DATE,
    cancellation_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Overnight Lists
CREATE TABLE overnight_lists (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES tours(id),
    day_number INTEGER,
    date DATE,
    location VARCHAR(200),
    accommodation VARCHAR(200),
    accommodation_type VARCHAR(50),
    pax_count INTEGER,
    room_configuration VARCHAR(100),
    meals_breakfast VARCHAR(10), -- x, 0, 1
    meals_lunch VARCHAR(10),     -- x, 0, 1
    meals_dinner VARCHAR(10),    -- x, 0, 1
    activities TEXT,
    supplier VARCHAR(200),
    booking_reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'provisional',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,
    tour_id INTEGER REFERENCES tours(id),
    agent_id INTEGER REFERENCES agents(id),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    exchange_rate DECIMAL(10,4),
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, cancelled
    payment_date DATE,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Items
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(200) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(12,2),
    notes TEXT
);

-- Booking Checklists
CREATE TABLE booking_checklists (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES tours(id),
    checklist_type VARCHAR(50), -- pre_tour, during_tour, post_tour
    item_name VARCHAR(200) NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_by INTEGER REFERENCES users(id),
    completed_at TIMESTAMP,
    due_date DATE,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tour Crew
CREATE TABLE tour_crew (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES tours(id),
    crew_type VARCHAR(50), -- driver, guide, cook, camp_assistant
    name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_confirmed BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tour Equipment
CREATE TABLE tour_equipment (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES tours(id),
    equipment_type VARCHAR(100),
    equipment_name VARCHAR(200),
    quantity INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Settings
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default data
INSERT INTO tour_categories (name, description) VALUES
('Scheduled Tours', 'Regular scheduled tour departures'),
('Private Tours', 'Custom private group tours'),
('Truck Rental', 'Vehicle rental only'),
('Accommodation Only', 'Accommodation booking service'),
('Transfer Service', 'Airport and intercity transfers');

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('company_name', 'Nomad Tours', 'Company name'),
('company_email', 'charters@nomadtours.co.za', 'Main company email'),
('after_hours_phone', '+27 72 528 2613', 'After hours emergency phone'),
('default_currency', 'ZAR', 'Default currency for quotes and invoices'),
('deposit_percentage', '25', 'Default deposit percentage'),
('final_payment_days', '45', 'Days before departure for final payment'),
('quote_validity_days', '30', 'Default quote validity period');

-- Create indexes for better performance
CREATE INDEX idx_tours_agent_id ON tours(agent_id);
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tours_start_date ON tours(start_date);
CREATE INDEX idx_quotes_tour_id ON quotes(tour_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX idx_bookings_supplier_id ON bookings(supplier_id);
CREATE INDEX idx_invoices_tour_id ON invoices(tour_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_overnight_lists_tour_id ON overnight_lists(tour_id);
CREATE INDEX idx_booking_checklists_tour_id ON booking_checklists(tour_id);
