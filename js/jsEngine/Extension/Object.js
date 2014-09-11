/**
 * Imports all properties of another object.
 *
 * @param {Object} from The object from which to copy the properties
 * @param {boolean} [copyIfPossible=false] If possible, copy properties which are actually pointers. This option will look for and use a copy()- or clone() function inside the properties
 */
Object.prototype.import = function (from) {
  var i;

  for (i in from) {
    if (from.hasOwnProperty(i)) {
      if (i === undefined) {continue; }
      this[i] = from[i];
    }
  }
};
