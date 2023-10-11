const { Router } = require("express");
const { assignEchisClientUPI, crAxiosInstance } = require("../controllers/client");
const setClient = require("../middlewares/setClient");

const router = Router();
router.use(setClient(crAxiosInstance));
router.post("/", assignEchisClientUPI);

module.exports = router;
