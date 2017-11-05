var ERRORS = require('./errors')
var NATIVE = require('./native')

// short-hand
var tfJSON = ERRORS.tfJSON
var TfTypeError = ERRORS.TfTypeError
var TfPropertyTypeError = ERRORS.TfPropertyTypeError
var tfSubError = ERRORS.tfSubError
var getValueTypeName = ERRORS.getValueTypeName

function captureTfTE (type, value, surrogate) {
  if (type.TfTypeError) return type.TfTypeError
  return new TfTypeError(surrogate || type, value)
}

var TYPES = {
  arrayOf: function arrayOf (type) {
    type = compile(type)

    function _arrayOf (array, strict) {
      delete _arrayOf.TfTypeError
      if (!NATIVE.Array(array)) return false
      if (NATIVE.Nil(array)) return false

      for (var i = 0; i < array.length; ++i) {
        var value = array[i]
        if (type(value, strict)) continue

        _arrayOf.TfTypeError = tfSubError(captureTfTE(type, value), i)
        return false
      }

      return true
    }
    _arrayOf.toJSON = function () { return '[' + tfJSON(type) + ']' }

    return _arrayOf
  },

  maybe: function maybe (type) {
    type = compile(type)

    function _maybe (value, strict) {
      delete _maybe.TfTypeError
      if (NATIVE.Nil(value)) return true
      if (type(value, strict, maybe)) return true
      _maybe.TfTypeError = type.TfTypeError
      return false
    }
    _maybe.toJSON = function () { return '?' + tfJSON(type) }

    return _maybe
  },

  map: function map (propertyType, propertyKeyType) {
    propertyType = compile(propertyType)
    if (propertyKeyType) propertyKeyType = compile(propertyKeyType)

    function _map (value, strict) {
      delete _map.TfTypeError
      if (!NATIVE.Object(value)) return false
      if (NATIVE.Nil(value)) return false

      for (var propertyName in value) {
        if (propertyKeyType) {
          if (!propertyKeyType(propertyName, strict)) {
            _map.TfTypeError = tfSubError(captureTfTE(propertyKeyType, propertyName), propertyName, 'key')
            return false
          }
        }

        var propertyValue = value[propertyName]
        if (propertyType(propertyValue, strict)) continue

        _map.TfTypeError = tfSubError(captureTfTE(propertyType, propertyValue), propertyName)
        return false
      }

      return true
    }

    if (propertyKeyType) {
      _map.toJSON = function () {
        return '{' + tfJSON(propertyKeyType) + ': ' + tfJSON(propertyType) + '}'
      }
    } else {
      _map.toJSON = function () { return '{' + tfJSON(propertyType) + '}' }
    }

    return _map
  },

  object: function object (uncompiled) {
    var type = {}

    for (var typePropertyName in uncompiled) {
      type[typePropertyName] = compile(uncompiled[typePropertyName])
    }

    function _object (value, strict) {
      delete _object.TfTypeError
      if (!NATIVE.Object(value)) return false
      if (NATIVE.Nil(value)) return false

      var propertyName

      for (propertyName in type) {
        var propertyType = type[propertyName]
        var propertyValue = value[propertyName]
        if (propertyType(propertyValue, strict)) continue

        _object.TfTypeError = tfSubError(captureTfTE(propertyType, propertyValue), propertyName)
        return false
      }

      if (strict) {
        for (propertyName in value) {
          if (type[propertyName]) continue

          _object.TfTypeError = new TfPropertyTypeError(undefined, propertyName)
          return false
        }
      }

      return true
    }
    _object.toJSON = function () { return tfJSON(type) }

    return _object
  },

  oneOf: function oneOf () {
    var types = [].slice.call(arguments).map(compile)
    var count = types.length

    function _oneOf (value, strict) {
      for (var i = 0; i < count; ++i) {
        var type = types[i]
        if (type(value, strict)) return true
      }

      return false
    }
    _oneOf.toJSON = function () { return types.map(tfJSON).join('|') }

    return _oneOf
  },

  quacksLike: function quacksLike (type) {
    function _quacksLike (value) {
      return type === getValueTypeName(value)
    }
    _quacksLike.toJSON = function () { return type }

    return _quacksLike
  },

  tuple: function tuple () {
    var types = [].slice.call(arguments).map(compile)

    function _tuple (values, strict) {
      delete _tuple.TfTypeError
      if (NATIVE.Nil(values)) return false
      if (NATIVE.Nil(values.length)) return false
      if (strict && (values.length !== types.length)) return false

      for (var i = 0; i < types.length; ++i) {
        var type = types[i]
        var value = values[i]
        if (type(value, strict)) continue

        _tuple.TfTypeError = tfSubError(captureTfTE(type, value), i)
        return false
      }

      return true
    }
    _tuple.toJSON = function () { return '(' + types.map(tfJSON).join(', ') + ')' }

    return _tuple
  },

  value: function value (expected) {
    function _value (actual) {
      return actual === expected
    }
    _value.toJSON = function () { return expected }

    return _value
  }
}

function compile (type) {
  if (NATIVE.String(type)) {
    if (type[0] === '?') return TYPES.maybe(type.slice(1))

    return NATIVE[type] || TYPES.quacksLike(type)
  } else if (type && NATIVE.Object(type)) {
    if (NATIVE.Array(type)) return TYPES.arrayOf(type[0])

    return TYPES.object(type)
  } else if (NATIVE.Function(type)) {
    return type
  }

  return TYPES.value(type)
}

function typeforce (type, value, strict, surrogate) {
  if (NATIVE.Function(type)) {
    if (type(value, strict)) return true

    throw captureTfTE(type, value, surrogate)
  }

  // JIT
  return typeforce(compile(type), value, strict)
}

// assign types to typeforce function
for (var typeName in NATIVE) {
  typeforce[typeName] = NATIVE[typeName]
}

for (typeName in TYPES) {
  typeforce[typeName] = TYPES[typeName]
}

var EXTRA = require('./extra')
for (typeName in EXTRA) {
  typeforce[typeName] = EXTRA[typeName]
}

// async wrapper
function __async (type, value, strict, callback) {
  // default to falsy strict if using shorthand overload
  if (typeof strict === 'function') return __async(type, value, false, strict)

  try {
    typeforce(type, value, strict)
  } catch (e) {
    return callback(e)
  }

  callback()
}

typeforce.async = __async
typeforce.compile = compile
typeforce.TfTypeError = TfTypeError
typeforce.TfPropertyTypeError = TfPropertyTypeError

module.exports = typeforce
