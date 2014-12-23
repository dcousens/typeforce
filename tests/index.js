var assert = require('assert')
var enforceType = require('../')

function CustomType() { return "ensure non-greedy match".toUpperCase() }

var descriptions = ['Array', 'Boolean', 'Buffer', 'Number', 'String', 'Custom Type']
var types = ['Array', 'Boolean', 'Buffer', 'Number', 'String', CustomType]
var values = [[], true, new Buffer(1), 1234, 'foobar', new CustomType()]

describe('enforceType', function() {
  types.forEach(function(type, i) {
    describe(descriptions[i], function() {
      values.forEach(function(value, j) {
        if (i === j) {
          it('passes for ' + descriptions[j], function() {
            enforceType(type, value)
          })

        } else {
          it('fails for ' + types[j], function() {
            assert.throws(function() {
              enforceType(type, value)
            }, new RegExp('Expected ' + (type.name || type) + ', got '))
          })
        }
      })
    })
  })
})
