new Class('Polygon',[Child], {
	/**
	 * The constructor for the Polygon class. Uses the setFromPoints-function to set the points of the polygon.
	 *
     * @name Polygon
     * @class A math class which is used for handling polygons
     *
     * @property {Vector[]} points An array of the polygon's points. Each point is connect to the previous- and next points, and the first and last points are connected
     *
	 * @param {Vector[]} points An array of Vector's which are to be used as points for the polygon. Keep in mind that the polygon will NOT copy the points, so changing another reference to one of the added points will change the point inside the polygon.
	 */
	Polygon: function (points) {
		this.setFromPoints(points);
	},
    /** @scope Polygon */

	/**
	 * Sets the points of the polygon from Vector's.
	 * 
	 * @param {Array.<Vector>} points An array of Vector's which are to be used as points for the polygon. Keep in mind that the polygon will NOT copy the points, so changing another reference to one of the added points will change the point inside the polygon.
	 * @return {object} The resulting Polygon object (itself)
	 */
	setFromPoints: function (points) {
		this.points = points;

		return this;
	},

	/**
	 * Sets the points of the polygon from a list on point coordinates. Please notice that this function can take as an infinite number of x- and y coordinates as arguments.
	 * 
	 * @param {number} x1 The x-coordinate for the first point in the polygon
	 * @param {number} y1 The y-coordinate for the first point in the polygon
	 * @param {number} x2 The x-coordinate for the second point ...
	 * @param {number} y2 The y-coordinate for the second point ...
	 * @param {number} x3 The x-coordinate for the third point ...
	 * @param {number} y3 The y-coordinate for the third point ...
	 * @return {Polygon} The resulting Polygon object (itself)
	 */
	setFromCoordinates: function (x1, y1, x2, y2, x3, y3) {
		var numPoints, i, x, y;

		numPoints = Math.floor(arguments.length / 2);
		this.points = [];

		for (i = 0; i < numPoints; i++) {
			x = arguments[i * 2];
			y = arguments[i * 2 + 1];

			if (typeof x !== 'number' || typeof y !== 'number') {throw new Error('All arguments should be of type: Number'); }

			this.points.push(new Vector(x, y));
		}

		return this;
	},

	/**
	 * Moves the Polygon object by moving all of its points.
	 * 
	 * @param {number} x The value to add to all points' x-coordinates
	 * @param {number} y The value to add to all points' y-coordinates
	 * @return {Polygon} The resulting Polygon object (itself)
	 */
	move: function (x, y) {
		if (typeof x !== 'number') {throw new Error('Argument x should be of type Number'); }
		if (typeof y !== 'number') {throw new Error('Argument y should be of type Number'); }

		return this.add(new Vector(x, y));
	},

	/**
	 * Adds a vector to all points.
	 * 
	 * @param {Vector} vector A Vector to add to all points
	 * @return {Polygon} The resulting Polygon object (itself)
	 */
	add: function (vector) {
		if (!vector.implements(Vector)) {throw new Error('Argument vector should be of type Vector'); }

		var i;

		for (i = 0; i < this.points.length; i++) {
			this.points[i].add(vector);
		}

		return this;
	},

	/**
	 * Rotates the Polygon object by rotating all of its points around the zero vector.
	 * 
	 * @param {number} dir The number of radians to rotate the polygon
	 * @return {Polygon} The resulting Polygon object (itself)
	 */
	rotate: function (dir) {
		if (typeof dir !== 'number') {throw new Error('Argument dir should be of type Number'); }

		var i;

		for (i = 0; i < this.points.length; i++) {
			this.points[i].rotate(dir);
		}

		return this;
	},

	/**
	 * Scales the polygon by multiplying all of its points
	 * 
	 * @param {number} scaleH A factor with which to scale the Polygon horizontally. If scaleH is undefined, both width and height will be scaled after this factor
	 * @param {number} scaleV A factor with which to scale the Polygon vertically
	 * @return {Polygon} The resulting Polygon object (itself)
	 */
	scale: function (scaleH, scaleV) {
		var i;

		for (i = 0; i < this.points.length; i++) {
			this.points[i].scale(scaleH, scaleV);
		}

		return this;
	},

	/**
	 * Copies the Polygon object
	 * 
	 * @return {Polygon} A copy of the Polygon object (which can be modified without changing the original object)
	 */
	copy: function () {
		return new Polygon(this.getPoints());
	},

	/**
	 * Fetches all of the polygon's points as Vector objects
	 * 
	 * @return {Vector} An array containing all the points of the polygon, as Vector objects
	 */
	getPoints: function () {
		var points, i;

		points = [];

		for (i = 0; i < this.points.length; i++) {
			points.push(this.points[i].copy());
		}

		return points;
	},

	/**
	 * Fetches all of the polygon's sides as Line objects.
	 * 
	 * @return {Vector} An array containing all of the polygon's sides as Line objects
	 */
	getLines: function () {
		var lines, points, i, to;

		lines = [];
		points = this.points;

		for (i = 0; i < points.length; i++) {
			to = i === points.length - 1 ? 0 : i + 1;

			lines.push(new Line(points[i], points[to]));
		}

		return lines;
	},

	/**
	 * Calculates the bounding rectangle of the polygon
	 * 
	 * @return {Rectangle} The bounding rectangle
	 */
	getBoundingRectangle: function () {
		if (this.points.length === 0) {throw new Error('Cannot create bounding rectangle for pointless polygon'); }

		var startVector, endVector, i;

		startVector = new Vector(this.points[0].x, this.points[0].y);
		endVector = startVector.copy();

		for (i = 0; i < this.points.length; i ++) {
			startVector.x = Math.min(this.points[i].x, startVector.x);
			startVector.y = Math.min(this.points[i].y, startVector.y);

			endVector.x = Math.max(this.points[i].x, endVector.x);
			endVector.y = Math.max(this.points[i].y, endVector.y);
		}

		return new Rectangle().setFromVectors(startVector, endVector.subtract(startVector));
	},

	/**
	 * Calculates the shortest distance from the Polygon object to another geometric object
	 * 
	 * @param {Vector|Line|Circle|Rectangle|Polygon} object The object to calculate the distance to
	 * @return {number} The distance
	 */
	getDistance: function (object) {
		var dist, lines, objLines, i, ii, pVector;

		// Initially set the distance to infinite
		dist = 2E+10308;
		lines = this.getLines();

		if (object.implements(Vector)) {
			for (i = 0; i < lines.length; i++) {
				dist = Math.min(dist, lines[i].getDistance(object));
				if (dist < 0) {break; }
			}
			return dist;
		}
		else if (object.implements(Line)) {
			for (i = 0; i < lines.length; i++) {
				dist = Math.min(dist, lines[i].getDistance(object));
				if (dist < 0) {break; }
			}
			return dist;
		}
		else if (object.implements(Circle)) {
			pVector = new Vector(object.x, object.y);

			for (i = 0; i < lines.length; i++) {
				dist = Math.min(dist, lines[i].getDistance(pVector));
				if (dist < 0) {break; }
			}

			return Math.max(0, dist - object.radius);
		}
		else if (object.implements(Rectangle)) {
			return object.getDistance(this);
		}
		else if (object.implements(Polygon)) {
			objLines = object.getLines();

			for (i = 0; i < lines.length; i++) {
				for (ii = 0; ii < objLines.length; ii++) {
					dist = Math.min(dist, lines[i].getDistance(objLines[ii]));
					if (dist < 0) {break; }
				}
				if (dist < 0) {break; }
			}

			return dist;
		}
		else {
			throw new Error('Argument object should be of type: Vector, Line, Circle, Rectangle or Polygon');
		}
	},

	/**
	 * Checks whether or not the Polygon contains another geometric object.
	 * 
	 * @param {Vector|Line|Circle|Rectangle} object A geometric object to check
	 * @return {boolean} True if the Polygon contains the checked object, false if not
	 */
	contains: function (object) {
		if (object.implements(Vector)) {
			return this.intersects(new Line().setFromCoordinates(-123456, -98765, object.x, object.y), true) % 2;
		}
		else if (object.implements(Line)) {
			return !this.intersects(object) && this.contains(object.a);
		}
		else if (object.implements(Circle)) {
			// Check that the circle's center is placed inside the Polygon
			if (this.contains(new Vector(object.x, object.y))) {
				// If so, return whether or not, the circle does not intersect the polygon
				return !this.intersects(object);
			}
			else {
				return false;
			}
		}
		else if (object.implements(Rectangle)) {
			return this.contains(object.getPolygon());
		}
		else if (object.implements(Polygon)) {
			return object.points.length > 0 && !this.intersects(object) && this.contains(object.points[0]);
		}
		else {
			throw new Error('Argument object has to be of type: Vector, Line, Rectangle or Polygon');
		}
	},

	/**
	 * Checks whether or not the Polygon intersects with another geometric object.
	 * 
	 * @param {Line|Circle|Rectangle|Polygon} object A geometric object to check for intersections with
	 * @param {boolean} [countIntersections=true] A geometric object to check for intersections with
	 * @return {boolean} True if the Polygon intersects with the checked object, false if not
	 */
	intersects: function (object, countIntersections) {
		var intersectionCount, lines, line, oLines, oLine, i, ii;

		countIntersections = countIntersections !== undefined ? countIntersections : false;
		if (countIntersections) {
			intersectionCount = 0;
		}

		if (object.implements(Line)) {
			lines = this.getLines();

			for (i = 0; i < lines.length; i++) {
				line = lines[i];

				if (line.intersects(object)) {
					if (countIntersections) {
						intersectionCount ++;
					}
					else {
						return true;
					}
				}
			}
		}
		else if (object.implements(Circle)) {
			// Check if each line intersects with the circle
			lines = this.getLines();

			for (i = 0; i < lines.length; i++) {
				if (object.intersects(lines[i])) {
					if (countIntersections) {
						intersectionCount ++;
					}
					else {
						return true;
					}
				}
			}
		}
		else if (object.implements(Rectangle)) {
			return this.intersects(object.getPolygon());
		}
		else if (object.implements(Polygon)) {
			lines = this.getLines();
			oLines = object.getLines();

			for (i = 0; i < lines.length; i++) {
				line = lines[i];

				for (ii = 0; ii < oLines.length; ii++) {
					oLine = oLines[ii];

					if (line.intersects(oLine)) {
						if (countIntersections) {
							intersectionCount ++;
						}
						else {
							return true;
						}
					}
				}
			}
		}
		else {
			throw new Error('Argument object has to be of type: Line, Circle, Rectangle or Polygon');
		}

		if (countIntersections) {
			return intersectionCount;
		}
		else {
			return false;
		}
	},

	/**
	 * Draws the Polygon object on the canvas (if added as a child of a View)
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Polygon
     * @param {Vector} cameraOffset A vector defining the offset with which to draw the object
     */
	drawCanvas: function (c, cameraOffset) {
		var i, len;

		c.save();

		c.translate(-cameraOffset.x, -cameraOffset.y);
		c.strokeStyle = "#f00";
		c.beginPath();

		len = this.points.length;
		c.moveTo(this.points[len - 1].x, this.points[len - 1].y);
		for (i = 0; i < len; i ++) {
			c.lineTo(this.points[i].x, this.points[i].y);
		}

		c.stroke();

		c.restore();
	}
});
