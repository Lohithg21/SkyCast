const apiKey = "eeb6e8ca6103d577b68aff3bd60ce330";
let tempC = null;
let feelsLikeC = null;
let currentUnit = "C";

document.getElementById("cityInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    getWeather();
  }
});

function showLoading() {
  document.getElementById("loadingScreen").classList.add("show");
}

function hideLoading() {
  document.getElementById("loadingScreen").classList.remove("show");
}

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();

  if (city === "") {
    document.getElementById("error").innerText = "Please enter a city name.";
    return;
  }

  document.getElementById("error").innerText = "";
  document.getElementById("result").style.display = "none";
  forecastData = [];
  document.getElementById("forecastSection").style.display = "none";
  showLoading();

  const url =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&appid=" +
    apiKey +
    "&units=metric";

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      hideLoading();

      if (data.cod === 401 || data.cod === "401") {
        document.getElementById("error").innerText =
          "API key not activated yet. Please wait 1-2 hours after signup.";
        return;
      }

      if (data.cod === 404 || data.cod === "404") {
        document.getElementById("error").innerText =
          "City not found. Check spelling and try again.";
        return;
      }

      if (data.cod !== 200 && data.cod !== "200") {
        document.getElementById("error").innerText =
          "Error: " + (data.message || "Something went wrong.");
        return;
      }

      tempC = data.main.temp;
      feelsLikeC = data.main.feels_like;
      currentUnit = "C";

      document.getElementById("btnC").classList.add("active");
      document.getElementById("btnF").classList.remove("active");

      document.getElementById("cityName").innerText =
        data.name + ", " + data.sys.country;
      document.getElementById("condition").innerText =
        data.weather[0].description;
      document.getElementById("humidity").innerText = data.main.humidity + "%";
      document.getElementById("wind").innerText =
        Math.round(data.wind.speed * 3.6) + " km/h";
      document.getElementById("visibility").innerText =
        (data.visibility / 1000).toFixed(1) + " km";

      const main = data.weather[0].main;
      const icon = data.weather[0].icon;

      document.getElementById("weatherIcon").innerText = getEmoji(main, icon);
      setBackground(main, icon);
      updateTemps();

      document.getElementById("result").style.display = "block";
    })
    .catch(function (err) {
      hideLoading();

      if (!navigator.onLine) {
        document.getElementById("error").innerText =
          "No internet connection. Please check your network.";
      } else {
        document.getElementById("error").innerText =
          "Could not reach the server. Please try again.";
      }
    });
}

function getEmoji(main, icon) {
  const isNight = icon && icon.endsWith("n");
  if (main === "Clear") return isNight ? "🌙" : "☀️";
  if (main === "Clouds") return "☁️";
  if (main === "Rain") return "🌧️";
  if (main === "Drizzle") return "🌦️";
  if (main === "Thunderstorm") return "⛈️";
  if (main === "Snow") return "❄️";
  if (main === "Mist") return "🌫️";
  if (main === "Fog") return "🌫️";
  if (main === "Haze") return "🌫️";
  return "🌡️";
}

function setBackground(main, icon) {
  const isNight = icon && icon.endsWith("n");
  const container = document.querySelector(".container");

  container.classList.remove(
    "clear",
    "clouds",
    "rain",
    "drizzle",
    "thunderstorm",
    "snow",
    "mist",
    "night",
  );

  if (isNight) container.classList.add("night");
  else if (main === "Clear") container.classList.add("clear");
  else if (main === "Clouds") container.classList.add("clouds");
  else if (main === "Rain") container.classList.add("rain");
  else if (main === "Drizzle") container.classList.add("drizzle");
  else if (main === "Thunderstorm") container.classList.add("thunderstorm");
  else if (main === "Snow") container.classList.add("snow");
  else if (main === "Mist" || main === "Fog" || main === "Haze")
    container.classList.add("mist");
}

function updateTemps() {
  if (tempC === null) return;

  if (currentUnit === "C") {
    document.getElementById("tempDisplay").innerText = Math.round(tempC) + "°C";
    document.getElementById("feelsLike").innerText =
      Math.round(feelsLikeC) + "°C";
  } else {
    const tempF = Math.round((tempC * 9) / 5 + 32);
    const feelsF = Math.round((feelsLikeC * 9) / 5 + 32);
    document.getElementById("tempDisplay").innerText = tempF + "°F";
    document.getElementById("feelsLike").innerText = feelsF + "°F";
  }
}

function switchUnit(unit) {
  currentUnit = unit;
  document.getElementById("btnC").classList.toggle("active", unit === "C");
  document.getElementById("btnF").classList.toggle("active", unit === "F");
  updateTemps();
  if (document.getElementById("forecastSection").style.display !== "none") {
    renderForecast();
  }
}

let forecastData = [];

function toggleForecast() {
  const section = document.getElementById("forecastSection");
  const btn = document.querySelector(".forecast-btn");
  if (section.style.display === "none") {
    if (forecastData.length === 0) {
      fetchForecast();
    } else {
      section.style.display = "block";
      btn.classList.add("active");
    }
  } else {
    section.style.display = "none";
    btn.classList.remove("active");
  }
}

function fetchForecast() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return;
  showLoading();
  const url =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    city +
    "&appid=" +
    apiKey +
    "&units=metric";
  fetch(url)
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      hideLoading();
      if (data.cod !== "200") return;
      const daily = {};
      data.list.forEach(function (item) {
        const date = item.dt_txt.split(" ")[0];
        if (!daily[date]) daily[date] = [];
        daily[date].push(item);
      });
      forecastData = Object.keys(daily)
        .slice(0, 5)
        .map(function (date) {
          const items = daily[date];
          const temps = items.map(function (i) {
            return i.main.temp;
          });
          const mid = items[Math.floor(items.length / 2)];
          return {
            date: date,
            minC: Math.round(Math.min(...temps)),
            maxC: Math.round(Math.max(...temps)),
            condition: mid.weather[0].description,
            main: mid.weather[0].main,
            icon: mid.weather[0].icon,
          };
        });
      renderForecast();
      document.getElementById("forecastSection").style.display = "block";
      document.querySelector(".forecast-btn").classList.add("active");
    })
    .catch(function () {
      hideLoading();
    });
}

function renderForecast() {
  const container = document.getElementById("forecastCards");
  container.innerHTML = "";
  forecastData.forEach(function (day) {
    const d = new Date(day.date + "T12:00:00");
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateStr = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    let minTemp, maxTemp;
    if (currentUnit === "C") {
      minTemp = day.minC + "°C";
      maxTemp = day.maxC + "°C";
    } else {
      minTemp = Math.round((day.minC * 9) / 5 + 32) + "°F";
      maxTemp = Math.round((day.maxC * 9) / 5 + 32) + "°F";
    }
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML =
      "<div class='fc-day'>" +
      dayName +
      "</div>" +
      "<div class='fc-date'>" +
      dateStr +
      "</div>" +
      "<div class='fc-icon'>" +
      getEmoji(day.main, day.icon) +
      "</div>" +
      "<div class='fc-condition'>" +
      day.condition +
      "</div>" +
      "<div class='fc-temps'><span class='fc-max'>" +
      maxTemp +
      "</span><span class='fc-min'>" +
      minTemp +
      "</span></div>";
    container.appendChild(card);
  });
}
