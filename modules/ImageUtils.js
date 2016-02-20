import sharp from 'sharp'

export function createThumb(object, [ width, height ], callback) {
  sharp(object.Body)
    .rotate()
    .resize(width, height)
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
