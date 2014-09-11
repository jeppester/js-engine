nameSpace('Renderer.WebGL');

Renderer.WebGL.TextureShaderProgram = function (gl) {
	var initShaders, initBuffers, program, locations;

	// Init program
	this.cache = {
		regularTextCoordBuffer: false,
		animatedTextCoordBuffer: false,
		rectangleCornerBuffer: false,
		currentBuffer: false,
		currentTexture: undefined,
		textures: {},
	};

	this.program = gl.createProgram();

	this.initShaders(gl);
	this.bindLocations(gl);
	this.initBuffers(gl);
};

Renderer.WebGL.TextureShaderProgram.prototype.import(Mixin.WebGLHelpers);

Renderer.WebGL.TextureShaderProgram.prototype.import(/** @lends Renderer.WebGL.TextureShaderProgram.prototype */ {


	initShaders: function (gl) {
		var vertexCode, fragmentCode, vertexShader, fragmentShader;

		// Vertex shader
		vertexCode = '\
			attribute vec2 a_position;\
			attribute vec2 a_texCoord;\
			\
			uniform vec2 u_resolution;\
			uniform mat3 u_matrix;\
			\
			varying vec2 v_texCoord;\
			\
			void main() {\
				vec2 position = (u_matrix * vec3(a_position, 1)).xy;\
				vec2 zeroToOne = position / u_resolution;\
				vec2 zeroToTwo = zeroToOne * 2.0;\
				vec2 clipSpace = zeroToTwo - 1.0;\
				\
				gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);\
				\
				v_texCoord = a_texCoord;\
			}';
		vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vertexCode);
		gl.compileShader(vertexShader);
		gl.attachShader(this.program, vertexShader);

		// Fragment shader
		fragmentCode = '\
			precision mediump float;\
			\
			uniform sampler2D u_image;\
			varying vec2 v_texCoord;\
			uniform float u_alpha;\
			\
			void main() {\
				vec4 textureColor = texture2D(u_image, v_texCoord);\
				gl_FragColor = vec4(textureColor.rgb, textureColor.a * u_alpha);\
			}';
		fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, fragmentCode);
		gl.compileShader(fragmentShader);
		gl.attachShader(this.program, fragmentShader);

		gl.linkProgram(this.program);
	},

	bindLocations: function (gl) {
		this.locations = {
			a_texCoord:		gl.getAttribLocation(this.program, "a_texCoord"),
			a_position:		gl.getAttribLocation(this.program, "a_position"),
			u_resolution:	gl.getUniformLocation(this.program, "u_resolution"),
			u_matrix:		gl.getUniformLocation(this.program, "u_matrix"),
			u_alpha:		gl.getUniformLocation(this.program, "u_alpha")
		};
	},

	initBuffers: function (gl) {
		// Regular texture coordinate buffer (the coordinates are always the same)
		this.cache.regularTextCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.cache.regularTextCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			0.0,  0.0,
			1.0,  0.0,
			0.0,  1.0,
			0.0,  1.0,
			1.0,  0.0,
			1.0,  1.0]), gl.STATIC_DRAW);

		// Animated texture coordinate (the coordinates will be unique for each draw)
		this.cache.animatedTextCoordBuffer = gl.createBuffer();

		// Rectangle corner buffer
		this.cache.rectangleCornerBuffer = gl.createBuffer();
	},

	// Use the same texture coordinate buffer for all non-animated sprites
	setRegularTextCoordBuffer: function (gl) {
		// Enable the texture coord buffer
		if (this.cache.currentBuffer !== this.cache.regularTextCoordBuffer) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.cache.regularTextCoordBuffer);
			gl.enableVertexAttribArray(this.locations.a_texCoord);
			gl.vertexAttribPointer(this.locations.a_texCoord, 2, gl.FLOAT, false, 0, 0);

			this.cache.currentBuffer = this.cache.regularTextCoordBuffer;

			// Bind rectangle corner buffer again (when needed instead of all the time)
			gl.bindBuffer(gl.ARRAY_BUFFER, this.cache.rectangleCornerBuffer);
		}
	},

	// Set a texture coordinate buffer for a specific animated object
	setAnimatedTextCoordBuffer: function (gl, object) {
		var x1, x2, y1, y2;

		x1 = (object.clipWidth + object.bm.spacing) * object.imageNumber;
		x2 = x1 + object.clipWidth;

		x1 /= object.bm.width;
		x2 /= object.bm.width;

		y1 = 0;
		y2 = 1;

		// Enable the texture coord buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.cache.animatedTextCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			x1, y1,
			x2, y1,
			x1, y2,
			x1, y2,
			x2, y1,
			x2, y2]), gl.STATIC_DRAW);

		gl.enableVertexAttribArray(this.locations.a_texCoord);
		gl.vertexAttribPointer(this.locations.a_texCoord, 2, gl.FLOAT, false, 0, 0);

		this.cache.currentBuffer = this.cache.animatedTextCoordBuffer;

		// Bind rectangle corner buffer again (when needed instead of all the time)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.cache.rectangleCornerBuffer);
	},

	// When returning to the program reset the buffer
	onSet: function (gl) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.cache.rectangleCornerBuffer);
		gl.enableVertexAttribArray(this.locations.a_position);
		gl.vertexAttribPointer(this.locations.a_position, 2, gl.FLOAT, false, 0, 0);
	},

	// Draw functions
	renderSprite: function(gl, object, wm) {
		var t, l;

		l = this.locations;

		if (object.renderType === 'textblock' && this.cache.textures[object.bm.oldSrc]) {
			delete this.cache.textures[object.bm.oldSrc];
		}

		// Bind the texture (if it is not already the binded)
		t = this.getSpriteTexture(gl, object);
		if (this.cache.currentTexture !== t) {
			this.cache.currentTexture = t;

			// Set the correct texture coordinate buffer
			if (object.imageLength === 1) {
				this.setRegularTextCoordBuffer(gl);
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
				this.setAnimatedTextCoordBuffer(gl, object);
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

	getSpriteTexture: function (gl, object) {
		return this.cache.textures[object.bm.src] || this.createSpriteTexture(gl, object.bm);
	},

	createSpriteTexture: function (gl, image) {
		var texture;

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
});
