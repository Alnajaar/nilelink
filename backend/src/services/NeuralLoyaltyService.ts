import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export interface LoyaltyPrediction {
    userId: string;
    recommendedReward: string;
    confidence: number;
    reasoning: string[];
    behaviorFactors: Record<string, number>;
    chaosEventMultiplier?: number;
}

export interface InstitutionalReputationUpdate {
    entityId: string;
    entityType: 'RESTAURANT' | 'SUPPLIER';
    newScore: number;
    factors: Record<string, number>;
    recommendations: string[];
}

export class NeuralLoyaltyService {
    constructor(private prisma: PrismaClient) { }

    /**
     * Generate personalized loyalty rewards using AI analysis
     */
    async generatePersonalizedRewards(userId: string): Promise<LoyaltyPrediction> {
        try {
            // Get user's loyalty profile and behavior data
            const profile = await this.prisma.neuralLoyaltyProfile.findUnique({
                where: { userId },
                include: {
                    transactions: {
                        orderBy: { createdAt: 'desc' },
                        take: 50
                    },
                    user: {
                        include: {
                            orders: {
                                orderBy: { createdAt: 'desc' },
                                take: 20
                            }
                        }
                    }
                }
            });

            if (!profile) {
                throw new Error('Loyalty profile not found');
            }

            // Analyze behavior patterns
            const behaviorAnalysis = await this.analyzeUserBehavior(profile);

            // Check for active chaos events
            const chaosMultiplier = await this.getChaosEventMultiplier(userId);

            // Generate AI-powered reward recommendations
            const prediction = await this.generateRewardPrediction(profile, behaviorAnalysis, chaosMultiplier);

            // Log AI decision for audit trail
            await this.logAIDecision('reward_prediction', {
                userId,
                prediction,
                inputData: {
                    behaviorAnalysis,
                    chaosMultiplier,
                    profileMetrics: {
                        totalPoints: profile.totalPoints,
                        neuralScore: profile.neuralScore,
                        currentTier: profile.currentTier?.name
                    }
                }
            });

            return prediction;

        } catch (error) {
            logger.error('NeuralLoyaltyService.generatePersonalizedRewards', { userId, error });
            throw error;
        }
    }

    /**
     * Update institutional reputation scores
     */
    async updateInstitutionalReputation(
        entityId: string,
        entityType: 'RESTAURANT' | 'SUPPLIER'
    ): Promise<InstitutionalReputationUpdate> {
        try {
            // Get current reputation data
            const reputation = await this.prisma.institutionalReputation.findUnique({
                where: {
                    entityId_entityType: {
                        entityId,
                        entityType
                    }
                },
                include: {
                    reviews: {
                        orderBy: { createdAt: 'desc' },
                        take: 100
                    },
                    incidents: {
                        where: {
                            createdAt: {
                                gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
                            }
                        }
                    }
                }
            });

            if (!reputation) {
                throw new Error('Institutional reputation not found');
            }

            // Calculate new scores using AI analysis
            const newScores = await this.calculateReputationScores(reputation);

            // Update reputation in database
            await this.prisma.institutionalReputation.update({
                where: {
                    entityId_entityType: {
                        entityId,
                        entityType
                    }
                },
                data: {
                    overallScore: newScores.overall,
                    trustScore: newScores.trust,
                    qualityScore: newScores.quality,
                    volumeScore: newScores.volume,
                    riskLevel: newScores.riskLevel,
                    negotiationPriority: newScores.negotiationPriority,
                    lastUpdatedAt: new Date()
                }
            });

            // Generate AI recommendations
            const recommendations = await this.generateReputationRecommendations(newScores);

            // Update on-chain reputation if applicable
            if (reputation.contractAddress) {
                await this.updateOnChainReputation(reputation.contractAddress, newScores.overall);
            }

            const result: InstitutionalReputationUpdate = {
                entityId,
                entityType,
                newScore: newScores.overall,
                factors: newScores.factors,
                recommendations
            };

            // Log AI decision
            await this.logAIDecision('reputation_update', {
                entityId,
                entityType,
                result,
                previousScore: reputation.overallScore
            });

            return result;

        } catch (error) {
            logger.error('NeuralLoyaltyService.updateInstitutionalReputation', { entityId, entityType, error });
            throw error;
        }
    }

