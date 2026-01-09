"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield, AlertTriangle, Eye, Lock, Activity, Users,
    Globe, Clock, TrendingUp, TrendingDown, CheckCircle,
    XCircle, AlertCircle, Info, Filter, Download,
    RefreshCw, Calendar, Search
} from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Input } from './Input';

// Mock data - in production, this would come from API
interface SecurityMetrics {
  totalEvents: number;
  failedLogins: number;
  suspiciousActivities: number;
  activeUsers: number;
  blockedIPs: number;
  twoFactorEnabled: number;
  rateLimitedRequests: number;
  auditCoverage: number;
}

interface SecurityAlert {
  id: string;
  type: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  timestamp: Date;
  source: string;
  userId?: string;
  ipAddress?: string;
  resolved: boolean;
}

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  ipAddress: string;
  action: string;
  details: string;
}

const SecurityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'audit' | 'settings'>('overview');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  // Mock data
  const [metrics] = useState<SecurityMetrics>({
    totalEvents: 1247,
    failedLogins: 23,
    suspiciousActivities: 8,
    activeUsers: 156,
    blockedIPs: 3,
    twoFactorEnabled: 89,
    rateLimitedRequests: 45,
    auditCoverage: 98.5
  });

  const [alerts] = useState<SecurityAlert[]>([
    {
      id: '1',
      type: 'CRITICAL',
      title: 'Brute Force Attack Detected',
      description: 'Multiple failed login attempts from IP 192.168.1.100 targeting admin accounts',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      source: 'Authentication System',
      ipAddress: '192.168.1.100',
      resolved: false
    },
    {
      id: '2',
      type: 'HIGH',
      title: 'Suspicious API Usage',
      description: 'Unusual data export volume from user account',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      source: 'API Gateway',
      userId: 'user_456',
      resolved: false
    },
    {
      id: '3',
      type: 'MEDIUM',
      title: '2FA Disabled',
      description: 'User disabled two-factor authentication',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      source: 'User Management',
      userId: 'user_123',
      resolved: true
    }
  ]);

  const [auditLogs] = useState<AuditLogEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      eventType: 'LOGIN_SUCCESS',
      severity: 'LOW',
      userId: 'user_123',
      ipAddress: '192.168.1.50',
      action: 'User logged in successfully',
      details: 'Standard login from web application'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      eventType: 'API_ACCESS',
      severity: 'LOW',
      userId: 'user_456',
      ipAddress: '10.0.0.20',
      action: 'Accessed user profile API',
      details: 'GET /api/users/profile'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      eventType: 'LOGIN_FAILED',
      severity: 'MEDIUM',
      ipAddress: '192.168.1.100',
      action: 'Failed login attempt',
      details: 'Invalid credentials for user admin'
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-error';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-text-muted';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'neutral';
      case 'low': return 'success';
      default: return 'neutral';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || alert.type.toLowerCase() === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (log.userId && log.userId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSeverity = selectedSeverity === 'all' || log.severity.toLowerCase() === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield size={24} className="text-primary" />
            </div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">
              Security Command Center
            </h1>
          </div>
          <p className="text-text-muted font-medium">
            Real-time security monitoring and threat intelligence
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="px-3 py-2 border border-border-subtle rounded-md bg-background text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button variant="outline" className="gap-2">
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-background-subtle rounded-xl max-w-2xl">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'alerts', label: 'Security Alerts', icon: AlertTriangle, count: alerts.filter(a => !a.resolved).length },
          { id: 'audit', label: 'Audit Logs', icon: Eye },
          { id: 'settings', label: 'Security Settings', icon: Shield }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'ghost'}
            className={`flex-1 rounded-lg ${activeTab === tab.id ? 'shadow-sm' : ''}`}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
          >
            <tab.icon size={16} className="mr-2" />
            {tab.label}
            {tab.count && tab.count > 0 && (
              <Badge className="ml-2 bg-error text-white text-xs">
                {tab.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Security Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Total Security Events',
                value: metrics.totalEvents.toLocaleString(),
                change: '+12%',
                trend: 'up',
                icon: Activity,
                color: 'text-blue-500'
              },
              {
                title: 'Failed Login Attempts',
                value: metrics.failedLogins,
                change: '-8%',
                trend: 'down',
                icon: Lock,
                color: 'text-red-500'
              },
              {
                title: '2FA Adoption',
                value: `${((metrics.twoFactorEnabled / metrics.activeUsers) * 100).toFixed(0)}%`,
                change: '+15%',
                trend: 'up',
                icon: Shield,
                color: 'text-green-500'
              },
              {
                title: 'Audit Coverage',
                value: `${metrics.auditCoverage}%`,
                change: '+2.1%',
                trend: 'up',
                icon: Eye,
                color: 'text-purple-500'
              }
            ].map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-background-subtle ${metric.color}`}>
                      <metric.icon size={20} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {metric.change}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-text-muted">{metric.title}</p>
                    <p className="text-2xl font-black text-text-primary">{metric.value}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Security Health Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <Globe size={20} />
                Security Health Score
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Authentication Security', score: 92, status: 'Excellent' },
                  { label: 'API Security', score: 88, status: 'Good' },
                  { label: 'Data Protection', score: 95, status: 'Excellent' },
                  { label: 'Network Security', score: 78, status: 'Needs Attention' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-text-primary">{item.label}</span>
                        <span className="text-xs text-text-muted">{item.status}</span>
                      </div>
                      <div className="w-full bg-background-subtle rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item.score >= 90 ? 'bg-green-500' :
                            item.score >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <AlertCircle size={20} />
                Recent Security Events
              </h3>
              <div className="space-y-3">
                {[
                  { time: '2m ago', event: 'Rate limit triggered', severity: 'LOW' },
                  { time: '15m ago', event: 'New device login', severity: 'LOW' },
                  { time: '1h ago', event: 'Failed 2FA attempt', severity: 'MEDIUM' },
                  { time: '2h ago', event: 'Account locked', severity: 'HIGH' }
                ].map((event, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background-subtle">
                    <div className={`w-2 h-2 rounded-full ${
                      event.severity === 'HIGH' ? 'bg-red-500' :
                      event.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">{event.event}</p>
                      <p className="text-xs text-text-muted">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={18} />
              <Input
                placeholder="Search alerts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 border border-border-subtle rounded-md bg-background text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button variant="outline" className="gap-2">
              <Download size={16} />
              Export
            </Button>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className="p-6 border-2 border-l-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      alert.type === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                      alert.type === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                      alert.type === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-green-500/10 text-green-500'
                    }`}>
                      {alert.type === 'CRITICAL' ? <XCircle size={20} /> :
                       alert.type === 'HIGH' ? <AlertTriangle size={20} /> :
                       <AlertCircle size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-text-primary">{alert.title}</h3>
                        <Badge variant={getSeverityBadgeVariant(alert.type)} className="text-xs">
                          {alert.type}
                        </Badge>
                        {alert.resolved && (
                          <Badge variant="success" className="text-xs">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-muted mb-3">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                        <span>Source: {alert.source}</span>
                        {alert.userId && <span>User: {alert.userId}</span>}
                        {alert.ipAddress && <span>IP: {alert.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <Button variant="outline" size="sm">
                      Resolve
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            {filteredAlerts.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle size={48} className="mx-auto text-success mb-4" />
                <h3 className="text-lg font-bold text-text-primary mb-2">All Clear</h3>
                <p className="text-text-muted">No security alerts in the selected time range.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={18} />
              <Input
                placeholder="Search audit logs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 border border-border-subtle rounded-md bg-background text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button variant="outline" className="gap-2">
              <Download size={16} />
              Export CSV
            </Button>
          </div>

          {/* Audit Log Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-subtle border-b border-border-subtle">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-text-subtle uppercase tracking-widest">Timestamp</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-text-subtle uppercase tracking-widest">Event</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-text-subtle uppercase tracking-widest">Severity</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-text-subtle uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-text-subtle uppercase tracking-widest">IP Address</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-text-subtle uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-background-subtle/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-mono text-text-primary">{log.timestamp.toLocaleString()}</p>
                          <p className="text-xs text-text-muted">{formatTimeAgo(log.timestamp)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="neutral" className="text-xs font-mono">
                          {log.eventType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getSeverityBadgeVariant(log.severity)} className="text-xs">
                          {log.severity}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-text-primary">
                          {log.userId || 'Anonymous'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-text-primary">{log.ipAddress}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-text-primary">{log.action}</p>
                          <p className="text-xs text-text-muted">{log.details}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {filteredAuditLogs.length === 0 && (
            <div className="text-center py-12">
              <Info size={48} className="mx-auto text-text-muted mb-4" />
              <h3 className="text-lg font-bold text-text-primary mb-2">No Audit Logs Found</h3>
              <p className="text-text-muted">Try adjusting your search filters.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-6">Security Configuration</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-border-subtle rounded-lg">
                <div>
                  <h4 className="font-bold text-text-primary">Two-Factor Authentication</h4>
                  <p className="text-sm text-text-muted">Require 2FA for all admin accounts</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-border-subtle rounded-lg">
                <div>
                  <h4 className="font-bold text-text-primary">Rate Limiting</h4>
                  <p className="text-sm text-text-muted">Configure API rate limits</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-border-subtle rounded-lg">
                <div>
                  <h4 className="font-bold text-text-primary">Audit Logging</h4>
                  <p className="text-sm text-text-muted">Retention period and export settings</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-border-subtle rounded-lg">
                <div>
                  <h4 className="font-bold text-text-primary">Security Alerts</h4>
                  <p className="text-sm text-text-muted">Email and SMS alert preferences</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;