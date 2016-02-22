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
  region: 'us-west-1',        // The AWS region of your S3 bucket, defaults to "us-west-1"
  s3Bucket: '...'             // The name of your S3 bucket, required
})

server.listen(8080)
```

`server` is a standard [node HTTP server](https://nodejs.org/api/http.html#http_class_http_server).

If you'd like to use s3-thumb-server as part of a larger site, using e.g. a framework like [express](http://expressjs.com/), you can use the `createRequestHandler` function directly. As its name suggests, this function returns another function that can be used as the request handler in a standard node HTTP server. This function accepts the same options as `createServer`.

```js
import express from 'express'
import { createRequestHandler } from 's3-thumb-server'

const app = express()
app.use(express.static('public'))
app.use(createRequestHandler())

// ...
```

## URL Format

In s3-thumb-server, the URL is the API. The server recognizes URLs in the format `/size/key` where:

    size            A string in the format WxH, e.g. 120x100
    key             The key of the image in S3

You may omit either the width or the height to constrain the resize operation by only one dimension. For example, `200x` will constrain the width to 200 pixels and automatically calculate the height preserving the aspect ratio of the original. Likewise, `x200` will constrain by height.

## Signing URLs

The server has the ability to automatically reject requests that have not been signed using a cryptographically secure key. To use this feature, pass a `secretKey` option to `createServer`:

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
