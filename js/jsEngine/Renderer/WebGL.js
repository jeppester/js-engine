new Class('Renderer.WebGL', {
	WebGL: function (canvas) {
		var gl, options;

		// Cache variables
		this.cache = {
			textures: [],
		}

		options = {alpha: false};
		this.gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
		gl = this.gl;

		// Optimize options
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

		// Create shaders
		this.initShaders();

		// Set default blending
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);

		// Init program
		this.program = gl.createProgram();
		gl.attachShader(this.program, this.vertexShader);
		gl.attachShader(this.program, this.fragmentShader);
		gl.linkProgram(this.program);
		gl.useProgram(this.program);
	},

	initShaders: function () {
		var gl, vertex, fragment;

		gl = this.gl;

		// Vertex shader
		vertex   = engine.loadFileContent(engine.enginePath + '/Renderer/WebGL/VertexShader.vert.js');
		this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(this.vertexShader, vertex);
		gl.compileShader(this.vertexShader);

		// Fragment shader
		fragment = engine.loadFileContent(engine.enginePath + '/Renderer/WebGL/FragmentShader.frag.js');
		this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(this.fragmentShader, fragment);
		gl.compileShader(this.fragmentShader);
	},

	render: function (object) {
		this.renderTree(object, this.makeIdentity());
	},

	renderTree: function(object, wm) {
		var i, len, child, localWm;

		localWm = this.matrixMultiplyArray([this.calculateLocalMatrix(object), wm]);

		if (!object.isVisible()) {
			return;
		}

		switch (object.renderType) {
			case 'sprite':
				this.renderSprite(object, localWm);
				engine.drawCalls ++; //dev
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
		var gl = this.gl;

		// look up where the vertex data needs to go.
		var positionLocation = gl.getAttribLocation(this.program, "a_position");
		var texCoordLocation = gl.getAttribLocation(this.program, "a_texCoord");

		// provide texture coordinates for the rectangle.
		var texCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		    0.0,  0.0,
		    1.0,  0.0,
		    0.0,  1.0,
		    0.0,  1.0,
		    1.0,  0.0,
		    1.0,  1.0]), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(texCoordLocation);
		gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

		// Bind the texture
		gl.bindTexture(gl.TEXTURE_2D, this.getSpriteTexture(object));

		// lookup uniforms
		var resolutionLocation = gl.getUniformLocation(this.program, "u_resolution");

		// set the resolution
		gl.uniform2f(resolutionLocation, engine.canvas.width, engine.canvas.height);

		// Create a buffer for the position of the rectangle corners.
		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

		// Set a rectangle the same size as the image.
		this.setPlane(gl, 0, 0, object.bm.width, object.bm.height);

		// Set matrix
		gl.uniformMatrix3fv(gl.getUniformLocation(this.program, "u_matrix"), false, wm);

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

		// Set the parameters so we can render any size image.
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		gl.bindTexture(gl.TEXTURE_2D, null);
		this.cache.textures[image.src] = texture;

		return texture;
	},

	calculateLocalMatrix: function (object) {
	    var origin, scale, rotation, position;

	    origin   = this.makeTranslation(-object.offset.x, -object.offset.y);
	    scale    = this.makeScale(object.widthScale, object.heightScale);
	    rotation = this.makeRotation(object.direction);
	    position = this.makeTranslation(object.x, object.y);

	    return this.matrixMultiplyArray([origin, scale, rotation, position]);
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

	makeRotation: function(angleInRadians) {
		var c = Math.cos(angleInRadians);
		var s = Math.sin(angleInRadians);
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
			a20 * b02 + a21 * b12 + a22 * b22,
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