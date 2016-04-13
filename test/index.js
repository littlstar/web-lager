'use strict'

var test = require('tape');
var fs = require('fs');
var fse = require('fs-extra');
var mocks3 = require('mock-aws-s3');
var webLager = require('./../');

// mock s3 for testing
mocks3.config.basePath = __dirname + '/buckets/';
var s3 = mocks3.S3();

test('local transport', t => {
  var log = new webLager({
    levels: ['log', 'error'],
    transports: [{
      type: 's3',
      bucket: '/tmp',
      prefix: 'web-lager/',
      threshold: 3
    }]
  });

  log.transports[0].s3 = s3;
  log.log('hello world', 'something else');
  log.error('hello world')
  log.log('hello again world');

  var files = fs.readdirSync(__dirname + '/buckets/tmp/web-lager');
  var file = __dirname + '/buckets/tmp/web-lager/' + files[0];

  var answer = [
    ['LOG', 'hello world something else'],
    ['ERROR', 'hello world'],
    ['LOG', 'hello again world'],
  ];

  // set timeout to wait for logs to asynchronously write...
  setTimeout(_ => {
    var content = fs.readFileSync(file, 'utf8');
    content = content.trim().split('\n');
    content = content.map(c => c.split('\t').slice(1));
    while (answer.length) {
      let a = content.pop();
      let p = answer.pop();
      while (a.length) {
        t.ok(a.pop() == p.pop(), 's3 transport');
      }
    }
    fse.removeSync(__dirname + '/buckets/');
  }, 400);

  t.end();
});
