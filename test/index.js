/* global describe, it */

var assert = require('assert')
var typeforce = require('../')
var fixtures = require('./fixtures')
var TYPES = require('./types')
var VALUES = require('./values')

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
    var typeDescription = f.typeId || JSON.stringify(type)
    var valueDescription = JSON.stringify(value)
    var exception = f.exception.replace(/([.*+?^=!:${}\[\]\/\\])/g, '\\$&')

    it('throws "' + exception + '" for type ' + typeDescription + ' with value of ' + valueDescription, function () {
      assert.throws(function () {
        typeforce(type, value, f.strict)
      }, new RegExp(exception))
    })

    it('throws "' + exception + '" for type ' + typeDescription + ' (compiled) with value of ' + valueDescription, function () {
      assert.throws(function () {
        typeforce(typeforce.compile(type), value, f.strict)
      }, new RegExp(exception))
    })
  })
})
