// web/pos/src/services/AuditService.ts
'use server'

import { prisma } from '@shared/lib/prisma'

interface AuditLogInput {
  adminId: string
  action: string
  entityType: string
  entityId: string
  oldValue?: any
  newValue?: any
  reason?: string
  ipAddress?: string
  userAgent?: string
}

interface ProfitAlertInput {
  orderId?: string
  alertType: 'ZERO_PROFIT' | 'NEGATIVE_PROFIT' | 'COMMISSION_BYPASS' | 'SETTLEMENT_ANOMALY'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  message: string
  details?: any
}

export class AuditService {
  /**
   * Log financial/admin actions for audit trail
   */
  static async logAction(input: AuditLogInput): Promise<void> {
    await prisma.financialAuditLog.create({
      data: {
        adminId: input.adminId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValue: input.oldValue ? JSON.stringify(input.oldValue) : undefined,
        newValue: input.newValue ? JSON.stringify(input.newValue) : undefined,
        reason: input.reason,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        timestamp: new Date()
      }
    })
  }

  /**
   * Create profit validation alert
   */
  static async createProfitAlert(input: ProfitAlertInput): Promise<string> {
    const alert = await prisma.profitAlert.create({
      data: {
        orderId: input.orderId,
        alertType: input.alertType,
        severity: input.severity,
        message: input.message,
        details: input.details ? JSON.stringify(input.details) : undefined
      }
    })

    // In production, this would trigger notifications to Super Admins
    console.warn(`PROFIT ALERT (${input.severity}): ${input.message}`)
    
    return alert.id
  }

