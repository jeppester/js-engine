Array.prototype.getElementByPropertyValue = function (property, value) {
	var i;
	for (i = 0; i < this.length; i ++) {
		if (this[i][property] === value) {
			return this[i];
		}
	}
	return undefined;
};

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

Array.prototype.forEach = function (func) {
	for (var i = 0; i < this.length; i ++) {
		func.call(this[i], i);
	}
}

Object.prototype.importProperties = function(from) {
	var i;
	for (i in from) {
		if (from.hasOwnProperty(i)) {
			if (i === undefined) {continue; }
			this[i] = from[i];
		}
	}
};