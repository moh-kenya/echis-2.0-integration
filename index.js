const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const { registerMediator } = require("openhim-mediator-utils");
const { OPENHIM, CONFIG } = require("./config");
const registryRoutes = require("./src/routes/client");
const referralRoutes = require("./src/routes/referral");
const aggregateRoutes = require("./src/routes/aggregate");
const { cronService } = require("./src/middlewares/aggregate");
const PORT = CONFIG.port;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/client", registryRoutes);
app.use("/referral", referralRoutes);
app.use("/aggregate", aggregateRoutes);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
cronService();

const registerMediatorCallback = (err) => {
  if (err) {
    throw new Error(`Mediator Registration Failed: Reason ${err}`);
  }
  console.info("Successfully registered mediator.");
};

const mediatorConfig = {
  urn: "urn:mediator:echis-mediator",
  version: "1.0.0",
  name: "eCHIS Mediator",
  description:
    "A mediator for CHIS to handle client registry and referral workflows.",
  defaultChannelConfig: [
    {
      name: "eCHIS Mediator",
      urlPattern: "^/echis-mediator/.*$",
      routes: [
        {
          name: "eCHIS Mediator",
          host: "https://mediator-staging.health.go.ke",
          pathTransform: "s/\\/echis-mediator/",
          port: 22000,
          primary: true,
          type: "http",
        },
      ],
      allow: ["echis"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      type: "http",
    },
  ],
  endpoints: [
    {
      name: "Mediator",
      host: "https://mediator-staging.health.go.ke",
      path: "/",
      port: "22000",
      primary: true,
      type: "http",
    },
  ],
};

registerMediator(OPENHIM, mediatorConfig, registerMediatorCallback);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.status(200).send("Loaded");
});

module.exports = app;
