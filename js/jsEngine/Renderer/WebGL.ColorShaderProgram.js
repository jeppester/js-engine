new Class('Renderer.WebGL.ColorShaderProgram', {
	ColorShaderProgram: function (gl) {
		var initShaders, initBuffers, program, locations;

		this.program = gl.createProgram();

		this.initShaders(gl);
		this.bindLocations(gl);
		this.initBuffers(gl);

		this.cache = {
			currentBuffer: this.vertexBuffer,
		}
	},

	initShaders: function (gl) {
		var vertexCode, fragmentCode, vertexShader, fragmentShader;

		// Vertex shader
		vertexCode = '\
			attribute vec2 a_position;\
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
			uniform vec4 u_color;\
			uniform float u_alpha;\
			\
			void main() {\
				gl_FragColor = vec4(u_color.rgb, u_alpha);\
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
			u_matrix:			gl.getUniformLocation(this.program, "u_matrix"),
		};
	},

	initBuffers: function (gl) {
		// Vertex buffer
		this.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	},

	// When returning to the program reset the buffer
	onSet: function (gl) {
		gl.enableVertexAttribArray(this.locations.a_position);
		gl.vertexAttribPointer(this.locations.a_position, 2, gl.FLOAT, false, 0, 0);
	},
});
