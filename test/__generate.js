var assert = require('assert')
var typeforce = require('../src')
var xtend = require('xtend')
var { TYPES, VALUES } = require('./types')

var TYPES2 = [
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
  { a: { b: { c: 'Number' } } },

  // these will resolve to typeforce.value(...)
  undefined,
  null,
  true,
  false,
  0
]

var VALUES2 = [
  '',
  'foobar',
  0,
  1,
  [],
  [0],
  ['foobar'],
  [{ a: 0 }],
  [null],
  false,
  true,
  undefined,
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

var fixtures = {
  valid: [],
  invalid: []
}

TYPES2.concat(Object.keys(TYPES)).forEach(function (type) {
  VALUES2.concat(Object.keys(VALUES)).forEach(function (value) {
    var f = {}
    var atype, avalue

    if (TYPES[type]) {
      f.typeId = type
      atype = TYPES[type]

      assert.equal(f.typeId, JSON.stringify(atype))

    } else {
      f.type = type
      atype = type
    }

    if (VALUES[value]) {
      f.valueId = value
      avalue = VALUES[value]

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
