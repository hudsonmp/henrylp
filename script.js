let date = new Date();
let year = date.getFullYear();
let month = date.getMonth();

const day = document.querySelector(".calendar-dates");

const currdate = document
    .querySelector(".calendar-current-date");

const prenexIcons = document
    .querySelectorAll(".calendar-navigation span");

// Array of month names
const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

// Store events data
let events = [];

// Add this at the beginning of your script.js file
const WEATHER_API_KEY = 'e79b884fd5d5be315c449c01c75d070c'; // You'll need to sign up at OpenWeatherMap to get an API key
const CITY = 'San Diego';

// Function to fetch and parse CSV
async function loadEvents() {
    try {
        const response = await fetch('henry High - Sheet1.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1); // Skip header row
        
        events = rows.map(row => {
            const [date, event, description] = row.split(',');
            return {
                date: new Date(date),
                event: event.trim(),
                description: description.trim()
            };
        });
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Function to generate the calendar
const manipulate = () => {
    let dayone = new Date(year, month, 1).getDay();
    let lastdate = new Date(year, month + 1, 0).getDate();
    let dayend = new Date(year, month, lastdate).getDay();
    let monthlastdate = new Date(year, month, 0).getDate();
    let lit = "";

    // Previous month dates
    for (let i = dayone; i > 0; i--) {
        lit += `<li class="inactive">${monthlastdate - i + 1}</li>`;
    }

    // Current month dates
    for (let i = 1; i <= lastdate; i++) {
        let isToday = i === date.getDate() && month === new Date().getMonth() 
            && year === new Date().getFullYear() ? "active" : "";
            
        // Check if date has events
        const currentDate = new Date(year, month, i);
        const hasEvents = events.some(event => 
            event.date.toDateString() === currentDate.toDateString());
        const hasEventsClass = hasEvents ? "has-events" : "";
        
        lit += `<li class="${isToday} ${hasEventsClass}" data-date="${currentDate.toISOString()}">${i}</li>`;
    }

    // Next month dates
    for (let i = dayend; i < 6; i++) {
        lit += `<li class="inactive">${i - dayend + 1}</li>`;
    }

    currdate.innerText = `${months[month]} ${year}`;
    day.innerHTML = lit;
    
    // Add click handlers to dates
    attachDateClickHandlers();
}

function attachDateClickHandlers() {
    const dateElements = document.querySelectorAll('.calendar-dates li:not(.inactive)');
    dateElements.forEach(dateElement => {
        dateElement.addEventListener('click', showEventsPopup);
    });
}

function showEventsPopup(e) {
    const dateStr = e.target.getAttribute('data-date');
    const clickedDate = new Date(dateStr);
    const dayEvents = events.filter(event => 
        event.date.toDateString() === clickedDate.toDateString());
    
    const popup = document.getElementById('events-popup');
    const content = popup.querySelector('.popup-content');
    
    if (dayEvents.length > 0) {
        content.innerHTML = dayEvents.map(event => `
            <div class="event-item">
                <h4>${event.event}</h4>
                <p>${event.description}</p>
            </div>
        `).join('');
    } else {
        content.innerHTML = '<p>No events for this date</p>';
    }
    
    popup.style.display = 'block';
}

// Close popup when clicking the close button
document.querySelector('.close-popup').addEventListener('click', () => {
    document.getElementById('events-popup').style.display = 'none';
});

loadEvents().then(() => manipulate());

// Attach a click event listener to each icon
prenexIcons.forEach(icon => {

    // When an icon is clicked
    icon.addEventListener("click", () => {

        // Check if the icon is "calendar-prev"
        // or "calendar-next"
        month = icon.id === "calendar-prev" ? month - 1 : month + 1;

        // Check if the month is out of range
        if (month < 0 || month > 11) {

            // Set the date to the first day of the
            // month with the new year
            date = new Date(year, month, new Date().getDate());

            // Set the year to the new year
            year = date.getFullYear();

            // Set the month to the new month
            month = date.getMonth();
        }

        else {

            // Set the date to the current date
            date = new Date();
        }

        // Call the manipulate function to
        // update the calendar display
        manipulate();
    });
});

async function fetchWeather() {
    try {
        // Updated URL format according to documentation
        const url = `https://api.openweathermap.org/data/2.5/weather?q=San Diego,US&units=imperial&appid=${WEATHER_API_KEY}`;
        console.log('Fetching weather from:', url); // Debug URL

        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Weather API Error:', errorData);
            throw new Error(`Weather API error: ${errorData.message}`);
        }
        
        const data = await response.json();
        console.log('Weather data received:', data);
        
        // Update the weather widget
        const temperatureElement = document.querySelector('.temperature');
        const descriptionElement = document.querySelector('.description');
        const iconElement = document.querySelector('.weather-icon');
        
        if (temperatureElement && descriptionElement) {
            temperatureElement.textContent = `${Math.round(data.main.temp)}°F`;
            descriptionElement.textContent = data.weather[0].description;
            
            // Updated icon URL to use HTTPS
            const iconCode = data.weather[0].icon;
            iconElement.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather icon">`;
        }
        
    } catch (error) {
        console.error('Detailed error:', error);
        
        const temperatureElement = document.querySelector('.temperature');
        const descriptionElement = document.querySelector('.description');
        
        if (temperatureElement && descriptionElement) {
            temperatureElement.textContent = 'Error';
            descriptionElement.textContent = error.message || 'Weather data unavailable';
        }
    }
}

// Call fetchWeather immediately and then every 5 minutes
fetchWeather();
setInterval(fetchWeather, 5 * 60 * 1000);
