var assert = require('assert')
var benchmark = require('benchmark')
benchmark.options.minTime = 1

var local = require('../')
var npm = require('typeforce')

// var fixtures = require('../test/fixtures')
var fixtures = [
  { 'type': '?Number', 'value': null },
  { 'type': [ '?Number' ], 'value': [ 1, null ] },
  { 'type': [ { 'a': 'Number' } ], 'value': [ { 'a': 1 }, { 'a': 2 } ] },
  { 'type': [ { 'a': '?Number' } ], 'value': [ { 'a': 1 }, { 'a': null } ] }
]

fixtures.forEach(function (f) {
  var suite = new benchmark.Suite()
  var ctype = local.compile(f.type)

  if (f.exception) {
    assert.throws(function () { local(ctype, f.value, f.strict) }, new RegExp(f.exception))
    assert.throws(function () { npm(ctype, f.value, f.strict) }, new RegExp(f.exception))

    suite.add('local(e)#' + f.type, function () { try { local(ctype, f.value, f.strict) } catch (e) {} })
    suite.add('  npm(e)#' + f.type, function () { try { npm(ctype, f.value, f.strict) } catch (e) {} })

  } else {
    local(ctype, f.value, f.strict)
    npm(ctype, f.value, f.strict)

    suite.add('local#' + f.type, function () { local(f.type, f.value, f.strict) })
    suite.add('  npm#' + f.type, function () { npm(f.type, f.value, f.strict) })
    suite.add('local#(c)' + f.type, function () { local(ctype, f.value, f.strict) })
    suite.add('  npm#(c)' + f.type, function () { npm(ctype, f.value, f.strict) })
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
