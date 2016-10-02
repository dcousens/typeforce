var errors = require('./errors')
var native = require('./native')

// short-hand
var tfJSON = errors.tfJSON
var stfJSON = errors.stfJSON
var TfTypeError = errors.TfTypeError
var TfPropertyTypeError = errors.TfPropertyTypeError
var tfSubError = errors.tfSubError
var getValueTypeName = errors.getValueTypeName

function schema (type) {
  function schema (value, strict) {
    if (!native.Object(value)) return false
    if (native.Null(value)) return false

    var propertyName

    try {
      for (propertyName in type) {
        var propertyType = type[propertyName]
        var propertyValue = value[propertyName]

        typeforce(propertyType, propertyValue, strict)
      }
    } catch (e) {
      throw tfSubError(e, propertyName)
    }

    if (strict) {
      for (propertyName in value) {
        if (type[propertyName]) continue

        throw new TfPropertyTypeError(undefined, propertyName)
      }
    }

    return true
  }
  schema.toJSON = function () { return tfJSON(type) }

  return schema
}

var types = {
  arrayOf: function arrayOf (type) {
    type = compile(type)

    function arrayOf (array, strict) {
      if (!native.Array(array)) return false

      return array.every(function (value, i) {
        try {
          return typeforce(type, value, strict)
        } catch (e) {
          throw tfSubError(e, i)
        }
      })
    }
    arrayOf.toJSON = function () { return [tfJSON(type)] }

    return arrayOf
  },

  maybe: function maybe (type) {
    type = compile(type)

    function maybe (value, strict) {
      return native.Null(value) || type(value, strict, maybe)
    }
    maybe.toJSON = function () { return '?' + stfJSON(type) }

    return maybe
  },

  map: function map (propertyType, propertyKeyType) {
    propertyType = compile(propertyType)
    if (propertyKeyType) propertyKeyType = compile(propertyKeyType)

    function map (value, strict) {
      if (!native.Object(value, strict)) return false
      if (native.Null(value, strict)) return false

      for (var propertyName in value) {
        try {
          if (propertyKeyType) {
            typeforce(propertyKeyType, propertyName, strict)
          }
        } catch (e) {
          throw tfSubError(e, propertyName, 'key')
        }

        try {
          var propertyValue = value[propertyName]
          typeforce(propertyType, propertyValue, strict)
        } catch (e) {
          throw tfSubError(e, propertyName)
        }
      }

      return true
    }

    if (propertyKeyType) {
      map.toJSON = function () {
        return '{' + stfJSON(propertyKeyType) + ': ' + stfJSON(propertyType) + '}'
      }
    } else {
      map.toJSON = function () { return '{' + stfJSON(propertyType) + '}' }
    }

    return map
  },

  oneOf: function oneOf () {
    var types = [].slice.call(arguments).map(compile)

    function oneOf (value, strict) {
      return types.some(function (type) {
        return type(value, strict)
      })
    }
    oneOf.toJSON = function () { return types.map(stfJSON).join('|') }

    return oneOf
  },

  quacksLike: function quacksLike (type) {
    function quacksLike (value) {
      return type === getValueTypeName(value)
    }
    quacksLike.toJSON = function () { return type }

    return quacksLike
  },

  tuple: function tuple () {
    var types = [].slice.call(arguments).map(compile)

    function tuple (values, strict) {
      return types.every(function (type, i) {
        try {
          return typeforce(type, values[i], strict)
        } catch (e) {
          throw tfSubError(e, i)
        }
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
  if (native.String(type)) {
    if (type[0] === '?') return types.maybe(compile(type.slice(1)))

    return native[type] || types.quacksLike(type)
  } else if (type && native.Object(type)) {
    if (native.Array(type)) return types.arrayOf(compile(type[0]))

    var compiled = {}

    for (var propertyName in type) {
      compiled[propertyName] = compile(type[propertyName])
    }

    return schema(compiled)
  } else if (native.Function(type)) {
    return type
  }

  return types.value(type)
}

function typeforce (type, value, strict, surrogate) {
  if (native.Function(type)) {
    if (type(value, strict)) return true

    throw new TfTypeError(surrogate || type, value)
  }

  // JIT
  return typeforce(compile(type), value, strict)
}

// assign types to typeforce function
for (var typeName in native) {
  typeforce[typeName] = native[typeName]
}

for (typeName in types) {
  typeforce[typeName] = types[typeName]
}

var extra = require('./extra')
for (typeName in extra) {
  typeforce[typeName] = extra[typeName]
}

typeforce.compile = compile
typeforce.TfTypeError = TfTypeError
typeforce.TfPropertyTypeError = TfPropertyTypeError

module.exports = typeforce
