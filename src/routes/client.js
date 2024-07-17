const { Router } = require("express");
const { contactHandler } = require("../controllers/client");
const setClient = require("../middlewares/setClient");
const setInstance = require("../middlewares/setInstance");

const router = Router();
router.use(setClient());
router.use(setInstance());
router.post("/", contactHandler);

module.exports = router;
