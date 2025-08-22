-- ID Attendance System Database Schema
-- Run this script in your Supabase SQL Editor

-- Note: auth.users table already has RLS enabled by default in Supabase

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  grade VARCHAR(20) NOT NULL,
  rf_id VARCHAR(50) UNIQUE NOT NULL,
  parent_name VARCHAR(200) NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parents table (for future expansion)
CREATE TABLE IF NOT EXISTS parents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'present',
  scanned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_rf_id ON students(rf_id);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
CREATE INDEX IF NOT EXISTS idx_students_parent_email ON students(parent_email);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON attendance(created_at);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_parents_email ON parents(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_parents_updated_at ON parents;
CREATE TRIGGER update_parents_updated_at
  BEFORE UPDATE ON parents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Students table policies
DROP POLICY IF EXISTS "Users can view all students" ON students;
CREATE POLICY "Users can view all students" ON students
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert students" ON students;
CREATE POLICY "Users can insert students" ON students
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update students" ON students;
CREATE POLICY "Users can update students" ON students
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete students" ON students;
CREATE POLICY "Users can delete students" ON students
  FOR DELETE USING (auth.role() = 'authenticated');

-- Parents table policies
DROP POLICY IF EXISTS "Users can view all parents" ON parents;
CREATE POLICY "Users can view all parents" ON parents
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert parents" ON parents;
CREATE POLICY "Users can insert parents" ON parents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update parents" ON parents;
CREATE POLICY "Users can update parents" ON parents
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Attendance table policies
DROP POLICY IF EXISTS "Users can view all attendance" ON attendance;
CREATE POLICY "Users can view all attendance" ON attendance
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert attendance" ON attendance;
CREATE POLICY "Users can insert attendance" ON attendance
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update attendance" ON attendance;
CREATE POLICY "Users can update attendance" ON attendance
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Insert sample data (optional - remove if not needed)
INSERT INTO students (first_name, last_name, grade, rf_id, parent_name, parent_email, parent_phone) VALUES
('John', 'Doe', '5A', '1234567890', 'Jane Doe', 'jane.doe@email.com', '+1234567890'),
('Alice', 'Smith', '6B', '2345678901', 'Bob Smith', 'bob.smith@email.com', '+1234567891'),
('Mike', 'Johnson', '7C', '3456789012', 'Sarah Johnson', 'sarah.johnson@email.com', '+1234567892')
ON CONFLICT (rf_id) DO NOTHING;

-- Create a view for attendance with student details (optional)
CREATE OR REPLACE VIEW attendance_with_students AS
SELECT 
  a.id,
  a.student_id,
  a.status,
  a.scanned_at,
  a.created_at,
  s.first_name,
  s.last_name,
  s.grade,
  s.rf_id,
  s.parent_name,
  s.parent_email,
  s.parent_phone
FROM attendance a
JOIN students s ON a.student_id = s.id
ORDER BY a.created_at DESC;

-- Grant access to the view
GRANT SELECT ON attendance_with_students TO authenticated;

-- Create function to get today's attendance count
CREATE OR REPLACE FUNCTION get_today_attendance_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM attendance
    WHERE DATE(created_at) = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get student attendance history
CREATE OR REPLACE FUNCTION get_student_attendance_history(student_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  attendance_date DATE,
  status VARCHAR,
  scan_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(a.created_at) as attendance_date,
    a.status,
    a.created_at as scan_time
  FROM attendance a
  WHERE a.student_id = student_uuid
    AND a.created_at >= (CURRENT_DATE - INTERVAL '1 day' * days_back)
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_today_attendance_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_student_attendance_history(UUID, INTEGER) TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Tables created: students, parents, attendance';
  RAISE NOTICE 'Sample data inserted (3 students)';
  RAISE NOTICE 'Views and functions created';
  RAISE NOTICE 'Row Level Security enabled';
END $$;