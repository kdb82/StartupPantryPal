# CS 260 Notes

[My startup - Simon](https://simon.cs260.click)
[My startup - PantryPal](https://startup.yourdomain.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)
- [PantryPal GitHub Repository](https://github.com/kdb82/StartupPantryPal)

## AWS

My IP address is: 54.81.96.130
Launching my AMI I initially put it on a private subnet. Even though it had a public IP address and the security group was right, I wasn't able to connect to it.

## Caddy

No problems worked just like it said in the [instruction](https://github.com/webprogramming260/.github/blob/main/profile/webServers/https/https.md).

## HTML

This was easy. I was careful to use the correct structural elements such as header, footer, main, nav, and form. The links between the three views work great using the `a` element.

The part I didn't like was the duplication of the header and footer code. This is messy, but it will get cleaned up when I get to React.

## CSS

This took a couple hours to get it how I wanted. It was important to make it responsive and Bootstrap helped with that. It looks great on all kinds of screen sizes.

Bootstrap seems a bit like magic. It styles things nicely, but is very opinionated. You either do, or you do not. There doesn't seem to be much in between.

I did like the navbar it made it super easy to build a responsive header.

```html
      <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
          <a class="navbar-brand">
            <img src="logo.svg" width="30" height="30" class="d-inline-block align-top" alt="" />
            Calmer
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link active" href="play.html">Play</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="about.html">About</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="index.html">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
```

I also used SVG to make the icon and logo for the app. This turned out to be a piece of cake.

```html
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#0066aa" rx="10" ry="10" />
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="72" font-family="Arial" fill="white">C</text>
</svg>
```

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

### Technical Details

- Used DOCTYPE, proper html lang attribute, meta charset UTF-8, and viewport meta tags on all pages.
- Implemented collapsible sections with semantic `<details>` elements for pantry categories.
- Created data-driven structure with lists organized by category and checkboxes for selection.
- Added form validation with `required` attributes and appropriate input types (email, password, number, select).
- Included responsive image with proper dimensions and alt text.
- Prepared all pages for CSS styling with class names and ID attributes.

### What I Learned

- Semantic HTML elements make code more maintainable and improve accessibility significantly.
- Data attributes are essential for preparing HTML for JavaScript interactivity without embedding business logic in HTML.
- Consistent page structure across multiple pages reduces code duplication concerns and improves user experience.
- Forms should use appropriate input types and validation attributes to provide better UX and security.
- ARIA labels and semantic markup should be added during initial HTML creation, not retrofitted later.
- Proper heading hierarchy (single h1 per page with h2/h3 for sections) is important for both accessibility and SEO.

## React Part 1: Routing

Setting up Vite and React was pretty simple. I had a bit of trouble because of conflicting CSS. This isn't as straight forward as you would find with Svelte or Vue, but I made it work in the end. If there was a ton of CSS it would be a real problem. It sure was nice to have the code structured in a more usable way.

## React Part 2: Reactivity

This was a lot of fun to see it all come together. I had to keep remembering to use React state instead of just manipulating the DOM directly.

Handling the toggling of the checkboxes was particularly interesting.

```jsx
<div className="input-group sound-button-container">
  {calmSoundTypes.map((sound, index) => (
    <div key={index} className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        value={sound}
        id={sound}
        onChange={() => togglePlay(sound)}
        checked={selectedSounds.includes(sound)}
      ></input>
      <label className="form-check-label" htmlFor={sound}>
        {sound}
      </label>
    </div>
  ))}
</div>
```
