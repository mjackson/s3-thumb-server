require('babel-register')({
  presets: [ 'es2015' ]
})

if (process.env.NODE_ENV !== 'production')
  require('dotenv').config()

exports.createServer = require('./modules/ServerUtils').createServer
exports.generateSignature = require('./modules/AuthUtils').generateSignature
