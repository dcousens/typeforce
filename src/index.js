function getFunctionName (fn) {
  return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1]
}

function getFunctionTypeName (fn) {
  return fn.toJSON ? fn.toJSON() : getFunctionName(fn)
}

function getTypeName (value) {
  if (nativeTypes.Null(value)) return ''

  return getFunctionName(value.constructor)
}

function tfErrorString (typeName, value) {
  var valueType = getTypeName(value)

  return 'Expected ' + typeName + ', got ' + (valueType && valueType + ' ') + JSON.stringify(value)
}

function tfPropertyErrorString (type, name, value) {
  var typeName

  if (nativeTypes.Function(type)) {
    typeName = getFunctionTypeName(type)

  } else if (nativeTypes.Object(type)) {
    typeName = JSON.stringify(type)

  } else if (nativeTypes.String(type)) {
    typeName = type
  }

  return tfErrorString('property \"' + name + '\" of type ' + typeName, value)
}

var nativeTypes = {
  Array (value) { return value !== null && value !== undefined && value.constructor === Array },
  Boolean (value) { return typeof value === 'boolean' },
  Buffer (value) { return Buffer.isBuffer(value) },
  Function (value) { return typeof value === 'function' },
  Null (value) { return value === undefined || value === null },
  Number (value) { return typeof value === 'number' },
  Object (value) { return typeof value === 'object' },
  String (value) { return typeof value === 'string' },
  '' () { return true }
}

var otherTypes = {
  arrayOf (type) {
    function arrayOf (value, strict) {
      try {
        return nativeTypes.Array(value) && value.every(x => typeforce(type, x, strict))

      } catch (e) {
        return false
      }
    }
    arrayOf.toJSON = function () { return '[' + JSON.stringify(type) + ']' }

    return arrayOf
  },

  maybe (type) {
    function maybe (value, strict) {
      return nativeTypes.Null(value) || typeforce(type, value, strict)
    }
    maybe.toJSON = function () { return '?' + (type.toJSON && type.toJSON() || JSON.stringify(type)) }

    return maybe
  },

  object (type) {
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
        throw new TypeError(tfPropertyErrorString(propertyType, propertyName, propertyValue))
      }

      if (strict) {
        for (propertyName in value) {
          if (type[propertyName]) continue

          throw new TypeError('Unexpected property "' + propertyName + '"')
        }
      }

      return true
    }
    object.toJSON = function () { return JSON.stringify(type) }

    return object
  },

  oneOf (types) {
    return function oneOf (value, strict) {
      return types.some(type => {
        try {
          return typeforce(type, value, strict)

        } catch (e) {
          return false
        }
      })
    }
  },

  compile (type) {
    if (nativeTypes.String(type)) {
      if (type[0] === '?') {
        type = type.slice(1)

        return otherTypes.maybe(otherTypes.compile(type))
      }

      return nativeTypes[type] || type

    } else if (nativeTypes.Object(type)) {
      if (nativeTypes.Array(type)) {
        return otherTypes.arrayOf(otherTypes.compile(type[0]))
      }

      var compiled = {}

      for (var propertyName in type) {
        compiled[propertyName] = otherTypes.compile(type[propertyName])
      }

      return otherTypes.object(compiled)
    }

    return type
  },

  value (expected) {
    return function value (actual) {
      return actual === expected
    }
  }
}

function typeforce (type, value, strict) {
  switch (typeof type) {
    case 'function':
      if (type(value, strict)) return true

      throw new TypeError(tfErrorString(getFunctionTypeName(type), value))

    case 'object':
      if (nativeTypes.Array(type)) return typeforce(otherTypes.arrayOf(type[0]), value, strict)

      return typeforce(otherTypes.object(type), value, strict)

    case 'string':
      if (type[0] === '?') {
        type = type.slice(1)

        return typeforce(otherTypes.maybe(type), value, strict)
      }

      var tfType = nativeTypes[type]
      if (tfType) return typeforce(tfType, value, strict)
      if (type === getTypeName(value)) return true

      break
  }

  throw new TypeError(tfErrorString(type, value))
}

// assign all types to typeforce function
var typeName
Object.keys(nativeTypes).forEach(typeName => {
  var nativeType = nativeTypes[typeName]
  nativeType.toJSON = () => typeName

  typeforce[typeName] = nativeType
})

for (typeName in otherTypes) {
  typeforce[typeName] = otherTypes[typeName]
}

module.exports = typeforce
