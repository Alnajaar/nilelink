// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PredictiveThreatModel
 * @notice AI-powered predictive threat modeling system
 * @dev Analyzes patterns to predict future attack evolutions
 */
contract PredictiveThreatModel is Ownable {
    constructor() Ownable(msg.sender) {}

    struct ThreatPrediction {
        bytes32 predictionId;
        bytes32 basePattern;
        bytes32[] predictedEvolutions;
        uint256 confidence; // 0-10000
        uint256 timeHorizon; // seconds into future
        uint256 predictedAt;
        bool realized;
    }

    struct PatternEvolution {
        bytes32 fromPattern;
        bytes32 toPattern;
        uint256 transitionCount;
        uint256 successRate; // How often this evolution succeeds
        uint256 lastObserved;
    }

    mapping(bytes32 => ThreatPrediction[]) public patternPredictions;
    mapping(bytes32 => PatternEvolution[]) public patternEvolutions;
    mapping(bytes32 => bytes32) public patternTransitions; // from -> to

    bytes32[] public monitoredPatterns;
    bytes32[] public activePredictions;

    uint256 public predictionAccuracy = 7500; // 75% initial accuracy
    uint256 public totalPredictions;
    uint256 public accuratePredictions;

    event PredictionMade(
        bytes32 indexed basePattern,
        bytes32[] predictedPatterns,
        uint256 confidence
    );
    event PredictionRealized(bytes32 indexed predictionId, bool accurate);
    event PatternEvolutionObserved(
        bytes32 indexed fromPattern,
        bytes32 indexed toPattern
    );

    /**
     * @notice Predict how an attack pattern might evolve
     * @param basePattern The current attack pattern
     * @return predictions Array of predicted evolved patterns
     */
    function predictEvolution(
        bytes32 basePattern
    ) external view returns (bytes32[] memory predictions) {
        PatternEvolution[] storage evolutions = patternEvolutions[basePattern];

        if (evolutions.length == 0) {
            // No historical data, return base pattern variations
            predictions = new bytes32[](3);
            predictions[0] = keccak256(
                abi.encodePacked(basePattern, "variant_1")
            );
            predictions[1] = keccak256(
                abi.encodePacked(basePattern, "variant_2")
            );
            predictions[2] = keccak256(
                abi.encodePacked(basePattern, "variant_3")
            );
            return predictions;
        }

        // Return most likely evolutions based on historical success rates
        predictions = new bytes32[](evolutions.length);
        for (uint256 i = 0; i < evolutions.length; i++) {
            predictions[i] = evolutions[i].toPattern;
        }

        return predictions;
    }

    /**
     * @notice Record an observed pattern evolution
     * @param fromPattern Original pattern
     * @param toPattern Evolved pattern
     * @param successRate How successful the evolution was
     */
    function recordPatternEvolution(
        bytes32 fromPattern,
        bytes32 toPattern,
        uint256 successRate
    ) external onlyOwner {
        require(successRate <= 10000, "Invalid success rate");

        PatternEvolution[] storage evolutions = patternEvolutions[fromPattern];

        // Check if this evolution already exists
        for (uint256 i = 0; i < evolutions.length; i++) {
            if (evolutions[i].toPattern == toPattern) {
                // Update existing evolution
                evolutions[i].transitionCount++;
                evolutions[i].successRate =
                    (evolutions[i].successRate *
                        (evolutions[i].transitionCount - 1) +
                        successRate) /
                    evolutions[i].transitionCount;
                evolutions[i].lastObserved = block.timestamp;
                return;
            }
        }

        // New evolution
        evolutions.push(
            PatternEvolution({
                fromPattern: fromPattern,
                toPattern: toPattern,
                transitionCount: 1,
                successRate: successRate,
                lastObserved: block.timestamp
            })
        );

        // Add to monitored patterns if not already there
        if (!_containsPattern(fromPattern, monitoredPatterns)) {
            monitoredPatterns.push(fromPattern);
        }

        emit PatternEvolutionObserved(fromPattern, toPattern);
    }

    /**
     * @notice Create a threat prediction
     * @param basePattern Pattern to predict evolution for
     * @param predictedPatterns Array of predicted evolved patterns
     * @param confidence Prediction confidence (0-10000)
     * @param timeHorizon How far into the future this prediction applies
     */
    function createPrediction(
        bytes32 basePattern,
        bytes32[] calldata predictedPatterns,
        uint256 confidence,
        uint256 timeHorizon
    ) external onlyOwner {
        require(confidence <= 10000, "Invalid confidence");

        bytes32 predictionId = keccak256(
            abi.encodePacked(basePattern, predictedPatterns, block.timestamp)
        );

        ThreatPrediction memory prediction = ThreatPrediction({
            predictionId: predictionId,
            basePattern: basePattern,
            predictedEvolutions: predictedPatterns,
            confidence: confidence,
            timeHorizon: timeHorizon,
            predictedAt: block.timestamp,
            realized: false
        });

        patternPredictions[basePattern].push(prediction);
        activePredictions.push(predictionId);

        totalPredictions++;

        emit PredictionMade(basePattern, predictedPatterns, confidence);
    }

    /**
     * @notice Mark a prediction as realized (accurate or not)
     * @param predictionId The prediction ID
     * @param realized Whether the prediction came true
     */
    function markPredictionRealized(
        bytes32 predictionId,
        bool realized
    ) external onlyOwner {
        // Find and update the prediction
        for (uint256 i = 0; i < activePredictions.length; i++) {
            if (activePredictions[i] == predictionId) {
                // Find the prediction in patternPredictions
                for (uint256 j = 0; j < monitoredPatterns.length; j++) {
                    ThreatPrediction[] storage predictions = patternPredictions[
                        monitoredPatterns[j]
                    ];
                    for (uint256 k = 0; k < predictions.length; k++) {
                        if (predictions[k].predictionId == predictionId) {
                            predictions[k].realized = realized;
                            if (realized) {
                                accuratePredictions++;
                                _updateAccuracy();
                            }

                            // Remove from active predictions
                            activePredictions[i] = activePredictions[
                                activePredictions.length - 1
                            ];
                            activePredictions.pop();

                            emit PredictionRealized(predictionId, realized);
                            return;
                        }
                    }
                }
            }
        }
    }

    /**
     * @notice Get prediction statistics
     */
    function getPredictionStats()
        external
        view
        returns (
            uint256 total,
            uint256 accurate,
            uint256 accuracy,
            uint256 activeCount
        )
    {
        return (
            totalPredictions,
            accuratePredictions,
            predictionAccuracy,
            activePredictions.length
        );
    }

    /**
     * @notice Get pattern evolution history
     * @param pattern The pattern to query
     */
    function getPatternEvolutions(
        bytes32 pattern
    )
        external
        view
        returns (
            bytes32[] memory toPatterns,
            uint256[] memory transitionCounts,
            uint256[] memory successRates
        )
    {
        PatternEvolution[] storage evolutions = patternEvolutions[pattern];

        toPatterns = new bytes32[](evolutions.length);
        transitionCounts = new uint256[](evolutions.length);
        successRates = new uint256[](evolutions.length);

        for (uint256 i = 0; i < evolutions.length; i++) {
            toPatterns[i] = evolutions[i].toPattern;
            transitionCounts[i] = evolutions[i].transitionCount;
            successRates[i] = evolutions[i].successRate;
        }

        return (toPatterns, transitionCounts, successRates);
    }

    /**
     * @dev Update prediction accuracy based on results
     */
    function _updateAccuracy() internal {
        if (totalPredictions > 0) {
            predictionAccuracy =
                (accuratePredictions * 10000) /
                totalPredictions;
        }
    }

    /**
     * @dev Check if a pattern exists in an array
     */
    function _containsPattern(
        bytes32 pattern,
        bytes32[] memory array
    ) internal pure returns (bool) {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == pattern) {
                return true;
            }
        }
        return false;
    }
}
