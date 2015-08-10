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

var rTypes = {
  '["?{\\"a\\":\\"Number\\"}"]': [ typeforce.maybe({ a: 'Number' }) ],
  '["Boolean","Number","String"]': typeforce.oneOf(['Boolean', 'Number', 'String']),
  '"?[\\"Boolean\\",\\"Number\\"]"': typeforce.maybe(typeforce.oneOf(['Boolean', 'Number'])),
  '"?{\\"a\\":\\"?Number\\"}"': typeforce.maybe({ a: '?Number' }),
  '"?{\\"a\\":\\"Number\\"}"': typeforce.maybe({ a: 'Number' }),
  '{"a":["Number","Null"]}': { a: typeforce.oneOf([ 'Number', 'Null' ]) },
  '{"a":["Number","{\\"b\\":\\"Number\\"}"]}': { a: typeforce.oneOf([ 'Number', { b: 'Number' } ]) },
  '{"a":"?{\\"b\\":\\"Number\\"}"}': { a: typeforce.maybe({ b: 'Number' }) },
  '{"a":"?{\\"b\\":\\"?{\\\\\\"c\\\\\\":\\\\\\"Number\\\\\\"}\\"}"}': { a: typeforce.maybe({ b: typeforce.maybe({ c: 'Number' }) }) }
}
var rValues = {
  'function': function () {},
  'customType': new function CustomType () {},
  'buffer': new Buffer(0)
}

var fixtures = {
  valid: [],
  invalid: []
}

types.concat(Object.keys(rTypes)).forEach(function (type) {
  values.concat(Object.keys(rValues)).forEach(function (value) {
    var f = {}
    var atype, avalue

    if (rTypes[type]) {
      f.typeId = type
      atype = rTypes[type]

      assert.equal(f.typeId, JSON.stringify(atype))

    } else {
      f.type = type
      atype = type
    }

    if (rValues[value]) {
      f.valueId = value
      avalue = rValues[value]

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

module.exports = {
  types: rTypes,
  values: rValues
}

