// ============================================================================
// NILELINK POS - NAVIGATION TYPES
// The Most Advanced POS Navigation System Ever Built
// ============================================================================

export type UserRole = 'OWNER' | 'MANAGER' | 'CHEF' | 'SERVER' | 'CASHIER' | 'BARISTA';

export type RestaurantMode =
    | 'CLOSED'
    | 'OPENING_PREP'
    | 'OPEN'
    | 'CLOSING'
    | 'MAINTENANCE'
    | 'EMERGENCY';

export type NavigationContext =
    | 'MORNING_PREP'
    | 'PEAK_OPERATIONS'
    | 'EVENING_CLOSE'
    | 'SLOW_PERIOD'
    | 'EVENT_MODE'
    | 'TRAINING_MODE';

export interface NavigationState {
    currentScreen: string;
    previousScreens: string[];
    navigationHistory: NavigationHistoryItem[];
    userRole: UserRole;
    restaurantMode: RestaurantMode;
    navigationContext: NavigationContext;
    activeTabs: string[];
    quickActions: QuickAction[];
    aiSuggestions: AiSuggestion[];
    urgentAlerts: UrgentAlert[];
}

export interface NavigationHistoryItem {
    screenId: string;
    timestamp: number;
    context: NavigationContext;
    userIntent?: string;
}

export interface QuickAction {
    id: string;
    label: string;
    icon: string;
    screenId: string;
    priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
    context: NavigationContext[];
    shortcut?: string; // Keyboard shortcut or gesture
}

export interface AiSuggestion {
    id: string;
    type: 'ACTION' | 'ALERT' | 'INSIGHT' | 'AUTOMATION';
    title: string;
    description: string;
    confidence: number; // 0-1
    action?: {
        screenId: string;
        params?: Record<string, any>;
    };
    dismissible: boolean;
    expiresAt?: number;
}

export interface UrgentAlert {
    id: string;
    type: 'INVENTORY' | 'ORDER' | 'STAFF' | 'FINANCIAL' | 'SYSTEM';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    message: string;
    actionRequired: boolean;
    actionScreenId?: string;
    autoResolve?: boolean;
    createdAt: number;
}

// ============================================================================
// SCREEN DEFINITIONS
// Each screen represents a complete workflow context
// ============================================================================

export interface ScreenDefinition {
    id: string;
    name: string;
    category: ScreenCategory;
    roles: UserRole[];
    contexts: NavigationContext[];
    priority: number; // Higher = more important
    estimatedDuration: number; // Minutes to complete task
    dependsOn?: string[]; // Other screens this depends on
    provides?: string[]; // Data/context this screen provides
    offlineCapable: boolean;
    requiresNetwork?: boolean;
    aiEnhanced: boolean;
    voiceCommands?: string[];
    keyboardShortcuts?: Record<string, string>;
}

export type ScreenCategory =
    | 'AUTHENTICATION'
    | 'OPERATIONS'
    | 'MANAGEMENT'
    | 'ANALYTICS'
    | 'SETTINGS'
    | 'MAINTENANCE'
    | 'EMERGENCY';

// ============================================================================
// WORKFLOW DEFINITIONS
// Complete user journeys through the POS system
// ============================================================================

export interface WorkflowDefinition {
    id: string;
    name: string;
    description: string;
    trigger: WorkflowTrigger;
    steps: WorkflowStep[];
    estimatedDuration: number;
    successMetrics: string[];
    fallbackWorkflows?: string[];
}

export interface WorkflowStep {
    id: string;
    screenId: string;
    order: number;
    required: boolean;
    conditional?: WorkflowCondition;
    timeout?: number; // Auto-advance after X seconds
    voicePrompt?: string;
}

export interface WorkflowCondition {
    type: 'TIME' | 'DATA' | 'USER_CHOICE' | 'SYSTEM_STATE';
    condition: string;
    value: any;
}

