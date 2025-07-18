document.addEventListener('DOMContentLoaded', () => {
    // Configuration Constants
    const DATA_URL = 'https://raw.githubusercontent.com/nychealth/coronavirus-data/master/trends/data-by-day.csv';
    const CHART_DAYS_TREND = 30; // Number of days to display on the trend chart

    // DOM Element References
    const loadingStateEl = document.getElementById('loading-state');
    const errorStateEl = document.getElementById('error-state');
    const errorDetailsEl = document.getElementById('error-details');
    const dashboardContentEl = document.getElementById('dashboard-content');
    const dataDateEl = document.getElementById('data-date');
    const casesValueEl = document.getElementById('cases-value');
    const hospValueEl = document.getElementById('hosp-value');
    const deathsValueEl = document.getElementById('deaths-value');

    // Chart.js instance variable to allow for potential updates/destruction
    let myChartInstance = null;

    /**
     * Initializes the dashboard by orchestrating data fetching, parsing, and UI updates.
     * Manages loading and error states for the user.
     */
    async function initializeDashboard() {
        // Set initial UI state: show loading, hide error/content
        loadingStateEl.style.display = 'block';
        errorStateEl.style.display = 'none';
        dashboardContentEl.style.display = 'none';

        try {
            // 1. Fetch raw CSV data
            console.log('Fetching data from:', DATA_URL);
            const csvText = await fetchData(DATA_URL);
            console.log('Data fetched successfully. Parsing...');

            // 2. Parse CSV text into a structured array of objects
            const data = parseCSV(csvText);
            console.log('Data parsed. Total entries:', data.length);
            if (data.length === 0) {
                throw new Error("Parsed data is empty. CSV might be malformed or empty after headers.");
            }

            // 3. Find the most recent day with complete metric data (cases, hosp, deaths)
            const latestMetricsData = findLatestCompleteEntry(data);
            if (!latestMetricsData) {
                throw new Error("Could not find a recent complete data entry for metrics. Data might be too fresh or incomplete.");
            }
            console.log('Latest complete metrics data found for:', latestMetricsData.date_of_interest);

            // 4. Prepare data for the trend chart (last X days)
            const chartData = data.slice(-CHART_DAYS_TREND);
            if (chartData.length === 0) {
                 throw new Error("No sufficient data available for chart rendering (less than " + CHART_DAYS_TREND + " days).");
            }
            console.log('Prepared chart data for', chartData.length, 'days.');

            // 5. Update the UI with the fetched and processed data
            updateMetrics(latestMetricsData);
            renderChart(chartData);
            console.log('UI updated successfully.');

            // 6. Transition UI state: hide loading, show dashboard content
            loadingStateEl.style.display = 'none';
            dashboardContentEl.style.display = 'grid'; // Use 'grid' as defined in CSS for layout

        } catch (error) {
            // Centralized error handling
            console.error('Dashboard Initialization Failed:', error);
            loadingStateEl.style.display = 'none'; // Hide loading
            errorStateEl.style.display = 'block'; // Show error message to the user
            errorDetailsEl.textContent = error.message || "An unexpected error occurred.";
        }
    }

    /**
     * Fetches data from a given URL using the Fetch API.
     * @param {string} url - The URL of the resource to fetch.
     * @returns {Promise<string>} - A promise that resolves with the text content of the response.
     * @throws {Error} If the network response is not OK (e.g., 404, 500) or other fetch issues.
     */
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorStatus = response.status;
                const errorText = response.statusText ? ` (${response.statusText})` : '';
                throw new Error(`Network response was not OK: HTTP ${errorStatus}${errorText}.`);
            }
            return await response.text();
        } catch (fetchError) {
            // Re-throw with a more descriptive message for the user/console
            throw new Error(`Failed to fetch data from ${url}. Check your internet connection or URL. Details: ${fetchError.message}`);
        }
    }

    /**
     * Parses raw CSV text into an array of JavaScript objects.
     * Each object represents a row, with keys derived from the CSV header.
     * @param {string} csvText - The raw CSV string content.
     * @returns {Array<object>} - An array of objects representing the CSV data.
     * @throws {Error} If the CSV data is invalid (e.g., no headers, empty).
     */
    function parseCSV(csvText) {
        // Ensure the CSV text is trimmed to remove leading/trailing whitespace/newlines
        const lines = csvText.trim().split('\n');

        if (lines.length === 0) {
            throw new Error("CSV data is empty.");
        }

        // Extract and trim headers from the first line
        const headers = lines[0].split(',').map(h => h.trim());
        if (headers.length === 0 || (headers.length === 1 && headers[0] === '')) {
            throw new Error("CSV headers are missing or empty.");
        }

        // Process data rows, starting from the second line
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const row = {};
            headers.forEach((header, index) => {
                // Assign value to its corresponding header, trim it, and handle potentially missing values gracefully
                row[header] = values[index] ? values[index].trim() : '';
            });
            return row;
        }).filter(row => Object.keys(row).length > 0); // Filter out any completely empty rows
    }
    
    /**
     * Iterates backwards through the dataset to find the most recent entry
     * that contains complete and valid numerical data for cases, hospitalizations, and deaths.
     * This accounts for typical data reporting lags where the very latest days might be incomplete.
     * @param {Array<object>} data - The full array of parsed data objects.
     * @returns {object|null} - The most recent complete data entry, or null if none found.
     */
    function findLatestCompleteEntry(data) {
        // Iterate from the most recent day backwards
        for (let i = data.length - 1; i >= 0; i--) {
            const day = data[i];
            
            // Check for presence and numerical validity of all key metrics
            const hasCases = day.CASE_COUNT_7DAY_AVG && !isNaN(Number(day.CASE_COUNT_7DAY_AVG));
            const hasHosp = day.HOSP_COUNT_7DAY_AVG && !isNaN(Number(day.HOSP_COUNT_7DAY_AVG));
            const hasDeaths = day.DEATH_COUNT_7DAY_AVG && !isNaN(Number(day.DEATH_COUNT_7DAY_AVG));

            if (hasCases && hasHosp && hasDeaths) {
                // If all metrics are present and valid, this is our latest complete entry
                return day;
            }
        }
        return null; // No complete entry found in the entire dataset
    }

    /**
     * Updates the main dashboard metrics display (date, cases, hospitalizations, deaths).
     * Numbers are formatted for readability (e.g., with commas).
     * @param {object} data - The latest complete data entry object.
     */
    function updateMetrics(data) {
        // Format the date for display
        const date = new Date(data.date_of_interest);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dataDateEl.textContent = `As of ${date.toLocaleDateString('en-US', options)}`;
        
        // Update each metric, ensuring numerical conversion and locale-specific formatting
        casesValueEl.textContent = Number(data.CASE_COUNT_7DAY_AVG).toLocaleString('en-US');
        hospValueEl.textContent = Number(data.HOSP_COUNT_7DAY_AVG).toLocaleString('en-US');
        deathsValueEl.textContent = Number(data.DEATH_COUNT_7DAY_AVG).toLocaleString('en-US');
    }

    /**
     * Renders or updates the line chart for the 30-day case trend using Chart.js.
     * It destroys any existing chart instance before creating a new one to prevent conflicts.
     * @param {Array<object>} data - An array of data objects, typically for the last CHART_DAYS_TREND days.
     */
    function renderChart(data) {
        const ctx = document.getElementById('myChart').getContext('2d');

        // Prepare chart labels (dates) and actual data points (cases)
        const labels = data.map(day => {
            const date = new Date(day.date_of_interest);
            // Format dates as MM/DD for X-axis labels
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        const caseData = data.map(day => Number(day.CASE_COUNT_7DAY_AVG));

        // Dynamically get colors from CSS variables for consistent theming
        const accentBlue = getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim();
        const accentBlueLight = getComputedStyle(document.documentElement).getPropertyValue('--accent-blue-light').trim();
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-dark').trim();
        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();

        // Create a linear gradient for the chart's background fill effect
        const gradient = ctx.createLinearGradient(0, 0, 0, 400); // 400px height for gradient
        gradient.addColorStop(0, accentBlueLight);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Fades to transparent white

        // Destroy existing chart instance if it exists to avoid memory leaks and render issues
        if (myChartInstance) {
            myChartInstance.destroy();
        }

        // Create a new Chart.js instance
        myChartInstance = new Chart(ctx, {
            type: 'line', // Line chart is ideal for time-series trends
            data: {
                labels: labels,
                datasets: [{
                    label: '7-Day Avg New Cases',
                    data: caseData,
                    borderColor: accentBlue,
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointRadius: 3, // Size of data points
                    pointBackgroundColor: accentBlue,
                    tension: 0.4, // Smoothness of the line (0 = sharp, 1 = very smooth)
                    fill: true, // Fill the area under the line
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Important for custom height via CSS
                interaction: {
                    mode: 'index', // Tooltip mode: shows all datasets at an index
                    intersect: false, // Tooltip shows even if mouse is not directly on a point
                },
                scales: {
                    y: {
                        beginAtZero: true, // Start Y-axis from zero
                        ticks: {
                            color: textColor, // Color of Y-axis labels
                            callback: function(value) {
                                return value.toLocaleString('en-US'); // Format Y-axis numbers with commas
                            }
                        },
                        grid: {
                            color: gridColor, // Color of horizontal grid lines
                            drawBorder: false, // Hide the axis line itself
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor, // Color of X-axis labels
                            maxRotation: 45, // Rotate labels if they become too dense
                            minRotation: 45
                        },
                        grid: {
                            display: false, // Hide vertical grid lines
                            drawBorder: false, // Hide the axis line itself
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // Hide legend; the chart title provides sufficient context
                    },
                    tooltip: {
                        backgroundColor: 'rgba(44, 62, 80, 0.9)', // Dark, semi-transparent background
                        titleColor: 'white',
                        bodyColor: 'white',
                        padding: 12,
                        cornerRadius: 6,
                        callbacks: {
                            label: function(context) {
                                // Customize tooltip label to show metric name and formatted value
                                return `Avg Cases: ${Number(context.raw).toLocaleString('en-US')}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Initiate the dashboard when the entire DOM is loaded.
    initializeDashboard();
});