/**
* Creates a new jsEngine class
*
* @param {string} constructor The name of the createClass' constructor function
* @param {Class|Class[]|Object} [inherits] A class or an array of classes to inherit functions from (to actually extend an inherited class, run the class' constructor from inside the extending class)
* @param {Object} functions A map of functions to add to the createClass, functions can also be added by using [Class name].prototype.[Function name] = function () {}
*/
function createClass(constructor, inherits, functions) {
	var str, i, ii, inheritClass, newClass, propName;

	// Support mixins (with no constructors)
	if (typeof constructor !== 'string') {
		functions = inherits;
		inherits = constructor;
		constructor = undefined;
	}

	// Check if inherits can be used as argument, otherwise inherits will be used as the properties argument
	if (inherits !== undefined && !Array.prototype.isPrototypeOf(inherits) && inherits.prototype === undefined) {
		functions = inherits;
		inherits = undefined;
	}

	if (constructor) {
		newClass = eval('(function () { this.'+ constructor +'.apply(this, arguments); })');
		newClass.prototype[constructor] = function () {};
	}
	else {
		newClass = eval('(function () {})');
	}


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
		if (!Array.prototype.isPrototypeOf(inherits)) {throw new Error("Argument inherits is not an array"); } //dev

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

	return newClass;
}

function nameSpace(name) {
	var i;

	name = name.split('.');

	// Create namespace if missing
	for (i = 0; i < name.length; i++) {
		// Create eval string
		str = name.slice(0, i + 1).join('.');

		if (eval('window.' + str) === undefined) {
			eval(str + ' = {}');
		}
	}
}
