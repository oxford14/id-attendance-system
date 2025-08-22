# 🎓 ID Attendance System

A comprehensive, modern web application for tracking student attendance using RFID technology. Built with React and Supabase for real-time data management and seamless user experience.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.0-blue.svg)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🎯 Core Functionality
- **📚 Student Management**: Complete CRUD operations for student records
- **🏷️ RFID Attendance Tracking**: Real-time attendance logging via RFID scanning
- **📊 Interactive Dashboard**: Comprehensive analytics with statistics and trends
- **📧 Parent Notifications**: Automated email/SMS alerts when students check in/out
- **📋 Attendance Records**: Advanced filtering, search, and CSV export capabilities
- **🔐 Secure Authentication**: Robust user registration and login system
- **⚙️ Notification Settings**: Admin interface for configuring notification services

### 🎨 User Experience
- **📱 Fully Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🎯 Intuitive Interface**: Clean, modern UI with smooth animations
- **⚡ Real-time Updates**: Live data synchronization across all components
- **🔍 Advanced Search**: Quick student lookup by name or RFID
- **📈 Visual Analytics**: Interactive charts and statistics
- **♿ Accessibility**: WCAG compliant with keyboard navigation support

### 🛠️ Technical Features
- **🚀 Performance Optimized**: Fast loading with efficient data handling
- **🔄 Offline Support**: Basic functionality available without internet
- **📱 PWA Ready**: Progressive Web App capabilities
- **🖨️ Print Friendly**: Optimized print styles for reports
- **🌙 Dark Mode Ready**: Prepared for dark theme implementation

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **React Router v6** - Client-side routing and navigation
- **Lucide React** - Beautiful, customizable icons
- **Custom CSS** - Responsive design with modern styling

### Backend & Services
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - User authentication and authorization
- **Real-time Subscriptions** - Live data updates
- **Row Level Security** - Database-level security policies

### Development Tools
- **Vite** - Fast build tool and development server
- **ESLint** - Code linting and quality assurance
- **Modern JavaScript** - ES6+ features and best practices

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Supabase account
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd id-attendance-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   Configure your Supabase credentials in the `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database setup**
   - Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
   - Configure Row Level Security policies

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 Documentation

- **[Setup Guide](SETUP.md)** - Detailed setup instructions
- **[Testing Guide](TESTING_CHECKLIST.md)** - Comprehensive testing procedures
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment guidelines

## 🏛️ Project Structure

```
src/
├── components/          # React components
│   ├── AttendanceRecords.jsx
│   ├── AttendanceScanner.jsx
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Navbar.jsx
│   ├── NotificationSettings.jsx
│   ├── Register.jsx
│   └── StudentManagement.jsx
├── contexts/           # React contexts
│   └── AuthContext.jsx
├── lib/               # Utilities and services
│   ├── database.js
│   ├── notificationService.js
│   └── supabase.js
├── App.jsx            # Main application component
├── index.css          # Global styles
└── main.jsx          # Application entry point
```

## 🔧 Configuration

### Environment Variables
```env
# Required - Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - Notification Services
VITE_EMAIL_SERVICE_API_KEY=your_email_service_key
VITE_SMS_SERVICE_API_KEY=your_sms_service_key
```

### Database Schema
The application uses the following main tables:
- `students` - Student information and RFID data
- `parents` - Parent contact information
- `attendance` - Attendance records with timestamps
- `users` - Application user accounts

## 🎯 Usage

### For Administrators
1. **Student Management**: Add new students with RFID assignments
2. **Monitor Dashboard**: View real-time attendance statistics
3. **Configure Notifications**: Set up email/SMS services
4. **Export Reports**: Generate attendance reports in CSV format

### For Teachers/Staff
1. **RFID Scanning**: Use the scanner interface for attendance
2. **View Records**: Check attendance history with filters
3. **Real-time Updates**: Monitor live attendance data

### For Parents
- Receive automatic notifications when children arrive/leave
- Access provided through notification system integration

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive data validation
- **HTTPS Enforcement**: Secure data transmission
- **Environment Variables**: Secure credential management

## 📱 Mobile Optimization

- **Responsive Grid System**: Adapts to all screen sizes
- **Touch-Friendly Interface**: Optimized for mobile interaction
- **Progressive Enhancement**: Works on all devices
- **Offline Capabilities**: Basic functionality without internet

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the documentation files
- Review the testing checklist
- Open an issue on GitHub

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)
- Inspired by modern educational technology needs

---

**Made with ❤️ for educational institutions worldwide**

## Detailed Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your Project URL and anon public key
4. Update `src/lib/supabase.js` with your credentials:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
```

### 3. Database Schema

Run the following SQL commands in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create students table
CREATE TABLE students (
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
CREATE TABLE parents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'present',
  scanned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_students_rf_id ON students(rf_id);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_created_at ON attendance(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parents_updated_at
  BEFORE UPDATE ON parents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Students table policies
CREATE POLICY "Users can view all students" ON students
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert students" ON students
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update students" ON students
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete students" ON students
  FOR DELETE USING (auth.role() = 'authenticated');

-- Parents table policies
CREATE POLICY "Users can view all parents" ON parents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert parents" ON parents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update parents" ON parents
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Attendance table policies
CREATE POLICY "Users can view all attendance" ON attendance
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert attendance" ON attendance
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update attendance" ON attendance
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

### First Time Setup

1. **Register an Account**: Create a teacher or administrator account
2. **Add Students**: Go to Student Management and add student profiles with RF IDs
3. **Start Scanning**: Use the Scanner page to mark attendance by entering RF IDs
4. **View Records**: Check the Dashboard and Attendance Records for insights

### Daily Operations

1. **Morning Setup**: Open the Scanner page
2. **Student Arrival**: Students tap their RF ID cards, or manually enter RF IDs
3. **Automatic Logging**: System automatically records attendance and timestamps
4. **Parent Notifications**: Parents receive notifications (when integrated)
5. **Reports**: View daily, weekly, or custom date range reports

## RF ID Integration

The system is designed to work with RF ID readers. To integrate with hardware:

1. **USB RF ID Reader**: Most USB readers act as keyboard input devices
2. **Serial RF ID Reader**: Can be integrated using Web Serial API
3. **Network RF ID Reader**: Can send HTTP requests to your application

The scanner interface accepts manual input and can be easily extended for hardware integration.

## Parent Notification Integration

The system includes placeholder functions for parent notifications. You can integrate with:

- **Email Services**: SendGrid, Mailgun, or SMTP
- **SMS Services**: Twilio, AWS SNS
- **Push Notifications**: Firebase Cloud Messaging
- **WhatsApp**: WhatsApp Business API

## Customization

### Adding New Fields

To add new student fields:

1. Update the database schema in Supabase
2. Modify the student form in `StudentManagement.jsx`
3. Update the database helper functions in `supabase.js`

### Styling

The application uses custom CSS in `src/index.css`. You can:

- Modify colors and themes
- Add your school's branding
- Customize component styles

## Security Features

- **Row Level Security**: Database-level access control
- **Authentication**: Secure user registration and login
- **Input Validation**: Client and server-side validation
- **HTTPS**: Secure data transmission (in production)

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy Options

- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Drag and drop the `dist` folder
- **AWS S3**: Upload static files to S3 bucket
- **Traditional Hosting**: Upload `dist` folder contents

## Support

For issues and questions:

1. Check the browser console for error messages
2. Verify Supabase configuration and database schema
3. Ensure all dependencies are installed correctly
4. Check network connectivity to Supabase

## License

This project is open source and available under the MIT License.