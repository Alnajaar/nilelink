/**
 * POS Role-Based Access Control (RBAC)
 * Defines all roles and their permissions across the POS system
 */

export enum POS_ROLE {
    SUPER_ADMIN = 'SUPER_ADMIN',
    RESTAURANT_OWNER = 'RESTAURANT_OWNER',
    MANAGER = 'MANAGER',
    ACCOUNTANT = 'ACCOUNTANT',
    CASHIER = 'CASHIER',
    KITCHEN_STAFF = 'KITCHEN_STAFF',
    SERVER = 'SERVER',
    STAFF = 'STAFF'
}

export enum PERMISSION {
    // Sales & Transactions
    SALES_CREATE = 'SALES_CREATE',
    SALES_VIEW = 'SALES_VIEW',
    SALES_REFUND = 'SALES_REFUND',

    // Cash Management
    CASH_OPEN_DRAWER = 'CASH_OPEN_DRAWER',
    CASH_VIEW_BALANCE = 'CASH_VIEW_BALANCE',
    CASH_DEPOSIT = 'CASH_DEPOSIT',
    CASH_WITHDRAW = 'CASH_WITHDRAW',
    CASH_RECONCILE = 'CASH_RECONCILE',

    // Inventory
    INVENTORY_VIEW = 'INVENTORY_VIEW',
    INVENTORY_EDIT = 'INVENTORY_EDIT',
    INVENTORY_MANAGE = 'INVENTORY_MANAGE',

    // Kitchen
    KITCHEN_VIEW_ORDERS = 'KITCHEN_VIEW_ORDERS',
    KITCHEN_UPDATE_STATUS = 'KITCHEN_UPDATE_STATUS',
    KITCHEN_VIEW_RECIPES = 'KITCHEN_VIEW_RECIPES',
    KITCHEN_EDIT_RECIPES = 'KITCHEN_EDIT_RECIPES',

    // Reports & Analytics
    REPORTS_VIEW_BASIC = 'REPORTS_VIEW_BASIC',
    REPORTS_VIEW_FINANCIAL = 'REPORTS_VIEW_FINANCIAL',
    REPORTS_EXPORT = 'REPORTS_EXPORT',
    ANALYTICS_VIEW = 'ANALYTICS_VIEW',

    // Staff Management
    STAFF_VIEW = 'STAFF_VIEW',
    STAFF_MANAGE = 'STAFF_MANAGE',
    STAFF_SCHEDULE = 'STAFF_SCHEDULE',

    // Settings & Configuration
    SETTINGS_VIEW = 'SETTINGS_VIEW',
    SETTINGS_EDIT = 'SETTINGS_EDIT',
    PRODUCTS_MANAGE = 'PRODUCTS_MANAGE',

    // Ledger & Accounting
    LEDGER_VIEW = 'LEDGER_VIEW',
    LEDGER_EDIT = 'LEDGER_EDIT',
    ACCOUNTING_FULL_ACCESS = 'ACCOUNTING_FULL_ACCESS',

    // Tables (for dine-in)
    TABLES_VIEW = 'TABLES_VIEW',
    TABLES_MANAGE = 'TABLES_MANAGE'
}

