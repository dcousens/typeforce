var tape = require('tape')
var typeforce = require('../')
var fixtures = require('./fixtures')
var TYPES = require('./types')
var VALUES = require('./values')

fixtures.valid.forEach(function (f) {
  var type = TYPES[f.typeId] || f.type
  var value = VALUES[f.valueId] || f.value
  var typeDescription = JSON.stringify(type)
  var valueDescription = JSON.stringify(value)

  tape('passes ' + typeDescription + ' with ' + valueDescription, function (t) {
    t.plan(1)
    t.doesNotThrow(function () {
      typeforce(type, value, f.strict)
    })
  })

  tape('passes ' + typeDescription + ' (compiled) with ' + valueDescription, function (t) {
    t.plan(1)
    t.doesNotThrow(function () {
      typeforce(typeforce.compile(type), value, f.strict)
    })
  })
})

fixtures.invalid.forEach(function (f) {
  if (!f.exception) throw new TypeError('Expected exception')

  var type = TYPES[f.typeId] || f.type
  var value = VALUES[f.valueId] || f.value
  var typeDescription = f.typeId || JSON.stringify(type)
  var valueDescription = JSON.stringify(value)
  var exception = f.exception.replace(/([.*+?^=!:${}\[\]\/\\])/g, '\\$&')

  tape('throws "' + exception + '" for type ' + typeDescription + ' with value of ' + valueDescription, function (t) {
    t.plan(1)

    t.throws(function () {
      typeforce(type, value, f.strict)
    }, new RegExp(exception))
  })

  tape('throws "' + exception + '" for type ' + typeDescription + ' (compiled) with value of ' + valueDescription, function (t) {
    t.plan(1)

    t.throws(function () {
      typeforce(typeforce.compile(type), value, f.strict)
    }, new RegExp(exception))
  })
})

var err = new typeforce.TfTypeError('custom error')
var failType = function () { throw new typeforce.TfTypeError('custom error') }

tape('TfTypeError has .message', function (t) {
  t.plan(1)
  t.equal(err.message, 'custom error')
})

tape('TfTypeError is instance of Error', function (t) {
  t.plan(1)
  t.ok(err instanceof Error)
})

tape('t.throws can handle TfTypeError', function (t) {
  t.plan(1)
  t.throws(function () {
    typeforce(failType, 'value')
  }, new RegExp('custom error'))
})

tape('TfTypeError is caught by typeforce.oneOf', function (t) {
  t.plan(1)

  t.doesNotThrow(function () {
    typeforce.oneOf(failType)('value')
  })

  describe('disable', function () {
    var everFailingType = function () { throw new typeforce.TfTypeError('custom error') }
    it('does not throw when disabled', function () {
      typeforce.disable()

      assert.doesNotThrow(function () {
        typeforce(everFailingType, 1)
      })

      typeforce.enable()

      assert.throws(function () {
        typeforce(everFailingType, 1)
      })
    })
  })
})

tape('TfTypeError does not break typeforce.oneOf', function (t) {
  t.plan(1)
  t.ok(!typeforce.oneOf(failType, typeforce.string)('value'))
})
