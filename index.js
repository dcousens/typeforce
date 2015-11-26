function TfTypeError (type, value) {
  this.error = Error.call(this)
  this.type = type
  this.value = value
}

function TfPropertyTypeError (type, property, value, error) {
  this.error = error || Error.call(this)
  this.property = property
  this.type = type
  this.value = value
}

function TfUnexpectedPropertyError (property) {
  this.error = Error.call(this, 'Unexpected property "' + property + '"')
  this.property = property
  this.message = this.error.message
}

// inherit from Error
;[TfTypeError, TfPropertyTypeError, TfUnexpectedPropertyError].forEach(function (f) {
  f.prototype = Object.create(Error.prototype)
  f.prototype.constructor = f

  Object.defineProperty(f.prototype, 'stack', { get: function () { return this.error.stack } })
})

Object.defineProperty(TfTypeError.prototype, 'message', {
  get: function () {
    if (this.__message) return this.__message
    this.__message = tfErrorString(this.type, this.value)

    return this.__message
  }
})

Object.defineProperty(TfPropertyTypeError.prototype, 'message', {
  get: function () {
    if (this.__message) return this.__message
    this.__message = tfPropertyErrorString(this.type, this.property, this.value)

    return this.__message
  }
})

TfPropertyTypeError.prototype.asChildOf = function (property) {
  return new TfPropertyTypeError(this.type, property + '.' + this.property, this.value, this.error)
}

function getFunctionName (fn) {
  return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1]
}

function getValueTypeName (value) {
  if (nativeTypes.Null(value)) return ''

  return getFunctionName(value.constructor)
}

function getValue (value) {
  if (nativeTypes.Function(value)) return ''
  if (nativeTypes.String(value)) return JSON.stringify(value)
  if (value && nativeTypes.Object(value)) return ''

  return value
}

function tfJSON (type) {
  if (nativeTypes.Function(type)) return type.toJSON ? type.toJSON() : getFunctionName(type)
  if (nativeTypes.Array(type)) return 'Array'
  if (type && nativeTypes.Object(type)) return 'Object'

  return type || ''
}

function stfJSON (type) {
  type = tfJSON(type)

  return nativeTypes.Object(type) ? JSON.stringify(type) : type
}

function tfErrorString (type, value) {
  var valueTypeName = getValueTypeName(value)
  var valueValue = getValue(value)

  return 'Expected ' + stfJSON(type) + ', got' + (valueTypeName !== '' ? ' ' + valueTypeName : '') + (valueValue !== '' ? ' ' + valueValue : '')
}

function tfPropertyErrorString (type, name, value) {
  return tfErrorString('property \"' + stfJSON(name) + '\" of type ' + stfJSON(type), value)
}

var nativeTypes = {
  Array: function (value) { return value !== null && value !== undefined && value.constructor === Array },
  Boolean: function (value) { return typeof value === 'boolean' },
  Buffer: function (value) { return Buffer.isBuffer(value) },
  Function: function (value) { return typeof value === 'function' },
  Null: function (value) { return value === undefined || value === null },
  Number: function (value) { return typeof value === 'number' },
  Object: function (value) { return typeof value === 'object' },
  String: function (value) { return typeof value === 'string' },
  '': function () { return true }
}

