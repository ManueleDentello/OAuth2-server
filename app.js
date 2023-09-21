const express = require('express')
const path = require('path')
const app = express()
const bodyParser = require('body-parser')
const oauthServer = require('./oauth/server.js')
const DebugControl = require('./utilities/debug.js')
const http = require('http')
const https = require('https')
const fs = require('fs')

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(DebugControl.log.request())

//Redirect all http requests to https (comment out next 4 lines if you want to run a test)
app.all('*', function(req, res, next){
  if (req.secure) return next()
  res.redirect(307, 'https://' + req.hostname + req.url)
})

/* routes */
app.use('/client', require('./routes/client.js'))
app.use('/user', require('./routes/user.js'))
app.use('/oauth', require('./routes/auth.js'))

// Note that the next router uses middleware. That protects all routes within this middleware
app.use('/secure', (req,res,next) => {
  DebugControl.log.flow('Authentication')
  return next();
  // Se autentica e va tutto bene rimanda alla route definita in ./routes/secure.js
}, oauthServer.authenticate(), require('./routes/secure.js')) // route to access the protected stuff

http.createServer(app).listen(8080)
console.log("Oauth Server listening on port 8080")
https.createServer({
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.cert'),
}, app).listen(8443)
console.log("Oauth Server listening on port 8443")

module.exports = app // For testing
