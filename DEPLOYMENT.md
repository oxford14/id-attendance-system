# ID Attendance System - Deployment Guide

## Production Deployment Options

### 1. Vercel (Recommended)

#### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Supabase project configured

#### Steps
1. Push your code to GitHub repository
2. Connect Vercel to your GitHub account
3. Import your repository in Vercel
4. Configure environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy automatically

#### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

### 2. Netlify

#### Steps
1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard
4. Set up continuous deployment from GitHub

### 3. Traditional Web Hosting

#### Steps
1. Run `npm run build` to create production build
2. Upload contents of `dist` folder to your web server
3. Configure web server to serve `index.html` for all routes (SPA routing)

#### Apache Configuration (.htaccess)
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### Nginx Configuration
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Environment Variables for Production

### Required Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Optional Variables (for notifications)
```env
VITE_EMAIL_SERVICE_API_KEY=your-email-api-key
VITE_SMS_SERVICE_API_KEY=your-sms-api-key
```

## Supabase Production Setup

### 1. Database Configuration
- Execute `database/schema.sql` in Supabase SQL editor
- Verify Row Level Security (RLS) policies are active
- Test database connections

### 2. Authentication Settings
- Configure allowed redirect URLs in Supabase dashboard
- Set up email templates for user verification
- Configure password requirements

### 3. API Settings
- Verify API keys are correctly configured
- Test database operations from production environment

## Security Checklist

- [ ] Environment variables properly configured
- [ ] Supabase RLS policies active and tested
- [ ] HTTPS enabled on production domain
- [ ] API keys not exposed in client-side code
- [ ] Input validation implemented
- [ ] Error messages don't expose sensitive information

## Performance Optimization

### Build Optimization
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Supabase Optimization
- Enable database indexes (included in schema)
- Use connection pooling for high traffic
- Monitor query performance

## Monitoring and Maintenance

### Application Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor application performance
- Track user engagement metrics

### Database Monitoring
- Monitor Supabase dashboard for:
  - Database usage
  - API requests
  - Authentication events
  - Error rates

### Regular Maintenance
- Update dependencies regularly
- Monitor security advisories
- Backup database regularly
- Test critical functionality

## Troubleshooting Common Issues

### Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run build -- --force
```

### Environment Variable Issues
- Ensure variables start with `VITE_` prefix
- Restart development server after changes
- Verify variables are set in production environment

### Supabase Connection Issues
- Check API keys are correct
- Verify project URL format
- Test connection in Supabase dashboard

### Routing Issues (404 errors)
- Configure server to serve `index.html` for all routes
- Check base URL configuration in `vite.config.js`

## Support and Updates

### Getting Help
- Check application logs for errors
- Review Supabase dashboard for API issues
- Consult documentation files in project

### Updating the Application
1. Test updates in development environment
2. Update dependencies: `npm update`
3. Run tests: `npm run lint`
4. Build and deploy: `npm run build`

## Backup Strategy

### Database Backup
- Use Supabase automatic backups (Pro plan)
- Export data regularly via Supabase dashboard
- Store backups in secure location

### Code Backup
- Use version control (Git)
- Regular commits to remote repository
- Tag releases for easy rollback

---

**Note**: This deployment guide assumes you have completed the setup process outlined in `SETUP.md` and have a working development environment.