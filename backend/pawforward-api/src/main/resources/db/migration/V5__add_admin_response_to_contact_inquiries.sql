-- Add missing columns for entities added in later phases

-- Contact inquiries: admin response tracking
ALTER TABLE contact_inquiries ADD COLUMN admin_response TEXT;

-- Reviews: updated_at for BaseEntity compatibility
ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
