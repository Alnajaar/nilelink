import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed default roles and permissions for new tenants
 * Run this when a new tenant signs up
 */
export async function seedTenantRoles(tenantId: string): Promise<void> {
    console.log(`Seeding roles for tenant: ${tenantId}`);

    // Create all permissions
    const permissions = [
        // Order permissions
        { resource: 'ORDER', action: 'CREATE' },
        { resource: 'ORDER', action: 'READ' },
        { resource: 'ORDER', action: 'UPDATE' },
        { resource: 'ORDER', action: 'DELETE' },
        { resource: 'ORDER', action: 'EXPORT' },

        // Menu permissions
        { resource: 'MENU', action: 'CREATE' },
        { resource: 'MENU', action: 'READ' },
        { resource: 'MENU', action: 'UPDATE' },
        { resource: 'MENU', action: 'DELETE' },

        // Inventory permissions
        { resource: 'INVENTORY', action: 'CREATE' },
        { resource: 'INVENTORY', action: 'READ' },
        { resource: 'INVENTORY', action: 'UPDATE' },
        { resource: 'INVENTORY', action: 'DELETE' },

        // Financial permissions
        { resource: 'FINANCIAL', action: 'READ' },
        { resource: 'FINANCIAL', action: 'EXPORT' },
        { resource: 'FINANCIAL', action: 'APPROVE' },

        // Report permissions
        { resource: 'REPORT', action: 'READ' },
        { resource: 'REPORT', action: 'EXPORT' },

        // Employee permissions
        { resource: 'EMPLOYEE', action: 'CREATE' },
        { resource: 'EMPLOYEE', action: 'READ' },
        { resource: 'EMPLOYEE', action: 'UPDATE' },
        { resource: 'EMPLOYEE', action: 'DELETE' },

        // Shift permissions
        { resource: 'SHIFT', action: 'CREATE' },
        { resource: 'SHIFT', action: 'READ' },
        { resource: 'SHIFT', action: 'UPDATE' },
        { resource: 'SHIFT', action: 'APPROVE' },

        // Settings permissions
        { resource: 'SETTINGS', action: 'READ' },
        { resource: 'SETTINGS', action: 'MANAGE' },
    ];

    // Create or get permissions
    const createdPermissions = await Promise.all(
        permissions.map(p =>
            prisma.permission.upsert({
                where: {
                    resource_action: {
                        resource: p.resource as any,
                        action: p.action as any
                    }
                },
                create: p as any,
                update: {}
            })
        )
    );

    console.log(`Created ${createdPermissions.length} permissions`);

    // Helper to find permissions
    const findPerms = (filters: Array<{ resource: string; action: string }>) =>
        createdPermissions.filter(cp =>
            filters.some(f => cp.resource === f.resource && cp.action === f.action)
        );

    // ==================================================
    // CASHIER ROLE - Can process orders and manage shifts
    // ==================================================
    const cashierPermissions = findPerms([
        { resource: 'ORDER', action: 'CREATE' },
        { resource: 'ORDER', action: 'READ' },
        { resource: 'SHIFT', action: 'CREATE' },
        { resource: 'SHIFT', action: 'UPDATE' },
        { resource: 'MENU', action: 'READ' },
    ]);

    await prisma.role.create({
        data: {
            tenantId,
            name: 'Cashier',
            description: 'Can create orders and manage their own shifts',
            isSystem: true,
            permissions: {
                connect: cashierPermissions.map(p => ({ id: p.id }))
            }
        }
    });

    // ==================================================
    // MANAGER ROLE - Full operational control
    // ==================================================
    const managerPermissions = findPerms([
        { resource: 'ORDER', action: 'CREATE' },
        { resource: 'ORDER', action: 'READ' },
        { resource: 'ORDER', action: 'UPDATE' },
        { resource: 'ORDER', action: 'DELETE' },
        { resource: 'ORDER', action: 'EXPORT' },
        { resource: 'MENU', action: 'CREATE' },
        { resource: 'MENU', action: 'READ' },
        { resource: 'MENU', action: 'UPDATE' },
        { resource: 'MENU', action: 'DELETE' },
        { resource: 'INVENTORY', action: 'READ' },
        { resource: 'INVENTORY', action: 'UPDATE' },
        { resource: 'REPORT', action: 'READ' },
        { resource: 'REPORT', action: 'EXPORT' },
        { resource: 'EMPLOYEE', action: 'READ' },
        { resource: 'SHIFT', action: 'READ' },
        { resource: 'SHIFT', action: 'APPROVE' },
    ]);

    await prisma.role.create({
        data: {
            tenantId,
            name: 'Manager',
            description: 'Full operational control, can manage menu, orders, and approve shifts',
            isSystem: true,
            permissions: {
                connect: managerPermissions.map(p => ({ id: p.id }))
            }
        }
    });

    // ==================================================
    // ACCOUNTANT ROLE - Financial access only
    // ==================================================
    const accountantPermissions = findPerms([
        { resource: 'FINANCIAL', action: 'READ' },
        { resource: 'FINANCIAL', action: 'EXPORT' },
        { resource: 'REPORT', action: 'READ' },
        { resource: 'REPORT', action: 'EXPORT' },
        { resource: 'ORDER', action: 'READ' },
    ]);

    await prisma.role.create({
        data: {
            tenantId,
            name: 'Accountant',
            description: 'View financial reports and export data',
            isSystem: true,
            permissions: {
                connect: accountantPermissions.map(p => ({ id: p.id }))
            }
        }
    });

    // ==================================================
    // OWNER ROLE - Full system access
    // ==================================================
    await prisma.role.create({
        data: {
            tenantId,
            name: 'Owner',
            description: 'Full system access - all permissions',
            isSystem: true,
            permissions: {
                connect: createdPermissions.map(p => ({ id: p.id }))
            }
        }
    });

    console.log(`✅ Seeded 4 default roles for tenant ${tenantId}`);
}
