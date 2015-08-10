/* global describe, it */

var assert = require('assert')
var typeforce = require('../src')

function CustomType () { return 'ensure non-greedy match'.toUpperCase() }
var CUSTOM_TYPES = {
  'Buffer': new Buffer(1),
  'CustomType': new CustomType(),
  'Function': function () {}
}

var fixtures = require('./fixtures')

describe('typeforce', function () {
  fixtures.valid.forEach(function (f) {
    var actualValue = f.custom ? CUSTOM_TYPES[f.custom] : f.value
    var typeDescription = JSON.stringify(f.type)
    var valueDescription = JSON.stringify(f.custom || f.value)

    it('passes for ' + typeDescription + ' with ' + valueDescription, function () {
      typeforce(f.type, actualValue, f.strict)
    })

    it('passes for ' + typeDescription + ' (compiled) with ' + valueDescription, function () {
      typeforce(typeforce.compile(f.type), actualValue, f.strict)
    })

    it(typeDescription + ', when compiled and .toJSON() gives back ' + typeDescription, function () {
      assert.equal(typeforce.compile(f.type).toJSON(), f.type)
    })
  })

  fixtures.invalid.forEach(function (f) {
    assert(f.exception)
    var actualValue = f.custom ? CUSTOM_TYPES[f.custom] : f.value
    var typeDescription = JSON.stringify(f.custom || f.type)
    var valueDescription = JSON.stringify(f.custom || f.value)

    it('throws "' + f.exception + '" for type ' + typeDescription + ' with value of ' + valueDescription, function () {
      assert.throws(function () {
        typeforce(f.type, actualValue, f.strict)
      }, new RegExp(f.exception))
    })

    it('throws "' + f.exception + '" for (compiled) type ' + typeDescription + ' with value of ' + valueDescription, function () {
      assert.throws(function () {
        typeforce(typeforce.compile(f.type), actualValue, f.strict)
      }, new RegExp(f.exception))
    })
  })
})
