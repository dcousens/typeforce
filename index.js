function getName(fn) {
//  if (fn.name !== undefined) return fn.name

  // why not fn.name: https://kangax.github.io/compat-table/es6/#function_name_property
  var match = fn.toString().match(/function (.*?)\(/)
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

    case 'String': {
      if (typeof value === 'string') return
      break
    }
  }

  switch (typeof type) {
    case 'string': {
      if (type === getName(value.constructor)) return

      break
    }

//    case 'object': {
//      if (Array.isArray(type)) {
//        var subType = type[0]
//
//        enforce('Array', value)
//        value.forEach(enforce.bind(undefined, subType))
//
//        return
//      }
//
//      for (var propertyName in type) {
//        var propertyType = type[propertyName]
//
//        enforce(propertyType, value[propertyName])
//      }
//
//      return
//    }
  }

  throw new TypeError('Expected ' + (getName(type) || type) + ', got ' + getName(value.constructor) + ' ' + value)
}
