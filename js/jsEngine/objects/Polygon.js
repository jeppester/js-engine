/**
 * Polygon:
 * A math object which is used for handling polygons
 */

jseCreateClass('Polygon');

/**
 * The constructor for the Polygon object. Uses the setFromPoints-function to set the points of the polygon.
 * 
 * @param {array} points An array of Vector2D's which are to be used as points for the polygon. Keep in mind that the polygon will NOT copy the points, so changing another reference to one of the added points will change the point inside the polygon.
 */
Polygon.prototype.polygon = function (points) {
	this.setFromPoints(points);
};

/**
 * Sets the points of the polygon from Vector2D's.
 * 
 * @param {array} points An array of Vector2D's which are to be used as points for the polygon. Keep in mind that the polygon will NOT copy the points, so changing another reference to one of the added points will change the point inside the polygon.
 * @return {object} The resulting Polygon object (itself)
 */
Polygon.prototype.setFromPoints = function (points) {
	this.points = points;

	return this;
};

/**
 * Sets the points of the polygon from a list on point coordinates. Please notice that this function can take as an infinite number of x- and y coordinates as arguments.
 * 
 * @param {number} x1 The x-coordinate for the first point in the polygon
 * @param {number} y1 The y-coordinate for the first point in the polygon
 * @param {number} x2 The x-coordinate for the second point ...
 * @param {number} y2 The y-coordinate for the second point ...
 * @param {number} x3 The x-coordinate for the third point ...
 * @param {number} y3 The y-coordinate for the third point ...
 * @return {object} The resulting Polygon object (itself)
 */
Polygon.prototype.setFromCoordinates = function (x1, y1, x2, y2, x3, y3) {
	var numPoints, i, x, y;

	numPoints = Math.floor(arguments.length / 2);
	this.points = [];

	for (i = 0; i < numPoints; i++) {
		x = arguments[i * 2];
		y = arguments[i * 2 + 1];

		if (typeof x !== 'number' || typeof y !== 'number') {throw new Error('All arguments should be of type: Number'); }

		this.points.push(new Vector2D(x, y));
	}

	return this;
};

/**
 * Moves the Polygon object by moving all of its points.
 * 
 * @param {number} x The value to add to all points' x-coordinates
 * @param {number} y The value to add to all points' y-coordinates
 * @return {object} The resulting Polygon object (itself)
 */
Polygon.prototype.move = function (x, y) {
	var moveVect, i;

	moveVect = new Vector2D(x, y);

	for (i = 0; i < this.points.length; i++) {
		this.points[i].add(moveVect);
	}

	return this;
};

/**
 * Rotates the Polygon object by rotating all of its points around the zero vector.
 * 
 * @param {number} dir The number of radians to rotate the polygon
 * @return {object} The resulting Polygon object (itself)
 */
Polygon.prototype.rotate = function (dir) {
	var i;

	for (i = 0; i < this.points.length; i++) {
		this.points[i].rotate(dir);
	}

	return this;
};

/**
 * Scales the polygon by multiplying all of its points with a factor
 * 
 * @param {number} factor A factor with which to scale the polygon
 * @return {object} The resulting Polygon object (itself)
 */
Polygon.prototype.scale = function (factor) {
	if (typeof factor !== 'number') {throw new Error('Argument factor should be of type Number'); }

	var i;

	for (i = 0; i < this.points.length; i++) {
		this.points[i].scale(factor);
	}

	return this;
};

/**
 * Copies the Polygon object
 * 
 * @return {object} A copy of the Polygon object (which can be modified without changing the original object)
 */
Polygon.prototype.copy = function () {
	return new Polygon(this.getPoints());
};

/**
 * Fetches all of the polygon's points as Vector2D objects
 * 
 * @return {array} An array containing all the points of the polygon, as Vector2D objects
 */
Polygon.prototype.getPoints = function () {
	var points, i;

	points = [];

	for (i = 0; i < this.points.length; i++) {
		points.push(this.points[i].copy());
	}

	return points;
};

/**
 * Fetches all of the polygon's sides as Line objects.
 * 
 * @return {array} An array containing all of the polygon's sides as Line objects
 */
Polygon.prototype.getLines = function () {
	var lines, points, i, to;

	lines = [];
	points = this.points;

	for (i = 0; i < points.length; i++) {
		to = i === points.length - 1 ? 0 : i + 1;

		lines.push(new Line(points[i], points[to]));
	}

	return lines;
};

/**
 * Checks whether or not the Polygon contains another geometric object.
 * 
 * @param {mixed} object A geometric object to check. Supported objects are: Vector2D, Line, Rectangle and Polygon
 * @return {boolean} True if the Polygon contains the checked object, false if not
 */
Polygon.prototype.contains = function (object) {
	var polRect;

	if (object.implements(Vector2D)) {
		if (this.intersects(new Line().setFromCoordinates(-100000, -100000, object.x, object.y), true) % 2) {
			return true;
		}
		else {
			return false;
		}
	}
	else if (object.implements(Line)) {
		if (!this.intersects(object) && this.contains(object.a)) {
			return true;
		}
		else {
			return false;
		}
	}
	else if (object.implements(Polygon)) {
		if (object.points.length > 0 && !this.intersects(object) && this.contains(object.points[0])) {
			return true;
		}
		else {
			return false;
		}
	}
	else if (object.implements(Rectangle)) {
		polRect = object.getPolygon();
		return this.contains(polRect);
	} else {
		throw new Error('Argument object has to be of type: Vector2D, Line, Rectangle or Polygon');
	}
};

/**
 * Checks whether or not the Polygon intersects with another geometric object.
 * 
 * @param {mixed} object A geometric object to check. Supported objects are: Line and Polygon
 * @return {boolean} True if the Polygon intersects with the checked object, false if not
 */
Polygon.prototype.intersects = function (object, countIntersections) {
	var intersects, intersectionCount, lines, line, oLines, oLine, i, ii, polRect;

	intersects = false;
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
	else if (object.implements(Rectangle)) {
		polRect = object.getPolygon();

		return this.intersects(polRect);
	}
	else {
		throw new Error('Argument object has to be of type: Line, Rectangle or Polygon');
	}

	if (countIntersections) {
		return intersectionCount;
	}
	else {
		return false;
	}
};