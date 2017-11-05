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
  var compiled = typeforce.compile(type)

  tape('passes ' + typeDescription + ' with ' + valueDescription, function (t) {
    t.plan(4)
    t.doesNotThrow(function () { typeforce(type, value, f.strict) })
    typeforce.async(type, value, f.strict, t.ifErr)

    t.doesNotThrow(function () { typeforce(compiled, value, f.strict) })
    typeforce.async(compiled, value, f.strict, t.ifErr)
  })
})

fixtures.invalid.forEach(function (f) {
  if (!f.exception) throw new TypeError('Expected exception')

  var type = TYPES[f.typeId] || f.type
  var value = VALUES[f.valueId] || f.value
  var typeDescription = f.typeId || JSON.stringify(type)
  var valueDescription = JSON.stringify(value)
  var compiled = typeforce.compile(type)

  tape('throws "' + f.exception + '" for type ' + typeDescription + ' with value of ' + valueDescription, function (t) {
    t.plan(2)

    t.throws(function () {
      typeforce(type, value, f.strict)
    }, new RegExp(f.exception))

    t.throws(function () {
      typeforce(compiled, value, f.strict)
    }, new RegExp(f.exception))
  })
})

var err = new typeforce.TfTypeError('mytype')
var failType = function () { throw err }

tape('TfTypeError has .message', function (t) {
  t.plan(1)
  t.equal(err.message, 'Expected mytype, got undefined')
})

tape('TfTypeError is instance of Error', function (t) {
  t.plan(1)
  t.ok(err instanceof Error)
})

tape('t.throws can handle TfTypeError', function (t) {
  t.plan(1)
  t.throws(function () {
    typeforce(failType, 'value')
  }, new RegExp('Expected mytype, got undefined'))
})

tape('TfTypeError is caught by typeforce.oneOf', function (t) {
  t.plan(1)

  t.doesNotThrow(function () {
    typeforce.oneOf(failType)('value')
  })
})

tape('TfTypeError does not break typeforce.oneOf', function (t) {
  t.plan(1)
  t.ok(!typeforce.oneOf(failType, typeforce.string)('value'))
})
