// server.js
const express = require("express");
const cors = require("cors");
const { Country, State, City } = require("country-state-city");

const app = express();
app.use(cors());
app.use(express.json());

// Only these countries in your site
const allowedCountries = ["IN", "CA", "AU", "SG", "GB", "US"]; // GB = UK

// Helper: get filtered countries
function getAllowedCountries() {
  return Country.getAllCountries()
    .filter(c => allowedCountries.includes(c.isoCode))
    .map(c => ({
      code: c.isoCode,
      name: c.name
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// 0) Simple health-check route (Render can show something on root)
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Location API running" });
});

// 1) Get countries
app.get("/countries", (req, res) => {
  const countries = getAllowedCountries();
  res.json(countries);
});

// 2) Get states of a country  /states?countryCode=IN
app.get("/states", (req, res) => {
  const countryCode = req.query.countryCode;
  if (!countryCode) {
    return res.status(400).json({ error: "countryCode required" });
  }

  const states = State.getStatesOfCountry(countryCode).map(s => ({
    code: s.isoCode,
    name: s.name
  }));

  res.json(states);
});

// 3) Get cities of a state  /cities?countryCode=IN&stateCode=GJ
app.get("/cities", (req, res) => {
  const countryCode = req.query.countryCode;
  const stateCode = req.query.stateCode;
  if (!countryCode || !stateCode) {
    return res.status(400).json({ error: "countryCode and stateCode required" });
  }

  const cities = City.getCitiesOfState(countryCode, stateCode).map(c => ({
    name: c.name
  }));

  res.json(cities);
});

// 4) OPTIONAL: One-shot "export all data" route
//    Use this once from browser or PHP to save JSON and then serve locally.
app.get("/all", (req, res) => {
  const countries = getAllowedCountries();

  const data = countries.map(country => {
    const states = State.getStatesOfCountry(country.code).map(s => {
      const cities = City.getCitiesOfState(country.code, s.isoCode).map(c => c.name);
      return {
        code: s.isoCode,
        name: s.name,
        cities: cities
      };
    });

    return {
      code: country.code,
      name: country.name,
      states: states
    };
  });

  res.json(data);
});

// Start server - VERY IMPORTANT for Render: use process.env.PORT
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Location API running on port ${PORT}`);
});
