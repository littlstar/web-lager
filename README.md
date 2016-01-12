# web-lager
Server-side logging with support for multiple transports and s3 integration.  By default logs are sent to `stdout` and `stderr`.

### Install
```
npm i web-lager --save
```

### Usage
```javascript
var transports = [{
  type: 's3',
  bucket: 'your-bucket',
  prefix: 'path/to/folder',
  levels: ['log', 'error'], // this transport will only use these levels
  threshold: 1000 // # logs to hold in memory before flushing to s3
}];

var log = new webLogger({
  levels: ['log', 'info', 'warn', 'debug'],
  transports: transports
});

```
