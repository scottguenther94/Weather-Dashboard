var dashboard = document.getElementById("dashboard");
var searchButton = document.getElementById("searchButton");
var textArea = document.querySelector("textarea");
var currentWeather = document.querySelector("#currentWeather");
var weekWeather = document.getElementById("weekWeather");
var recentCitySearch = document.getElementById("recentCitySearch");
const apiKey = "851b93f972646c5c1798a340d89d1cb6";

//Search button and enter key event listeners 
searchButton.addEventListener("click", search);
textArea.addEventListener("keydown", function (event) {
    if (event.key === 'Enter') {
        search();
    }
});

//Reformats page to show API search results and recent city searches
function search() {
    recentCitySearch.classList.remove("hide");
    dashboard.classList.remove("s12");
    weekWeather.innerHTML = "";
    dashboard.classList.add("s3");

    for (let i = 0; i < 9; i++) {
        var recentCity = document.getElementById(`search${[i]}`)

        if (recentCity.textContent == "") {
            recentCity.classList.remove("hide");
            recentCity.textContent = textArea.value;
            break;
        };

    };

    //Recently searched city button event listener
    recentCity.addEventListener("click", function () {
        weekWeather.innerHTML = "";
        let requestUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + this.textContent + '&appid=' + apiKey;

        fetch(requestUrl)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data)
                localStorage.setItem("city", data.name);
                localStorage.setItem("lon", data.coord.lon);
                localStorage.setItem("lat", data.coord.lat);
                getWeather();
            });
    })
    cityCoord();
    textArea.value = "";
};

//API call that stores latitude, longitude, and city name- Allows us to make further API calls and reloads if city name is invalid
function cityCoord() {
    let requestUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + textArea.value + '&appid=' + apiKey;

    fetch(requestUrl)
        .then(function (response) {

            if (response.status >= 400) {
                location.reload();
            }
            else {
                return response.json();
            }
        })
        .then(function (data) {
            console.log(data)
            localStorage.setItem("lon", data.coord.lon);
            localStorage.setItem("lat", data.coord.lat);
            localStorage.setItem("city", data.name);
            getWeather();
        });
};


//API call that takes values from local storage, retrieves data from the API, and plugs data into cards
function getWeather() {
    let lon = localStorage.getItem("lon");
    let lat = localStorage.getItem("lat");
    let requestUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&appid=' + apiKey;

    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data)
            let city = localStorage.getItem("city");
            let todaysTemp = Math.round(((data.current.temp - 273.15) * 1.8) + 32) + "°F";
            let todaysWind = data.current.wind_speed + "mph";
            let todaysHumidity = data.current.humidity + "%";
            let todaysDate = new Date(data.current.dt * 1000).toLocaleString();
            let weatherIcon = (data.current.weather[0].icon).toLocaleString();
            
            let uvIndex = data.current.uvi;

            currentWeather.innerHTML = `
            <div class="card indigo darken-4">
                <div class="card-content black-text">
                    <ul class="collection with-header">
                        <li class="collection-header light-blue lighten-4"><h4>${city + "     (" + todaysDate.split(",")[0] + ")"}</h4><img style="height:50px width:50px" src="http://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt=""></h4></li>
                        <li class="collection-item green">Temperature: ${todaysTemp}</li>
                        <li class="collection-item green lighten-1">Humidity: ${todaysHumidity}</li>
                        <li class="collection-item green lighten-2">Wind Speed: ${todaysWind}</li>
                        <li class="collection-item" id="uvColor">UV Index: ${uvIndex}</li>
                    </ul>
                </div>
            </div>`;

            let color = document.getElementById(`uvColor`);

            if (uvIndex < 3) {
                color.classList.add("deep-purple");
            }
            else if ((uvIndex >= 3) && (uvIndex < 6)) {
                color.classList.add("indigo");
            }
            else if ((uvIndex >= 6) && (uvIndex < 8)) {
                color.classList.add("blue");
            }
            else if ((uvIndex >= 8) && (uvIndex < 11)) {
                color.classList.add("light-blue");
            }
            else {
                color.classList.add("light-blue lighten-5");
            }


            //Generates daily cards for weekly forecast 
            for (i = 0; i < 6; i++) {
                let weekTemp = Math.round(((data.daily[i].temp.day - 273.15) * 1.8) + 32) + "°F";
                let weekHumidity = data.daily[i].humidity + "%";
                let weekWind = data.daily[i].wind_speed + "mph";
                let weekUV = data.daily[i].uvi;
                let forecastDate = new Date(data.daily[i + 1].dt * 1000).toLocaleString();
                let weatherIcon = data.daily[i].weather[0].icon;

                function addWeatherCard() {
                    let weatherCard = document.createElement("DIV");
                    weatherCard.classList.add("col", "s12", "m6", "l2");
                    weatherCard.setAttribute("id", `weatherCard${[i]}`)
                    weatherCard.innerHTML = `
                        <div class="card indigo darken-4">
                            <div class="card-content black-text">
                                <ul class="collection with-header">
                                    <li class="collection-header light-blue lighten-4"><h4>${forecastDate.split(",")[0]}</h4><img style="height:50px width:50px" src="http://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt=""></h4></li>
                                    <li class="collection-item green">Temperature: ${weekTemp}</li>
                                    <li class="collection-item green lighten-1">Humidity: ${weekHumidity}</li>
                                    <li class="collection-item green lighten-2">Wind Speed: ${weekWind}</li>
                                    <li class="collection-item" id="uvColors${[i]}">UV Index: ${weekUV}</li>
                                </ul>
                            </div>
                        </div>`;

                    weekWeather.appendChild(weatherCard);
                };
                addWeatherCard();
                let color = document.getElementById(`uvColors${[i]}`);

                if (weekUV < 3) {
                    color.classList.add("deep-purple");
                }
                else if ((weekUV >= 3) && (weekUV < 6)) {
                    color.classList.add("indigo");
                }
                else if ((weekUV >= 6) && (weekUV < 8)) {
                    color.classList.add("blue");
                }
                else if ((weekUV >= 8) && (weekUV < 11)) {
                    color.classList.add("light-blue");
                }
                else {
                    color.classList.add("light-blue lighten-5");
                }
            }
        });

};


