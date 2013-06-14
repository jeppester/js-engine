/**
 * jseExtensions.js:
 * This file contains extensions to existing JS classes.
 * These extensions are used in some of the engine's classes and can also be used in games.
 */

/**
 * Returns the first object - in the array - which has a specific property with a specific value.
 * 
 * @param {string} property The name of the property
 * @param {mixed} value The value of the property (can be of any type)
 * @return {mixed} The first found object, or false if no object is found
 */
Array.prototype.getElementByPropertyValue = function (property, value) {
	var i;
	for (i = 0; i < this.length; i ++) {
		if (this[i][property] === value) {
			return this[i];
		}
	}
	return false;
};

/**
 * Sorts an array of objects after a numeric property which all objects have.
 * 
 * @param {string} property The name of the property
 * @param {boolean} desc Whether of not sorting should be descending (instead of ascending); False by default.
 * @retun {array} A sorted version of the array
 */
Array.prototype.sortByNumericProperty = function (property, desc) {
	var sortedArray = [],
		copy = [],
		currentID,
		currentVal,
		i;

	Array.prototype.push.apply(copy, this);

	while (copy.length) {
		currentVal = false;

		for (i = 0; i < copy.length; i ++) {
			if (!desc) {
				if (copy[i][property] < currentVal || currentVal === false) {
					currentID = i;
					currentVal = copy[i][property];
				}
			}
			else {
				if (copy[i][property] > currentVal || currentVal === false) {
					currentID = i;
					currentVal = copy[i][property];
				}
			}
		}
		sortedArray.push(copy.splice(currentID, 1)[0]);
	}
	return sortedArray;
};

/**
 * Executes a function as each object in an array.
 * Using "this" inside the function will refer to the object on which the function is executed.
 * 
 * @param {function} func The function to execute
 */
Array.prototype.forEach = function (func) {
	if (typeof func !== 'function') {throw new Error('Argument func should be of type: function'); }

	// Copy the array (to avoid errors if the original array is altered by the function)
	var cp;

	cp = [];
	cp.push.apply(cp, this);

	for (var i = 0; i < cp.length; i ++) {
		func.call(cp[i], i);
	}
};

/**
 * Imports all properties of another object.
 * 
 * @param {object} from The object from which to copy the properties
 */
Object.prototype.importProperties = function (from) {
	var i;
	for (i in from) {
		if (from.hasOwnProperty(i)) {
			if (i === undefined) {continue; }
			this[i] = from[i];
		}
	}
};

/**
 * Checks if the object implements a class, meaning the object is either an instantiation of the class, or its class has inherited the checked class.
 * 
 * @param {class} checkClass The class to check if the object implements
 * @return {boolean} Whether or not the object implements the checked class
 */
Object.prototype.implements = function (checkClass) {
	return (checkClass.prototype.isPrototypeOf(this) ? true : this.inherits(checkClass));
};

/**
 * Checks if the object's class inherits another class.
 * 
 * @param {class} checkClass The class to check if the object's class has inherited
 * @return {boolean} Whether or not the object's class inherits the checked class
 */
Object.prototype.inherits = function (checkClass) {
	if (this.inheritedClasses) {
		return this.inheritedClasses.indexOf(checkClass) !== -1;
	}
	return false;
};