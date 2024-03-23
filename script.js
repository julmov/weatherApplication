
const weatherForm = document.createElement("div");
weatherForm.classList.add("weatherForm");
document.body.appendChild(weatherForm);

const cityInput = document.createElement("input");
cityInput.setAttribute("type", "text");
cityInput.setAttribute("id", "cityInput");
cityInput.setAttribute("placeholder", "Enter city name");
weatherForm.appendChild(cityInput);

const submitBtn = document.createElement("button");
submitBtn.setAttribute("type", "submit");
submitBtn.setAttribute("id", "submitBtn");
submitBtn.textContent = "Get Weather";
weatherForm.appendChild(submitBtn);

cityContainer = document.createElement("div");
cityContainer.classList.add("city-container");
cityContainer.style.display = "none";
document.body.appendChild(cityContainer);

const cardsContainer = document.createElement("div");
cardsContainer.classList.add("cards-container");
document.body.appendChild(cardsContainer);

const containerCanvas = document.createElement("div");
containerCanvas.id = "containerCanvas";
containerCanvas.style.display = "none";
document.body.appendChild(containerCanvas);

submitBtn.addEventListener("click", async function () {
  const city = cityInput.value;

  if (city) {
    try {
      const weatherData = await getWeatherData(city);
      displayWeatherInfo(weatherData);
      displayCityPhoto(city);
      myCanvas(city, weatherData);

      // createWeatherGraph(weatherData);
    } catch (error) {
      console.error(error);
      displayError(error);
    }
  } else {
    displayError("Please enter a city");
  }
});

const apiKey = "8f7491abf0edf7d482a9ce1653dae76c";

