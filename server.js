// location-api/server.js (CommonJS style)
const express = require("express");
const cors = require("cors");
const { Country, State, City } = require("country-state-city");

const app = express();
app.use(cors());       // allow calls from your PHP site
app.use(express.json());

// Only these countries in your site
const allowedCountries = ["IN", "CA", "AU", "SG", "GB", "US"]; // GB = UK

// 1) Get countries
app.get("/countries", (req, res) => {
  const countries = Country.getAllCountries()
    .filter(c => allowedCountries.includes(c.isoCode))
    .map(c => ({
      code: c.isoCode,     // e.g. "IN"
      name: c.name         // e.g. "India"
    }))
    // sort in a nice order: India, Canada, Australia, Singapore, UK, USA
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json(countries);
});

// 2) Get states of a country
//   /states?countryCode=IN
app.get("/states", (req, res) => {
  const countryCode = req.query.countryCode;
  if (!countryCode) return res.status(400).json({ error: "countryCode required" });

  const states = State.getStatesOfCountry(countryCode).map(s => ({
    code: s.isoCode,   // e.g. "GJ"
    name: s.name       // e.g. "Gujarat"
  }));

  res.json(states);
});

// 3) Get cities of a state
//   /cities?countryCode=IN&stateCode=GJ
app.get("/cities", (req, res) => {
  const countryCode = req.query.countryCode;
  const stateCode   = req.query.stateCode;
  if (!countryCode || !stateCode) {
    return res.status(400).json({ error: "countryCode and stateCode required" });
  }

  const cities = City.getCitiesOfState(countryCode, stateCode).map(c => ({
    name: c.name
  }));

  res.json(cities);
});

// Start server
const PORT = 4000;  // or any free port
app.listen(PORT, () => {
  console.log(`Location API running on http://localhost:${PORT}`);
});
