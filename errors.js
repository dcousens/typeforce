var inherits = require('inherits')
var native = require('./native')

function TfTypeError (type, value) {
  this.__error = Error.call(this)
  this.__type = type
  this.__value = value

  var message
  Object.defineProperty(this, 'message', {
    enumerable: true,
    get: function () {
      if (message) return message
      message = tfErrorString(type, value)

      return message
    }
  })
}

function TfPropertyTypeError (type, property, label, value, error) {
  this.__error = error || Error.call(this)
  this.__label = label
  this.__property = property
  this.__type = type
  this.__value = value

  var message
  Object.defineProperty(this, 'message', {
    enumerable: true,
    get: function () {
      if (message) return message
      if (type) {
        message = tfPropertyErrorString(type, label, property, value)
      } else {
        message = 'Unexpected property "' + property + '"'
      }

      return message
    }
  })
}

// inherit from Error, assign stack
[TfTypeError, TfPropertyTypeError].forEach(function (tfErrorType) {
  inherits(tfErrorType, Error)
  Object.defineProperty(tfErrorType, 'stack', {
    get: function () { return this.__error.stack }
  })
})

function tfSubError (e, property, label) {
  // sub child?
  if (e instanceof TfPropertyTypeError) {
    property = property + '.' + e.__property
    label = e.__label

    return new TfPropertyTypeError(
      e.__type, property, label, e.__value, e.__error
    )
  }

  // child?
  if (e instanceof TfTypeError) {
    return new TfPropertyTypeError(
      e.__type, property, label, e.__value, e.__error
    )
  }

  return e
}

function getFunctionName (fn) {
  return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1]
}

function getValueTypeName (value) {
  if (native.Null(value)) return ''

  return getFunctionName(value.constructor)
}

function getValue (value) {
  if (native.Function(value)) return ''
  if (native.String(value)) return JSON.stringify(value)
  if (value && native.Object(value)) return ''

  return value
}

function tfJSON (type) {
  if (native.Function(type)) return type.toJSON ? type.toJSON() : getFunctionName(type)
  if (native.Array(type)) return 'Array'
  if (type && native.Object(type)) return 'Object'

  return type !== undefined ? type : ''
}

function tfErrorString (type, value) {
  var valueTypeName = getValueTypeName(value)
  var valueValue = getValue(value)

  return 'Expected ' + tfJSON(type) + ', got' +
    (valueTypeName !== '' ? ' ' + valueTypeName : '') +
    (valueValue !== '' ? ' ' + valueValue : '')
}

function tfPropertyErrorString (type, label, name, value) {
  var description = '" of type '
  if (label === 'key') description = '" with key type '

  return tfErrorString('property "' + tfJSON(name) + description + tfJSON(type), value)
}

module.exports = {
  TfTypeError: TfTypeError,
  TfPropertyTypeError: TfPropertyTypeError,
  tfSubError: tfSubError,
  tfJSON: tfJSON,
  getFunctionName: getFunctionName,
  getValueTypeName: getValueTypeName
}
