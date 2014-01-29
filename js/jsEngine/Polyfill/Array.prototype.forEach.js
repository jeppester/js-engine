/**
 * Executes a function as each object in an array.
 * Using "this" inside the function will refer to the object on which the function is executed.
 * 
 * @param {function} func The function to execute
 */
Array.prototype.forEach = function (func) {
	if (typeof func !== 'function') {throw new Error('Argument func should be of type: function'); } //dev

	// Copy the array (to avoid errors if the original array is altered by the function)
	var cp;

	cp = [];
	cp.push.apply(cp, this);

	for (var i = 0; i < cp.length; i ++) {
		func.call(cp[i], i);
	}
};