export type WorkflowTrigger =
    | 'TIME_BASED' // Morning prep, evening close
    | 'EVENT_BASED' // New order, low inventory
    | 'USER_INITIATED' // Manual workflow start
    | 'AI_RECOMMENDED' // System suggests workflow
    | 'EMERGENCY'; // System detects emergency

// ============================================================================
// NAVIGATION RULES ENGINE
// Context-aware navigation intelligence
// ============================================================================

export interface NavigationRule {
    id: string;
    name: string;
    conditions: NavigationCondition[];
    actions: NavigationAction[];
    priority: number;
    active: boolean;
}

export interface NavigationCondition {
    type: 'TIME' | 'LOCATION' | 'USER_ROLE' | 'SYSTEM_STATE' | 'BUSINESS_METRICS';
    operator: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'BETWEEN';
    value: any;
    context?: NavigationContext;
}

export interface NavigationAction {
    type: 'SHOW_SCREEN' | 'HIDE_SCREEN' | 'ENABLE_FEATURE' | 'DISABLE_FEATURE' | 'SHOW_ALERT' | 'SEND_NOTIFICATION';
    target: string;
    params?: Record<string, any>;
}

// ============================================================================
// VOICE & GESTURE NAVIGATION
// Natural interaction patterns
// ============================================================================

export interface VoiceCommand {
    command: string;
    intent: string;
    screenId: string;
    params?: Record<string, any>;
    confidence: number;
    context: NavigationContext[];
}

export interface GesturePattern {
    pattern: string; // e.g., "swipe_right", "double_tap", "pinch"
    intent: string;
    screenId: string;
    sensitivity: number;
    context: NavigationContext[];
}

// ============================================================================
// ACCESSIBILITY & PREFERENCES
// Inclusive design for all users
// ============================================================================

export interface AccessibilityPreferences {
    fontSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';
    colorScheme: 'LIGHT' | 'DARK' | 'HIGH_CONTRAST' | 'COLOR_BLIND_FRIENDLY';
    voiceGuidance: boolean;
    hapticFeedback: boolean;
    largeTouchTargets: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
    gestureNavigation: boolean;
}

export interface NavigationPreferences {
    defaultLandingScreen: string;
    quickActionLayout: 'GRID' | 'LIST' | 'RADIAL';
    notificationStyle: 'TOAST' | 'BANNER' | 'MODAL';
    transitionStyle: 'SLIDE' | 'FADE' | 'SCALE';
    autoAdvanceWorkflows: boolean;
    predictiveNavigation: boolean;
    voiceActivation: boolean;
}

// ============================================================================
// ANALYTICS & LEARNING
// System learns from user behavior
// ============================================================================

export interface NavigationAnalytics {
    screenViews: ScreenViewEvent[];
    workflowCompletions: WorkflowCompletionEvent[];
    userPatterns: UserPattern[];
    performanceMetrics: PerformanceMetric[];
    aiSuggestions: AiSuggestion[];
}

export interface ScreenViewEvent {
    screenId: string;
    timestamp: number;
    duration: number;
    context: NavigationContext;
    userRole: UserRole;
    previousScreen?: string;
    nextScreen?: string;
    interactions: InteractionEvent[];
}

export interface WorkflowCompletionEvent {
    workflowId: string;
    startedAt: number;
    completedAt: number;
    success: boolean;
    skippedSteps: string[];
    timePerStep: Record<string, number>;
}

export interface UserPattern {
    patternId: string;
    type: 'SCREEN_SEQUENCE' | 'TIME_BASED' | 'CONTEXT_BASED';
    frequency: number;
    confidence: number;
    lastObserved: number;
}

export interface PerformanceMetric {
    metric: string;
    value: number;
    timestamp: number;
    context: NavigationContext;
}

export interface InteractionEvent {
    type: 'TAP' | 'SWIPE' | 'VOICE' | 'KEYBOARD' | 'GESTURE';
    target: string;
    timestamp: number;
    duration?: number;
    success: boolean;
}