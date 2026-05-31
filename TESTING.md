## ESLint Results and Justification

ESLint was used to review the JavaScript codebase and identify syntax issues, unused variables, redeclarations, and possible code-quality concerns.

When running ESLint, several warnings/errors were reported around variable redeclaration inside the `displayAndStoreMetricValues()` function. These primarily related to variables such as:

- `P`
- `Q`
- `P_max`
- `Q_max`
- `revenueAtEquilibrium`
- `revenueAtMax`
- `welfareLoss`
- `P_noTax`
- `Q_noTax`
- `taxRevenue`
- `priceReceived`
- `deadweightLoss`

These warnings occur because the function uses `var` declarations inside conditional branches for different demand types and application modes.

Although ESLint flags this as redeclaration, this does not create a runtime error in this case because `var` is function-scoped in JavaScript. This means that repeated `var` declarations inside separate `if`, `else if`, and `else` blocks are hoisted to the top of the function and treated as a single function-level variable.

The structure is intentional because `displayAndStoreMetricValues()` must calculate different values depending on:

- whether the application is in demand mode or supply mode
- whether the selected demand type is linear, nonlinear, or income-based
- whether the displayed metric relates to equilibrium, taxation, revenue maximisation, welfare loss, or deadweight loss

The variables are later used to update the metrics panel and store values inside the `currentMetrics` object. For this reason, they need to remain accessible across the wider function scope after the conditional logic has completed.

The reported redeclaration warnings were reviewed manually and confirmed not to affect application behaviour. The application was tested after these warnings appeared, and the following functionality continued to work as expected:

- demand-side mode calculations
- supply-side mode calculations
- linear demand calculations
- nonlinear demand calculations
- income-based demand calculations
- graph rendering
- revenue graph rendering
- metrics panel updates
- dark mode redraw behaviour
- insights generation

Other ESLint issues, such as genuinely unused variables or undefined references, were treated separately and corrected where appropriate. For example, unused event parameters were removed and destructuring syntax was adjusted where necessary.

Therefore, the remaining redeclaration warnings are considered acceptable in this project because they are caused by intentional function-scoped `var` usage rather than broken logic or invalid JavaScript. They do not prevent the application from running correctly and do not affect the accuracy of the economic calculations.

### HTML Validation Testing

HTML validation was carried out throughout development to identify structural issues, accessibility concerns, and semantic markup warnings.

Most validation issues were resolved during development. However, some warnings remain intentionally due to the responsive design implementation used for the controls panel.

To improve usability on smaller devices, a second controls panel was created specifically for mobile and tablet layouts and positioned beneath the graph using CSS media queries. This resulted in duplicated HTML elements such as sliders, labels, and input containers. Validators therefore report warnings relating to duplicate IDs and repeated form controls.

These warnings were reviewed manually and considered acceptable because:

- the duplicated controls are never visible simultaneously
- media queries ensure only one controls panel is displayed at a time
- hidden controls are not interactable
- functionality remains unaffected across all tested screen sizes

This implementation was chosen because it provided a more stable and predictable responsive layout than dynamically repositioning elements with JavaScript or more complex flexbox/grid restructuring.

Additional semantic warnings relating to the graph container were resolved by replacing unnecessary `<section>` elements with `<div>` containers where appropriate, as the graph area did not require its own document heading.

#### HTML Validation Screenshot Placeholder

The screenshot below shows an example of the type of validation warning produced by the duplicated responsive controls panels. These warnings were expected because two versions of the controls section were intentionally included in the HTML — one for desktop layouts and one for mobile/tablet layouts — with CSS media queries used to selectively hide or display each version depending on screen size.

The duplicated elements are never visible simultaneously and do not affect application functionality, accessibility, or responsiveness during normal use.

> Insert example screenshot of duplicate ID / repeated control validation warning here.

![Example HTML Validation Warning](path/to/html-warning-example.png)