function getTypeName (value) {
  if (value === undefined) return ''
  if (value === null) return ''
//  if (value.constructor.name !== undefined) return fn.name

  // why not constructor.name: https://kangax.github.io/compat-table/es6/#function_name_property
  return value.constructor.toString().match(/function (.*?)\s*\(/)[1]
}

function throwTypeError (type, value) {
  var valueType = getTypeName(value)

  throw new TypeError('Expected ' + type + ', got ' + (valueType && valueType + ' ') + JSON.stringify(value))
}

module.exports = function enforce (type, value, strict) {
  var typeOfType = typeof type

  if (typeOfType === 'string') {
    if (type[0] === '?') {
      if (value === undefined || value === null) {
        return
      }

      type = type.slice(1)
    }
  }

  switch (type) {
    case 'Array': {
      if (value !== null && value !== undefined && value.constructor === Array) return
      break
    }

    case 'Boolean': {
      if (typeof value === 'boolean') return
      break
    }

    case 'Buffer': {
      if (Buffer.isBuffer(value)) return
      break
    }

    case 'Function': {
      if (typeof value === 'function') return
      break
    }

    case 'Number': {
      if (typeof value === 'number') return
      break
    }

    case 'Object': {
      if (typeof value === 'object') return
      break
    }

    case 'String': {
      if (typeof value === 'string') return
      break
    }

    default: {
      switch (typeOfType) {
        case 'string': {
          if (type === getTypeName(value)) return
          if (type === '') return

          break
        }

        // evaluate type templates
        case 'object': {
          if (Array.isArray(type)) {
            var subType = type[0]

            enforce('Array', value)
            value.forEach(function (x) {
              enforce(subType, x, strict)
            })

            return
          }

          enforce('Object', value)

          for (var propertyName in type) {
            var propertyType = type[propertyName]
            var propertyValue = value[propertyName]

            try {
              enforce(propertyType, propertyValue, strict)

            } catch (e) {
              throwTypeError('property \"' + propertyName + '\" of type ' + JSON.stringify(propertyType), propertyValue)
            }
          }

          if (strict) {
            for (propertyName in value) {
              propertyType = type[propertyName]

              if (!propertyType) {
                throw new TypeError('Unexpected property "' + propertyName + '"')
              }
            }
          }

          return
        }
      }
    }
  }

  throwTypeError(type, value)
}
