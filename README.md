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

- [ ] **Server deployed and accessible with custom domain name** - [My server link](https://yourdomainnamehere.click).

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **HTML pages** - I did not complete this part of the deliverable.
- [ ] **Proper HTML element usage** - I did not complete this part of the deliverable.
- [ ] **Links** - I did not complete this part of the deliverable.
- [ ] **Text** - I did not complete this part of the deliverable.
- [ ] **3rd party API placeholder** - I did not complete this part of the deliverable.
- [ ] **Images** - I did not complete this part of the deliverable.
- [ ] **Login placeholder** - I did not complete this part of the deliverable.
- [ ] **DB data placeholder** - I did not complete this part of the deliverable.
- [ ] **WebSocket placeholder** - I did not complete this part of the deliverable.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Visually appealing colors and layout. No overflowing elements.** - I did not complete this part of the deliverable.
- [ ] **Use of a CSS framework** - I did not complete this part of the deliverable.
- [ ] **All visual elements styled using CSS** - I did not complete this part of the deliverable.
- [ ] **Responsive to window resizing using flexbox and/or grid display** - I did not complete this part of the deliverable.
- [ ] **Use of a imported font** - I did not complete this part of the deliverable.
- [ ] **Use of different types of selectors including element, class, ID, and pseudo selectors** - I did not complete this part of the deliverable.

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Bundled using Vite** - I did not complete this part of the deliverable.
- [ ] **Components** - I did not complete this part of the deliverable.
- [ ] **Router** - I did not complete this part of the deliverable.

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
