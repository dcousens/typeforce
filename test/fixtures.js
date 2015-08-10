var typeforce = require('../src')

function CustomType () { return 'ensure non-greedy match'.toUpperCase() }
var buffer = new Buffer(1)

var valid = [
  {
    type: 'Array',
    value: []
  },
  {
    type: 'Boolean',
    value: true
  },
  {
    type: 'Buffer',
    value: buffer
  },
  {
    type: 'Function',
    value: function () {}
  },
  {
    type: 'Number',
    value: 1234
  },
  {
    type: 'String',
    value: 'foobar'
  },
  {
    type: 'CustomType',
    value: new CustomType()
  },
  {
    type: 'Object',
    value: {}
  },
  {
    type: 'Object',
    value: []
  },
  {
    type: 'Object',
    value: new CustomType()
  },
  {
    type: {
      a: 'Number',
      b: {
        c: 'String'
      }
    },
    value: {
      a: 1,
      b: {
        c: 'satoshi'
      }
    }
  },
  {
    type: [
      'String'
    ],
    value: [
      'foo',
      'bar'
    ]
  },
  {
    type: [
      {
        a: 'Number'
      }
    ],
    value: [
      {
        a: 1
      },
      {
        a: 2,
        b: 3
      }
    ]
  },
  {
    type: '?Number',
    value: null
  },
  {
    type: [
      '?Number'
    ],
    value: [
      1,
      null
    ]
  },
  {
    type: [
      {
        a: '?Number'
      }
    ],
    value: [
      {
        a: 1
      },
      {
        a: null
      },
      {}
    ]
  },
  {
    type: '+Array|String',
    value: []
  },
  {
    type: '+Array|String',
    value: 'foobar'
  },
  {
    type: {
      a: '+Array|String'
    },
    value: {
      a: []
    }
  },
  {
    type: {
      a: '+Array|String'
    },
    value: {
      a: 'foobar'
    }
  },
  {
    type: '?String',
    value: 'foobar'
  },
  {
    type: '?String',
    value: null
  },
  {
    type: '?',
    value: 1234
  },
  {
    type: '?',
    value: 'foobar'
  },
  {
    type: '?',
    value: null
  },
  {
    'description': '+String|{"a": "Number" }',
    type: typeforce.oneOf(['String', { a: 'Number' }]),
    value: 'foobar'
  },
  {
    'description': '+String|{"a": "Number" }',
    type: typeforce.oneOf([typeforce.String, { a: typeforce.Number }]),
    value: 'foobar'
  },
  {
    type: typeforce.oneOf(['String', { a: 'Number' }]),
    value: {
      a: 1
    }
  },
  {
    type: typeforce.maybe({ a: 'Number' }),
    value: {
      a: 1
    }
  },
  {
    type: typeforce.maybe({ a: 'Number' }),
    value: null
  }
]

