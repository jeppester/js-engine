jseCreateClass('Vector2D', [Animation]);

Vector2D.prototype.vector2D = function (x, y) {
	this.set(x, y);
};

Vector2D.prototype.set = function (x, y) {
	this.x = x !== undefined ? x : 0;
	this.y = y !== undefined ? y : 0;
}

Vector2D.prototype.setFromDirection = function (direction, length) {
	if (typeof direction !== 'number') {throw new Error('Argument direction should be of type: Number'); }
	if (typeof length !== 'number') {throw new Error('Argument length should be of type: Number'); }

	this.x = Math.cos(direction) * length;
	this.y = Math.sin(direction) * length;

	return this;
};

Vector2D.prototype.copy = function () {
	return new Vector2D(this.x, this.y);
};

Vector2D.prototype.move = function (x, y) {
	if (typeof x !== 'number') {throw new Error('Argument x should be of type: Number'); }
	if (typeof y !== 'number') {throw new Error('Argument y should be of type: Number'); }

	this.x += x;
	this.y += y;

	return this;
};

Vector2D.prototype.rotate = function (dir) {
	if (typeof dir !== 'number') {throw new Error('Argument dir should be of type: Number'); }

	this.setFromDirection(this.getDirection() + dir, this.getLength());

	return this;
};

Vector2D.prototype.scale = function (factor) {
	if (typeof factor !== 'number') {throw new Error('Argument factor should be of type Number'); }
	
	this.x *= factor;
	this.y *= factor;

	return this;
};

Vector2D.prototype.add = function (vector) {
	if (Vector2D.prototype.isPrototypeOf(vector)) {
		this.x += vector.x;
		this.y += vector.y;
	}
	else if (typeof vector === 'number') {
		this.x += vector;
		this.y += vector;
	}
	else {
		throw new Error('Argument vector should be of type Vector2D or Number');
	}

	return this;
};

Vector2D.prototype.subtract = function (vector) {
	if (Vector2D.prototype.isPrototypeOf(vector)) {
		this.x -= vector.x;
		this.y -= vector.y;
	}
	else if (typeof vector === 'number') {
		this.x -= vector;
		this.y -= vector;
	}
	else {
		throw new Error('Argument vector should be of type Vector2D or Number');
	}

	return this;
};

Vector2D.prototype.divide = function (vector) {
	if (Vector2D.prototype.isPrototypeOf(vector)) {
		this.x /= vector;
		this.y /= vector;
	}
	else if (typeof vector === 'number') {
		this.x /= vector;
		this.y /= vector;
	}
	else {
		throw new Error('Argument vector should be of type Vector2D or Number');
	}

	return this;
};

Vector2D.prototype.multiply = function (vector) {
	if (!Vector2D.prototype.isPrototypeOf(vector)) {throw new Error('Argument vector should be of type Vector2D'); }

	this.x *= vector.x;
	this.y *= vector.y;

	return this;
};

Vector2D.prototype.getScalar = function (vector) {
	if (!Vector2D.prototype.isPrototypeOf(vector)) {throw new Error('Argument vector should be of type: Vector2D'); }

	return this.x * vector.x + this.y * vector.y;
};

Vector2D.prototype.getLength = function () {
	return Math.sqrt(this.getScalar(this));
};

Vector2D.prototype.getDirection = function () {
	return Math.atan2(this.y, this.x);
};