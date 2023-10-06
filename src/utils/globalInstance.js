const setGlobalInstance =(req)=>{
    if (req.headers['x-openhim-clientid']) {
        const clientId=req.headers['x-openhim-clientid'];
        if(clientId==='echis'){
          global.instance="STAGING";
        }
        else{
        global.instance = clientId;
        }
      } else {
        global.instance="STAGING";
      }
}

module.exports = setGlobalInstance;