const {Router} = require('express');
const {createFacilityReferral, createCommunityReferral, createTaskReferral} = require('../controllers/referral');

const router = Router();

router.post('/community',
  async function(req,res) {
    const {status, referral} = await createCommunityReferral(req.body);
    res.status(status).send(referral);
  });

router.post('/facility',
  async function(req, res) {
    const {status, referral} = await createFacilityReferral(req.body);
    res.status(status).send(referral);
  });

router.post('/taskReferral',
  async function(req,res) {
    const {status, referral} = await createTaskReferral(req.body);
    res.status(status).send(referral);
  });

module.exports = router;


// opehhim-url.com/echis-mediator/referral/community-referral
// opehhim-url.com/echis-mediator/referral/facility-referral
// opehhim-url.com/echis-mediator/client
