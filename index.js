require('babel-register')({
  presets: [ 'es2015' ]
})

exports.createServer = require('./modules/ServerUtils').createServer
exports.generateSignature = require('./modules/AuthUtils').generateSignature
