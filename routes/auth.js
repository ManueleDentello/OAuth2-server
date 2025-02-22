const path = require('path') // has path and __dirname
const express = require('express')
const functions = require('../utilities/supportFunctions')
const DebugControl = require('../utilities/debug.js')
const oauthServer = require('../oauth/server')
const router = express.Router() // Instantiate a new router
const filePath = path.join(__dirname, '../public/oauthAuthenticate.html')

// send back a simple form for the oauth
router.get('/authorize', (req,res) => {  
  res.sendFile(filePath)
})

//Get auth code
router.post('/authorize', (req,res,next) => {
  functions.authenticateUser(req.body.username, req.body.password, function(err, result){
    if (!result || err) {
      const params = [ // Send params back to client in the form
      'client_id',
      'redirectUri',
      'response_type',
      'grant_type',
      'state',
      'username',
      ]
      .map(a => `${a}=${req.body[a]}`)
      .join('&')
      
      // error handling: if something's broke, keep the user in the same page, signaling the error
      if (err === 'User is not registered') res.redirect(`/oauth/authorize?user=false&${params}`)
      else if (!result) res.redirect(`/oauth/authorize?success=false&${params}`)
      else res.redirect(`/oauth/authorize?error=true&${params}`)
    }
    // if it's ok then go to the next endpoint
    else next()
  })
}, (req, res, next) => {
  
  // this is for logging of the flow
  DebugControl.log.flow('authorize')
  return next()
  },

  // req.body.username is considered as the user identifier for the authentication
  oauthServer.authorize({
    authenticateHandler: {
      handle: req => {
        return req.body.username
      }
    }
  })
)

//Get token from auth code
router.post('/token', (req,res,next) => {
  DebugControl.log.flow('Token');
  next();
}, oauthServer.token())  // Sends back token

// like /secure: first authentication, then if ok send the protected resource (the username)
router.get('/username', (req, res, next) => {
  DebugControl.log.flow('Get username');
  next();
}, oauthServer.authenticate(), (req, res) => {res.send(res.locals.oauth.token.user)});

module.exports = router
