export const sendText = (res, statusCode, text) => {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain',
    'Content-Length': text.length
  })

  res.end(text)
}

export const sendInvalidURLError = (res, url) =>
  sendText(res, 403, 'Invalid URL: ' + url)

export const sendInvalidSignatureError = (res, signature) =>
  sendText(res, 403, 'Invalid signature: ' + signature)

export const sendInvalidKeyError = (res, key) =>
  sendText(res, 403, 'Invalid key:' + key)

export const sendNotFoundError = (res, what) =>
  sendText(res, 404, 'Not found: ' + what)

export const sendServerError = (res, error) =>
  sendText(res, 500, 'Server error: ' + error.message)

export const sendImage = (res, image) => {
  res.writeHead(200, {
    'Content-Type': image.type,
    'Content-Length': image.size
  })

  res.end(image.body)
}
