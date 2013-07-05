/**
 * Collidable:
 * A class with functions for collisionschecking.
 * Can check both for precise (bitmap-based) collisions and bounding box collisions
 */

NewClass('Collidable', [Sprite]);

/**
 * The constructor for the Collidable class
 * 
 * @param {string} source A resource string for the sprite of the created object.
 * @param {number} x The x-position of the created object.
 * @param {number} y The y-position of the created object.
 * @param {number} dir The direction of the created object. Defaults to 0
 * @param {object} additionalProperties An object containing key-value pairs that will be set as properties for the created object. Can be used for setting advanced options such as sprite offset and opacity.
 */
Collidable.prototype.Collidable = function (source, x, y, dir, additionalProperties) {
	this.Sprite(source, x, y, dir, additionalProperties);

	this.mask = this.mask ? this.mask : loader.getMask(source, this.getTheme());
	this.collisionResolution = this.collisionResolution ? this.collisionResolution : engine.defaultCollisionResolution;
};

/**
 * Checks for a collision with other objects' rotated BBoxes. The word polygon is used because the check is actually done by using the Polygon object.
 * 
 * @param {mixed} objects Target object, or array of target objects
 * @param {boolean} getCollidingObjects Whether or not to return an array of colliding objects (is slower because the check cannot stop when a single collission has been detected)
 * @return {mixed} If getCollidingObjects is set to true, an array of colliding object, else a boolean representing whether or not a collission was detected.
 */
