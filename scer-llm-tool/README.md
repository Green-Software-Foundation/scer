# SCER Rating for AI Models (LLM) - Reference Implementation

A reference implementation of the [SCER for LLM Draft Specification](https://github.com/Green-Software-Foundation/scer/blob/dev/use_cases/SCER_FOR_LLM/SCER_For_LLM_Specification.md). This tool evaluates and compares Large Language Models based on their carbon efficiency, providing transparent ratings to help organizations make sustainable AI deployment decisions.

**🌐 Live Demo**: [https://green-software-foundation.github.io/scer/scer-llm-tool/](https://green-software-foundation.github.io/scer/scer-llm-tool/)

## 🌟 Features

- **Multiple Data Sources**: Choose from ML.ENERGY Leaderboard (recommended), Hugging Face LLM-Perf, or Sample Dataset
- **Real-time Data**: Fetches live energy and performance metrics from external sources
- **SCER Rating System**: A-E scale (similar to Nutri-Score) for carbon efficiency
- **Interactive Leaderboard**: Sort and filter models by SCER rating, efficiency, performance, and size
- **Detailed Model Analytics**: Click any model for comprehensive metrics including:
  - Energy efficiency (tokens/kWh)
  - Carbon footprint (CO₂e per 1k tokens)
  - Performance benchmarks
  - Hardware configuration
  - Environmental impact calculations
- **Data Source Transparency**: Click on data source name to view source details and URLs
- **Smart Data Refresh**: Reload data from current source with visual feedback
- **Automatic Fallback**: Seamlessly uses sample data if selected source is unavailable
- **Modern Clean UI**: Professional interface with excellent readability and accessibility
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **About & Methodology Pages**: Learn about SCER framework and calculation methods

## 🚀 Quick Start

### Prerequisites
- Modern web browser with JavaScript enabled
- Local web server (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Green-Software-Foundation/scer.git
   cd scer/scer-llm-tool
   ```

2. **Start a local server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

## 📊 SCER Rating System

The SCER rating evaluates models based on tokens generated per kilowatt-hour:

- **A (Excellent)**: ≥2,500 tokens/kWh
- **B (Good)**: 1,800-2,499 tokens/kWh
- **C (Average)**: 1,200-1,799 tokens/kWh
- **D (Poor)**: 600-1,199 tokens/kWh
- **E (Very Poor)**: <600 tokens/kWh

For complete details on the SCER framework, see the [official SCER for LLM Specification](https://github.com/Green-Software-Foundation/scer/blob/dev/use_cases/SCER_FOR_LLM/SCER_For_LLM_Specification.md).

## 🏗️ Project Structure

```
scer-llm-tool/
├── index.html                  # Main HTML structure
├── css/
│   ├── main.css               # Main styles and responsive design
│   └── rating-labels.css      # SCER rating badge styles
├── js/
│   ├── rating-algorithm.js    # SCER calculation engine
│   ├── huggingface-adapter.js # Hugging Face data integration (CSV)
│   ├── mlenergy-adapter.js    # ML.ENERGY data integration (stub)
│   └── main.js                # Main application logic
├── data/
│   └── sample-models.json     # Sample model data (fallback)
├── assets/                    # Images and static assets
└── README.md                  # This file
```

## 🔧 Technical Details

### SCER Algorithm

The rating calculation uses the following formulas:

```javascript
// Tokens per kWh
tokensPerKwh = totalTokens / energyConsumedKwh

// CO2e per 1k tokens
co2ePer1kTokens = (energyConsumedKwh * emissionFactor) / (totalTokens / 1000)

// Composite score (70% efficiency + 30% performance)
compositeScore = (efficiencyScore * 0.7) + (performanceScore * 0.3)
```

### Data Sources

The tool supports **multiple data sources** that can be selected via dropdown:

#### 1. ML.ENERGY Leaderboard ⭐ (Recommended - Most Current)
- **Website**: [ml.energy/leaderboard](https://ml.energy/leaderboard/)
- **Data Source**: [GitHub Repository](https://github.com/ml-energy/leaderboard/tree/master/data/llm_text_generation/chat)
- **Access Method**: Direct JSON file fetching from GitHub
- **Metrics**: Energy per request (Joules), throughput (tokens/s), TPOT, batch sizes
- **Hardware**: NVIDIA A100-SXM4-40GB (default)
- **Models**: Latest LLMs including Llama 3.1, Gemma 2, Mistral, Phi-3
- **Update Frequency**: Actively maintained (2025 data)
- **Age**: ✅ **Current** (regularly updated)

#### 2. Hugging Face LLM-Perf Leaderboard
- **Website**: [HF Space](https://huggingface.co/spaces/optimum/llm-perf-leaderboard)
- **Dataset**: [optimum-benchmark/llm-perf-leaderboard](https://huggingface.co/datasets/optimum-benchmark/llm-perf-leaderboard)
- **Access Method**: Direct CSV file download from repository
- **File Used**: `perf-df-pytorch-cuda-unquantized-1xA100.csv`
- **Metrics**: Latency, throughput, energy consumption, memory usage
- **Size**: ~3MB, 863 model configurations
- **Age**: ⚠️ ~10 months old (December 2024)

#### 3. Sample Dataset
- **Size**: 3 models (Phi-3 Mini, Llama 3 8B, Gemma 2B)
- **Purpose**: Offline use, testing, fallback
- **Always Available**: Yes
- **Age**: Static example data

### How Data Source Selection Works

1. Use the **"Data Source"** dropdown at the top of the leaderboard
2. Choose from: **ML.ENERGY Leaderboard** (recommended), Hugging Face LLM-Perf, or Sample Dataset
3. Data automatically refreshes when source changes
4. **Click on the data source name** to see a popup with:
   - **Clickable Website URL**: Opens the leaderboard website
   - **Clickable Data URL**: Opens the data repository
   - **Error details**: If something went wrong (shown in yellow)
5. **Color indicators**:
   - 🔵 **Blue text** = Working source with data
   - 🟡 **Yellow text** = Error occurred, using fallback
6. If selected source is unavailable, automatically falls back to sample data
7. Click anywhere outside the popup to close it

### How Data Refresh Works

1. Click the **"Refresh"** button in the leaderboard
2. Application fetches fresh data from selected source
3. Raw benchmark data is transformed to SCER format
4. Models are re-evaluated and ratings calculated
5. Leaderboard updates with new data
6. Automatic fallback to sample data if source fails

## 🎨 Design System

### Color Palette
- **Primary**: Green-to-blue gradient for branding
- **Background**: Clean white/light gray (#f8f9fa)
- **Text**: Dark gray (#212529) for excellent readability
- **Accents**: Green (efficiency), Blue (performance), Purple (composite)
- **SCER Badges**: Color-coded A-E ratings (Green=A, Red=E)

### Components
- **Clean Card Design**: White cards with subtle borders and shadows
- **SCER Badges**: Circular color-coded rating indicators with gradients
- **Interactive Tables**: Sortable, filterable, clickable rows
- **Modal Dialogs**: Full model details with organized sections
- **Responsive Grid**: Mobile-first layout system

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

We welcome contributions to improve the SCER LLM tool! This is a community-driven project under the Green Software Foundation.

### How to Contribute

1. **Fork the repository**
   ```bash
   # Fork https://github.com/Green-Software-Foundation/scer
   git clone https://github.com/YOUR-USERNAME/scer.git
   cd scer/scer-llm-tool
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/scer-llm-tool-improvement
   ```

3. **Make your changes**
   - Add features, fix bugs, or improve documentation
   - Test thoroughly on different browsers and devices
   - Follow existing code style and patterns

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scer-llm-tool): Add amazing feature"
   ```
   Use conventional commit format: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`

5. **Push to your fork**
   ```bash
   git push origin feature/scer-llm-tool-improvement
   ```

6. **Open a Pull Request**
   - Go to [Green Software Foundation SCER](https://github.com/Green-Software-Foundation/scer)
   - Click "New Pull Request"
   - Select your fork and branch
   - Provide clear description of changes
   - Reference any related issues

### Contribution Areas

- 🔍 **Data Sources**: Help integrate new credible benchmark sources
- 🐛 **Bug Fixes**: Report and fix issues
- 📊 **Features**: Propose and implement new features
- 📖 **Documentation**: Improve docs, add examples
- 🎨 **UI/UX**: Enhance design and accessibility
- ✅ **Testing**: Add tests, improve coverage

### Questions?

- Open an [Issue](https://github.com/Green-Software-Foundation/scer/issues) for bugs or feature requests
- Join [Discussions](https://github.com/Green-Software-Foundation/scer/discussions) for questions
- See [SCER Specification](https://github.com/Green-Software-Foundation/scer/blob/dev/use_cases/SCER_FOR_LLM/SCER_For_LLM_Specification.md) for framework details

## 📋 Key Challenges

The tool is functional, but the main challenge is **getting more credible, current data**. Three key research areas:

### 1. 🔍 Better Data Sources
- **Current Issue**: ML.ENERGY has only ~7 models, Hugging Face data is 10 months old
- **Research Needed**:
  - Contact Hugging Face team about API access or data updates
  - Find alternative sources (MLPerf, academic benchmarks, cloud providers)
  - Improve ML.ENERGY integration (model discovery, multi-GPU support)

### 2. 🤖 AI-Powered Data Extraction
- **Opportunity**: Use LLMs to extract energy/carbon metrics from public sources
- **Potential**:
  - Automatically parse model cards, papers, technical documentation
  - Extract metrics from research publications and benchmarks
  - Verify and validate AI-extracted data against known sources
  - Scale data collection without manual effort

### 3. 👥 Crowdsourced Data
- **Opportunity**: Community-contributed measurements and evaluations
- **Potential**:
  - User-submitted benchmark results (with verification)
  - Community voting/validation for data quality
  - Distributed measurement efforts
  - Incentive structure for contributors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Green Software Foundation](https://greensoftware.foundation/) for the SCER framework
- [SCER for LLM Specification](https://github.com/Green-Software-Foundation/scer/blob/dev/use_cases/SCER_FOR_LLM/SCER_For_LLM_Specification.md) - Official specification document
- [Hugging Face](https://huggingface.co/) for model performance data
- [ML.ENERGY Leaderboard](https://ml.energy/leaderboard/) for energy benchmark data
- [CodeCarbon](https://codecarbon.io/) for energy measurement methodology

## 📞 Contact

- Project Repository: [Green Software Foundation SCER](https://github.com/Green-Software-Foundation/scer)
- Project Issues: [GitHub Issues](https://github.com/Green-Software-Foundation/scer/issues)
- Discussions: [GitHub Discussions](https://github.com/Green-Software-Foundation/scer/discussions)

---

**Promoting sustainable AI development through transparent carbon efficiency rating.** 🌱