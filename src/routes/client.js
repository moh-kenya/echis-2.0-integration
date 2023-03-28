const { Router } = require('express');
const { searchClientByIdType } = require('../controllers/client');

const router = Router();

router.post('/',
  async function(req,res) {
    const clientNumber = await searchClientByIdType(req.body);
    res.send(clientNumber);
});

module.exports = router;