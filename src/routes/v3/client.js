const { Router } = require("express");
const setClient = require("../../middlewares/v2/setClient");
const setInstance = require("../../middlewares/setInstance");
const { logger } = require("../../utils/logger");

const router = Router();
router.use(setClient());
router.use(setInstance());

// Route to fetch client by national ID
router.get("/fetch/:nationalId", async (req, res) => {
    try {
      const client = await fetchCRClient(req.params.nationalId);
      res.status(200).json(client);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Route to register a new client
  router.post("/register", async (req, res) => {
    try {
      const { idNumber, pin } = req.body;
      const result = await registerCRClient(idNumber, pin);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Route to test PIN encryption
  router.post("/encrypt-pin", async (req, res) => {
    try {
      const { pin } = req.body;
      const encryptedPin = generateEncryptedPin(pin);
      res.status(200).json({ encryptedPin });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  module.exports = router;