// Role to Permissions mapping
export const ROLE_PERMISSIONS: Record<POS_ROLE, PERMISSION[]> = {
    [POS_ROLE.SUPER_ADMIN]: Object.values(PERMISSION), // All permissions

    [POS_ROLE.RESTAURANT_OWNER]: Object.values(PERMISSION), // All permissions

    [POS_ROLE.MANAGER]: [
        PERMISSION.SALES_CREATE,
        PERMISSION.SALES_VIEW,
        PERMISSION.SALES_REFUND,
        PERMISSION.CASH_VIEW_BALANCE,
        PERMISSION.CASH_RECONCILE,
        PERMISSION.INVENTORY_VIEW,
        PERMISSION.INVENTORY_EDIT,
        PERMISSION.KITCHEN_VIEW_ORDERS,
        PERMISSION.KITCHEN_VIEW_RECIPES,
        PERMISSION.REPORTS_VIEW_BASIC,
        PERMISSION.REPORTS_VIEW_FINANCIAL,
        PERMISSION.REPORTS_EXPORT,
        PERMISSION.ANALYTICS_VIEW,
        PERMISSION.STAFF_VIEW,
        PERMISSION.STAFF_SCHEDULE,
        PERMISSION.LEDGER_VIEW,
        PERMISSION.TABLES_VIEW,
        PERMISSION.TABLES_MANAGE
    ],

    [POS_ROLE.ACCOUNTANT]: [
        PERMISSION.SALES_VIEW,
        PERMISSION.CASH_VIEW_BALANCE,
        PERMISSION.CASH_RECONCILE,
        PERMISSION.REPORTS_VIEW_FINANCIAL,
        PERMISSION.REPORTS_EXPORT,
        PERMISSION.LEDGER_VIEW,
        PERMISSION.LEDGER_EDIT,
        PERMISSION.ACCOUNTING_FULL_ACCESS,
        PERMISSION.ANALYTICS_VIEW
    ],

    [POS_ROLE.CASHIER]: [
        PERMISSION.SALES_CREATE,
        PERMISSION.SALES_VIEW,
        PERMISSION.SALES_REFUND,
        PERMISSION.CASH_OPEN_DRAWER,
        PERMISSION.CASH_VIEW_BALANCE,
        PERMISSION.CASH_DEPOSIT,
        PERMISSION.INVENTORY_VIEW,
        PERMISSION.REPORTS_VIEW_BASIC,
        PERMISSION.TABLES_VIEW
    ],

    [POS_ROLE.KITCHEN_STAFF]: [
        PERMISSION.KITCHEN_VIEW_ORDERS,
        PERMISSION.KITCHEN_UPDATE_STATUS,
        PERMISSION.KITCHEN_VIEW_RECIPES,
        PERMISSION.INVENTORY_VIEW
    ],

    [POS_ROLE.SERVER]: [
        PERMISSION.SALES_CREATE,
        PERMISSION.SALES_VIEW,
        PERMISSION.INVENTORY_VIEW,
        PERMISSION.TABLES_VIEW,
        PERMISSION.TABLES_MANAGE
    ],

    [POS_ROLE.STAFF]: [
        PERMISSION.SALES_VIEW,
        PERMISSION.INVENTORY_VIEW
    ]
};

// Helper functions
export function hasPermission(role: POS_ROLE, permission: PERMISSION): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: POS_ROLE, permissions: PERMISSION[]): boolean {
    return permissions.some(p => hasPermission(role, p));
}

export function hasAllPermissions(role: POS_ROLE, permissions: PERMISSION[]): boolean {
    return permissions.every(p => hasPermission(role, p));
}

export function getRoleLabel(role: POS_ROLE): string {
    const labels: Record<POS_ROLE, string> = {
        [POS_ROLE.SUPER_ADMIN]: 'Super Admin',
        [POS_ROLE.RESTAURANT_OWNER]: 'Restaurant Owner',
        [POS_ROLE.MANAGER]: 'Manager',
        [POS_ROLE.ACCOUNTANT]: 'Accountant',
        [POS_ROLE.CASHIER]: 'Cashier',
        [POS_ROLE.KITCHEN_STAFF]: 'Kitchen Staff',
        [POS_ROLE.SERVER]: 'Server',
        [POS_ROLE.STAFF]: 'Staff'
    };
    return labels[role] || role;
}

export function getRoleColor(role: POS_ROLE): string {
    const colors: Record<POS_ROLE, string> = {
        [POS_ROLE.SUPER_ADMIN]: 'bg-primary text-background',
        [POS_ROLE.RESTAURANT_OWNER]: 'bg-primary text-background',
        [POS_ROLE.MANAGER]: 'bg-text text-background',
        [POS_ROLE.ACCOUNTANT]: 'bg-surface text-text',
        [POS_ROLE.CASHIER]: 'bg-surface text-text',
        [POS_ROLE.KITCHEN_STAFF]: 'bg-surface text-text',
        [POS_ROLE.SERVER]: 'bg-surface text-text',
        [POS_ROLE.STAFF]: 'bg-surface text-text'
    };
    return colors[role] || 'bg-surface text-text';
}

// Default route by role (after login/PIN)
export function getDefaultRoute(role: POS_ROLE): string {
    const routes: Record<POS_ROLE, string> = {
        [POS_ROLE.SUPER_ADMIN]: '/admin',
        [POS_ROLE.RESTAURANT_OWNER]: '/admin',
        [POS_ROLE.MANAGER]: '/terminal',
        [POS_ROLE.ACCOUNTANT]: '/terminal/ledger',
        [POS_ROLE.CASHIER]: '/terminal',
        [POS_ROLE.KITCHEN_STAFF]: '/terminal/kitchen',
        [POS_ROLE.SERVER]: '/terminal/tables',
        [POS_ROLE.STAFF]: '/terminal'
    };
    return routes[role] || '/terminal';
}
