const { Router } = require("express");
const { assignEchisClientUPI, crAxiosInstance } = require("../controllers/client");
const setClient = require("../middlewares/setClient");
const setInstance = require("../middlewares/setInstance");

const router = Router();
router.use(setClient(crAxiosInstance));
router.use(setInstance());
router.post("/", assignEchisClientUPI);

module.exports = router;