    /**
     * Process governance merit token rewards
     */
    async processGovernanceRewards(userId: string, action: string, context: any): Promise<void> {
        try {
            const profile = await this.prisma.governanceProfile.findUnique({
                where: { userId }
            });

            if (!profile) {
                logger.warn('Governance profile not found for merit processing', { userId });
                return;
            }

            // Calculate merit reward using AI
            const meritReward = await this.calculateMeritReward(action, profile, context);

            if (meritReward > 0) {
                // Update profile
                await this.prisma.governanceProfile.update({
                    where: { userId },
                    data: {
                        totalMerit: { increment: meritReward },
                        availableMerit: { increment: meritReward },
                        meritEarned: { increment: meritReward }
                    }
                });

                // Create transaction record
                await this.prisma.neuralLoyaltyTransaction.create({
                    data: {
                        profileId: profile.id,
                        amount: meritReward,
                        type: 'EARN_STREAK', // Mapping to NeuralLoyaltyTxType
                        reason: `AI-calculated reward for ${action}`,
                        description: `Governance merit bonus for action: ${action}`
                    }
                });

                // Log AI decision
                await this.logAIDecision('merit_reward', {
                    userId,
                    action,
                    meritReward,
                    context
                });
            }

        } catch (error) {
            logger.error('NeuralLoyaltyService.processGovernanceRewards', { userId, action, error });
            throw error;
        }
    }

