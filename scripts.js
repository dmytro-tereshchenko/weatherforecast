var lat = 0;
var lon = 0;
document.addEventListener("DOMContentLoaded", async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            geolocationSuccess, geolocationFailure);
    }
    else {
        await getDefaultLocation();
        await setStartCity();
        await currentWeather();
    }
});
async function setStartCity(){
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=80883943e6ce504c831b3aedd952ba89`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const weather = await response.json();
        const input=document.forms[0].elements[0];
        input.value=`${weather.name}, ${weather.sys.country}`;
    }
}
async function currentWeather(){
    let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=80883943e6ce504c831b3aedd952ba89`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const weather = await response.json();
        let currentWeatherBlock = document.querySelector("#tooday>div:first-of-type");
        let date = new Date(weather.dt * 1000);
        currentWeatherBlock.querySelector("div:last-of-type").innerHTML=date.toLocaleDateString();
        const weatherLogo=currentWeatherBlock.childNodes[3].childNodes[1];
        weatherLogo.childNodes[1].src=`http://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
        weatherLogo.childNodes[3].innerHTML=weather.weather[0].description;
        const temp = weatherLogo.nextSibling.nextSibling;
        temp.childNodes[1].innerHTML=`${Math.round(weather.main.temp)}&#8451`;
        temp.childNodes[3].innerHTML=`Real Feal ${Math.round(weather.main.feels_like)}&deg;`;
        const sun = temp.nextSibling.nextSibling.querySelectorAll("td+td");
        const sunrise=new Date(weather.sys.sunrise * 1000);
        sun[0].innerHTML=sunrise.toLocaleTimeString();
        const sunset=new Date(weather.sys.sunset * 1000);
        sun[1].innerHTML=sunset.toLocaleTimeString();
        sun[2].innerHTML=`${((sunset-sunrise) /3600000).toFixed(2)} hr`;
    }
    
}
async function getHourlyForecastByLocation(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=80883943e6ce504c831b3aedd952ba89`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const weather = await response.json();
        return weather;
    }
}
async function getDefaultLocation() {
    const response = await fetch(`http://ip-api.com/json/?lang=ru`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const loc = await response.json();
        lat = loc.lat;
        lon = loc.lon;
    }
}
async function geolocationSuccess(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    await setStartCity();
    await currentWeather();
}

async function geolocationFailure(positionError) {
    await getDefaultLocation();
    await setStartCity();
    await currentWeather();
}