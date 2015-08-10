/* global describe, it */

var assert = require('assert')
var typeforce = require('../src')

var fixtures = require('./fixtures')

describe('typeforce', function () {
  fixtures.valid.forEach(function (f) {
    var typeDescription = JSON.stringify(f.type)
    var valueDescription = JSON.stringify(f.value)

    it('passes ' + typeDescription + ' with ' + valueDescription, function () {
      typeforce(f.type, f.value, f.strict)
    })

    it('passes ' + typeDescription + ' (compiled) with ' + valueDescription, function () {
      typeforce(typeforce.compile(f.type), f.value, f.strict)
    })
  })

  fixtures.invalid.forEach(function (f) {
    assert(f.exception)
    var typeDescription = JSON.stringify(f.type)
    var valueDescription = JSON.stringify(f.value)

    it('throws "' + f.exception + '" for type ' + typeDescription + ' with value of ' + valueDescription, function () {
      assert.throws(function () {
        typeforce(f.type, f.value, f.strict)
      }, new RegExp(f.exception))
    })

    it('throws "' + f.exception + '" for (compiled) type ' + typeDescription + ' with value of ' + valueDescription, function () {
      assert.throws(function () {
        typeforce(typeforce.compile(f.type), f.value, f.strict)
      }, new RegExp(f.exception))
    })
  })
})

describe('typeforce.compile', function () {
  fixtures.valid.forEach(function (f) {
    var typeDescription = JSON.stringify(f.type)

    it('when compiled with ' + typeDescription + ', toJSON\'s the same', function () {
      assert.equal(JSON.stringify(typeforce.compile(f.type)), typeDescription)
    })
  })
})
