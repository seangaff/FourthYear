// d75facfb7afd818299374cc0161b09a0

//api.openweathermap.org/data/2.5/forecast?q=dublin&appid=e3118b4d41776ba1cbdeefefd50ae3b0
//api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=e3118b4d41776ba1cbdeefefd50ae3b0

const express = require("express");
const https = require("https");
const app = express();
const port = 3000;
const path = require("path");
let publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

app.get("/weather/:city", sendForecast);
app.listen(port, () => console.log(`App on localhost:${port}`));
function sendForecast(req, res) {
	let city = req.params.city;
	let request = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=e3118b4d41776ba1cbdeefefd50ae3b0&units=metric`;
	getJson(request).then(async (response) => {
		if (response.cod == 200) {
			let lat = response.city.coord.lat;
			let lon = response.city.coord.lon;
			let aqi = await getAQI(lat, lon);
			res.send(genReponse(response, aqi));
		} else {
			res.send("Error");
		}
	});
}

function getJson(url) {
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				let data = [];
				const headerDate =
					res.headers && res.headers.date
						? res.headers.date
						: "no response date";
				// console.log("Status Code:", res.statusCode);

				res.on("data", (chunk) => {
					data.push(chunk);
				});

				res.on("end", () => {
					// console.log("Response ended: ");
					const response = JSON.parse(Buffer.concat(data).toString());
					resolve(response);
					// console.log(response);
				});
			})
			.on("error", (err) => {
				console.log("Error: ", err.message);
				return err.message;
			});
	});
}

function getAQI(lat, lon) {
	return new Promise((resolve, reject) => {
		let request = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=e3118b4d41776ba1cbdeefefd50ae3b0`;
		getJson(request).then((response) => {
			resolve(response);
		});
	});
}

function genReponse(weatherData, aqiData) {
	//set vars
	let rainStatus = "no rain";
	let avgTemp = 0;
	let tempRange = "";
	let maxAQI = -1;
	let avgAQI = 0;
	let aqiStatus = "do not";
	let summary = [];
	let location = weatherData.city.name + ", " + weatherData.city.country;
	const weekday = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	//check for rain
	for (let i = 0; i < weatherData.list.length; i++) {
		if (weatherData.list[i].rain) {
			rainStatus = "rain";
			break;
		}
	}

	//get avg temp
	for (let i = 0; i < weatherData.list.length; i++) {
		avgTemp += weatherData.list[i].main.temp;
	}
	avgTemp = Math.round(avgTemp / weatherData.list.length);
	//get temp range
	if (avgTemp < 12) {
		tempRange = "Cold";
	} else if (avgTemp > 24) {
		tempRange = "Hot";
	} else {
		tempRange = "Mild";
	}

	//get aqi
	for (let i = 0; i < aqiData.list.length; i++) {
		if (aqiData.list[i].components.pm2_5 > maxAQI) {
			maxAQI = aqiData.list[i].components.pm2_5;
		}
		avgAQI += aqiData.list[i].components.pm2_5;
	}
	avgAQI = Math.round(avgAQI / aqiData.list.length);
	if (avgAQI > 10) {
		aqiStatus = "do";
	}

	// generate summary
	// temperature, Wind Speed and Rainfall level. 8 per day, 4 days
	let d = 0;
	let first = new Date(weatherData.list[d].dt_txt).getDay();
	let today = new Date().getDay();
	while (first == today) {
		d++;
		first = new Date(weatherData.list[d].dt_txt).getDay();
	}

	for (let i = d; i < d + 4 * 8; i += 8) {
		let dailyTemp = 0; //average temp
		let dailyWind = 0; //average wind
		let dailyRain = 0; //total rain
		let icon = "";

		let day = new Date(weatherData.list[i].dt_txt).getDay();
		for (let j = i; j < i + 8; j++) {
			dailyTemp += weatherData.list[j].main.temp;
			dailyWind += weatherData.list[j].wind.speed;
			if (weatherData.list[j].rain) {
				dailyRain += weatherData.list[j].rain["3h"];
			}
			if (j == i + 4) {
				icon =
					"http://openweathermap.org/img/w/" +
					weatherData.list[j].weather[0].icon +
					".png";
			}
		}
		summary.push({
			dailyTemp: Math.round(dailyTemp / 8),
			dailyWind: Math.round(dailyWind / 8),
			dailyRain: Math.round(dailyRain),
			weekday: weekday[day],
			icon: icon,
		});
	}
	//set response
	let response = {
		weather: weatherData,
		aqi: aqiData,
		rainStatus: rainStatus,
		averageTemp: avgTemp,
		tempRange: tempRange,
		Summary: summary,
		aqiStatus: aqiStatus,
		avgAQI: avgAQI,
		location: location,
	};
	return response;
}
