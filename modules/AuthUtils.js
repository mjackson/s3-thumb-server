import { createHmac } from 'crypto'

const SecretKey = process.env.SECRET_KEY

function compareStringsConstantTime(a, b) {
  if (a.length !== b.length)
    return false

  let equal = true

  for (let i = 0; i < a.length; ++i)
    if (a[i] !== b[i])
      equal = false

  return equal
}

export function verifySignature(signature, key) {
  if (SecretKey == null)
    return true // No signature needed

  return compareStringsConstantTime(
    generateSignature(key),
    signature
  )
}

export function generateSignature(key) {
  return createHmac('sha1', SecretKey).update(key).digest('hex').substring(0, 16)
}
