new Class('Renderer.WebGL', {
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
		}

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

		// Init program
		this.program = gl.createProgram();

		// Create shaders
		this.initShaders();

		// Init buffers
		this.initBuffers();

		// Use program
		gl.useProgram(this.program);
	},

	initShaders: function () {
		var gl, vertex, fragment;
		gl = this.gl;


		// Vertex shader
		vertex = '\
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
		this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(this.vertexShader, vertex);
		gl.compileShader(this.vertexShader);
		gl.attachShader(this.program, this.vertexShader);

		// Fragment shader
		fragment = '\
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
		this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(this.fragmentShader, fragment);
		gl.compileShader(this.fragmentShader);
		gl.attachShader(this.program, this.fragmentShader);

		gl.linkProgram(this.program);

		this.locations = {
			a_texCoord:		gl.getAttribLocation(this.program, "a_texCoord"),
			a_position:		gl.getAttribLocation(this.program, "a_position"),
			u_resolution:	gl.getUniformLocation(this.program, "u_resolution"),
			u_matrix:		gl.getUniformLocation(this.program, "u_matrix"),
			u_alpha:		gl.getUniformLocation(this.program, "u_alpha")
		}
	},

	initBuffers: function () {
		var gl;
		gl = this.gl;

		// Text coord buffer
		this.textCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.textCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		    0.0,  0.0,
		    1.0,  0.0,
		    0.0,  1.0,
		    0.0,  1.0,
		    1.0,  0.0,
		    1.0,  1.0]), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(this.locations.a_texCoord);
		gl.vertexAttribPointer(this.locations.a_texCoord, 2, gl.FLOAT, false, 0, 0);

		// Rectangle corner buffer
		this.rectangleCornerBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.rectangleCornerBuffer);
		gl.enableVertexAttribArray(this.locations.a_position);
		gl.vertexAttribPointer(this.locations.a_position, 2, gl.FLOAT, false, 0, 0);
	},

	render: function (cameras) {
		var camerasLength, roomsLength, i, ii, wm, gl, w, h;

		gl = this.gl
		camerasLength = cameras.length;

		for (i = 0; i < camerasLength; i ++) {
			camera = cameras[i];

			// Setup camera resolution
			w = camera.captureRegion.width;
			h = camera.captureRegion.height;
			if (this.cache.currentResolution.width !== w || this.cache.currentResolution.height !== h) {
				this.cache.currentResolution.width = w;
				this.cache.currentResolution.height = w;

				gl.uniform2f(this.locations.u_resolution, w, h);
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
			gl.uniform1f(this.locations.u_alpha, object.opacity);
		}

		switch (object.renderType) {
			case 'textblock':
				if (this.cache.textures[object.bm.oldSrc]) {
					delete this.cache.textures[object.bm.oldSrc];
				}
			case 'sprite':
				this.renderSprite(object, this.matrixMultiply(offset, localWm));
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
		var gl, t;

		gl = this.gl;

		// Bind the texture (if it is not already the binded)
		t = this.getSpriteTexture(object);
		if (this.cache.currentTexture !== t) {
			this.cache.currentTexture = t;

			// Set a rectangle the same size as the image
			gl.bindTexture(gl.TEXTURE_2D, t);
			this.setPlane(gl, 0, 0, object.bm.width, object.bm.height);
		}

		// Set matrix
		gl.uniformMatrix3fv(this.locations.u_matrix, false, wm);

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
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		gl.bindTexture(gl.TEXTURE_2D, null);
		this.cache.textures[image.src] = texture;

		return texture;
	},

	calculateLocalMatrix: function (object) {
	    var origin, scale, rotation, position;

	    scale    = this.makeScale(object.widthScale * object.size, object.heightScale * object.size);
	    rotation = this.makeRotation(-object.direction);
	    position = this.makeTranslation(object.x, object.y);

	    return this.matrixMultiplyArray([scale, rotation, position]);
	},

	makeIdentity: function() {
		return [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		];
	},

	makeTranslation: function(tx, ty) {
		return [
			1, 0, 0,
			0, 1, 0,
			tx, ty, 1
		];
	},

	makeRotation: function(direction) {
		var c = Math.cos(direction);
		var s = Math.sin(direction);
		return [
			c,-s, 0,
			s, c, 0,
			0, 0, 1
		];
	},

	makeScale: function(sx, sy) {
		return [
			sx, 0, 0,
			0, sy, 0,
			0, 0, 1
		];
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

	matrixMultiply: function (a, b) {
		var a00 = a[0*3+0];
		var a01 = a[0*3+1];
		var a02 = a[0*3+2];
		var a10 = a[1*3+0];
		var a11 = a[1*3+1];
		var a12 = a[1*3+2];
		var a20 = a[2*3+0];
		var a21 = a[2*3+1];
		var a22 = a[2*3+2];

		var b00 = b[0*3+0];
		var b01 = b[0*3+1];
		var b02 = b[0*3+2];
		var b10 = b[1*3+0];
		var b11 = b[1*3+1];
		var b12 = b[1*3+2];
		var b20 = b[2*3+0];
		var b21 = b[2*3+1];
		var b22 = b[2*3+2];

		return [
			a00 * b00 + a01 * b10 + a02 * b20,
			a00 * b01 + a01 * b11 + a02 * b21,
			a00 * b02 + a01 * b12 + a02 * b22,

			a10 * b00 + a11 * b10 + a12 * b20,
			a10 * b01 + a11 * b11 + a12 * b21,
			a10 * b02 + a11 * b12 + a12 * b22,

			a20 * b00 + a21 * b10 + a22 * b20,
			a20 * b01 + a21 * b11 + a22 * b21,
			a20 * b02 + a21 * b12 + a22 * b22
		];
	},

	matrixMultiplyArray: function(matrices) {
		var r, i, len;

		r = matrices[0]
		len = matrices.length

		for (i = 1; i < len; i ++) {
			r = this.matrixMultiply(r, matrices[i]);
		}

		return r;
	}
})