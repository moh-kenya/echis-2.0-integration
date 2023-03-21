const { Router } = require('express');
const { searchClientByIdType } = require('../controllers/client');

const router = Router();

router.post('/community',
  async function(req,res) {
    // call thw FHIR server here
    res.send('FHIR server called');
  });

router.post('/facility',
  async function(req,res) {
    // call thw FHIR server here
    res.send('FHIR server called');
  });

module.exports = router;


// opehhim-url.com/echis-mediator/referral/community-referral
// opehhim-url.com/echis-mediator/referral/facility-referral
// opehhim-url.com/echis-mediator/client