// d75facfb7afd818299374cc0161b09a0

//pro.openweathermap.org/data/2.5/forecast/hourly?q={dublin}&appid={d75facfb7afd818299374cc0161b09a0}
//api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API key}

const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
let publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

app.get("/weather/:city", sendWeather);
// app.get("/random/:min/:max", sendrandom);
app.listen(port, () => console.log(`Example app on localhost:${port}!`));

function sendWeather(req, res) {
	let city = req.params.city;
	res.send(weather);
}

// function sendrandom(req, res) {
// 	let min = parseInt(req.params.min);
// 	let max = parseInt(req.params.max);
// 	if (isNaN(min) || isNaN(max)) {
// 		res.status(400);
// 		res.json({ error: "Bad Request." });
// 		return;
// 	}
// 	let result = Math.round(Math.random() * (max - min) + min);
// 	res.json({ result: result });
// }
