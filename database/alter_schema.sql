-- Alter statements for student_profile table

-- Add missing place of birth columns
ALTER TABLE student_profile ADD COLUMN place_of_birth_province character varying(100) null;
ALTER TABLE student_profile ADD COLUMN place_of_birth_country character varying(100) null;

-- Add nationality column
ALTER TABLE student_profile ADD COLUMN nationality character varying(100) null;

-- Add student_status column with an ENUM type for data consistency
CREATE TYPE student_status_enum AS ENUM ('enrolled', 'dropped', 'transferred', 'graduated');
ALTER TABLE student_profile ADD COLUMN student_status student_status_enum;

-- Alter sex column to use an ENUM type for data consistency
-- First, create the ENUM type
CREATE TYPE sex_enum AS ENUM ('Male', 'Female');
-- Then, alter the column to use the new type. 
-- This will require casting the existing data. Since the form uses 'Male' and 'Female', this should work.
ALTER TABLE student_profile ALTER COLUMN sex TYPE sex_enum USING sex::sex_enum;