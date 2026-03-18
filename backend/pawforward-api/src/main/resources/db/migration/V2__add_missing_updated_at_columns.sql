-- Add missing updated_at columns to tables that extend BaseEntity

ALTER TABLE class_enrollments
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;
