# PantryPal

This serves as the startup specification for my web app Pantry Pal. The web app aims to incorporate technologies in order to showcase applicable skills in a modern job market. To see a description of the app itself, see the elevator pitch below.

## 🚀 Specification Deliverable

For this deliverable I did the following:

- [x] Proper use of Markdown
- [x] A concise and compelling elevator pitch
- [x] Description of key features
- [x] Description of how you will use each technology
- [x] One or more rough sketches of your application. Images must be embedded in this file using Markdown image references.

### Elevator pitch

PantryPal is a social recipe-sharing application designed to reduce food waste and decision fatigue by helping users cook with ingredients they already have. The application combines pantry tracking, social media chat functionality, and an AI-powered assistant chef to recommend recipes tailored to user preferences and available ingredients in their own pantry. Real-time features allow users to interact with friends through shared recipes, group chats, an automated shopping list, and polls to find the answer for the hardest question: what's for dinner tonight?

### Design


The application is designed around four primary views:
1. Pantry View – Manage ingredients currently available in your pantry.
2. Feed & Recipes View – View recipes saved by followed users.
3. AI assistant - Generate recipe ideas using the ingredients in your pantry.
4. Planning View – Shopping list and meal calendar that automatically update based on saved recipes.

![Design image](https://github.com/user-attachments/assets/e0fa94b1-a1f8-4a61-a77c-ed3e99e2148c)

<img src="https://github.com/user-attachments/assets/b74d49af-2172-447f-a9e2-c07ebf96a5ed" alt="Screenshot" width="300">

### Key features

**Pantry Tracking:** Users maintain an updatable list of ingredients in their kitchen, including quantities and categories.

**Social Recipe Discovery:** Users can follow others and view recipes they have saved, creating a lightweight social feed.

**AI Assistant Chef:** Users can prompt an AI assistant to receive recipe recommendations based on pantry contents, dietary preferences, and time constraints. Saved recipes can automatically generate shopping list items for missing ingredients.

**Real-Time Interaction (Supporting Feature):** Group chat and live updates allow users to share recipes and vote in polls to decide what to cook together.

**Meal Planning (Supporting Feature):** Recipes added to a calendar automatically update pantry and shopping list data.


### Technologies

I am going to use the required technologies in the following ways.

1. **HTML** - Provides the structure for all pages, including forms, lists, and navigation.
2. **CSS** - Used for layout, styling, and responsiveness. Flexbox and Grid will ensure the application adapts to different screen sizes.
3. **React** - Client-side rendering, and state management. React components will encapsulate pantry items, recipes, feeds, and chat views.
4. **Service** - A Node.js/Express backend will manage authentication, data persistence, API endpoints, and WebSocket connections.
   Endpoints:
       Register,
       Login,
       Logout,
       Follow,
       Unfollow,
       Feed,
       Pantry
6. **DB/Login** - MongoDB will store user accounts, pantry items, recipes, follows, shopping lists, and meal plans. Authentication will restrict access to user-specific data.
7. **WebSocket** - WebSockets will provide real-time updates for group chat messages, live polls, and notifications when followed users save recipes.

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ x ] **Server deployed and accessible with custom domain name** - [My server link](https://startup.pantrypal.click).
- [ ] **IMPORTANT (grading): deploy Simon to subdomain** - The course Simon app must be deployed to `https://simon.pantrypal.click` (don’t skip this or you may receive a 0).

**Helpful Info**:
- Command to SSH into server: ssh -i ~/keys/pantryPal_production.pem ubuntu@98.84.77.7
- public elastic IP address: 98.84.77.7
 - Deploy script supports a source directory: `./deployFiles.sh -k <key.pem> -h <host> -s <service> -d <sourceDir>`

## 🚀 HTML deliverable

Startup URL: https://startup.pantrypal.click/index.html

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **HTML pages** - Six main HTML pages created: index.html (login), register.html (account creation), pantry.html (inventory management), recipes.html (social feed), calendar.html (meal planning), and ailanding.html (AI assistant).
- [x] **Proper HTML element usage** - All pages use semantic HTML with proper `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`, `<form>`, `<fieldset>`, and `<details>` elements. DOCTYPE, lang attributes, meta charset, and viewport tags included on all pages.
- [x] **Links** - Consistent navigation structure across all pages with links to Home, Pantry, Recipes, Calendar, and AI Assistant. Links between authentication pages (login/register). GitHub repository link displayed on home page.
- [x] **Text** - Home page includes a short “What PantryPal does” description. Recipes and AI pages include explanatory text and example placeholder outputs (sample prompt + sample response).
- [x] **3rd party API placeholder** - `recipes.html` includes a “Discover new recipes” section with a search form, mock results, and a documented planned endpoint (`GET /api/external/recipes?q=...`). `ailanding.html` includes a prompt form posting to `POST /api/ai` plus a static example prompt/response.
- [x] **Images** - PantryPal logo included on login page with proper alt text and responsive sizing. Images folder created for additional assets.
- [x] **Login placeholder** - Complete authentication flow with email/password login form (index.html) posting to /api/login endpoint. Account creation form (register.html) with confirm password field posting to /api/register endpoint.
- [x] **DB data placeholder** - Pantry page displays 7 food categories with sample ingredients (Proteins, Dairy, Vegetables, Fruits, Grains, Pantry Staples, Beverages). Recipes page shows recipe cards with ingredients. Calendar displays meal plan data. All elements prepared with data attributes for backend integration.
- [x] **WebSocket placeholder** - `pantry.html` includes a “Live updates” section with connect/send UI, a message log, and a documented planned endpoint (`ws(s)://<host>/ws`).

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Visually appealing colors and layout. No overflowing elements.** - I did not complete this part of the deliverable.
- [x] **Use of a CSS framework** - I did not complete this part of the deliverable.
- [x] **All visual elements styled using CSS** - I did not complete this part of the deliverable.
- [x] **Responsive to window resizing using flexbox and/or grid display** - I did not complete this part of the deliverable.
- [x] **Use of a imported font** - I did not complete this part of the deliverable.
- [x] **Use of different types of selectors including element, class, ID, and pseudo selectors** - I did not complete this part of the deliverable.

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Bundled using Vite** - Created a Vite-based React project with automatic bundling and hot module replacement. The project uses `npm run dev` for local development and `npm run build` for production bundling.
- [x] **Components** - Converted HTML pages into React components with proper JSX structure. Created six main components: Login, Register, Pantry, Recipes, Calendar, and AILanding. Each component is organized in its own directory with accompanying CSS files.
- [x] **Router** - Implemented React Router with BrowserRouter, Routes, and Route components. Navigation links use NavLink. All pages are routable through `/login`, `/register`, `/pantry`, `/recipes`, `/calendar`, and `/ai-assistant` paths with proper navigation structure in the header.

## 🚀 React part 2: Reactivity deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **All functionality implemented or mocked out** - I did not complete this part of the deliverable.
- [ ] **Hooks** - I did not complete this part of the deliverable.

## 🚀 Service deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Node.js/Express HTTP service** - I did not complete this part of the deliverable.
- [ ] **Static middleware for frontend** - I did not complete this part of the deliverable.
- [ ] **Calls to third party endpoints** - I did not complete this part of the deliverable.
- [ ] **Backend service endpoints** - I did not complete this part of the deliverable.
- [ ] **Frontend calls service endpoints** - I did not complete this part of the deliverable.
- [ ] **Supports registration, login, logout, and restricted endpoint** - I did not complete this part of the deliverable.

## 🚀 DB deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Stores data in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Stores credentials in MongoDB** - I did not complete this part of the deliverable.

## 🚀 WebSocket deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Backend listens for WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Frontend makes WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Data sent over WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **WebSocket data displayed** - I did not complete this part of the deliverable.
- [ ] **Application is fully functional** - I did not complete this part of the deliverable.