var invalid = [
  {
    exception: 'Expected Array, got Boolean true',
    type: 'Array',
    value: true
  },
  {
    exception: 'Expected Array, got Buffer',
    type: 'Array',
    value: buffer
  },
  {
    exception: 'Expected Array, got Number 1234',
    type: 'Array',
    value: 1234
  },
  {
    exception: 'Expected Array, got String "foobar"',
    type: 'Array',
    value: 'foobar'
  },
  {
    exception: 'Expected Array, got CustomType {}',
    type: 'Array',
    value: new CustomType()
  },
  {
    exception: 'Expected Array, got Object {}',
    type: 'Array',
    value: {}
  },
  {
    exception: 'Expected Boolean, got Array',
    type: 'Boolean',
    value: []
  },
  {
    exception: 'Expected Boolean, got Buffer',
    value: buffer,
    type: 'Boolean'
  },
  {
    exception: 'Expected Boolean, got Number 1234',
    type: 'Boolean',
    value: 1234
  },
  {
    exception: 'Expected Boolean, got String "foobar"',
    type: 'Boolean',
    value: 'foobar'
  },
  {
    exception: 'Expected Boolean, got CustomType {}',
    type: 'Boolean',
    value: new CustomType()
  },
  {
    exception: 'Expected Boolean, got Object {}',
    type: 'Boolean',
    value: {}
  },
  {
    exception: 'Expected Buffer, got Array',
    type: 'Buffer',
    value: []
  },
  {
    exception: 'Expected Buffer, got Boolean true',
    type: 'Buffer',
    value: true
  },
  {
    exception: 'Expected Buffer, got Number 1234',
    type: 'Buffer',
    value: 1234
  },
  {
    exception: 'Expected Buffer, got String "foobar"',
    type: 'Buffer',
    value: 'foobar'
  },
  {
    exception: 'Expected Buffer, got CustomType {}',
    type: 'Buffer',
    value: new CustomType()
  },
  {
    exception: 'Expected Buffer, got Object {}',
    type: 'Buffer',
    value: {}
  },
  {
    exception: 'Expected Number, got Array',
    type: 'Number',
    value: []
  },
  {
    exception: 'Expected Number, got Boolean true',
    type: 'Number',
    value: true
  },
  {
    exception: 'Expected Number, got Buffer',
    value: buffer,
    type: 'Number'
  },
  {
    exception: 'Expected Number, got String "foobar"',
    type: 'Number',
    value: 'foobar'
  },
  {
    exception: 'Expected Number, got CustomType {}',
    type: 'Number',
    value: new CustomType()
  },
  {
    exception: 'Expected Number, got Object {}',
    type: 'Number',
    value: {}
  },
  {
    exception: 'Expected String, got Array',
    type: 'String',
    value: []
  },
  {
    exception: 'Expected String, got Boolean true',
    type: 'String',
    value: true
  },
  {
    exception: 'Expected String, got Buffer',
    value: buffer,
    type: 'String'
  },
  {
    exception: 'Expected String, got Number 1234',
    type: 'String',
    value: 1234
  },
  {
    exception: 'Expected String, got CustomType {}',
    type: 'String',
    value: new CustomType()
  },
  {
    exception: 'Expected String, got Object {}',
    type: 'String',
    value: {}
  },
  {
    exception: 'Expected CustomType, got Array',
    type: 'CustomType',
    value: []
  },
  {
    exception: 'Expected CustomType, got Boolean true',
    type: 'CustomType',
    value: true
  },
  {
    exception: 'Expected CustomType, got Buffer',
    value: buffer,
    type: 'CustomType'
  },
  {
    exception: 'Expected CustomType, got Number 1234',
    type: 'CustomType',
    value: 1234
  },
  {
    exception: 'Expected CustomType, got String "foobar"',
    type: 'CustomType',
    value: 'foobar'
  },
  {
    exception: 'Expected CustomType, got Object {}',
    type: 'CustomType',
    value: {}
  },
  {
    exception: 'Expected Object, got Boolean true',
    type: 'Object',
    value: true
  },
  {
    exception: 'Expected Object, got Number 1234',
    type: 'Object',
    value: 1234
  },
  {
    exception: 'Expected Object, got String "foobar"',
    type: 'Object',
    value: 'foobar'
  },
  {
    exception: 'Expected property "a" of type Number, got undefined',
    type: {
      a: 'Number',
      b: {
        c: 'String'
      }
    },
    value: []
  },
  {
    exception: 'Expected property "a" of type Number, got undefined',
    type: {
      a: 'Number',
      b: {
        c: 'String'
      }
    },
    value: {}
  },
  {
    exception: 'Expected Object, got Boolean true',
    type: {
      a: 'Number',
      b: {
        c: 'String'
      }
    },
    value: true
  },
  {
    exception: 'Expected property "a" of type Number, got undefined',
    value: buffer,
    type: {
      a: 'Number',
      b: {
        c: 'String'
      }
    }
  },
  {
    exception: 'Expected Object, got Number 1234',
    type: {
      a: 'Number',
      b: {
        c: 'String'
      }
    },
    value: 1234
  },
  {
    exception: 'Expected Object, got String "foobar"',
    type: {
      a: 'Number',
      b: {
        c: 'String'
      }
    },
    value: 'foobar'
  },
  {
    exception: 'Expected property "a" of type Number, got undefined',
    type: {
      a: 'Number',
      b: {
        c: 'String'
      }
    },
    value: new CustomType()
  },
  {
    exception: 'Expected property "a" of type Number, got String "foobar"',
    type: {
      a: 'Number',
      b: {
        c: 'String'
      }
    },
    value: {
      a: 'foobar'
    }
  },
  {
    exception: 'Expected property "b" of type {"c":"String"}, got String "foobar"',
    type: {
      a: 'Number',
      b: {
        c: 'String'
      }
    },
    value: {
      a: 1,
      b: 'foobar'
    }
  },
  {
    exception: 'Expected property "b" of type {"c":"String"}, got Object {"c":2}',
    type: {
      a: 'Number',
      b: {
        c: 'String'
      }
    },
    value: {
      a: 1,
      b: {
        c: 2
      }
    }
  },
  {
    exception: 'Unexpected property "b"',
    type: {
      a: 'Number'
    },
    value: {
      a: 1,
      b: 2
    },
    strict: true
  },
  {
    exception: 'Expected \\["String"\\], got null',
    type: [
      'String'
    ],
    value: null
  },
  {
    exception: 'Expected \\["\\?String"\\], got null',
    type: [
      '?String'
    ],
    value: null
  },
  {
    exception: 'Expected \\["String"\\], got Array \\[1\\]',
    type: [
      'String'
    ],
    value: [
      1
    ]
  },
  {
    exception: 'Expected \\["\\?String"\\], got Array \\[1\\]',
    type: [
      '?String'
    ],
    value: [
      1
    ]
  },
  {
    exception: 'Expected Function, got Array',
    type: 'Function',
    value: []
  },
  {
    exception: 'Expected Function, got Boolean true',
    type: 'Function',
    value: true
  },
  {
    exception: 'Expected Function, got Buffer',
    type: 'Function',
    value: buffer
  },
  {
    exception: 'Expected Function, got Number 1234',
    type: 'Function',
    value: 1234
  },
  {
    exception: 'Expected Function, got String "foobar"',
    type: 'Function',
    value: 'foobar'
  },
  {
    exception: 'Expected Function, got CustomType {}',
    type: 'Function',
    value: new CustomType()
  },
  {
    exception: 'Expected Function, got Object {}',
    type: 'Function',
    value: {}
  },
  {
    exception: 'Expected Number, got null',
    type: 'Number',
    value: null
  },
  {
    exception: 'Unexpected property "b"',
    type: {
      a: '?'
    },
    value: {
      a: null,
      b: 2
    },
    strict: true
  },
  {
    exception: 'Expected property "b" of type {"c":"Number"}, got Object {"c":"foo"}',
    type: {
      a: '?Number',
      b: {
        c: 'Number'
      }
    },
    value: {
      a: null,
      b: {
        c: 'foo'
      }
    },
    strict: true
  },
  {
    exception: 'Expected property "a" of type {"b":"Number"}, got undefined',
    type: {
      a: {
        b: 'Number'
      }
    },
    value: {},
    strict: true
  },
  {
    exception: 'Expected property "b" of type {"c":"Number"}, got undefined',
    type: {
      a: 'Number',
      b: {
        c: 'Number'
      }
    },
    value: {
      a: 1
    },
    strict: true
  }
]

module.exports = { valid, invalid }
