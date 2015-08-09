var assert = require('assert')
var benchmark = require('benchmark')

var local = require('../')
var npm = require('typeforce')

var fixtures = require('../test/fixtures')

function CustomType () { return 'ensure non-greedy match'.toUpperCase() }
var CUSTOM_TYPES = {
  'Buffer': new Buffer(1),
  'CustomType': new CustomType(),
  'Function': function () {}
}

fixtures.valid.forEach(function (f) {
  var actualValue = f.custom ? CUSTOM_TYPES[f.custom] : f.value
  var suite = new benchmark.Suite()
  var ctype = local.compile(f.type)

  if (f.exception) {
    assert.throws(function () { local(ctype, actualValue, f.strict) }, new RegExp(f.exception))
    assert.throws(function () { npm(ctype, actualValue, f.strict) }, new RegExp(f.exception))

    suite.add('local(e)#' + f.type, function () { try { local(ctype, actualValue, f.strict) } catch (e) {} })
    suite.add('  npm(e)#' + f.type, function () { try { npm(ctype, actualValue, f.strict) } catch (e) {} })

  } else {
    local(ctype, actualValue, f.strict)
    npm(ctype, actualValue, f.strict)

    suite.add('local#' + f.type, function () { local(ctype, actualValue, f.strict) })
    suite.add('  npm#' + f.type, function () { npm(ctype, actualValue, f.strict) })
  }

  // after each cycle
  suite.on('cycle', function (event) {
    console.log('*', String(event.target))
  })

  // other handling
  suite.on('complete', function () {
    console.log('\n> Fastest is' + (' ' + this.filter('fastest').pluck('name').join(' | ')).replace(/\s+/, ' ') + '\n')
  })

  suite.on('error', function (event) {
    throw event.target.error
  })

  suite.run()
})
