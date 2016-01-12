var test = require('tape');
var webLager = require('./../');

test('instantiation', t => {
  var log = new webLager({
    levels: ['log', 'info', 'warn', 'debug']
  });

  log.disable('warn');
  log.disable('log');
  log.disable('info');
  log.enable('error');

  t.ok(log.isEnabled('debug') && log.isEnabled('error'), 'levels');
  t.end();
});
