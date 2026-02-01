/**
 * SecurityService.ts
 * 
 * Comprehensive security service for the NileLink ecosystem
 * Includes fraud detection, threat monitoring, and resilience measures
 */

import { blockchainService } from './BlockchainService';
import { NotificationService } from './NotificationService';

export interface SecurityEvent {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: number;
  source: string;
  details: any;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: number;
}

export interface FraudPattern {
  id: string;
  name: string;
  description: string;
  threshold: number;
  detectionLogic: (data: any) => boolean;
  autoAction: 'ALERT_ONLY' | 'BLOCK_TRANSACTION' | 'FREEZE_ACCOUNT';
}

export interface ThreatIntel {
  id: string;
  indicator: string;
  type: 'IP' | 'WALLET' | 'EMAIL' | 'PHONE';
  confidence: number; // 0-100
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tags: string[];
  createdAt: number;
  expiresAt?: number;
}

export interface RiskAssessment {
  score: number; // 0-100
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: {
    type: string;
    weight: number;
    contribution: number;
  }[];
  recommendation: 'ALLOW' | 'MONITOR' | 'CHALLENGE' | 'BLOCK';
}

export interface SecurityConfig {
  fraudDetectionEnabled: boolean;
  threatMonitoringEnabled: boolean;
  autoFreezeThreshold: number; // Risk score threshold for auto-freeze
  notificationWebhook?: string;
  alertRecipients: string[]; // Email addresses for security alerts
  auditLoggingEnabled: boolean;
  suspiciousActivityThreshold: number; // Number of suspicious events before escalation
}

class SecurityService {
  private static instance: SecurityService;
  private fraudPatterns: FraudPattern[] = [];
  private threatIntel: Map<string, ThreatIntel> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private config: SecurityConfig;
  private notificationService: NotificationService;

