# SCER Specification for Relational Database Server Software

## Version 0.1

### Abstract

The Software Carbon Efficiency Rating (SCER) for Relational Database Server Software provides a framework for assessing the carbon efficiency of database management systems (DBMS) based on energy consumption and operational efficiency.

### Table of Contents

1. [Introduction](#1-introduction)
2. [Objective](#2-objective)
3. [Terminology](#3-terminology)
4. [Scope](#4-scope)
5. [Software Categorization](#5-software-categorization)
6. [Benchmarking](#6-benchmarking)
7. [Rating System](#7-rating-system)
8. [Rating Calculation Algorithm](#8-rating-calculation-algorithm)
9. [Compliance and Verification](#9-compliance-and-verification)
10. [Future Directions](#10-future-directions)

---

### 1. Introduction

Database servers are integral to IT infrastructure with substantial energy footprints. Enhancing their carbon efficiency is vital for minimizing the environmental impact of data-centric operations worldwide.

### 2. Objective

To define and implement a standard that measures and rates the carbon efficiency of relational database server software, encouraging industry progression towards more sustainable practices.

### 3. Terminology

- **SCER**: Software Carbon Efficiency Rating
- **DBMS**: Database Management System
- **OPS/Watt-hour**: Operations Per Second per Watt
- **Carbon Footprint**: The total CO2e emissions associated with the DBMS across its lifecycle.

### 4. Scope

This standard applies to relational database server software encompassing open-source and proprietary systems.

### 5. Software Categorization

Database server software is categorized based on:

- Scale: small, medium, large
- Use case: transactional, analytical, hybrid
- Deployment model: on-premises, cloud-based, hybrid

### 6. Benchmarking

Benchmarking focuses on:

- **OPS/Watt-hour**: Database operations executed per watt hour of power consumed.
- **Transaction Efficiency**: Energy consumed per completed transaction.
- **Query Optimization**: Energy cost of executing complex queries.

### 7. Rating System

SCER classifications:

- **A**: Highly efficient operations (>X OPS/Watt-hour), advanced query optimization, low energy per transaction.
- **B**: Moderately efficient ([Y-X] OPS/Watt-hour), standard query optimization, average energy per transaction.
- **C**: Less efficient (<Y OPS/Watt-hour), basic query optimization, higher energy per transaction.

### 8. Rating Calculation Algorithm

#### 8.1 Data Collection
Measure the OPS/Watt-hour, transaction efficiency, and query optimization capability.

#### 8.2 Normalization
Normalize data against a standard workload for different use cases.

#### 8.3 Composite Score
Generate a composite score from normalized metrics.

#### 8.4 Rating Assignment
Calculate the percentile rank using the formula:


$$\ Percentile\ Rank = \left( \frac{DBMS\ Rank\ -\ 1}{Total\ DBMS\ Submissions\ -\ 1} \right) \times 100 \$$

Then assign a SCER based on the percentile:

- Top 10%: **A**
- 11% to 50%: **B**
- 51% and below: **C**

### 9. Compliance and Verification

An independent body will verify compliance through audits and standardized tests.

### 10. Future Directions

The SCER specification will be reviewed and updated annually to reflect new advancements and best practices.

---

This document sets forth a protocol for quantifying and enhancing the carbon efficiency of relational database server software, contributing to global climate change mitigation efforts through smarter and more sustainable technology utilization.




---

# Hypothetical SCER Ratings for Relational Database Server Software

This document provides an example of how the SCER Specification could be applied to five hypothetical relational database management systems (RDBMS).

## Example Database Server Software

1. ORD
2. MiSQL
3. MSQL
4. PSQL
5. IDb

## Hypothetical SCER Calculation Steps

### Step 1: Data Collection

- ORD: 200 OPS/Watt-hour
- MiSQL: 180 OPS/Watt-hour
- MSQL: 150 OPS/Watt-hour
- PSQL: 170 OPS/Watt-hour
- IDb: 160 OPS/Watt-hour

### Step 2: Normalization

Data is normalized against a standard workload. For simplicity, let's assume the workload normalizes the data as is.

### Step 3: Composite Score
Each DBMS receives a composite score based on OPS/Watt-hour, transaction efficiency, and query optimization. (Note: The other factors are not provided here, so the OPS/Watt-hour will stand in for the composite score in this example.)
The composite score is assumed to be the OPS/Watt-hour for simplicity.

### Step 4: Ranking
The software is ranked based on the composite score:

1. ORD: 200 (Rank 1)
2. PSQL: 170 (Rank 2)
3. MiSQL: 180 (Rank 3)
4. IDb: 160 (Rank 4)
5. Microsoft SQL Server: 150 (Rank 5)

### Step 5: Percentile Calculation

Using the formula:


$$\ Percentile\ Rank = \left( \frac{DBMS\ Rank\ -\ 1}{Total\ DBMS\ Submissions\ -\ 1} \right) \times 100 \$$


- **ORD**: `0%` (Calculated as `((1 - 1) / (5 - 1)) * 100`)
- **PSQL**: `25%` (Calculated as `((2 - 1) / (5 - 1)) * 100`)
- **MiSQL**: `50%` (Calculated as `((3 - 1) / (5 - 1)) * 100`)
- **IDb**: `75%` (Calculated as `((4 - 1) / (5 - 1)) * 100`)
- **MSQL**: `100%` (Calculated as `((5 - 1) / (5 - 1)) * 100`)

### Step 6: Rating Assignment

Based on their percentile rank, the SCER ratings are assigned as follows:

- **ORD**: **C** (0% - Below 60%)
- **PSQL**: **C** (25% - Below 60%)
- **MiSQL**: **C** (50% - Below 60%)
- **IDb**: **B** (75% - Between 60% and 90%)
- **MSQL**: **A** (100% - Above 90%)

## Conclusion

The fictional ratings based on the hypothetical data are as follows:

- **ORD**: Rating C
- **PSQL**: Rating C
- **MiSQL**: Rating C
- **IDb**: Rating B
- **MSQL**: Rating A

These illustrative ratings would help consumers and organizations select database server software with better environmental performance.

---

End of SCER Specification for Relational Database Server Software Document.


