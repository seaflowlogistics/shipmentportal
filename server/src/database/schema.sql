-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to update updated_at timestamp
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_shipments_updated_at ON shipments;
DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'accounts', 'clearance_manager')),
  full_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  must_change_password BOOLEAN DEFAULT true,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit_logs table
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for password_reset_tokens table
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for refresh_tokens table
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id VARCHAR(50) UNIQUE NOT NULL,
  exporter_name VARCHAR(255) NOT NULL,
  exporter_address TEXT NOT NULL,
  exporter_contact VARCHAR(255),
  exporter_email VARCHAR(255),
  vendor_name VARCHAR(255) NOT NULL,
  vendor_address TEXT NOT NULL,
  vendor_contact VARCHAR(255),
  vendor_email VARCHAR(255),
  receiver_name VARCHAR(255) NOT NULL,
  receiver_address TEXT NOT NULL,
  receiver_contact VARCHAR(255),
  receiver_email VARCHAR(255),
  item_description TEXT NOT NULL,
  weight DECIMAL(12, 2) NOT NULL,
  weight_unit VARCHAR(10) DEFAULT 'kg',
  dimensions_length DECIMAL(10, 2),
  dimensions_width DECIMAL(10, 2),
  dimensions_height DECIMAL(10, 2),
  dimensions_unit VARCHAR(10) DEFAULT 'cm',
  value DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  pickup_date DATE NOT NULL,
  expected_delivery_date DATE NOT NULL,
  mode_of_transport VARCHAR(50) NOT NULL CHECK (mode_of_transport IN ('air', 'sea', 'road')),
  status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'created', 'approved', 'rejected', 'changes_requested', 'in_transit', 'delivered', 'cancelled')),
  rejection_reason TEXT,
  created_by UUID REFERENCES users(id),
  last_updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for shipments table
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_created_by ON shipments(created_by);
CREATE INDEX IF NOT EXISTS idx_shipments_pickup_date ON shipments(pickup_date);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON shipments(created_at);
CREATE INDEX IF NOT EXISTS idx_shipments_mode ON shipments(mode_of_transport);

-- Trigger to automatically update shipments updated_at
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('invoice', 'packing_list', 'bill_of_lading', 'air_waybill', 'other')),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(50),
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for documents table
CREATE INDEX IF NOT EXISTS idx_documents_shipment_id ON documents(shipment_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

-- Insert default admin user (password: Admin@123)
-- Password hash for 'Admin@123' using bcrypt
INSERT INTO users (username, email, password_hash, role, full_name, is_active, must_change_password)
VALUES (
  'admin',
  'admin@shipmentportal.com',
  '$2a$10$rZ5qY8vZ8qY8vZ8qY8vZ8.O5qY8vZ8qY8vZ8qY8vZ8qY8vZ8qY8vZ',
  'admin',
  'System Administrator',
  true,
  true
)
ON CONFLICT (username) DO NOTHING;