    /**
     * Private helper methods
     */
    private async analyzeUserBehavior(profile: any): Promise<Record<string, number>> {
        // AI analysis of user behavior patterns
        const factors = {
            orderFrequency: 0,
            spendingPattern: 0,
            loyaltyStreak: profile.streakCount / Math.max(profile.maxStreak, 1),
            tierProgress: profile.tierProgress,
            recentActivity: this.calculateRecentActivity(profile.transactions),
            socialEngagement: 0, // Would be calculated from social interactions
            feedbackQuality: 0  // Would be calculated from review sentiments
        };

        // Connect to AI Service for deep behavioral clustering
        try {
            const aiResponse = await fetch(`${process.env.AI_SERVICE_URL}/analyze/behavior`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: profile.userId, factors })
            });
            const aiResult = await aiResponse.json();

            return {
                ...factors,
                behaviorClusterScore: aiResult.behaviorClusterScore || 0.5,
                segment: aiResult.segment || 'STANDARD',
                rewardSensitivity: profile.rewardSensitivity
            };
        } catch (error) {
            logger.error('AI Behavior analysis failed, using fallback', { error });
            return {
                ...factors,
                behaviorClusterScore: 0.5,
                segment: 'STANDARD',
                rewardSensitivity: profile.rewardSensitivity
            };
        }
    }

    private async getChaosEventMultiplier(userId: string): Promise<number> {
        // Check for active chaos events affecting this user
        const activeEvents = await this.prisma.chaosEvent.findMany({
            where: {
                status: 'ACTIVE',
                participants: {
                    some: { userId }
                }
            }
        });

        if (activeEvents.length === 0) return 1.0;

        // Calculate multiplier based on event intensity and user role
        const multipliers = await Promise.all(
            activeEvents.map(async (event) => {
                const participant = await this.prisma.neuralChaosParticipant.findFirst({
                    where: { eventId: event.id, userId }
                });

                return event.intensity * (participant?.participationScore || 1.0);
            })
        );

        return Math.max(...multipliers, 1.0);
    }

    private async generateRewardPrediction(
        profile: any,
        behaviorAnalysis: Record<string, number>,
        chaosMultiplier: number
    ): Promise<LoyaltyPrediction> {
        // AI-powered reward prediction logic
        const baseReward = this.calculateBaseReward(profile, behaviorAnalysis);
        const adjustedReward = baseReward * chaosMultiplier;

        const confidence = Math.min(
            behaviorAnalysis.behaviorClusterScore * 0.8 +
            chaosMultiplier * 0.2,
            1.0
        );

        const reasoning = this.generateRewardReasoning(behaviorAnalysis, chaosMultiplier);

        return {
            userId: profile.userId,
            recommendedReward: this.selectOptimalReward(profile, adjustedReward),
            confidence,
            reasoning,
            behaviorFactors: behaviorAnalysis,
            chaosEventMultiplier: chaosMultiplier > 1 ? chaosMultiplier : undefined
        };
    }

    private async calculateReputationScores(reputation: any): Promise<any> {
        const reviewScore = reputation.reviews.reduce((acc: number, review: any) =>
            acc + (review.rating / 5.0), 0) / Math.max(reputation.reviews.length, 1);

        const incidentPenalty = reputation.incidents.reduce((acc: number, incident: any) =>
            acc + incident.impact, 0);

        const volumeScore = Math.min(reputation.totalOrders / 1000, 1.0); // Normalize
        const successRate = reputation.successfulOrders / Math.max(reputation.totalOrders, 1);

        const trustScore = Math.max(0, successRate - incidentPenalty);
        const qualityScore = reviewScore;
        const overallScore = (trustScore * 0.5 + qualityScore * 0.3 + volumeScore * 0.2);

        // AI-enhanced risk assessment
        const riskLevel = this.calculateRiskLevel(overallScore, incidentPenalty);

        return {
            overall: overallScore,
            trust: trustScore,
            quality: qualityScore,
            volume: volumeScore,
            riskLevel,
            negotiationPriority: overallScore * (1 - incidentPenalty),
            factors: { reviewScore, incidentPenalty, volumeScore, successRate }
        };
    }

    private async calculateMeritReward(action: string, profile: any, context: any): Promise<number> {
        const baseRewards = {
            'vote_cast': 1,
            'proposal_created': 5,
            'proposal_passed': 10,
            'delegation_received': 2,
            'streak_maintained': profile.votingStreak * 0.5
        };

        const baseReward = baseRewards[action as keyof typeof baseRewards] || 1;

        // AI adjustments based on profile and context
        const influenceMultiplier = 1 + (profile.influenceScore * 0.5);
        const streakBonus = Math.min(profile.votingStreak / 10, 2.0);

        return baseReward * influenceMultiplier * streakBonus;
    }

    private async logAIDecision(type: string, data: any): Promise<void> {
        await this.prisma.auditLog.create({
            data: {
                action: `AI_${type.toUpperCase()}`,
                resource: 'ai_decision',
                resourceId: data.userId || data.entityId,
                newValues: data,
                ipAddress: 'system',
                userAgent: 'NeuralLoyaltyService'
            }
        });
    }

    // Helper methods
    private calculateRecentActivity(transactions: any[]): number {
        const recent = transactions.filter(t =>
            t.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
        return recent.length / 30; // Average daily activity
    }

    private async determineBehaviorCluster(factors: Record<string, number>): Promise<any> {
        // Simplified AI clustering logic
        const score = Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length;

        return {
            cluster: score > 0.7 ? 'high_value' : score > 0.4 ? 'engaged' : 'casual',
            confidence: Math.min(score + 0.2, 1.0)
        };
    }

    private calculateBaseReward(profile: any, behavior: Record<string, number>): number {
        const tierMultiplier = profile.currentTier?.pointMultiplier || 1.0;
        const behaviorScore = Object.values(behavior).reduce((a, b) => a + b, 0) / Object.keys(behavior).length;

        return Math.max(10, 50 * tierMultiplier * behaviorScore);
    }

    private selectOptimalReward(profile: any, points: number): string {
        const tier = profile.currentTier?.name?.toLowerCase() || 'bronze';

        if (tier === 'diamond' && points > 500) return 'exclusive_experience';
        if (tier === 'platinum' && points > 300) return 'free_delivery_month';
        if (points > 200) return 'percentage_discount_20';
        if (points > 100) return 'free_delivery';
        return 'bonus_points_50';
    }

    private generateRewardReasoning(behavior: Record<string, number>, chaosMultiplier: number): string[] {
        const reasons = [];

        if (behavior.orderFrequency > 0.7) reasons.push('High order frequency detected');
        if (behavior.loyaltyStreak > 0.8) reasons.push('Strong loyalty streak maintained');
        if (chaosMultiplier > 1.5) reasons.push('Active participation in chaos event');
        if (behavior.behaviorClusterScore > 0.8) reasons.push('AI behavior cluster analysis favorable');

        return reasons.length > 0 ? reasons : ['Standard loyalty program reward'];
    }

    private calculateRiskLevel(score: number, incidents: number): string {
        if (score < 0.3 || incidents > 5) return 'CRITICAL';
        if (score < 0.5 || incidents > 2) return 'HIGH';
        if (score < 0.7 || incidents > 0) return 'MEDIUM';
        return 'LOW';
    }

    private async generateReputationRecommendations(scores: any): Promise<string[]> {
        const recommendations = [];

        if (scores.quality < 0.7) recommendations.push('Improve service quality to boost ratings');
        if (scores.trust < 0.8) recommendations.push('Focus on delivery reliability and communication');
        if (scores.incidentPenalty > 0.2) recommendations.push('Address recent incidents to improve reputation');

        return recommendations;
    }

    private async updateOnChainReputation(contractAddress: string, score: number): Promise<void> {
        // Placeholder for smart contract interaction
        logger.info('On-chain reputation update', { contractAddress, score });
    }

    private mapActionToMeritType(action: string): any {
        const mapping = {
            'vote_cast': 'EARN_VOTE',
            'proposal_created': 'EARN_PROPOSAL',
            'proposal_passed': 'EARN_ACHIEVEMENT',
            'delegation_received': 'EARN_DELEGATION',
            'streak_maintained': 'EARN_STREAK'
        };

        return mapping[action as keyof typeof mapping] || 'EARN_VOTE';
    }

    /**
     * Process real-time ecosystem activity to update loyalty metrics
     */
    async processEcosystemActivity(userId: string, type: 'ORDER' | 'SETTLEMENT' | 'CHAOS', amount: number): Promise<void> {
        try {
            let profile = await this.prisma.neuralLoyaltyProfile.findUnique({
                where: { userId },
                include: { currentTier: true }
            });

            if (!profile) {
                profile = await this.prisma.neuralLoyaltyProfile.create({
                    data: {
                        userId,
                        totalPoints: 0,
                        experiencePoints: 0,
                        neuralScore: 0.5,
                        streakCount: 0
                    },
                    include: { currentTier: true }
                });
            }

            const xpGain = Math.floor(amount * 10);
            const pointsGain = Math.floor(amount * (profile.currentTier?.pointMultiplier || 1.0));

            await this.prisma.neuralLoyaltyProfile.update({
                where: { userId },
                data: {
                    experiencePoints: { increment: xpGain },
                    totalPoints: { increment: pointsGain },
                    streakCount: { increment: 1 },
                    lastActivityAt: new Date()
                }
            });

            await this.prisma.neuralLoyaltyTransaction.create({
                data: {
                    profileId: profile.id,
                    amount: pointsGain,
                    type: type === 'ORDER' ? 'EARN_ORDER' : type === 'CHAOS' ? 'EARN_STREAK' : 'EARN_REFERRAL',
                    reason: `Ecosystem activity: ${type}`,
                    description: `Earned ${pointsGain} points and ${xpGain} XP for ${type.toLowerCase()} activity.`
                }
            });

            await this.checkAchievements(userId, profile.id, type);

        } catch (error) {
            logger.error('NeuralLoyaltyService.processEcosystemActivity', { userId, type, error });
        }
    }

    private async checkAchievements(userId: string, profileId: string, type: string): Promise<void> {
        const achievements = await this.prisma.achievement.findMany();

        for (const achievement of achievements) {
            if (achievement.code === 'FIRST_ORDER' && type === 'ORDER') {
                const existing = await this.prisma.neuralUserAchievement.findFirst({
                    where: { achievementId: achievement.id, userId }
                });

                if (!existing) {
                    await this.prisma.neuralUserAchievement.create({
                        data: {
                            achievementId: achievement.id,
                            userId,
                            loyaltyProfileId: profileId,
                            status: 'COMPLETED',
                            progress: 1.0,
                            unlockedAt: new Date()
                        }
                    });
                }
            }
        }
    }
}
