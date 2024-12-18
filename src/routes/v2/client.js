const { Router } = require("express");
const {
  fetchClientFromRegistry,
  compareAttrs,
  updateContactUPI,
} = require("../../controllers/v2/client");
const setClient = require("../../middlewares/v2/setClient");
const setInstance = require("../../middlewares/setInstance");
const { updateDoc, getInstanceConf } = require("../../utils/echis");
const { logger } = require("../../utils/logger");

const router = Router();
router.use(setClient());
router.use(setInstance());
router.post("/", async function (req, res) {
  const contact = res.locals.contact;
  const instance = res.locals.instanceValue;
  if (contact.cr_hie_id) {
    res.status(200).send();
    return;
  }
  try {
    let client = await fetchClientFromRegistry(contact);
    const errs = compareAttrs(contact, client);
    if (errs.length > 0) {
      await updateDoc(getInstanceConf(instance), contact._id, {
        cr_hie_id: "",
        cr_hie_error:
          errs.join(", ") +
          " do not match details for client with " +
          contact.identification_type +
          " " +
          contact.identification_number,
      });
    } else {
      await updateContactUPI(getInstanceConf(instance), contact._id, {
        upi: client.id,
        cr_hie_id: client.id,
        cr_hie_id_acquired_on: new Date().getTime(),
        cr_hie_error: "",
      });
    }
    res.status(200).send();
  } catch (error) {
    logger.error(error.message);
    if (error.message.includes("invalid identification type")) {
      await updateDoc(getInstanceConf(instance), contact._id, {
        cr_hie_id: "",
        cr_hie_error: error.message,
      });
    }
    res.status(400).send(JSON.stringify({ error }));
  }
});

module.exports = router;
