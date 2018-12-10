var tape = require('tape')
var typeforce = require('../')
var typeforceAsync = require('../async')
var typeforceNoThrow = require('../nothrow')
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
    t.plan(6)
    t.doesNotThrow(function () { typeforce(type, value, f.strict) })
    typeforceAsync(type, value, f.strict, t.ifErr)
    t.equal(typeforceNoThrow(type, value, f.strict), true)

    t.doesNotThrow(function () { typeforce(compiled, value, f.strict) })
    typeforceAsync(compiled, value, f.strict, t.ifErr)
    t.equal(typeforceNoThrow(compiled, value, f.strict), true)
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
    t.plan(10)

    t.throws(function () {
      typeforce(type, value, f.strict)
    }, new RegExp(f.exception))
    typeforceAsync(type, value, f.strict, (err) => {
      t.ok(err)
      t.throws(function () { throw err }, new RegExp(f.exception))
    })
    t.equal(typeforceNoThrow(type, value, f.strict), false)
    t.throws(function () { throw typeforceNoThrow.error }, new RegExp(f.exception))

    t.throws(function () {
      typeforce(compiled, value, f.strict)
    }, new RegExp(f.exception))
    typeforceAsync(compiled, value, f.strict, (err) => {
      t.ok(err)
      t.throws(function () { throw err }, new RegExp(f.exception))
    })
    t.equal(typeforceNoThrow(compiled, value, f.strict), false)
    t.throws(function () { throw typeforceNoThrow.error }, new RegExp(f.exception))
  })
})

var err = new typeforce.TfTypeError('mytype')
function failType () { throw err }

tape('TfTypeError is an Error', function (t) {
  t.plan(3)
  t.ok(err instanceof Error)
  t.equal(err.message, 'Expected mytype, got undefined')

  t.throws(function () {
    typeforce(failType, 0xdeadbeef)
  }, new RegExp('Expected mytype, got undefined'))
})

tape('TfTypeError is caught by typeforce.oneOf', function (t) {
  t.plan(2)

  t.doesNotThrow(function () {
    typeforce.oneOf(failType)('value')
  })

  t.ok(!typeforce.oneOf(failType, typeforce.string)('value'))
})

tape('Error is thrown for bad compile parameters', function (t) {
  t.plan(2)

  t.throws(function () {
    typeforce.compile([])
  }, /Expected compile\(\) parameter of type Array of length 1/)

  t.throws(function () {
    typeforce.compile([typeforce.Number, typeforce.String])
  }, /Expected compile\(\) parameter of type Array of length 1/)
})
