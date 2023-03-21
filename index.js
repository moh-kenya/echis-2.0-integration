const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const registryRoutes = require('./src/routes/client');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/client-registry', registryRoutes);
app.use('/service-request', serviceRequestRoutes);
app.use('/community-referal', communityReferalRoutes);

const PORT = 9000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Loaded');
});