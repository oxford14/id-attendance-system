# Database Setup Guide

This guide will help you set up the Supabase database for the ID Attendance System.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Access to your Supabase project dashboard

## Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `ID Attendance System` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your location
5. Click "Create new project"
6. Wait for the project to be created (usually takes 1-2 minutes)

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public key** (long string starting with `eyJ`)
3. Keep these values safe - you'll need them for the application configuration

### 3. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire contents of `database/schema.sql` from this project
4. Paste it into the SQL editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. You should see success messages indicating tables were created

### 4. Verify the Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see three tables:
   - `students` - Student profiles and RF IDs
   - `parents` - Parent contact information (for future use)
   - `attendance` - Attendance records
3. Check that sample data was inserted:
   - Click on the `students` table
   - You should see 3 sample students (John Doe, Alice Smith, Mike Johnson)

### 5. Configure Authentication

1. Go to **Authentication** > **Settings**
2. Under **Site URL**, add your application URL:
   - For development: `http://localhost:3000`
   - For production: Your deployed app URL
3. Under **Auth Providers**, ensure **Email** is enabled
4. Optionally configure email templates under **Email Templates**

### 6. Set Up Row Level Security (RLS)

The schema automatically enables RLS, but you can verify:

1. Go to **Authentication** > **Policies**
2. You should see policies for each table:
   - Students: View, Insert, Update, Delete policies
   - Parents: View, Insert, Update policies
   - Attendance: View, Insert, Update policies

## Database Schema Overview

### Students Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| first_name | VARCHAR(100) | Student's first name |
| last_name | VARCHAR(100) | Student's last name |
| grade | VARCHAR(20) | Student's grade/class |
| rf_id | VARCHAR(50) | Unique RF ID card number |
| parent_name | VARCHAR(200) | Parent/guardian name |
| parent_email | VARCHAR(255) | Parent email for notifications |
| parent_phone | VARCHAR(20) | Parent phone (optional) |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

### Attendance Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| student_id | UUID | Reference to students table |
| status | VARCHAR(20) | Attendance status (default: 'present') |
| scanned_at | TIMESTAMP | When RF ID was scanned |
| created_at | TIMESTAMP | Record creation time |

### Parents Table (Future Use)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(200) | Parent name |
| email | VARCHAR(255) | Parent email |
| phone | VARCHAR(20) | Parent phone |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

## Security Features

### Row Level Security (RLS)

- **Enabled on all tables** to ensure data security
- **Authenticated users only** can access data
- **Policies prevent unauthorized access** to sensitive information

### Authentication

- **Email/password authentication** for teachers and administrators
- **Secure session management** with automatic token refresh
- **Role-based access** (can be extended for different user types)

## Sample Data

The schema includes sample data for testing:

- **3 sample students** with different grades
- **Unique RF IDs** for each student
- **Parent contact information** for notification testing

### Sample RF IDs for Testing

- John Doe: `1234567890`
- Alice Smith: `2345678901`
- Mike Johnson: `3456789012`

You can use these RF IDs to test the attendance scanner functionality.

## Troubleshooting

### Common Issues

1. **"relation does not exist" error**
   - Make sure you ran the complete schema.sql file
   - Check that all tables were created in the Table Editor

2. **"permission denied" error**
   - Verify that Row Level Security policies are properly set
   - Ensure you're authenticated when testing

3. **"duplicate key value" error**
   - This happens if you run the schema multiple times
   - The sample data insert uses `ON CONFLICT DO NOTHING` to prevent this

4. **Connection issues**
   - Verify your Supabase URL and anon key are correct
   - Check that your project is active and not paused

### Resetting the Database

If you need to start over:

1. Go to **SQL Editor**
2. Run this command to drop all tables:
   ```sql
   DROP TABLE IF EXISTS attendance CASCADE;
   DROP TABLE IF EXISTS students CASCADE;
   DROP TABLE IF EXISTS parents CASCADE;
   ```
3. Re-run the schema.sql file

## Next Steps

After setting up the database:

1. **Configure the application** with your Supabase credentials
2. **Create your first user account** through the registration page
3. **Add real student data** through the Student Management interface
4. **Test the RF ID scanner** with sample or real RF IDs
5. **Set up parent notifications** (optional)

## Support

If you encounter issues:

1. Check the Supabase dashboard for error logs
2. Verify your database schema matches the expected structure
3. Test your connection using the Supabase JavaScript client
4. Review the application console for detailed error messages