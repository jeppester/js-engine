/**
 * Returns the first object - in the array - which has a specific property with a specific value.
 * 
 * @param {string} property The name of the property
 * @param {*} value The value of the property (can be of any type)
 * @return {Object|boolean} The first found object, or false if no object is found
 */
Array.prototype.getElementByPropertyValue = function (property, value) {
	return this[this.getKeyByPropertyValue(property, value)];
};

/**
 * Returns the key of the first object - in the array - which has a specific property with a specific value.
 * 
 * @param {string} property The name of the property
 * @param {*} value The value of the property (can be of any type)
 * @return {Object|boolean} The key of the first found object, or false if no object is found
 */
Array.prototype.getKeyByPropertyValue = function (property, value) {
	var i;
	for (i = 0; i < this.length; i ++) {
		if (this[i][property] === value) {
			return i;
		}
	}
	return false;
};

/**
 * Creates an array of values by concatenating each element's value of a specified property
 * 
 * @param  {string} property The name of the property
 * @return {*[]} An array of each element's value of the specified property
 */
Array.prototype.getArrayFromProperty = function (property) {
	var i, array;

	array = [];

	for (i = 0; i < this.length; i ++) {
		this[i][property] && array.push(this[i][property]);
	}

	return array;
};

/**
 * Sorts an array of objects after a numeric property which all objects have.
 * 
 * @param {string} property The name of the property
 * @param {boolean} desc Whether or not sorting should be descending (instead of ascending); False by default.
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