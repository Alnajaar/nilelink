// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AIBusinessIntelligence
 * @dev AI-powered business intelligence for inventory management and sales optimization
 */
contract AIBusinessIntelligence is Ownable, ReentrancyGuard {
    struct ProductMetrics {
        uint256 productId;
        uint256 currentStock;
        uint256 dailySalesAverage;
        uint256 weeklySalesAverage;
        uint256 monthlySalesAverage;
        uint256 lastRestockDate;
        uint256 stockoutEvents;
        uint256 overstockDays;
        uint256 optimalStockLevel;
        bool isActive;
    }

    struct SalesPrediction {
        uint256 productId;
        uint256 predictedSales;
        uint256 confidence;
        uint256 predictionDate;
        uint256 timeHorizon; // days
    }

    struct RestockRecommendation {
        uint256 productId;
        uint256 recommendedQuantity;
        uint256 urgency; // 1-10 scale
        uint256 estimatedCost;
        uint256 expectedProfit;
        string reasoning;
    }

    mapping(uint256 => ProductMetrics) public productMetrics;
    mapping(uint256 => SalesPrediction[]) public salesPredictions;
    mapping(address => bool) public authorizedManagers;

    uint256 public constant MAX_STOCKOUT_PENALTY = 100;
    uint256 public constant OVERSTOCK_THRESHOLD = 30; // days
    uint256 public constant PREDICTION_CONFIDENCE_THRESHOLD = 70;

    event ProductMetricsUpdated(uint256 indexed productId, uint256 newStock);
    event SalesPredictionGenerated(
        uint256 indexed productId,
        uint256 predictedSales
    );
    event RestockAlert(
        uint256 indexed productId,
        uint256 recommendedQuantity,
        uint256 urgency
    );
    event DeadStockDetected(uint256 indexed productId, uint256 daysOverstock);

    modifier onlyAuthorized() {
        require(
            authorizedManagers[msg.sender] || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Update product sales data for AI analysis
     */
    function updateProductSales(
        uint256 productId,
        uint256 quantitySold,
        uint256 salePrice
    ) external onlyAuthorized {
        ProductMetrics storage metrics = productMetrics[productId];

        if (!metrics.isActive) {
            metrics.productId = productId;
            metrics.isActive = true;
        }

        // Update rolling averages (simplified AI calculation)
        _updateRollingAverages(metrics, quantitySold);

        // Generate sales prediction
        _generateSalesPrediction(productId, metrics);

        // Check for restock needs
        _checkRestockNeeds(metrics);

        emit ProductMetricsUpdated(productId, metrics.currentStock);
    }

    /**
     * @dev Update inventory levels
     */
    function updateInventoryLevel(
        uint256 productId,
        uint256 newStock,
        bool isRestock
    ) external onlyAuthorized {
        ProductMetrics storage metrics = productMetrics[productId];

        if (isRestock) {
            metrics.lastRestockDate = block.timestamp;
            metrics.optimalStockLevel = _calculateOptimalStock(metrics);
        }

        metrics.currentStock = newStock;

        // Check for dead stock
        _detectDeadStock(metrics);

        emit ProductMetricsUpdated(productId, newStock);
    }

    /**
     * @dev AI-powered stock prediction
     */
    function predictStockNeeds(
        uint256 productId,
        uint256 daysAhead
    ) external view returns (uint256 predictedStock, uint256 confidence) {
        ProductMetrics storage metrics = productMetrics[productId];
        require(metrics.isActive, "Product not found");

        // Simple AI prediction based on historical data
        uint256 basePrediction = metrics.dailySalesAverage * daysAhead;

        // Adjust for trends (simplified AI logic)
        uint256 trendAdjustment = _calculateTrendAdjustment(metrics);

        predictedStock = (basePrediction * trendAdjustment) / 100;

        // Calculate confidence based on data availability
        confidence = _calculatePredictionConfidence(metrics);

        return (predictedStock, confidence);
    }

    /**
     * @dev Get restock recommendations
     */
    function getRestockRecommendations(
        uint256 productId
    ) external view returns (RestockRecommendation memory) {
        ProductMetrics storage metrics = productMetrics[productId];
        require(metrics.isActive, "Product not found");

        uint256 recommendedQuantity = 0;
        uint256 urgency = 0;
        string memory reasoning = "";

        // AI logic for restock recommendations
        if (metrics.currentStock == 0) {
            recommendedQuantity = metrics.optimalStockLevel;
            urgency = 10;
            reasoning = "Out of stock - immediate restock required";
        } else if (metrics.currentStock < metrics.dailySalesAverage * 3) {
            recommendedQuantity =
                metrics.optimalStockLevel -
                metrics.currentStock;
            urgency = 8;
            reasoning = "Low stock - risk of stockout";
        } else if (metrics.currentStock > metrics.optimalStockLevel * 2) {
            urgency = 1;
            reasoning = "Overstocked - monitor sales";
        }

        return
            RestockRecommendation({
                productId: productId,
                recommendedQuantity: recommendedQuantity,
                urgency: urgency,
                estimatedCost: 0, // Would be calculated based on supplier data
                expectedProfit: recommendedQuantity *
                    metrics.dailySalesAverage *
                    10, // Simplified
                reasoning: reasoning
            });
    }

    /**
     * @dev Get sales insights
     */
    function getSalesInsights(
        uint256 productId
    )
        external
        view
        returns (
            uint256 avgDailySales,
            uint256 avgWeeklySales,
            uint256 avgMonthlySales,
            uint256 stockoutFrequency,
            uint256 performanceScore
        )
    {
        ProductMetrics storage metrics = productMetrics[productId];
        require(metrics.isActive, "Product not found");

        uint256 performanceScore = _calculatePerformanceScore(metrics);

        return (
            metrics.dailySalesAverage,
            metrics.weeklySalesAverage,
            metrics.monthlySalesAverage,
            metrics.stockoutEvents,
            performanceScore
        );
    }

    /**
     * @dev Internal function to update rolling averages
     */
    function _updateRollingAverages(
        ProductMetrics storage metrics,
        uint256 quantitySold
    ) internal {
        // Simplified rolling average calculation
        metrics.dailySalesAverage =
            (metrics.dailySalesAverage + quantitySold) /
            2;
        metrics.weeklySalesAverage =
            (metrics.weeklySalesAverage * 6 + quantitySold) /
            7;
        metrics.monthlySalesAverage =
            (metrics.monthlySalesAverage * 29 + quantitySold) /
            30;
    }

    /**
     * @dev Generate AI sales prediction
     */
    function _generateSalesPrediction(
        uint256 productId,
        ProductMetrics storage metrics
    ) internal {
        // Simple trend-based prediction
        uint256 predictedSales = metrics.dailySalesAverage;
        uint256 confidence = 75; // Base confidence

        // Adjust based on recent performance
        if (metrics.weeklySalesAverage > metrics.monthlySalesAverage) {
            predictedSales = (predictedSales * 110) / 100; // 10% increase
            confidence += 10;
        } else {
            predictedSales = (predictedSales * 90) / 100; // 10% decrease
            confidence -= 10;
        }

        salesPredictions[productId].push(
            SalesPrediction({
                productId: productId,
                predictedSales: predictedSales,
                confidence: confidence,
                predictionDate: block.timestamp,
                timeHorizon: 7 // 7 days
            })
        );

        emit SalesPredictionGenerated(productId, predictedSales);
    }

    /**
     * @dev Check if restock is needed
     */
    function _checkRestockNeeds(ProductMetrics storage metrics) internal {
        uint256 productId = metrics.productId;

        if (metrics.currentStock < metrics.dailySalesAverage * 2) {
            RestockRecommendation memory rec = this.getRestockRecommendations(
                productId
            );
            if (rec.urgency >= 5) {
                emit RestockAlert(
                    productId,
                    rec.recommendedQuantity,
                    rec.urgency
                );
            }
        }
    }

    /**
     * @dev Detect dead stock
     */
    function _detectDeadStock(ProductMetrics storage metrics) internal {
        uint256 daysSinceLastSale = (block.timestamp -
            metrics.lastRestockDate) / 86400;

        if (
            daysSinceLastSale > OVERSTOCK_THRESHOLD &&
            metrics.currentStock > metrics.optimalStockLevel
        ) {
            metrics.overstockDays = daysSinceLastSale;
            emit DeadStockDetected(metrics.productId, daysSinceLastSale);
        }
    }

    /**
     * @dev Calculate optimal stock level using AI
     */
    function _calculateOptimalStock(
        ProductMetrics storage metrics
    ) internal view returns (uint256) {
        // AI-based calculation considering sales velocity and variability
        uint256 baseStock = metrics.dailySalesAverage * 7; // 7-day supply

        // Adjust for stockout history
        uint256 stockoutPenalty = metrics.stockoutEvents * 2;
        if (stockoutPenalty > MAX_STOCKOUT_PENALTY) {
            stockoutPenalty = MAX_STOCKOUT_PENALTY;
        }

        return baseStock + ((baseStock * stockoutPenalty) / 100);
    }

    /**
     * @dev Calculate trend adjustment for predictions
     */
    function _calculateTrendAdjustment(
        ProductMetrics storage metrics
    ) internal view returns (uint256) {
        // Simplified trend analysis
        if (
            metrics.weeklySalesAverage >
            (metrics.monthlySalesAverage * 105) / 100
        ) {
            return 110; // 10% upward trend
        } else if (
            metrics.weeklySalesAverage <
            (metrics.monthlySalesAverage * 95) / 100
        ) {
            return 90; // 10% downward trend
        }
        return 100; // No significant trend
    }

    /**
     * @dev Calculate prediction confidence
     */
    function _calculatePredictionConfidence(
        ProductMetrics storage metrics
    ) internal view returns (uint256) {
        uint256 confidence = 50; // Base confidence

        // Increase confidence with more data
        if (metrics.dailySalesAverage > 0) confidence += 20;
        if (metrics.weeklySalesAverage > 0) confidence += 15;
        if (metrics.monthlySalesAverage > 0) confidence += 15;

        // Reduce confidence with high variability or stockouts
        if (metrics.stockoutEvents > 5) confidence -= 20;

        return confidence > 100 ? 100 : confidence;
    }

    /**
     * @dev Calculate product performance score
     */
    function _calculatePerformanceScore(
        ProductMetrics storage metrics
    ) internal view returns (uint256) {
        uint256 score = 50; // Base score

        // Sales performance
        if (metrics.dailySalesAverage > 10) score += 20;
        if (metrics.weeklySalesAverage > 50) score += 15;

        // Inventory efficiency
        if (metrics.stockoutEvents == 0) score += 10;
        if (metrics.overstockDays < 7) score += 5;

        return score > 100 ? 100 : score;
    }

    /**
     * @dev Authorize manager for data updates
     */
    function authorizeManager(address manager) external onlyOwner {
        authorizedManagers[manager] = true;
    }

    /**
     * @dev Remove manager authorization
     */
    function revokeManager(address manager) external onlyOwner {
        authorizedManagers[manager] = false;
    }
}
