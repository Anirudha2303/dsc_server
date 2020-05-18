const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use(cors());

app.get("/speed", async (req, res) => {
  const { latitude, longitude } = req.query;

  if (isNaN(latitude))
    return res.status(400).json({ message: "Latitude is not a number" });

  if (isNaN(longitude))
    return res.status(400).json({ message: "Longitude is not a number" });

  const searchRes = await axios({
    method: "get",
    baseURL: "https://atlas.microsoft.com/",
    url: "/search/poi/category/json/",
    params: {
      "api-version": 1.0,
      "subscription-key": process.env.AZURE_KEY,
      query: "SCHOOL",
      lat: latitude,
      lon: longitude,
      radius: 50,
      limit: 3,
    },
  });

  console.log(
    "searchRes.data.summary.numResults: ",
    searchRes.data.summary.numResults
  );

  if (searchRes.data.summary.numResults > 0) {
    return res.status(200).json({
      currentSpeed: 30,
      freeFlowSpeed: 30,
    });
  }

  const trafficRes = await axios({
    method: "get",
    baseURL: "https://atlas.microsoft.com/",
    url: "/traffic/flow/segment/json/",
    params: {
      "api-version": 1.0,
      "subscription-key": process.env.AZURE_KEY,
      query: `${latitude},${longitude}`,
      style: "absolute",
      unit: "KMPH",
      zoom: 10,
    },
  });

  const {
    currentSpeed,
    freeFlowSpeed,
    confidence,
    roadClosure,
  } = trafficRes.data.flowSegmentData;

  res.status(200).json({
    currentSpeed,
    freeFlowSpeed,
    confidence,
    roadClosure,
  });
});

app.listen(PORT, () => console.log(`App is listening on port ${PORT}!`));
