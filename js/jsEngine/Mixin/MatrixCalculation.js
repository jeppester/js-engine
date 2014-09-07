nameSpace('Mixin');

Mixin.MatrixCalculation = createClass( /** @lends Mixin.MatrixCalculation.prototype */ {
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

	matrixDeterminant: function (matrix) {
		var a = matrix[0*3+0];
		var b = matrix[0*3+1];
		var c = matrix[0*3+2];
		var d = matrix[1*3+0];
		var e = matrix[1*3+1];
		var f = matrix[1*3+2];
		var g = matrix[2*3+0];
		var h = matrix[2*3+1];
		var i = matrix[2*3+2];

		return (
			a * (e * i - f * h) -
			b * (i * d - f * g) +
			c * (d * h - e * g)
		)
	},

	matrixInverse: function (matrix) {
		var det, a, b, c, d, e, f, g, h, i, A, B, C, D, E, F, G, H, I;

		// Get determinant
		det = this.matrixDeterminant(matrix);

		// If determinant is zero return false;
		if (det === 0) {
			return false;
		}

		// Calculate inverse
		a = matrix[0*3+0];
		b = matrix[0*3+1];
		c = matrix[0*3+2];
		d = matrix[1*3+0];
		e = matrix[1*3+1];
		f = matrix[1*3+2];
		g = matrix[2*3+0];
		h = matrix[2*3+1];
		i = matrix[2*3+2];

		A =   e * i - f * h;
		B = -(d * i - f * g);
		C =   d * h - e * g;

		D = -(b * i - c * h);
		E =   a * i - c * g;
		F = -(a * h - b * g);

		G =   b * f - c * e;
		H = -(a * f - c * d);
		I =   a * e - b * d;

		return this.matrixMultiplyNumber([
			A, D, G,
			B, E, H,
			C, F, I
		], 1 / det);
	},

	getNewMatrix: function (matrix) {
		var a, b, c, d, e, f, g, h, i, A, B, C, D, E, F, G, H, I;

		a = matrix[0*3+0];
		b = matrix[0*3+1];
		c = matrix[0*3+2];
		d = matrix[1*3+0];
		e = matrix[1*3+1];
		f = matrix[1*3+2];
		g = matrix[2*3+0];
		h = matrix[2*3+1];
		i = matrix[2*3+2];

		A =   e * i - f * h;
		B = -(d * i - f * g);
		C =   d * h - e * g;

		D = -(b * i - c * h);
		E =   a * i - c * g;
		F = -(a * h - b * g);

		G =   b * f - c * e;
		H = -(a * f - c * d);
		I =   a * e - b * d;

		return [
			A, D, G,
			B, E, H,
			C, F, I
		];
	},

	matrixMultiplyNumber: function (matrix, factor) {
		var a = matrix[0*3+0];
		var b = matrix[0*3+1];
		var c = matrix[0*3+2];
		var d = matrix[1*3+0];
		var e = matrix[1*3+1];
		var f = matrix[1*3+2];
		var g = matrix[2*3+0];
		var h = matrix[2*3+1];
		var i = matrix[2*3+2];
		var s = factor;

		return [
			a * s, b * s, c * s,
			d * s, e * s, f * s,
			g * s, h * s, i * s
		];
	},

	matrixMultiply: function (a, b) {
		var a1 = a[0*3+0];
		var b1 = a[0*3+1];
		var c1 = a[0*3+2];
		var d1 = a[1*3+0];
		var e1 = a[1*3+1];
		var f1 = a[1*3+2];
		var g1 = a[2*3+0];
		var h1 = a[2*3+1];
		var i1 = a[2*3+2];

		var a2 = b[0*3+0];
		var b2 = b[0*3+1];
		var c2 = b[0*3+2];
		var d2 = b[1*3+0];
		var e2 = b[1*3+1];
		var f2 = b[1*3+2];
		var g2 = b[2*3+0];
		var h2 = b[2*3+1];
		var i2 = b[2*3+2];

		return [
			a1 * a2 + b1 * d2 + c1 * g2,
			a1 * b2 + b1 * e2 + c1 * h2,
			a1 * c2 + b1 * f2 + c1 * i2,

			d1 * a2 + e1 * d2 + f1 * g2,
			d1 * b2 + e1 * e2 + f1 * h2,
			d1 * c2 + e1 * f2 + f1 * i2,

			g1 * a2 + h1 * d2 + i1 * g2,
			g1 * b2 + h1 * e2 + i1 * h2,
			g1 * c2 + h1 * f2 + i1 * i2
		];
	},

	matrixMultiplyArray: function(matrices) {
		var r, i, len;

		r = matrices[0];
		len = matrices.length;

		for (i = 1; i < len; i ++) {
			r = this.matrixMultiply(r, matrices[i]);
		}

		return r;
	},
});
