// SCER Rating Algorithm Implementation
// Based on Software Carbon Efficiency Rating Specification for LLMs

class SCERRatingCalculator {
    constructor() {
        // Emission factors by region (kg CO2e per kWh)
        this.emissionFactors = {
            'global': 0.475,
            'us': 0.385,
            'eu': 0.276,
            'china': 0.581,
            'india': 0.708,
            'japan': 0.471,
            'canada': 0.120,
            'australia': 0.680,
            'brazil': 0.087
        };
        
        // Default emission factor if region not specified
        this.defaultEmissionFactor = this.emissionFactors.global;
        
        // SCER rating thresholds (tokens per kWh)
        this.ratingThresholds = {
            'A': 2500,    // Excellent
            'B': 1800,    // Good
            'C': 1200,    // Average
            'D': 600      // Poor
            // Below 600 is E (Very Poor)
        };
        
        // Performance benchmarks weights
        this.benchmarkWeights = {
            'arc': 0.16,      // AI2 Reasoning Challenge
            'hellaswag': 0.17, // Commonsense Inference
            'mmlu': 0.17,     // Massive Multi-Task Language Understanding
            'truthfulqa': 0.17, // Truthfulness
            'winogrande': 0.16, // Winograd Schema Challenge
            'gsm8k': 0.17     // Grade School Math
        };
    }

    /**
     * Calculate tokens per kilowatt-hour
     * @param {number} totalTokens - Total tokens generated
     * @param {number} energyConsumedKwh - Energy consumed in kWh
     * @returns {number} Tokens per kWh
     */
    calculateTokensPerKwh(totalTokens, energyConsumedKwh) {
        if (energyConsumedKwh <= 0) {
            throw new Error('Energy consumption must be greater than 0');
        }
        return totalTokens / energyConsumedKwh;
    }

    /**
     * Calculate CO2 equivalent emissions per 1000 tokens
     * @param {number} energyConsumedKwh - Energy consumed in kWh
     * @param {string} region - Geographic region for emission factor
     * @param {number} totalTokens - Total tokens generated
     * @returns {number} CO2e per 1000 tokens in grams
     */
    calculateCO2ePer1kTokens(energyConsumedKwh, region = 'global', totalTokens) {
        const emissionFactor = this.emissionFactors[region.toLowerCase()] || this.defaultEmissionFactor;
        const totalCO2eKg = energyConsumedKwh * emissionFactor;
        const totalCO2eGrams = totalCO2eKg * 1000; // Convert to grams
        const co2ePer1kTokens = (totalCO2eGrams / totalTokens) * 1000;
        return co2ePer1kTokens;
    }

    /**
     * Get SCER rating based on carbon efficiency (CO₂e per 1k tokens)
     * @param {number} co2ePer1kTokens - CO₂e per 1000 tokens in grams
     * @param {number[]} allCO2ePer1kTokens - Array of all CO₂e per 1k tokens values in dataset
     * @returns {string} SCER rating (A, B, C, D, or E)
     */
    getSCERRating(co2ePer1kTokens, allCO2ePer1kTokens = []) {
        // If no comparison data, use absolute thresholds (lower CO₂e is better)
        if (allCO2ePer1kTokens.length === 0) {
            // Carbon efficiency thresholds (grams CO₂e per 1k tokens)
            if (co2ePer1kTokens <= 15) {
                return 'A'; // Excellent: ≤15g CO₂e/1k tokens
            } else if (co2ePer1kTokens <= 25) {
                return 'B'; // Good: 15-25g CO₂e/1k tokens
            } else if (co2ePer1kTokens <= 40) {
                return 'C'; // Average: 25-40g CO₂e/1k tokens
            } else if (co2ePer1kTokens <= 60) {
                return 'D'; // Poor: 40-60g CO₂e/1k tokens
            } else {
                return 'E'; // Very Poor: >60g CO₂e/1k tokens
            }
        }

        // Relative rating based on percentile distribution (lower CO₂e is better)
        const sorted = [...allCO2ePer1kTokens].sort((a, b) => a - b);
        const total = sorted.length;
        
        // Find percentile of current model (lower CO₂e = better percentile)
        let rank = sorted.findIndex(val => val >= co2ePer1kTokens);
        if (rank === -1) rank = total;
        const percentile = (total - rank) / total;

        // Assign ratings based on percentile distribution
        // Top 20% (lowest CO₂e) = A, 20-40% = B, 40-60% = C, 60-80% = D, Bottom 20% = E
        if (percentile >= 0.8) {
            return 'A';
        } else if (percentile >= 0.6) {
            return 'B';
        } else if (percentile >= 0.4) {
            return 'C';
        } else if (percentile >= 0.2) {
            return 'D';
        } else {
            return 'E';
        }
    }

