new Class('Math.Polygon', {
	/**
	 * The constructor for the Polygon class. Uses the setFromPoints-function to set the points of the polygon.
	 *
     * @name Math.Polygon
     * @class A math class which is used for handling polygons
     *
     * @property {Math.Vector[]} points An array of the polygon's points. Each point is connect to the previous- and next points, and the first and last points are connected
     *
	 * @param {Math.Vector[]} points An array of Vector's which are to be used as points for the polygon. Keep in mind that the polygon will NOT copy the points, so changing another reference to one of the added points will change the point inside the polygon.
	 */
	Polygon: function (points) {
		this.setFromPoints(points);
	},
    /** @scope Math.Polygon */

	/**
	 * Sets the points of the polygon from Vector's.
	 * 
	 * @param {Math.Vector[]} points An array of Vector's which are to be used as points for the polygon. Keep in mind that the polygon will NOT copy the points, so changing another reference to one of the added points will change the point inside the polygon.
	 * @return {Object} The resulting Polygon object (itself)
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
	 * @return {Math.Polygon} The resulting Polygon object (itself)
	 */
	setFromCoordinates: function (x1, y1, x2, y2, x3, y3) {
		var numPoints, i, x, y;

		numPoints = Math.floor(arguments.length / 2);
		this.points = [];

		for (i = 0; i < numPoints; i++) {
			x = arguments[i * 2];
			y = arguments[i * 2 + 1];

			if (typeof x !== 'number' || typeof y !== 'number') {throw new Error('All arguments should be of type: Number'); }

			this.points.push(new Math.Vector(x, y));
		}

		return this;
	},

	/**
	 * Moves the Polygon object by moving all of its points.
	 * 
	 * @param {number} x The value to add to all points' x-coordinates
	 * @param {number} y The value to add to all points' y-coordinates
	 * @return {Math.Polygon} The resulting Polygon object (itself)
	 */
	move: function (x, y) {
		if (typeof x !== 'number') {throw new Error('Argument x should be of type Number'); }
		if (typeof y !== 'number') {throw new Error('Argument y should be of type Number'); }

		return this.add(new Math.Vector(x, y));
	},

	/**
	 * Adds a vector to all points.
	 * 
	 * @param {Math.Vector} vector A Vector to add to all points
	 * @return {Math.Polygon} The resulting Polygon object (itself)
	 */
	add: function (vector) {
		if (!vector.implements(Math.Vector)) {throw new Error('Argument vector should be of type Vector'); }

		var i;

		for (i = 0; i < this.points.length; i++) {
			this.points[i].add(vector);
		}

		return this;
	},

	/**
	 * Rotates the Polygon object by rotating all of its points around the zero vector.
	 * 
	 * @param {number} direction The number of radians to rotate the polygon
	 * @return {Math.Polygon} The resulting Polygon object (itself)
	 */
	rotate: function (direction) {
		if (typeof direction !== 'number') {throw new Error('Argument direction should be of type Number'); }

		var i;

		for (i = 0; i < this.points.length; i++) {
			this.points[i].rotate(direction);
		}

		return this;
	},

	/**
	 * Scales the polygon by multiplying all of its points
	 * 
	 * @param {number} scaleH A factor with which to scale the Polygon horizontally. If scaleH is undefined, both width and height will be scaled after this factor
	 * @param {number} scaleV A factor with which to scale the Polygon vertically
	 * @return {Math.Polygon} The resulting Polygon object (itself)
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
	 * @return {Math.Polygon} A copy of the Polygon object (which can be modified without changing the original object)
	 */
	copy: function () {
		return new Math.Polygon(this.getPoints());
	},

	/**
	 * Fetches all of the polygon's points as Vector objects
	 * 
	 * @return {Math.Vector} An array containing all the points of the polygon, as Vector objects
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
	 * @return {Math.Vector} An array containing all of the polygon's sides as Line objects
	 */
	getLines: function () {
		var lines, points, i, to;

		lines = [];
		points = this.points;

		for (i = 0; i < points.length; i++) {
			to = i === points.length - 1 ? 0 : i + 1;

			lines.push(new Math.Line(points[i], points[to]));
		}

		return lines;
	},

	/**
	 * Calculates the bounding rectangle of the polygon
	 * 
	 * @return {Math.Rectangle} The bounding rectangle
	 */
	getBoundingRectangle: function () {
		if (this.points.length === 0) {throw new Error('Cannot create bounding rectangle for pointless polygon'); }

		var startVector, endVector, i;

		startVector = new Math.Vector(this.points[0].x, this.points[0].y);
		endVector = startVector.copy();

		for (i = 0; i < this.points.length; i ++) {
			startVector.x = Math.min(this.points[i].x, startVector.x);
			startVector.y = Math.min(this.points[i].y, startVector.y);

			endVector.x = Math.max(this.points[i].x, endVector.x);
			endVector.y = Math.max(this.points[i].y, endVector.y);
		}

		return new Math.Rectangle().setFromVectors(startVector, endVector.subtract(startVector));
	},

	/**
	 * Calculates the shortest distance from the Polygon object to another geometric object
	 * 
	 * @param {Math.Vector|Math.Line|Math.Circle|Math.Rectangle|Math.Polygon} object The object to calculate the distance to
	 * @return {number} The distance
	 */
	getDistance: function (object) {
		var dist, lines, objLines, i, ii, pVector;

		// Initially set the distance to infinite
		dist = 2E+10308;
		lines = this.getLines();

		if (object.implements(Math.Vector)) {
			for (i = 0; i < lines.length; i++) {
				dist = Math.min(dist, lines[i].getDistance(object));
				if (dist < 0) {break; }
			}
			return dist;
		}
		else if (object.implements(Math.Line)) {
			for (i = 0; i < lines.length; i++) {
				dist = Math.min(dist, lines[i].getDistance(object));
				if (dist < 0) {break; }
			}
			return dist;
		}
		else if (object.implements(Math.Circle)) {
			pVector = new Math.Vector(object.x, object.y);

			for (i = 0; i < lines.length; i++) {
				dist = Math.min(dist, lines[i].getDistance(pVector));
				if (dist < 0) {break; }
			}

			return Math.max(0, dist - object.radius);
		}
		else if (object.implements(Math.Rectangle)) {
			return object.getDistance(this);
		}
		else if (object.implements(Math.Polygon)) {
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
	 * @param {Math.Vector|Math.Line|Math.Circle|Math.Rectangle} object A geometric object to check
	 * @return {boolean} True if the Polygon contains the checked object, false if not
	 */
	contains: function (object) {
		if (object.implements(Math.Vector)) {
			return this.intersects(new Math.Line().setFromCoordinates(-123456, -98765, object.x, object.y), true) % 2;
		}
		else if (object.implements(Math.Line)) {
			return !this.intersects(object) && this.contains(object.a);
		}
		else if (object.implements(Math.Circle)) {
			// Check that the circle's center is placed inside the Polygon
			if (this.contains(new Math.Vector(object.x, object.y))) {
				// If so, return whether or not, the circle does not intersect the polygon
				return !this.intersects(object);
			}
			else {
				return false;
			}
		}
		else if (object.implements(Math.Rectangle)) {
			return this.contains(object.getPolygon());
		}
		else if (object.implements(Math.Polygon)) {
			return object.points.length > 0 && !this.intersects(object) && this.contains(object.points[0]);
		}
		else {
			throw new Error('Argument object has to be of type: Vector, Line, Rectangle or Polygon');
		}
	},

	/**
	 * Checks whether or not the Polygon intersects with another geometric object.
	 * 
	 * @param {Math.Line|Math.Circle|Math.Rectangle|Math.Polygon} object A geometric object to check for intersections with
	 * @param {boolean} [countIntersections=true] A geometric object to check for intersections with
	 * @return {boolean} True if the Polygon intersects with the checked object, false if not
	 */
	intersects: function (object, countIntersections) {
		var intersectionCount, lines, line, oLines, oLine, i, ii;

		countIntersections = countIntersections !== undefined ? countIntersections : false;
		if (countIntersections) {
			intersectionCount = 0;
		}

		if (object.implements(Math.Line)) {
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
		else if (object.implements(Math.Circle)) {
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
		else if (object.implements(Math.Rectangle)) {
			return this.intersects(object.getPolygon());
		}
		else if (object.implements(Math.Polygon)) {
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
});
