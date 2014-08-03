new Class('Renderer.WebGL.ColorShaderProgram', [Lib.WebGLHelpers], {
	ColorShaderProgram: function (gl) {
		var initShaders, initBuffers, program, locations;

		this.program = gl.createProgram();

		this.initShaders(gl);
		this.bindLocations(gl);
		this.initBuffers(gl);

		this.cache = {
			currentBuffer: this.vertexBuffer,
		};
	},

	initShaders: function (gl) {
		var vertexCode, fragmentCode, vertexShader, fragmentShader;

		// Vertex shader
		vertexCode = '\
			attribute vec2 a_position;\
			\
			uniform vec2 u_resolution;\
			uniform mat3 u_matrix;\
			\
			void main() {\
				vec2 position = (u_matrix * vec3(a_position, 1)).xy;\
				vec2 zeroToOne = position / u_resolution;\
				vec2 zeroToTwo = zeroToOne * 2.0;\
				vec2 clipSpace = zeroToTwo - 1.0;\
				\
				gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);\
			}';
		vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vertexCode);
		gl.compileShader(vertexShader);

		// Check that the shader did compile
		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) { // dev
        throw new Error(gl.getShaderInfoLog(vertexShader)); // dev
    } // dev

		gl.attachShader(this.program, vertexShader);

		// Fragment shader
		fragmentCode = '\
			precision mediump float;\
			\
			uniform int u_color;\
			uniform float u_alpha;\
			\
			void main() {\
				float rValue = float(u_color / 256 / 256);\
				float gValue = float(u_color / 256 - int(rValue * 256.0));\
				float bValue = float(u_color - int(rValue * 256.0 * 256.0) - int(gValue * 256.0));\
				gl_FragColor = vec4(rValue / 255.0, gValue / 255.0, bValue / 255.0, u_alpha);\
			}';
		fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, fragmentCode);
		gl.compileShader(fragmentShader);

		// Check that the shader did compile
		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) { // dev
				throw new Error(gl.getShaderInfoLog(fragmentShader)); // dev
		} // dev

		gl.attachShader(this.program, fragmentShader);
		gl.linkProgram(this.program);
	},

	bindLocations: function (gl) {
		this.locations = {
			a_position:		gl.getAttribLocation(this.program, "a_position"),
			u_resolution:	gl.getUniformLocation(this.program, "u_resolution"),
			u_matrix:		gl.getUniformLocation(this.program, "u_matrix"),
			u_color:		gl.getUniformLocation(this.program, "u_color"),
			u_alpha:		gl.getUniformLocation(this.program, "u_alpha"),
		};
	},

	initBuffers: function (gl) {
		// Vertex buffer
		this.vertexBuffer = gl.createBuffer();
	},

	// When returning to the program reset the buffer
	onSet: function (gl) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.enableVertexAttribArray(this.locations.a_position);
		gl.vertexAttribPointer(this.locations.a_position, 2, gl.FLOAT, false, 0, 0);
	},

	// Draw functions
	renderLine: function (gl, object, wm) {
		var l, len, coords, color, a, b, c;

		l = this.locations;

		// If the line is transparent, do nothing
		if (object.strokeStyle === "transparent") {
			return
		}
		else if (object.strokeStyle.length === 4) {
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
		gl.uniform1i(l.u_color, color);

		// Set geometry
		coords = object.createPolygonFromWidth(object.lineWidth, object.lineCap === "square").getCoordinates();
		this.setConvexPolygon(gl, coords);

		// Set matrix
		gl.uniformMatrix3fv(l.u_matrix, false, wm);

		// Draw
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

		// Draw circle line caps (TODO: this should be done together with the line itself to prevent opacity issues)
		if (object.lineCap === "round") {
			this.setCircle(gl, object.a.x, object.a.y, 20, object.lineWidth / 2)
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 20);
			this.setCircle(gl, object.b.x, object.b.y, 20, object.lineWidth / 2)
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 20);
		}
	},

	renderRectangle: function (gl, object, wm) {
		var l;

		l = this.locations;

		// Set matrix (it is the same for both fill and stroke)
		gl.uniformMatrix3fv(l.u_matrix, false, wm);

		// Draw fill
		if (object.fillStyle !== 'transparent') {
			// Set color
			gl.uniform1i(l.u_color, this.colorFromCSSString(object.fillStyle));

			// Set geometry (no need to set x and y as they already in the world matrix)
			this.setPlane(gl, 0, 0, object.width, object.height);

			// Draw
			gl.drawArrays(gl.TRIANGLES, 0, 6);
		}

		// Draw stroke (if not transparent)
		if (object.strokeStyle !== 'transparent') {
			// Set color
			gl.uniform1i(l.u_color, this.colorFromCSSString(object.strokeStyle));

			// Set geometry (no need to set x and y as they already in the world matrix)
			this.setPlaneOutline(gl, 0, 0, object.width, object.height, object.lineWidth);

			// Draw
			gl.drawArrays(gl.TRIANGLES, 0, 24);
		}
	},

	renderCircle: function (gl, object, wm) {
		var l, perimeter, segmentsCount;

		l = this.locations;

		// Set matrix (it is the same for both fill and stroke)
		gl.uniformMatrix3fv(l.u_matrix, false, wm);

		// Device how many segments we want
		if (object.radius < 10) {
			segmentsCount = 12;
		}
		else if (object.radius < 50) {
			segmentsCount = 30;
		}
		else if (object.radius < 100) {
			segmentsCount = 50;
		}
		else {
			segmentsCount = 80;
		}

		// Draw fill
		if (object.fillStyle !== 'transparent') {
			// Set color
			gl.uniform1i(l.u_color, this.colorFromCSSString(object.fillStyle));

			// Set geometry (no need to set x and y as they already in the world matrix)
			this.setCircle(gl, 0, 0, segmentsCount, object.radius);

			// Draw
			gl.drawArrays(gl.TRIANGLE_FAN, 0, segmentsCount);
		}

		// Draw stroke (if not transparent)
		if (object.strokeStyle !== 'transparent') {
			// Set color
			gl.uniform1i(l.u_color, this.colorFromCSSString(object.strokeStyle));

			// Set geometry (no need to set x and y as they already in the world matrix)
			this.setCircleOutline(gl, 0, 0, segmentsCount, object.radius, object.lineWidth);

			// Draw
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, segmentsCount * 2 + 2);
		}
	}
});
