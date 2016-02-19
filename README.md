# s3-thumb-server

s3-thumb-server is a small HTTP server that serves thumbnail images from S3.

## Installation

    $ npm install s3-thumb-server

## Configuration and Usage

All configuration is done through the use of environment variables.

    S3_BUCKET               The name of your S3 bucket (required)
    AWS_ACCESS_KEY_ID       Your AWS access key ID (required)
    AWS_SECRET_ACCESS_KEY   Your AWS secret access key (required)
    AWS_REGION              Your AWS region, defaults to us-west-1
    SECRET_KEY              A cryptographically secure string used to
                            generate URL signatures (optional)

After setting all environment variables, use `createServer` to create a server instance:

```js
import { createServer } from 's3-thumb-server'
const server = createServer()
server.listen(8080)
```

`server` is a standard [node HTTP server](https://nodejs.org/api/http.html#http_class_http_server).

## URL Format

s3-thumb-server recognizes URLs in the format `/:signature/:size/:key` where:

    signature       The URL signature
    size            A string in the format WxH, e.g. 120x100
    key             The key of the image in S3

To generate the URL signature for a given key, use:

```js
import { generateSignature } from 's3-thumb-server'
const signature = generateSignature(key)
```

When no `$SECRET_KEY` environment variable is present, the `signature` is silently ignored.
