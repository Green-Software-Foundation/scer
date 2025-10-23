// SCER LLM Carbon Efficiency Rating Tool - Main Application

class SCERApp {
    constructor() {
        this.calculator = new SCERRatingCalculator();

        // Initialize data source adapters
        this.adapters = {
            huggingface: new HuggingFaceAdapter(),
            mlenergy: new MLEnergyAdapter(),
            sample: null // Special case for sample data
        };

        this.models = [];
        this.filteredModels = [];
        this.currentSort = 'efficiency';
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.selectedDataSource = 'mlenergy'; // Default to ML.ENERGY (most current data)
        this.currentDataSource = 'Sample Dataset'; // Actual source used
        this.dataSourceError = null; // Track any errors

        this.init();
    }

    async init() {
        try {
            await this.loadModels();
            this.setupEventListeners();
            // Set default sort to rating
            this.currentSort = 'rating';
            this.applyFilters();
            this.renderLeaderboard();
            this.updateStats();
            this.showSection('leaderboard');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to load application data');
        }
    }

    async loadModels() {
        try {
            // Show loading state
            this.showLoadingState();

            let rawData;

            // Set fallback data for all adapters
            Object.values(this.adapters).forEach(adapter => {
                if (adapter && adapter.setFallbackData) {
                    adapter.setFallbackData(this.getSampleData());
                }
            });

            // Fetch data based on selected source
            if (this.selectedDataSource === 'sample') {
                // Use sample data directly
                console.log('Using sample dataset');
                rawData = this.getSampleData();
                this.currentDataSource = 'Sample Dataset';
                this.dataSourceError = null;
            } else {
                // Try to fetch from selected adapter
                const adapter = this.adapters[this.selectedDataSource];

                if (!adapter) {
                    console.error(`Unknown data source: ${this.selectedDataSource}`);
                    rawData = this.getSampleData();
                    this.currentDataSource = 'Sample Dataset (Fallback)';
                    this.dataSourceError = 'Unknown data source selected';
                } else {
                    try {
                        console.log(`Attempting to fetch data from ${adapter.getSourceName()}...`);
                        rawData = await adapter.fetchModels(50);

                        // Check if we got real data (more than the 3 fallback samples)
                        if (rawData && rawData.length > 3) {
                            console.log(`Successfully fetched ${rawData.length} models from ${adapter.getSourceName()}`);
                            this.currentDataSource = adapter.getSourceName();
                            this.dataSourceError = null;
                        } else {
                            console.warn(`No data from ${adapter.getSourceName()}, falling back to sample data`);
                            this.currentDataSource = `${adapter.getSourceName()} (Unavailable - Using Fallback)`;
                            this.dataSourceError = adapter.getLastError();
                            if (!rawData || rawData.length === 0) {
                                rawData = this.getSampleData();
                            }
                        }
                    } catch (error) {
                        console.error(`Error fetching from ${adapter.getSourceName()}, using sample data:`, error);
                        this.currentDataSource = `${adapter.getSourceName()} (Error - Using Fallback)`;
                        this.dataSourceError = error.message;
                        rawData = this.getSampleData();
                    }
                }
            }

            // Evaluate all models with relative ratings
            this.models = this.calculator.evaluateAllModels(rawData).map(model => ({
                ...model,
                // Format parameters for display
                parametersFormatted: this.formatParameters(model.parameters)
            }));
            
            this.filteredModels = [...this.models];
            
            // Update data source info
            this.updateDataSourceInfo();
            
        } catch (error) {
            console.error('Error loading models:', error);
            // Fallback to empty array if data loading fails
            this.models = [];
            this.filteredModels = [];
            this.showError('Failed to load model data');
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('nav button').forEach(button => {
            button.addEventListener('click', (e) => {
                const section = e.target.textContent.toLowerCase().includes('leaderboard') ? 'leaderboard' :
                               e.target.textContent.toLowerCase().includes('methodology') ? 'methodology' :
                               'about';
                this.showSection(section);
            });
        });

        // Hero buttons
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                if (e.target.textContent.includes('Rankings')) {
                    this.showSection('leaderboard');
                } else if (e.target.textContent.includes('Submit')) {
                    this.showSubmitModel();
                }
            });
        });

        // Data Source Selector
        const dataSourceSelect = document.getElementById('dataSourceSelect');
        if (dataSourceSelect) {
            dataSourceSelect.addEventListener('change', async (e) => {
                this.selectedDataSource = e.target.value;
                console.log(`Data source changed to: ${this.selectedDataSource}`);
                await this.loadModels();
                this.applyFilters();
                this.updateStats();
            });
        }

        // Filters
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.applyFilters();
            });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applyFilters();
            });
        }

        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchModels(e.target.value);
            });
        }

        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        // Modal close button
        const closeModalBtn = document.getElementById('closeModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }

        // Close modal when clicking outside
        const modalOverlay = document.getElementById('modelModal');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Update navigation active state
        document.querySelectorAll('nav button').forEach(button => {
            button.classList.remove('text-green-400');
            button.classList.add('text-gray-400');
        });

        // Highlight active navigation
        const activeButton = Array.from(document.querySelectorAll('nav button')).find(button => {
            const text = button.textContent.toLowerCase();
            return (sectionName === 'leaderboard' && text.includes('leaderboard')) ||
                   (sectionName === 'methodology' && text.includes('methodology')) ||
                   (sectionName === 'about' && text.includes('about'));
        });

        if (activeButton) {
            activeButton.classList.remove('text-gray-400');
            activeButton.classList.add('text-green-400');
        }
    }

    showModelDetails(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (!model) {
            console.error('Model not found:', modelId);
            return;
        }

        // Populate modal with model data
        document.getElementById('modalModelName').textContent = model.name;
        document.getElementById('modalOrganization').textContent = model.organization;

        // SCER Rating
        const ratingBadge = document.getElementById('modalRatingBadge');
        ratingBadge.className = `scer-badge scer-${model.rating.scerRating.toLowerCase()}`;
        ratingBadge.textContent = model.rating.scerRating;

        document.getElementById('modalRatingText').textContent = `Rating: ${model.rating.scerRating}`;

        const ratingDescriptions = {
            'A': 'Excellent - Top 20% carbon efficiency',
            'B': 'Good - Above average efficiency (60-80th percentile)',
            'C': 'Average - Moderate efficiency (40-60th percentile)',
            'D': 'Below Average - Lower efficiency (20-40th percentile)',
            'E': 'Poor - Bottom 20% efficiency'
        };
        document.getElementById('modalRatingDescription').textContent = ratingDescriptions[model.rating.scerRating] || '';

        // Energy Efficiency
        document.getElementById('modalTokensPerKwh').textContent = model.efficiency.tokensPerKwh.toLocaleString();
        document.getElementById('modalCo2Per1k').textContent = `${model.efficiency.co2ePer1kTokens} g`;
        document.getElementById('modalEnergyConsumed').textContent = `${model.energyConsumedKwh.toFixed(4)} kWh`;
        document.getElementById('modalTotalTokens').textContent = model.totalTokens.toLocaleString();

        // Model Information
        document.getElementById('modalParameters').textContent = model.parametersFormatted;
        document.getElementById('modalCategory').textContent = model.category.charAt(0).toUpperCase() + model.category.slice(1);
        document.getElementById('modalPrecision').textContent = model.precision || 'N/A';
        document.getElementById('modalRegion').textContent = model.region || 'N/A';

        // Performance Benchmarks
        const benchmarksSection = document.getElementById('modalBenchmarksSection');
        const benchmarksContainer = document.getElementById('modalBenchmarks');
        if (model.benchmarks && Object.keys(model.benchmarks).length > 0) {
            benchmarksSection.classList.remove('hidden');
            benchmarksContainer.innerHTML = Object.entries(model.benchmarks).map(([key, value]) => `
                <div class="metric-box">
                    <div class="metric-label">${key.toUpperCase()}</div>
                    <div class="metric-value">${value}%</div>
                </div>
            `).join('');
        } else {
            benchmarksSection.classList.add('hidden');
        }

        // Hardware Configuration
        const hardwareSection = document.getElementById('modalHardwareSection');
        const hardwareContainer = document.getElementById('modalHardware');
        if (model.hardware && Object.keys(model.hardware).length > 0) {
            hardwareSection.classList.remove('hidden');
            hardwareContainer.innerHTML = Object.entries(model.hardware).map(([key, value]) => `
                <div class="metric-box">
                    <div class="metric-label">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div class="metric-value">${value}</div>
                </div>
            `).join('');
        } else {
            hardwareSection.classList.add('hidden');
        }

        // Application Types
        const applicationsSection = document.getElementById('modalApplicationsSection');
        const applicationsContainer = document.getElementById('modalApplications');
        if (model.applicationTypes && model.applicationTypes.length > 0) {
            applicationsSection.classList.remove('hidden');
            applicationsContainer.innerHTML = model.applicationTypes.map(type => `
                <span class="tag tag-${this.getTagColor(type)}">${this.formatApplicationType(type)}</span>
            `).join('');
        } else {
            applicationsSection.classList.add('hidden');
        }

        // Show modal
        document.getElementById('modelModal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('modelModal').classList.add('hidden');
    }

    applyFilters() {
        // First filter the models
        this.filteredModels = this.models.filter(model => {
            // Category filter
            if (this.currentCategory !== 'all' && model.category !== this.currentCategory) {
                return false;
            }
            
            return true;
        });

        // Recompute SCER ratings based on filtered models
        this.recomputeRatings();

        this.sortModels();
        this.renderLeaderboard();
    }

    sortModels() {
        this.filteredModels.sort((a, b) => {
            switch (this.currentSort) {
                case 'efficiency':
                    return b.efficiency.tokensPerKwh - a.efficiency.tokensPerKwh;
                case 'performance':
                    return b.performance.score - a.performance.score;
                case 'composite':
                    return b.composite.score - a.composite.score;
                case 'size':
                    return a.parameters - b.parameters;
                case 'rating':
                    const ratingOrder = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
                    const ratingDiff = ratingOrder[b.rating.scerRating] - ratingOrder[a.rating.scerRating];
                    // If same rating, sort by efficiency as tie-breaker
                    if (ratingDiff === 0) {
                        return b.efficiency.tokensPerKwh - a.efficiency.tokensPerKwh;
                    }
                    return ratingDiff;
                default:
                    // Default sort by rating
                    const defaultRatingOrder = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
                    const defaultRatingDiff = defaultRatingOrder[b.rating.scerRating] - defaultRatingOrder[a.rating.scerRating];
                    if (defaultRatingDiff === 0) {
                        return b.efficiency.tokensPerKwh - a.efficiency.tokensPerKwh;
                    }
                    return defaultRatingDiff;
            }
        });
    }

    searchModels(query) {
        if (!query) {
            this.filteredModels = [...this.models];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredModels = this.models.filter(model => 
                model.name.toLowerCase().includes(searchTerm) ||
                model.organization.toLowerCase().includes(searchTerm) ||
                model.applicationTypes.some(type => type.toLowerCase().includes(searchTerm))
            );
        }
        
        this.sortModels();
        this.renderLeaderboard();
    }

    renderLeaderboard() {
        // Render top models grid
        this.renderTopModels();
        
        // Render table
        this.renderModelsTable();
    }

    renderTopModels() {
        const topModelsContainer = document.getElementById('topModelsGrid');
        if (!topModelsContainer) return;

        // Sort by rating first, then by efficiency as tie-breaker
        const sortedByRating = [...this.filteredModels].sort((a, b) => {
            const ratingOrder = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
            const ratingDiff = ratingOrder[b.rating.scerRating] - ratingOrder[a.rating.scerRating];
            if (ratingDiff === 0) {
                return b.efficiency.tokensPerKwh - a.efficiency.tokensPerKwh;
            }
            return ratingDiff;
        });

        const topModels = sortedByRating.slice(0, 3);
        
        topModelsContainer.innerHTML = topModels.map((model, index) => `
            <div class="model-card" onclick="app.showModelDetails('${model.id}')">
                <div class="model-header">
                    <div class="model-info">
                        <h3>${model.name}</h3>
                        <p class="model-organization">${model.organization} • ${model.parametersFormatted}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="scer-badge scer-${model.rating.scerRating.toLowerCase()}">
                            ${model.rating.scerRating}
                        </div>
                        ${index === 0 ? '<i class="fas fa-crown text-yellow-400 text-sm"></i>' : ''}
                    </div>
                </div>
                
                <div class="model-metrics">
                    <div class="metric">
                        <div class="metric-label">Rank</div>
                        <div class="metric-value text-yellow-400">
                            #${this.getModelRelativeRank(model)}
                        </div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Efficiency</div>
                        <div class="metric-value text-green-400">
                            ${model.efficiency.tokensPerKwh.toLocaleString()} tokens/kWh
                        </div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">CO₂e</div>
                        <div class="metric-value text-blue-400">
                            ${model.efficiency.co2ePer1kTokens} g/1k tokens
                        </div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Performance</div>
                        <div class="metric-value text-purple-400">
                            ${model.performance.score}
                        </div>
                    </div>
                </div>
                
                <div class="model-footer">
                    <div class="model-tags">
                        ${model.applicationTypes.map(type => 
                            `<span class="tag tag-${this.getTagColor(type)}">${this.formatApplicationType(type)}</span>`
                        ).join('')}
                    </div>
                    <button class="text-green-400 hover:text-green-300 transition-colors">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderModelsTable() {
        const tableBody = document.getElementById('modelsTableBody');
        if (!tableBody) return;

        // Calculate ranks based on current sort order
        const rankedModels = this.filteredModels.map((model, index) => ({
            ...model,
            rank: index + 1
        }));

        tableBody.innerHTML = rankedModels.map(model => `
            <tr onclick="app.showModelDetails('${model.id}')" class="cursor-pointer hover:bg-gray-50 transition-colors">
                <td class="p-4">
                    <div class="flex items-center space-x-2">
                        <span class="font-bold text-gray-900">#${model.rank}</span>
                        ${model.rank === 1 ? '<i class="fas fa-trophy text-yellow-500 ml-2"></i>' :
                          model.rank === 2 ? '<i class="fas fa-medal text-gray-400 ml-2"></i>' :
                          model.rank === 3 ? '<i class="fas fa-medal text-orange-500 ml-2"></i>' : ''}
                    </div>
                </td>
                <td class="p-4">
                    <div>
                        <div class="font-semibold text-gray-900">${model.name}</div>
                        <div class="text-sm text-gray-600">${model.organization} • ${model.parametersFormatted}</div>
                    </div>
                </td>
                <td class="p-4">
                    <div class="flex items-center space-x-2">
                        <div class="scer-badge scer-${model.rating.scerRating.toLowerCase()} scer-badge-sm">
                            ${model.rating.scerRating}
                        </div>
                        <span class="text-xs text-gray-600">(${model.rating.description})</span>
                    </div>
                </td>
                <td class="p-4 metric-value text-green-700 font-semibold">
                    ${model.efficiency.tokensPerKwh.toLocaleString()}
                </td>
                <td class="p-4 metric-value text-blue-700 font-semibold">
                    ${model.efficiency.co2ePer1kTokens}
                </td>
                <td class="p-4 metric-value text-purple-700 font-semibold">
                    ${model.performance.score}
                </td>
                <td class="p-4">
                    <span class="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                        ${model.category}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    updateStats() {
        const stats = this.calculateStats();
        
        // Update stat cards
        const statElements = {
            modelsEvaluated: document.querySelector('.stat-value:nth-child(1)'),
            avgTokensPerKwh: document.querySelector('.stat-value:nth-child(2)'),
            avgCO2e: document.querySelector('.stat-value:nth-child(3)'),
            topRating: document.querySelector('.stat-value:nth-child(4)')
        };

        if (statElements.modelsEvaluated) {
            statElements.modelsEvaluated.textContent = stats.totalModels;
        }
        
        if (statElements.avgTokensPerKwh) {
            statElements.avgTokensPerKwh.textContent = Math.round(stats.avgTokensPerKwh).toLocaleString();
        }
        
        if (statElements.avgCO2e) {
            statElements.avgCO2e.textContent = stats.avgCO2e.toFixed(1);
        }
        
        if (statElements.topRating) {
            statElements.topRating.textContent = stats.topRating;
        }
    }

    calculateStats() {
        if (this.models.length === 0) {
            return {
                totalModels: 0,
                avgTokensPerKwh: 0,
                avgCO2e: 0,
                topRating: 'N/A'
            };
        }

        const totalTokensPerKwh = this.models.reduce((sum, model) => sum + model.efficiency.tokensPerKwh, 0);
        const totalCO2e = this.models.reduce((sum, model) => sum + model.efficiency.co2ePer1kTokens, 0);
        
        const ratings = this.models.map(model => model.rating.scerRating);
        const ratingOrder = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
        const topRating = ratings.reduce((best, current) => 
            ratingOrder[current] > ratingOrder[best] ? current : best
        );

        return {
            totalModels: this.models.length,
            avgTokensPerKwh: totalTokensPerKwh / this.models.length,
            avgCO2e: totalCO2e / this.models.length,
            topRating: topRating
        };
    }

    showModelDetails(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (!model) return;

        // Create modal with model details
        const modal = document.createElement('div');
        modal.id = 'modelDetailModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.75);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 1rem;
        `;
        
        modal.innerHTML = `
            <div class="max-w-4xl w-full bg-white rounded-2xl text-gray-900 overflow-hidden" style="background: #ffffff !important; background-color: #ffffff !important; color: #111827 !important; border-radius: 1rem !important; max-height: 90vh;">
                <div class="overflow-y-auto p-8" style="max-height: 90vh;">
                    <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-3xl font-bold mb-2 text-gray-900">${model.name}</h2>
                        <p class="text-gray-600">${model.organization} • ${model.parametersFormatted} parameters</p>
                    </div>
                    <button onclick="document.getElementById('modelDetailModal').remove()" class="text-gray-600 hover:text-gray-900 transition-colors text-2xl leading-none">
                        ×
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 class="text-xl font-semibold mb-4 text-green-400">Efficiency Metrics</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span>SCER Rating:</span>
                                <div class="flex items-center space-x-2">
                                    <div class="scer-badge scer-${model.rating.scerRating.toLowerCase()}">
                                        ${model.rating.scerRating}
                                    </div>
                                    <span class="text-xs text-gray-400">
                                        (${this.currentCategory !== 'all' ? this.currentCategory : 'all'} models)
                                    </span>
                                </div>
                            </div>
                            <div class="flex justify-between">
                                <span>Tokens per kWh:</span>
                                <span class="metric-value text-green-400">${model.efficiency.tokensPerKwh.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>CO₂e per 1k tokens:</span>
                                <span class="metric-value text-blue-400">${model.efficiency.co2ePer1kTokens} g</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Energy Consumed:</span>
                                <span class="metric-value text-yellow-400">${model.efficiency.energyConsumedKwh} kWh</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Relative Rank:</span>
                                <span class="metric-value text-purple-400">${this.getModelRelativeRank(model)} of ${this.models.length}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 class="text-xl font-semibold mb-4 text-purple-400">Performance</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span>Overall Score:</span>
                                <span class="metric-value">${model.performance.score}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Composite Score:</span>
                                <span class="metric-value">${model.composite.score}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Rank:</span>
                                <span class="metric-value">${model.composite.rank}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Precision:</span>
                                <span class="metric-value">${model.precision}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Category:</span>
                                <span class="metric-value capitalize">${model.category}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-8">
                    <h3 class="text-xl font-semibold mb-4 text-blue-400">Benchmark Results</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        ${Object.entries(model.performance.benchmarks).map(([benchmark, score]) => `
                            <div class="text-center p-3 bg-white bg-opacity-5 rounded-lg hover:bg-opacity-10 transition-colors">
                                <div class="text-sm text-gray-400">${benchmark.toUpperCase()}</div>
                                <div class="text-lg font-bold">${score}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="mt-8">
                    <h3 class="text-xl font-semibold mb-4 text-yellow-600">Environmental Impact</h3>
                    <div class="bg-green-50 border border-green-300 rounded-lg p-4">
                        <p class="text-sm text-green-700 mb-2">
                            <i class="fas fa-leaf mr-2"></i>
                            ${model.rating.message}
                        </p>
                        <p class="text-sm text-gray-700 mb-3">
                            <strong>Recommendation:</strong> ${model.rating.recommendation}
                        </p>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span class="text-gray-600">Monthly carbon savings:</span>
                                <span class="font-bold text-green-700 block">${model.environmental.carbonSavings.monthlySavingsKg.toFixed(2)} kg CO₂e</span>
                            </div>
                            <div>
                                <span class="text-gray-600">Annual carbon savings:</span>
                                <span class="font-bold text-green-700 block">${model.environmental.carbonSavings.annualSavingsKg.toFixed(2)} kg CO₂e</span>
                            </div>
                            <div>
                                <span class="text-gray-600">Equivalent trees planted:</span>
                                <span class="font-bold text-green-700 block">${model.environmental.carbonSavings.equivalentTreesPlanted} trees/year</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-8">
                    <h3 class="text-xl font-semibold mb-4 text-gray-700">Technical Specifications</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <span class="text-gray-600 font-semibold">GPU:</span>
                            <span class="ml-2 text-gray-800">${model.hardware.gpu}</span>
                        </div>
                        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <span class="text-gray-600 font-semibold">Memory:</span>
                            <span class="ml-2 text-gray-800">${model.hardware.memory}</span>
                        </div>
                        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <span class="text-gray-600 font-semibold">Power Consumption:</span>
                            <span class="ml-2 text-gray-800">${model.hardware.powerConsumption}</span>
                        </div>
                        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <span class="text-gray-600 font-semibold">Region:</span>
                            <span class="ml-2 text-gray-800">${model.environmental.region.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        `;

        // Add click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Add escape key to close
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        document.body.appendChild(modal);
    }

    showSubmitModel() {
        alert('Model submission feature coming soon! This will allow model owners to submit their models for SCER evaluation.');
    }

    async refreshData() {
        const refreshBtn = document.getElementById('refreshBtn');
        const originalContent = refreshBtn.innerHTML;

        // Get data source name
        const dataSourceName = this.selectedDataSource === 'mlenergy' ? 'ML.ENERGY Leaderboard' :
                               this.selectedDataSource === 'huggingface' ? 'Hugging Face' :
                               'Sample Dataset';

        // Show loading state with data source
        refreshBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Refreshing from ${dataSourceName}...`;
        refreshBtn.disabled = true;

        try {
            // Reload models
            await this.loadModels();

            // Re-render everything
            this.applyFilters();
            this.updateStats();

            // Show success message with data source
            this.showSuccess(`✓ Refreshed ${this.models.length} models from ${dataSourceName}`);

        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showError(`Failed to refresh data from ${dataSourceName}`);
        } finally {
            // Restore button
            refreshBtn.innerHTML = originalContent;
            refreshBtn.disabled = false;
        }
    }

    updateDataSourceInfo() {
        const dataSourceElement = document.getElementById('dataSource');
        const lastUpdatedElement = document.getElementById('lastUpdated');
        const modelCountElement = document.getElementById('modelCount');

        // Update data source label with specific source name and URLs
        if (dataSourceElement) {
            dataSourceElement.textContent = this.currentDataSource;

            // Get URLs from the active adapter
            const adapter = this.adapters[this.selectedDataSource];

            if (adapter && adapter.getSourceUrl) {
                const sourceUrl = adapter.getSourceUrl();
                const dataUrl = adapter.getDataUrl();

                // Make it clickable to show popup
                dataSourceElement.style.cursor = 'pointer';
                dataSourceElement.title = 'Click to see data source details';

                // Set styling based on error state
                if (this.dataSourceError) {
                    dataSourceElement.classList.add('text-yellow-400');
                    dataSourceElement.classList.remove('text-blue-400');
                } else {
                    dataSourceElement.classList.add('text-blue-400');
                    dataSourceElement.classList.remove('text-yellow-400');
                }

                // Setup click handler for popup
                this.setupDataSourcePopup(sourceUrl, dataUrl, this.dataSourceError);
            } else if (this.dataSourceError) {
                dataSourceElement.title = `Error: ${this.dataSourceError}`;
                dataSourceElement.style.cursor = 'help';
                dataSourceElement.classList.add('text-yellow-400');
            } else {
                dataSourceElement.title = '';
                dataSourceElement.style.cursor = 'default';
                dataSourceElement.classList.remove('text-yellow-400', 'text-blue-400');
            }
        }

        if (lastUpdatedElement) {
            const now = new Date();
            const filterInfo = this.currentCategory !== 'all' ? ` (${this.currentCategory} models)` : '';

            // Get timezone information
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const timeZoneAbbr = now.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop();

            // Format: "Last updated: 2:30:45 PM PST (America/Los_Angeles)"
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            });

            lastUpdatedElement.textContent = `Last updated: ${timeString}${filterInfo}`;
            lastUpdatedElement.title = `Timezone: ${timeZone}`;
        }

        if (modelCountElement) {
            const totalText = this.currentCategory !== 'all' ?
                `${this.filteredModels.length} of ${this.models.length} models` :
                `${this.models.length} models`;
            modelCountElement.textContent = totalText;
        }
    }

    setupDataSourcePopup(sourceUrl, dataUrl, errorMessage) {
        const dataSourceElement = document.getElementById('dataSource');
        const popup = document.getElementById('dataSourcePopup');
        const popupTitle = document.getElementById('popupTitle');
        const popupWebsiteUrl = document.getElementById('popupWebsiteUrl');
        const popupWebsiteText = document.getElementById('popupWebsiteText');
        const popupDataUrl = document.getElementById('popupDataUrl');
        const popupDataText = document.getElementById('popupDataText');
        const popupError = document.getElementById('popupError');

        if (!dataSourceElement || !popup) return;

        // Remove old event listeners by cloning
        const newDataSourceElement = dataSourceElement.cloneNode(true);
        dataSourceElement.parentNode.replaceChild(newDataSourceElement, dataSourceElement);

        // Populate popup content
        popupTitle.textContent = this.currentDataSource;
        popupWebsiteUrl.href = sourceUrl;
        popupWebsiteText.textContent = new URL(sourceUrl).hostname;
        popupDataUrl.href = dataUrl;
        popupDataText.textContent = new URL(dataUrl).hostname + new URL(dataUrl).pathname.substring(0, 30) + '...';

        if (errorMessage) {
            popupError.textContent = `⚠️ ${errorMessage}`;
            popupError.classList.remove('hidden');
        } else {
            popupError.classList.add('hidden');
        }

        // Toggle popup on click
        newDataSourceElement.addEventListener('click', (e) => {
            e.stopPropagation();
            popup.classList.toggle('hidden');
        });

        // Close popup when clicking outside
        document.addEventListener('click', (e) => {
            if (!popup.contains(e.target) && e.target !== newDataSourceElement) {
                popup.classList.add('hidden');
            }
        });

        // Prevent popup from closing when clicking inside it
        popup.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    showLoadingState() {
        const topModelsGrid = document.getElementById('topModelsGrid');
        const tableBody = document.getElementById('modelsTableBody');
        
        if (topModelsGrid) {
            topModelsGrid.innerHTML = '<div class="loading col-span-3"><div class="spinner"></div></div>';
        }
        
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-8"><div class="spinner"></div></td></tr>';
        }
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50';
        successDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    recomputeRatings() {
        if (this.filteredModels.length === 0) return;

        // Get raw model data for the filtered models
        const rawFilteredData = this.filteredModels.map(model => {
            // Extract the original model data without the evaluated ratings
            return {
                id: model.id,
                name: model.name,
                organization: model.organization,
                parameters: model.parameters,
                precision: model.precision,
                category: model.category,
                applicationTypes: model.applicationTypes,
                totalTokens: model.totalTokens,
                energyConsumedKwh: model.energyConsumedKwh,
                region: model.region,
                benchmarks: model.benchmarks,
                hardware: model.hardware,
                lastUpdated: model.lastUpdated
            };
        });

        // Re-evaluate models with relative ratings within the current filter
        const reevaluatedModels = this.calculator.evaluateModelsByCategory(rawFilteredData, this.currentCategory);

        // Update the filtered models with new ratings
        this.filteredModels = this.filteredModels.map(model => {
            const reevaluated = reevaluatedModels.find(m => m.id === model.id);
            if (reevaluated) {
                return {
                    ...model,
                    rating: reevaluated.rating,
                    efficiency: reevaluated.efficiency,
                    performance: reevaluated.performance,
                    composite: reevaluated.composite,
                    environmental: reevaluated.environmental
                };
            }
            return model;
        });
    }

    getModelRelativeRank(model) {
        const sortedByEfficiency = [...this.filteredModels].sort((a, b) => 
            b.efficiency.tokensPerKwh - a.efficiency.tokensPerKwh
        );
        const rank = sortedByEfficiency.findIndex(m => m.id === model.id) + 1;
        return `#${rank}`;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    getSampleData() {
        return [
            {
                "id": "phi-3-mini",
                "name": "Phi-3 Mini",
                "organization": "Microsoft",
                "parameters": 3800000000,
                "precision": "4-bit",
                "category": "small",
                "applicationTypes": ["text-generation", "reasoning"],
                "totalTokens": 1280000,
                "energyConsumedKwh": 0.45,
                "region": "us",
                "benchmarks": {
                    "arc": 68.5,
                    "hellaswag": 72.3,
                    "mmlu": 69.1,
                    "truthfulqa": 65.8,
                    "winogrande": 71.2,
                    "gsm8k": 67.4
                },
                "hardware": {
                    "gpu": "NVIDIA RTX 4090",
                    "memory": "24GB",
                    "powerConsumption": "450W"
                },
                "lastUpdated": "2024-01-15T10:30:00Z"
            },
            {
                "id": "llama-3-8b",
                "name": "Llama 3 8B",
                "organization": "Meta",
                "parameters": 8000000000,
                "precision": "8-bit",
                "category": "medium",
                "applicationTypes": ["text-generation", "translation", "summarization"],
                "totalTokens": 970200,
                "energyConsumedKwh": 0.45,
                "region": "us",
                "benchmarks": {
                    "arc": 72.8,
                    "hellaswag": 78.5,
                    "mmlu": 76.2,
                    "truthfulqa": 71.3,
                    "winogrande": 76.8,
                    "gsm8k": 73.5
                },
                "hardware": {
                    "gpu": "NVIDIA A100 80GB",
                    "memory": "80GB",
                    "powerConsumption": "275W"
                },
                "lastUpdated": "2024-01-14T15:45:00Z"
            },
            {
                "id": "gemma-2b",
                "name": "Gemma 2B",
                "organization": "Google",
                "parameters": 2000000000,
                "precision": "4-bit",
                "category": "small",
                "applicationTypes": ["text-generation", "translation"],
                "totalTokens": 1405600,
                "energyConsumedKwh": 0.45,
                "region": "us",
                "benchmarks": {
                    "arc": 65.2,
                    "hellaswag": 69.8,
                    "mmlu": 64.5,
                    "truthfulqa": 62.1,
                    "winogrande": 68.3,
                    "gsm8k": 63.7
                },
                "hardware": {
                    "gpu": "NVIDIA RTX 4090",
                    "memory": "24GB",
                    "powerConsumption": "450W"
                },
                "lastUpdated": "2024-01-16T09:20:00Z"
            }
        ];
    }

    // Utility methods
    formatParameters(params) {
        if (params >= 1000000000) {
            return (params / 1000000000).toFixed(1) + 'B';
        } else if (params >= 1000000) {
            return (params / 1000000).toFixed(1) + 'M';
        } else if (params >= 1000) {
            return (params / 1000).toFixed(1) + 'K';
        }
        return params.toString();
    }

    formatApplicationType(type) {
        return type.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    getTagColor(type) {
        const colors = {
            'text-generation': 'green',
            'translation': 'blue',
            'summarization': 'purple',
            'code-generation': 'yellow',
            'reasoning': 'green',
            'analysis': 'blue'
        };
        return colors[type] || 'gray';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SCERApp();
});

// Global functions for inline event handlers
window.showLeaderboard = () => window.app.showSection('leaderboard');
window.showMethodology = () => window.app.showSection('methodology');
window.showAbout = () => window.app.showSection('about');