async function getWeatherData(city) {
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`;
  const geoResponse = await fetch(geoUrl);
  if (!geoResponse.ok) {
    throw new Error("Could not fetch city data");
  }
  const geoData = await geoResponse.json();
  if (geoData.length === 0) {
    throw new Error("City not found");
  }
  const { lat, lon } = geoData[0];
  const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const weatherResponse = await fetch(weatherUrl);
  if (!weatherResponse.ok) {
    throw new Error("Could not fetch weather data");
  }
  const weatherData = await weatherResponse.json();
  return weatherData;
}

const createCard = (forecast, index, city) => {
  const card = document.createElement("div");
  card.classList.add("card");

  const { dt, main, weather } = forecast;
  const { temp, humidity } = main;
  const { description } = weather[0];

  const date = new Date(dt * 1000);
  date.setDate(date.getDate() + index); // Add index to the date to increment the day

  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });

  const infoContainer = document.createElement("div");
  infoContainer.classList.add("infoContainer");

  const cityNameDisplay = document.createElement("p");
  cityNameDisplay.textContent = `City: ${city}`;
  cityNameDisplay.id = "cityNameDisplay";
  infoContainer.appendChild(cityNameDisplay);

  const dateDisplay = document.createElement("p");
  dateDisplay.textContent = `${month} ${day}`;
  infoContainer.appendChild(dateDisplay);

  const tempCelsius = Math.round(temp - 273.15);
  const tempDisplay = document.createElement("p");
  tempDisplay.id = "tempDisplay";
  tempDisplay.textContent = `Temperature: ${tempCelsius}°C`;
  infoContainer.appendChild(tempDisplay);

  const humidityDisplay = document.createElement("p");
  humidityDisplay.textContent = `Humidity: ${humidity}%`;
  infoContainer.appendChild(humidityDisplay);

  const descDisplay = document.createElement("p");
  descDisplay.id = "descDisplay";
  descDisplay.textContent = `${description}`;
  infoContainer.appendChild(descDisplay);

   const weatherEmoji = document.createElement("p");
   weatherEmoji.classList.add("weatherEmoji");
   weatherEmoji.style.fontSize = "28px";
   weatherEmoji.textContent = getWeatherEmoji(description);
   infoContainer.appendChild(weatherEmoji);

  const infoEmojiContainer = document.createElement("div");
  infoEmojiContainer.classList.add("info-emoji-container");

  const mobileEmoji = document.createElement("p");
  mobileEmoji.id = "mobileEmoji";
  mobileEmoji.style.display = "none";
  mobileEmoji.textContent = getWeatherEmoji(description);
  infoEmojiContainer.appendChild(mobileEmoji);

  card.appendChild(infoContainer);
  card.appendChild(infoEmojiContainer);

  return card;
};


const displayWeatherInfo = (weatherData) => {
  const city = weatherData.city.name; // Get the city name from the weather data
  const forecasts = weatherData.list.slice(0, 5);

  cardsContainer.innerHTML = "";
  cityContainer.style.display = "flex";
  forecasts.forEach((forecast, index) => {
    const card = createCard(forecast, index, city); // Pass city to createCard function
    cardsContainer.appendChild(card);
  });
};

async function displayCityPhoto(cityName) {
  try {
    const unsplashResponse = await fetch(
      `https://api.unsplash.com/search/photos?page=1&query=${cityName}&client_id=6Zhb8bS8u-t064Jq4aCc7TcIaNYrpi3-pZtG1QywCPA`
    );
    const unsplashData = await unsplashResponse.json();
    let photoUrl = "";
    if (unsplashData.results.length > 0) {
      photoUrl = unsplashData.results[0].urls.regular;
    } else {
      // Use default photo if no photo is fetched
      throw new Error("No photo fetched");
    }

    // Check if cityContainer already exists
    let cityContainer = document.querySelector(".city-container");
    cityContainer.innerHTML = ""; // Clear previous data

    const cityPhoto = document.createElement("img");
    cityPhoto.src = photoUrl;
    cityPhoto.alt = `Photo of ${cityName}`;
    cityPhoto.classList.add("city-photo");

    // Create a div for weather info
    const weatherInfo = document.createElement("div");
    weatherInfo.classList.add("weather-info");

    // Append weather info to the container
    cityContainer.appendChild(cityPhoto);
    cityContainer.appendChild(weatherInfo);

    // Fetch weather data and display
    const weatherData = await getWeatherData(cityName);
    displayCityWeatherInfo(weatherData, weatherInfo);
  } catch (error) {
    console.error("Error fetching city photo:", error);
   cityContainer.innerHTML = "";
    const defaultPhoto = "images/Neckertal_20150527-6384.jpg";
    const cityPhoto = document.createElement("img");
    cityPhoto.src = defaultPhoto;
    cityPhoto.alt = `Photo of ${cityName}`;
    cityPhoto.classList.add("city-photo");

    // Create a div for weather info
    const weatherInfo = document.createElement("div");
    weatherInfo.classList.add("weather-info");

    // Append weather info to the container
    cityContainer.appendChild(cityPhoto);
    cityContainer.appendChild(weatherInfo);

    // Fetch weather data and display
    const weatherData = await getWeatherData(cityName);
    displayCityWeatherInfo(weatherData, weatherInfo);
  }
}


function displayCityWeatherInfo(weatherData, weatherInfoContainer) {
  weatherInfoContainer.innerHTML = "";

  const city = weatherData.city.name;
  const forecasts = weatherData.list.slice(0, 1); // Only need current weather

  forecasts.forEach((forecast) => {
    const { main, weather, dt } = forecast; // Define dt here
    const { temp, humidity } = main;
    const { description } = weather[0];

    const date = new Date(dt * 1000); // Convert dt to a date object

    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });

    // Create elements for weather info
    const cityDisplay = document.createElement("p");
    cityDisplay.id = "cityBigCard";
    cityDisplay.textContent = `${city}`;

    const dateDisplay = document.createElement("p");
    dateDisplay.textContent = `${month} ${day}`;

    const tempDisplay = document.createElement("p");
    tempDisplay.textContent = `${Math.round(temp - 273.15)}°C`;
    tempDisplay.style.fontSize = "48px";

    const humidityDisplay = document.createElement("p");
    humidityDisplay.textContent = `Humidity: ${humidity}%`;

    const descDisplay = document.createElement("p");
    descDisplay.textContent = `Weather: ${description}`;

    const weatherEmoji = document.createElement("p");
    weatherEmoji.id = "bigEmoji";
    weatherEmoji.style.fontSize = "82px";
    weatherEmoji.textContent = getWeatherEmoji(description);

    // Append weather info to container
    weatherInfoContainer.appendChild(cityDisplay);
    weatherInfoContainer.appendChild(tempDisplay);
    weatherInfoContainer.appendChild(dateDisplay);
    weatherInfoContainer.appendChild(humidityDisplay);
    weatherInfoContainer.appendChild(descDisplay);
    weatherInfoContainer.appendChild(weatherEmoji);
  });
}

