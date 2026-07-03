# NYC COVID-19 Daily Trends Dashboard

**Demo:** [https://covidnyc.blakerayvid.com](https://covidnyc.blakerayvid.com)

This project presents a clean, modern, and responsive dashboard for tracking key COVID-19 trends in New York City. It fetches the latest 7-day trailing average data for cases, hospitalizations, and deaths directly from the NYC Health Department, and visualizes the 30-day trend of new cases with an interactive line chart. All data processing and rendering occur client-side, ensuring fast updates and minimal server overhead.

## Key Features

*   **Modern & Responsive Design:**
    *   Utilizes a clean, professional color palette and typography (Google Fonts: Inter).
    *   Implements a flexible CSS Grid layout for optimal presentation on both desktop and mobile devices.
    *   Card-based UI for clear separation and emphasis of data sections.
    *   Optimized for mobile viewports, ensuring content fits without excessive scrolling.
*   **Enhanced Data Visualization:**
    *   Switched from a scatter plot to a **line chart** (Chart.js v4) for better visualization of time-series data.
    *   Improved chart styling with gradients, customized tooltips, and refined axis labels for better readability.
*   **Modern JavaScript Architecture:**
    *   Transitioned from `XMLHttpRequest` and jQuery to native **`fetch` API with `async/await`** for cleaner, more readable asynchronous operations.
    *   Robust **error handling** with user-friendly messages for network or data parsing issues.
    *   Efficient data parsing and processing, including a dedicated function to find the latest *complete* data entry to account for reporting lags.
    *   No external JavaScript libraries beyond Chart.js, making the codebase lighter and easier to maintain.
*   **Performance & SEO Enhancements:**
    *   Optimized HTML structure with semantic tags (`<main>`, `<header>`, `<footer>`, `<h1>`, `<table>` with `<caption>` and `scope` attributes) for better SEO and accessibility.
    *   Comprehensive `meta` tags (charset, viewport, description, canonical, author, Open Graph, Twitter Cards) for improved search engine visibility and social media sharing.
    *   `defer` attribute on local scripts and `preconnect` hints for CDN resources to improve page load performance.
    *   Subresource Integrity (SRI) on CDN assets for enhanced security.

## Architecture & Implementation Details

The dashboard's functionality is entirely client-side, driven by HTML, CSS, and vanilla JavaScript.

1.  **Dashboard Initialization (`initializeDashboard`)**:
    *   This is the primary asynchronous function executed on `DOMContentLoaded`.
    *   It manages the overall flow: setting initial loading states, orchestrating data fetching and parsing, updating the UI, and handling any errors gracefully.

2.  **Data Fetching (`fetchData`)**:
    *   Uses the modern `fetch` API to asynchronously retrieve the `data-by-day.csv` file from the NYC Health Department's GitHub repository.
    *   Includes robust error handling for network issues or non-OK HTTP responses.

3.  **CSV Parsing and Data Preparation (`parseCSV`, `findLatestCompleteEntry`)**:
    *   `parseCSV`: Converts the raw CSV text into a structured array of JavaScript objects, where each object represents a row and its properties correspond to the CSV headers. It includes error checks for empty or malformed CSV data.
    *   `findLatestCompleteEntry`: Iterates backward through the parsed data to identify the most recent day for which complete 7-day average values for cases, hospitalizations, and deaths are available. This is crucial as the latest entries in the raw data often have missing values due to reporting delays.

4.  **Metrics Display (`updateMetrics`)**:
    *   Takes the `latestCompleteEntry` data and populates the dedicated metrics table in the HTML.
    *   Formats the numerical values with locale-specific thousand separators for improved readability (e.g., `1,234`).
    *   Displays the date corresponding to the latest data.

5.  **Chart Rendering (`renderChart`)**:
    *   Utilizes **Chart.js v4** to create a responsive line chart visualizing the 30-day trend of new COVID-19 cases (7-day average).
    *   Configures chart options for a clean aesthetic, including:
        *   Smooth line tension (`tension: 0.4`).
        *   Gradient fill under the line for a modern look.
        *   Customized axis ticks and grid lines for clarity.
        *   Enhanced tooltip styling for better user interaction.
    *   Handles the destruction of previous chart instances to prevent memory leaks and ensure fresh rendering on updates.

## Tech Stack

*   **HTML5:** Semantic structure and content.
*   **CSS3:** Responsive layout (CSS Grid, Flexbox), custom properties (variables), modern styling.
*   **JavaScript (ES6+):** Asynchronous operations (`fetch`, `async/await`), DOM manipulation, data processing.
*   **Chart.js v4:** Powerful and flexible JavaScript charting library.
*   **Google Fonts (Inter):** Modern and legible typography.

## Setup & Usage

To run this project locally:

1.  **Clone the repository** (if applicable, otherwise just download the files):
    ```bash
    git clone https://github.com/brayvid/covid-report.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd covid-report
    ```
3.  **Open `index.html`** in your web browser.

No special server setup or build process is required, as all functionality is handled by the browser.

----

<p align="center">&copy; Copyright 2026 <a href="https://blakerayvid.com">Blake Rayvid</a>. All rights reserved.</p>