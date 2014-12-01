###
Imports all properties of another object.

@param {Object} from The object from which to copy the properties
@param {boolean} [copyIfPossible=false] If possible, copy properties which are actually pointers. This option will look for and use a copy()- or clone() function inside the properties
###
Object::import = (from) ->
  i = undefined
  for i of from
    if from.hasOwnProperty(i)
      continue if i is undefined
      this[i] = from[i]
  return
