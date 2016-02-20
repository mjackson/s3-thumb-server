# s3-thumb-server

s3-thumb-server is a small HTTP server that serves thumbnail images from S3.

## Installation

    $ npm install s3-thumb-server

## Configuration and Usage

Use `createServer` to create a server instance, passing it all the information it needs to connect to S3:

```js
import { createServer } from 's3-thumb-server'

const server = createServer({
  accessKeyId: '...',         // Your AWS access key ID, required
  secretAccessKey: '...',     // Your AWS secret access key, required
  region: 'us-west-1',        // The AWS region that contains your S3 bucket
  s3Bucket: '...'             // The name of your S3 bucket
})

server.listen(8080)
```

`server` is a standard [node HTTP server](https://nodejs.org/api/http.html#http_class_http_server).

## URL Format

In s3-thumb-server, the URL is the API. The server recognizes URLs in the format `/size/key` where:

    size            A string in the format WxH, e.g. 120x100
    key             The key of the image in S3

You may omit either the width or the height to constrain the resize operation by only one dimension. For example, `200x` will constrain the width to 200 pixels and automatically calculate the height preserving the aspect ratio of the original. Likewise, `x200` will constrain by height.

## Signing URLs

The server has the ability to automatically reject requests for resources that have not been signed using a cryptographically secure key. To use this feature, pass a `secretKey` option to `createServer`:

```js
import { createServer } from 's3-thumb-server'

const server = createServer({
  // ...
  secretKey: 'something secret'
})
```

This server will recognize URLs like `/signature/size/key`, where `signature` is a signed value that may be generated using the secret key and the S3 key for a given object.

```js
import { generateSignature } from 's3-thumb-server'
const signature = generateSignature(secretKey, key)
```
