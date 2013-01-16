jseCreateClass('Collidable');

Collidable.prototype.collidable = function (maskSource, x, y, dir, additionalProperties) {
	if (maskSource === undefined) {throw new Error('Missing argument: maskSource'); }

	// Load default options
	this.maskSource = maskSource
	this.x = x !== undefined ? x : 0;
	this.y = y !== undefined ? y : 0;
	this.dir = dir !== undefined ? dir : 0;
	this.maskGenerate = false;

	engine.registerObject(this);

	this.bmSize = 1;
	this.opacity = 1;

	// Load additional properties
	this.importProperties(additionalProperties);

	if (!this.refreshMaskSource()) {
		throw new Error('Mask source was not successfully loaded: ' + maskSource);
	}
	
	this.bmWidth = this.mask.width;
	this.bmHeight = this.mask.height;
	this.xOff = this.xOff !== undefined && this.xOff !== 'center' ? this.xOff : this.bmWidth / 2;
	this.yOff = this.yOff !== undefined && this.xOff !== 'center' ? this.yOff : this.bmHeight / 2;

	// Create bounding box
	this.boundingBox = {xOff: - this.xOff, yOff: - this.yOff, width: this.bmWidth, height: this.bmHeight};
};

Collidable.prototype.refreshMaskSource = function () {
	var parent, theme;

	theme = this.theme;

	if (theme === undefined) {
		if (this.parent) {
			parent = this.parent;

			while (theme === undefined) {
				if (parent.theme) {
					theme = parent.theme;
				}
				else {
					if (parent.parent) {
						parent = parent.parent;
					}
					else {
						break;
					}
				}
			}
		}
	}

	this.mask = loader.getImage(this.maskSource, theme);
	return this.mask;
};

Collidable.prototype.setMask = function (ressourceString) {
	this.maskSource = ressourceString;
	this.maskGenerate = false;
	this.refreshMaskSource();
};

Collidable.prototype.generateBoundingBox = function (bitmap, cropWidth) {
	bitmap = bitmap !== undefined ? bitmap : this.mask;
	cropWidth = cropWidth !== undefined ? cropWidth : 0;

	this.boundingBox = {
		xOff: - this.xOff + cropWidth,
		yOff: - this.yOff + cropWidth,
		width: bitmap.width - 2 * cropWidth,
		height: bitmap.height - 2 * cropWidth
	};
};

Collidable.prototype.generateMask = function (ressourceString, alphaLimit) {
	if (ressourceString === undefined) {throw new Error('Missing argument: ressourceString'); }

	this.maskSource = ressourceString;
	this.maskGenerate = true;
	this.maskGenerateAlphaLimit = alphaLimit;
	this.refreshMaskSource();

	alphaLimit = alphaLimit !== undefined ? alphaLimit : 255;

	var canvas, ctx, bitmap, data, lengt, pixel;

	canvas = document.createElement('canvas');
	canvas.width = this.mask.width;
	canvas.height = this.mask.height;
	ctx = canvas.getContext('2d');
	ctx.drawImage(
		this.mask,
		0,
		0,
		this.mask.width,
		this.mask.height
	);

	bitmap = ctx.getImageData(0, 0, canvas.width, canvas.height);
	data = bitmap.data;
	length = data.length / 4;

	for (pixel = 0; pixel < data.length; pixel ++) {
		// If the pixel is partly transparent, make it completely transparent, else make it completely black
		if (data[pixel * 4 + 3] < alphaLimit) {
			data[pixel * 4] = 0; // Red
			data[pixel * 4 + 1] = 0; // Green
			data[pixel * 4 + 2] = 0; // Blue
			data[pixel * 4 + 3] = 0; // Alpha
		}
		else {
			data[pixel * 4] = 0; // Red
			data[pixel * 4 + 1] = 0; // Green
			data[pixel * 4 + 2] = 0; // Blue
			data[pixel * 4 + 3] = 255; // Alpha
		}
	}
	ctx.putImageData(bitmap, 0, 0);

	this.mask = canvas;
};

