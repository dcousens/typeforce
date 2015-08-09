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

    it('passes for ' + JSON.stringify(f.type) + ' with ' + (f.custom ? f.custom : JSON.stringify(f.value)), function () {
      typeforce(f.type, actualValue, f.strict)
    })

    it('passes for ' + JSON.stringify(f.type) + ' (compiled) with ' + (f.custom ? f.custom : JSON.stringify(f.value)), function () {
      typeforce(typeforce.compile(f.type), actualValue, f.strict)
    })
  })

  fixtures.invalid.forEach(function (f) {
    assert(f.exception)
    var actualValue = f.custom ? CUSTOM_TYPES[f.custom] : f.value

    it('throws "' + f.exception + '" for type ' + JSON.stringify(f.custom || f.type) + ' with value of ' + (f.custom ? f.custom : JSON.stringify(f.value)), function () {
      assert.throws(function () {
        typeForce(f.type, actualValue, f.strict)
      }, new RegExp(f.exception))
    })
  })
})
