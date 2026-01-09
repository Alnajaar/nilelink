# NileLink Super Admin Dashboard

## Overview

The Super Admin Dashboard provides complete ecosystem control and management capabilities for the NileLink platform. This is a restricted access system that can only be accessed with specific credentials.

## Access Credentials

**Email:** admin@nilelink.app
**Password:** Dggashdggash100%

> **⚠️ SECURITY NOTICE:** These credentials can only be changed by editing the source code files directly. There is no password reset functionality for security reasons.

## Features

### 🔐 Authentication
- Secure login with hardcoded credentials
- Session-based authentication with localStorage
- Automatic logout on session expiry
- Restricted access controls

### 👥 User Management
- Review pending user registrations
- Approve or reject user applications
- View user verification status
- Track approval history

### 📊 Dashboard Analytics
- Real-time user statistics
- System health monitoring
- Application status overview
- Recent activity feed

### 🛡️ Admin Controls
- User approval workflow
- Ecosystem monitoring
- System configuration access
- Audit trail management

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the admin directory:
```bash
cd web/admin
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:3002`

### Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The admin dashboard should be deployed to `admin.nilelink.app` (port 3002)

## Architecture

### Tech Stack
- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React hooks + localStorage
- **Authentication:** Session-based with localStorage

### File Structure
```
web/admin/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Main dashboard
│   │   ├── login/             # Admin login
│   │   ├── user-approvals/    # User approval interface
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page (redirects)
├── tailwind.config.js         # Tailwind configuration
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## Security Features

### Access Control
- Hardcoded credentials (file-based only)
- Session validation on every route
- Automatic redirects for unauthorized access
- No password reset functionality

### Data Protection
- Client-side session management
- Local storage for session data
- No sensitive data exposure
- Secure communication channels

### Audit Trail
- Login/logout tracking
- User approval/rejection logging
- System access monitoring
- Activity timestamp recording

## API Integration

The admin dashboard integrates with:
- **Local Storage:** For user data and sessions
- **Backend APIs:** For real-time data (when implemented)
- **Shared Services:** OTP service, user management

## Usage

### Login Process
1. Navigate to `/login`
2. Enter credentials: `admin@nilelink.app` / `Dggashdggash100%`
3. Access granted to dashboard

### User Approval Workflow
1. Navigate to `/user-approvals`
2. Review pending users
3. Click "Review" for detailed information
4. Approve or reject with optional reasoning
5. Changes reflected immediately

### Dashboard Monitoring
1. View real-time statistics
2. Monitor system health
3. Track user activities
4. Access quick actions

## Development Notes

### Adding New Features
- All new routes require authentication checks
- Use the established UI patterns (Tailwind classes)
- Maintain security-first approach
- Update this README for new features

### Styling Guidelines
- Use Tailwind CSS utilities
- Follow the established color scheme (red primary)
- Maintain consistent spacing and typography
- Use Lucide icons for consistency

### Security Best Practices
- Never expose credentials in client-side code
- Validate all user inputs
- Implement proper error handling
- Log security events

## Troubleshooting

### Common Issues

**Login not working:**
- Verify credentials are entered correctly
- Check browser localStorage for session data
- Clear browser cache if issues persist

**Dashboard not loading:**
- Ensure the development server is running on port 3002
- Check for TypeScript compilation errors
- Verify all dependencies are installed

**User data not updating:**
- Check localStorage for user data
- Verify admin actions are completing successfully
- Refresh the page to reload data

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('admin_debug', 'true')
```

## Future Enhancements

- Real-time WebSocket connections
- Advanced analytics and reporting
- Bulk user operations
- Audit log export functionality
- Multi-admin support
- Role-based permissions

## Support

For technical issues or feature requests, contact the development team. Remember: this is a restricted access system with elevated permissions over the entire ecosystem.