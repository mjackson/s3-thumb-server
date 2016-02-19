var port = process.env.PORT || process.env.npm_package_config_port
var server = require('./index').createServer()

server.listen(port, function () {
  console.log('Server started on port ' + port + ', Ctrl+C to quit')
})
