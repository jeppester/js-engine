/*
Polygon:
A math object which is used for handling polygons
*/

jseCreateClass('Polygon');

Polygon.prototype.polygon = function (points) {
	this.setFromPoints(points);
};

Polygon.prototype.setFromPoints = function (points) {
	this.points = points;
};

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

Polygon.prototype.move = function (moveX, moveY) {
	var moveVect, i;

	moveVect = new Vector2D(moveX, moveY);

	for (i = 0; i < this.points.length; i++) {
		this.points[i].add(moveVect);
	}

	return this;
};

Polygon.prototype.rotate = function (dir) {
	var i;

	for (i = 0; i < this.points.length; i++) {
		this.points[i].rotate(dir);
	}

	return this;
};

Polygon.prototype.scale = function (factor) {
	if (typeof factor !== 'number') {throw new Error('Argument factor should be of type Number'); }
	
	var i;

	for (i = 0; i < this.points.length; i++) {
		this.points[i].scale(factor);
	}

	return this;
};

Polygon.prototype.copy = function () {
	return new Polygon(this.getPoints());
};

Polygon.prototype.getPoints = function () {
	var points, i;

	points = [];

	for (i = 0; i < this.points.length; i++) {
		points.push(this.points[i].copy());
	}

	return points;
};

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

Polygon.prototype.intersects = function (object) {
	var intersects, lines, line, oLines, oLine, i, ii;

	intersects = false;

	if (Line.prototype.isPrototypeOf(object)) {
		lines = this.getLines();

		for (i = 0; i < lines.length; i++) {
			line = lines[i];

			if (line.intersects(object)) {
				return true;
			}
		}
	}
	else if (Polygon.prototype.isPrototypeOf(object)) {
		lines = this.getLines();
		oLines = object.getLines();

		for (i = 0; i < lines.length; i++) {
			line = lines[i];

			for (ii = 0; ii < oLines.length; ii++) {
				oLine = oLines[ii];

				if (line.intersects(oLine)) {
					return true;
				}
			}
		}
	}
	else {
		throw new Error('Argument object has to be of type: Line or Polygon');
	}

	return false;
};