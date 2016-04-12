# web-lager

General-purpose logger that supports multiple log levels and transports.  Express framework access logging is built in, which makes this an ideal server-side logger.

### Install
```
npm i web-lager --save
```

### Express Logging
Enable access logging in your Express server by calling `accessLogMiddleware`.
```
app.use(log.accessLogMiddleware());
```

### Basic Usage
Send logs to two different S3 buckets based on log level
```javascript
var Logger = require('web-lager');

var transports = [{
  /* flushes access logs to s3 every minute */
  type: 's3',
  bucket: 'my-bucket',
  prefix: 'access/',
  levels: ['access-logs/'],
  frequency: '* * * * *'  
}, {
  /* flushes errors to s3 every hour */
  type: 's3',
  bucket: 'my-bucket',
  prefix: 'error-logs/',
  levels: ['error', 'warn'],
  frequency: '0 * * * *'  
};

var log = new Logger({
  levels: ['log', 'info', 'warn', 'debug'], // support these top-level types
  transports: transports
});

```

### Supported Levels
- access
- log
- info
- debug
- warn
- error