var otherTypes = {
  arrayOf: function arrayOf (type) {
    function arrayOf (value, strict) {
      try {
        return nativeTypes.Array(value) && value.every(function (x) { return typeforce(type, x, strict) })
      } catch (e) {
        return false
      }
    }
    arrayOf.toJSON = function () { return [tfJSON(type)] }

    return arrayOf
  },

  maybe: function maybe (type) {
    function maybe (value, strict) {
      return nativeTypes.Null(value) || typeforce(type, value, strict)
    }
    maybe.toJSON = function () { return '?' + stfJSON(type) }

    return maybe
  },

  object: function object (type) {
    function object (value, strict) {
      typeforce(nativeTypes.Object, value, strict)

      var propertyName, propertyType, propertyValue

      try {
        for (propertyName in type) {
          propertyType = type[propertyName]
          propertyValue = value[propertyName]

          typeforce(propertyType, propertyValue, strict)
        }
      } catch (e) {
        if (e instanceof TfPropertyTypeError) throw e.asChildOf(propertyName)

        throw new TfPropertyTypeError(propertyType, propertyName, propertyValue)
      }

      if (strict) {
        for (propertyName in value) {
          if (type[propertyName]) continue

          throw new TfUnexpectedPropertyError(propertyName)
        }
      }

      return true
    }
    object.toJSON = function () { return tfJSON(type) }

    return object
  },

  map: function map (propertyType, propertyKeyType) {
    function map (value, strict) {
      typeforce(nativeTypes.Object, value, strict)

      var propertyName, propertyValue

      try {
        for (propertyName in value) {
          if (propertyKeyType) {
            typeforce(propertyKeyType, propertyName, strict)
          }

          propertyValue = value[propertyName]
          typeforce(propertyType, propertyValue, strict)
        }
      } catch (e) {
        if (e instanceof TfPropertyTypeError) throw e.asChildOf(propertyName)

        throw new TfPropertyTypeError(propertyType, propertyKeyType || propertyName, propertyValue)
      }

      return true
    }
    if (propertyKeyType) {
      map.toJSON = function () { return '{' + stfJSON(propertyKeyType) + ': ' + stfJSON(propertyType) + '}' }
    } else {
      map.toJSON = function () { return '{' + stfJSON(propertyType) + '}' }
    }

    return map
  },

  oneOf: function oneOf () {
    var types = [].slice.call(arguments)

    function oneOf (value, strict) {
      return types.some(function (type) {
        try {
          return typeforce(type, value, strict)
        } catch (e) {
          return false
        }
      })
    }
    oneOf.toJSON = function () { return types.map(stfJSON).join('|') }

    return oneOf
  },

  quacksLike: function quacksLike (type) {
    function quacksLike (value, strict) {
      return type === getValueTypeName(value)
    }
    quacksLike.toJSON = function () { return type }

    return quacksLike
  },

  tuple: function tuple () {
    var types = [].slice.call(arguments)

    function tuple (value, strict) {
      return types.every(function (type, i) {
        return typeforce(type, value[i], strict)
      })
    }
    tuple.toJSON = function () { return '(' + types.map(stfJSON).join(', ') + ')' }

    return tuple
  },

  value: function value (expected) {
    function value (actual) {
      return actual === expected
    }
    value.toJSON = function () { return expected }

    return value
  }
}

function compile (type) {
  if (nativeTypes.String(type)) {
    if (type[0] === '?') return otherTypes.maybe(compile(type.slice(1)))

    return nativeTypes[type] || otherTypes.quacksLike(type)
  } else if (type && nativeTypes.Object(type)) {
    if (nativeTypes.Array(type)) return otherTypes.arrayOf(compile(type[0]))

    var compiled = {}

    for (var propertyName in type) {
      compiled[propertyName] = compile(type[propertyName])
    }

    return otherTypes.object(compiled)
  } else if (nativeTypes.Function(type)) {
    return type
  }

  return otherTypes.value(type)
}

function typeforce (type, value, strict) {
  if (nativeTypes.Function(type)) {
    if (type(value, strict)) return true

    throw new TfTypeError(type, value)
  }

  // JIT
  return typeforce(compile(type), value, strict)
}

// assign all types to typeforce function
var typeName
Object.keys(nativeTypes).forEach(function (typeName) {
  var nativeType = nativeTypes[typeName]
  nativeType.toJSON = function () { return typeName }

  typeforce[typeName] = nativeType
})

for (typeName in otherTypes) {
  typeforce[typeName] = otherTypes[typeName]
}

module.exports = typeforce
module.exports.compile = compile

// export Error objects
module.exports.TfTypeError = TfTypeError
module.exports.TfPropertyTypeError = TfPropertyTypeError
module.exports.TfUnexpectedPropertyError = TfUnexpectedPropertyError
