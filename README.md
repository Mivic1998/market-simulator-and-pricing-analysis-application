
# Market Simulator and Pricing Analysis Application

The **Market Simulator and Pricing Analysis Application** is an interactive economics-focused web application created as part of the Code Institute Full Stack Bootcamp JavaScript module. The project focuses on building a responsive, educational, and visually interactive application using front-end web technologies and dynamic canvas rendering.

The purpose of this application is to provide users with an intuitive way to explore how supply and demand interact under different economic conditions. Users can manipulate variables in real time and observe the effects on equilibrium, elasticity, revenue maximisation, welfare outcomes, and taxation.

The simulator combines economic theory with interactive visualisation, allowing abstract concepts typically represented statically in textbooks to be explored dynamically through user interaction.

**Deployed Application:**  
[Insert deployed link here]

![Initial Application View](assets/images/readme/main-view.png)

---

# Table of Contents

- [User Experience (UX)](#user-experience-ux)
- [Design](#design)
  - [Colour Palette](#colour-palette)
  - [Typography](#typography)
  - [Graph Design](#graph-design)
  - [Wireframes](#wireframes)
- [Features](#features)
  - [Header](#header)
  - [Main Market Graph](#main-market-graph)
  - [Revenue Graph](#revenue-graph)
  - [Controls Panel](#controls-panel)
  - [Metrics Panel](#metrics-panel)
  - [Economic Insights](#economic-insights)
  - [Theory & Glossary Page](#theory--glossary-page)
  - [Dark Mode](#dark-mode)
  - [Weather API Integration](#weather-api-integration)
- [Economic Theory Implemented](#economic-theory-implemented)
- [Technologies Used](#technologies-used)
- [JavaScript & Interaction Logic](#javascript--interaction-logic)
- [Responsive Design](#responsive-design)
- [Screenshots](#screenshots)
- [Accessibility](#accessibility)
- [Testing](#testing)
- [Deployment](#deployment)
- [AI Tool Usage](#ai-tool-usage)
- [Challenges Encountered](#challenges-encountered)
- [Future Improvements](#future-improvements)
- [Credits](#credits)

---

# User Experience (UX)

The user experience design for the Market Simulator and Pricing Analysis Application focuses on clarity, responsiveness, and educational accessibility. The application was designed to allow users to experiment with economic variables interactively while maintaining readability and ease of navigation across different screen sizes.

The interface prioritises visual feedback, allowing users to instantly observe how economic relationships change as parameters are adjusted.

---

## Site Goals

- Provide an interactive visualisation of supply and demand
- Demonstrate equilibrium and welfare analysis dynamically
- Allow users to experiment with multiple demand curve models
- Visualise revenue maximisation and elasticity
- Maintain responsiveness across desktop, tablet, and mobile devices
- Support accessibility and readability in both light and dark mode
- Provide educational explanations for economic concepts

---

## User Stories

### First-Time Visitors

- **As a first-time visitor**, I want to quickly understand the purpose of the application, **so that** I can begin experimenting with economic concepts immediately.
- **As a user**, I want graphs and controls to respond instantly, **so that** I can clearly observe cause-and-effect relationships.
- **As a user unfamiliar with economics**, I want explanations of terminology and theory, **so that** I can understand the concepts being visualised.

---

### Returning Users

- **As a returning user**, I want consistent layouts and controls, **so that** I can use the simulator efficiently.
- **As a returning user**, I want my dark mode preference to persist, **so that** the interface remains comfortable to use.

---

### Users Exploring Economic Theory

- **As a user**, I want to compare different demand curve models, **so that** I can understand how consumer behaviour differs under different assumptions.
- **As a user**, I want to visualise consumer and producer surplus, **so that** welfare effects are easier to interpret.
- **As a user**, I want to explore taxation and deadweight loss, **so that** I can observe distortion effects graphically.
- **As a user**, I want to understand how total revenue changes with quantity, **so that** I can analyse revenue maximisation.

---

### Users on Different Devices

- **As a mobile user**, I want controls to reposition below the graph, **so that** the application remains readable and usable on smaller screens.
- **As a tablet user**, I want graphs and controls to resize smoothly, **so that** content remains visually balanced.
- **As a user**, I want dark mode support, **so that** the application is comfortable to use in different lighting conditions.

---

# Design

The design of the application was approached with both educational clarity and modern UI aesthetics in mind. Economic graphs were given visual prominence while supporting panels and controls were designed to remain readable without distracting from the graphs themselves.

The design combines analytical visualisation with interactive responsiveness to create a more engaging learning experience.

---

## Colour Palette

### Light Mode

- `#f8fafc` – Primary background
- `#ffffff` – Card backgrounds
- `#2563eb` – Primary interactive colour
- `#c084fc` – Revenue curve colour
- `#22c55e` – Supply curve colour
- `#3b82f6` – Demand curve colour

### Dark Mode

- `#020617` – Primary dark background
- `#0f172a` – Secondary panel background
- `#1e293b` – Borders and card accents
- `#f8fafc` – Primary text
- `#60a5fa` – Highlight colour

---

## Typography

Typography was selected to prioritise readability and clarity.

- **Inter** is used throughout the application for:
  - headings
  - labels
  - controls
  - metrics
  - insights

---

## Graph Design

Graphs were implemented using the HTML5 Canvas API.

Design considerations included:

- strong contrast between curves
- clear axis labelling
- responsive scaling
- readable annotations
- colour-coded welfare areas
- dashed guide lines
- dynamic labels

---

## Wireframes

### Desktop Wireframe

![Desktop Wireframe](assets/images/readme/wireframe-desktop.png)

---

### Tablet Wireframe

![Tablet Wireframe](assets/images/readme/wireframe-tablet.png)

---

### Mobile Wireframe

![Mobile Wireframe](assets/images/readme/wireframe-mobile.png)

---

# Features

## Header

The header introduces the application and contains:

- application title
- project description
- weather API display
- dark mode toggle
- theory guide link

---

## Main Market Graph

The main graph visualises:

- supply curves
- demand curves
- equilibrium
- consumer surplus
- producer surplus
- welfare loss
- taxation effects

The graph updates dynamically whenever controls are adjusted.

---

## Revenue Graph

A secondary graph visualises total revenue.

Features include:

- dynamically generated revenue curve
- revenue-maximising point
- dashed guide lines
- responsive scaling
- dynamically updated labels

---

## Controls Panel

The controls panel allows users to manipulate:

- demand intercepts
- demand slopes
- supply intercepts
- supply slopes
- taxation levels
- income values
- demand curve types

---

## Metrics Panel

The metrics section dynamically displays:

- equilibrium price
- equilibrium quantity
- revenue-maximising price
- revenue-maximising quantity
- total revenue
- welfare loss

---

## Economic Insights

An automated insights engine dynamically generates textual explanations based on current market conditions.

Insights discuss:

- elasticity
- equilibrium
- taxation
- welfare outcomes
- revenue maximisation
- supply responsiveness

---

## Theory & Glossary Page

A separate `theory.html` page was created to explain:

- equilibrium
- elasticity
- surplus
- deadweight loss
- taxation
- revenue maximisation
- Cobb–Douglas utility theory

---

## Dark Mode

A fully integrated dark mode system was implemented using:

- JavaScript class toggling
- CSS overrides
- localStorage persistence

---

## Weather API Integration

The application integrates a weather API using geolocation.

The feature displays:

- local weather conditions
- temperature
- wind speed

---

# Economic Theory Implemented

## Market Equilibrium

Equilibrium occurs where:

```math
Q_d = Q_s
````

---

## Consumer Surplus

Consumer surplus represents the difference between willingness to pay and actual market price.

---

## Producer Surplus

Producer surplus represents the difference between market price and minimum acceptable supply price.

---

## Deadweight Loss

Deadweight loss represents lost welfare caused by market distortion such as taxation.

---

## Price Elasticity of Demand

Elasticity measures responsiveness of quantity demanded to changes in price.

---

## Cobb–Douglas Utility & Income-Based Demand

The income-based demand curve is derived from a Cobb–Douglas utility function:

```math
U(x,y)=x^k y^{1-k}
```

Demand derived through utility maximisation:

```math
x = \frac{kI}{P}
```

---

# Technologies Used

* HTML5
* CSS3
* JavaScript
* Bootstrap 5
* HTML5 Canvas API
* Weather API
* localStorage
* Google Fonts
* Balsamiq

---

# JavaScript & Interaction Logic

JavaScript is used extensively throughout the project to manage:

* graph rendering
* event listeners
* calculations
* API integration
* dark mode persistence
* responsive behaviour
* insights generation

---

## Canvas Rendering

Canvas rendering includes:

* axes
* curves
* labels
* guide lines
* welfare shading
* revenue curves

---

## Dynamic Graph Updates

Whenever a parameter changes:

1. values are recalculated
2. graphs are cleared
3. curves are redrawn
4. metrics are updated
5. insights are regenerated

---

## State Management

A central `state` object stores:

* parameters
* mode selections
* taxation levels
* demand types
* dark mode status

---

# Responsive Design

The application was designed responsively using:

* Bootstrap grid layouts
* media queries
* adaptive spacing
* mobile-specific layouts

On smaller screens:

* controls reposition below graphs
* layouts stack vertically
* panels resize dynamically
* spacing adjusts automatically

---

# Screenshots

## Desktop View

![Desktop View](assets/images/readme/desktop-view.png)

---

## Tablet View

![Tablet View](assets/images/readme/tablet-view.png)

---

## Mobile View

![Mobile View](assets/images/readme/mobile-view.png)

---

## Dark Mode

![Dark Mode](assets/images/readme/dark-mode.png)

---

## Revenue Graph

![Revenue Graph](assets/images/readme/revenue-graph.png)

---

# Accessibility

Accessibility considerations include:

* semantic HTML
* readable colour contrast
* dark mode readability
* responsive controls
* scalable text
* descriptive labels
* keyboard accessibility
* reduced visual clutter

---

# Testing

Full testing documentation can be included in a separate `TESTING.md` file.

Testing included:

* responsive testing
* browser compatibility
* dark mode testing
* graph rendering verification
* API error handling

---

# Deployment

The application was deployed using cloud hosting.

Deployment considerations included:

* file structure consistency
* responsive rendering
* external asset loading
* JavaScript compatibility
* version control management

---

# AI Tool Usage

AI tools were used during development for:

* debugging JavaScript logic
* troubleshooting responsive layouts
* refining CSS styling
* improving graph rendering
* accessibility improvements
* theory explanation drafting

All generated outputs were manually reviewed, tested, and adapted before integration into the project.

---

# Challenges Encountered

## Canvas Scaling

Manual scaling and coordinate mapping created significant complexity when implementing multiple graph systems.

---

## Responsive Layout Management

Repositioning controls and insights between desktop and mobile layouts required extensive media query refinement.

---

## Dark Mode Canvas Rendering

Dark mode required separate rendering logic to ensure graph readability against dark backgrounds.

---

## Economic Edge Cases

Perfectly inelastic supply and nonlinear demand created edge cases requiring additional conditional logic.

---

# Future Improvements

Potential future improvements include:

* downloadable graph exports
* animation transitions
* preset saving
* additional demand models
* multiplayer classroom support
* historical market simulations
* more advanced elasticity visualisation

---

# Credits

* Bootstrap 5
* Google Fonts
* OpenWeather API
* Balsamiq
* Code Institute learning materials