Collidable.prototype.boundingBoxCollidesWith = function (objects, getCollidingObjects) {
	if (objects === undefined) {throw new Error('Missing argument: objects'); }
	if (!Array.prototype.isPrototypeOf(objects)) {
		objects = [objects];
	}

	getCollidingObjects = getCollidingObjects !== undefined ? getCollidingObjects : false;

	var pol1, pol2, i, collidingObjects, obj;

	pol1 = this.mask.bBox.copy().move(this.mask.width / 2 - this.offset.x, this.mask.height / 2 - this.offset.y).scale(this.size * this.widthModifier, this.size * this.heightModifier).rotate(this.dir).add(this.getRoomPosition());

	collidingObjects = [];
	for (i = 0; i < objects.length; i++) {
		obj = objects[i];

		pol2 = obj.mask.bBox.copy().move(obj.mask.width / 2 - obj.offset.x, obj.mask.height / 2 - obj.offset.y).scale(obj.size * obj.widthModifier, obj.size * obj.heightModifier).rotate(obj.dir).add(obj.getRoomPosition());

		// Find out if the two objects' bounding boxes intersect
		// If not, check if one of the points of each object is inside the other's polygon. This will ensure that one of the objects does not contain the other
		if (pol1.intersects(pol2) || pol1.contains(pol2.points[0]) || pol2.contains(pol1.points[0])) {
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

/**
 * Checks for a mask based collisions with other Collidable objects.
 * 
 * @param {mixed} objects Target object, or array of target objects
 * @param {boolean} getCollisionPosition If true, the function returns an object representing the position of the detected collision. Defaults to false
 * @return {mixed} If getCollisionPosition is false, a boolean representing whether or not a collision was detected, else an object of the following type:
 * 	<code>{
 * 		"x": [The average horisontal distance from the Collidable to the detected collision],
 * 		"y": [The average vertical distance from the Collidable to the detected collision],
 * 		"direction": [The average direction from the Collidable to the detected collision]
 * 	}</code>
 */
Collidable.prototype.maskCollidesWith = function (objects, getCollisionPosition) {
	if (objects === undefined) {throw new Error('Missing argument: objects'); }
	var canvas, mask, ctx, roomPos, obj, bitmap, i, data, length, pixel, pxArr, x, y, avX, avY, avDist, avDir;

	if (!Array.prototype.isPrototypeOf(objects)) {
		objects = [objects];
	}
	getCollisionPosition = getCollisionPosition !== undefined ? getCollisionPosition : false;

 	// Get mask from loader object
	mask = this.mask;

	// Create a new canvas for checking for a collision
	canvas = document.createElement('canvas');
	canvas.width = Math.ceil(this.width);
	canvas.height = Math.ceil(this.height);

	// Add canvas for debugging
	/*if (document.getElementById('colCanvas')) {
		document.body.removeChild(document.getElementById('colCanvas'));
	}
	document.body.appendChild(canvas);*/

	canvas.id = 'colCanvas';

	ctx = canvas.getContext('2d');

	ctx.fillStyle = "#FFF";

	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.save();

	ctx.scale(1 / (this.size * this.widthModifier), 1 / (this.size * this.heightModifier));
	ctx.translate(this.offset.x * this.size * this.widthModifier, this.offset.y * this.size * this.heightModifier);
	ctx.rotate(-this.dir);

	// Draw other objects
	roomPos = this.getRoomPosition();
	for (i = 0; i < objects.length; i++) {
		obj = objects[i];

		// If the checked object is "this", do nothing (this situation should maybe result in an error)
		if (obj === this) {continue; }

		ctx.translate(obj.x - roomPos.x, obj.y - roomPos.y);
		ctx.scale(obj.widthModifier * obj.size, obj.heightModifier * obj.size);
		ctx.rotate(obj.dir);

		ctx.drawImage(
			obj.mask,

			// Define image cutout
			(obj.width + obj.bm.spacing) * obj.imageNumber,
			0,
			obj.width,
			obj.height,

			// Define position and width on canvas
			- obj.offset.x,
			- obj.offset.y,
			obj.width,
			obj.height
		);

		ctx.rotate(-obj.dir);
		ctx.scale(1 / (obj.widthModifier * obj.size), 1 / (obj.heightModifier * obj.size));
		ctx.translate(roomPos.x - obj.x, roomPos.y - obj.y);
	}

	ctx.restore();
	ctx.globalAlpha = 0.5;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.translate(canvas.width / 2, canvas.height / 2);

	// Draw checked object
	ctx.drawImage(
		mask,

		// Define image cutout
		(this.width + this.bm.spacing) * this.imageNumber,
		0,
		this.width,
		this.height,

		// Define position and width on canvas
		-this.width / 2,
		-this.height / 2,
		this.width,
		this.height
	);
	
	bitmap = ctx.getImageData(0, 0, canvas.width, canvas.height);
	data = bitmap.data;
	length = data.length / 4;

	pxArr = [];

	for (pixel = 0; pixel < length; pixel += this.collisionResolution) {
		if (data[pixel * 4] < 127) {
			if (getCollisionPosition) {
				y = Math.floor(pixel / bitmap.width);
				x = pixel - y * bitmap.width;

				pxArr.push({
					x: x,
					y: y
				});
			}
			else {
				return true;
			}
		}
	}

	if (pxArr.length > 0) {
		// Find the collision pixel's mean value
		pxArr = pxArr.sortByNumericProperty('x');
		avX = (pxArr[0].x + pxArr[pxArr.length - 1].x) / 2;

		pxArr = pxArr.sortByNumericProperty('y');
		avY = (pxArr[0].y + pxArr[pxArr.length - 1].y) / 2;

		// Translate the position according to the object's sprite offset
		avX -= this.offset.x;
		avY -= this.offset.y;

		// Scale the position according to the object's size modifiers
		avX /= this.size * this.widthModifier;
		avY /= this.size * this.heightModifier;

		// Rotate the position according to the object's direction
		avDir = Math.atan2(avY, avX);
		avDist = Math.sqrt(Math.pow(avX, 2) + Math.pow(avY, 2));

		avDir += this.dir;
		avX = Math.cos(avDir) * avDist;
		avY = Math.sin(avDir) * avDist;

		return {x: avX, y: avY, direction: avDir};
	}

	return false;
 };


/**
 * A "metafunction" for checking if the Collidable collides with another object of the same type.
 * This function uses boundingBoxCollidesWith for narrowing down the number of objects to check, then uses maskCollidesWith for doing a precise collision check on the remaining objects.
 * 
 * @param {mixed} objects Target object, or array of target objects
 * @param {boolean} getCollisionPosition If true, the function returns an object representing the position of the detected collision. Defaults to false
 * @param {boolean} getCollidingObjects If true, the function returns all colliding objects
 * @return {mixed} If not getCollisionPosition or getCollidingObjects is true, a boolean representing wether or not a collision was detected. If getCollisionPosition and or getCollidingObjects is true, returns an object of the following type:
 * 	<code>{
 * 		"objects": [Array of colliding objects],
 * 		"positions": [Array of collision positions]
 * 	}</code>
 * If getCollidingObjects is false, the objects-array will be empty and the positions-array will only contain one position which is the average collision position for all colliding objects.
 * If getCollisionPosition is false, the positions-array will be empty
 * If both getCollisionPosition and getCollidingObjects are true, the objects-array will contain all colliding objects, and the positions-array will contain each colliding object's collision position
 */
Collidable.prototype.collidesWith = function (objects, getCollisionPosition, getCollidingObjects) {
	if (objects === undefined) {throw new Error('Missing argument: objects'); }
	var ret, i, position;

	if (!Array.prototype.isPrototypeOf(objects)) {
		objects = [objects];
	}

	getCollidingObjects = getCollidingObjects !== undefined ? getCollidingObjects : false;

	if (this.size === 0 || this.widthModifier === 0 || this.heightModifier === 0) {
		return false;
	}

	// First, do a bounding box based collision check
	objects = this.boundingBoxCollidesWith(objects, true);
	
	if (objects === false) {
		return false;
	}
	
	// If a bounding box collision is detected, do a precise collision check with maskCollidesWith
	// If getCollisionPosition and getCollidingObjects are both false, just return a boolean
	if (!getCollisionPosition && !getCollidingObjects) {
		return this.maskCollidesWith(objects);
	}
	else {
		// Create an object to return
		ret = {
			objects: [],
			positions: []
		};

		// If getCollidingObjects is false, only getCollisionPosition is true. Therefore return an average position of all checked objects
		if (getCollidingObjects === false) {
			position = this.maskCollidesWith(objects, true);
			if (position) {
				ret.positions.push(position);
			}
		}
		else {
			// If both getCollidingObjects and getCollisionPosition is true, both return an array of objects and positions (this is very slow)
			if (getCollisionPosition) {
				for (i = 0; i < objects.length; i ++) {
					position = this.maskCollidesWith(objects[i], true);

					if (position) {
						ret.objects.push(objects[i]);
						ret.positions.push(position);
					}
				}
			}
			// If only getCollidingObjects is true, return an array of colliding objects
			else {
				for (i = 0; i < objects.length; i ++) {
					if (this.maskCollidesWith(objects[i])) {
						ret.objects.push(objects[i]);
					}
				}
			}
		}
	}
	if (ret.positions.length + ret.objects.length !== 0) {
		return ret;
	}
	else {
		return false;
	}
};

/**
 * Draws the collidable object's bounding box to the arena. Use engine option "drawBoundingBoxes" to draw all BBoxes.
 * 
 * @private
 * @param {object} c A canvas 2D context on which to draw the bbox
 */
Collidable.prototype.drawBoundingBox = function (c, cameraOffset) {
	var pol;

	pol = this.mask.bBox.copy().move(this.mask.width / 2 - this.offset.x, this.mask.height / 2 - this.offset.y).scale(this.size * this.widthModifier, this.size * this.heightModifier).rotate(this.dir);

	c.save();
	c.strokeStyle = "#0F0";
	c.translate(this.x - cameraOffset.x, this.y - cameraOffset.y);

	c.beginPath();
	c.moveTo(pol.points[0].x, pol.points[0].y);
	c.lineTo(pol.points[1].x, pol.points[1].y);
	c.lineTo(pol.points[2].x, pol.points[2].y);
	c.lineTo(pol.points[3].x, pol.points[3].y);
	c.closePath();
	c.stroke();

	c.restore();
};

/**
 * Draws the object's collision mask to the arena. Use engine option "drawMasks" to draw all masks.
 * 
 * @private
 * @param {object} c A canvas 2D context on which to draw the mask
 */
Collidable.prototype.drawMask = function (c, cameraOffset) {
	// Draw Sprite on canvas
	var mask;

	if (this.mask) {
		mask = this.mask;
	}
	else {
		return;
	}

	c.save();
	c.translate(this.x - cameraOffset.x, this.y - cameraOffset.y);
	c.rotate(this.dir);
	c.scale(this.widthModifier * this.size, this.heightModifier * this.size);

	try {
		c.drawImage(
			this.mask,

			(this.width + this.bm.spacing) * this.imageNumber,
			0,
			this.width,
			this.height,

			- this.offset.x,
			- this.offset.y,
			this.width,
			this.height);
	} catch (e) {
		console.log(this.source);
		console.log(this.bm);
		engine.stopMainLoop();
		throw new Error(e);
	}

	c.restore();
};