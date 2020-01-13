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
    extended: false
  })
);
app.use(bodyParser.json());
app.use(cors());

app.get("/speed", (req, res, next) => {
  const { latitude, longitude } = req.query;

  if (isNaN(latitude))
    return res.status(400).json({ message: "Latitude is not a number" });

  if (isNaN(longitude))
    return res.status(400).json({ message: "Longitude is not a number" });

  axios({
    method: "get",
    baseURL: "https://atlas.microsoft.com/",
    url: "/traffic/flow/segment/json/",
    params: {
      "api-version": 1.0,
      "subscription-key": process.env.AZURE_KEY,
      query: `${latitude},${longitude}`,
      style: "absolute",
      unit: "KMPH",
      zoom: 10
    }
  })
    .then(response => {
      const {
        currentSpeed,
        freeFlowSpeed,
        confidence,
        roadClosure
      } = response.data.flowSegmentData;

      res
        .status(200)
        .json({ currentSpeed, freeFlowSpeed, confidence, roadClosure });
    })
    .catch(err => {
      console.error(err);
      res.status(400).json({
        message: err.message
      });
    });
});

app.listen(PORT, () => console.log(`App is listening on port ${PORT}!`));
