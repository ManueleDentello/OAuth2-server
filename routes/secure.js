const express = require('express')
const router = express.Router() // Instantiate a new router
const DebugControl = require('../utilities/debug.js')

// this is a secure endpoint
router.get('/', (req,res) => {
  DebugControl.log.variable({name: 'res.locals.oauth.token', value: res.locals.oauth.token});
  console.log(res.locals.oauth);
  res.json({"message":"Access to protected resource granted!"})
});

module.exports = router
