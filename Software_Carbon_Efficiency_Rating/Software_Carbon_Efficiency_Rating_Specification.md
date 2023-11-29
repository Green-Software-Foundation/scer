# Software Carbon Efficiency Rating (SCER) Specification
## Version 0.1

## Table of Contents

1. [Introduction](#1-introduction)
2. [Common Components of a SCER Specification](#2-common-components-of-the-scer-specification)
    1. [Software Categorization](#2.1-software-categorization-considerations)
    4. [Benchmarking Specification](#2.2-benchmarking-specification)
    5. [Rating Specification](#2.3-rating-specification)
6. [Creating Category-Specific SCER Specifications](#3-creating-category-specific-scer-specifications)
7. [Appendices](#4-appendices)
8. [References](#5-references)

---

### 1. Introduction

As digital transformation accelerates, the role of software in global carbon emissions has become more significant, necessitating the development of standard methodologies to assess and mitigate environmental impact of software:

- The Rising Carbon Footprint of Software: The digitization of nearly every aspect of modern life has led to a surge in demand for software solutions, subsequently increasing the energy consumption and carbon emissions of the IT sector.

- The Need for a Unified Approach: Currently, the lack of a standardized system for measuring and comparing the carbon efficiency of software products hinders effective management and reduction of carbon footprints across the industry. 

Hence, the birth of the Software Carbon Efficiency Rating (SCER) Specification.

The Software Carbon Efficiency Rating (SCER) Specification is a pioneering framework designed to address the increasing concerns related to the carbon footprint of software. It serves as a generic framework for evaluating software carbon efficiency, and it can be further refined and adapted to create nuanced, category-specific carbon efficiency ratings:

- Aim and Scope: This specification aims to introduce a consistent, transparent, and scalable approach to carbon efficiency evaluation. It defines the scope of the SCER Specification, detailing its applicability to various software types and the expected outcomes of its implementation.

- Target Audience: This specification is intended for a broad audience encompassing software developers, IT professionals, policy-makers, and business leaders who are directly or indirectly involved in the creation, deployment, and use of software.
- Terminology:
  - **USF**: Unit of Software Function
  - **Carbon Efficiency:** The amount of carbon dioxide equivalent (CO2e) emitted per USF.
  - **SCER**: Software Carbon Efficiency Rating
  - **SCI:** Software Carbon Intensity
- Structure of the Document: This document is composed of the following major sections:
  - a section that descrubes the common components of a SCER specification, namely, Software Categorization, Benchmarking, and Rating.
  - a section that provides guidelines to create a category-specific SCER specification based on the above common components.
  - a section that provides an example implementation to demonstrate how to use the guidelines to create a domain-specific SCER specification.
  
This document should be used as a living guide, with periodic updates of different versionings, to ensure it remains current with the latest developments in technology and environmental standards.

### 2. Common Components of the SCER Specification
#### 2.1 Software Categorization Considerations
There needs to be a standard way of categorizing software, so that the carbon efficiencies of different software in the same category can be evaluated and rated - meaning, comparing apples to apples, not apples to oranges. 

##### 2.1.1 Common Components of a Software Categorization
The software applications that belong to the same category exhibit similar characteristics in the following aspects:
- **Purpose and Functionality:** categorize software based on primary and secondary functionalities.
  - **Primary Purpose:** Adobe Photoshop for image editing as its primary function.
  - **Secondary Functions:** Microsoft Excel offers data analysis as a secondary function beyond its primary spreadsheet capabilities.
  - **Example Categories:**
      - **Productivity:** Microsoft Office: proprietary office suite; LibreOffice: Open-source office suite.
      - **Music Entertainment:** Spotify, Apple Music: music streaming service. 

- **Platform and Deployment:** Criteria for determining the software's platform and deployment nature.
  - **Platform:** WhatsApp mobile application for communication on smartphones.
  - **Deployment Type:** Salesforce CRM as a cloud-based SaaS offering for organizations.
  - **Example Categories:**
    - **Desktop Applications:** Adobe Premiere Pro: Video editing software; Autodesk 3ds Max: 3D modeling and rendering software.
    - **Mobile Applications:** Instagram: Social media and photo-sharing app; WhatsApp: Instant messaging app.

- **End User Base:** Understanding the scale and target audience of the software.
  - **Target Audience:** Zoom for individual and enterprise-level video conferencing solutions.
  - **Scale of Deployment:** WordPress used by bloggers for individual websites up to large-scale publishing platforms.
  - **Example Categories:**
    - **Individual Users:** WinRAR: File archiving utility for individual use. Media Player: Media playback software for individuals.
    - **Enterprise Users:** SAP ERP: Enterprise resource planning for businesses. Oracle Database: Database management for corporate environments.

The following are example tables that can be used for evaluating software categorization:

- Office Suite Software Category Example:

    | Software Applications| Purpose and Functionality | Platform and Deployment |End User Base|
    | -------- | :---------:| :---------:|:---------:|
    | Microsoft Office Suite | S | S  |S  |
    | Libre Office |  S | S  |S  |
    | Open Office |  S | S  |S  |

    **S**: Similar or Compatible<br>
    **N**: Not similar

- Relational Database Server Category Example:

    | Software Applications| Purpose and Functionality | Platform and Deployment |End User Base|
    | -------- | :---------:| :---------:|:---------:|
    | MiSQL | S | S  |S  |
    | PSQL |  S | S  |S  |
    | SQLite |  S | **N**  |S  |

    In this example, SQLite is a light weight database which is mostly used and deployed in mobile phone platforms that are significantly different from MiSQL and PostgresSQL, so SQLite should not belong in this category, and should not be used for SCER rating in this category.

##### 2.1.2 Optional Components of a Software Categorization

The following aspects may be optional in determining if the software application are in the same category:

- **Type of License:** Differentiating software based on open-source or proprietary status and licensing models.
  - **Open Source vs. Proprietary:** Linux kernel as open-source software vs. Microsoft Windows as proprietary software.
  - **Licensing Model:** Subscription-based model like Adobe Creative Cloud versus a one-time purchase software like Final Cut Pro.
  - **Example Categories:**
    - **Open Source:** Mozilla Firefox: Open-source web browser. LibreOffice: Open-source office suite.
    - **Proprietary:** Microsoft Office: Proprietary office suite. Adobe Acrobat: Proprietary PDF solution.

- **Technical Complexity:** Evaluating the software's architecture and dependencies.
  - **Architecture:** Docker containers showcasing microservices architecture.
  - **Dependencies:** Node.js applications often depend on numerous packages from npm (node package manager).
  - **Example Categories:**
    - **Data Processing:** Hadoop: Framework for distributed storage and processing of large data sets. Elasticsearch: Search and analytics engine for all types of data.
    - **Content Management Systems:** Joomla: Content management system for web content. Drupal: Content management system for complex websites.

- **Integration and Ecosystem:** Assessing compatibility and ecosystem integration.
  - **Compatibility:** Slack integrates with numerous other productivity tools like Trello, Asana, and Google Drive.
  - **Ecosystem:** Apple’s iOS apps that are part of the broader Apple ecosystem, designed to work seamlessly with other Apple devices and services.
  - **Example Categories:**
    - **Customer Relationship Management (CRM):** Salesforce: CRM solution with extensive integration capabilities. HubSpot CRM: Inbound marketing, sales, and service software with integration features.
    - **Development Tools:** JetBrains IntelliJ IDEA: Integrated development environment for software development. Microsoft Visual Studio: Comprehensive development environment with extensive integrations.
    
- **Regulatory and Compliance Considerations:** Ensuring compliance with applicable regulations and standards.
  - **Healthcare Software:** HIPAA-compliant patient management systems like Cerner.
  - **Financial Software:** SEC-compliant trading platforms like TD Ameritrade.
  - **Example Categories:**
    - **Financial Services:** Thomson Reuters Eikon: Financial data and analytics tool. FactSet: Financial data and software for investment professionals.
    - **Telecommunications:** Amdocs: Software and services for communications, media, and financial services providers. Ericsson: Network software for telecom operators.

- **Feedback and Market Recognition:** Using market recognition and user feedback for category validation.
  - **User Reviews:** Yelp for restaurant and business reviews.
  - **Awards and Recognition:** Autodesk AutoCAD receiving awards for its CAD design software capabilities.
  - **Example Categories:**
    - **Web Browsers:** Google Chrome: Highly rated for speed and integration with Google services. Mozilla Firefox: Praised for privacy features and open-source development.
    - **E-Commerce Platforms:** Shopify: Widely recognized platform for creating online stores. Magento: Renowned open-source e-commerce platform.

- **Industry Vertical:** Classifying software according to the relevant industry vertical. 
  - **Healthcare:** Epic Systems for electronic health records management.
  - **Finance:** QuickBooks for accounting in small to mid-sized businesses.
  - **Example Categories:**
    - **Healthcare:** McKesson: Medical supplies ordering and healthcare information technology. Allscripts: Provider of electronic record, practice management, and other clinical solutions.
    - **Education:** Blackboard: Learning management system for education providers. Canvas: Web-based learning management system for educational institutions.

- **Consistent Review and Update:**
  - **Periodic Review:** Google Chrome, which releases updates frequently to reflect the latest web standards and security practices.
  - **Benchmark against Peers:** Comparing Microsoft Office 365 to other productivity suites like Google Workspace for feature set and market position.
  - **Example Categories:**
    - **Operating Systems:** Windows 10: Regular feature updates and security patches. macOS: Annual updates with feature enhancements and security improvements.
    - **Security Software:** Symantec Norton: Consistent updates for virus definitions and security features. McAfee: Frequent updates to maintain security and performance standards.

Note: 
1. Should SaaS (Software s a Service) be part of the software categorization? It most likely is part of the software categorization for the SCER purpose, such as music streaming service. It seems that SCER really means software *induced* carbon efficiency rating - meaning, the carbon efficiencies due to running of the software application, regardless if the software is run as a service, or run on a desktop.
2. Should these aspects of categorizing software be OR or AND relationship? Does all software applications belonging to the same category have to have the same answer for each aspect? For example, should microsoft office and libre office belong to the same office suite software category for the purpose of SCER rating, even though one is proprietary, the other is open source?
3. Are these too heavy? Any other considerations missing?

---

#### 2.2 Benchmarking Specification

This section of the SCER Specification provides a detailed description of the benchmarking process for measuring the carbon efficiency of software applications. It includes the selection of appropriate metrics, the definition of the benchmarking workload, the necessary test environment setup, and the methodology for executing the benchmarks.

##### 2.2.1 Definition of Benchmarks

Benchmarks serve as the comparative performance standards against which software applications are evaluated for their [Software Carbon Intensity (SCI)](https://github.com/Green-Software-Foundation/sci/blob/main/Software_Carbon_Intensity/Software_Carbon_Intensity_Specification.md) scores or [Social Cost of Carbon (SCC)](https://www.brookings.edu/articles/what-is-the-social-cost-of-carbon/#:~:text=The%20social%20cost%20of%20carbon%20(SCC)%20is%20an%20estimate%20of,a%20ton%20of%20carbon%20emissions.) dollars. The default measurement of benchmarks is in SCI scores.

##### 2.2.2 Unit of Software Function (USF)

The "Unit of Software Function" or USF refers to the most commonly used function of the software, such as:

- **Read/Write Operations** for database software
- **Rendering a Frame** for graphical software or video games
- **Handling a Web Request** for web servers
- **Processing a Data Block** for data processing software

##### 2.2.3 Standardized Tests or Benchmarking Workload

For each category of software, a standardized test can be developed to measure the functional utility of the software, which is then used to calculate its SCI score. The tests will simulate the most commonly used function of the software.

The workload used for benchmarking should be representative of real-world scenarios to ensure the results are relevant and actionable.

- **Workload Profiles**: Detailed descriptions of the different types of workload the software will be subjected to during the benchmarking process.
- **Workload Metrics**: The quantitative measures of each workload profile, such as the number of simultaneous users, data size, and operation mix.

Example Workload Profiles:
- For a video streaming service, the workload might simulate streaming at various resolutions.
- For a customer relationship management (CRM) system, the workload could involve a mix of database reads/writes, report generations, and user queries.

##### 2.2.4 SCI Score Formula

The SCI Score for a software application will be calculated as follows:

$$\ SCI\ Score = \frac{CO2e\ emissions}{USF} \$$

Where CO2e emissions are measured in kilograms and USF is determined by the benchmark test.


##### 2.2.5 Test Environment

The test environment must be standardized to minimize variability in the benchmark results.

- **Hardware Specifications**: A description of the physical or virtual hardware on which the software will be tested, including processor, memory, storage, and networking details.
- **Software Configuration**: The operating system, middleware, and any other software stack components should be specified and standardized.
  
Example Test Environments:
- A specified cloud instance type with a defined operating system and resource allocation.
- A physical server with controlled ambient temperature and power supply to ensure consistent results.

##### 2.2.6 Test Methodology

A detailed, repeatable method for conducting the benchmarks.

- **Setup Instructions**: Step-by-step guidance to prepare the test environment, including installation and configuration of the software and tools.
- **Execution Steps**: A sequential list of actions to perform the benchmark, including starting the software, initiating the workload, monitoring performance, and recording results.
- **Result Collection and Analysis**: Guidelines for gathering the data, ensuring its integrity, and analyzing it to derive meaningful insights.

Example Test Methodology:
- For a web application, steps might include setting up a load generator, executing predetermined tasks, and measuring response times and energy consumption.
- For a data processing application, it might involve running specific data sets through the software and measuring the time and energy required for processing.

Each of these components should be defined with sufficient detail to enable consistent replication of the benchmarking process across different environments and software versions. This standardization is crucial for ensuring that the SCER ratings are reliable and comparable across different software applications.

In summary, the following table can serve as a template or checklist when defining benchmarks:

| Benchmark Measurement| Benchmark Workload | Test Environment |Test Methodology|
| -------- | ---------| ---------|---------|
| <li>kWh<li>SCC<li>SCI (default) <li>CO2e, or <li>Other | <li> Unit of Software Function (USF) <li> Number of times to execute USF | <li>Hardware specifications<li>Software Configuration  |<li>Setup Instructions<li>Execution Steps<li>Result Collection and Analysis  |

---
*Benchmark measurement shall be carbon related, by default is in SCI scores. However, if the benchmarking is done in a controlled environment, all other variables related to carbon emission are being equal, then benchmarking can be measured in energy consumed (e.g. kWh) rather than in SCI.*

#### 2.3 Rating Specification
##### 2.3.1 **Rating Components:**
The common components of a rating specification includes the following:
1. Rating Scale: Define the rating scale and the criteria for each rating level.
2. Evaluation Methodology: Detail the evaluation methodology for converting benchmark results to ratings.
3. Reporting and Disclosure: Standardized format for rating disclosure.
   
##### 2.3.2 **Rating Algorithm:**
To compute the SCER (Software Carbon Efficiency Rating) based on SCI Score performance in relation to peer software within the same category.

1. **Data Collection**: Gather SCI Scores from multiple software applications within the same category.
2. **Normalization**: Normalize SCI Scores to create a common scale.
3. **Ranking**: Rank software based on normalized SCI Scores.
4. **Percentile Calculation**: Calculate the percentile position for each software application:

$$\ Percentile\ Position = \left( \frac{Rank - 1}{Total\ Number\ of\ Submissions\ -\ 1} \right) \times 100 \$$

5. **Rating Assignment**: Based on the percentile position, assign a rating according to the pre-defined scale. A default rating is A to C.

##### 2.3.3 **Rating Example**
Here is a SCER rating example, where the SCI scores of 5 software applications in the same category are collected. Lower SCI (Software Carbon Intensity) scores indicate higher software carbon efficiency. The rating scale includes labels A through C:

- **A**: Exceptionally efficient (SCI scores above the 90th percentile).
- **B**: Above average efficiency (SCI scores from the 60th to 90th percentile).
- **C**: Average to inefficient (SCI scores below the 60th percentile).

**Collected SCI Scores:**

- Software 1: SCI Score of 100
- Software 2: SCI Score of 150
- Software 3: SCI Score of 160
- Software 4: SCI Score of 200
- Software 5: SCI Score of 250

**Rating Assignment Process:**

###### Step 1: Data Collection

SCI Scores for five software applications have been collected.

###### Step 2: Ranking

The software applications are ranked by SCI Score, from lowest to highest:

1. Software 1: 100
2. Software 2: 150
3. Software 3: 160
4. Software 4: 200
5. Software 5: 250

###### Step 3: Percentile Calculation

Percentile positions are calculated using the formula:

$$\ Percentile\ Position = \left( \frac{Rank - 1}{Total\ Number\ of\ Submissions\ -\ 1} \right) \times 100 \$$

- Software 1: 0%
- Software 2: 25%
- Software 3: 50%
- Software 4: 75%
- Software 5: 100%

###### Step 4: Rating Assignment

Using the rating scale:

- **A**: Above 90%
- **B**: 60% to 90%
- **C**: Below 60%

###### Final Ratings by Efficiency

- Software 5: **A**
- Software 4: **B**
- Software 1: **C**
- Software 2: **C**
- Software 3: **C**


The final ratings reflect the carbon efficiency of the software applications, with Software 1-3 being average to inefficient, Software 4 above average, and Software 5 being exceptionally efficient.

In summary, the following table can serve as a template or checklist when rating:

| Rating Scale | Rating Algorithm | Reporting and Disclosure |
| -------- | ---------| ---------|
| e.g. A - C, or A, A+, A++, or AAA, etc. Default is A (>90%), B (60-89%),C (< 60%) |e.g. getting data, calculate mean, average etc. | e.g. rating assignment and reporting |
---

### 3. Creating Category-Specific SCER Specifications

This section describes guidelines for adapting the SCER Specification to specific software categories.

Different industries may require different ways of benchmarking and rating system for software. Therefore, this specification is defined with flexibility in mind so that it can be adapted for different industry use cases. This means that **this SCER specification is a specification of specification, or a meta-specification.** Category-specific specification can be derived from this base specification. A separate document describes an example of how to use the base specification to create a category specific specification, and examples were given on how to create the category specific specification.

---

### 4. Appendices

Supporting documents, example calculations, and reporting templates.

---

### 5. References

List of references used in the creation of the SCER Specification.

---

