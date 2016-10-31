var typeforce = require('../')

function Unmatchable () { return false }
function Letter (value) {
  return /^[a-z]$/i.test(value)
}

module.exports = {
  '(Boolean, Number)': typeforce.tuple('Boolean', 'Number'),
  '(Number|String)': typeforce.tuple(typeforce.some('Number', 'String')),
  '(Number)': typeforce.tuple('Number'),
  '[?{ a: Number }]': [ typeforce.maybe({ a: 'Number' }) ],
  'Boolean|Number|String': typeforce.some('Boolean', 'Number', 'String'),
  '?Boolean|Number': typeforce.maybe(typeforce.some('Boolean', 'Number')),
  '?{ a: ?Number }': typeforce.maybe({ a: '?Number' }),
  '?{ a: Number }': typeforce.maybe({ a: 'Number' }),
  '{ a: Number|Null }': { a: typeforce.some('Number', 'Null') },
  '{ a: Number|{ b: Number } }': { a: typeforce.some('Number', { b: 'Number' }) },
  '{ a: ?{ b: Number } }': { a: typeforce.maybe({ b: 'Number' }) },
  '{ a: ?{ b: ?{ c: Number } } }': { a: typeforce.maybe({ b: typeforce.maybe({ c: 'Number' }) }) },
  '{ a: undefined }': { a: undefined },
  '@{ a: undefined }': typeforce.object({ a: undefined }), // DEPRECATED
  'Unmatchable': Unmatchable,
  '?Unmatchable': typeforce.maybe(Unmatchable),
  '{ a: ?Unmatchable }': { a: typeforce.maybe(Unmatchable) },
  '{ a: { b: Unmatchable } }': { a: { b: Unmatchable } },
  '>CustomType': typeforce.quacksLike('CustomType'),
  '{ String }': typeforce.map('String'),
  '{ String|Number }': typeforce.map(typeforce.some('String', 'Number')),
  '{ String: Number }': typeforce.map('Number', 'String'),
  '{ Letter: Number }': typeforce.map('Number', Letter),
  '{ a: { b: Buffer3 } }': { a: { b: typeforce.BufferN(3) } },
  '{ a: Buffer10|Number }': { a: typeforce.some(typeforce.BufferN(10), 'Number') },
  '{ a: Number } & { b: Number }': typeforce.every({ a: typeforce.Number }, { b: 'Number' }),
  'Buffer0': typeforce.BufferN(0),
  'Buffer3': typeforce.BufferN(3),
  'Buffer10': typeforce.BufferN(10),
  'Hex': typeforce.Hex,
  'Int8': typeforce.Int8,
  'Int16': typeforce.Int16,
  'Int32': typeforce.Int32,
  'UInt8': typeforce.UInt8,
  'UInt16': typeforce.UInt16,
  'UInt32': typeforce.UInt32,
  'UInt53': typeforce.UInt53
}
