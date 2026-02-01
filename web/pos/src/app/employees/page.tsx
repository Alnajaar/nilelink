/**
 * Employee Management Page
 * Manage business employees and their access
 * 
 * FEATURES:
 * - View all employees
 * - Add new employees
 * - Assign roles (CASHIER, MANAGER)
 * - Set permissions
 * - Track work hours
 * - Performance metrics
 * - Activate/deactivate employees
 * - Salary management
 * - Compliance with labor laws
 */

'use client';

import { useState, useEffect } from 'react';
import { graphService } from '@shared/services/GraphService';
import { complianceEngine } from '@shared/services/ComplianceEngine';
import { useGuard } from '@shared/hooks/useGuard';
import { UserRole } from '@shared/types/database';

// ============================================
// TYPES
// ============================================

interface Employee {
    id: string;
    walletAddress: string;
    name: string;
    nameAr?: string;
    role: UserRole;
    email?: string;
    phone?: string;
    salary: number;
    isActive: boolean;
    hiredAt: number;
    country: string;
}

interface EmployeeForm {
    name: string;
    nameAr?: string;
    walletAddress: string;
    role: UserRole;
    email?: string;
    phone?: string;
    salary: number;
}

const EMPTY_FORM: EmployeeForm = {
    name: '',
    nameAr: '',
    walletAddress: '',
    role: 'CASHIER',
    email: '',
    phone: '',
    salary: 0,
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function EmployeesPage() {
    const { can } = useGuard();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [country, setCountry] = useState('SA'); // From business settings

    // Filters
    const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState<EmployeeForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            setLoading(true);

            // TODO: Get business ID from auth context
            const businessId = 'current-business-id';
            const employeeList = await graphService.getEmployeesByBusiness(businessId);

            setEmployees(employeeList as Employee[]);
            setError(null);
        } catch (err: any) {
            console.error('[Employees] Failed to load:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmployee = async () => {
        const canCreate = await can('CREATE_EMPLOYEE');
        if (!canCreate) {
            alert('You do not have permission to add employees');
            return;
        }

        setEditingEmployee(null);
        setFormData(EMPTY_FORM);
        setShowModal(true);
    };

    const handleEditEmployee = async (employee: Employee) => {
        const canUpdate = await can('UPDATE_EMPLOYEE');
        if (!canUpdate) {
            alert('You do not have permission to edit employees');
            return;
        }

        setEditingEmployee(employee);
        setFormData({
            name: employee.name,
            nameAr: employee.nameAr,
            walletAddress: employee.walletAddress,
            role: employee.role,
            email: employee.email,
            phone: employee.phone,
            salary: employee.salary,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        // Validation
        if (!formData.name.trim()) {
            alert('Employee name is required');
            return;
        }
        if (!formData.walletAddress.trim()) {
            alert('Wallet address is required');
            return;
        }
        if (formData.salary <= 0) {
            alert('Salary must be greater than 0');
            return;
        }

        // Check labor law compliance
        const rules = complianceEngine.getRules(country);
        if (rules && rules.minimumWage && formData.salary < rules.minimumWage) {
            if (!confirm(`Warning: Salary (${formData.salary} ${rules.currency}) is below minimum wage (${rules.minimumWage} ${rules.currency}). Continue anyway?`)) {
                return;
            }
        }

        try {
            setSaving(true);

            // TODO: Write to blockchain
            if (editingEmployee) {
                console.log('[Employees] Updating employee:', editingEmployee.id, formData);
            } else {
                console.log('[Employees] Creating employee:', formData);
            }

            // Simulate blockchain write
            await new Promise(resolve => setTimeout(resolve, 2000));

            alert(`Employee ${editingEmployee ? 'updated' : 'added'} successfully!`);
            setShowModal(false);
            await loadEmployees();
        } catch (err: any) {
            alert(`Failed to save employee: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (employeeId: string, currentStatus: boolean) => {
        if (!confirm(`${currentStatus ? 'Deactivate' : 'Activate'} this employee?`)) return;

        try {
            // TODO: Write to blockchain
            console.log('[Employees] Toggling status:', employeeId);

            alert('Employee status updated');
            await loadEmployees();
        } catch (err: any) {
            alert(`Failed to update status: ${err.message}`);
        }
    };

    const handleDeleteEmployee = async (employeeId: string) => {
        const canDelete = await can('DELETE_EMPLOYEE');
        if (!canDelete) {
            alert('You do not have permission to delete employees');
            return;
        }

        if (!confirm('Remove this employee? This action cannot be undone.')) return;

        try {
            // TODO: Write to blockchain
            console.log('[Employees] Deleting:', employeeId);

            alert('Employee removed');
            await loadEmployees();
        } catch (err: any) {
            alert(`Failed to remove employee: ${err.message}`);
        }
    };

    // Filter employees
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'ALL' || emp.role === filterRole;
        const matchesStatus = filterStatus === 'ALL' ||
            (filterStatus === 'ACTIVE' && emp.isActive) ||
            (filterStatus === 'INACTIVE' && !emp.isActive);

        return matchesSearch && matchesRole && matchesStatus;
    });

    const activeCount = employees.filter(e => e.isActive).length;
    const totalPayroll = employees.filter(e => e.isActive).reduce((sum, e) => sum + e.salary, 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2">
                        Employee Management
                    </h1>
                    <p className="text-gray-400 text-sm uppercase tracking-wider">
                        Manage Staff • Roles • Permissions • Payroll
                    </p>
                </div>

                <button
                    onClick={handleAddEmployee}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold"
                >
                    + Add Employee
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Employees" value={employees.length.toLocaleString()} icon="👥" />
                <StatCard label="Active" value={activeCount.toLocaleString()} icon="✅" color="green" />
                <StatCard label="Inactive" value={(employees.length - activeCount).toLocaleString()} icon="🚫" color="red" />
                <StatCard label="Monthly Payroll" value={`$${totalPayroll.toFixed(2)}`} icon="💰" color="purple" />
            </div>

            {/* Filters */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value as any)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="CASHIER">Cashiers</option>
                        <option value="MANAGER">Managers</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                    <button
                        onClick={loadEmployees}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Labor Law Compliance Info */}
            {country && complianceEngine.getRules(country) && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                    <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                        <span>⚖️</span>
                        Labor Law Compliance - {complianceEngine.getRules(country)?.countryName}
                    </h3>
                    <div className="text-blue-200 text-sm space-y-1">
                        {complianceEngine.getRules(country)?.minimumWage && (
                            <p>• Minimum Wage: {complianceEngine.getRules(country)?.minimumWage} {complianceEngine.getRules(country)?.currency}/month</p>
                        )}
                        <p>• Max Hours/Week: {complianceEngine.getRules(country)?.maxHoursPerWeek}h</p>
                        <p>• Overtime Rate: {((complianceEngine.getRules(country)?.overtimeRate || 1.5) * 100)}%</p>
                    </div>
                </div>
            )}

            {/* Employees Table */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">
                        <div className="animate-spin text-4xl mb-4">⚙️</div>
                        <p>Loading employees...</p>
                    </div>
                ) : error ? (
                    <div className="p-12 text-center text-red-400">
                        <div className="text-4xl mb-4">⚠️</div>
                        <p>{error}</p>
                        <button
                            onClick={loadEmployees}
                            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <div className="text-4xl mb-4">📭</div>
                        <p>No employees found</p>
                        <button
                            onClick={handleAddEmployee}
                            className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 rounded text-white font-bold"
                        >
                            Add Your First Employee
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Employee</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Wallet</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Contact</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Salary</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Hired</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredEmployees.map((employee) => (
                                    <EmployeeRow
                                        key={employee.id}
                                        employee={employee}
                                        onEdit={() => handleEditEmployee(employee)}
                                        onToggleActive={() => handleToggleActive(employee.id, employee.isActive)}
                                        onDelete={() => handleDeleteEmployee(employee.id)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Employee Modal */}
            {showModal && (
                <EmployeeModal
                    employee={editingEmployee}
                    formData={formData}
                    setFormData={setFormData}
                    saving={saving}
                    country={country}
                    onSave={handleSave}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatCard({
    label,
    value,
    icon,
    color = 'blue',
}: {
    label: string;
    value: string;
    icon: string;
    color?: 'blue' | 'green' | 'red' | 'purple';
}) {
    const colors = {
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
        green: 'from-green-500/20 to-green-600/10 border-green-500/30',
        red: 'from-red-500/20 to-red-600/10 border-red-500/30',
        purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-sm border rounded-xl p-6`}>
            <div className="flex items-center gap-4">
                <div className="text-3xl">{icon}</div>
                <div>
                    <div className="text-3xl font-black text-white">{value}</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
                </div>
            </div>
        </div>
    );
}

function EmployeeRow({
    employee,
    onEdit,
    onToggleActive,
    onDelete,
}: {
    employee: Employee;
    onEdit: () => void;
    onToggleActive: () => void;
    onDelete: () => void;
}) {
    return (
        <tr className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-4">
                <div className="text-white font-bold">{employee.name}</div>
                {employee.nameAr && <div className="text-gray-400 text-xs" dir="rtl">{employee.nameAr}</div>}
            </td>
            <td className="px-6 py-4 font-mono text-xs text-gray-300">
                {employee.walletAddress.slice(0, 8)}...{employee.walletAddress.slice(-6)}
            </td>
            <td className="px-6 py-4">
                <RoleBadge role={employee.role} />
            </td>
            <td className="px-6 py-4 text-gray-300 text-sm">
                {employee.email && <div>{employee.email}</div>}
                {employee.phone && <div className="text-xs">{employee.phone}</div>}
                {!employee.email && !employee.phone && <span className="text-gray-500">—</span>}
            </td>
            <td className="px-6 py-4 text-right text-white font-bold">
                ${employee.salary.toFixed(2)}
            </td>
            <td className="px-6 py-4 text-gray-300 text-sm">
                {new Date(employee.hiredAt * 1000).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-center">
                <StatusBadge isActive={employee.isActive} />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={onEdit}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs font-bold"
                    >
                        ✏️ Edit
                    </button>
                    <button
                        onClick={onToggleActive}
                        className={`px-3 py-1 rounded text-white text-xs font-bold ${employee.isActive
                                ? 'bg-yellow-600 hover:bg-yellow-700'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        {employee.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs font-bold"
                    >
                        🗑️ Remove
                    </button>
                </div>
            </td>
        </tr>
    );
}

function RoleBadge({ role }: { role: UserRole }) {
    const colors = {
        CASHIER: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        MANAGER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        USER: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        ADMIN: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        SUPER_ADMIN: 'bg-red-500/20 text-red-300 border-red-500/30',
        DRIVER: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        SUPPLIER: 'bg-green-500/20 text-green-300 border-green-500/30',
    };

    return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${colors[role]}`}>
            {role}
        </span>
    );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${isActive
                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                : 'bg-red-500/20 text-red-300 border-red-500/30'
            }`}>
            {isActive ? '✅ ACTIVE' : '🚫 INACTIVE'}
        </span>
    );
}

function EmployeeModal({
    employee,
    formData,
    setFormData,
    saving,
    country,
    onSave,
    onClose,
}: {
    employee: Employee | null;
    formData: EmployeeForm;
    setFormData: React.Dispatch<React.SetStateAction<EmployeeForm>>;
    saving: boolean;
    country: string;
    onSave: () => void;
    onClose: () => void;
}) {
    const rules = complianceEngine.getRules(country);
    const isBelowMinWage = rules && rules.minimumWage && formData.salary < rules.minimumWage;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0a0f1a] border border-white/20 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {employee ? 'Edit Employee' : 'Add New Employee'}
                </h2>

                <div className="space-y-4">
                    {/* Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Name (English) *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Name (Arabic)</label>
                            <input
                                type="text"
                                value={formData.nameAr || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                                dir="rtl"
                            />
                        </div>
                    </div>

                    {/* Wallet Address */}
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Wallet Address *</label>
                        <input
                            type="text"
                            value={formData.walletAddress}
                            onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0x..."
                            required
                        />
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Role & Salary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Role *</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="CASHIER">Cashier</option>
                                <option value="MANAGER">Manager</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">
                                Monthly Salary ({rules?.currency || '$'}) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.salary}
                                onChange={(e) => setFormData(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
                                className={`w-full px-4 py-2 bg-white/10 border rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isBelowMinWage ? 'border-yellow-500' : 'border-white/20'
                                    }`}
                                required
                            />
                            {isBelowMinWage && (
                                <p className="text-yellow-400 text-xs mt-1">
                                    ⚠️ Below minimum wage ({rules?.minimumWage} {rules?.currency})
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10">
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? '⏳ Saving...' : employee ? '💾 Update Employee' : '➕ Add Employee'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded text-white font-bold disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
