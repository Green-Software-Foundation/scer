# Example Specification: Measuring Carbon Efficiency of PostgreSQL on AWS m5.large

## Objective
To benchmark the carbon efficiency of PostgreSQL running on an AWS m5.large instance by measuring its energy consumption during a typical database workload.

## Test Environment

### 1. Hardware Specifications
- **Instance Type:** AWS m5.large
- **vCPU:** 2 vCPUs (Intel Xeon Platinum 8175M)
- **Memory:** 8 GiB RAM
- **Storage:** 100 GiB EBS General Purpose SSD (gp3)
- **Network:** Up to 10 Gbps network bandwidth
- **Operating System:** Ubuntu 22.04 LTS

### 2. Software Configuration
- **PostgreSQL Version:** 14.4
- **Database Configuration:**
  - **Max Connections:** 100
  - **Shared Buffers:** 2 GiB
  - **Work Mem:** 16 MB
  - **Maintenance Work Mem:** 64 MB
- **Workload Tool:** `pgbench` (PostgreSQL benchmarking tool)
- **pgbench Parameters:** 
  - **Scale Factor:** 100 (creates a 1 GB database)
  - **Number of Clients:** 10
  - **Number of Transactions:** 100,000

## Benchmark Workload Definition

### 1. Unit of Software Function (USF)
- **Definition:** Execution of 100,000 transactions by 10 concurrent clients on the PostgreSQL instance. TPC-C or TPC-H dataset?

### 2. Execution Frequency
- The USF will be executed 10 times to ensure consistency and account for any variability in performance.

## Measurement Metrics

### 1. Energy Consumption (kWh)
- **Tool:** Use AWS CloudWatch and Kepler to measure the energy consumption of the m5.large instance during the benchmark.

### 2. Carbon Emission (CO2e)
- **Calculation:** Multiply the measured energy consumption (in kWh) by the region-specific carbon intensity factor (grams of CO2e per kWh) for the AWS data center region where the instance is located.

## Test Methodology

### 1. Setup Instructions
1. Launch an AWS m5.large instance in the desired region with Ubuntu 22.04 LTS.
2. Install PostgreSQL 14.4 using the official PostgreSQL repository.
3. Configure PostgreSQL with the parameters specified above.
4. Install `pgbench` on the instance.
5. Install `kepler` on the instance.
6. Create a test database and initialize `pgbench` with a scale factor of 100.

### 2. Execution Procedure
1. Start monitoring energy consumption using kepler and AWS CloudWatch.
2. Run `pgbench` with 10 clients executing 100,000 transactions.
3. Repeat the benchmark 10 times, recording the energy consumption and transaction performance for each run.

### 3. Result Collection
- Collect energy consumption data from the monitoring script and CloudWatch logs.
- Calculate the average energy consumed per USF across the 10 runs.
- Calculate the total CO2e emissions using the energy consumption and carbon intensity factor.

## Certification and Reporting

### 1. SCER (Software Carbon Efficiency Rating)
- ??

### 3. Transparency and Reproducibility
- Publish the benchmark methodology, configuration details, and results openly to allow third-party verification and reproducibility.

## Discussion Points
- Different stages: Disclosure, Categorization, Benchmarking (this), Rating
- Feasibility of applying this benchmarking methodology across different cloud environments and regions.
- How to incentivize other database management systems to adopt a similar standardized benchmarking process.
- Potential challenges in maintaining the consistency of energy measurements across various AWS regions.
