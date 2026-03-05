# Music Data Analysis Project 🎧

A responsive web application that provides personalized music listening insights based on historical data. Built with a focus on clean architecture, accessibility, and modern security standards.

## 🚀 Features

- **Spotify-Inspired UI:** A sleek, dark-themed interface with high contrast and intuitive navigation.
- **Dynamic Analysis:** Processes raw JSON data in real-time to calculate top tracks, artists, genres, and listening streaks.
- **Edge Case Handling:** Full support for users with no activity (User 4) and sophisticated tie-breaking logic for shared rankings.
- **Unit Tested:** Core logic functions are verified using modular unit tests.

## 🛠 Tech Stack

- **HTML5:** Semantic structure for maximum accessibility.
- **CSS3:** Custom properties (CSS variables) and Grid/Flexbox for a modern layout.
- **JavaScript (ES6+):** Modular approach using `import/export` for better maintainability.
- **Lighthouse Optimized:** Achieved **100/100 Accessibility** and **100/100 Performance** scores.

## 🔒 Security & Performance

- **Content Security Policy (CSP):** Implemented via Meta tags to prevent XSS attacks and unauthorized script execution.
- **No Dependencies:** Built with pure "Vanilla" JavaScript—no external libraries required, ensuring lightning-fast load times.
- **Accessibility:** Follows ARIA best practices to ensure the site is fully navigable via screen readers.

## 📂 Project Structure

- `index.html` - Semantic markup and CSP configuration.
- `style.css` - Spotify-style theme and responsive grid layout.
- `script.mjs` - Main DOM logic and user event handling.
- `common.mjs` - Reusable data processing logic and algorithms (Bonus: Code Re-use).
- `data.mjs` - Data source (provided).

## 🧪 How to Run Tests

To verify the core logic, run the test file using Node.js:
```bash
node common.test.mjs