    /**
     * Calculate performance score from benchmarks
     * @param {Object} benchmarks - Benchmark scores object
     * @returns {number} Weighted average performance score (0-100)
     */
    calculatePerformanceScore(benchmarks) {
        let weightedSum = 0;
        let totalWeight = 0;

        for (const [benchmark, score] of Object.entries(benchmarks)) {
            const weight = this.benchmarkWeights[benchmark.toLowerCase()];
            if (weight && typeof score === 'number') {
                weightedSum += score * weight;
                totalWeight += weight;
            }
        }

        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    /**
     * Calculate composite SCER score (70% efficiency + 30% performance)
     * @param {number} tokensPerKwh - Tokens per kWh
     * @param {number} performanceScore - Performance score (0-100)
     * @returns {number} Composite score (0-100)
     */
    calculateCompositeScore(tokensPerKwh, performanceScore) {
        // Normalize efficiency score (0-100 scale)
        // Using 5000 tokens/kWh as the maximum for normalization
        const maxTokensPerKwh = 5000;
        const efficiencyScore = Math.min((tokensPerKwh / maxTokensPerKwh) * 100, 100);
        
        // Weighted composite: 70% efficiency + 30% performance
        const compositeScore = (efficiencyScore * 0.7) + (performanceScore * 0.3);
        return Math.round(compositeScore * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Calculate energy efficiency improvement percentage
     * @param {number} currentTokensPerKwh - Current model efficiency
     * @param {number} baselineTokensPerKwh - Baseline model efficiency
     * @returns {number} Improvement percentage
     */
    calculateEfficiencyImprovement(currentTokensPerKwh, baselineTokensPerKwh) {
        if (baselineTokensPerKwh <= 0) {
            throw new Error('Baseline efficiency must be greater than 0');
        }
        return ((currentTokensPerKwh - baselineTokensPerKwh) / baselineTokensPerKwh) * 100;
    }

    /**
     * Calculate carbon savings compared to baseline
     * @param {number} currentCO2ePer1kTokens - Current model CO2e per 1k tokens
     * @param {number} baselineCO2ePer1kTokens - Baseline model CO2e per 1k tokens
     * @param {number} monthlyTokens - Monthly token usage
     * @returns {Object} Carbon savings information
     */
    calculateCarbonSavings(currentCO2ePer1kTokens, baselineCO2ePer1kTokens, monthlyTokens) {
        const monthlyCO2eCurrent = (currentCO2ePer1kTokens * monthlyTokens) / 1000;
        const monthlyCO2eBaseline = (baselineCO2ePer1kTokens * monthlyTokens) / 1000;
        const monthlySavings = monthlyCO2eBaseline - monthlyCO2eCurrent;
        const annualSavings = monthlySavings * 12;
        const savingsPercentage = (monthlySavings / monthlyCO2eBaseline) * 100;

        return {
            monthlySavingsKg: monthlySavings / 1000,
            annualSavingsKg: annualSavings / 1000,
            savingsPercentage: Math.round(savingsPercentage * 100) / 100,
            equivalentTreesPlanted: Math.round(annualSavings / 21000), // 21kg CO2 per tree per year
            equivalentCarKm: Math.round(annualSavings / 0.12) // 0.12kg CO2 per km driven
        };
    }

    /**
     * Get rating description and color information
     * @param {string} rating - SCER rating (A, B, C, D, E)
     * @returns {Object} Rating metadata
     */
    getRatingMetadata(rating) {
        const metadata = {
            'A': {
                description: 'Excellent',
                color: '#00C851',
                bgColor: 'rgba(0, 200, 81, 0.2)',
                message: 'Outstanding carbon efficiency with minimal environmental impact',
                recommendation: 'Highly recommended for sustainable AI deployment'
            },
            'B': {
                description: 'Good',
                color: '#8BC34A',
                bgColor: 'rgba(139, 195, 74, 0.2)',
                message: 'Strong carbon efficiency with good environmental performance',
                recommendation: 'Recommended for most use cases'
            },
            'C': {
                description: 'Average',
                color: '#FFC107',
                bgColor: 'rgba(255, 193, 7, 0.2)',
                message: 'Moderate carbon efficiency with room for improvement',
                recommendation: 'Acceptable but consider more efficient alternatives'
            },
            'D': {
                description: 'Poor',
                color: '#FF9800',
                bgColor: 'rgba(255, 152, 0, 0.2)',
                message: 'Low carbon efficiency with significant environmental impact',
                recommendation: 'Not recommended unless specific requirements demand it'
            },
            'E': {
                description: 'Very Poor',
                color: '#F44336',
                bgColor: 'rgba(244, 67, 54, 0.2)',
                message: 'Very low carbon efficiency with high environmental impact',
                recommendation: 'Avoid for sustainable AI deployment'
            }
        };

        return metadata[rating] || metadata['E'];
    }

    /**
     * Comprehensive model evaluation
     * @param {Object} modelData - Model data object
     * @param {number[]} allTokensPerKwh - Array of all tokens per kWh values for relative rating
     * @returns {Object} Complete evaluation results
     */
    evaluateModel(modelData, allTokensPerKwh = []) {
        const {
            totalTokens,
            energyConsumedKwh,
            region = 'global',
            benchmarks,
            monthlyTokens = 1000000 // Default 1M tokens/month
        } = modelData;

        // Calculate core metrics
        const tokensPerKwh = this.calculateTokensPerKwh(totalTokens, energyConsumedKwh);
        const co2ePer1kTokens = this.calculateCO2ePer1kTokens(energyConsumedKwh, region, totalTokens);

        // Calculate all CO2e values for relative rating
        const allCO2ePer1kTokens = allTokensPerKwh.map(tpk => {
            // Convert tokens/kWh back to CO2e/1k tokens for rating
            const emissionFactor = this.emissionFactors[region.toLowerCase()] || this.defaultEmissionFactor;
            const energyPer1kTokens = 1000 / tpk; // kWh per 1k tokens
            return energyPer1kTokens * emissionFactor * 1000; // Convert to grams
        });

        const scerRating = this.getSCERRating(co2ePer1kTokens, allCO2ePer1kTokens);
        const performanceScore = benchmarks ? this.calculatePerformanceScore(benchmarks) : 0;
        const compositeScore = this.calculateCompositeScore(tokensPerKwh, performanceScore);

        // Get rating metadata
        const ratingMetadata = this.getRatingMetadata(scerRating);

        // Calculate carbon savings vs average model (C-rated baseline)
        const baselineCO2ePer1kTokens = 35; // Approximate for C-rated model
        const carbonSavings = this.calculateCarbonSavings(co2ePer1kTokens, baselineCO2ePer1kTokens, monthlyTokens);

        return {
            efficiency: {
                tokensPerKwh: Math.round(tokensPerKwh * 100) / 100,
                co2ePer1kTokens: Math.round(co2ePer1kTokens * 100) / 100,
                energyConsumedKwh: Math.round(energyConsumedKwh * 1000) / 1000
            },
            rating: {
                scerRating,
                description: ratingMetadata.description,
                color: ratingMetadata.color,
                bgColor: ratingMetadata.bgColor,
                message: ratingMetadata.message,
                recommendation: ratingMetadata.recommendation
            },
            performance: {
                score: Math.round(performanceScore * 100) / 100,
                benchmarks: benchmarks || {}
            },
            composite: {
                score: compositeScore,
                rank: this.getCompositeRank(compositeScore)
            },
            environmental: {
                carbonSavings,
                region,
                emissionFactor: this.emissionFactors[region.toLowerCase()] || this.defaultEmissionFactor
            }
        };
    }

    /**
     * Batch evaluate all models with relative ratings by category
     * @param {Array} modelsData - Array of model data objects
     * @returns {Array} Array of evaluated models with relative ratings
     */
    evaluateAllModels(modelsData) {
        // Group models by category
        const modelsByCategory = {};
        modelsData.forEach(model => {
            if (!modelsByCategory[model.category]) {
                modelsByCategory[model.category] = [];
            }
            modelsByCategory[model.category].push(model);
        });

        // Evaluate each model with relative ratings within its category
        return modelsData.map(model => {
            const categoryModels = modelsByCategory[model.category];
            const categoryTokensPerKwh = categoryModels.map(m => 
                this.calculateTokensPerKwh(m.totalTokens, m.energyConsumedKwh)
            );
            
            const evaluation = this.evaluateModel(model, categoryTokensPerKwh);
            return {
                ...model,
                ...evaluation
            };
        });
    }

    /**
     * Evaluate models with relative ratings for a specific category
     * @param {Array} modelsData - Array of model data objects
     * @param {string} category - Category to evaluate within
     * @returns {Array} Array of evaluated models with relative ratings
     */
    evaluateModelsByCategory(modelsData, category) {
        // Filter models by category
        const categoryModels = category === 'all' ? modelsData : 
            modelsData.filter(model => model.category === category);

        // Extract tokens per kWh values for relative rating within category
        const categoryTokensPerKwh = categoryModels.map(model => 
            this.calculateTokensPerKwh(model.totalTokens, model.energyConsumedKwh)
        );

        // Evaluate each model with relative ratings
        return categoryModels.map(model => {
            const evaluation = this.evaluateModel(model, categoryTokensPerKwh);
            return {
                ...model,
                ...evaluation
            };
        });
    }

    /**
     * Get composite score rank
     * @param {number} compositeScore - Composite score (0-100)
     * @returns {string} Rank description
     */
    getCompositeRank(compositeScore) {
        if (compositeScore >= 90) return 'Exceptional';
        if (compositeScore >= 80) return 'Excellent';
        if (compositeScore >= 70) return 'Very Good';
        if (compositeScore >= 60) return 'Good';
        if (compositeScore >= 50) return 'Average';
        if (compositeScore >= 40) return 'Below Average';
        if (compositeScore >= 30) return 'Poor';
        return 'Very Poor';
    }

    /**
     * Compare two models
     * @param {Object} model1 - First model evaluation
     * @param {Object} model2 - Second model evaluation
     * @returns {Object} Comparison results
     */
    compareModels(model1, model2) {
        const efficiencyImprovement = this.calculateEfficiencyImprovement(
            model1.efficiency.tokensPerKwh,
            model2.efficiency.tokensPerKwh
        );

        const carbonReduction = ((model2.efficiency.co2ePer1kTokens - model1.efficiency.co2ePer1kTokens) / 
                                model2.efficiency.co2ePer1kTokens) * 100;

        return {
            efficiencyImprovement: Math.round(efficiencyImprovement * 100) / 100,
            carbonReduction: Math.round(carbonReduction * 100) / 100,
            performanceDifference: Math.round((model1.performance.score - model2.performance.score) * 100) / 100,
            compositeDifference: Math.round((model1.composite.score - model2.composite.score) * 100) / 100,
            winner: model1.composite.score > model2.composite.score ? model1 : model2
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SCERRatingCalculator;
} else if (typeof window !== 'undefined') {
    window.SCERRatingCalculator = SCERRatingCalculator;
}