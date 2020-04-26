function initialize() {
  // Target HTML Elements
  const $cityInputEl = document.querySelector("#city-input");
  const $searchBtn = document.querySelector("#search-button");
  const $clearBtn = document.querySelector("#clear-history-button");
  const $cityNameEl = document.querySelector("#city-name");
  const $currentImageEl = document.querySelector("#current-image");
  const $currentTempEl = document.querySelector("#temperature");
  const $currentHumidityEl = document.querySelector("#humidity");
  const $currentWindEl = document.querySelector("#wind-speed");
  const $currentUVEl = document.querySelector("#UV-index");
  const $historyEl = document.querySelector("#history");
  
  // Grab From Local Storage
  let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
  
  const APIKey = "0889b515e7870abc983afdf32bd83ed9";

  // Display Weather based on City Input
  function displayWeather(cityName) {
      // Open Weather API Request Call
      const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${APIKey}`;
      
      axios.get(queryURL)
      .then(response => {

          // Display Current Date using Moment.js
          const currentDate = moment().format('L');
          $cityNameEl.innerHTML = `${response.data.name} (${currentDate})`;

          // Display Weather Image
          const weatherImage = response.data.weather[0].icon;
          $currentImageEl.setAttribute("src", `https://openweathermap.org/img/wn/${weatherImage}@2x.png`);
          $currentImageEl.setAttribute("alt", response.data.weather[0].description);
          
          // Display Temperature (Fahrenheit), Humidity, and Wind Speed
          $currentTempEl.innerHTML = `Temperature: ${(response.data.main.temp)}&#176F`;
          $currentHumidityEl.innerHTML = `Humidity: ${response.data.main.humidity}%`;
          $currentWindEl.innerHTML = `Wind Speed: ${response.data.wind.speed}MPH`;

      // UV Index    
      const latitude = response.data.coord.lat;
      const longitude = response.data.coord.lon;
      const UVQueryURL = `https://api.openweathermap.org/data/2.5/uvi/forecast?lat=${latitude}&lon=${longitude}&appid=${APIKey}&cnt=1`;
      
      axios.get(UVQueryURL)
      .then(response => {
          // Display Current UV Index

          const UVIndex = document.createElement("span");
          const UVIndexValue = response.data[0].value;

          // UV Index Color
          if (UVIndexValue <= 3.00) {
              UVIndex.style.backgroundColor = "green";
          }
          else if (UVIndexValue >= 3.00 && UVIndexValue <= 6.00) {
              UVIndex.style.backgroundColor = "yellow";
          }
          else if (UVIndexValue >= 6.00 && UVIndexValue <= 9.00) {
              UVIndex.style.backgroundColor = "orange";
          }
          else {
              UVIndex.style.backgroundColor = "red";
          }

          UVIndex.innerHTML = UVIndexValue;
          $currentUVEl.innerHTML = "UV Index: ";
          $currentUVEl.append(UVIndex);
      });

      // 5-Day Forecast
      const cityID = response.data.id;
      const forecastQueryURL = `https://api.openweathermap.org/data/2.5/forecast?id=${cityID}&units=imperial&appid=${APIKey}`;
      
      axios.get(forecastQueryURL)
      .then(response => {
          // Display 5-Day Forecast under Current Conditions

          const $forecastEls = document.querySelectorAll(".forecast");

          for (let i = 0; i < $forecastEls.length; i++) {
              // Forecast - Display Current Date
              $forecastEls[i].innerHTML = "";
              const forecastIndex = i * 8 + 4;
              const forecastDate = moment(response.data.list[forecastIndex].dt * 1000).format("L");
              const forecastDateEl = document.createElement("p");

              forecastDateEl.setAttribute("class", "mt-3 mb-0");
              forecastDateEl.setAttribute("id", "forecast-date");
              forecastDateEl.innerHTML = forecastDate;
              $forecastEls[i].append(forecastDateEl);

              // Forecast - Display Weather Image
              const forecastWeatherEl = document.createElement("img");
              forecastWeatherEl.setAttribute("src", `https://openweathermap.org/img/wn/${response.data.list[forecastIndex].weather[0].icon}@2x.png`);
              forecastWeatherEl.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
              $forecastEls[i].append(forecastWeatherEl);

              // Forecast - Display Temperature (Fahrenheit) 
              const forecastTempEl = document.createElement("p");
              forecastTempEl.innerHTML = `Temp: ${(response.data.list[forecastIndex].main.temp)}&#176F`;
              $forecastEls[i].append(forecastTempEl);

              // Forecast - Display Humidity 
              const forecastHumidityEl = document.createElement("p");
              forecastHumidityEl.innerHTML = `Humidity: ${response.data.list[forecastIndex].main.humidity}%`;
              $forecastEls[i].append(forecastHumidityEl);
              }
          })
      });  
  }

  // Clear Button - Event Listener
  $clearBtn.addEventListener("click", () => {
      searchHistory = [];
      $cityInputEl.value = "";
      renderSearchHistory();
  })

  // Previously Searched Cities
  function renderSearchHistory() {
      $historyEl.innerHTML = "";

      for (let i = 0; i < searchHistory.length; i++) {

          const historyItem = document.createElement("input");
          
          historyItem.setAttribute("type", "text");
          historyItem.setAttribute("readonly", true);
          historyItem.setAttribute("class", "form-control d-block bg-white");
          historyItem.setAttribute("id", searchHistory[i]);
          historyItem.setAttribute("value", searchHistory[i]);

          historyItem.addEventListener("click", () => {
              displayWeather(historyItem.value);
          })
          $historyEl.append(historyItem);
      }
  }

  // Display City Weather based on History and Last Position
  renderSearchHistory();
  if (searchHistory.length > 0) {
      displayWeather(searchHistory[searchHistory.length - 1]);
  }

  // Search Button - Event Listener
  $searchBtn.addEventListener("click", () => {
      const searchTerm = $cityInputEl.value.toLowerCase();
      displayWeather(searchTerm);

      // If the city name is already in the searchHistory array, then it will just return and not run the rest
      if (searchHistory.indexOf(searchTerm) > -1) return;
      
      searchHistory.push(searchTerm);
      renderSearchHistory();
      localStorage.setItem("search", JSON.stringify(searchHistory));
  })

  // Enter Key
  $(document).keyup(event => { 
  event.preventDefault();
  if (event.keyCode === 13) { 
      $searchBtn.click(); 
  } 
}); 

}

initialize();