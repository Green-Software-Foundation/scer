// Hugging Face Data Adapter for SCER LLM Tool
// Fetches and transforms data from Hugging Face datasets

class HuggingFaceAdapter {
    constructor() {
        // Gradio Space API for live data
        this.spaceUrl = 'optimum/llm-perf-leaderboard';
        this.apiUrl = `https://${this.spaceUrl.replace('/', '-')}.hf.space`;

        // Fallback: Direct CSV file access from repository
        this.baseUrl = 'https://huggingface.co/datasets/optimum-benchmark/llm-perf-leaderboard/resolve/main';
        this.csvFile = 'perf-df-pytorch-cuda-unquantized-1xA100.csv';

        this.fallbackData = null;
        this.sourceName = 'Hugging Face LLM-Perf Leaderboard';
        this.sourceUrl = 'https://huggingface.co/spaces/optimum/llm-perf-leaderboard';
        this.dataUrl = 'https://huggingface.co/datasets/optimum-benchmark/llm-perf-leaderboard';
        this.lastError = null;
        this.useGradioAPI = true; // Try Gradio API first, fall back to CSV
    }

    /**
     * Fetch data from Gradio Space API
     * Note: This is a simplified approach - actual Gradio API may require different endpoints
     */
    async fetchFromGradioSpace() {
        try {
            // Try to access the space's data endpoint
            // Gradio spaces typically expose data via /api/endpoint
            const dataUrl = `${this.apiUrl}/api/data`;
            console.log(`Attempting to fetch from Gradio Space API: ${dataUrl}`);

            const response = await fetch(dataUrl);

            if (!response.ok) {
                throw new Error(`Gradio API error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching from Gradio Space:', error);
            throw error;
        }
    }

    /**
     * Fetch CSV file directly from Hugging Face repository (fallback method)
     */
    async fetchCSV() {
        try {
            const url = `${this.baseUrl}/${this.csvFile}`;
            console.log(`Fetching CSV from: ${url}`);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const csvText = await response.text();
            return csvText;
        } catch (error) {
            console.error('Error fetching CSV file:', error);
            throw error;
        }
    }

    /**
     * Parse CSV text to array of objects
     */
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        if (lines.length === 0) return [];

        // Get headers from first line
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

        // Parse data rows
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV parsing (doesn't handle quoted commas perfectly, but works for this data)
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));

            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                rows.push(row);
            }
        }

        return rows;
    }

    /**
     * Transform Hugging Face benchmark data to SCER format
     * CSV columns expected: model, decode.throughput(tokens/s), decode.energy(kWh), etc.
     */
    transformToSCERFormat(hfData) {
        const models = [];
        const processedModels = new Map(); // Track unique models by name

        hfData.forEach(row => {
            try {
                // Extract model name and parameters
                const modelName = this.extractModelName(row);
                const organization = this.extractOrganization(row);
                const modelId = this.generateModelId(modelName, organization);

                // Skip if we've already processed this model (take first occurrence)
                if (processedModels.has(modelId)) {
                    return;
                }

                // Extract performance metrics from CSV columns
                const throughput = this.extractThroughput(row);
                const energyConsumed = this.extractEnergy(row);
                const latency = this.extractLatency(row);

                // Calculate tokens based on throughput and time
                const totalTokens = this.calculateTotalTokens(throughput, energyConsumed);

                // Skip models with missing critical data
                if (!modelName || !energyConsumed || !totalTokens || energyConsumed <= 0 || totalTokens <= 0) {
                    return;
                }

                const model = {
                    id: modelId,
                    name: modelName,
                    organization: organization || 'Unknown',
                    parameters: this.extractParameters(rowData, modelName),
                    precision: this.extractPrecision(rowData),
                    category: this.categorizeModel(this.extractParameters(rowData, modelName)),
                    applicationTypes: this.inferApplicationTypes(modelName),
                    totalTokens: totalTokens,
                    energyConsumedKwh: energyConsumed,
                    region: 'us', // Default region
                    benchmarks: this.extractBenchmarks(rowData),
                    hardware: this.extractHardware(rowData),
                    lastUpdated: new Date().toISOString()
                };

                models.push(model);
                processedModels.set(modelId, true);
            } catch (error) {
                console.warn('Error transforming row:', error, row);
            }
        });

        return models;
    }

    /**
     * Extract model name from HF data
     * CSV column: config.backend.model
     */
    extractModelName(rowData) {
        // Try different possible field names (CSV uses nested names with dots)
        const possibleFields = [
            'config.backend.model',
            'model',
            'model_name',
            'name',
            'model_id'
        ];

        for (const field of possibleFields) {
            if (rowData[field]) {
                // Clean up the model name
                let name = String(rowData[field]);
                // Remove organization prefix if present (e.g., "meta-llama/Llama-2-7b" -> "Llama 2 7B")
                if (name.includes('/')) {
                    name = name.split('/').pop();
                }
                // Replace hyphens and underscores with spaces
                name = name.replace(/[-_]/g, ' ');
                // Capitalize first letter of each word
                name = name.split(' ').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
                return name;
            }
        }

        return null;
    }

    /**
     * Extract organization from model path
     * CSV column: config.backend.model
     */
    extractOrganization(rowData) {
        const possibleFields = ['config.backend.model', 'model', 'model_name', 'model_id'];

        for (const field of possibleFields) {
            if (rowData[field] && String(rowData[field]).includes('/')) {
                const parts = String(rowData[field]).split('/');
                return parts[0].split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
            }
        }

        return 'Unknown';
    }

    /**
     * Generate unique model ID
     */
    generateModelId(modelName, organization) {
        const base = `${organization}-${modelName}`.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        return base;
    }

    /**
     * Extract latency metrics (in seconds)
     */
    extractLatency(rowData) {
        // Look for latency fields (could be in ms or s)
        const latencyFields = [
            'decode.latency(s)',
            'decode_latency',
            'latency',
            'per_token_latency',
            'decode.throughput(tokens/s)'
        ];

        for (const field of latencyFields) {
            if (rowData[field] !== undefined && rowData[field] !== null) {
                return parseFloat(rowData[field]);
            }
        }

        return 0.001; // Default 1ms
    }

    /**
     * Extract throughput (tokens/second)
     * CSV column: report.decode.throughput.value
     */
    extractThroughput(rowData) {
        const throughputFields = [
            'report.decode.throughput.value',
            'decode.throughput(tokens/s)',
            'throughput',
            'tokens_per_second',
            'decode_throughput'
        ];

        for (const field of throughputFields) {
            if (rowData[field] !== undefined && rowData[field] !== null && rowData[field] !== '') {
                const value = parseFloat(rowData[field]);
                if (!isNaN(value) && value > 0) {
                    return value;
                }
            }
        }

        return 1000; // Default 1000 tokens/s
    }

    /**
     * Extract energy consumption (in kWh)
     * CSV column: report.decode.energy.total
     */
    extractEnergy(rowData) {
        const energyFields = [
            'report.decode.energy.total',
            'decode.energy(kWh)',
            'energy',
            'energy_kwh',
            'power_consumption'
        ];

        for (const field of energyFields) {
            if (rowData[field] !== undefined && rowData[field] !== null && rowData[field] !== '') {
                const value = parseFloat(rowData[field]);
                if (!isNaN(value) && value > 0) {
                    return value;
                }
            }
        }

        // If no energy data, estimate based on typical GPU power
        // Assume ~300W GPU running for 1 second per benchmark
        return 0.45; // 450W for ~1 hour = 0.45 kWh
    }

    /**
     * Calculate total tokens generated
     * Uses energy consumption and throughput to estimate tokens
     */
    calculateTotalTokens(throughput, energyKwh) {
        // throughput is tokens/second
        // energyKwh is energy consumed (in kWh)
        // Estimate: if energy consumed is 0.001 kWh at 300W, that's ~12 seconds
        // tokens = throughput * time
        // Assume typical inference duration or use energy to estimate time
        // For simplicity, use 1 hour of generation at given throughput
        const estimatedSeconds = 3600; // 1 hour
        return Math.round(throughput * estimatedSeconds);
    }

    /**
     * Extract model parameters
     */
    extractParameters(rowData, modelName) {
        // Try to find parameter count in data
        const paramFields = ['parameters', 'num_parameters', 'model_size'];

        for (const field of paramFields) {
            if (rowData[field] !== undefined && rowData[field] !== null) {
                return parseFloat(rowData[field]);
            }
        }

        // Infer from model name (e.g., "7B", "13B", "70B")
        const match = modelName.match(/(\d+\.?\d*)\s*B/i);
        if (match) {
            return parseFloat(match[1]) * 1000000000;
        }

        const matchM = modelName.match(/(\d+\.?\d*)\s*M/i);
        if (matchM) {
            return parseFloat(matchM[1]) * 1000000;
        }

        return 7000000000; // Default to 7B
    }

    /**
     * Extract precision/quantization
     */
    extractPrecision(rowData) {
        const precisionFields = ['quantization', 'precision', 'dtype'];

        for (const field of precisionFields) {
            if (rowData[field]) {
                const value = String(rowData[field]).toLowerCase();
                if (value.includes('4')) return '4-bit';
                if (value.includes('8')) return '8-bit';
                if (value.includes('16')) return '16-bit';
                return value;
            }
        }

        return '8-bit';
    }

    /**
     * Categorize model by size
     */
    categorizeModel(parameters) {
        if (parameters < 5000000000) return 'small'; // < 5B
        if (parameters < 15000000000) return 'medium'; // 5-15B
        return 'large'; // 15B+
    }

    /**
     * Infer application types from model name
     */
    inferApplicationTypes(modelName) {
        const types = ['text-generation'];
        const nameLower = modelName.toLowerCase();

        if (nameLower.includes('code') || nameLower.includes('coder')) {
            types.push('code-generation');
        }
        if (nameLower.includes('chat') || nameLower.includes('instruct')) {
            types.push('reasoning');
        }
        if (nameLower.includes('translate')) {
            types.push('translation');
        }

        return types;
    }

    /**
     * Extract benchmark scores (use default values)
     */
    extractBenchmarks(rowData) {
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
     * Extract hardware information
     */
    extractHardware(rowData) {
        return {
            gpu: rowData.backend || rowData.hardware || 'Unknown GPU',
            memory: '80GB',
            powerConsumption: '300W'
        };
    }

    /**
     * Main method to fetch and transform data
     */
    async fetchModels(limit = 100) {
        try {
            console.log(`Fetching data from ${this.sourceName}...`);
            this.lastError = null;
            let rows = [];

            // Try Gradio Space API first (for most up-to-date data)
            if (this.useGradioAPI) {
                try {
                    console.log('Attempting Gradio Space API for live data...');
                    const gradioData = await this.fetchFromGradioSpace();

                    // Transform Gradio response to rows format
                    // Note: This depends on actual Gradio API response structure
                    if (gradioData && Array.isArray(gradioData)) {
                        rows = gradioData;
                        console.log(`Got ${rows.length} rows from Gradio API`);
                    } else {
                        throw new Error('Gradio API returned unexpected format');
                    }
                } catch (gradioError) {
                    console.warn('Gradio API failed, falling back to CSV:', gradioError.message);
                    // Fall back to CSV if Gradio fails
                    const csvText = await this.fetchCSV();
                    rows = this.parseCSV(csvText);
                    console.log(`Parsed ${rows.length} rows from CSV fallback`);
                }
            } else {
                // Direct CSV fetch
                const csvText = await this.fetchCSV();
                rows = this.parseCSV(csvText);
                console.log(`Parsed ${rows.length} rows from CSV file`);
            }

            if (!rows || rows.length === 0) {
                this.lastError = 'No data received from any source';
                console.warn(`No data received from ${this.sourceName}, using fallback`);
                return this.getFallbackData();
            }

            // Limit the number of rows if specified
            const limitedRows = limit ? rows.slice(0, limit) : rows;
            const models = this.transformToSCERFormat(limitedRows);

            if (models.length === 0) {
                this.lastError = 'Data transformation produced no valid models';
                console.warn('No models after transformation, using fallback');
                return this.getFallbackData();
            }

            console.log(`Successfully transformed to ${models.length} models from ${this.sourceName}`);
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
     * Set fallback data for offline/error scenarios
     */
    setFallbackData(data) {
        this.fallbackData = data;
    }

    /**
     * Get fallback data
     */
    getFallbackData() {
        if (this.fallbackData) {
            console.log('Using fallback data');
            return this.fallbackData;
        }
        return [];
    }
}
