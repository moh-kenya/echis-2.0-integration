const app = require("./index");
const { CONFIG } = require("./config");
const PORT = CONFIG.port;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
