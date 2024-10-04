---
version: 0.0.1
---
# Software Carbon Efficiency Rating (SCER) Specification

## Introduction

In the context of global digital transformation, the role of software in contributing to carbon emissions has become increasingly significant. This necessitates the development of standardized methodologies for assessing the environmental impact of software systems.

Rationale:

- The Rising Carbon Footprint of Software: The digitization of nearly every aspect of modern life has led to a surge in demand for software solutions, subsequently increasing the energy consumption and carbon emissions of the IT sector.
- The Need for a Unified Approach: Currently, the lack of a standardized system for labeling the carbon efficiency of software products hinders effective management and reduction of carbon footprints across the industry. 

This document aims to establish the Software Carbon Efficiency Rating (SCER) Specification, a standardized framework for labeling the carbon efficiency of software systems. The SCER Specification aims to serve as a model for labeling software products according to their Software Carbon Intensity (SCI), and it is adaptable for different software categories.


## Scope

This specification provides a framework for displaying, calculating, and verifying software carbon efficiency labels. By adhering to these requirements, software developers and vendors can offer consumers a transparent and trustworthy method for assessing the environmental impact of software products.

It outlines the label format, presentation guidelines, display requirements, computation methodology used to determine the software's carbon efficiency, and the requirements for providing supporting evidence to demonstrate the accuracy of the carbon efficiency claims.

This specification is intended for a broad audience involved in the creation, deployment, or use of software systems, including but not limited to:
- Software developers
- IT professionals
- Policy-makers
- Business leaders


## Normative references

ISO/IEC 21031:2024
Information technology — Software Carbon Intensity (SCI) specification.

ISO/IEC 40500
Information technology — W3C Web Content Accessibility Guidelines (WCAG) 2.0.

ISO/IEC 18004:2024
Information technology — Automatic identification and data capture techniques — QR code bar code symbology specification.

## Terms and definitions

For the purposes of this document, the following terms and definitions apply.

ISO and IEC maintain terminological databases for use in standardization at the following addresses:
- ISO Online browsing platform: available at https://www.iso.org/obp
- IEC Electropedia: available at http://www.electropedia.org/

> [!NOTE]
> TODO: Update these definitions

- Software Application: TBD
- Software Carbon Efficiency: TBD
- Software Carbon Intensity: TBD
- Carbon: TBD
- Functional Unit: TBD (From SCI)
- Manifest File: TBD
- QR Code: TBD


The following abbreviations are used throughout this specification:

> [!NOTE]
> TODO: Update these abbreviations
- SCI
- SCER

> [!NOTE] 
> For ease of ref, removed in final spec.
> - Requirements – shall, shall not
> - Recommendations – should, should not
> - Permission – may, need not
> - Possibility and capability – can, cannot

## Core Requirements

### Ease of understanding
A label that is hard to understand or requires expertise unavailable to most software consumers would defeat the purpose of adding transparency and clarity.

So, the SCER shall use common terms on the label instead of more scientific terminology. 

Common terms and their scientific equivalent Shall be defined clearly in the SCER specification to avoid interpretation risks.

SCER labels shall be uncluttered and have a clear and simple design that Shall be easily understood.

### Ease of Verification
The SCER label Shall make it easy for a consumer of a software application to verify any claims made.

Consumers should have all the information they need to verify any claims made on the label and to ensure the underlying calculation methodology or any related specification has been followed accurately.

### Accessible
The SCER label and format shall be accessible to and meet accessibility specifications.

### Language
The SCER label Should be written using the English language and alphabet.
    
## Calculation Methodology

The SCI shall be used as the calculation methodology for the SCER label.

Any computation of a SCI score for the SCER label SHALL adhere to all requirements of the SCI specification.
 
> Note: SCI is a Software Carbon Efficiency Specification computed as a "Carbon per Functional Unit" of a software product. For example, Carbon per Prompt for a Large Language Model.

## Presentation Guidelines

Components of a SCER Label

### SCI Score:
The presentation of the SCI score Shall follow this template

`[Decimal Value] Carbon per [Functional Unit]`
  
- Where `[Decimal Value]` is the SCI score itself
- Where the common term `Carbon` Shall be used to represent the more technical term `CO2e` (Carbon Dioxide Equivalent)
- The symbol `/` Shall Not be used in place of `Per`
- Where `[Functional Unit]` is text describing the Functional Unit as defined in the SCI calculation for this software application
    
### SCI Version
The SCI version Should be visible, even in small sizes.

The SCI version Shall describe which version of the SCI specification this SCER label complies with and have the following format:

`[Short Name] [Version]`

- Where `[Short Name]` is the abbreviated version of the SCI specification this SCER label is representing
- Where `[Version]` is the official SCI specification version this label refers to.

For example:
- `SCI 1.1`
- `SCI AI 1.0`

### QR Code
The QR Code Shall be a URL represented as a QR code as per ISO/IEC 18004:2024

The URL Shall point to a publicly accessible website where you can download a manifest file that meets the requirements in the *Supporting Evidence Section*

The URL Shall Not require a login, and it Shall be publicly accessible by anonymous users or non-human automated bots/scripts.

## Display Requirements

The SCER Label Shall conform to this layout: 

> [!NOTE]
> TODO: Update with an image of the label and any written display guidance.

- Color: ??
- Size: ??
- Placement: ??
- Font: ??
- Example: ??

## Supporting Evidence
Per the presentation guidelines, the SCER label will link to a manifest file that provides evidence to support any claims made on the label.

The manifest file Shall meet three criteria to pass as supporting evidence.

### Conformance
Evidence that the underlying SCI requirements have been met in the computation of the SCI score.

The Manifest File Shall clearly describe the Software Boundary per the SCI specification.

The Manifest File Shall follow the Impact Manifest Protocol Standard for communicating environmental impacts.

The Manifest File should use granular data that aligns with SCI recommendations.

### Correctness
Correctness is confirming the numbers in the manifest file match the information on the SCER label.

The Manifest File shall have an aggregate value for the SCI score that matches the reported score on the SCER label.

The Manifest File shall have a Functional Unit that matches the reported Functional Unit on the SCER label.

### Verification
Verification is the act of confirming the evidence supports the claim.

Verification of a SCER label Shall be possible using open source software and open data.

Verification Shall be free for the end user and Shall Not require purchasing licenses for software or data or logging into external systems.

If Verification requires access to data, that data Shall also be publicly available and free to use. 


### 4. Appendices

Supporting documents, example calculations, and reporting templates.

---

### 5. References

List of references used in the creation of the SCER Specification.

---

