export function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain',
    'Content-Length': text.length
  })

  res.end(text)
}

export function sendInvalidURLError(res, url) {
  sendText(res, 403, 'Invalid URL: ' + url)
}

export function sendInvalidSignatureError(res, signature) {
  sendText(res, 403, 'Invalid signature: ' + signature)
}

export function sendNotFoundError(res, what) {
  sendText(res, 404, 'Not found: ' + what)
}

export function sendServerError(res, error) {
  sendText(res, 500, 'Server error: ' + error.message)
}

export function sendImage(res, image) {
  res.writeHead(200, {
    'Content-Type': image.type,
    'Content-Length': image.size
  })

  res.end(image.body)
}
