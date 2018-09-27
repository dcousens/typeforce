const assert = require('assert')
const benchmark = require('benchmark')
const local = require('../')
const npm = require('typeforce')
const TYPES = require('../test/types')
const VALUES = require('../test/values')
const tests = require('../test/fixtures')
const fixtures = tests.valid.concat(tests.invalid)

fixtures.forEach(function (f) {
  const type = TYPES[f.typeId] || f.type
  const value = VALUES[f.valueId] || f.value
  const ctype = local.compile(type)

  if (f.exception) {
    assert.throws(function () { local(type, value, f.strict) }, new RegExp(f.exception))
    // assert.throws(function () { npm(type, value, f.strict) }, new RegExp(f.exception))
    assert.throws(function () { local(ctype, value, f.strict) }, new RegExp(f.exception))
    // assert.throws(function () { npm(ctype, value, f.strict) }, new RegExp(f.exception))
  } else {
    local(type, value, f.strict)
    npm(type, value, f.strict)
    local(ctype, value, f.strict)
    npm(ctype, value, f.strict)
  }
})

// benchmark.options.minTime = 1
fixtures.forEach(function (f) {
  const suite = new benchmark.Suite()
  const tdescription = JSON.stringify(f.type)
  const type = TYPES[f.typeId] || f.type
  const value = VALUES[f.valueId] || f.value
  const ctype = local.compile(type)

  if (f.exception) {
    suite.add('local(e)#' + tdescription, function () { try { local(type, value, f.strict) } catch (e) {} })
    suite.add('  npm(e)#' + tdescription, function () { try { npm(type, value, f.strict) } catch (e) {} })
    suite.add('local(c, e)#' + tdescription, function () { try { local(ctype, value, f.strict) } catch (e) {} })
    suite.add('  npm(c, e)#' + tdescription, function () { try { npm(ctype, value, f.strict) } catch (e) {} })
  } else {
    suite.add('local#' + tdescription, function () { local(type, value, f.strict) })
    suite.add('  npm#' + tdescription, function () { npm(type, value, f.strict) })
    suite.add('local(c)#' + tdescription, function () { local(ctype, value, f.strict) })
    suite.add('  npm(c)#' + tdescription, function () { npm(ctype, value, f.strict) })
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
