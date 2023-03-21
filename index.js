const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const registryRoutes = require('./src/routes/client');
const referralRoutes = require('./src/routes/referral');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/client', registryRoutes);
app.use('/referral', referralRoutes);

const PORT = 9000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Loaded');
});