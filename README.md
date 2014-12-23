# typeforce

[![build status](https://secure.travis-ci.org/dcousens/typeforce.png)](http://travis-ci.org/dcousens/typeforce)
[![Coverage Status](https://coveralls.io/repos/dcousens/typeforce/badge.png)](https://coveralls.io/r/dcousens/typeforce)
[![Version](http://img.shields.io/npm/v/typeforce.svg)](https://www.npmjs.org/package/typeforce)


## Examples

``` javascript
var typeforce = require('typeforce')

var unknown = [{ prop: 'foo' }, { prop: 'bar' }]
typeforce('Array', unknown)
// supported primitives 'Array', 'Boolean', 'Buffer', 'Number', 'Object', 'String'

typeforce(['Object'], unknown)
// array types only support 1 element type

var element = unknown.pop()
typeforce({ prop: 'String' }, element)
// supports recursive type templating

typeforce([{
  {
    prop: 'String'
  }
}], unknown)
// works for array types too

typeforce('Object', unknown)
// will also pass as an Array is an Object

typeforce('Number', unknown)
// THROWS 'Expected Number, got Array ...
```

## License

This library is free and open-source software released under the MIT license.

