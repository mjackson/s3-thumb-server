import http from 'http'
import crypto from 'crypto'
import invariant from 'invariant'
import { S3 } from 'aws-sdk'
import { createThumb } from './ImageUtils'
import {
  sendInvalidURLError,
  sendInvalidSignatureError,
  sendInvalidKeyError,
  sendNotFoundError,
  sendServerError,
  sendImage
} from './ResponseUtils'

const constantTimeStringCompare = (a, b) => {
  let isEqual = true

  for (let i = 0; i < a.length; ++i)
    if (a[i] !== b[i])
      isEqual = false

  return isEqual
}

export const generateSignature = (secretKey, key) =>
  crypto.createHmac('sha1', secretKey).update(key).digest('hex').substring(0, 8)

const verifySignature = (secretKey, key, signature) =>
  constantTimeStringCompare(
    generateSignature(secretKey, key),
    signature
  )

const parseDimension = (string) =>
  parseInt(string, 10) || null

const parseSize = (string) =>
  string.split('x', 2).map(parseDimension)

const SignedURLFormat = /^\/([^\/]+)\/([^\/]+)\/(.+)$/

const parseSignedURL = (pathname) => {
  const match = SignedURLFormat.exec(pathname)

  if (match == null)
    return null

  return {
    signature: match[1],
    size: parseSize(match[2]),
    key: match[3]
  }
}

const URLFormat = /^\/([^\/]+)\/(.+)$/

const parseURL = (pathname) => {
  const match = URLFormat.exec(pathname)

  if (match == null)
    return null

  return {
    size: parseSize(match[1]),
    key: match[2]
  }
}

export const createRequestHandler = (options = {}) => {
  const { accessKeyId, secretAccessKey, s3Bucket, secretKey } = options
  const region = options.region || 'us-west-1'

  invariant(
    accessKeyId,
    'Missing accessKeyId'
  )

  invariant(
    secretAccessKey,
    'Missing secretAccessKey'
  )

  invariant(
    s3Bucket,
    'Missing s3Bucket'
  )

  const s3 = new S3({
    accessKeyId,
    secretAccessKey,
    region
  })

  const handleRequest = (req, res) => {
    const url = secretKey ? parseSignedURL(req.url) : parseURL(req.url)

    if (url == null)
      return sendInvalidURLError(res, req.url)

    const { signature, size, key } = url

    if (secretKey && !verifySignature(secretKey, key, signature))
      return sendInvalidSignatureError(res, signature)

    s3.getObject({
      Bucket: s3Bucket,
      Key: key
    }, (error, object) => {
      if (error) {
        if (error.code === 'NoSuchKey') {
          sendNotFoundError(res, 'Object with key "' + key + '"')
        } else {
          sendServerError(res, error)
        }
      } else if (object.ContentType.substring(0, 6) !== 'image/') {
        sendInvalidKeyError(res, error)
      } else {
        createThumb(object, size, (error, thumb) => {
          if (error) {
            sendServerError(res, error)
          } else {
            sendImage(res, thumb)
          }
        })
      }
    })
  }

  return handleRequest
}

/**
 * Creates and returns an HTTP server instance.
 */
export const createServer = (options) =>
  http.createServer(
    createRequestHandler(options)
  )
