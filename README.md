# web-lager

Meant to be used as a server-side logger.

Supports...
- multiple logging levels
- multiple transports
- Apache-style access logging (`Express` middleware)
- transport to s3 support
- flush logs on time interval or threshold

### Levels
- access
- log
- info
- debug
- warn
- error

### Usage
```javascript
var logger = require('web-lager');

var transports = [];

// flush access logs every 6 hours
transports.push({
  type: 's3',
  bucket: 'ls-data',
  prefix: `services-logs/busboy/${env}/access/`,
  levels: ['access'],
  frequency: '0 */6 * * *'
});

// flushes to s3 every minute
transports.push({
  type: 's3',
  bucket: 'ls-data',
  prefix: `services-logs/busboy/${env}/stderr/`,
  levels: ['error', 'warn'],
  frequency: '* * * * *'
});

// flush stdout every 1000 logs
transports.push({
  type: 's3',
  bucket: 'ls-data',
  prefix: `services-logs/busboy/${env}/stdout/`,
  levels: ['log', 'info'],
  threshold: 1000
});

var log = new webLogger({
  levels: ['log', 'info', 'warn', 'debug'],
  transports: transports
});

```

### Install
```
npm i web-lager --save
```

### Access Logging (Express)
Enable access logging in your Express server by calling `accessLogMiddleware`.
```
app.use(log.accessLogMiddleware());
```
