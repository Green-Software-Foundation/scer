// ML.ENERGY Leaderboard Data Adapter for SCER LLM Tool
// Fetches and transforms data from ML.ENERGY leaderboard

class MLEnergyAdapter {
    constructor() {
        // ML.ENERGY data from GitHub repository (updated regularly)
        this.githubRawUrl = 'https://raw.githubusercontent.com/ml-energy/leaderboard/master/data';
        this.githubApiUrl = 'https://api.github.com/repos/ml-energy/leaderboard/contents/data';
        this.dataPath = 'llm_text_generation/chat';
        this.gpu = 'A100-SXM4-40GB'; // Default GPU for benchmarks
        this.sourceName = 'ML.ENERGY Leaderboard';
        this.sourceUrl = 'https://ml.energy/leaderboard/';
        this.dataUrl = 'https://github.com/ml-energy/leaderboard/tree/master/data/llm_text_generation/chat';
        this.fallbackData = null;
        this.lastError = null;
    }

    /**
     * Fetch models list from ML.ENERGY GitHub repository
     */
    async fetchModelsList() {
        try {
            const url = `${this.githubRawUrl}/${this.dataPath}/models.json`;
            console.log(`Fetching models list from: ${url}`);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const models = await response.json();
            return models;
        } catch (error) {
            console.error('Error fetching models list:', error);
            throw error;
        }
    }

