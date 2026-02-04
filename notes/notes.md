## CS 260 Notes

[Startup Example - Simon](https://simon.cs260.click)
[My startup - PantryPal](https://startup.yourdomain.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)
- [PantryPal GitHub Repository](https://github.com/kdb82/StartupPantryPal)


## Caddy

No problems worked just like it said in the [instruction](https://github.com/webprogramming260/.github/blob/main/profile/webServers/https/https.md).

## HTML

I was careful to use the correct structural elements such as header, footer, main, nav, and form. The links between the three views work great using the `a` element.

The part I didn't like was the duplication of the header and footer code. This is messy, but it will get cleaned up when I get to React.


## PantryPal - HTML Deliverable

Completed the HTML structure for the PantryPal startup application. Created six main pages representing different components of the application.

### Pages Created

1. **index.html** - Login page with authentication form. Primary entry point for the application. Includes GitHub repository link.
2. **register.html** - Account creation page with password confirmation. Links back to login page.
3. **pantry.html** - Pantry management interface with 7 collapsible food categories (Proteins, Dairy, Vegetables, Fruits, Grains, Pantry Staples, Beverages). Each category includes checkboxes for existing items and an add-item input form.
4. **recipes.html** - Social recipe feed with dual-view filter system (My Recipes vs Friends' Recipes). Displays recipe cards with ingredients and "Add Missing to Shopping List" buttons with data attributes for JavaScript integration.
5. **calendar.html** - Weekly meal planning calendar with navigation controls and a shopping list section that displays missing ingredients from saved recipes.
6. **ailanding.html** - AI Assistant form for recipe recommendations. Includes preference options for servings, time limit, and diet type, with a checkbox to use pantry data.

### Key HTML Concepts Applied

- **Semantic HTML**: Proper use of `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`, `<fieldset>`, and `<details>` elements for meaningful structure.
- **Forms**: Multiple form types including authentication, text inputs, number inputs, selects, checkboxes, and textareas with POST methods to API endpoints.
- **Accessibility**: ARIA labels (`aria-label`, `aria-labelledby`, `aria-current="page"`), proper form labels, semantic heading hierarchy, and descriptive alt text for images.
- **Data Attributes**: Strategic use of `data-*` attributes on interactive elements (`data-day`, `data-category`, `data-missing`, `data-recipe`, `data-value`) for JavaScript event targeting and backend integration.
- **Navigation Consistency**: Identical navigation structure across all pages with links to all main features, enabling easy traversal between views.
- **Responsive Design**: Meta viewport tags on all pages for mobile optimization.
- **Placeholders**: All API endpoints included as form action attributes (`/api/login`, `/api/register`, `/api/ai`, etc.) and comments for future database/WebSocket integration.

### What I Learned

- Semantic HTML elements make code more maintainable and improve accessibility significantly.
- Data attributes are essential for preparing HTML for JavaScript interactivity without embedding business logic in HTML.
- Consistent page structure across multiple pages reduces code duplication concerns and improves user experience.
- Forms should use appropriate input types and validation attributes to provide better UX and security.
- ARIA labels and semantic markup should be added during initial HTML creation
- Proper heading hierarchy (single h1 per page with h2/h3 for sections) is important for accessibility.

## PantryPal – CSS & UI Learnings (Recent)

### CSS Architecture & Conventions
- Learned how to organize a single main stylesheet into clear sections (root variables, resets, layout, components, page-specific styles, and media queries) so the CSS stays readable as the project grows.
- Used CSS custom properties (`:root` variables) for colors, spacing, and border radius values, which made it much easier to keep a consistent visual theme and tweak styles globally.
- Started scoping page-specific styles using body classes (like `body.page-recipes`) to avoid accidentally affecting other pages.

### Responsive Layout Techniques
- Got more comfortable using Flexbox and CSS Grid intentionally instead of mixing layout techniques randomly.
- Used max-width containers and responsive grids to prevent horizontal scrolling on smaller screens.
- Learned when and why to collapse multi-column layouts (like recipe cards) down to a single column on mobile.

### Component-Based Styling
- Focused on building reusable components (cards, buttons, forms, status messages) rather than styling elements individually each time.
- Learned the importance of avoiding nested interactive elements (for example, buttons inside clickable cards) to keep accessibility and behavior predictable.

### Bootstrap Integration
- Learned that Bootstrap components rely on a combination of specific HTML structure, predefined class names, and Bootstrap’s JavaScript—not just CSS alone.
- Used Bootstrap modals to display detailed recipe information, while overriding Bootstrap styles with scoped CSS so everything still matches PantryPal’s color scheme.
- Took advantage of Bootstrap’s `data-bs-*` attributes to add real interactivity without writing custom JavaScript yet.

### Accessibility & UX Improvements
- Paid more attention to keyboard accessibility by making sure focus states are visible on clickable cards and modal triggers.
- Used ARIA attributes correctly for navigation state (`aria-current="page"`) and modal behavior.
- Learned how properly implemented modals automatically handle focus, scrolling, and background interaction.

### Workflow & Practical Takeaways
- Committed CSS changes frequently to Git to clearly show progress and ownership.
- Used browser dev tools extensively to debug layout issues, inspect flex/grid behavior, and understand how Bootstrap styles were applied.
- Became more comfortable reading and overriding framework CSS instead of treating it like a black box.
