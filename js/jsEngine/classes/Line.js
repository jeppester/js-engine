new Class('Line', {
	/**
	 * Constructor for the Line class. Uses setFromVectors to create the line.
	 *
     * @name Line
     * @class A math class which is used for handling lines
	 * @param {Vector} startVector A Vector representing the start point of the line
	 * @param {Vector} endVector A Vector representing the end point of the line
	 */
	Line: function (startVector, endVector) {
		startVector = startVector !== undefined ? startVector : new Vector(0, 0);
		endVector = endVector !== undefined ? endVector : new Vector(0, 0);

		this.setFromVectors(startVector, endVector);
	},
    /** @scope Line */

	/**
	 * Sets the start- and end points from two Vector's.
	 * 
	 * @param {Vector} startVector A Vector representing the start point of the line
	 * @param {Vector} endVector A Vector representing the end point of the line
	 * @return {Line} The resulting Line object (itself)
	 */
	setFromVectors: function (startVector, endVector) {
		if (!startVector.implements(Vector)) {throw new Error('Argument startVector should be of type: Vector'); }
		if (!endVector.implements(Vector)) {throw new Error('Argument endVector should be of type: Vector'); }

		this.a = startVector;
		this.b = endVector;

		return this;
	},

	/**
	 * Sets the start- and end points directly from x- and y-coordinates.
	 * 
	 * @param {number} x1 The start points' x-coordinate
	 * @param {number} y1 The start points' y-coordinate
	 * @param {number} x2 The end points' x-coordinate
	 * @param {number} y2 The end points' y-coordinate
	 * @return {Line} The resulting Line object (itself)
	 */
	setFromCoordinates: function (x1, y1, x2, y2) {
		x1 = x1 !== undefined ? x1 : 0;
		y1 = y1 !== undefined ? y1 : 0;
		x2 = x2 !== undefined ? x2 : 0;
		y2 = y2 !== undefined ? y2 : 0;

		this.a = new Vector(x1, y1);
		this.b = new Vector(x2, y2);

		return this;
	},

	/**
	 * Copies the Line object
	 * 
	 * @return {Line} A copy of the Line object (which can be modified without changing the original object)
	 */
	copy: function () {
		return new Line(this.a, this.b);
	},

	/**
	 * Moves the line by moving the start- and the end point
	 * 
	 * @param {number} x The value to add to both points' x-coordinates
	 * @param {number} y The value to add to both points' y-coordinates
	 * @return {Line} The resulting Line object (itself)
	 */
	move: function (x, y) {
		this.a.move(x, y);
		this.b.move(x, y);

		return this;
	},

	/**
	 * Rotates the line around the zero-vector.
	 * 
	 * @param {number} dir The number of radians to rotate the line
	 * @return {Line} The resulting Line object (itself)
	 */
	rotate: function (dir) {
		if (typeof dir !== 'number') {throw new Error('Argument dir should be of type: Number'); }

		this.a.rotate(dir);
		this.b.rotate(dir);

		return this;
	},

	/**
	 * Scales the line by multiplying the start- and end points
	 * 
	 * @param {number} scaleH A factor with which to scale the Line horizontally.
	 * @param {number} [scaleV=scaleH] A factor with which to scale the Line vertically
	 * @return {Line} The resulting Line object (itself)
	 */
	scale: function (scaleH, scaleV) {
		this.a.scale(scaleH, scaleV);
		this.b.scale(scaleH, scaleV);

		return this;
	},

	/**
	 * Adds a vector to the start- and end points of the line.
	 * Can by used for the same purpose as move, but takes a vector as argument.
	 * 
	 * @param {Vector} vector A vector to add to the line's start- and end points
	 * @return {Line} The resulting Line object (itself)
	 */
	add: function (vector) {
		this.a.add(vector);
		this.b.add(vector);

		return this;
	},

	/**
	 * Subtracts a vector from the start- and end points of the line.
	 * 
	 * @param {Vector} vector A vector to subtract from the line's start- and end points
	 * @return {Line} The resulting Line object (itself)
	 */
	subtract: function (vector) {
		this.a.substract(vector);
		this.b.substract(vector);

		return this;
	},

	/**
	 * Divides the start- and end points of the line with a vector.
	 * 
	 * @param {Vector} vector A vector to divide the line's start- and end points with
	 * @return {Line} The resulting Line object (itself)
	 */
	divide: function (vector) {
		this.a.divide(vector);
		this.b.divide(vector);

		return this;
	},

	/**
	 * Multiplies the start- and end points of the line with a vector.
	 * 
	 * @param {Vector} vector A vector to multiply the line's start- and end points with
	 * @return {Line} The resulting Line object (itself)
	 */
	multiply: function (vector) {
		this.a.multiply(vector);
		this.b.multiply(vector);

		return this;
	},

	/**
	 * Checks whether the line intersects with another line or polygon.
	 * 
	 * @param {Line|Circle|Rectangle|Polygon} object Geometric object to check for an intersection with
	 * @return {boolean} True if the checked object intersects with the line, false if not
	 */
	intersects: function (object) {
		if (object.implements(Line)) {
			var c1, c2;

			c1 = (this.b.x - this.a.x) * (object.a.y - this.b.y) - (object.a.x - this.b.x) * (this.b.y - this.a.y);
			c2 = (this.b.x - this.a.x) * (object.b.y - this.b.y) - (object.b.x - this.b.x) * (this.b.y - this.a.y);

			if (c1 * c2 > 0) {return false; }

			c1 = (object.b.x - object.a.x) * (this.a.y - object.b.y) - (this.a.x - object.b.x) * (object.b.y - object.a.y);
			c2 = (object.b.x - object.a.x) * (this.b.y - object.b.y) - (this.b.x - object.b.x) * (object.b.y - object.a.y);

			return c1 * c2 < 0;
		}
		else if (object.implements(Circle)) {
			return object.intersects(this);
		}
		else if (object.implements(Rectangle)) {
			return object.getPolygon().intersects(this);
		}
		else if (object.implements(Polygon)) {
			return object.intersects(this);
		}
		else {
			throw new Error('Agument object should be of type: Line, Rectangle, Circle or Polygon');
		}
	},

	/**
	 * Calculates the length of the line.
	 * 
	 * @return {number} The length of the line
	 */
	getLength: function () {
		return this.b.copy().subtract(this.a).getLength();
	},

	/**
	 * Calculates the shortest distance from the Line object to another geometric object
	 * 
	 * @param {Vector|Line|Circle|Rectangle|Polygon} object The object to calculate the distance to
	 * @return {number} The distance
	 */
	getDistance: function (object) {
		var ba, ab, bc, ac;

		if (object.implements(Vector)) {
			// Get all possibly used vectors
			ba = this.a.copy().subtract(this.b);
			ab = this.b.copy().subtract(this.a);
			bc = object.copy().subtract(this.b);
			ac = object.copy().subtract(this.a);

			// Check if one of the end points is closest to the vector
			if (ab.getDot(bc) > 0) {
				return bc.getLength();
			}
			else if (ba.getDot(ac) > 0) {
				return ac.getLength();
			}
			// Otherwise, return the distance from the vector to it's orthogonal projection on the line
			else {
				return Math.abs(ab.getCross(ac) / ab.getLength());
			}
		}
		else if (object.implements(Line)) {
			// If the lines intersect, return 0
			if (this.intersects(object)) {
				return 0;
			}
			// Else, return the shortest of the distances from each line to the other line's points
			else {
				return Math.min(this.getDistance(object.a), this.getDistance(object.b), object.getDistance(this.a), object.getDistance(this.b));
			}
		}
		else if (object.implements(Rectangle)) {
			return object.getDistance(this);
		}
		else if (object.implements(Circle)) {
			return object.getDistance(this);
		}
		else {
			throw new Error('Argument object should be of type: Vector, Line, Circle, Rectangle or Polygon');
		}
	},

	/**
	 * Draws the Line object on the canvas (if added as a child of a View)
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Line
     * @param {Vector} cameraOffset A vector defining the offset with which to draw the object
	 */
	drawCanvas: function (c, cameraOffset) {
		c.save();

		c.translate(-cameraOffset.x, -cameraOffset.y);
		c.strokeStyle = "#f00";
		c.beginPath();

		c.moveTo(this.a.x, this.a.y);
		c.lineTo(this.b.x, this.b.y);

		c.stroke();

		c.restore();
	},
});
