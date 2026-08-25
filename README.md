# TaskFlow — Modern Todo List Application

A modern, responsive, and intuitive task and project management web application built with vanilla JavaScript, modern CSS, and Webpack as part of **The Odin Project** curriculum.

---

## 📖 Description

**TaskFlow** enables users to organize tasks into custom projects, track due dates and priorities, write detailed descriptions and notes, and persist all data seamlessly in the browser using the Web Storage API (`localStorage`).

The application adheres to clean software architecture principles, strictly separating pure data models and state management from DOM rendering.

---

## ✨ Features

- **📁 Project Management:**
  - Default protected "Inbox" project for general tasks.
  - Create and switch between multiple custom projects (e.g., Work, College, Personal).
  - Delete custom projects (with automatic fallback to the default Inbox).
  - Real-time task count badges per project.

- **✅ Todo Management (Full CRUD):**
  - **Create:** Add tasks with title, description, due date, priority, and notes.
  - **Read:** Concise overview in list view with priority accents, plus a detailed inspect modal for full notes and descriptions.
  - **Update:** Edit any task's properties at any time.
  - **Delete:** Remove tasks with confirmation.
  - **Complete:** Instant toggle with custom checkbox and strikethrough visual feedback.

- **🎯 Priority System:**
  - Three distinct priority levels: `High` (Red accent), `Medium` (Amber accent), `Low` (Blue accent).

- **💾 Data Persistence:**
  - All projects, tasks, completion states, and active project selections survive page refreshes via `localStorage`.
  - Defensive error handling handles empty or corrupted storage states gracefully.

- **📱 Modern & Responsive UI:**
  - Semantic HTML5 structure utilizing native `<dialog>` elements with backdrop blur.
  - Responsive layout with collapsible slide-out drawer navigation for mobile devices.
  - Accessible keyboard focus states and clean visual hierarchy.

---

## 🛠️ Technologies Used

- **HTML5:** Semantic elements (`<header>`, `<aside>`, `<main>`, `<dialog>`, `<form>`).
- **CSS3:** Custom properties (CSS variables), CSS Grid, Flexbox, responsive media queries, backdrop filters.
- **Vanilla JavaScript (ES6+):** Factory functions, ES6 modules (`import`/`export`), Array methods (`find`, `filter`, `map`, `some`), Event delegation, Object destructuring.
- **Webpack 5:** Module bundling, `HtmlWebpackPlugin`, `style-loader`, `css-loader`, `webpack-dev-server`.
- **Web Storage API:** `localStorage`, `JSON.stringify()`, `JSON.parse()`.
- **Git & GitHub:** Incremental feature branch commits and version control.

---

## 📂 Project Structure

```text
To-do List/
├── dist/                          # Webpack production build outputs
├── src/
│   ├── index.js                   # Application bootstrap entry point
│   ├── template.html              # Base HTML template with modal dialogs
│   ├── modules/
│   │   ├── todo.js                # Factory function for Todo data objects
│   │   ├── project.js             # Factory function for Project data objects
│   │   ├── projectManager.js      # In-memory State & CRUD operations
│   │   ├── storage.js             # LocalStorage serialization & deserialization
│   │   ├── displayController.js   # Pure DOM generation & dialog management
│   │   └── appController.js       # Event listeners & coordination
│   ├── styles/
│   │   └── style.css              # Design system, layout, and priority styles
│   └── assets/                    # Static assets & icons
├── .gitignore
├── package.json
├── package-lock.json
├── webpack.config.js
└── README.md
```

---

## 🚀 How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Clone the repository
```bash
git clone https://github.com/your-username/todo-list.git
cd todo-list
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm start
```
The app will automatically open in your default browser at `http://localhost:8080`.

### 4. Build for production
```bash
npm run build
```
Production-ready files will be generated in the `/dist` directory.

---

## 💾 Data Persistence Architecture

```text
User Action (Add/Edit/Delete/Toggle)
        ↓
projectManager (Updates In-Memory State)
        ↓
storageManager (Serializes State via JSON.stringify to localStorage)
        ↓
displayController (Re-renders Pure DOM from State)
```

- **Lossless Serialization:** Because Todo and Project objects are pure data produced by factories, serializing and deserializing via JSON is 100% loss-free.
- **Rehydration:** On page reload, raw JSON objects are rehydrated through `createTodo` and `createProject` to enforce data types, trimming, and schema validity.

---

## 🧠 What I Learned

During this project from **The Odin Project**, I practiced:
1. **Separation of Concerns:** Keeping business logic completely decoupled from DOM manipulation.
2. **Factory Functions vs. Classes:** Designing pure data objects with default parameters and validation.
3. **Event Delegation:** Using a single listener on parent containers with `event.target.closest('[data-action]')` instead of attaching hundreds of listeners.
4. **Native `<dialog>` API:** Using `showModal()` and `close()` for accessible modals with built-in backdrop styling and <kbd>Escape</kbd> key dismissal.
5. **State Management & Persistence:** Managing a single source of truth and syncing with `localStorage`.
6. **Modern Webpack 5:** Configuring loaders, plugins, and hot module reloading.

---

## 🔮 Future Improvements

- [ ] Add drag-and-drop task reordering.
- [ ] Add search / filter by priority or due date (Today / Upcoming / Overdue).
- [ ] Add project color tag customization.

