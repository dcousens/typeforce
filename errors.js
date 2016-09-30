var inherits = require('inherits')
var native = require('./native')

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

function stfJSON (type) {
  type = tfJSON(type)

  return native.Object(type) ? JSON.stringify(type) : type
}

function TfTypeError (type, value) {
  this.tfError = Error.call(this)
  this.tfType = type
  this.tfValue = value

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

inherits(TfTypeError, Error)
Object.defineProperty(TfTypeError, 'stack', { get: function () { return this.tfError.stack } })

function TfPropertyTypeError (type, property, side, value, error) {
  this.tfError = error || Error.call(this)
  this.tfProperty = property
  this.tfSide = side
  this.tfType = type
  this.tfValue = value

  var message
  Object.defineProperty(this, 'message', {
    enumerable: true,
    get: function () {
      if (message) return message
      if (type) {
        message = tfPropertyErrorString(type, side, property, value)
      } else {
        message = 'Unexpected property "' + property + '"'
      }

      return message
    }
  })
}

inherits(TfPropertyTypeError, Error)
Object.defineProperty(TfPropertyTypeError, 'stack', {
  get: function () { return this.tfError.stack }
})

TfPropertyTypeError.prototype.asChildOf = function (property) {
  return new TfPropertyTypeError(this.tfType, property + '.' + this.tfProperty, this.tfSide, this.tfValue, this.tfError)
}

function tfErrorString (type, value) {
  var valueTypeName = getValueTypeName(value)
  var valueValue = getValue(value)

  return 'Expected ' + stfJSON(type) + ', got' +
    (valueTypeName !== '' ? ' ' + valueTypeName : '') +
    (valueValue !== '' ? ' ' + valueValue : '')
}

function tfPropertyErrorString (type, side, name, value) {
  var description = '" of type '
  if (side === 'key') description = '" with key type '

  return tfErrorString('property "' + stfJSON(name) + description + stfJSON(type), value)
}

function tfSubError (e, propertyName, sideLabel) {
  if (e instanceof TfPropertyTypeError) return e.asChildOf(propertyName)
  if (e instanceof TfTypeError) {
    return new TfPropertyTypeError(e.tfType, propertyName, sideLabel, e.tfValue, e.tfError)
  }

  return e
}

module.exports = {
  TfTypeError: TfTypeError,
  TfPropertyTypeError: TfPropertyTypeError,
  tfSubError: tfSubError,
  tfJSON: tfJSON,
  stfJSON: stfJSON,
  getFunctionName: getFunctionName,
  getValueTypeName: getValueTypeName
}
