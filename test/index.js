var assert = require('assert')
var enforceType = require('../')

function CustomType() { return "ensure non-greedy match".toUpperCase() }
var CUSTOM_TYPES = {
  'Buffer': new Buffer(1),
  'CustomType': new CustomType(),
  'Function': function() {}
}

var fixtures = require('./fixtures')

describe('enforceType', function() {
  fixtures.valid.forEach(function(f) {
    var actualValue = f.custom ? CUSTOM_TYPES[f.custom] : f.value

    it('passes for ' + JSON.stringify(f.type) + ' with ' + (f.custom ? f.custom : JSON.stringify(f.value)), function() {
      enforceType(f.type, actualValue)
    })
  })

  fixtures.invalid.forEach(function(f) {
    var actualValue = f.custom ? CUSTOM_TYPES[f.custom] : f.value

    it('fails for ' + JSON.stringify(f.type) + ' with ' + (f.custom ? f.custom : JSON.stringify(f.value)), function() {
      assert.throws(function() {
        enforceType(f.type, actualValue)
      }, new RegExp(f.exception))
    })
  })
})
