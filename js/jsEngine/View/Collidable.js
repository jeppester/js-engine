new Class('View.Collidable', [View.Sprite], {
	/**
	 * The constructor for the Collidable class
	 *
     * @name View.Collidable
     * @class A class with functions for collision checking.
     *        Can check both for precise (bitmap-based) collisions and bounding box collisions
	 * @augments View.Sprite
     *
     * @property {HTMLCanvasElement|HTMLImageElement} mask The mask to use for bitmap based collision checking, by default the mask will be autogenerated from the collidable's source
     * @property {int} collisionResolution The space between the checked pixels when checking for bitmap based collisions
     *
     * @param {string} source A resource string for the sprite of the created object.
	 * @param {number} [x=0] The x-position of the created object.
	 * @param {number} [y=0] The y-position of the created object.
	 * @param {number} [direction=0] The direction of the created object. Defaults to 0
	 * @param {object} [additionalProperties] An object containing key-value pairs that will be set as properties for the created object. Can be used for setting advanced options such as sprite offset and opacity.
	 */
	Collidable: function (source, x, y, direction, additionalProperties) {
		this.Sprite(source, x, y, direction, additionalProperties);

		this.mask = this.mask ? this.mask : loader.getMask(source, this.getTheme());
		this.collisionResolution = this.collisionResolution ? this.collisionResolution : engine.defaultCollisionResolution;
	},
    /** @scope Collidable */

	/**
	 * Checks for a collision with other objects' rotated BBoxes. The word polygon is used because the check is actually done by using the Polygon object.
	 *
	 * @param {Collidable|Collidable[]} objects Target object, or array of target objects
	 * @param {boolean} getCollidingObjects Whether or not to return an array of colliding objects (is slower because the check cannot stop when a single collission has been detected)
	 * @return {Object[]|boolean} If getCollidingObjects is set to true, an array of colliding object, else a boolean representing whether or not a collission was detected.
	 */
	boundingBoxCollidesWith: function (objects, getCollidingObjects) {
		if (objects === undefined) {throw new Error('Missing argument: objects'); } //dev
		if (!Array.prototype.isPrototypeOf(objects)) {
			objects = [objects];
		}

		getCollidingObjects = getCollidingObjects !== undefined ? getCollidingObjects : false;

		var pol1, pol2, i, collidingObjects, obj;

		pol1 = this.getTransformedBoundingBox();

		collidingObjects = [];
		for (i = 0; i < objects.length; i++) {
			obj = objects[i];

			pol2 = obj.getTransformedBoundingBox();

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
	},


	getTransformedBoundingBox: function () {
		var box, parents, parent, i;

		box = this.mask.bBox.copy().move(-this.offset.x, -this.offset.y);

		parents = this.getParents();
		parents.unshift(this);

		for (i = 0; i < parents.length; i ++) {
			parent = parents[i];

			if (parent.size !== 1 || parent.widthScale !== 1 || parent.heightScale !== 1) {
				box.scale(parent.size * parent.widthScale, parent.size * parent.heightScale);
			}

			if (parent.direction !== 0) {
				box.rotate(parent.direction);
			}

			if (parent.x !== 0 || parent.y !== 0) {
				box.move(parent.x, parent.y);
			}
		}

		return box;
	},

	/**
	 * Checks for a mask based collisions with other Collidable objects.
	 *
	 * @param {View.Collidable|View.Collidable[]} objects Target object, or array of target objects
	 * @param {boolean} getCollisionPosition If true, the function returns an object representing the position of the detected collision. Defaults to false
	 * @return {Object|boolean} If getCollisionPosition is false, a boolean representing whether or not a collision was detected, else an object of the following type:
	 * 	<code>{
	 * 		"x": [The average horizontal distance from the Collidable to the detected collision],
	 * 		"y": [The average vertical distance from the Collidable to the detected collision],
	 * 		"pixelCount": [The number of colliding pixels]
	 * 	}</code>
	 */
	maskCollidesWith: function (objects, getCollisionPosition) {
		if (objects === undefined) {throw new Error('Missing argument: objects'); } //dev
		var bitmap, i, length, pixel, pxArr, x, y, avX, avY, retVector;

		if (!Array.prototype.isPrototypeOf(objects)) {
			objects = [objects];
		}
		getCollisionPosition = getCollisionPosition !== undefined ? getCollisionPosition : false;

	 	bitmap = this.createCollisionBitmap(objects);
		length = bitmap.data.length / 4;

		pxArr = [];
		for (pixel = 0; pixel < length; pixel += this.collisionResolution) {
			// To get better spread of the checked pixels, increase the pixel each time we're on a new line
			x = pixel % bitmap.width;
			if (this.collisionResolution > 1 && x < this.collisionResolution) {
				y = Math.floor(pixel / bitmap.width);
				pixel -= x;
				if (y % 2) {
					pixel += Math.floor(this.collisionResolution / 2);
				}
			}

			// Log the checked pixel
			if (bitmap.data[pixel * 4] < 127) {
				if (getCollisionPosition) {
					if (y === undefined) {
						y = Math.floor(pixel / bitmap.width);
					}
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
			pxArr = pxArr.sort(function (a, b) {
				if (a.x === b.x) {
					return 0;
				}
				else if (a.x > b.x) {
					return 1;
				}
				else {
					return -1;
				}
			});
			avX = (pxArr[0].x + pxArr[pxArr.length - 1].x) / 2;

			pxArr = pxArr.sort(function (a, b) {
				if (a.y === b.y) {
					return 0;
				}
				else if (a.y > b.y) {
					return 1;
				}
				else {
					return -1;
				}
			});
			avY = (pxArr[0].y + pxArr[pxArr.length - 1].y) / 2;

			// Translate the position according to the object's sprite offset
			avX -= this.offset.x;
			avY -= this.offset.y;

			// Scale the position according to the object's size modifiers
			avX /= this.size * this.widthScale;
			avY /= this.size * this.heightScale;

			// Rotate the position according to the object's direction
			retVector = new Math.Vector(avX, avY);
			retVector.rotate(this.direction);

			// Save the number of colliding pixels
			retVector.pixelCount = pxArr.length;

			return retVector;
		}

		return false;
	},

	createCollisionBitmap: function (objects) {
		var obj, canvas, mask, c, parents, i, wm, lm, dt, calc, offset;

			// Get mask from loader object
		mask = this.mask;
		calc = Mixin.MatrixCalculation.prototype;

		// Create a new canvas for checking for a collision
		canvas = document.createElement('canvas');
		canvas.width = Math.ceil(this.clipWidth);
		canvas.height = Math.ceil(this.clipHeight);

		// Add canvas for debugging
		/*canvas.id = 'colCanvas';
		if (document.getElementById('colCanvas')) {
			document.body.removeChild(document.getElementById('colCanvas'));
		}
		document.body.appendChild(canvas);/**/

		c = canvas.getContext('2d');
		c.fillStyle = "#FFF";
		c.fillRect(0, 0, canvas.width, canvas.height);

		parents = this.getParents();
		parents.reverse();
		parents.push(this);
		lm = calc.makeTranslation(-this.offset.x,-this.offset.y);

		// Reset transform to the world matrix
		for (i = 0; i < parents.length; i ++) {
			lm = calc.matrixMultiply(lm, calc.calculateLocalMatrix(parents[i]));
		}

		// Set world matrix to the inverted local matrix of the target object
		wm = calc.matrixInverse(lm);

		// If getInverse returns false, the object is invisible (thus cannot collide)
		if (wm === false) {
			throw new Error('Trying to detect collision for invisble object') // dev
		}

		// Draw other objects
		for (i = 0; i < objects.length; i++) {
			obj = objects[i];

			// If the checked object is "this", do nothing (this situation should maybe result in an error)
			if (obj === this) {continue; }

			// Create local matrix (to add to the world matrix)
			lm = calc.makeIdentity();
			parents = obj.getParents();
			parents.reverse();
			parents.push(obj);
			parents.forEach(function (p) {
				lm = calc.matrixMultiply(lm, calc.calculateLocalMatrix(p));
			})
			offset = calc.matrixMultiply(wm, lm);
			offset = calc.matrixMultiply(calc.makeTranslation(-obj.offset.x,-obj.offset.y), offset);

			// Set world transform
			c.setTransform(offset[0], offset[1], offset[3], offset[4], offset[6], offset[7]);

			// Draw object mask
			c.drawImage(obj.mask, (obj.clipWidth + obj.bm.spacing) * obj.imageNumber, 0, obj.clipWidth, obj.clipHeight, 0, 0, obj.clipWidth, obj.clipHeight);
		}

		// Reset transform
		c.setTransform(1, 0, 0, 1, 0, 0);

		// Draw over other objects to make them semi transparant
		c.globalAlpha = 0.5;
		c.fillRect(0, 0, canvas.width, canvas.height);

		// Draw checked objects mask
		c.drawImage(mask, (this.clipWidth + this.bm.spacing) * this.imageNumber, 0, this.clipWidth, this.clipHeight, 0, 0, this.clipWidth, this.clipHeight);

		// Return collision image data
		return c.getImageData(0, 0, canvas.width, canvas.height);
	},

	/**
	 * A "metafunction" for checking if the Collidable collides with another object of the same type.
	 * This function uses boundingBoxCollidesWith for narrowing down the number of objects to check, then uses maskCollidesWith for doing a precise collision check on the remaining objects.
	 *
	 * @param {View.Collidable|View.Collidable[]} objects Target object, or array of target objects
	 * @param {boolean} getCollisionPosition If true, the function returns an object representing the position of the detected collision. Defaults to false
	 * @param {boolean} getCollidingObjects If true, the function returns all colliding objects
	 * @return {Object|boolean} If not getCollisionPosition or getCollidingObjects is true, a boolean representing whether or not a collision was detected. If getCollisionPosition and or getCollidingObjects is true, returns an object of the following type:
	 * 	                        <code>{
	 * 		                        "objects": [Array of colliding objects],
	 * 		                        "positions": [Array of collision positions for each object]
	 * 		                        "combinedPosition": [The combined position of the collision]
	 * 	                        }</code>
	 *
     *                          If getCollidingObjects is false, the objects-array will be empty and the positions-array will only contain one position which is the average collision position for all colliding objects.
	 *                          If getCollisionPosition is false, the positions-array will be empty
	 *                          If both getCollisionPosition and getCollidingObjects are true, the objects-array will contain all colliding objects, and the positions-array will contain each colliding object's collision position
	 */
	collidesWith: function (objects, getCollisionPosition, getCollidingObjects) {
		if (objects === undefined) {throw new Error('Missing argument: objects'); } //dev
		var ret, i, position;

		if (!Array.prototype.isPrototypeOf(objects)) {
			objects = [objects];
		}

		getCollidingObjects = getCollidingObjects !== undefined ? getCollidingObjects : false;

		if (this.size === 0 || this.widthScale === 0 || this.heightScale === 0) {
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
				positions: [],
				combinedPosition: false
			};

			// If getCollidingObjects is false, only getCollisionPosition is true. Therefore return an average position of all checked objects
			if (getCollidingObjects === false) {
				position = this.maskCollidesWith(objects, true);
				if (position) {
					ret.positions.push(position);

					ret.combinedPosition = position.copy();
					ret.combinedPosition.pixelCount = 0;
				}
			}
			else {
				// If both getCollidingObjects and getCollisionPosition is true, both return an array of objects and positions (this is slower)
				if (getCollisionPosition) {
					for (i = 0; i < objects.length; i ++) {
						position = this.maskCollidesWith(objects[i], true);

						if (position) {
							ret.objects.push(objects[i]);
							ret.positions.push(position);
						}
					}

					// Calculate a combined position
					if (ret.positions.length) {
						ret.combinedPosition = new Math.Vector();
						ret.combinedPosition.pixelCount = 0;
						ret.positions.forEach(function (p) {
							ret.combinedPosition.add(p.scale(p.pixelCount));
							ret.combinedPosition.pixelCount += p.pixelCount;
						});
						ret.combinedPosition.scale(1 / ret.combinedPosition.pixelCount);
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
	},
});