  private constructor() {
    // Initialize with default security configuration
    this.config = {
      fraudDetectionEnabled: true,
      threatMonitoringEnabled: true,
      autoFreezeThreshold: 80,
      alertRecipients: ['security@nilelink.app'],
      auditLoggingEnabled: true,
      suspiciousActivityThreshold: 5
    };
    
    this.notificationService = new NotificationService();
    
    // Initialize default fraud patterns
    this.initializeDefaultFraudPatterns();
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Initialize default fraud patterns
   */
  private initializeDefaultFraudPatterns(): void {
    this.fraudPatterns = [
      {
        id: 'multiple_failed_payments',
        name: 'Multiple Failed Payments',
        description: 'Detects multiple failed payment attempts from same source',
        threshold: 3,
        detectionLogic: (data: any) => {
          return data.failedAttempts >= this.config.suspiciousActivityThreshold;
        },
        autoAction: 'MONITOR'
      },
      {
        id: 'unusual_volume',
        name: 'Unusual Order Volume',
        description: 'Detects sudden spikes in order volume',
        threshold: 500, // 500% increase from baseline
        detectionLogic: (data: any) => {
          return (data.currentVolume && data.baselineVolume && data.baselineVolume > 0) 
            ? (data.currentVolume / data.baselineVolume) >= (this.config.suspiciousActivityThreshold / 2)
            : false;
        },
        autoAction: 'ALERT_ONLY'
      },
      {
        id: 'geographic_anomaly',
        name: 'Geographic Anomaly',
        description: 'Detects orders from unusual geographic locations',
        threshold: 1,
        detectionLogic: (data: any) => {
          return data.unusualLocationCount >= 1;
        },
        autoAction: 'CHALLENGE'
      },
      {
        id: 'rapid_account_creation',
        name: 'Rapid Account Creation',
        description: 'Detects rapid account creation from same IP',
        threshold: 5,
        detectionLogic: (data: any) => {
          return data.accountsPerIp >= 5;
        },
        autoAction: 'BLOCK_TRANSACTION'
      },
      {
        id: 'duplicate_payment',
        name: 'Duplicate Payment',
        description: 'Detects duplicate payment attempts',
        threshold: 1,
        detectionLogic: (data: any) => {
          return data.duplicatePayments >= 1;
        },
        autoAction: 'BLOCK_TRANSACTION'
      }
    ];
  }

  /**
   * Assess risk for an operation
   */
  async assessRisk(operationData: any): Promise<RiskAssessment> {
    let totalScore = 0;
    const factors: RiskAssessment['factors'] = [];

    // Check against threat intelligence
    const threatScore = this.checkAgainstThreatIntel(operationData);
    if (threatScore > 0) {
      factors.push({
        type: 'THREAT_INTEL_MATCH',
        weight: 0.3,
        contribution: threatScore * 0.3
      });
      totalScore += threatScore * 0.3;
    }

    // Check fraud patterns
    for (const pattern of this.fraudPatterns) {
      if (pattern.detectionLogic(operationData)) {
        factors.push({
          type: pattern.name,
          weight: 0.2,
          contribution: pattern.threshold * 0.2
        });
        totalScore += pattern.threshold * 0.2;
      }
    }

    // Add behavioral analysis
    const behavioralScore = this.analyzeBehavior(operationData);
    if (behavioralScore > 0) {
      factors.push({
        type: 'BEHAVIORAL_ANOMALY',
        weight: 0.25,
        contribution: behavioralScore * 0.25
      });
      totalScore += behavioralScore * 0.25;
    }

    // Add temporal analysis
    const temporalScore = this.analyzeTemporalPatterns(operationData);
    if (temporalScore > 0) {
      factors.push({
        type: 'TEMPORAL_ANOMALY',
        weight: 0.15,
        contribution: temporalScore * 0.15
      });
      totalScore += temporalScore * 0.15;
    }

    // Normalize to 0-100 scale
    const normalizedScore = Math.min(100, totalScore);

    let level: RiskAssessment['level'];
    let recommendation: RiskAssessment['recommendation'];

    if (normalizedScore >= 80) {
      level = 'CRITICAL';
      recommendation = 'BLOCK';
    } else if (normalizedScore >= 60) {
      level = 'HIGH';
      recommendation = 'CHALLENGE';
    } else if (normalizedScore >= 40) {
      level = 'MEDIUM';
      recommendation = 'MONITOR';
    } else {
      level = 'LOW';
      recommendation = 'ALLOW';
    }

    return {
      score: normalizedScore,
      level,
      factors,
      recommendation
    };
  }

  /**
   * Check operation data against threat intelligence
   */
  private checkAgainstThreatIntel(data: any): number {
    let threatScore = 0;

    // Check IP address
    if (data.ipAddress) {
      const ipThreat = this.threatIntel.get(data.ipAddress);
      if (ipThreat) {
        threatScore += this.getThreatScore(ipThreat);
      }
    }

    // Check wallet address
    if (data.walletAddress) {
      const walletThreat = this.threatIntel.get(data.walletAddress);
      if (walletThreat) {
        threatScore += this.getThreatScore(walletThreat);
      }
    }

    // Check email
    if (data.email) {
      const emailThreat = this.threatIntel.get(data.email);
      if (emailThreat) {
        threatScore += this.getThreatScore(emailThreat);
      }
    }

    return threatScore;
  }

  /**
   * Get numerical score from threat level
   */
  private getThreatScore(threat: ThreatIntel): number {
    switch (threat.threatLevel) {
      case 'CRITICAL': return 90;
      case 'HIGH': return 70;
      case 'MEDIUM': return 40;
      case 'LOW': return 10;
      default: return 0;
    }
  }

  /**
   * Analyze behavioral patterns
   */
  private analyzeBehavior(data: any): number {
    // This would typically involve machine learning models
    // For now, we'll use simple heuristics
    let score = 0;

    // Check for unusual timing (very late or early hours)
    const hour = new Date().getUTCHours();
    if (hour < 6 || hour > 22) {
      score += 10;
    }

    // Check for rapid successive operations
    if (data.rapidOperations) {
      score += 20;
    }

    // Check for unusual amounts
    if (data.amount && data.averageAmount) {
      const deviation = Math.abs(data.amount - data.averageAmount) / data.averageAmount;
      if (deviation > 2) { // More than 200% deviation
        score += 15;
      }
    }

    return score;
  }

  /**
   * Analyze temporal patterns
   */
  private analyzeTemporalPatterns(data: any): number {
    let score = 0;

    // Check for operations happening too quickly
    if (data.timeBetweenOps && data.timeBetweenOps < 1000) { // Less than 1 second
      score += 25;
    }

    // Check for operations during maintenance windows
    if (data.maintenanceWindow) {
      score += 15;
    }

    return score;
  }

  /**
   * Add threat intelligence indicator
   */
  addThreatIndicator(indicator: ThreatIntel): void {
    this.threatIntel.set(indicator.indicator, indicator);
    
    // Log the addition
    this.logSecurityEvent({
      id: `threat_${Date.now()}`,
      type: 'THREAT_INTEL_ADDED',
      severity: 'MEDIUM',
      timestamp: Date.now(),
      source: 'SECURITY_ADMIN',
      details: indicator,
      resolved: false
    });
  }

  /**
   * Remove threat intelligence indicator
   */
  removeThreatIndicator(indicator: string): void {
    this.threatIntel.delete(indicator);
    
    this.logSecurityEvent({
      id: `threat_remove_${Date.now()}`,
      type: 'THREAT_INTEL_REMOVED',
      severity: 'LOW',
      timestamp: Date.now(),
      source: 'SECURITY_ADMIN',
      details: { indicator },
      resolved: false
    });
  }

  /**
   * Detect fraud based on patterns
   */
  async detectFraud(operationData: any): Promise<{
    isFraud: boolean;
    patternsDetected: string[];
    riskScore: number;
    recommendedAction: 'ALLOW' | 'MONITOR' | 'CHALLENGE' | 'BLOCK';
  }> {
    if (!this.config.fraudDetectionEnabled) {
      return {
        isFraud: false,
        patternsDetected: [],
        riskScore: 0,
        recommendedAction: 'ALLOW'
      };
    }

    const assessment = await this.assessRisk(operationData);
    
    const detectedPatterns: string[] = [];
    
    // Check each fraud pattern
    for (const pattern of this.fraudPatterns) {
      if (pattern.detectionLogic(operationData)) {
        detectedPatterns.push(pattern.id);
        
        // Log the detection
        this.logSecurityEvent({
          id: `fraud_${Date.now()}_${pattern.id}`,
          type: `FRAUD_${pattern.id.toUpperCase()}`,
          severity: this.getSeverityFromThreshold(pattern.threshold),
          timestamp: Date.now(),
          source: 'FRAUD_DETECTION_ENGINE',
          details: {
            pattern: pattern.id,
            data: operationData,
            action: pattern.autoAction
          },
          resolved: false
        });
      }
    }

    return {
      isFraud: detectedPatterns.length > 0 || assessment.score > 50,
      patternsDetected: detectedPatterns,
      riskScore: assessment.score,
      recommendedAction: assessment.recommendation
    };
  }

  /**
   * Convert threshold to severity
   */
  private getSeverityFromThreshold(threshold: number): SecurityEvent['severity'] {
    if (threshold >= 100) return 'CRITICAL';
    if (threshold >= 75) return 'HIGH';
    if (threshold >= 50) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Monitor for threats
   */
  async monitorThreats(data: any): Promise<void> {
    if (!this.config.threatMonitoringEnabled) {
      return;
    }

    // Check for known threats
    const threatMatches = this.findThreatMatches(data);
    
    for (const match of threatMatches) {
      this.logSecurityEvent({
        id: `threat_${Date.now()}_${match.id}`,
        type: 'THREAT_DETECTED',
        severity: match.threatLevel as SecurityEvent['severity'],
        timestamp: Date.now(),
        source: 'THREAT_MONITORING_ENGINE',
        details: {
          indicator: match.indicator,
          threat: match,
          matchedData: data
        },
        resolved: false
      });

      // Send alert if severity is high or critical
      if (match.threatLevel === 'HIGH' || match.threatLevel === 'CRITICAL') {
        await this.sendSecurityAlert({
          type: 'THREAT_DETECTED',
          severity: match.threatLevel,
          details: {
            indicator: match.indicator,
            threatType: match.type,
            matchedData: data
          }
        });
      }
    }
  }

  /**
   * Find threat matches in provided data
   */
  private findThreatMatches(data: any): ThreatIntel[] {
    const matches: ThreatIntel[] = [];

    // Check IP address
    if (data.ipAddress && this.threatIntel.has(data.ipAddress)) {
      matches.push(this.threatIntel.get(data.ipAddress)!);
    }

    // Check wallet address
    if (data.walletAddress && this.threatIntel.has(data.walletAddress)) {
      matches.push(this.threatIntel.get(data.walletAddress)!);
    }

    // Check email
    if (data.email && this.threatIntel.has(data.email)) {
      matches.push(this.threatIntel.get(data.email)!);
    }

    // Check phone
    if (data.phone && this.threatIntel.has(data.phone)) {
      matches.push(this.threatIntel.get(data.phone)!);
    }

    return matches;
  }

  /**
   * Log a security event
   */
  logSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event);

    // Keep only recent events (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.securityEvents = this.securityEvents.filter(e => e.timestamp > thirtyDaysAgo);

    // Send notification for high/critical events
    if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
      this.sendSecurityAlert({
        type: event.type,
        severity: event.severity,
        details: event.details
      }).catch(console.error);
    }

