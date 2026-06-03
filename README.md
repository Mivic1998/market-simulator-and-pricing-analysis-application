# Market Simulator and Pricing Analysis Application

## Overview

The **Market Simulator and Pricing Analysis Application** is a fully interactive, browser-based economic modelling tool developed as part of the Code Institute Full Stack JavaScript module. The project was designed to move beyond static representations of economic concepts and instead create a system in which users can actively manipulate and observe market behaviour in real time.

Traditional supply and demand diagrams are limited by their static nature. They allow the illustration of relationships, but not experimentation. This application addresses that limitation by introducing a dynamic system where users can directly alter parameters such as demand elasticity, income levels, and taxation, and immediately observe how these changes affect equilibrium, revenue, and welfare.

The application therefore serves both as a **technical demonstration of advanced JavaScript and rendering logic**, and as an **educational tool grounded in economic theory**, enabling the user to transition from passive observation to active exploration.

**Market Simulator Deployed Link:** https://mivic1998.github.io/market-simulator-and-pricing-analysis-application/

![Market Simulator Initial View](assets/images/readme/main-responsive-view-two-demand-mode.PNG)

---

## Table of Contents

- [Overview](#overview)
- [User Experience (UX)](#user-experience-ux)
  - [User Stories](#user-stories)
- [Design](#design)
- [Colour Palette](#colour-palette)
  - [Light Mode](#light-mode)
  - [Dark Mode](#dark-mode)
- [Wireframes](#wireframes)
  - [Main Application](#main-application)
  - [Theory Page](#theory-page)
- [Features](#features)
  - [Main Market Graph](#main-market-graph)
  - [Revenue Graph and Presets](#revenue-graph-and-presets)
  - [Metrics and Insights (Responsive Layout)](#metrics-and-insights-responsive-layout)
  - [Taxation and Supply Mode](#taxation-and-supply-mode)
  - [Dark Mode](#dark-mode-1)
- [Theory Page (Feature Overview)](#theory-page-1)
- [JavaScript & Application Logic](#javascript--application-logic)
  - [State Management](#state-management)
  - [Reactive Rendering System](#reactive-rendering-system)
  - [Graph Rendering](#graph-rendering)
  - [Demand Models](#demand-models)
- [Responsive Design](#responsive-design)
- [Challenges Encountered](#challenges-encountered)
  - [Full Application Update Cycle](#full-application-update-cycle)
  - [Managing Multiple Application States](#managing-multiple-application-states)
  - [Synchronisation of Inputs](#synchronisation-of-inputs)
  - [Canvas Rendering and Scaling](#canvas-rendering-and-scaling)
  - [Handling Edge Cases](#handling-edge-cases)
  - [Dark Mode and Canvas Rendering](#dark-mode-and-canvas-rendering)
- [AI Tool Usage and Reflection](#ai-tool-usage-and-reflection)
- [Future Improvements](#future-improvements)
- [Technologies Used](#technologies-used)
- [Accessibility](#accessibility)
- [Testing](#testing)
- [Deployment](#deployment)
- [Credits](#credits)

---

## User Experience (UX)

The UX design of the application is centred around three core principles:

1. **Immediate feedback** – changes should be reflected instantly to reinforce learning  
2. **Clarity of structure** – users should not be overwhelmed by complexity  
3. **Progressive exploration** – users can move from basic understanding to more advanced features  

The interface deliberately prioritises the main market graph as the focal point, with supporting panels (controls, metrics, insights) positioned to assist interpretation rather than compete for attention.

---

### User Stories

User stories were used to guide both design decisions and implementation priorities.

#### First-Time Visitors

First-time visitors require immediate clarity and usability. The system is designed so that interaction is intuitive even without prior experience.

- As a first-time visitor, I want to immediately understand the purpose of the application, so that I can begin interacting without needing external explanation  
- As a first-time visitor, I want controls to be clearly labelled and grouped, so that I can quickly identify how to adjust the system  
- As a first-time visitor, I want to see immediate visual changes, so that I can understand cause-and-effect relationships without delay  

---

#### Returning Users

Returning users prioritise efficiency and familiarity.

- As a returning user, I want a consistent interface, so that I can interact quickly without relearning controls  
- As a returning user, I want preset configurations, so that I can test defined economic scenarios without manually setting every parameter  
- As a returning user, I want my display preferences such as dark mode to be retained, so that usability is improved over time  

---

#### Users Exploring Economic Theory

This group represents the core educational goal of the application.

- As a user, I want to manipulate supply and demand, so that I can observe how equilibrium emerges from their interaction  
- As a user, I want to visualise consumer and producer surplus, so that welfare concepts become intuitive rather than abstract  
- As a user, I want to analyse revenue behaviour, so that I can understand how firms choose prices  
- As a user, I want to explore taxation, so that I can identify inefficiencies such as deadweight loss  
- As a user, I want insights explaining results, so that I can interpret the graphs correctly  

---

#### Users on Different Devices

Responsiveness is essential to ensure accessibility.

- As a user on a desktop device, I want a multi-column layout, so that I can interact with the system efficiently  
- As a user on a smaller device, I want content stacked logically, so that usability is not compromised  
- As a user on any device, I want all features to remain accessible, so that functionality is consistent  

---

## Design

The design approach was centred on maintaining a strong relationship between **visual hierarchy and functional importance**.

The market graph is the dominant element of the interface, reflecting its role as the primary output. Supporting elements are visually separated into panels, allowing users to easily distinguish between:

- input (controls)  
- output (graph + metrics)  
- interpretation (insights)  

This separation reduces cognitive load and supports clearer understanding.

---

## Colour Palette

The section below discusses in detail the colour palette choices which were made in order to enhance the usability of the application.

### Light Mode

Below is the colour palette implemented for the application's light mode setting

![Light Mode Colour Palette](assets/images/readme/light-mode-colour-palette.png)

The light mode palette was designed to maximise readability while maintaining meaningful colour associations. Blue tones are used consistently for demand-related and interactive elements, green is used for supply, and purple is used to represent revenue.

The following key colours were used:

- **Primary (Header / Interactive):** `#4f46e5`  
- **Secondary Accent:** `#6366f1`  
- **Background:** `#f4f6f9`  
- **Surface (Cards / Panels):** `#ffffff`  
- **Text (Primary):** `#1e293b`  
- **Text (Secondary):** `#475569`  
- **Muted Text:** `#64748b`  
- **Borders:** `#e2e8f0`  
- **Controls Background:** `#f8fafc`  
- **Metrics Background:** `#f1f5f9`  
- **Insights Background:** `#eef2ff`  
- **Highlight (e.g. temperature / accents):** `#60a5fa`  

This consistent mapping ensures that users can quickly identify relationships visually without needing to refer to labels repeatedly.

---

### Dark Mode

Below is the colour palette implemented for the application's dark mode setting

![Dark Mode Colour Palette](assets/images/readme/dark-mode-colour-palette.png)

Dark mode was not implemented as a simple inversion of colours. Instead, it required a full redesign of the palette to ensure that:

- contrast is preserved  
- graph elements remain distinct  
- readability is maintained  

The following colours were used:

- **Background:** `#020617`  
- **Surface / Panels (Gradient):** `#0f172a → #111827`  
- **Card / Metric Background:** `#111827`  
- **Text (Primary):** `#f8fafc`  
- **Text (Secondary):** `#cbd5e1`  
- **Borders:** `#334155`  

#### Data & Semantic Colours
- **Demand (Blue/Purple tone):** `#818cf8`  
- **Supply (Green):** `#4ade80`  
- **Tax (Yellow):** `#facc15`  
- **Highlight / Key Values:** `#60a5fa`  

#### Interactive Elements
- **Buttons (Default):** `#1e293b`  
- **Buttons (Hover):** `#334155`  
- **Active Button:** `#2563eb`  
- **Active Border Accent:** `#60a5fa`  

#### Additional Elements
- **Canvas Background:** `#020617`  
- **Slider Accent:** `#818cf8`  

This adaptation was particularly challenging due to the fact that canvas elements do not automatically inherit CSS styling, requiring manual synchronisation of chart colours with the UI theme.

---

## Wireframes

In this section the wireframes for both the main application and the accompanying theory page are presented.

### Main Application

Below is the wireframe for the main application page on desktop:

![Wireframe Main Application Page Desktop](assets/images/readme/index-wireframe-desktop.png) 

Below is the wireframe for the main application page on tablet:

![Wireframe Main Application Page Tablet](assets/images/readme/index-wireframe-tablet.png) 

Below is the wireframe for the main application page on mobile: 

![Wireframe Main Application Page Mobile](assets/images/readme/index-wireframe-mobile.PNG)  

The wireframes illustrate the structural evolution of the interface across device sizes. On desktop, the layout adopts a multi-column approach to maximise efficiency. As screen size decreases, the layout transitions into a vertically stacked structure where the graph remains prioritised and controls follow beneath.

---

### Theory Page

Below is the wireframe for the supplementary theory page on desktop:

![Wireframe Theory Page Desktop](assets/images/readme/theory-wireframe-desktop.png)   

Below is the wireframe for the supplementary theory page on tablet:

![Wireframe Theory Page Desktop](assets/images/readme/theory-wireframe-tablet.png)  

Below is the wireframe for the supplementary theory page on mobile: 

![Wireframe Theory Page Desktop](assets/images/readme/theory-wireframe-mobile.png) 

The theory page was designed differently from the main application, prioritising **content readability rather than interaction**. The layout is intentionally linear, allowing users to scroll through structured sections covering key economic concepts.

---

## Features

Below is a comprehensive detailing of the features that users can explore while using the application.

### Main Market Graph

The main graph is the central feature of the application. It dynamically renders supply and demand curves using the HTML5 Canvas API, based on real-time parameter inputs.

![Responsive View of the Market Graph](assets/images/readme/main-responsive-view-three-demand-mode.PNG)

The graph is not pre-drawn or static. Instead, it is generated through mathematical functions that calculate values and convert them into pixel coordinates. This approach allows the application to support multiple demand models, including linear, nonlinear, and income-based demand, each of which produces a different curve shape and behaviour.

As users adjust parameters such as intercepts, slopes, or taxation levels, the graph is recalculated and redrawn instantly. This ensures that the visual output remains fully synchronised with the underlying economic model, allowing users to observe how changes in inputs directly affect equilibrium, surplus, and overall market outcomes.

In addition to plotting curves, the graph also incorporates visual elements such as shaded surplus areas, equilibrium markers, and guide lines. These features help translate abstract calculations into clear visual representations, making it easier for users to interpret results without relying solely on numerical outputs.

---

### Revenue Graph and Presets

The revenue graph (which is displayed only in demand mode) adds a second layer of analysis to the application by showing how total revenue changes as output varies. Unlike the main market graph, which focuses on equilibrium, this graph allows users to explore firm behaviour and identify the output level at which revenue is maximised.

![Responsive View of the Revenue Graph](assets/images/readme/main-responsive-view-five-demand-mode.PNG)

The shape of the revenue curve depends on the selected demand model. Under linear demand, the curve follows a parabolic shape, increasing to a maximum before declining. For nonlinear demand, the curve adjusts according to the exponential relationship, while income-based demand produces constant revenue due to unit elasticity. This ensures the graph remains consistent with the underlying economic model.

The preset system is closely integrated with this graph and allows users to quickly switch between meaningful parameter configurations. Rather than manually adjusting multiple inputs, presets apply predefined values to the central state, instantly updating both the market and revenue graphs.

Presets vary depending on both the **selected demand type** and the **current mode of the application**. In demand mode, presets are designed to highlight differences such as elastic versus inelastic demand, as well as changes in intercepts and curve shapes. In supply mode, presets also include taxation, allowing users to observe how different combinations of demand conditions and tax levels affect revenue outcomes.

Because presets modify multiple variables at once, they are particularly useful for comparing scenarios. For example, users can quickly observe how revenue behaviour differs between elastic and inelastic demand, or how taxation impacts total revenue under different market conditions. This makes the preset system an important tool for structured experimentation rather than just convenience.

---

### Metrics and Insights (Responsive Layout)

The metrics panel presents key numerical outputs such as equilibrium price and quantity, while the insights panel provides contextual explanations that help interpret these results in economic terms.

![Responsive View of Metrics and Insights](assets/images/readme/main-responsive-view-four-demand-mode.PNG)

The inclusion of both quantitative and qualitative outputs ensures that users are not only able to observe changes in the model, but also understand their significance. The insights system translates variations in parameters into explanations related to elasticity, welfare effects, and market behaviour, reducing the need for prior theoretical knowledge.

The responsive behaviour shown in the image is deliberately selected to highlight differences across smaller screen sizes. On mobile devices, the layout already demonstrates how the insights section is positioned beneath the graph in a fully stacked format, ensuring readability and preserving the hierarchy of information.

To avoid repetition of this same stacked layout, the screenshot instead focuses on the tablet view, where the control panel is also visible. This allows the documentation to illustrate how controls are adapted at intermediate screen sizes without duplicating the mobile presentation. In this way, the image captures both the vertical stacking of interpretation elements on smaller screens and the transitional layout where interaction panels remain partially visible alongside outputs.

---

### Taxation and Supply Mode

Supply mode introduces taxation by shifting the supply curve upwards, creating a wedge between the price paid by consumers and the price received by producers.

![Responsive View of Main Graph Supply-Mode](assets/images/readme/main-responsive-view-four-demand-mode.PNG)

The graph highlights both tax revenue and deadweight loss, allowing users to visually understand the inefficiencies created by market intervention. The reduction in equilibrium quantity, alongside the emergence of a deadweight loss area, demonstrates how taxation disrupts mutually beneficial trades between buyers and sellers.

The responsive display shown in the image also showcases different demand curve types across device layouts. Each screen presents a slightly different demand model, illustrating how taxation interacts with various demand conditions. For example, the impact of a given tax differs depending on whether demand is more elastic or inelastic, which is reflected in both the magnitude of the reduction in quantity and the size of the deadweight loss.

This variation reinforces an important economic insight: the burden and efficiency cost of taxation are not fixed, but depend on the underlying responsiveness of consumers. By combining taxation with multiple demand models, the application allows users to directly compare how different market conditions influence the outcomes of government intervention.

---

## Dark Mode

A fully integrated dark mode is included to improve usability in low-light environments and reduce eye strain. The colour palette was redesigned rather than simply inverted, ensuring that all elements — particularly canvas-rendered graphs — maintain clear contrast and readability.  

![Dark Mode View](assets/images/readme/dark-mode.PNG)

Special consideration was required for graph rendering, as canvas elements do not automatically inherit CSS styling. As a result, colours for curves, labels, and shading were dynamically adjusted to ensure visibility across both light and dark themes, while preserving consistent meaning (e.g. demand, supply, and revenue colours).

### Theory Page

Now we turn our attention to the theory page, describing both its content and its layout which is presented in the following images.

The following view introduces the overall structure of the theory page, outlining the core concepts and establishing the foundation for understanding how demand is represented within the application.

![Responsive View of Theory Page Top View](assets/images/readme/theory-responsive-view-one.PNG)

The section in the following image develops more advanced material, including income-based demand and its mathematical formulation, linking directly to the models implemented within the simulator

![Responsive View of Theory Page Upper Middle View](assets/images/readme/theory-responsive-view-two.PNG)

This view focuses on equilibrium and welfare analysis, explaining how consumer surplus, producer surplus, and market efficiency are determined and visualised in the application.

![Responsive View of Theory Page Lower Middle View](assets/images/readme/theory-responsive-view-three.PNG) 

This final section extends the analysis to taxation and market distortion, demonstrating how concepts such as deadweight loss and government intervention are introduced and connected to the supply-side functionality of the simulator.

![Responsive View of Theory Page Bottom View](assets/images/readme/theory-responsive-view-four.PNG)

The theory page supports the application by providing structured explanations of key concepts, including demand models, equilibrium, and welfare.

It bridges the gap between the mathematical logic implemented in the application and the conceptual understanding required by users.

---

## JavaScript Application Architecture

The JavaScript implementation is built around a layered architecture where each level of the application depends on the level above it. Rather than treating graphs, metrics, insights, controls, and presets as separate features, the application uses a central state-driven system where changes propagate through the rest of the application automatically.

At a high level, the application follows this hierarchy:

```text
Mode
↓
Demand Type
↓
Parameters
↓
Calculations
↓
Graphs
↓
Metrics
↓
Insights
```

Almost every interaction follows the same update pipeline:

```js
displayAndStoreMetricValues();
drawCurves();
drawRevenue();
renderInsights();
```

The order is important. Economic values must be calculated before the graphs can be drawn, and the graphs must be updated before insights can accurately describe the current market state.

### State Management

At the centre of the application is the `state` object, which acts as the application's memory.

```js
const state = {
    mode: "demand",
    demandType: "linear",
    a: 50,
    b: 1,
    aNonlinear: 50,
    bNonlinear: 0.2,
    income: 500,
    k: 0.5,
    c: 0,
    d: 1,
    t: 0
};
```

The state object stores all information required to recreate the current market scenario.

Rather than directly modifying graphs or metrics, event listeners update values inside `state`. The application then recalculates and redraws everything that depends on those values.

This ensures every part of the interface remains synchronised.

### Mode System

The first layer of the application is the mode system.

The mode buttons use HTML `data-mode` attributes:

```html
<button data-mode="demand">
<button data-mode="supply">
```

When a mode button is clicked:

```js
const newMode = e.currentTarget.dataset.mode;
state.mode = newMode;
```

This single value changes the behaviour of the entire application.

Demand mode focuses on:

- Equilibrium
- Revenue
- Elasticity
- Consumer and producer surplus

Supply mode focuses on:

- Taxation
- Tax incidence
- Tax revenue
- Deadweight loss

Mode switching also controls visibility throughout the interface.

Elements are grouped using classes such as:

```html
demand-only
supply-only
```

JavaScript simply adds or removes a `visible` class, allowing CSS to determine what should be shown on screen.

Many functions in the JavaScript condition on the demand type, such as functions which retrieve the points needed for plotting after a user has interacted with the interface, as the supply curve with tax is only drawn in supply mode. Similarly, some calculations only run in supply mode, such as any calculations related to tax.

### Demand Type System

Within each mode, users can select one of three demand models:

- Linear Demand
- Nonlinear Demand
- Income-Based Demand

The selected demand type is stored in:

```js
state.demandType
```

This value affects multiple systems simultaneously, including:

- Equilibrium calculations (demand type effects which function must be called to calculate equilibrium)
- Revenue calculations 
- Elasticity calculations
- Welfare calculations
- Point generation (demand type effects which functions must be called to generate points for the plotting of demand curves as well as revenue curves and to produce the shaded regions seen on the main graph)
- Insight generation

The application uses class naming conventions such as:

```html
demand-linear
demand-nonlinear
demand-income
```

to show only the controls relevant to the currently selected demand model. Visibility is once again controlled by CSS and JavaScript, with JavaScript adding an active class to elements with a given demand class when the user switches to the corresponding demand type and removing the active class from the previous demand type that has been switched away from, which is tracked using a variable called previousDemandType.

When switching demand type, the application also resets the parameters belonging to the previous demand model back to their defaults. This prevents users from returning to messy graphs when switching back to a previously used mode.

### Dynamic Parameter Mapping

A recurring implementation pattern throughout the application is dynamic key generation.

Manual inputs follow a naming convention:

```text
aValue
bValue
incomeValue
kValue
```

Rather than writing separate logic for every input, the application generates the matching state key automatically:

```js
const key = input.id.replace("Value", "");
```

This converts:

```text
aValue      -> a
bValue      -> b
incomeValue -> income
kValue      -> k
```

allowing generic update and synchronisation logic to be reused throughout the application.

The same technique is used when updating sliders after presets are selected.

### Economic Calculations

The application's main calculation hub is:

```js
displayAndStoreMetricValues();
```

This function calculates all economic values required by the rest of the application and conditions the calculations on the demand type and the mode (demand or supply). This includes:

- Equilibrium price
- Equilibrium quantity
- Revenue-maximising price
- Revenue-maximising quantity
- Consumer surplus
- Producer surplus
- Total revenue
- Elasticity
- Tax revenue
- Deadweight loss

The results are stored in:

```js
currentMetrics
```

which acts as a central cache for the graphing and insight systems. For example, the outer edges of the shaded areas are traced by for loops, and depend on metrics such as the equilibrium quantity which varies as the parameters in the control panel are adjusted, making it crucial to store these key metrics even after they have been displayed to the user on the app.

### Main Graph Rendering

The main market graph is rendered through:

```js
drawCurves();
```

This function acts as an orchestrator rather than containing all graphing logic itself.

Before any curves are drawn, the application must determine which curves are required:

```js
retrievePointsNeededForPlotting(
    state.mode,
    state.demandType
);
```

Depending on the active mode, this may include:

- Demand curve
- Supply curve
- Tax-adjusted supply curve

The function then:

1. Clears the canvas.
2. Draws the axes.
3. Draws welfare shading.
4. Draws supply and demand curves.
5. Draws labels and equilibrium markers.

The graph itself is rendered using the Canvas API, meaning economic coordinates must be converted into screen coordinates before being drawn.

### Welfare Shading

The application separates welfare shading from curve plotting.

In demand mode:

```js
drawDemandModeShading();
```

is used.

In supply mode:

```js
drawSupplyModeShading();
```

is used.

These functions use values stored in `currentMetrics` to determine the coordinates of:

- Consumer surplus
- Producer surplus
- Tax revenue
- Deadweight loss

The shaded regions are drawn before the curves so that the curves remain clearly visible on top.

### Revenue Graph

The revenue graph is rendered independently of the main market graph and is only implemented when the mode is set to demand.

Different point-generation functions are used depending on the active demand type:

```js
generatePlotPointsRevenueLinear()
generatePlotPointsRevenueNonlinear()
generatePlotPointsRevenueIncome()
```

Each function calculates revenue values using:

```text
TR = P × Q
```

and returns a set of points which can be plotted on the revenue canvas.

The graph also calculates and highlights the revenue-maximising point where appropriate.

### Hover System

The application includes hover functionality on both canvases.

For the main graph:

```js
handleMouseMove()
```

calculates:

- Quantity
- Price
- Elasticity

before calling:

```js
drawHoverOverlay()
```

which redraws the graph and overlays the hover marker and elasticity label.

For the revenue graph:

```js
handleRevenueMouseMove()
```

calculates the corresponding revenue value and calls:

```js
drawRevenueOverlay()
```

which overlays a marker showing the current total revenue at the selected quantity.

This allows users to explore the model interactively without permanently altering the graphs.

### Insight Generation

The final layer of the application is the insights system.

Insights are generated through:

```js
renderInsights();
```

which uses both:

```js
state
currentMetrics
```

to generate explanations of the current market situation.

Rather than simply displaying numbers, the insights interpret those numbers and explain their economic significance.

The system first attempts to generate scenario-specific insights and then fills any remaining spaces using fallback insights to ensure a consistent number of insights are always displayed.

### Preset System

The preset system allows multiple parameters to be changed simultaneously.

When a preset button is clicked:

```js
changeParametersPreset(preset);
```

updates the relevant state values.

The application then synchronises all sliders and manual inputs with the updated state:

```js
const key = input.id.replace("Value", "");
input.value = state[key];
```

This ensures the controls always reflect the underlying model configuration after a preset has been applied.

### Overall Flow

Every user interaction ultimately follows the same dependency chain:

```text
User Interaction
↓
State Update
↓
Metric Calculations
↓
Graph Rendering
↓
Metric Display
↓
Insight Generation
```

This architecture ensures that all components of the application remain synchronised and accurately reflect the current market scenario, regardless of which control the user interacts with.

## Challenges Encountered

The development of this application presented a range of technical challenges, primarily due to the number of interconnected systems and the need to maintain consistency across all user interactions. The application is not composed of isolated components; instead, every element is linked through a shared state, meaning that even small interactions trigger wide-ranging updates.

---

### Full Application Update Cycle

One of the most significant challenges was managing the fact that the entire application must update whenever a user interacts with it. Any change — whether adjusting a slider, entering a value manually, switching demand type, or changing mode — requires a full recalculation and redraw of:

- the main market graph  
- the revenue graph  
- all calculated metrics  
- the insights panel  

This creates a dependency chain where every interaction must correctly propagate through the system. If any part of this update sequence fails or is out of sync, the application produces inconsistent or incorrect results.

Ensuring that all components updated in the correct order and remained synchronised required careful structuring of the update logic and repeated debugging.

---

### Managing Multiple Application States

The application operates across several overlapping states, including:

- demand vs supply mode  
- three different demand models  
- taxation levels  
- preset configurations  

Each of these states influences how calculations are performed and how graphs are rendered. For example, switching demand types changes the underlying mathematical model, while switching to supply mode introduces taxation and additional calculations.

Handling transitions between these states was particularly challenging, as logic that worked in one configuration could fail in another. This required extensive conditional handling and careful separation of logic for each scenario.

---

### Synchronisation of Inputs

Another major challenge was ensuring that all user inputs remained synchronised. The application allows variables to be changed through:

- range sliders  
- number input fields  
- preset buttons  

All of these inputs modify the same underlying variables in the application state. This creates the risk of desynchronisation, where one input updates but others do not reflect the change.

To address this, each input is tightly linked to the central state, and every update triggers a refresh across all related inputs. This ensures that sliders, number fields, and presets remain consistent at all times, but required precise event handling and careful debugging.

---

### Canvas Rendering and Scaling

Rendering graphs using the Canvas API introduced significant complexity, as all drawing operations had to be implemented manually. This included:

- converting mathematical functions into coordinate points  
- scaling values to fit within the canvas  
- redrawing curves dynamically as parameters change  

Unlike using a charting library, there was no abstraction layer to handle these tasks automatically. Small errors in scaling or coordinate mapping could lead to visibly incorrect graphs, making this one of the most technically demanding aspects of the project.

---

### Handling Edge Cases

Certain parameter combinations introduced edge cases that could break the application or produce invalid graphs. Examples included:

- extremely steep or near-vertical curves  
- zero or near-zero prices  
- very large or very small parameter values  

These cases required additional conditional logic to ensure stability and prevent rendering errors.

---

### Dark Mode and Canvas Rendering

Implementing dark mode introduced additional challenges, particularly because canvas elements do not inherit CSS styles. All colours used within the graphs had to be manually adjusted to ensure they remained visible against darker backgrounds.

This required duplicating certain rendering logic and carefully testing contrast across both light and dark modes.

---

Overall, the primary challenge of the project was not implementing individual features, but ensuring that all features remained consistent and synchronised within a highly interactive, state-driven system. The complexity arose from how each component depended on every other component, requiring careful coordination of logic, rendering, and user interaction.

---

## AI Tool Usage and Reflection

Artificial intelligence tools were used throughout the development process to support problem solving, particularly in areas where there was no prior experience. One of the most significant examples of this was the implementation of canvas-based graph rendering, which introduced a completely new set of challenges compared to standard DOM-based development.

At the start of the project, there was no prior experience with the HTML5 Canvas API or with translating mathematical functions into graphical output. Concepts such as coordinate mapping, scaling functions to fit a fixed canvas, and dynamically redrawing curves in response to user interaction required a different approach to problem solving. AI was used in this context to help break down these unfamiliar problems into manageable steps, suggest approaches to mapping values to pixels, and identify potential sources of error when graphs were not rendering correctly.

However, AI output was rarely used directly. In many cases, suggestions needed to be critically evaluated, simplified, or significantly modified to fit the structure of the application. This was particularly true when dealing with the interaction between multiple systems, such as ensuring that canvas rendering remained consistent with the central state object and updated correctly when parameters changed.

The collaborative process highlighted the importance of understanding, rather than simply applying, generated solutions. AI often provided a starting point or a direction, but achieving a working implementation required manual refinement and testing. In some cases, suggested approaches did not integrate well with the existing codebase and had to be reworked or discarded entirely.

AI was also particularly useful when implementing dark mode, especially for canvas-based elements. Unlike standard HTML components, canvas content does not automatically adapt to CSS theme changes. AI helped identify the need to manually update drawing styles (such as line colours, gridlines, and text) based on the current theme state. It also assisted in structuring logic to ensure that graphs were fully re-rendered when switching between light and dark mode, maintaining visual consistency and readability across themes.

In addition, AI supported the integration of the weather API, which introduced asynchronous data fetching and external data handling. Guidance was used to structure API requests, process JSON responses, and safely update the UI with live data. As with other areas of the project, the initial implementations required refinement to ensure they aligned with the application’s structure and handled potential errors effectively.

This process was especially valuable in developing an understanding of canvas rendering logic. By working through suggestions, debugging issues, and adapting solutions, it was possible to build a functioning system that accurately represents economic models visually. This represents a significant progression from having no initial experience with canvas to implementing a fully dynamic graphing system.

Overall, AI functioned as a support tool for exploration and debugging rather than a replacement for problem solving. The final application reflects independently implemented logic, with AI contributing primarily to accelerating the learning process and helping navigate unfamiliar technical challenges.
 
 ---

## Future Improvements

While the application is fully functional, there are several areas where it could be extended or refined to improve both maintainability and user experience.

One potential improvement is the modularisation of the JavaScript codebase. At present, most logic is contained within a single file, which makes it harder to manage as complexity increases. Separating functionality into smaller, focused modules (for example, graph rendering, state management, and insights generation) would improve readability, maintainability, and scalability.

The addition of animation could further enhance the user experience. Currently, changes to graphs occur instantly, which prioritises responsiveness but can feel abrupt. Introducing smooth transitions when parameters change would make the behaviour of curves and equilibrium points easier to follow visually.

Expanding the range of economic models would also add depth to the application. While multiple demand models are already supported, further extensions could include more advanced supply models or additional market structures, allowing for a broader exploration of economic theory.

Finally, accessibility improvements could be made to ensure the application is usable by a wider range of users. This could include enhancements such as improved keyboard navigation, more detailed labels for screen readers, and further refinement of contrast levels, particularly within the canvas-rendered graphs.
 
---

## Technologies Used

- HTML5  
- CSS3  
- JavaScript  
- Bootstrap  
- Canvas API  

---

## Accessibility

- Clear visual contrast between elements, including support for dark mode
- Semantic HTML structure to improve readability and assistive technology support  
- Responsive layout ensuring usability across desktop, tablet, and mobile devices  
- Labels and structured controls to make user inputs clear

## Testing

Full testing and validation results can be found in the [TESTING.md](TESTING.md) file.

---

## Deployment

The project was deployed using **GitHub Pages** from the main branch.

---

## Credits

- Color palette generated using Coolors 
- Wireframes generated manually using Balsamiq  
- Open-Meteo API was used to retrieve real-time weather data via geolocation 
- Microsoft Copilot Chat was used as a supporting development tool for debugging and exploring solutions 