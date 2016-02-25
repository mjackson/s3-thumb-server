import sharp from 'sharp'

export function createThumb(object, [ width, height ], callback) {
  const thumb = sharp(object.Body).rotate()

  if (width || height)
    thumb.resize(width, height)

  thumb
    .progressive()
    .toBuffer(function (error, buffer) {
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