    // If audit logging is enabled, store in blockchain or database
    if (this.config.auditLoggingEnabled) {
      this.storeAuditLog(event);
    }
  }

  /**
   * Store audit log (could be on blockchain or secure database)
   */
  private async storeAuditLog(event: SecurityEvent): Promise<void> {
    // In a real implementation, this would store the event securely
    // possibly on blockchain for immutability
    console.log(`AUDIT LOG: ${event.type} - ${event.severity}`, event);
    
    // Could integrate with blockchain service to store hash of event
    try {
      // Example: store event hash on blockchain for immutability
      // await blockchainService.storeAuditEventHash(event.id, this.hashEvent(event));
    } catch (error) {
      console.error('Failed to store audit log on blockchain:', error);
    }
  }

  /**
   * Hash an event for blockchain storage
   */
  private hashEvent(event: SecurityEvent): string {
    // Simple hash implementation - in production, use proper hashing
    const str = JSON.stringify({
      id: event.id,
      type: event.type,
      severity: event.severity,
      timestamp: event.timestamp,
      source: event.source,
      details: event.details
    });
    
    // Simple hash (in production, use crypto library)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Send security alert
   */
  async sendSecurityAlert(alert: {
    type: string;
    severity: string;
    details: any;
  }): Promise<void> {
    const message = `🚨 SECURITY ALERT: ${alert.type}\nSeverity: ${alert.severity}\nDetails: ${JSON.stringify(alert.details, null, 2)}`;
    
    // Send to configured recipients
    for (const recipient of this.config.alertRecipients) {
      try {
        // For security alerts, we'll use the sendToUser method
        // Since recipient is likely an email, we'll treat it as a user ID
        this.notificationService.sendToUser(
          recipient,
          'admin',
          `🚨 Security Alert: ${alert.type}`,
          message,
          { priority: 'HIGH', type: 'SECURITY_ALERT' }
        );
      } catch (error) {
        console.error(`Failed to send security alert to ${recipient}:`, error);
      }
    }

    // Send to webhook if configured
    if (this.config.notificationWebhook) {
      try {
        await fetch(this.config.notificationWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'SECURITY_ALERT',
            severity: alert.severity,
            message: alert,
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Failed to send security alert to webhook:', error);
      }
    }
  }

  /**
   * Get security events (for admin dashboard)
   */
  getSecurityEvents(filters?: {
    startDate?: number;
    endDate?: number;
    severity?: SecurityEvent['severity'][];
    type?: string;
    resolved?: boolean;
  }): SecurityEvent[] {
    let events = [...this.securityEvents];

    if (filters) {
      if (filters.startDate) {
        events = events.filter(e => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        events = events.filter(e => e.timestamp <= filters.endDate!);
      }
      if (filters.severity) {
        events = events.filter(e => filters.severity!.includes(e.severity));
      }
      if (filters.type) {
        events = events.filter(e => e.type.includes(filters.type!));
      }
      if (filters.resolved !== undefined) {
        events = events.filter(e => e.resolved === filters.resolved);
      }
    }

    // Sort by timestamp (newest first)
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Resolve a security event
   */
  resolveSecurityEvent(eventId: string, resolvedBy: string): boolean {
    const event = this.securityEvents.find(e => e.id === eventId);
    if (event) {
      event.resolved = true;
      event.resolvedBy = resolvedBy;
      event.resolvedAt = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Update security configuration
   */
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    this.logSecurityEvent({
      id: `config_update_${Date.now()}`,
      type: 'SECURITY_CONFIG_UPDATED',
      severity: 'LOW',
      timestamp: Date.now(),
      source: 'SECURITY_ADMIN',
      details: newConfig,
      resolved: true
    });
  }

  /**
   * Get current security configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Perform security health check
   */
  async healthCheck(): Promise<{
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    checks: Array<{
      name: string;
      status: 'PASS' | 'FAIL' | 'WARN';
      message: string;
    }>;
  }> {
    const checks = [];

    // Check if fraud detection is enabled
    checks.push({
      name: 'Fraud Detection',
      status: this.config.fraudDetectionEnabled ? 'PASS' : 'WARN',
      message: this.config.fraudDetectionEnabled 
        ? 'Fraud detection is enabled' 
        : 'Fraud detection is disabled'
    });

    // Check if threat monitoring is enabled
    checks.push({
      name: 'Threat Monitoring',
      status: this.config.threatMonitoringEnabled ? 'PASS' : 'WARN',
      message: this.config.threatMonitoringEnabled 
        ? 'Threat monitoring is enabled' 
        : 'Threat monitoring is disabled'
    });

    // Check threat intel database size
    checks.push({
      name: 'Threat Intelligence DB',
      status: this.threatIntel.size > 0 ? 'PASS' : 'WARN',
      message: `Threat intelligence database has ${this.threatIntel.size} indicators`
    });

    // Check security event count
    const recentEvents = this.securityEvents.filter(
      e => e.timestamp > (Date.now() - (24 * 60 * 60 * 1000))
    ); // Last 24 hours
    checks.push({
      name: 'Recent Security Events',
      status: recentEvents.length < 100 ? 'PASS' : 
              recentEvents.length < 500 ? 'WARN' : 'FAIL',
      message: `Detected ${recentEvents.length} security events in last 24 hours`
    });

    // Determine overall status
    const failedChecks = checks.filter(c => c.status === 'FAIL').length;
    const warnChecks = checks.filter(c => c.status === 'WARN').length;

    let status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    if (failedChecks > 0) {
      status = 'CRITICAL';
    } else if (warnChecks > 0) {
      status = 'WARNING';
    } else {
      status = 'HEALTHY';
    }

    return { status, checks };
  }

  /**
   * Respond to security incident automatically
   */
  async respondToIncident(securityEvent: SecurityEvent): Promise<void> {
    // Based on the event type and severity, take automated actions
    switch (securityEvent.type) {
      case 'FRAUD_DETECTED':
        // For high severity fraud, freeze account
        if (securityEvent.severity === 'HIGH' || securityEvent.severity === 'CRITICAL') {
          // In a real implementation, this would freeze the user's account
          console.log(`AUTO-FREEZE: Account associated with ${securityEvent.details?.walletAddress} due to fraud`);
        }
        break;
        
      case 'THREAT_DETECTED':
        // Block the threat indicator
        if (securityEvent.details?.indicator) {
          // In a real implementation, this would block the IP/wallet/email
          console.log(`AUTO-BLOCK: Threat indicator ${securityEvent.details.indicator} has been blocked`);
        }
        break;
        
      case 'MULTIPLE_FAILED_PAYMENTS':
        // Rate limit or block the source
        console.log(`RATE_LIMIT: Source ${securityEvent.details?.source} has been rate limited`);
        break;
        
      default:
        // For other events, just log and alert
        console.log(`SECURITY_EVENT: ${securityEvent.type} - ${securityEvent.severity}`);
        break;
    }

    // Send immediate alert for critical events
    if (securityEvent.severity === 'CRITICAL') {
      await this.sendSecurityAlert({
        type: securityEvent.type,
        severity: securityEvent.severity,
        details: securityEvent.details
      });
    }
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance();

// Export the class for direct instantiation if needed
export default SecurityService;