# Chapter 9: Modelling What Matters

## Learning Objectives

By the end of this chapter, you will be able to:

- Select and apply appropriate modeling techniques for different types of requirements and stakeholders
- Create clear, effective visual models that communicate complex information simply
- Use models to validate requirements and identify gaps or inconsistencies

---

## Introduction: Why This Chapter Matters

Models are powerful tools for understanding, communicating, and validating requirements. They help stakeholders visualize complex systems, processes, and relationships in ways that text alone cannot achieve. Yet many BAs struggle with modeling—they either avoid it entirely or create overly complex diagrams that confuse rather than clarify.

This chapter focuses on practical modeling techniques that BAs can use to enhance their requirements work. We'll explore different types of models, when to use each one, and how to create models that actually help rather than hinder understanding.

---

## The Value of Visual Models

### Why Models Matter
- **Clarify complexity** by breaking down large problems into manageable pieces
- **Reveal relationships** between different parts of a system or process
- **Identify gaps** and inconsistencies in requirements
- **Facilitate communication** between technical and business stakeholders
- **Validate understanding** by making abstract concepts concrete

### Modeling Principles
- **Purpose-driven** - Each model should serve a specific purpose
- **Audience-appropriate** - Tailor complexity to your audience
- **Iterative** - Models evolve as understanding develops
- **Collaborative** - Involve stakeholders in model creation
- **Practical** - Focus on models that add value

---

## Process Models

### Business Process Models
Show how work flows through an organization.

**When to Use:**
- Understanding current state processes
- Identifying inefficiencies and bottlenecks
- Designing future state processes
- Communicating process changes to stakeholders

**Key Elements:**
- **Activities** - What work is being done
- **Decisions** - Where choices are made
- **Handoffs** - Where work moves between people or systems
- **Triggers** - What starts the process
- **Outcomes** - What the process produces

### User Journey Maps
Show how users interact with a system or process over time.

**When to Use:**
- Understanding user experience
- Identifying pain points and opportunities
- Designing user-centered solutions
- Communicating user needs to development teams

**Key Elements:**
- **User personas** - Who the users are
- **Touchpoints** - Where users interact with the system
- **Emotions** - How users feel at each stage
- **Pain points** - Where users experience problems
- **Opportunities** - Where improvements can be made

---

## Data Models

### Entity Relationship Diagrams (ERDs)
Show how data is structured and related.

**When to Use:**
- Understanding data requirements
- Designing database schemas
- Identifying data dependencies
- Communicating data relationships

**Key Elements:**
- **Entities** - Things about which data is stored
- **Attributes** - Properties of entities
- **Relationships** - How entities are connected
- **Cardinality** - How many of one entity relate to another

### Data Flow Diagrams (DFDs)
Show how data moves through a system.

**When to Use:**
- Understanding system boundaries
- Identifying data sources and destinations
- Designing system interfaces
- Communicating data flow to stakeholders

**Key Elements:**
- **Processes** - Activities that transform data
- **Data stores** - Where data is kept
- **External entities** - Sources and destinations of data
- **Data flows** - How data moves between components

---

## System Models

### Use Case Diagrams
Show how users interact with a system.

**When to Use:**
- Defining system boundaries
- Identifying user roles and permissions
- Communicating system functionality
- Planning system development

**Key Elements:**
- **Actors** - Users or external systems
- **Use cases** - System functionality
- **Relationships** - How actors and use cases connect
- **System boundary** - What's inside vs. outside the system

### System Context Diagrams
Show how a system fits into its broader environment.

**When to Use:**
- Understanding system boundaries
- Identifying external dependencies
- Communicating system scope
- Planning integration requirements

**Key Elements:**
- **Central system** - The system being developed
- **External systems** - Other systems that interact
- **Data flows** - Information exchanged
- **System boundaries** - Clear separation of concerns

---

## Modeling Techniques and Tools

### Whiteboarding and Sketching
Quick, informal modeling for exploration and communication.

**When to Use:**
- Brainstorming sessions
- Quick communication
- Collaborative modeling
- Early exploration of ideas

**Benefits:**
- Fast and flexible
- Encourages participation
- Easy to modify
- Low barrier to entry

### Digital Modeling Tools
Formal modeling using specialized software.

**When to Use:**
- Formal documentation
- Complex models
- Version control needs
- Stakeholder distribution

**Popular Tools:**
- **Lucidchart** - General-purpose diagramming
- **Draw.io** - Free, web-based diagramming
- **Visio** - Microsoft's diagramming tool
- **BPMN tools** - Specialized process modeling

### Collaborative Modeling
Involving stakeholders in model creation.

**Techniques:**
- **Live modeling** during workshops
- **Stakeholder review** of draft models
- **Iterative refinement** based on feedback
- **Model validation** with subject matter experts

---

## Real-World Example: Order Processing System

**Scenario:** A retail company needs to redesign their order processing system to handle increased volume and improve customer satisfaction.

### Modeling Approach

**Phase 1: Current State Analysis**
- **Process model** of existing order processing workflow
- **Data model** of current order and customer information
- **User journey map** of customer experience from order to delivery

**Phase 2: Gap Analysis**
- **Comparison model** showing current vs. desired state
- **Pain point analysis** identifying bottlenecks and inefficiencies
- **Opportunity map** highlighting improvement areas

**Phase 3: Future State Design**
- **Redesigned process model** with improved workflow
- **System context diagram** showing integration points
- **Use case diagram** defining system functionality

### Results
- **Clear understanding** of current state and improvement opportunities
- **Stakeholder alignment** on future state vision
- **Detailed requirements** for system development
- **Successful implementation** with high user adoption

---

## In Practice

### Activity 1: Model Selection
**Scenario:** You need to model requirements for a customer service system.

**Your Task:**
1. Identify which types of models would be most useful
2. Choose specific modeling techniques for different stakeholder groups
3. Plan how to create models collaboratively with stakeholders
4. Determine what tools and resources you'll need

### Activity 2: Process Modeling
**Scenario:** You need to model the current process for handling customer complaints.

**Your Task:**
1. Create a process model showing the current workflow
2. Identify decision points and handoffs in the process
3. Highlight inefficiencies and bottlenecks
4. Suggest improvements to the process

### Activity 3: Model Validation
**Scenario:** You've created several models for a new system and need to validate them with stakeholders.

**Your Task:**
1. Plan a validation session with key stakeholders
2. Develop criteria for evaluating model quality
3. Create a process for incorporating feedback
4. Establish sign-off procedures for approved models

---

## Summary / Key Takeaways

- Visual models are powerful tools for understanding, communicating, and validating requirements
- Different types of models serve different purposes and should be selected based on stakeholder needs and project context
- Process models help understand workflows, data models clarify information structure, and system models define functionality
- Collaborative modeling involving stakeholders leads to better understanding and higher quality requirements
- Models should be purpose-driven, audience-appropriate, and iterative to maximize their value

---

**Next Chapter:** [Chapter 10: Specification Quality & Prioritisation](10-spec-quality-prioritisation.md)






