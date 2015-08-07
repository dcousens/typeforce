function getFunctionName (fn) {
  return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1]
}

function getTypeName (value) {
  if (value === null || value === undefined) return ''

  return getFunctionName(value.constructor)
}

function tfErrorString (type, value) {
  var valueType = getTypeName(value)

  return 'Expected ' + type + ', got ' + (valueType && valueType + ' ') + JSON.stringify(value)
}

var types = {
  Array (value) { return value !== null && value !== undefined && value.constructor === Array },
  Boolean (value) { return typeof value === 'boolean' },
  Buffer (value) { return Buffer.isBuffer(value) },
  Function (value) { return typeof value === 'function' },
  Number (value) { return typeof value === 'number' },
  Object (value) { return typeof value === 'object' },
  String (value) { return typeof value === 'string' },
  '' () { return true },

  // sum types
  arrayOf (type) {
    return function arrayOf (value, strict) {
      typeforce(types.Array, value, strict)

      return value.every(x => typeforce(type, x, strict))
    }
  },

  object (type) {
    return function object (value, strict) {
      typeforce(types.Object, value, strict)

      for (var propertyName in type) {
        var propertyType = type[propertyName]
        var propertyValue = value[propertyName]

        try {
          typeforce(propertyType, propertyValue, strict)

        } catch (e) {
          throw new TypeError(tfErrorString('property \"' + propertyName + '\" of type ' + JSON.stringify(propertyType), propertyValue))
        }
      }

      if (strict) {
        for (propertyName in value) {
          if (type[propertyName]) continue

          throw new TypeError('Unexpected property "' + propertyName + '"')
        }
      }

      return true
    }
  },

  maybe (type) {
    return function maybe (value, strict) {
      if (value === undefined || value === null) return true

      return typeforce(type, value, strict)
    }
  },

  oneOf (types) {
    return function oneOf (value, strict) {
      return types.some(type => {
        try {
          typeforce(type, value, strict)

          return true
        } catch (e) {
          return false
        }
      })
    }
  }
}

function typeforce (type, value, strict) {
  switch (typeof type) {
    case 'function': {
      if (type(value, strict)) return true

      throw new TypeError(tfErrorString(getFunctionName(type), value))
    }

    case 'object': {
      if (types.Array(type)) return typeforce(types.arrayOf(type[0]), value, strict)

      return typeforce(types.object(type), value, strict)
    }

    case 'string': {
      if (type[0] === '?') {
        type = type.slice(1)

        return typeforce(types.maybe(type), value, strict)
      }

      var tfType = types[type]
      if (tfType) return typeforce(tfType, value, strict)
      if (type === getTypeName(value)) return true

      break
    }
  }

  // catch all
  throw new TypeError(tfErrorString(type, value))
}

module.exports = typeforce
module.exports.types = types
