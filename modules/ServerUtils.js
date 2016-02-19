import http from 'http'
import { verifySignature } from './AuthUtils'
import { sendInvalidURLError, sendInvalidSignatureError, sendNotFoundError, sendServerError, sendImage } from './ResponseUtils'
import { createImage } from './ImageUtils'

const NoSuchKey = 'NoSuchKey'
const URLFormat = /^\/([^\/]+)\/([^\/]+)\/(.+)$/

function parseDimension(string) {
  return parseInt(string, 10) || null
}

function parseSize(string) {
  return string.split('x', 2).map(parseDimension)
}

export function parseThumbURL(pathname) {
  const match = URLFormat.exec(pathname)

  if (match == null)
    return null

  return {
    signature: match[1],
    size: parseSize(match[2]),
    key: match[3]
  }
}

/**
 * Supported URL schemes are:
 *
 * /:signature/:size/:key
 *
 * The :size should be a string in the format WxH, e.g. 120x100.
 */
export function handleRequest(req, res) {
  const url = parseThumbURL(req.url)

  if (url == null) {
    sendInvalidURLError(res, req.url)
  } else {
    const { signature, size, key } = url

    if (!verifySignature(signature, key)) {
      sendInvalidSignatureError(res, signature)
    } else {
      createImage(key, size, function (error, image) {
        if (error) {
          if (error.code === NoSuchKey) {
            sendNotFoundError(res, 'Object with key "' + key + '"')
          } else {
            sendServerError(res, error)
          }
        } else {
          sendImage(res, image)
        }
      })
    }
  }
}

/**
 * Creates and returns a new HTTP server instance.
 */
export function createServer() {
  return http.createServer(handleRequest)
}