Collidable.prototype.boundingBoxCollidesWith = function (objects, getCollidingObjects) {
	if (objects === undefined) {throw new Error('Missing argument: objects'); }
	if (!Array.prototype.isPrototypeOf(objects)) {
		objects = [objects];
	}

	getCollidingObjects = getCollidingObjects !== undefined ? getCollidingObjects : false;
	//getCollisionPosition = getCollisionPosition !== undefined ? getCollisionPosition : false;

	var obj, bb1, bb2, i, collideObjects;

	bb1 = {
		x1: this.x + this.boundingBox.xOff,
		x2: this.x + this.boundingBox.xOff + this.boundingBox.width,
		y1: this.y + this.boundingBox.yOff,
		y2: this.y + this.boundingBox.yOff + this.boundingBox.height
	};

	collidingObjects = [];

	for (i = 0; i < objects.length; i++) {
		obj = objects[i];

		bb2 = {
			x1: obj.x + obj.boundingBox.xOff,
			x2: obj.x + obj.boundingBox.xOff + obj.boundingBox.width,
			y1: obj.y + obj.boundingBox.yOff,
			y2: obj.y + obj.boundingBox.yOff + obj.boundingBox.height
		};

		// Find out if the two objects' bounding boxes intersect
		if (bb1.x1 < bb2.x2 &&
			bb1.x2 > bb2.x1 &&

			bb1.y1 < bb2.y2 &&
			bb1.y2 > bb2.y1) {

			if (getCollidingObjects) {
				collidingObjects.push(obj);
			}
			else {
				return true;
			}
		}
	}

	if (collidingObjects.length) {
		return collidingObjects;
	}
	else {
		return false;
	}
};

Collidable.prototype.bitmapCollidesWith = function (objects, resolution, getCollisionPosition, checkBoundingBox) {
	if (objects === undefined) {throw new Error('Missing argument: objects'); }
	if (!Array.prototype.isPrototypeOf(objects)) {
		objects = [objects];
	}

	resolution = resolution !== undefined ? resolution : 1;
	getCollisionPosition = getCollisionPosition !== undefined ? getCollisionPosition : false;
	checkBoundingBox = checkBoundingBox !== undefined ? checkBoundingBox : true;

	var canvas, canvasSize, ctx, obj, bitmap, i, data, length, pixel, pxArr, x, y, sumX, sumY, avX, avY, avDist, avDir;

	if (this.bmSize === 0) {
		return false;
	}

	if (checkBoundingBox) {
		objects = this.boundingBoxCollidesWith(objects, true);
		if (objects === false) {
			return false;
		}
	}

	// Create a new canvas for checking for a collision
	canvas = document.createElement('canvas');
	canvas.width = Math.ceil(this.mask.width * this.bmSize);
	canvas.height = Math.ceil(this.mask.height * this.bmSize);

	ctx = canvas.getContext('2d');
	
	ctx.fillStyle = "#FFF";
	
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 0.5;
	ctx.save();

	// Draw checked object
	ctx.drawImage(
		this.mask,
		0,
		0,
		this.bmWidth * this.bmSize,
		this.bmHeight * this.bmSize
	);
	ctx.translate(this.xOff * this.bmSize, this.yOff * this.bmSize);
	ctx.rotate(-this.dir);

	// Draw other objects
	for (i = 0; i < objects.length; i++) {
		obj = objects[i];

		ctx.translate(obj.x - this.x, obj.y - this.y);
		ctx.rotate(obj.dir);

		ctx.drawImage(
			obj.mask,
			- obj.xOff * obj.bmSize,
			- obj.yOff * obj.bmSize,
			obj.bmWidth * obj.bmSize,
			obj.bmHeight * obj.bmSize
		);

		ctx.translate(this.x - obj.x, this.y - obj.y);
		ctx.rotate(-obj.dir);
	}
	ctx.restore();

	bitmap = ctx.getImageData(0, 0, canvas.width, canvas.height);
	data = bitmap.data;
	length = data.length / 4;

	pxArr = [];

	for (pixel = 0; pixel < length; pixel += resolution) {
		if (data[pixel * 4] < 127) {
			if (getCollisionPosition) {
				y = Math.floor(pixel / bitmap.width);
				x = pixel - y * bitmap.width;

				pxArr.push({
					x: x,
					y: y
				});
				// document.body.appendChild(canvas);
			}
			else {
				return true;
				// document.body.appendChild(canvas);
			}
		}
	}
	
	if (pxArr.length > 0) {
		// Find the collision pixel's mean value
		pxArr = pxArr.sortByNumericProperty('x');
		avX = (pxArr[0].x + pxArr[pxArr.length - 1].x) / 2;
		
		pxArr = pxArr.sortByNumericProperty('y');
		avY = (pxArr[0].y + pxArr[pxArr.length - 1].y) / 2;

		/*console.log(pxArr);
		console.log(avX);
		console.log(avY);

		engine.stopMainLoop();*/
		
		// Translate the position according to the object's sprite offset
		avX -= this.xOff * this.bmSize;
		avY -= this.yOff * this.bmSize;

		// Rotate the position according to the object's direction
		avDir = Math.atan2(avY, avX);
		avDist = Math.sqrt(Math.pow(avX, 2) + Math.pow(avY, 2));
		
		avDir += this.dir;
		avX = Math.cos(avDir) * avDist;
		avY = Math.sin(avDir) * avDist;

		return {x: avX, y: avY, dir: avDir};
	}

	return false;
};