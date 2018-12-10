var typeforce = require('../')

function Unmatchable () { return false }
function Letter (value) {
  return /^[a-z]$/i.test(value)
}

module.exports = {
  '(Boolean, Number)': typeforce.tuple('Boolean', 'Number'),
  '(Number|String)': typeforce.tuple(typeforce.anyOf('Number', 'String')),
  '(Number)': typeforce.tuple('Number'),
  '[?{ a: Number }]': [ typeforce.maybe({ a: 'Number' }) ],
  'Boolean|Number|String': typeforce.anyOf('Boolean', 'Number', 'String'),
  '?Boolean|Number': typeforce.maybe(typeforce.anyOf('Boolean', 'Number')),
  '?{ a: ?Number }': typeforce.maybe({ a: '?Number' }),
  '?{ a: Number }': typeforce.maybe({ a: 'Number' }),
  '{ a: Number|Nil }': { a: typeforce.anyOf('Number', typeforce.Nil) },
  '{ a: Number|{ b: Number } }': { a: typeforce.anyOf('Number', { b: 'Number' }) },
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
  '{ String|Number }': typeforce.map(typeforce.anyOf('String', 'Number')),
  '{ String: Number }': typeforce.map('Number', 'String'),
  '{ Letter: Number }': typeforce.map('Number', Letter),
  '{ a: { b: Buffer3 } }': { a: { b: typeforce.BufferN(3) } },
  '{ a: Buffer10|Number }': { a: typeforce.anyOf(typeforce.BufferN(10), 'Number') },
  '{ a: { b: Buffer } }': typeforce.allOf({ a: typeforce.Object }, { a: { b: typeforce.Buffer } }),
  '{ x: Number } & { y: Number }': typeforce.allOf({ x: typeforce.Number }, { y: typeforce.Number }),
  '{ x: Number } & { z: Number }': typeforce.allOf({ x: typeforce.Number }, { z: typeforce.Number }),
  'Array6(Number)': typeforce.arrayOf(typeforce.Number, { length: 6 }),
  'Array>=6(Number)': typeforce.arrayOf(typeforce.Number, { minLength: 6 }),
  'Array<=6(Number)': typeforce.arrayOf(typeforce.Number, { maxLength: 6 }),
  'Array6': typeforce.ArrayN(6),
  'Array7': typeforce.ArrayN(7),
  'Buffer0': typeforce.BufferN(0),
  'Buffer3': typeforce.BufferN(3),
  'Buffer10': typeforce.BufferN(10),
  'Hex': typeforce.Hex,
  'Hex64': typeforce.HexN(64),
  'String4': typeforce.StringN(4),
  'Range1-5': typeforce.Range(1, 5),
  'Int8Range0-100': typeforce.Range(0, 100, typeforce.Int8),
  'Int8': typeforce.Int8,
  'Int16': typeforce.Int16,
  'Int32': typeforce.Int32,
  'Int53': typeforce.Int53,
  'UInt8': typeforce.UInt8,
  'UInt16': typeforce.UInt16,
  'UInt32': typeforce.UInt32,
  'UInt53': typeforce.UInt53
}
