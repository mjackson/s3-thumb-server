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

function constantTimeStringCompare(a, b) {
  if (a.length !== b.length)
    return false

  let isEqual = true

  for (let i = 0; i < a.length; ++i)
    if (a[i] !== b[i])
      isEqual = false

  return isEqual
}

function verifySignature(secretKey, key, signature) {
  return constantTimeStringCompare(
    generateSignature(secretKey, key),
    signature
  )
}

export function generateSignature(secretKey, key) {
  return crypto.createHmac('sha1', secretKey).update(key).digest('hex').substring(0, 8)
}

function parseDimension(string) {
  return parseInt(string, 10) || null
}

function parseSize(string) {
  return string.split('x', 2).map(parseDimension)
}

const SignedURLFormat = /^\/([^\/]+)\/([^\/]+)\/(.+)$/

function parseSignedURL(pathname) {
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

function parseURL(pathname) {
  const match = URLFormat.exec(pathname)

  if (match == null)
    return null

  return {
    size: parseSize(match[1]),
    key: match[2]
  }
}

function createRequestHandler(options) {
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

  return function handleRequest(req, res) {
    const url = secretKey ? parseSignedURL(req.url) : parseURL(req.url)

    if (url == null)
      return sendInvalidURLError(res, req.url)

    const { signature, size, key } = url

    if (secretKey && !verifySignature(secretKey, key, signature))
      return sendInvalidSignatureError(res, signature)

    s3.getObject({
      Bucket: s3Bucket,
      Key: key
    }, function (error, object) {
      if (error) {
        if (error.code === 'NoSuchKey') {
          sendNotFoundError(res, 'Object with key "' + key + '"')
        } else {
          sendServerError(res, error)
        }
      } else if (object.ContentType.substring(0, 6) !== 'image/') {
        sendInvalidKeyError(res, error)
      } else {
        createThumb(object, size, function (error, thumb) {
          if (error) {
            sendServerError(res, error)
          } else {
            sendImage(res, thumb)
          }
        })
      }
    })
  }
}

export function createServer(options={}) {
  return http.createServer(
    createRequestHandler(options)
  )
}
