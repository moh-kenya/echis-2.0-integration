const { Router } = require('express');
const { searchClientByIdType } = require('../controllers/client');

const router = Router();

router.post('/',
  async function(req,res) {
    const clientNumber = await searchClientByIdType(req.body);
    res.send(clientNumber);
});

// router.post('generate-token',
//     async function (req, res) {
//         const clientNumber = await generateToken();
//         res.send(clientNumber);
//     });

module.exports = router;