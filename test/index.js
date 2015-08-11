/* global describe, it */

var assert = require('assert')
var typeforce = require('../src')
var fixtures = require('./fixtures')

var TYPES = {
  '["?{\\"a\\":\\"Number\\"}"]': [ typeforce.maybe({ a: 'Number' }) ],
  '["Boolean","Number","String"]': typeforce.oneOf('Boolean', 'Number', 'String'),
  '"?[\\"Boolean\\",\\"Number\\"]"': typeforce.maybe(typeforce.oneOf('Boolean', 'Number')),
  '"?{\\"a\\":\\"?Number\\"}"': typeforce.maybe({ a: '?Number' }),
  '"?{\\"a\\":\\"Number\\"}"': typeforce.maybe({ a: 'Number' }),
  '{"a":["Number","Null"]}': { a: typeforce.oneOf('Number', 'Null') },
  '{"a":["Number","{\\"b\\":\\"Number\\"}"]}': { a: typeforce.oneOf('Number', { b: 'Number' }) },
  '{"a":"?{\\"b\\":\\"Number\\"}"}': { a: typeforce.maybe({ b: 'Number' }) },
  '{"a":"?{\\"b\\":\\"?{\\\\\\"c\\\\\\":\\\\\\"Number\\\\\\"}\\"}"}': { a: typeforce.maybe({ b: typeforce.maybe({ c: 'Number' }) }) }
}

var VALUES = {
  'function': function () {},
  'customType': new function CustomType () {},
  'buffer': new Buffer(0)
}

describe('typeforce', function () {
  fixtures.valid.forEach(function (f) {
    var type = TYPES[f.typeId] || f.type
    var value = VALUES[f.valueId] || f.value
    var typeDescription = JSON.stringify(type)
    var valueDescription = JSON.stringify(value)

    it('passes ' + typeDescription + ' with ' + valueDescription, function () {
      typeforce(type, value, f.strict)
    })

    it('passes ' + typeDescription + ' (compiled) with ' + valueDescription, function () {
      typeforce(typeforce.compile(type), value, f.strict)
    })
  })

  fixtures.invalid.forEach(function (f) {
    assert(f.exception)
    var type = TYPES[f.typeId] || f.type
    var value = VALUES[f.valueId] || f.value
    var typeDescription = JSON.stringify(type)
    var valueDescription = JSON.stringify(value)
    var exception = f.exception.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$&')

    it('throws "' + exception + '" for type ' + typeDescription + ' with value of ' + valueDescription, function () {
      assert.throws(function () {
        typeforce(type, value, f.strict)
      }, new RegExp(exception))
    })

    it('throws "' + exception + '" for (compiled) type ' + typeDescription + ' with value of ' + valueDescription, function () {
      assert.throws(function () {
        typeforce(typeforce.compile(type), value, f.strict)
      }, new RegExp(exception))
    })
  })
})

describe('typeforce.compile', function () {
  fixtures.valid.forEach(function (f) {
    var type = TYPES[f.typeId] || f.type
    var typeDescription = JSON.stringify(type)

    it('when compiled with ' + typeDescription + ', toJSON\'s the same', function () {
      assert.equal(JSON.stringify(typeforce.compile(type)), typeDescription)
    })
  })
})

module.exports = { TYPES, VALUES }
