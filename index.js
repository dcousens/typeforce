function getName (value) {
  if (value === undefined) return ''
  if (value === null) return ''
//  if (value.constructor.name !== undefined) return fn.name

  // why not constructor.name: https://kangax.github.io/compat-table/es6/#function_name_property
  return value.constructor.toString().match(/function (.*?)\s*\(/)[1]
}

module.exports = function enforce (type, value, strict) {
  var typeName = type

  if (typeof type === 'string') {
    if (type[0] === '?') {
      if (value === null || value === undefined) {
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
      switch (typeof type) {
        case 'string': {
          if (type === getName(value)) return
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
          var propertyNames = strict ? value : type

          for (var propertyName in propertyNames) {
            var propertyType = type[propertyName]
            var propertyValue = value[propertyName]

            if (!propertyType) {
              throw new TypeError('Unexpected property "' + propertyName + '"')
            }

            try {
              enforce(propertyType, propertyValue, strict)
            } catch (e) {
              throw new TypeError('Expected property "' + propertyName + '" of type ' + JSON.stringify(propertyType) + ', got ' + getName(propertyValue) + ' ' + propertyValue)
            }
          }

          return
        }
      }
    }
  }

  throw new TypeError('Expected ' + typeName + ', got ' + getName(value) + ' ' + value)
}
