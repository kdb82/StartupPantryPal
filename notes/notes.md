# CS 260 Notes

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
