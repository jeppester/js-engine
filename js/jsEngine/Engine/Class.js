/**
 * Creates a new jsEngine class
 *
 * @param {string} className The name of the new class
 * @param {Class|Class[]|Object} [inherits] A class or an array of classes to inherit functions from (to actually extend an inherited class, run the class' constructor from inside the extending class)
 * @param {Object} functions A map of functions to add to the new class, functions can also be added by using [Class name].prototype.[Function name] = function () {}
 */
function Class(className, inherits, functions) {
	var name, constructor, str, i, ii, inheritClass, newClass, propName;

    // Check if the class is inside a name space
    name = className.split('.');
    constructor = name[name.length - 1];

    // Create name space if missing
    for (i = 0; i < name.length - 1; i++) {
        // Create eval string
        str = name.slice(0, i + 1).join('.');

        if (eval('window.' + str) === undefined) {
            eval(str + ' = {}');
        }
    }

	// Check if inherits can be used as argument, otherwise inherits will be used as the properties argument
	if (inherits !== undefined && !Array.prototype.isPrototypeOf(inherits) && inherits.prototype === undefined) {
		functions = inherits;
		inherits = undefined;
	}

    eval('\
    ' + className + ' = function () {\
        this.'+ name[name.length - 1] +'.apply(this, arguments);\
    }');

	newClass = eval('window.' + className);

    newClass.prototype[constructor] = function () {};
    newClass.prototype.className = className;
    newClass.prototype.inheritedClasses = [];

	function inherit(newClass, inheritClass) {
		var functionName;

		newClass.prototype.inheritedClasses.push(inheritClass);
		Array.prototype.push.apply(newClass.prototype.inheritedClasses, inheritClass.prototype.inheritedClasses);

		for (functionName in inheritClass.prototype) {
            if (inheritClass.prototype.hasOwnProperty(functionName)) {
                if (typeof inheritClass.prototype[functionName] === "function") {
                    newClass.prototype[functionName] = inheritClass.prototype[functionName];
                }
            }
        }
    }
	// Inherit functions

    if (inherits) {
        if (!Array.prototype.isPrototypeOf(inherits)) {throw new Error("Arguments inherits is not an array"); } //dev

        for (i = 0; i < inherits.length; i ++) {
            inheritClass = inherits[i];
            inherit(newClass, inheritClass);
        }
    }
	// Define functions and properties

    for (propName in functions) {
        if (functions.hasOwnProperty(propName)) {
            newClass.prototype[propName] = functions[propName];
        }
	}
}