  /**
   * Resolve profit alert
   */
  static async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
    await prisma.profitAlert.update({
      where: { id: alertId },
      data: {
        resolved: true,
        resolvedBy,
        resolvedAt: new Date()
      }
    })
  }

  /**
   * Get audit logs with filtering
   */
  static async getAuditLogs(
    filters?: {
      adminId?: string
      action?: string
      entityType?: string
      entityId?: string
      startDate?: Date
      endDate?: Date
    },
    limit: number = 100,
    offset: number = 0
  ) {
    const where: any = {}

    if (filters?.adminId) where.adminId = filters.adminId
    if (filters?.action) where.action = filters.action
    if (filters?.entityType) where.entityType = filters.entityType
    if (filters?.entityId) where.entityId = filters.entityId
    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {}
      if (filters.startDate) where.timestamp.gte = filters.startDate
      if (filters.endDate) where.timestamp.lte = filters.endDate
    }

    return await prisma.financialAuditLog.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: limit,
      skip: offset
    })
  }

  /**
   * Get profit alerts
   */
  static async getProfitAlerts(
    filters?: {
      severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM'
      alertType?: string
      resolved?: boolean
    },
    limit: number = 50
  ) {
    const where: any = {}

    if (filters?.severity) where.severity = filters.severity
    if (filters?.alertType) where.alertType = filters.alertType
    if (filters?.resolved !== undefined) where.resolved = filters.resolved

    return await prisma.profitAlert.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })
  }

  /**
   * Get audit summary for dashboard
   */
  static async getAuditSummary(periodStart: Date, periodEnd: Date) {
    const auditLogs = await prisma.financialAuditLog.findMany({
      where: {
        timestamp: {
          gte: periodStart,
          lte: periodEnd
        }
      }
    })

    const profitAlerts = await prisma.profitAlert.findMany({
      where: {
        createdAt: {
          gte: periodStart,
          lte: periodEnd
        }
      }
    })

    // Group by action type
    const actionCounts: Record<string, number> = {}
    auditLogs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
    })

    // Count alert severities
    const alertSeverityCounts = {
      CRITICAL: profitAlerts.filter(a => a.severity === 'CRITICAL').length,
      HIGH: profitAlerts.filter(a => a.severity === 'HIGH').length,
      MEDIUM: profitAlerts.filter(a => a.severity === 'MEDIUM').length
    }

    // Count unresolved alerts
    const unresolvedAlerts = profitAlerts.filter(a => !a.resolved).length

    return {
      totalActions: auditLogs.length,
      actionCounts,
      totalAlerts: profitAlerts.length,
      alertSeverityCounts,
      unresolvedAlerts,
      criticalAlerts: alertSeverityCounts.CRITICAL
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  static async detectSuspiciousActivity(adminId: string): Promise<string[]> {
    const warnings: string[] = []
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Check for excessive actions in short time period
    const recentActions = await prisma.financialAuditLog.count({
      where: {
        adminId,
        timestamp: {
          gte: oneHourAgo
        }
      }
    })

    if (recentActions > 50) {
      warnings.push(`High frequency of actions (${recentActions} in 1 hour)`)
    }

    // Check for unusual action combinations
    const suspiciousActions = await prisma.financialAuditLog.findMany({
      where: {
        adminId,
        timestamp: {
          gte: oneDayAgo
        },
        action: {
          in: ['COMMISSION_RULE_CREATED', 'COMMISSION_RULE_UPDATED', 'ZERO_COMMISSION_GRANTED']
        }
      }
    })

    const uniqueEntityTypes = new Set(suspiciousActions.map(a => a.entityType))
    if (uniqueEntityTypes.size > 5) {
      warnings.push(`Multiple entity types modified (${uniqueEntityTypes.size} types)`)
    }

    // Check for large value changes
    const largeChanges = await prisma.financialAuditLog.findMany({
      where: {
        adminId,
        timestamp: {
          gte: oneDayAgo
        },
        OR: [
          {
            action: 'COMMISSION_RULE_UPDATED',
            newValue: {
              contains: '"orderCommissionPct":'
            }
          },
          {
            action: 'DELIVERY_PRICING_UPDATED',
            newValue: {
              contains: '"basePrice":'
            }
          }
        ]
      }
    })

    if (largeChanges.length > 10) {
      warnings.push(`Multiple large value changes (${largeChanges.length} changes)`)
    }

    return warnings
  }

  /**
   * Get detailed audit trail for specific entity
   */
  static async getEntityAuditTrail(entityType: string, entityId: string) {
    return await prisma.financialAuditLog.findMany({
      where: {
        entityType,
        entityId
      },
      orderBy: {
        timestamp: 'desc'
      }
    })
  }

  /**
   * Compare entity states over time
   */
  static async compareEntityStates(
    entityType: string, 
    entityId: string, 
    timestamp1: Date, 
    timestamp2: Date
  ) {
    const logs1 = await prisma.financialAuditLog.findMany({
      where: {
        entityType,
        entityId,
        timestamp: {
          lte: timestamp1
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 1
    })

    const logs2 = await prisma.financialAuditLog.findMany({
      where: {
        entityType,
        entityId,
        timestamp: {
          lte: timestamp2
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 1
    })

    return {
      stateAtTime1: logs1[0]?.newValue ? JSON.parse(logs1[0].newValue) : null,
      stateAtTime2: logs2[0]?.newValue ? JSON.parse(logs2[0].newValue) : null,
      timestamp1,
      timestamp2
    }
  }

  /**
   * Bulk audit log export (for compliance)
   */
  static async exportAuditLogs(
    startDate: Date, 
    endDate: Date, 
    entityType?: string
  ): Promise<any[]> {
    const where: any = {
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    }

    if (entityType) {
      where.entityType = entityType
    }

    const logs = await prisma.financialAuditLog.findMany({
      where,
      orderBy: {
        timestamp: 'asc'
      }
    })

    return logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      adminId: log.adminId,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      oldValue: log.oldValue ? JSON.parse(log.oldValue) : null,
      newValue: log.newValue ? JSON.parse(log.newValue) : null,
      reason: log.reason,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent
    }))
  }

  /**
   * Health check for audit system integrity
   */
  static async performIntegrityCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical'
    issues: string[]
  }> {
    const issues: string[] = []
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Check for missing audit logs
    const recentCommissionChanges = await prisma.merchantCommissionRule.findMany({
      where: {
        updatedAt: {
          gte: oneDayAgo
        }
      }
    })

    const recentAuditLogs = await prisma.financialAuditLog.count({
      where: {
        action: {
          in: ['COMMISSION_RULE_CREATED', 'COMMISSION_RULE_UPDATED']
        },
        timestamp: {
          gte: oneDayAgo
        }
      }
    })

    if (recentCommissionChanges.length > recentAuditLogs) {
      issues.push('Potential missing audit logs for commission changes')
    }

    // Check for unresolved critical alerts
    const unresolvedCritical = await prisma.profitAlert.count({
      where: {
        severity: 'CRITICAL',
        resolved: false
      }
    })

    if (unresolvedCritical > 0) {
      issues.push(`${unresolvedCritical} unresolved critical alerts`)
    }

    // System health assessment
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (issues.length > 0) {
      status = 'warning'
      if (issues.some(issue => issue.includes('critical') || issue.includes('zero profit'))) {
        status = 'critical'
      }
    }

    return { status, issues }
  }
}