    /**
     * Fetch benchmark data for a specific model
     */
    async fetchModelData(modelPath, batchSize = 'bs128+tp1+pp1') {
        try {
            // Convert model path to directory structure
            // e.g., "meta-llama/Meta-Llama-3.1-8B-Instruct"
            const [org, modelName] = modelPath.split('/');
            const url = `${this.githubRawUrl}/${this.dataPath}/${this.gpu}/${org}/${modelName}/${batchSize}.json`;

            const response = await fetch(url);
            if (!response.ok) {
                // Silently skip 404s - model data not available for this config
                if (response.status === 404) {
                    return null;
                }
                console.warn(`Error fetching ${modelPath}: HTTP ${response.status}`);
                return null;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            // Only log non-404 errors
            if (!error.message.includes('404')) {
                console.warn(`Error fetching data for ${modelPath}:`, error.message);
            }
            return null;
        }
    }

    /**
     * Fetch all available model data
     */
    async fetchAllModelsData(limit = 50) {
        try {
            // Step 1: Get list of all models
            const modelsList = await this.fetchModelsList();
            const modelPaths = Object.keys(modelsList);

            console.log(`Found ${modelPaths.length} models in ML.ENERGY dataset`);

            // Step 2: Fetch benchmark data for each model (limited)
            const modelsData = [];
            const limitedPaths = modelPaths.slice(0, limit);

            for (const modelPath of limitedPaths) {
                const modelInfo = modelsList[modelPath];
                const benchmarkData = await this.fetchModelData(modelPath);

                if (benchmarkData) {
                    modelsData.push({
                        ...benchmarkData,
                        modelPath: modelPath,
                        nickname: modelInfo.nickname,
                        params: modelInfo.params,
                        url: modelInfo.url
                    });
                }
            }

            console.log(`✓ Successfully loaded ${modelsData.length} models from ML.ENERGY (404 errors for unavailable models are expected)`);
            return modelsData;

        } catch (error) {
            console.error('Error fetching ML.ENERGY data:', error);
            this.lastError = error.message;
            throw error;
        }
    }

    /**
     * Transform ML.ENERGY data to SCER format
     * ML.ENERGY format:
     * {
     *   "Model": "meta-llama/Meta-Llama-3.1-8B-Instruct",
     *   "GPU": "NVIDIA A100-SXM4-40GB",
     *   "Energy/req (J)": 59.60,
     *   "Token tput (tok/s)": 1516.77,
     *   "Avg Output Tokens": 480.94,
     *   "nickname": "Llama 3.1 8B",
     *   "params": 8
     * }
     */
    transformToSCERFormat(mlData) {
        const models = [];

        if (!mlData || !Array.isArray(mlData)) {
            return [];
        }

        mlData.forEach(item => {
            try {
                // Extract data from ML.ENERGY format
                const energyPerRequestJ = item["Energy/req (J)"] || 0;
                const throughput = item["Token tput (tok/s)"] || 0;
                const avgOutputTokens = item["Avg Output Tokens"] || 480;

                // Skip models with no energy or throughput data
                if (energyPerRequestJ <= 0 || throughput <= 0) {
                    return;
                }

                // Convert energy from Joules per request to kWh for standard benchmark
                // Assume 1 hour of requests at average rate
                // Energy (kWh) = (Energy per req in J × Requests per hour) / 3,600,000
                // For simplicity, estimate based on continuous generation
                const requestsPerHour = 3600 / (avgOutputTokens / throughput); // requests in 1 hour
                const energyKwh = (energyPerRequestJ * requestsPerHour) / 3600000;

                // Calculate total tokens generated in 1 hour
                const totalTokens = throughput * 3600;

                const modelName = item.nickname || item.Model.split('/').pop();
                const modelPath = item.modelPath || item.Model;

                const model = {
                    id: this.generateModelId(modelName),
                    name: modelName,
                    organization: this.extractOrganization(modelPath),
                    parameters: (item.params || 7) * 1000000000, // Convert B to actual number
                    precision: '16-bit', // ML.ENERGY typically uses FP16
                    category: this.categorizeModel((item.params || 7) * 1000000000),
                    applicationTypes: ['text-generation', 'reasoning'],
                    totalTokens: Math.round(totalTokens),
                    energyConsumedKwh: energyKwh,
                    region: 'us',
                    benchmarks: this.getDefaultBenchmarks(),
                    hardware: {
                        gpu: item.GPU || this.gpu,
                        memory: '40GB',
                        powerConsumption: '300W'
                    },
                    lastUpdated: new Date().toISOString()
                };

                models.push(model);
            } catch (error) {
                console.warn('Error transforming ML.ENERGY item:', error, item);
            }
        });

        return models;
    }

    /**
     * Generate model ID from name
     */
    generateModelId(modelName) {
        return modelName.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * Extract organization from model name
     */
    extractOrganization(modelName) {
        if (!modelName) return 'Unknown';

        if (modelName.includes('/')) {
            return modelName.split('/')[0];
        }

        // Common patterns
        if (modelName.toLowerCase().includes('gpt')) return 'OpenAI';
        if (modelName.toLowerCase().includes('claude')) return 'Anthropic';
        if (modelName.toLowerCase().includes('llama')) return 'Meta';
        if (modelName.toLowerCase().includes('gemini')) return 'Google';

        return 'Unknown';
    }

    /**
     * Categorize model by size
     */
    categorizeModel(parameters) {
        if (parameters < 5000000000) return 'small';
        if (parameters < 15000000000) return 'medium';
        return 'large';
    }

    /**
     * Get default benchmark scores
     */
    getDefaultBenchmarks() {
        return {
            arc: 70.0,
            hellaswag: 75.0,
            mmlu: 72.0,
            truthfulqa: 68.0,
            winogrande: 73.0,
            gsm8k: 70.0
        };
    }

    /**
     * Main method to fetch and transform models
     */
    async fetchModels(limit = 50) {
        try {
            console.log(`Fetching data from ${this.sourceName}...`);
            this.lastError = null;

            const rawData = await this.fetchAllModelsData(limit);

            if (!rawData || rawData.length === 0) {
                this.lastError = 'No data received from ML.ENERGY GitHub repository';
                console.warn('No data from ML.ENERGY, using fallback');
                return this.getFallbackData();
            }

            const models = this.transformToSCERFormat(rawData);

            if (models.length === 0) {
                this.lastError = 'No valid models after transformation';
                console.warn('No models from ML.ENERGY, using fallback');
                return this.getFallbackData();
            }

            console.log(`Successfully transformed ${models.length} models from ${this.sourceName}`);
            return models;
        } catch (error) {
            this.lastError = error.message || 'Unknown error occurred';
            console.error(`Error fetching from ${this.sourceName}:`, error);
            return this.getFallbackData();
        }
    }

    /**
     * Get the source name
     */
    getSourceName() {
        return this.sourceName;
    }

    /**
     * Get the source URL (for website)
     */
    getSourceUrl() {
        return this.sourceUrl;
    }

    /**
     * Get the data URL (for data repository)
     */
    getDataUrl() {
        return this.dataUrl;
    }

    /**
     * Get last error message
     */
    getLastError() {
        return this.lastError;
    }

    /**
     * Set fallback data
     */
    setFallbackData(data) {
        this.fallbackData = data;
    }

    /**
     * Get fallback data
     */
    getFallbackData() {
        if (this.fallbackData) {
            console.log('Using fallback data for ML.ENERGY');
            return this.fallbackData;
        }
        return [];
    }
}
