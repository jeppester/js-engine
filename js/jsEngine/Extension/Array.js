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
 * Returns all objects - in the array - which have a specific property with a specific value.
 * 
 * @param {string} property The name of the property
 * @param {*} value The value of the property (can be of any type)
 * @return {*[]} An array containing the the found objects (an empty array if no objects are found)
 */
Array.prototype.getArrayByPropertyValue = function (property, value) {
	return this.filter(function (arr) {
		return arr[property] === value;
	});
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
 * Returns the keys of all objects - in the array - which have a specific property with a specific value.
 * 
 * @param {string} property The name of the property
 * @param {*} value The value of the property (can be of any type)
 * @return {*[]} An array containing the keys of the found objects (an empty array if no objects are found)
 */
Array.prototype.getKeysByPropertyValue = function (property, value) {
	var i, keys;

	keys = [];
	for (i = 0; i < this.length; i ++) {
		if (this[i][property] === value) {
			keys.push(i);
		}
	}
	return keys;
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