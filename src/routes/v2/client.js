const { Router } = require("express");
const { getCRFields } = require("../../controllers/v2/client");
const setClient = require("../../middlewares/v2/setClient");
const setInstance = require("../../middlewares/setInstance");
const { updateDoc, getInstanceConf } = require("../../utils/echis");

const router = Router();
router.use(setClient());
router.use(setInstance());
router.post("/", async function (req, res) {
  const contact = res.locals.contact;
  const instance = res.locals.instanceValue;
  if (contact.client_registry?.id && contact.client_registry?.status === "OK") {
    res.status(200).send();
    return;
  }
  try {
    let fields = await getCRFields(contact);
    await updateDoc(getInstanceConf(instance), contact._id, fields);
    res.status(200).send(JSON.stringify(fields));
  } catch (error) {
    res.status(400).send(JSON.stringify({ error }));
  }
});

module.exports = router;
