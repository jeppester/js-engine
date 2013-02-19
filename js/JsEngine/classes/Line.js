/*
Line:
A math object which is used for handling lines
*/

jseCreateClass('Line');

Line.prototype.line = function (startVector, endVector) {
	startVector = startVector !== undefined ? startVector : new Vector2D(0, 0);
	endVector = endVector !== undefined ? endVector : new Vector2D(0, 0);
	
	this.setFromVectors(startVector, endVector);
};

Line.prototype.setFromVectors = function (startVector, endVector) {
	if (!Vector2D.prototype.isPrototypeOf(startVector)) {throw new Error('Agument startVector should be of type: Vector2D'); }
	if (!Vector2D.prototype.isPrototypeOf(endVector)) {throw new Error('Agument endVector should be of type: Vector2D'); }

	this.a = startVector;
	this.b = endVector;
}

Line.prototype.setFromCoordinates = function (x1, y1, x2, y2) {
	x1 = x1 !== undefined ? x1 : 0;
	y1 = y1 !== undefined ? y1 : 0;
	x2 = x2 !== undefined ? x2 : 0;
	y2 = y2 !== undefined ? y2 : 0;

	this.a = new Vector2D(x1, y1);
	this.b = new Vector2D(x2, y2);

	return this;
}

Line.prototype.copy = function () {
	return new Line(this.a, this.b);
};

Line.prototype.move = function (moveX, moveY) {
	this.a.move(moveX, moveY);
	this.b.move(moveX, moveY);

	return this;
}

Line.prototype.rotate = function (dir) {
	if (typeof dir !== 'number') {throw new Error('Argument dir should be of type: Number'); }

	this.a.rotate(dir);
	this.b.rotate(dir);

	return this;
};

Line.prototype.scale = function (factor) {
	if (typeof factor !== 'number') {throw new Error('Argument factor should be of type: Number'); }
	
	this.a.scale(factor);
	this.b.scale(factor);

	return this;
}

Line.prototype.add = function (vector) {
	this.a.add(vector);
	this.b.add(vector);

	return this;
}

Line.prototype.subtract = function (vector) {
	this.a.substract(vector);
	this.b.substract(vector);

	return this;
};

Line.prototype.divide = function (vector) {
	this.a.divide(vector);
	this.b.divide(vector);

	return this;
};

Line.prototype.multiply = function (vector) {
	this.a.multiply(vector);
	this.b.multiply(vector);

	return this;
};

Line.prototype.intersects = function (object) {
	if (Line.prototype.isPrototypeOf(object)) {
		var c1, c2;

		c1 = (this.b.x - this.a.x) * (object.a.y - this.b.y) - (object.a.x - this.b.x) * (this.b.y - this.a.y);
		c2 = (this.b.x - this.a.x) * (object.b.y - this.b.y) - (object.b.x - this.b.x) * (this.b.y - this.a.y);

		if (c1 * c2 > 0) {return false; }

		c1 = (object.b.x - object.a.x) * (this.a.y - object.b.y) - (this.a.x - object.b.x) * (object.b.y - object.a.y);
		c2 = (object.b.x - object.a.x) * (this.b.y - object.b.y) - (this.b.x - object.b.x) * (object.b.y - object.a.y);

		return c1 * c2 < 0;
	}
	else if (Polygon.prototype.isPrototypeOf(object)) {
		return object.intersects(this);
	}
	else {
		throw new Error('Agument object should be of type: Line or Polygon');
	}
};

Line.prototype.getLength = function () {
	return this.b.subtract(a).getLength();
}