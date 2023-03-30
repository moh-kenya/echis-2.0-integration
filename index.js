
const express = require("express");
const bodyParser = require("body-parser");
const { registerMediator } = require("openhim-mediator-utils");

var mediatorConfig = require("./mediatorConfig.json");
var credentials = require("./openhimConfig.json");

var app = express();
app.use(bodyParser.json());

app.listen(6000, () => {console.log('Server listening on port 6000...')});

// This responds a POST request for the homepage
app.post('/echisOutboundMediator', function (req, res) {
   console.log("Got a POST request");
   console.log(req.body);
   res.send("echis Outbound Mediator received the post request and sent it to the FHIR server.");
})

registerMediator(credentials, mediatorConfig, err => { if(err){ console.error('Check your config', err); process.exit(1);} });

