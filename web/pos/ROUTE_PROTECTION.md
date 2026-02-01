# NileLink POS - Route Protection Summary

## ✅ PUBLIC ROUTES (No Login Required)

- **/** - Landing Page (Elite Digital homepage)
- **/auth/login** - Login page
- **/auth/register** - Registration page
- **/get-started** - Onboarding flow
- **/marketing/** - Marketing pages

## 🔒 PROTECTED ROUTES (Login Required)

### Admin Access Only

- **/admin** - Admin Portal (ADMIN, SUPER_ADMIN, OWNER)
- **/admin/** - All admin sub-routes

### Staff & Management Access

- **/terminal** - POS Terminal (ADMIN, SUPER_ADMIN, OWNER, STAFF, VENDOR)
- **/terminal/** - All terminal sub-routes
- **/orders** - Order Management (ADMIN, SUPER_ADMIN, OWNER, STAFF, RESTAURANT_OWNER)
- **/settings** - System Settings (ADMIN, SUPER_ADMIN, OWNER, RESTAURANT_OWNER)

### Authenticated Users

- **/dashboard** - Mission Control (All authenticated users)
- **/protocol-node** - Ecosystem Bridge (All authenticated users)

## 🛡️ How It Works

All protected routes use the `AuthGuard` component which:

1. Checks if the user is logged in
2. Verifies the user has the required role(s)
3. Redirects to `/auth/login` if not authenticated
4. Shows a permission denied message if wrong role

## 📝 Security Notes

- Session persistence via Firebase Authentication
- Role-based access control (RBAC)
- Automatic redirect to login for unauthorized access
- Protected routes maintain state after login
