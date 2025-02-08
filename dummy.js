const WEATHER_API_KEY = 'e79b884fd5d5be315c449c01c75d070c';

async function fetchWeather() {
    let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=San Diego,US&units=imperial&appid=${WEATHER_API_KEY}`);
    let data = await response.json();
    console.log(data);
}

fetchWeather();