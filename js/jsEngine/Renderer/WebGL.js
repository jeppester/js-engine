new Class('Renderer.WebGL', [Lib.MatrixCalculation], {
	WebGL: function (canvas) {
		var gl, options;

		this.canvas = canvas;

		// Cache variables
		this.cache = {
			currentTexture: undefined,
			currentAlpha: undefined,
			textures: {},
			currentResolution: {
				width: 0,
				height: 0,
			}
		};

		this.programs = {};
		this.currentProgram = false;

		// Get gl context
		options = {
			premultipliedAlpha: false,
			alpha: false,
		};
		this.gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
		gl = this.gl;

		// Optimize options
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

		// Set default blending
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);

		// Init shader programs
		this.programs = {
			texture: new Renderer.WebGL.TextureShaderProgram(gl),
			color: new Renderer.WebGL.ColorShaderProgram(gl),
		};
	},

	setProgram: function (program) {
		if (this.currentProgram !== program) {
			var gl;
			gl = this.gl;

			// Set program
			this.currentProgram = program;
			gl.useProgram(program.program);

			// Bind stuff
			program.onSet(gl);

			// Set current resolution var
			gl.uniform2f(
				program.locations.u_resolution,
				this.cache.currentResolution.width,
				this.cache.currentResolution.height
			);

			// Set current alpha
			gl.uniform1f(
				this.currentProgram.locations.u_alpha,
				this.cache.currentAlpha
			);
		}
	},

	render: function (cameras) {
		var camerasLength, roomsLength, i, ii, wm, gl, w, h;

		gl = this.gl;
		camerasLength = cameras.length;

		for (i = 0; i < camerasLength; i ++) {
			camera = cameras[i];

			// Setup camera resolution
			w = camera.captureRegion.width;
			h = camera.captureRegion.height;
			if (this.cache.currentResolution.width !== w || this.cache.currentResolution.height !== h) {
				this.cache.currentResolution.width = w;
				this.cache.currentResolution.height = h;

				if (this.currentProgram) {
					gl.uniform2f(this.currentProgram.locations.u_resolution, w, h);
				}
			}

			// Set camera position
			wm = this.makeTranslation(-camera.captureRegion.x, -camera.captureRegion.y);

			// Set camera projection viewport
			gl.viewport(
				camera.projectionRegion.x,
				camera.projectionRegion.y,
				camera.projectionRegion.width,
				camera.projectionRegion.height
			);

			rooms = [engine.masterRoom, camera.room];
			roomsLength = rooms.length;

			for (ii = 0; ii < roomsLength; ii ++) {
				// Draw rooms
				this.renderTree(rooms[ii], wm);
			}
		}
	},

	renderTree: function(object, wm) {
		var i, len, child, localWm, offset, gl;

		gl = this.gl;
		localWm = this.matrixMultiplyArray([this.calculateLocalMatrix(object), wm]);
		offset = this.makeTranslation(-object.offset.x, -object.offset.y);

		if (!object.isVisible()) {
			return;
		}

		// Set object alpha (because alpha is used by ALL rendered objects)
		if (this.cache.currentAlpha !== object.opacity) {
			this.cache.currentAlpha = object.opacity;

			if (this.currentProgram) {
				gl.uniform1f(this.currentProgram.locations.u_alpha, object.opacity);
			}
		}

		switch (object.renderType) {
			case 'textblock':
				this.setProgram(this.programs.texture);
				if (this.cache.textures[object.bm.oldSrc]) {
					delete this.cache.textures[object.bm.oldSrc];
				}
				this.renderSprite(object, this.matrixMultiply(offset, localWm));
				break;
			case 'sprite':
				this.setProgram(this.programs.texture);
				this.renderSprite(object, this.matrixMultiply(offset, localWm));
				break;
			case 'line':
				this.setProgram(this.programs.color);
				this.renderLine(object, this.matrixMultiply(offset, localWm));
				break;
		}

		if (object.children) {
			len = object.children.length;
			for (i = 0; i < len; i ++) {
				this.renderTree(object.children[i], localWm);
			}
		}
	},

	renderSprite: function(object, wm) {
		var gl, t, l;

		gl = this.gl;
		l = this.currentProgram.locations;

		// Bind the texture (if it is not already the binded)
		t = this.getSpriteTexture(object);
		if (this.cache.currentTexture !== t) {
			this.cache.currentTexture = t;

			// Set the correct texture coordinate buffer
			if (object.imageLength === 1) {
				this.currentProgram.setRegularTextCoordBuffer(gl);
			}
			else {
				// Set the right sub image
				if (engine.gameTime - object.animationLastSwitch > 1000 / object.animationSpeed) {
					object.imageNumber = object.imageNumber + (object.animationSpeed > 0 ? 1 : -1);

					object.animationLastSwitch = engine.gameTime;

					if (object.imageNumber === object.imageLength) {
						object.imageNumber = object.animationLoops ? 0 : object.imageLength - 1;
					}
					else if (object.imageNumber === -1) {
						object.imageNumber = object.animationLoops ? object.imageLength - 1 : 0;
					}
				}

				// Set create and set texture coordinate buffer for the object
				this.currentProgram.setAnimatedTextCoordBuffer(gl, object);
			}

			// Set a rectangle the same size as the image
			gl.bindTexture(gl.TEXTURE_2D, t);
			this.setPlane(gl, 0, 0, object.clipWidth, object.clipHeight);
		}

		// Set matrix
		gl.uniformMatrix3fv(l.u_matrix, false, wm);

		// Draw the rectangle.
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	},

	getSpriteTexture: function (object) {
		return this.cache.textures[object.bm.src] || this.createSpriteTexture(object.bm);
	},

	createSpriteTexture: function (image) {
		var gl, texture;

		gl = this.gl;

		// Create a texture.
		texture = gl.createTexture();

		// Bind the texture
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Upload the image into the texture.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

		// Set texture wrapping
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		if (image.imageLength === 1) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
		else {
			// gl.NEAREST is better for drawing a part of an image
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		}

		gl.bindTexture(gl.TEXTURE_2D, null);
		this.cache.textures[image.src] = texture;

		return texture;
	},

	renderLine: function (object, wm) {
		var gl, l, len, coords, color, a, b, c;

		gl = this.gl;
		l = this.currentProgram.locations;

		if (object.strokeStyle.length === 4) {
			color = object.strokeStyle;
			a = color.substr(1,1);
			b = color.substr(2,1);
			c = color.substr(3,1);
			color = parseInt("0x" + a + a + b + b + c + c);
		}
		else {
			color = parseInt("0x" + object.strokeStyle.substr(1, 6));
		}

		// Set color
		// !!Use white for now!!
		gl.uniform1i(l.u_color, color);

		// Set geometry
		coords = object.createPolygonFromWidth(object.lineWidth).getCoordinates();
		this.setConvexPolygon(gl, coords);

		// Set matrix
		gl.uniformMatrix3fv(l.u_matrix, false, wm);

		// Draw
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	},

	setPlane: function(gl, x, y, width, height) {
		var x1 = x;
		var x2 = x + width;
		var y1 = y;
		var y2 = y + height;

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			x1, y1,
			x2, y1,
			x1, y2,
			x1, y2,
			x2, y1,
			x2, y2]), gl.STATIC_DRAW);
	},

	setConvexPolygon: function(gl, coords) {
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
	}
});