const displayError = (message) => {
  const errorDisplay = document.createElement("p");
  errorDisplay.textContent = message;
  errorDisplay.classList.add("errorDisplay");
  cardsContainer.textContent = "";
  cardsContainer.appendChild(errorDisplay);
};


const getWeatherEmoji = (description) => {
  if (typeof description !== "string") {
    return "🌞"; // Default emoji for unknown weather
  }
  let emoji;
  let imagePath;
  const lowerCaseDescription = description.toLowerCase();

  switch (lowerCaseDescription) {
    case "clear sky":
      emoji = "☀️";
      imagePath = "url('images/sun.jpg')";
      break;
    case "few clouds":
    case "scattered clouds":
    case "broken clouds":
    case "overcast clouds":
      emoji = "⛅️";
      imagePath = "url('images/beautiful-clouds.jpg')";
      break;
    case "shower rain":
    case "light rain":
    case "rain":
      emoji = "🌧️";
      imagePath = "url('images/rain-316579_1280.jpg')";
      break;
    case "thunderstorm":
      emoji = "⛈️";
      imagePath =
        "url('images/background-a089d87ba11e1a4c45a8efa960b86092.jpg')";
      break;
    case "snow":
      emoji = "❄️";
      imagePath =
        "url('images/24520458-snowfall-backgrounds-of-a-sunlight-cold-weather.jpg')";
      break;
    case "mist":
      emoji = "🌫️";
      imagePath = "url('images/f2b30db3c8bc87486f5b452dd6e6d300.jpg')";
      break;
    default:
      emoji = "🌞"; // Default emoji for unknown weather
      break;
  }

  setBackgroundImage(imagePath);
  return emoji;
};

function setBackgroundImage(imagePath) {
   document.body.style.backgroundImage = imagePath;
   document.body.style.backgroundSize = "cover"; // Ensure the background image covers the entire screen
   document.body.style.backgroundAttachment = "fixed";
}



const myCanvas = (city, weatherData) => {
  clearPreviousContent();
  const canvas = document.createElement("canvas");
  canvas.id = "myChart";
  canvas.width = 900;
  canvas.height = 400;

  containerCanvas.style.display = "block";
  containerCanvas.style.width = "100%"; // Adjust width as needed
  containerCanvas.style.height = "400px";

  containerCanvas.appendChild(canvas);
  const forecasts = weatherData.list.slice(0, 5);
  const dates = [];
  temperatures = [];
  const today = new Date();

  forecasts.forEach((forecast, index) => {
    const date = new Date(forecast.dt * 1000);
    if (index === 0) {
      dates.push("Today");
    } else {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + index);
      dates.push(`${nextDate.getDate()}/${nextDate.getMonth() + 1}`);
    }
    const tempCelsius = Math.round(forecast.main.temp - 273.15);
    temperatures.push(tempCelsius);
  });

  // Initialize your chart using Chart.js
  const ctx = canvas.getContext("2d");
  const myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: dates,
      datasets: [
        {
          label: "temperatures",
          data: temperatures,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
};

 function clearPreviousContent() {
  containerCanvas.innerHTML = "";
}
