# web-lager

General-purpose logger that supports multiple log levels and transports.  Express framework access logging is built in, which makes this an ideal server-side logger.  By default, all logs are sent to `stdout` or `stderr`.

### Install
```
npm i web-lager --save
```

### Basic Usage
Send logs to two different S3 buckets based on log level
```javascript
var Logger = require('web-lager');

var transports = [{

  // flushes access logs to s3://my-bucket/access/ every minute
  type: 's3',
  bucket: 'my-bucket',
  prefix: 'access/',
  levels: ['access'],
  frequency: '* * * * *'
}, {

  // flushes errors to s3://my-bucket/error-logs/ every hour
  type: 's3',
  bucket: 'my-bucket',
  prefix: 'error-logs/',
  levels: ['error', 'warn'],
  frequency: '0 * * * *'
};

var logger = new Logger({
  transports: transports
});

```

### Express Access Logging
Enable access logging in your Express server by calling `accessLogMiddleware`.
```javascript
var express = require('express');
var Logger = require('web-lager');
var app = express();
var logger = new Logger();

// enables access logging from Express
app.use(logger.accessLogger());
```

### Skip Access Logs
If you want to ignore certain access logs from Express (such as a health check),
you can do so by defining a skip function in the config.
```javascript
var express = require('express');
var Logger = require('web-lager');
var app = express();

var config = {
  access: {

    // Example: skips logs that have a 400+ level status code
    skip: (req, res) => res.statusCode < 400
  }
};

var logger = new Logger(config);
app.use(logger.accessLogger());
```

### Supported Levels
- access
- log
- info
- debug
- warn
- error
