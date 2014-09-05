/**
 * Imports all properties of another object.
 *
 * @param {Object} from The object from which to copy the properties
 * @param {boolean} [copyIfPossible=false] If possible, copy properties which are actually pointers. This option will look for and use a copy()- or clone() function inside the properties
 */
Object.prototype.importProperties = function (from, copyIfPossible) {
    var i;

    for (i in from) {
        if (from.hasOwnProperty(i)) {
            if (i === undefined) {continue; }

            if (!copyIfPossible || typeof from[i] !== 'object') {
                this[i] = from[i];
            }
            else {
                if (from[i].copy) {
                    this[i] = from[i].copy();
                }
                else if (from[i].clone) {
                    this[i] = from[i].clone();
                }
                else {
                    this[i] = from[i];
                }
            }
        }
    }
};

/**
 * Checks if the object implements a class, meaning the object is either an instantiation of the class, or its class has inherited the checked class.
 *
 * @param {Object} checkClass The class to check if the object implements
 * @return {boolean} Whether or not the object implements the checked class
 */
Object.prototype.implements = function (checkClass) {
    return (checkClass.prototype.isPrototypeOf(this) ? true : this.inherits(checkClass));
};

/**
 * Checks if the object's class inherits another class.
 *
 * @param {Object} checkClass The class to check if the object's class has inherited
 * @return {boolean} Whether or not the object's class inherits the checked class
 */
Object.prototype.inherits = function (checkClass) {
    if (this.inheritedClasses) {
        return this.inheritedClasses.indexOf(checkClass) !== -1;
    }
    return false;
};
