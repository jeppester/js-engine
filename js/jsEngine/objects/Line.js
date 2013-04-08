/**
 * Line:
 * A math object which is used for handling lines
 */

jseCreateClass('Line');

/**
 * Constructor for the Line object. Uses setFromVectors to create the line.
 * 
 * @param {object} startVector A Vector2D representing the start point of the line
 * @param {object} endVector A Vector2D representing the end point of the line
 */
Line.prototype.line = function (startVector, endVector) {
	startVector = startVector !== undefined ? startVector : new Vector2D(0, 0);
	endVector = endVector !== undefined ? endVector : new Vector2D(0, 0);

	this.setFromVectors(startVector, endVector);
};

/**
 * Sets the start- and end points from two Vector2D's.
 * 
 * @param {object} startVector A Vector2D representing the start point of the line
 * @param {object} endVector A Vector2D representing the end point of the line
 * @return {object} The resulting Line object (itself)
 */
Line.prototype.setFromVectors = function (startVector, endVector) {
	if (!startVector.implements(Vector2D)) {throw new Error('Agument startVector should be of type: Vector2D'); }
	if (!endVector.implements(Vector2D)) {throw new Error('Agument endVector should be of type: Vector2D'); }

	this.a = startVector;
	this.b = endVector;

	return this;
};

/**
 * Sets the start- and end points directly from x- and y-coordinates.
 * 
 * @param {number} x1 The start points' x-coordinate
 * @param {number} y1 The start points' y-coordinate
 * @param {number} x2 The end points' x-coordinate
 * @param {number} y2 The end points' y-coordinate
 * @return {object} The resulting Line object (itself)
 */
Line.prototype.setFromCoordinates = function (x1, y1, x2, y2) {
	x1 = x1 !== undefined ? x1 : 0;
	y1 = y1 !== undefined ? y1 : 0;
	x2 = x2 !== undefined ? x2 : 0;
	y2 = y2 !== undefined ? y2 : 0;

	this.a = new Vector2D(x1, y1);
	this.b = new Vector2D(x2, y2);

	return this;
};

/**
 * Copies the Line object
 * 
 * @return {object} A copy of the Line object (which can be modified without changing the original object)
 */
Line.prototype.copy = function () {
	return new Line(this.a, this.b);
};

/**
 * Moves the line by moving the start- and the end point
 * 
 * @param {number} x The value to add to both points' x-coordinates
 * @param {number} y The value to add to both points' y-coordinates
 * @return {object} The resulting Line object (itself)
 */
Line.prototype.move = function (x, y) {
	this.a.move(x, y);
	this.b.move(x, y);

	return this;
};

/**
 * Rotates the line around the zero-vector.
 * 
 * @param {number} dir The number of radians to rotate the line
 * @return {object} The resulting Line object (itself)
 */
Line.prototype.rotate = function (dir) {
	if (typeof dir !== 'number') {throw new Error('Argument dir should be of type: Number'); }

	this.a.rotate(dir);
	this.b.rotate(dir);

	return this;
};

/**
 * Scales the line by multiplying the start- and end points with a factor
 * 
 * @param {number} factor A factor with which to scale the line
 * @return {object} The resulting Line object (itself)
 */
Line.prototype.scale = function (factor) {
	if (typeof factor !== 'number') {throw new Error('Argument factor should be of type: Number'); }

	this.a.scale(factor);
	this.b.scale(factor);

	return this;
};

/**
 * Adds a vector to the start- and end points of the line.
 * Can by used for the same purpose as move, but takes a vector as argument.
 * 
 * @param {object} vector A vector to add to the line's start- and end points
 * @return {object} The resulting Line object (itself)
 */
Line.prototype.add = function (vector) {
	this.a.add(vector);
	this.b.add(vector);

	return this;
};

/**
 * Subtracts a vector from the start- and end points of the line.
 * 
 * @param {object} vector A vector to subtract from the line's start- and end points
 * @return {object} The resulting Line object (itself)
 */
Line.prototype.subtract = function (vector) {
	this.a.substract(vector);
	this.b.substract(vector);

	return this;
};

/**
 * Divides the start- and end points of the line with a vector.
 * 
 * @param {object} vector A vector to divide the line's start- and end points with
 * @return {object} The resulting Line object (itself)
 */
Line.prototype.divide = function (vector) {
	this.a.divide(vector);
	this.b.divide(vector);

	return this;
};

/**
 * Multiplies the start- and end points of the line with a vector.
 * 
 * @param {object} vector A vector to multiply the line's start- and end points with
 * @return {object} The resulting Line object (itself)
 */
Line.prototype.multiply = function (vector) {
	this.a.multiply(vector);
	this.b.multiply(vector);

	return this;
};

/**
 * Checks whether the line intersects with another line or polygon.
 * 
 * @param {object} object Polygon or line to check for intersection with
 * @return {boolean} True if the checked object intersects with the line, false if not
 */
Line.prototype.intersects = function (object) {
	if (object.implements(Line)) {
		var c1, c2;

		c1 = (this.b.x - this.a.x) * (object.a.y - this.b.y) - (object.a.x - this.b.x) * (this.b.y - this.a.y);
		c2 = (this.b.x - this.a.x) * (object.b.y - this.b.y) - (object.b.x - this.b.x) * (this.b.y - this.a.y);

		if (c1 * c2 > 0) {return false; }

		c1 = (object.b.x - object.a.x) * (this.a.y - object.b.y) - (this.a.x - object.b.x) * (object.b.y - object.a.y);
		c2 = (object.b.x - object.a.x) * (this.b.y - object.b.y) - (this.b.x - object.b.x) * (object.b.y - object.a.y);

		return c1 * c2 < 0;
	}
	else if (object.implements(Polygon)) {
		return object.intersects(this);
	}
	else {
		throw new Error('Agument object should be of type: Line or Polygon');
	}
};

/**
 * Calculates the length of the line.
 * 
 * @return {number} The length of the line
 */
Line.prototype.getLength = function () {
	return this.b.copy().subtract(a).getLength();
};