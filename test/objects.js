function Waterfowl () {}
Waterfowl.prototype.speak = function () {
  return 'quack'
}
Waterfowl.prototype.walk = function () {
  return 'waddle'
}

function Duck () {}
Duck.prototype = Object.create(Waterfowl.prototype)

module.exports = {
  Waterfowl: Waterfowl,
  Duck: Duck
}
