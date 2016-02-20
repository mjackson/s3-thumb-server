import invariant from 'invariant'
import { S3 } from 'aws-sdk'
import sharp from 'sharp'

const AWSAccessKeyID = process.env.AWS_ACCESS_KEY_ID
const AWSSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const AWSRegion = process.env.AWS_REGION || 'us-west-1'
const S3Bucket = process.env.S3_BUCKET

invariant(
  AWSAccessKeyID,
  'Missing $AWS_ACCESS_KEY_ID environment variable'
)

invariant(
  AWSSecretAccessKey,
  'Missing $AWS_SECRET_ACCESS_KEY environment variable'
)

invariant(
  S3Bucket,
  'Missing $S3_BUCKET environment variable'
)

const S3Client = new S3({
  accessKeyId: AWSAccessKeyID,
  secretAccessKey: AWSSecretAccessKey,
  region: AWSRegion
})

function getS3Object(key, callback) {
  S3Client.getObject({
    Bucket: S3Bucket,
    Key: key
  }, callback)
}

export function createImage(key, [ width, height ], callback) {
  getS3Object(key, function (error, object) {
    if (error) {
      callback(error)
    } else if (object.ContentType.substring(0, 6) !== 'image/') {
      callback(new Error('Object is not an image'))
    } else {
      sharp(object.Body)
        .rotate()
        .resize(width, height)
        .progressive()
        .toBuffer(function (error, buffer, info) {
          if (error) {
            callback(error)
          } else {
            callback(null, {
              type: object.ContentType,
              size: buffer.length,
              body: buffer
            })
          }
        })
    }
  })
}
