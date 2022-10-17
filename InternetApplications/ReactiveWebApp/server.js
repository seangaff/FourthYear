// d75facfb7afd818299374cc0161b09a0

//api.openweathermap.org/data/2.5/forecast?q=dublin&appid=e3118b4d41776ba1cbdeefefd50ae3b0
//api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API key}

const express = require("express");
const https = require("https");
const app = express();
const port = 3000;
const path = require("path");
let publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

app.get("/weather/:city", sendWeather);
// app.get("/random/:min/:max", sendrandom);
app.listen(port, () => console.log(`App on localhost:${port}!`));
function sendWeather(req, res) {
	let city = req.params.city;
	let request = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=e3118b4d41776ba1cbdeefefd50ae3b0`;
	getJson(request).then((response) => {
		res.send(response);
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
					console.log(response.city.name);
				});
			})
			.on("error", (err) => {
				console.log("Error: ", err.message);
				return err.message;
			});
	});
}

function sendrandom(req, res) {
	let min = parseInt(req.params.min);
	let max = parseInt(req.params.max);
	if (isNaN(min) || isNaN(max)) {
		res.status(400);
		res.json({ error: "Bad Request." });
		return;
	}
	let result = Math.round(Math.random() * (max - min) + min);
	res.json({ result: result });
}
