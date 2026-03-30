const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const tempTypeSelect = document.getElementById("tempType");
const refreshBtn = document.getElementById("refreshBtn");
const themeToggle = document.getElementById("themeToggle");

const loader = document.getElementById("loader");

const currentTemp = document.getElementById("currentTemp");
const windSpeed = document.getElementById("windSpeed");
const locationName = document.getElementById("locationName");

let tempChart, windChart;

// Load saved preferences
const savedCity = localStorage.getItem("city") || "Johannesburg";
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.body.classList.add("light");
}

cityInput.value = savedCity;

// Loader toggle
function showLoader() {
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

// Fetch coordinates from city name
async function getCoordinates(city) {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
  const data = await res.json();
  return data.results[0];
}

// Fetch weather data
async function fetchWeather() {
  try {
    showLoader();

    const city = cityInput.value;
    localStorage.setItem("city", city);

    const coords = await getCoordinates(city);

    const lat = coords.latitude;
    const lon = coords.longitude;

    locationName.textContent = coords.name;

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,windspeed_10m_max&current_weather=true&timezone=auto`
    );

    const data = await res.json();

    const dates = data.daily.time;
    const maxTemps = data.daily.temperature_2m_max;
    const minTemps = data.daily.temperature_2m_min;
    const wind = data.daily.windspeed_10m_max;

    const selectedType = tempTypeSelect.value;
    const temps = selectedType === "max" ? maxTemps : minTemps;

    currentTemp.textContent = data.current_weather.temperature + "°C";
    windSpeed.textContent = data.current_weather.windspeed + " km/h";

    renderTempChart(dates, temps);
    renderWindChart(dates, wind);

    hideLoader();
  } catch (error) {
    console.error(error);
    hideLoader();
  }
}

// Charts
function renderTempChart(labels, data) {
  if (tempChart) tempChart.destroy();

  tempChart = new Chart(document.getElementById("tempChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Temperature",
        data,
        borderWidth: 2,
        tension: 0.3
      }]
    }
  });
}

function renderWindChart(labels, data) {
  if (windChart) windChart.destroy();

  windChart = new Chart(document.getElementById("windChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Wind Speed",
        data
      }]
    }
  });
}

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const theme = document.body.classList.contains("light") ? "light" : "dark";
  localStorage.setItem("theme", theme);
});

// Events
searchBtn.addEventListener("click", fetchWeather);
refreshBtn.addEventListener("click", fetchWeather);
tempTypeSelect.addEventListener("change", fetchWeather);

// Initial load
fetchWeather();
