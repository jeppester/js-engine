module.exports = MixinHelper =
  ###
  Imports all properties of another object.

  @param {Object} from The object from which to copy the properties
  @param {boolean} [copyIfPossible=false] If possible, copy properties which are actually pointers. This option will look for and use a copy()- or clone() function inside the properties
  ###
  import: (to, from, exclude = [])->
    for i of from
      to[i] = from[i] unless exclude.indexOf(i) != -1
    return

  mixin: (to, from)->
    @import to::, from::, ['constructor']
