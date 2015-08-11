var assert = require('assert')
var typeforce = require('../src')
var xtend = require('xtend')

var types = [
  'Array',
  'Boolean',
  'Buffer',
  'Function',
  'Null',
  'Number',
  'Object',
  'String',
  '?Number',
  [ '?Number' ],
  [ 'Number' ],
  [ { a: 'Number' } ],
  { a: 'Number' },
  { a: { b: 'Number' } },
  { a: { b: { c: '?Number' } } },
  { a: { b: { c: 'Number' } } }
]

var values = [
  '',
  'foobar',
  0,
  1,
  [],
  [0],
  [{ a: 0 }],
  [null],
  false,
  true,
  null,
  {},
  { a: null },
  { a: 0 },
  { a: 0, b: 0 },
  { b: 0 },
  { a: { b: 0 } },
  { a: { b: null } },
  { a: { b: { c: 0 } } },
  { a: { b: { c: null } } },
  { a: { b: { c: 0, d: 0 } } }
]

var tests = require('./')
var fixtures = {
  valid: [],
  invalid: []
}

types.concat(Object.keys(tests.TYPES)).forEach(function (type) {
  values.concat(Object.keys(tests.VALUES)).forEach(function (value) {
    var f = {}
    var atype, avalue

    if (tests.TYPES[type]) {
      f.typeId = type
      atype = tests.TYPES[type]

      assert.equal(f.typeId, JSON.stringify(atype))

    } else {
      f.type = type
      atype = type
    }

    if (tests.VALUES[value]) {
      f.valueId = value
      avalue = tests.VALUES[value]

    } else {
      f.value = value
      avalue = value
    }

    try {
      typeforce(atype, avalue, true)
      fixtures.valid.push(f)

    } catch (e) {
      try {
        typeforce(atype, avalue, false)

        fixtures.valid.push(f)
        fixtures.invalid.push(xtend({
          exception: e.message,
          strict: true
        }, f))

      } catch (e) {
        fixtures.invalid.push(xtend({
          exception: e.message
        }, f))
      }
    }
  })
})

console.log(JSON.stringify(fixtures, null, 2))
