/**
 * Vector:
 * A math class which is used for handling two-dimensional vectors
 */

NewClass('Vector', [Animatable, View]);

/**
 * Constructor for the Vector class. Uses set-function to set the vector from x- and y values.
 * 
 * @param {number} x The x-value to set for the vector
 * @param {number} y The y-value to set for the vector
 */
Vector.prototype.Vector = function (x, y) {
	this.View();
	this.set(x, y);
};

/**
 * Sets the vector from x- and y values.
 * 
 * @param {number} x The x-value to set for the vector
 * @param {number} y The y-value to set for the vector
 * @return {object} The resulting Vector object (itself)
 */
Vector.prototype.set = function (x, y) {
	this.x = x !== undefined ? x : 0;
	this.y = y !== undefined ? y : 0;

	return this;
};

/**
 * Calculates and sets the vector from a direction and a length.
 * 
 * @param {number} direction The direction (in radians)
 * @param {number} length The length
 * @return {object} The resulting Vector object (itself)
 */
Vector.prototype.setFromDirection = function (direction, length) {
	if (typeof direction !== 'number') {throw new Error('Argument direction should be of type: Number'); }
	if (typeof length !== 'number') {throw new Error('Argument length should be of type: Number'); }

	this.x = Math.cos(direction) * length;
	this.y = Math.sin(direction) * length;

	return this;
};

/**
 * Copies the Vector object
 * 
 * @return {object} A copy of the Vector object (which can be modified without changing the original object)
 */
Vector.prototype.copy = function () {
	return new Vector(this.x, this.y);
};

/**
 * Moves the vector by adding a value to its x-property and another value to its y-property.
 * 
 * @param {number} x The value to add to the x-property (can be negative)
 * @param {number} y The value to add to the y-property (can be negative)
 * @return {object} The resulting Vector object (itself)
 */
Vector.prototype.move = function (x, y) {
	if (typeof x !== 'number') {throw new Error('Argument x should be of type: Number'); }
	if (typeof y !== 'number') {throw new Error('Argument y should be of type: Number'); }

	this.x += x;
	this.y += y;

	return this;
};

/**
 * Rotates the vector around the zero-vector.
 * 
 * @param {number} dir The number of radians to rotate the vector
 * @return {object} The resulting Vector object (itself)
 */
Vector.prototype.rotate = function (dir) {
	if (typeof dir !== 'number') {throw new Error('Argument dir should be of type: Number'); }

	this.setFromDirection(this.getDirection() + dir, this.getLength());

	return this;
};

/**
 * Scales the vector by multiplying the x- and y values with a factor.
 * 
 * @param {number} factor A factor with which to scale the vector
 * @return {object} The resulting Vector object (itself)
 */
Vector.prototype.scale = function (factor) {
	if (typeof factor !== 'number') {throw new Error('Argument factor should be of type Number'); }

	this.x *= factor;
	this.y *= factor;

	return this;
};

/**
 * Adds another vector to the Vector.
 * Can by used for the same purpose as move, but takes a vector as argument.
 * 
 * @param {object} vector A vector to add to the Vector
 * @return {object} The resulting Vector object (itself)
 */
Vector.prototype.add = function (vector) {
	if (vector.implements(Vector)) {
		this.x += vector.x;
		this.y += vector.y;
	}
	else if (typeof vector === 'number') {
		this.x += vector;
		this.y += vector;
	}
	else {
		throw new Error('Argument vector should be of type Vector or Number');
	}

	return this;
};

/**
 * Subtracts another vector from the Vector.
 * 
 * @param {object} vector A vector to subtract from the Vector
 * @return {object} The resulting Vector object (itself)
 */
Vector.prototype.subtract = function (vector) {
	if (vector.implements(Vector)) {
		this.x -= vector.x;
		this.y -= vector.y;
	}
	else if (typeof vector === 'number') {
		this.x -= vector;
		this.y -= vector;
	}
	else {
		throw new Error('Argument vector should be of type Vector or Number');
	}

	return this;
};

/**
 * Divides the Vector with another vector.
 * 
 * @param {object} vector A vector to divide the Vector with
 * @return {object} The resulting Vector object (itself)
 */
Vector.prototype.divide = function (vector) {
	if (vector.implements(Vector)) {
		this.x /= vector;
		this.y /= vector;
	}
	else if (typeof vector === 'number') {
		this.x /= vector;
		this.y /= vector;
	}
	else {
		throw new Error('Argument vector should be of type Vector or Number');
	}

	return this;
};

/**
 * Multiplies the Vector with another vector.
 * 
 * @param {object} vector A vector to multiply the Vector with
 * @return {object} The resulting Vector object (itself)
 */
Vector.prototype.multiply = function (vector) {
	if (!vector.implements(Vector)) {throw new Error('Argument vector should be of type Vector'); }

	this.x *= vector.x;
	this.y *= vector.y;

	return this;
};

/**
 * Calculates the cross product of the Vector and another vector
 * 
 * @param {object} vector The vector to use for the calculation
 * @return {number} The dot product
 */
Vector.prototype.getDot = function (vector) {
	if (!vector.implements(Vector)) {throw new Error('Argument vector should be of type: Vector'); }

	return this.x * vector.x + this.y * vector.y;
};

/**
 * Calculates the cross product of the Vector and another vector
 * 
 * @param {object} vector The vector to use for the calculation
 * @return {number} The cross product
 */
Vector.prototype.getCross = function (vector) {
	if (!vector.implements(Vector)) {throw new Error('Argument vector should be of type: Vector'); }

	return this.x * vector.y - this.y * vector.x;
};

/**
 * Calculates the length of the Vector
 * 
 * @return {number} The vector's length
 */
Vector.prototype.getLength = function () {
	return Math.sqrt(this.getDot(this));
};

/**
 * Calculates the direction of the Vector
 * 
 * @return {number} The vector's direction (in radians)
 */
Vector.prototype.getDirection = function () {
	return Math.atan2(this.y, this.x);
};

/**
 * Calculates the direction to another Vector (or object inheriting Vector)
 * 
 * @param {object} point A Vector to calculate the direction to
 * @return {number} The direction to the object
 */
Vector.prototype.getDirectionTo = function (point) {
	if (!point.implements(Vector)) {throw new Error('Only Vectors or objects inheriting Vector are supported'); }

	return point.copy().subtract(this).getDirection();
};

/**
 * Calculates the shortest distance from the Vector object to another geometric object
 * 
 * @param {object} object The object to calculate the distance to
 * @return {number} The distance
 */
Vector.prototype.getDistance = function (object) {
	if (object.implements(Vector)) {
		return object.copy().subtract(this).getLength();
	}
	else if (object.implements(Line)) {
		return object.getDistance(this);
	}
	else if (object.implements(Circle)) {
		return object.getDistance(this);
	}
	else if (object.implements(Rectangle)) {
		return object.getDistance(this);
	}
	else if (object.implements(Polygon)) {
		return object.getDistance(this);
	}
	else {
		throw new Error('Agument object should be of type: Vector, Line, Circle, Rectangle or Polygon');
	}
};

/**
 * Draws the Vector object on the canvas, as a point (if added as a child of a View)
 *
 * @private
 * @param {object} c A canvas 2D context on which to draw the Vector
 */
Vector.prototype.drawCanvas = function (c) {
	c.save();

	c.fillStyle = '#f00';
	c.beginPath();

	c.moveTo(this.x, this.y);
	c.arc(this.x, this.y, 2, 0, Math.PI * 2, true);

	c.fill();

	c.restore();
};