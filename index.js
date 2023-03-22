const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const { registerMediator } = require("openhim-mediator-utils");
const { OPENHIM } = require("./config");
const registryRoutes = require("./src/routes/client");
const referralRoutes = require("./src/routes/referral");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/client", registryRoutes);
app.use("/referral", referralRoutes);

const PORT = 6000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

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
    description: "A mediator for CHIS to handle client registry and referral workflows.",
    defaultChannelConfig: [
      {
        name: "eCHIS Mediator",
        urlPattern: "^/echis-mediator/.*$",
        routes: [
          {
            name: "eCHIS Mediator",
            host: "https://chis-staging.health.go.ke/mediator",
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
        host: "https://chis-staging.health.go.ke/mediator",
        path: "/",
        port: "22000",
        primary: true,
        type: "http",
      },
    ],
  };

registerMediator(OPENHIM, mediatorConfig, registerMediatorCallback);

app.get("/", (req, res) => {
  res.send("Loaded");
});
