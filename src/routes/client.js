const { Router } = require("express");
const { searchClientByIdType } = require("../controllers/client");

const router = Router();

router.post("/", async function (req, res) {
  const clientNumber = await searchClientByIdType(req.body);
  if (/^MOH/.test(clientNumber)) {
    res.send(clientNumber);
  } else {
    res.status(400).send({
      error: "Bad Request",
      message: "The Payload sent is not in the right or expected format.",
    });
  }
});

// router.post('generate-token',
//     async function (req, res) {
//         const clientNumber = await generateToken();
//         res.send(clientNumber);
//     });

module.exports = router;
