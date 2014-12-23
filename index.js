function getName(value) {
  if (value === undefined) return ''
  if (value === null) return ''
//  if (value.constructor.name !== undefined) return fn.name

  // why not constructor.name: https://kangax.github.io/compat-table/es6/#function_name_property
  var match = value.constructor.toString().match(/function (.*?)\(/)
  return match ? match[1] : null
}

module.exports = function enforce(type, value) {
  switch (type) {
    case 'Array': {
      if (Array.isArray(value)) return
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
  }

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
        value.forEach(enforce.bind(undefined, subType))

        return
      }

      enforce('Object', value)
      for (var propertyName in type) {
        var propertyType = type[propertyName]

        if (!(propertyName in value)) {
          throw new TypeError('Missing property "' + propertyName + '" of type ' + JSON.stringify(propertyType))
        }

        var propertyValue = value[propertyName]

        try {
          enforce(propertyType, propertyValue)
        } catch (e) {
          throw new TypeError('Expected property "' + propertyName + '" of type ' + JSON.stringify(propertyType) + ', got ' + getName(propertyValue) + ' ' + propertyValue)
        }
      }

      return
    }
  }

  throw new TypeError('Expected ' + type + ', got ' + getName(value) + ' ' + value)
}