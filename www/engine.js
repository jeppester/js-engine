(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={"version": "1.3.5"}
},{}],2:[function(require,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 * 
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

/* jshint maxcomplexity:11 */

"use strict";


/*
 * Note
 * ====
 * the structure of this JavaScript version of poly2tri intentionally follows
 * as closely as possible the structure of the reference C++ version, to make it 
 * easier to keep the 2 versions in sync.
 */


// -------------------------------------------------------------------------Node

/**
 * Advancing front node
 * @constructor
 * @private
 * @struct
 * @param {!XY} p - Point
 * @param {Triangle=} t triangle (optional)
 */
var Node = function(p, t) {
    /** @type {XY} */
    this.point = p;

    /** @type {Triangle|null} */
    this.triangle = t || null;

    /** @type {Node|null} */
    this.next = null;
    /** @type {Node|null} */
    this.prev = null;

    /** @type {number} */
    this.value = p.x;
};

// ---------------------------------------------------------------AdvancingFront
/**
 * @constructor
 * @private
 * @struct
 * @param {Node} head
 * @param {Node} tail
 */
var AdvancingFront = function(head, tail) {
    /** @type {Node} */
    this.head_ = head;
    /** @type {Node} */
    this.tail_ = tail;
    /** @type {Node} */
    this.search_node_ = head;
};

/** @return {Node} */
AdvancingFront.prototype.head = function() {
    return this.head_;
};

/** @param {Node} node */
AdvancingFront.prototype.setHead = function(node) {
    this.head_ = node;
};

/** @return {Node} */
AdvancingFront.prototype.tail = function() {
    return this.tail_;
};

/** @param {Node} node */
AdvancingFront.prototype.setTail = function(node) {
    this.tail_ = node;
};

/** @return {Node} */
AdvancingFront.prototype.search = function() {
    return this.search_node_;
};

/** @param {Node} node */
AdvancingFront.prototype.setSearch = function(node) {
    this.search_node_ = node;
};

/** @return {Node} */
AdvancingFront.prototype.findSearchNode = function(/*x*/) {
    // TODO: implement BST index
    return this.search_node_;
};

/**
 * @param {number} x value
 * @return {Node}
 */
AdvancingFront.prototype.locateNode = function(x) {
    var node = this.search_node_;

    /* jshint boss:true */
    if (x < node.value) {
        while (node = node.prev) {
            if (x >= node.value) {
                this.search_node_ = node;
                return node;
            }
        }
    } else {
        while (node = node.next) {
            if (x < node.value) {
                this.search_node_ = node.prev;
                return node.prev;
            }
        }
    }
    return null;
};

/**
 * @param {!XY} point - Point
 * @return {Node}
 */
AdvancingFront.prototype.locatePoint = function(point) {
    var px = point.x;
    var node = this.findSearchNode(px);
    var nx = node.point.x;

    if (px === nx) {
        // Here we are comparing point references, not values
        if (point !== node.point) {
            // We might have two nodes with same x value for a short time
            if (point === node.prev.point) {
                node = node.prev;
            } else if (point === node.next.point) {
                node = node.next;
            } else {
                throw new Error('poly2tri Invalid AdvancingFront.locatePoint() call');
            }
        }
    } else if (px < nx) {
        /* jshint boss:true */
        while (node = node.prev) {
            if (point === node.point) {
                break;
            }
        }
    } else {
        while (node = node.next) {
            if (point === node.point) {
                break;
            }
        }
    }

    if (node) {
        this.search_node_ = node;
    }
    return node;
};


// ----------------------------------------------------------------------Exports

module.exports = AdvancingFront;
module.exports.Node = Node;


},{}],3:[function(require,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 *
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 *
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

"use strict";

/*
 * Function added in the JavaScript version (was not present in the c++ version)
 */

/**
 * assert and throw an exception.
 *
 * @private
 * @param {boolean} condition   the condition which is asserted
 * @param {string} message      the message which is display is condition is falsy
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assert Failed");
    }
}
module.exports = assert;



},{}],4:[function(require,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 * 
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

"use strict";


/*
 * Note
 * ====
 * the structure of this JavaScript version of poly2tri intentionally follows
 * as closely as possible the structure of the reference C++ version, to make it 
 * easier to keep the 2 versions in sync.
 */

var xy = require('./xy');

// ------------------------------------------------------------------------Point
/**
 * Construct a point
 * @example
 *      var point = new poly2tri.Point(150, 150);
 * @public
 * @constructor
 * @struct
 * @param {number=} x    coordinate (0 if undefined)
 * @param {number=} y    coordinate (0 if undefined)
 */
var Point = function(x, y) {
    /**
     * @type {number}
     * @expose
     */
    this.x = +x || 0;
    /**
     * @type {number}
     * @expose
     */
    this.y = +y || 0;

    // All extra fields added to Point are prefixed with _p2t_
    // to avoid collisions if custom Point class is used.

    /**
     * The edges this point constitutes an upper ending point
     * @private
     * @type {Array.<Edge>}
     */
    this._p2t_edge_list = null;
};

/**
 * For pretty printing
 * @example
 *      "p=" + new poly2tri.Point(5,42)
 *      // → "p=(5;42)"
 * @returns {string} <code>"(x;y)"</code>
 */
Point.prototype.toString = function() {
    return xy.toStringBase(this);
};

/**
 * JSON output, only coordinates
 * @example
 *      JSON.stringify(new poly2tri.Point(1,2))
 *      // → '{"x":1,"y":2}'
 */
Point.prototype.toJSON = function() {
    return { x: this.x, y: this.y };
};

/**
 * Creates a copy of this Point object.
 * @return {Point} new cloned point
 */
Point.prototype.clone = function() {
    return new Point(this.x, this.y);
};

/**
 * Set this Point instance to the origo. <code>(0; 0)</code>
 * @return {Point} this (for chaining)
 */
Point.prototype.set_zero = function() {
    this.x = 0.0;
    this.y = 0.0;
    return this; // for chaining
};

/**
 * Set the coordinates of this instance.
 * @param {number} x   coordinate
 * @param {number} y   coordinate
 * @return {Point} this (for chaining)
 */
Point.prototype.set = function(x, y) {
    this.x = +x || 0;
    this.y = +y || 0;
    return this; // for chaining
};

/**
 * Negate this Point instance. (component-wise)
 * @return {Point} this (for chaining)
 */
Point.prototype.negate = function() {
    this.x = -this.x;
    this.y = -this.y;
    return this; // for chaining
};

/**
 * Add another Point object to this instance. (component-wise)
 * @param {!Point} n - Point object.
 * @return {Point} this (for chaining)
 */
Point.prototype.add = function(n) {
    this.x += n.x;
    this.y += n.y;
    return this; // for chaining
};

/**
 * Subtract this Point instance with another point given. (component-wise)
 * @param {!Point} n - Point object.
 * @return {Point} this (for chaining)
 */
Point.prototype.sub = function(n) {
    this.x -= n.x;
    this.y -= n.y;
    return this; // for chaining
};

/**
 * Multiply this Point instance by a scalar. (component-wise)
 * @param {number} s   scalar.
 * @return {Point} this (for chaining)
 */
Point.prototype.mul = function(s) {
    this.x *= s;
    this.y *= s;
    return this; // for chaining
};

/**
 * Return the distance of this Point instance from the origo.
 * @return {number} distance
 */
Point.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

/**
 * Normalize this Point instance (as a vector).
 * @return {number} The original distance of this instance from the origo.
 */
Point.prototype.normalize = function() {
    var len = this.length();
    this.x /= len;
    this.y /= len;
    return len;
};

/**
 * Test this Point object with another for equality.
 * @param {!XY} p - any "Point like" object with {x,y}
 * @return {boolean} <code>true</code> if same x and y coordinates, <code>false</code> otherwise.
 */
Point.prototype.equals = function(p) {
    return this.x === p.x && this.y === p.y;
};


// -----------------------------------------------------Point ("static" methods)

/**
 * Negate a point component-wise and return the result as a new Point object.
 * @param {!XY} p - any "Point like" object with {x,y}
 * @return {Point} the resulting Point object.
 */
Point.negate = function(p) {
    return new Point(-p.x, -p.y);
};

/**
 * Add two points component-wise and return the result as a new Point object.
 * @param {!XY} a - any "Point like" object with {x,y}
 * @param {!XY} b - any "Point like" object with {x,y}
 * @return {Point} the resulting Point object.
 */
Point.add = function(a, b) {
    return new Point(a.x + b.x, a.y + b.y);
};

/**
 * Subtract two points component-wise and return the result as a new Point object.
 * @param {!XY} a - any "Point like" object with {x,y}
 * @param {!XY} b - any "Point like" object with {x,y}
 * @return {Point} the resulting Point object.
 */
Point.sub = function(a, b) {
    return new Point(a.x - b.x, a.y - b.y);
};

/**
 * Multiply a point by a scalar and return the result as a new Point object.
 * @param {number} s - the scalar
 * @param {!XY} p - any "Point like" object with {x,y}
 * @return {Point} the resulting Point object.
 */
Point.mul = function(s, p) {
    return new Point(s * p.x, s * p.y);
};

/**
 * Perform the cross product on either two points (this produces a scalar)
 * or a point and a scalar (this produces a point).
 * This function requires two parameters, either may be a Point object or a
 * number.
 * @param  {XY|number} a - Point object or scalar.
 * @param  {XY|number} b - Point object or scalar.
 * @return {Point|number} a Point object or a number, depending on the parameters.
 */
Point.cross = function(a, b) {
    if (typeof(a) === 'number') {
        if (typeof(b) === 'number') {
            return a * b;
        } else {
            return new Point(-a * b.y, a * b.x);
        }
    } else {
        if (typeof(b) === 'number') {
            return new Point(b * a.y, -b * a.x);
        } else {
            return a.x * b.y - a.y * b.x;
        }
    }
};


// -----------------------------------------------------------------"Point-Like"
/*
 * The following functions operate on "Point" or any "Point like" object 
 * with {x,y} (duck typing).
 */

Point.toString = xy.toString;
Point.compare = xy.compare;
Point.cmp = xy.compare; // backward compatibility
Point.equals = xy.equals;

/**
 * Peform the dot product on two vectors.
 * @public
 * @param {!XY} a - any "Point like" object with {x,y}
 * @param {!XY} b - any "Point like" object with {x,y}
 * @return {number} The dot product
 */
Point.dot = function(a, b) {
    return a.x * b.x + a.y * b.y;
};


// ---------------------------------------------------------Exports (public API)

module.exports = Point;

},{"./xy":11}],5:[function(require,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 * 
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

"use strict";

/*
 * Class added in the JavaScript version (was not present in the c++ version)
 */

var xy = require('./xy');

/**
 * Custom exception class to indicate invalid Point values
 * @constructor
 * @public
 * @extends Error
 * @struct
 * @param {string=} message - error message
 * @param {Array.<XY>=} points - invalid points
 */
var PointError = function(message, points) {
    this.name = "PointError";
    /**
     * Invalid points
     * @public
     * @type {Array.<XY>}
     */
    this.points = points = points || [];
    /**
     * Error message
     * @public
     * @type {string}
     */
    this.message = message || "Invalid Points!";
    for (var i = 0; i < points.length; i++) {
        this.message += " " + xy.toString(points[i]);
    }
};
PointError.prototype = new Error();
PointError.prototype.constructor = PointError;


module.exports = PointError;

},{"./xy":11}],6:[function(require,module,exports){
(function (global){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * * Neither the name of Poly2Tri nor the names of its contributors may be
 *   used to endorse or promote products derived from this software without specific
 *   prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

/**
 * Public API for poly2tri.js
 * @module poly2tri
 */


/**
 * If you are not using a module system (e.g. CommonJS, RequireJS), you can access this library
 * as a global variable <code>poly2tri</code> i.e. <code>window.poly2tri</code> in a browser.
 * @name poly2tri
 * @global
 * @public
 * @type {module:poly2tri}
 */
var previousPoly2tri = global.poly2tri;
/**
 * For Browser + &lt;script&gt; :
 * reverts the {@linkcode poly2tri} global object to its previous value,
 * and returns a reference to the instance called.
 *
 * @example
 *              var p = poly2tri.noConflict();
 * @public
 * @return {module:poly2tri} instance called
 */
// (this feature is not automatically provided by browserify).
exports.noConflict = function() {
    global.poly2tri = previousPoly2tri;
    return exports;
};

/**
 * poly2tri library version
 * @public
 * @const {string}
 */
exports.VERSION = require('../dist/version.json').version;

/**
 * Exports the {@linkcode PointError} class.
 * @public
 * @typedef {PointError} module:poly2tri.PointError
 * @function
 */
exports.PointError = require('./pointerror');
/**
 * Exports the {@linkcode Point} class.
 * @public
 * @typedef {Point} module:poly2tri.Point
 * @function
 */
exports.Point = require('./point');
/**
 * Exports the {@linkcode Triangle} class.
 * @public
 * @typedef {Triangle} module:poly2tri.Triangle
 * @function
 */
exports.Triangle = require('./triangle');
/**
 * Exports the {@linkcode SweepContext} class.
 * @public
 * @typedef {SweepContext} module:poly2tri.SweepContext
 * @function
 */
exports.SweepContext = require('./sweepcontext');


// Backward compatibility
var sweep = require('./sweep');
/**
 * @function
 * @deprecated use {@linkcode SweepContext#triangulate} instead
 */
exports.triangulate = sweep.triangulate;
/**
 * @deprecated use {@linkcode SweepContext#triangulate} instead
 * @property {function} Triangulate - use {@linkcode SweepContext#triangulate} instead
 */
exports.sweep = {Triangulate: sweep.triangulate};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../dist/version.json":1,"./point":4,"./pointerror":5,"./sweep":7,"./sweepcontext":8,"./triangle":9}],7:[function(require,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 * 
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

/* jshint latedef:nofunc, maxcomplexity:9 */

"use strict";

/**
 * This 'Sweep' module is present in order to keep this JavaScript version
 * as close as possible to the reference C++ version, even though almost all
 * functions could be declared as methods on the {@linkcode module:sweepcontext~SweepContext} object.
 * @module
 * @private
 */

/*
 * Note
 * ====
 * the structure of this JavaScript version of poly2tri intentionally follows
 * as closely as possible the structure of the reference C++ version, to make it 
 * easier to keep the 2 versions in sync.
 */

var assert = require('./assert');
var PointError = require('./pointerror');
var Triangle = require('./triangle');
var Node = require('./advancingfront').Node;


// ------------------------------------------------------------------------utils

var utils = require('./utils');

/** @const */
var EPSILON = utils.EPSILON;

/** @const */
var Orientation = utils.Orientation;
/** @const */
var orient2d = utils.orient2d;
/** @const */
var inScanArea = utils.inScanArea;
/** @const */
var isAngleObtuse = utils.isAngleObtuse;


// ------------------------------------------------------------------------Sweep

/**
 * Triangulate the polygon with holes and Steiner points.
 * Do this AFTER you've added the polyline, holes, and Steiner points
 * @private
 * @param {!SweepContext} tcx - SweepContext object
 */
function triangulate(tcx) {
    tcx.initTriangulation();
    tcx.createAdvancingFront();
    // Sweep points; build mesh
    sweepPoints(tcx);
    // Clean up
    finalizationPolygon(tcx);
}

/**
 * Start sweeping the Y-sorted point set from bottom to top
 * @param {!SweepContext} tcx - SweepContext object
 */
function sweepPoints(tcx) {
    var i, len = tcx.pointCount();
    for (i = 1; i < len; ++i) {
        var point = tcx.getPoint(i);
        var node = pointEvent(tcx, point);
        var edges = point._p2t_edge_list;
        for (var j = 0; edges && j < edges.length; ++j) {
            edgeEventByEdge(tcx, edges[j], node);
        }
    }
}

/**
 * @param {!SweepContext} tcx - SweepContext object
 */
function finalizationPolygon(tcx) {
    // Get an Internal triangle to start with
    var t = tcx.front().head().next.triangle;
    var p = tcx.front().head().next.point;
    while (!t.getConstrainedEdgeCW(p)) {
        t = t.neighborCCW(p);
    }

    // Collect interior triangles constrained by edges
    tcx.meshClean(t);
}

/**
 * Find closes node to the left of the new point and
 * create a new triangle. If needed new holes and basins
 * will be filled to.
 * @param {!SweepContext} tcx - SweepContext object
 * @param {!XY} point   Point
 */
function pointEvent(tcx, point) {
    var node = tcx.locateNode(point);
    var new_node = newFrontTriangle(tcx, point, node);

    // Only need to check +epsilon since point never have smaller
    // x value than node due to how we fetch nodes from the front
    if (point.x <= node.point.x + (EPSILON)) {
        fill(tcx, node);
    }

    //tcx.AddNode(new_node);

    fillAdvancingFront(tcx, new_node);
    return new_node;
}

function edgeEventByEdge(tcx, edge, node) {
    tcx.edge_event.constrained_edge = edge;
    tcx.edge_event.right = (edge.p.x > edge.q.x);

    if (isEdgeSideOfTriangle(node.triangle, edge.p, edge.q)) {
        return;
    }

    // For now we will do all needed filling
    // TODO: integrate with flip process might give some better performance
    //       but for now this avoid the issue with cases that needs both flips and fills
    fillEdgeEvent(tcx, edge, node);
    edgeEventByPoints(tcx, edge.p, edge.q, node.triangle, edge.q);
}

function edgeEventByPoints(tcx, ep, eq, triangle, point) {
    if (isEdgeSideOfTriangle(triangle, ep, eq)) {
        return;
    }

    var p1 = triangle.pointCCW(point);
    var o1 = orient2d(eq, p1, ep);
    if (o1 === Orientation.COLLINEAR) {
        // TODO integrate here changes from C++ version
        // (C++ repo revision 09880a869095 dated March 8, 2011)
        throw new PointError('poly2tri EdgeEvent: Collinear not supported!', [eq, p1, ep]);
    }

    var p2 = triangle.pointCW(point);
    var o2 = orient2d(eq, p2, ep);
    if (o2 === Orientation.COLLINEAR) {
        // TODO integrate here changes from C++ version
        // (C++ repo revision 09880a869095 dated March 8, 2011)
        throw new PointError('poly2tri EdgeEvent: Collinear not supported!', [eq, p2, ep]);
    }

    if (o1 === o2) {
        // Need to decide if we are rotating CW or CCW to get to a triangle
        // that will cross edge
        if (o1 === Orientation.CW) {
            triangle = triangle.neighborCCW(point);
        } else {
            triangle = triangle.neighborCW(point);
        }
        edgeEventByPoints(tcx, ep, eq, triangle, point);
    } else {
        // This triangle crosses constraint so lets flippin start!
        flipEdgeEvent(tcx, ep, eq, triangle, point);
    }
}

function isEdgeSideOfTriangle(triangle, ep, eq) {
    var index = triangle.edgeIndex(ep, eq);
    if (index !== -1) {
        triangle.markConstrainedEdgeByIndex(index);
        var t = triangle.getNeighbor(index);
        if (t) {
            t.markConstrainedEdgeByPoints(ep, eq);
        }
        return true;
    }
    return false;
}

/**
 * Creates a new front triangle and legalize it
 * @param {!SweepContext} tcx - SweepContext object
 */
function newFrontTriangle(tcx, point, node) {
    var triangle = new Triangle(point, node.point, node.next.point);

    triangle.markNeighbor(node.triangle);
    tcx.addToMap(triangle);

    var new_node = new Node(point);
    new_node.next = node.next;
    new_node.prev = node;
    node.next.prev = new_node;
    node.next = new_node;

    if (!legalize(tcx, triangle)) {
        tcx.mapTriangleToNodes(triangle);
    }

    return new_node;
}

/**
 * Adds a triangle to the advancing front to fill a hole.
 * @param {!SweepContext} tcx - SweepContext object
 * @param node - middle node, that is the bottom of the hole
 */
function fill(tcx, node) {
    var triangle = new Triangle(node.prev.point, node.point, node.next.point);

    // TODO: should copy the constrained_edge value from neighbor triangles
    //       for now constrained_edge values are copied during the legalize
    triangle.markNeighbor(node.prev.triangle);
    triangle.markNeighbor(node.triangle);

    tcx.addToMap(triangle);

    // Update the advancing front
    node.prev.next = node.next;
    node.next.prev = node.prev;


    // If it was legalized the triangle has already been mapped
    if (!legalize(tcx, triangle)) {
        tcx.mapTriangleToNodes(triangle);
    }

    //tcx.removeNode(node);
}

/**
 * Fills holes in the Advancing Front
 * @param {!SweepContext} tcx - SweepContext object
 */
function fillAdvancingFront(tcx, n) {
    // Fill right holes
    var node = n.next;
    while (node.next) {
        // TODO integrate here changes from C++ version
        // (C++ repo revision acf81f1f1764 dated April 7, 2012)
        if (isAngleObtuse(node.point, node.next.point, node.prev.point)) {
            break;
        }
        fill(tcx, node);
        node = node.next;
    }

    // Fill left holes
    node = n.prev;
    while (node.prev) {
        // TODO integrate here changes from C++ version
        // (C++ repo revision acf81f1f1764 dated April 7, 2012)
        if (isAngleObtuse(node.point, node.next.point, node.prev.point)) {
            break;
        }
        fill(tcx, node);
        node = node.prev;
    }

    // Fill right basins
    if (n.next && n.next.next) {
        if (isBasinAngleRight(n)) {
            fillBasin(tcx, n);
        }
    }
}

/**
 * The basin angle is decided against the horizontal line [1,0].
 * @param {Node} node
 * @return {boolean} true if angle < 3*π/4
 */
function isBasinAngleRight(node) {
    var ax = node.point.x - node.next.next.point.x;
    var ay = node.point.y - node.next.next.point.y;
    assert(ay >= 0, "unordered y");
    return (ax >= 0 || Math.abs(ax) < ay);
}

/**
 * Returns true if triangle was legalized
 * @param {!SweepContext} tcx - SweepContext object
 * @return {boolean}
 */
function legalize(tcx, t) {
    // To legalize a triangle we start by finding if any of the three edges
    // violate the Delaunay condition
    for (var i = 0; i < 3; ++i) {
        if (t.delaunay_edge[i]) {
            continue;
        }
        var ot = t.getNeighbor(i);
        if (ot) {
            var p = t.getPoint(i);
            var op = ot.oppositePoint(t, p);
            var oi = ot.index(op);

            // If this is a Constrained Edge or a Delaunay Edge(only during recursive legalization)
            // then we should not try to legalize
            if (ot.constrained_edge[oi] || ot.delaunay_edge[oi]) {
                t.constrained_edge[i] = ot.constrained_edge[oi];
                continue;
            }

            var inside = inCircle(p, t.pointCCW(p), t.pointCW(p), op);
            if (inside) {
                // Lets mark this shared edge as Delaunay
                t.delaunay_edge[i] = true;
                ot.delaunay_edge[oi] = true;

                // Lets rotate shared edge one vertex CW to legalize it
                rotateTrianglePair(t, p, ot, op);

                // We now got one valid Delaunay Edge shared by two triangles
                // This gives us 4 new edges to check for Delaunay

                // Make sure that triangle to node mapping is done only one time for a specific triangle
                var not_legalized = !legalize(tcx, t);
                if (not_legalized) {
                    tcx.mapTriangleToNodes(t);
                }

                not_legalized = !legalize(tcx, ot);
                if (not_legalized) {
                    tcx.mapTriangleToNodes(ot);
                }
                // Reset the Delaunay edges, since they only are valid Delaunay edges
                // until we add a new triangle or point.
                // XXX: need to think about this. Can these edges be tried after we
                //      return to previous recursive level?
                t.delaunay_edge[i] = false;
                ot.delaunay_edge[oi] = false;

                // If triangle have been legalized no need to check the other edges since
                // the recursive legalization will handles those so we can end here.
                return true;
            }
        }
    }
    return false;
}

/**
 * <b>Requirement</b>:<br>
 * 1. a,b and c form a triangle.<br>
 * 2. a and d is know to be on opposite side of bc<br>
 * <pre>
 *                a
 *                +
 *               / \
 *              /   \
 *            b/     \c
 *            +-------+
 *           /    d    \
 *          /           \
 * </pre>
 * <b>Fact</b>: d has to be in area B to have a chance to be inside the circle formed by
 *  a,b and c<br>
 *  d is outside B if orient2d(a,b,d) or orient2d(c,a,d) is CW<br>
 *  This preknowledge gives us a way to optimize the incircle test
 * @param pa - triangle point, opposite d
 * @param pb - triangle point
 * @param pc - triangle point
 * @param pd - point opposite a
 * @return {boolean} true if d is inside circle, false if on circle edge
 */
function inCircle(pa, pb, pc, pd) {
    var adx = pa.x - pd.x;
    var ady = pa.y - pd.y;
    var bdx = pb.x - pd.x;
    var bdy = pb.y - pd.y;

    var adxbdy = adx * bdy;
    var bdxady = bdx * ady;
    var oabd = adxbdy - bdxady;
    if (oabd <= 0) {
        return false;
    }

    var cdx = pc.x - pd.x;
    var cdy = pc.y - pd.y;

    var cdxady = cdx * ady;
    var adxcdy = adx * cdy;
    var ocad = cdxady - adxcdy;
    if (ocad <= 0) {
        return false;
    }

    var bdxcdy = bdx * cdy;
    var cdxbdy = cdx * bdy;

    var alift = adx * adx + ady * ady;
    var blift = bdx * bdx + bdy * bdy;
    var clift = cdx * cdx + cdy * cdy;

    var det = alift * (bdxcdy - cdxbdy) + blift * ocad + clift * oabd;
    return det > 0;
}

/**
 * Rotates a triangle pair one vertex CW
 *<pre>
 *       n2                    n2
 *  P +-----+             P +-----+
 *    | t  /|               |\  t |
 *    |   / |               | \   |
 *  n1|  /  |n3           n1|  \  |n3
 *    | /   |    after CW   |   \ |
 *    |/ oT |               | oT \|
 *    +-----+ oP            +-----+
 *       n4                    n4
 * </pre>
 */
function rotateTrianglePair(t, p, ot, op) {
    var n1, n2, n3, n4;
    n1 = t.neighborCCW(p);
    n2 = t.neighborCW(p);
    n3 = ot.neighborCCW(op);
    n4 = ot.neighborCW(op);

    var ce1, ce2, ce3, ce4;
    ce1 = t.getConstrainedEdgeCCW(p);
    ce2 = t.getConstrainedEdgeCW(p);
    ce3 = ot.getConstrainedEdgeCCW(op);
    ce4 = ot.getConstrainedEdgeCW(op);

    var de1, de2, de3, de4;
    de1 = t.getDelaunayEdgeCCW(p);
    de2 = t.getDelaunayEdgeCW(p);
    de3 = ot.getDelaunayEdgeCCW(op);
    de4 = ot.getDelaunayEdgeCW(op);

    t.legalize(p, op);
    ot.legalize(op, p);

    // Remap delaunay_edge
    ot.setDelaunayEdgeCCW(p, de1);
    t.setDelaunayEdgeCW(p, de2);
    t.setDelaunayEdgeCCW(op, de3);
    ot.setDelaunayEdgeCW(op, de4);

    // Remap constrained_edge
    ot.setConstrainedEdgeCCW(p, ce1);
    t.setConstrainedEdgeCW(p, ce2);
    t.setConstrainedEdgeCCW(op, ce3);
    ot.setConstrainedEdgeCW(op, ce4);

    // Remap neighbors
    // XXX: might optimize the markNeighbor by keeping track of
    //      what side should be assigned to what neighbor after the
    //      rotation. Now mark neighbor does lots of testing to find
    //      the right side.
    t.clearNeighbors();
    ot.clearNeighbors();
    if (n1) {
        ot.markNeighbor(n1);
    }
    if (n2) {
        t.markNeighbor(n2);
    }
    if (n3) {
        t.markNeighbor(n3);
    }
    if (n4) {
        ot.markNeighbor(n4);
    }
    t.markNeighbor(ot);
}

/**
 * Fills a basin that has formed on the Advancing Front to the right
 * of given node.<br>
 * First we decide a left,bottom and right node that forms the
 * boundaries of the basin. Then we do a reqursive fill.
 *
 * @param {!SweepContext} tcx - SweepContext object
 * @param node - starting node, this or next node will be left node
 */
function fillBasin(tcx, node) {
    if (orient2d(node.point, node.next.point, node.next.next.point) === Orientation.CCW) {
        tcx.basin.left_node = node.next.next;
    } else {
        tcx.basin.left_node = node.next;
    }

    // Find the bottom and right node
    tcx.basin.bottom_node = tcx.basin.left_node;
    while (tcx.basin.bottom_node.next && tcx.basin.bottom_node.point.y >= tcx.basin.bottom_node.next.point.y) {
        tcx.basin.bottom_node = tcx.basin.bottom_node.next;
    }
    if (tcx.basin.bottom_node === tcx.basin.left_node) {
        // No valid basin
        return;
    }

    tcx.basin.right_node = tcx.basin.bottom_node;
    while (tcx.basin.right_node.next && tcx.basin.right_node.point.y < tcx.basin.right_node.next.point.y) {
        tcx.basin.right_node = tcx.basin.right_node.next;
    }
    if (tcx.basin.right_node === tcx.basin.bottom_node) {
        // No valid basins
        return;
    }

    tcx.basin.width = tcx.basin.right_node.point.x - tcx.basin.left_node.point.x;
    tcx.basin.left_highest = tcx.basin.left_node.point.y > tcx.basin.right_node.point.y;

    fillBasinReq(tcx, tcx.basin.bottom_node);
}

/**
 * Recursive algorithm to fill a Basin with triangles
 *
 * @param {!SweepContext} tcx - SweepContext object
 * @param node - bottom_node
 */
function fillBasinReq(tcx, node) {
    // if shallow stop filling
    if (isShallow(tcx, node)) {
        return;
    }

    fill(tcx, node);

    var o;
    if (node.prev === tcx.basin.left_node && node.next === tcx.basin.right_node) {
        return;
    } else if (node.prev === tcx.basin.left_node) {
        o = orient2d(node.point, node.next.point, node.next.next.point);
        if (o === Orientation.CW) {
            return;
        }
        node = node.next;
    } else if (node.next === tcx.basin.right_node) {
        o = orient2d(node.point, node.prev.point, node.prev.prev.point);
        if (o === Orientation.CCW) {
            return;
        }
        node = node.prev;
    } else {
        // Continue with the neighbor node with lowest Y value
        if (node.prev.point.y < node.next.point.y) {
            node = node.prev;
        } else {
            node = node.next;
        }
    }

    fillBasinReq(tcx, node);
}

function isShallow(tcx, node) {
    var height;
    if (tcx.basin.left_highest) {
        height = tcx.basin.left_node.point.y - node.point.y;
    } else {
        height = tcx.basin.right_node.point.y - node.point.y;
    }

    // if shallow stop filling
    if (tcx.basin.width > height) {
        return true;
    }
    return false;
}

function fillEdgeEvent(tcx, edge, node) {
    if (tcx.edge_event.right) {
        fillRightAboveEdgeEvent(tcx, edge, node);
    } else {
        fillLeftAboveEdgeEvent(tcx, edge, node);
    }
}

function fillRightAboveEdgeEvent(tcx, edge, node) {
    while (node.next.point.x < edge.p.x) {
        // Check if next node is below the edge
        if (orient2d(edge.q, node.next.point, edge.p) === Orientation.CCW) {
            fillRightBelowEdgeEvent(tcx, edge, node);
        } else {
            node = node.next;
        }
    }
}

function fillRightBelowEdgeEvent(tcx, edge, node) {
    if (node.point.x < edge.p.x) {
        if (orient2d(node.point, node.next.point, node.next.next.point) === Orientation.CCW) {
            // Concave
            fillRightConcaveEdgeEvent(tcx, edge, node);
        } else {
            // Convex
            fillRightConvexEdgeEvent(tcx, edge, node);
            // Retry this one
            fillRightBelowEdgeEvent(tcx, edge, node);
        }
    }
}

function fillRightConcaveEdgeEvent(tcx, edge, node) {
    fill(tcx, node.next);
    if (node.next.point !== edge.p) {
        // Next above or below edge?
        if (orient2d(edge.q, node.next.point, edge.p) === Orientation.CCW) {
            // Below
            if (orient2d(node.point, node.next.point, node.next.next.point) === Orientation.CCW) {
                // Next is concave
                fillRightConcaveEdgeEvent(tcx, edge, node);
            } else {
                // Next is convex
                /* jshint noempty:false */
            }
        }
    }
}

function fillRightConvexEdgeEvent(tcx, edge, node) {
    // Next concave or convex?
    if (orient2d(node.next.point, node.next.next.point, node.next.next.next.point) === Orientation.CCW) {
        // Concave
        fillRightConcaveEdgeEvent(tcx, edge, node.next);
    } else {
        // Convex
        // Next above or below edge?
        if (orient2d(edge.q, node.next.next.point, edge.p) === Orientation.CCW) {
            // Below
            fillRightConvexEdgeEvent(tcx, edge, node.next);
        } else {
            // Above
            /* jshint noempty:false */
        }
    }
}

function fillLeftAboveEdgeEvent(tcx, edge, node) {
    while (node.prev.point.x > edge.p.x) {
        // Check if next node is below the edge
        if (orient2d(edge.q, node.prev.point, edge.p) === Orientation.CW) {
            fillLeftBelowEdgeEvent(tcx, edge, node);
        } else {
            node = node.prev;
        }
    }
}

function fillLeftBelowEdgeEvent(tcx, edge, node) {
    if (node.point.x > edge.p.x) {
        if (orient2d(node.point, node.prev.point, node.prev.prev.point) === Orientation.CW) {
            // Concave
            fillLeftConcaveEdgeEvent(tcx, edge, node);
        } else {
            // Convex
            fillLeftConvexEdgeEvent(tcx, edge, node);
            // Retry this one
            fillLeftBelowEdgeEvent(tcx, edge, node);
        }
    }
}

function fillLeftConvexEdgeEvent(tcx, edge, node) {
    // Next concave or convex?
    if (orient2d(node.prev.point, node.prev.prev.point, node.prev.prev.prev.point) === Orientation.CW) {
        // Concave
        fillLeftConcaveEdgeEvent(tcx, edge, node.prev);
    } else {
        // Convex
        // Next above or below edge?
        if (orient2d(edge.q, node.prev.prev.point, edge.p) === Orientation.CW) {
            // Below
            fillLeftConvexEdgeEvent(tcx, edge, node.prev);
        } else {
            // Above
            /* jshint noempty:false */
        }
    }
}

function fillLeftConcaveEdgeEvent(tcx, edge, node) {
    fill(tcx, node.prev);
    if (node.prev.point !== edge.p) {
        // Next above or below edge?
        if (orient2d(edge.q, node.prev.point, edge.p) === Orientation.CW) {
            // Below
            if (orient2d(node.point, node.prev.point, node.prev.prev.point) === Orientation.CW) {
                // Next is concave
                fillLeftConcaveEdgeEvent(tcx, edge, node);
            } else {
                // Next is convex
                /* jshint noempty:false */
            }
        }
    }
}

function flipEdgeEvent(tcx, ep, eq, t, p) {
    var ot = t.neighborAcross(p);
    assert(ot, "FLIP failed due to missing triangle!");

    var op = ot.oppositePoint(t, p);

    // Additional check from Java version (see issue #88)
    if (t.getConstrainedEdgeAcross(p)) {
        var index = t.index(p);
        throw new PointError("poly2tri Intersecting Constraints",
                [p, op, t.getPoint((index + 1) % 3), t.getPoint((index + 2) % 3)]);
    }

    if (inScanArea(p, t.pointCCW(p), t.pointCW(p), op)) {
        // Lets rotate shared edge one vertex CW
        rotateTrianglePair(t, p, ot, op);
        tcx.mapTriangleToNodes(t);
        tcx.mapTriangleToNodes(ot);

        // XXX: in the original C++ code for the next 2 lines, we are
        // comparing point values (and not pointers). In this JavaScript
        // code, we are comparing point references (pointers). This works
        // because we can't have 2 different points with the same values.
        // But to be really equivalent, we should use "Point.equals" here.
        if (p === eq && op === ep) {
            if (eq === tcx.edge_event.constrained_edge.q && ep === tcx.edge_event.constrained_edge.p) {
                t.markConstrainedEdgeByPoints(ep, eq);
                ot.markConstrainedEdgeByPoints(ep, eq);
                legalize(tcx, t);
                legalize(tcx, ot);
            } else {
                // XXX: I think one of the triangles should be legalized here?
                /* jshint noempty:false */
            }
        } else {
            var o = orient2d(eq, op, ep);
            t = nextFlipTriangle(tcx, o, t, ot, p, op);
            flipEdgeEvent(tcx, ep, eq, t, p);
        }
    } else {
        var newP = nextFlipPoint(ep, eq, ot, op);
        flipScanEdgeEvent(tcx, ep, eq, t, ot, newP);
        edgeEventByPoints(tcx, ep, eq, t, p);
    }
}

/**
 * After a flip we have two triangles and know that only one will still be
 * intersecting the edge. So decide which to contiune with and legalize the other
 *
 * @param {!SweepContext} tcx - SweepContext object
 * @param o - should be the result of an orient2d( eq, op, ep )
 * @param t - triangle 1
 * @param ot - triangle 2
 * @param p - a point shared by both triangles
 * @param op - another point shared by both triangles
 * @return returns the triangle still intersecting the edge
 */
function nextFlipTriangle(tcx, o, t, ot, p, op) {
    var edge_index;
    if (o === Orientation.CCW) {
        // ot is not crossing edge after flip
        edge_index = ot.edgeIndex(p, op);
        ot.delaunay_edge[edge_index] = true;
        legalize(tcx, ot);
        ot.clearDelaunayEdges();
        return t;
    }

    // t is not crossing edge after flip
    edge_index = t.edgeIndex(p, op);

    t.delaunay_edge[edge_index] = true;
    legalize(tcx, t);
    t.clearDelaunayEdges();
    return ot;
}

/**
 * When we need to traverse from one triangle to the next we need
 * the point in current triangle that is the opposite point to the next
 * triangle.
 */
function nextFlipPoint(ep, eq, ot, op) {
    var o2d = orient2d(eq, op, ep);
    if (o2d === Orientation.CW) {
        // Right
        return ot.pointCCW(op);
    } else if (o2d === Orientation.CCW) {
        // Left
        return ot.pointCW(op);
    } else {
        throw new PointError("poly2tri [Unsupported] nextFlipPoint: opposing point on constrained edge!", [eq, op, ep]);
    }
}

/**
 * Scan part of the FlipScan algorithm<br>
 * When a triangle pair isn't flippable we will scan for the next
 * point that is inside the flip triangle scan area. When found
 * we generate a new flipEdgeEvent
 *
 * @param {!SweepContext} tcx - SweepContext object
 * @param ep - last point on the edge we are traversing
 * @param eq - first point on the edge we are traversing
 * @param {!Triangle} flip_triangle - the current triangle sharing the point eq with edge
 * @param t
 * @param p
 */
function flipScanEdgeEvent(tcx, ep, eq, flip_triangle, t, p) {
    var ot = t.neighborAcross(p);
    assert(ot, "FLIP failed due to missing triangle");

    var op = ot.oppositePoint(t, p);

    if (inScanArea(eq, flip_triangle.pointCCW(eq), flip_triangle.pointCW(eq), op)) {
        // flip with new edge op.eq
        flipEdgeEvent(tcx, eq, op, ot, op);
    } else {
        var newP = nextFlipPoint(ep, eq, ot, op);
        flipScanEdgeEvent(tcx, ep, eq, flip_triangle, ot, newP);
    }
}


// ----------------------------------------------------------------------Exports

exports.triangulate = triangulate;

},{"./advancingfront":2,"./assert":3,"./pointerror":5,"./triangle":9,"./utils":10}],8:[function(require,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 * 
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

/* jshint maxcomplexity:6 */

"use strict";


/*
 * Note
 * ====
 * the structure of this JavaScript version of poly2tri intentionally follows
 * as closely as possible the structure of the reference C++ version, to make it 
 * easier to keep the 2 versions in sync.
 */

var PointError = require('./pointerror');
var Point = require('./point');
var Triangle = require('./triangle');
var sweep = require('./sweep');
var AdvancingFront = require('./advancingfront');
var Node = AdvancingFront.Node;


// ------------------------------------------------------------------------utils

/**
 * Initial triangle factor, seed triangle will extend 30% of
 * PointSet width to both left and right.
 * @private
 * @const
 */
var kAlpha = 0.3;


// -------------------------------------------------------------------------Edge
/**
 * Represents a simple polygon's edge
 * @constructor
 * @struct
 * @private
 * @param {Point} p1
 * @param {Point} p2
 * @throw {PointError} if p1 is same as p2
 */
var Edge = function(p1, p2) {
    this.p = p1;
    this.q = p2;

    if (p1.y > p2.y) {
        this.q = p1;
        this.p = p2;
    } else if (p1.y === p2.y) {
        if (p1.x > p2.x) {
            this.q = p1;
            this.p = p2;
        } else if (p1.x === p2.x) {
            throw new PointError('poly2tri Invalid Edge constructor: repeated points!', [p1]);
        }
    }

    if (!this.q._p2t_edge_list) {
        this.q._p2t_edge_list = [];
    }
    this.q._p2t_edge_list.push(this);
};


// ------------------------------------------------------------------------Basin
/**
 * @constructor
 * @struct
 * @private
 */
var Basin = function() {
    /** @type {Node} */
    this.left_node = null;
    /** @type {Node} */
    this.bottom_node = null;
    /** @type {Node} */
    this.right_node = null;
    /** @type {number} */
    this.width = 0.0;
    /** @type {boolean} */
    this.left_highest = false;
};

Basin.prototype.clear = function() {
    this.left_node = null;
    this.bottom_node = null;
    this.right_node = null;
    this.width = 0.0;
    this.left_highest = false;
};

// --------------------------------------------------------------------EdgeEvent
/**
 * @constructor
 * @struct
 * @private
 */
var EdgeEvent = function() {
    /** @type {Edge} */
    this.constrained_edge = null;
    /** @type {boolean} */
    this.right = false;
};

// ----------------------------------------------------SweepContext (public API)
/**
 * SweepContext constructor option
 * @typedef {Object} SweepContextOptions
 * @property {boolean=} cloneArrays - if <code>true</code>, do a shallow copy of the Array parameters
 *                  (contour, holes). Points inside arrays are never copied.
 *                  Default is <code>false</code> : keep a reference to the array arguments,
 *                  who will be modified in place.
 */
/**
 * Constructor for the triangulation context.
 * It accepts a simple polyline (with non repeating points), 
 * which defines the constrained edges.
 *
 * @example
 *          var contour = [
 *              new poly2tri.Point(100, 100),
 *              new poly2tri.Point(100, 300),
 *              new poly2tri.Point(300, 300),
 *              new poly2tri.Point(300, 100)
 *          ];
 *          var swctx = new poly2tri.SweepContext(contour, {cloneArrays: true});
 * @example
 *          var contour = [{x:100, y:100}, {x:100, y:300}, {x:300, y:300}, {x:300, y:100}];
 *          var swctx = new poly2tri.SweepContext(contour, {cloneArrays: true});
 * @constructor
 * @public
 * @struct
 * @param {Array.<XY>} contour - array of point objects. The points can be either {@linkcode Point} instances,
 *          or any "Point like" custom class with <code>{x, y}</code> attributes.
 * @param {SweepContextOptions=} options - constructor options
 */
var SweepContext = function(contour, options) {
    options = options || {};
    this.triangles_ = [];
    this.map_ = [];
    this.points_ = (options.cloneArrays ? contour.slice(0) : contour);
    this.edge_list = [];

    // Bounding box of all points. Computed at the start of the triangulation, 
    // it is stored in case it is needed by the caller.
    this.pmin_ = this.pmax_ = null;

    /**
     * Advancing front
     * @private
     * @type {AdvancingFront}
     */
    this.front_ = null;

    /**
     * head point used with advancing front
     * @private
     * @type {Point}
     */
    this.head_ = null;

    /**
     * tail point used with advancing front
     * @private
     * @type {Point}
     */
    this.tail_ = null;

    /**
     * @private
     * @type {Node}
     */
    this.af_head_ = null;
    /**
     * @private
     * @type {Node}
     */
    this.af_middle_ = null;
    /**
     * @private
     * @type {Node}
     */
    this.af_tail_ = null;

    this.basin = new Basin();
    this.edge_event = new EdgeEvent();

    this.initEdges(this.points_);
};


/**
 * Add a hole to the constraints
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      var hole = [
 *          new poly2tri.Point(200, 200),
 *          new poly2tri.Point(200, 250),
 *          new poly2tri.Point(250, 250)
 *      ];
 *      swctx.addHole(hole);
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.addHole([{x:200, y:200}, {x:200, y:250}, {x:250, y:250}]);
 * @public
 * @param {Array.<XY>} polyline - array of "Point like" objects with {x,y}
 */
SweepContext.prototype.addHole = function(polyline) {
    this.initEdges(polyline);
    var i, len = polyline.length;
    for (i = 0; i < len; i++) {
        this.points_.push(polyline[i]);
    }
    return this; // for chaining
};

/**
 * For backward compatibility
 * @function
 * @deprecated use {@linkcode SweepContext#addHole} instead
 */
SweepContext.prototype.AddHole = SweepContext.prototype.addHole;


/**
 * Add several holes to the constraints
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      var holes = [
 *          [ new poly2tri.Point(200, 200), new poly2tri.Point(200, 250), new poly2tri.Point(250, 250) ],
 *          [ new poly2tri.Point(300, 300), new poly2tri.Point(300, 350), new poly2tri.Point(350, 350) ]
 *      ];
 *      swctx.addHoles(holes);
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      var holes = [
 *          [{x:200, y:200}, {x:200, y:250}, {x:250, y:250}],
 *          [{x:300, y:300}, {x:300, y:350}, {x:350, y:350}]
 *      ];
 *      swctx.addHoles(holes);
 * @public
 * @param {Array.<Array.<XY>>} holes - array of array of "Point like" objects with {x,y}
 */
// Method added in the JavaScript version (was not present in the c++ version)
SweepContext.prototype.addHoles = function(holes) {
    var i, len = holes.length;
    for (i = 0; i < len; i++) {
        this.initEdges(holes[i]);
    }
    this.points_ = this.points_.concat.apply(this.points_, holes);
    return this; // for chaining
};


/**
 * Add a Steiner point to the constraints
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      var point = new poly2tri.Point(150, 150);
 *      swctx.addPoint(point);
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.addPoint({x:150, y:150});
 * @public
 * @param {XY} point - any "Point like" object with {x,y}
 */
SweepContext.prototype.addPoint = function(point) {
    this.points_.push(point);
    return this; // for chaining
};

/**
 * For backward compatibility
 * @function
 * @deprecated use {@linkcode SweepContext#addPoint} instead
 */
SweepContext.prototype.AddPoint = SweepContext.prototype.addPoint;


/**
 * Add several Steiner points to the constraints
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      var points = [
 *          new poly2tri.Point(150, 150),
 *          new poly2tri.Point(200, 250),
 *          new poly2tri.Point(250, 250)
 *      ];
 *      swctx.addPoints(points);
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.addPoints([{x:150, y:150}, {x:200, y:250}, {x:250, y:250}]);
 * @public
 * @param {Array.<XY>} points - array of "Point like" object with {x,y}
 */
// Method added in the JavaScript version (was not present in the c++ version)
SweepContext.prototype.addPoints = function(points) {
    this.points_ = this.points_.concat(points);
    return this; // for chaining
};


/**
 * Triangulate the polygon with holes and Steiner points.
 * Do this AFTER you've added the polyline, holes, and Steiner points
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.triangulate();
 *      var triangles = swctx.getTriangles();
 * @public
 */
// Shortcut method for sweep.triangulate(SweepContext).
// Method added in the JavaScript version (was not present in the c++ version)
SweepContext.prototype.triangulate = function() {
    sweep.triangulate(this);
    return this; // for chaining
};


/**
 * Get the bounding box of the provided constraints (contour, holes and 
 * Steinter points). Warning : these values are not available if the triangulation 
 * has not been done yet.
 * @public
 * @returns {{min:Point,max:Point}} object with 'min' and 'max' Point
 */
// Method added in the JavaScript version (was not present in the c++ version)
SweepContext.prototype.getBoundingBox = function() {
    return {min: this.pmin_, max: this.pmax_};
};

/**
 * Get result of triangulation.
 * The output triangles have vertices which are references
 * to the initial input points (not copies): any custom fields in the
 * initial points can be retrieved in the output triangles.
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.triangulate();
 *      var triangles = swctx.getTriangles();
 * @example
 *      var contour = [{x:100, y:100, id:1}, {x:100, y:300, id:2}, {x:300, y:300, id:3}];
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.triangulate();
 *      var triangles = swctx.getTriangles();
 *      typeof triangles[0].getPoint(0).id
 *      // → "number"
 * @public
 * @returns {array<Triangle>}   array of triangles
 */
SweepContext.prototype.getTriangles = function() {
    return this.triangles_;
};

/**
 * For backward compatibility
 * @function
 * @deprecated use {@linkcode SweepContext#getTriangles} instead
 */
SweepContext.prototype.GetTriangles = SweepContext.prototype.getTriangles;


// ---------------------------------------------------SweepContext (private API)

/** @private */
SweepContext.prototype.front = function() {
    return this.front_;
};

/** @private */
SweepContext.prototype.pointCount = function() {
    return this.points_.length;
};

/** @private */
SweepContext.prototype.head = function() {
    return this.head_;
};

/** @private */
SweepContext.prototype.setHead = function(p1) {
    this.head_ = p1;
};

/** @private */
SweepContext.prototype.tail = function() {
    return this.tail_;
};

/** @private */
SweepContext.prototype.setTail = function(p1) {
    this.tail_ = p1;
};

/** @private */
SweepContext.prototype.getMap = function() {
    return this.map_;
};

/** @private */
SweepContext.prototype.initTriangulation = function() {
    var xmax = this.points_[0].x;
    var xmin = this.points_[0].x;
    var ymax = this.points_[0].y;
    var ymin = this.points_[0].y;

    // Calculate bounds
    var i, len = this.points_.length;
    for (i = 1; i < len; i++) {
        var p = this.points_[i];
        /* jshint expr:true */
        (p.x > xmax) && (xmax = p.x);
        (p.x < xmin) && (xmin = p.x);
        (p.y > ymax) && (ymax = p.y);
        (p.y < ymin) && (ymin = p.y);
    }
    this.pmin_ = new Point(xmin, ymin);
    this.pmax_ = new Point(xmax, ymax);

    var dx = kAlpha * (xmax - xmin);
    var dy = kAlpha * (ymax - ymin);
    this.head_ = new Point(xmax + dx, ymin - dy);
    this.tail_ = new Point(xmin - dx, ymin - dy);

    // Sort points along y-axis
    this.points_.sort(Point.compare);
};

/** @private */
SweepContext.prototype.initEdges = function(polyline) {
    var i, len = polyline.length;
    for (i = 0; i < len; ++i) {
        this.edge_list.push(new Edge(polyline[i], polyline[(i + 1) % len]));
    }
};

/** @private */
SweepContext.prototype.getPoint = function(index) {
    return this.points_[index];
};

/** @private */
SweepContext.prototype.addToMap = function(triangle) {
    this.map_.push(triangle);
};

/** @private */
SweepContext.prototype.locateNode = function(point) {
    return this.front_.locateNode(point.x);
};

/** @private */
SweepContext.prototype.createAdvancingFront = function() {
    var head;
    var middle;
    var tail;
    // Initial triangle
    var triangle = new Triangle(this.points_[0], this.tail_, this.head_);

    this.map_.push(triangle);

    head = new Node(triangle.getPoint(1), triangle);
    middle = new Node(triangle.getPoint(0), triangle);
    tail = new Node(triangle.getPoint(2));

    this.front_ = new AdvancingFront(head, tail);

    head.next = middle;
    middle.next = tail;
    middle.prev = head;
    tail.prev = middle;
};

/** @private */
SweepContext.prototype.removeNode = function(node) {
    // do nothing
    /* jshint unused:false */
};

/** @private */
SweepContext.prototype.mapTriangleToNodes = function(t) {
    for (var i = 0; i < 3; ++i) {
        if (!t.getNeighbor(i)) {
            var n = this.front_.locatePoint(t.pointCW(t.getPoint(i)));
            if (n) {
                n.triangle = t;
            }
        }
    }
};

/** @private */
SweepContext.prototype.removeFromMap = function(triangle) {
    var i, map = this.map_, len = map.length;
    for (i = 0; i < len; i++) {
        if (map[i] === triangle) {
            map.splice(i, 1);
            break;
        }
    }
};

/**
 * Do a depth first traversal to collect triangles
 * @private
 * @param {Triangle} triangle start
 */
SweepContext.prototype.meshClean = function(triangle) {
    // New implementation avoids recursive calls and use a loop instead.
    // Cf. issues # 57, 65 and 69.
    var triangles = [triangle], t, i;
    /* jshint boss:true */
    while (t = triangles.pop()) {
        if (!t.isInterior()) {
            t.setInterior(true);
            this.triangles_.push(t);
            for (i = 0; i < 3; i++) {
                if (!t.constrained_edge[i]) {
                    triangles.push(t.getNeighbor(i));
                }
            }
        }
    }
};

// ----------------------------------------------------------------------Exports

module.exports = SweepContext;

},{"./advancingfront":2,"./point":4,"./pointerror":5,"./sweep":7,"./triangle":9}],9:[function(require,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

/* jshint maxcomplexity:10 */

"use strict";


/*
 * Note
 * ====
 * the structure of this JavaScript version of poly2tri intentionally follows
 * as closely as possible the structure of the reference C++ version, to make it 
 * easier to keep the 2 versions in sync.
 */

var xy = require("./xy");


// ---------------------------------------------------------------------Triangle
/**
 * Triangle class.<br>
 * Triangle-based data structures are known to have better performance than
 * quad-edge structures.
 * See: J. Shewchuk, "Triangle: Engineering a 2D Quality Mesh Generator and
 * Delaunay Triangulator", "Triangulations in CGAL"
 *
 * @constructor
 * @struct
 * @param {!XY} pa  point object with {x,y}
 * @param {!XY} pb  point object with {x,y}
 * @param {!XY} pc  point object with {x,y}
 */
var Triangle = function(a, b, c) {
    /**
     * Triangle points
     * @private
     * @type {Array.<XY>}
     */
    this.points_ = [a, b, c];

    /**
     * Neighbor list
     * @private
     * @type {Array.<Triangle>}
     */
    this.neighbors_ = [null, null, null];

    /**
     * Has this triangle been marked as an interior triangle?
     * @private
     * @type {boolean}
     */
    this.interior_ = false;

    /**
     * Flags to determine if an edge is a Constrained edge
     * @private
     * @type {Array.<boolean>}
     */
    this.constrained_edge = [false, false, false];

    /**
     * Flags to determine if an edge is a Delauney edge
     * @private
     * @type {Array.<boolean>}
     */
    this.delaunay_edge = [false, false, false];
};

var p2s = xy.toString;
/**
 * For pretty printing ex. <code>"[(5;42)(10;20)(21;30)]"</code>.
 * @public
 * @return {string}
 */
Triangle.prototype.toString = function() {
    return ("[" + p2s(this.points_[0]) + p2s(this.points_[1]) + p2s(this.points_[2]) + "]");
};

/**
 * Get one vertice of the triangle.
 * The output triangles of a triangulation have vertices which are references
 * to the initial input points (not copies): any custom fields in the
 * initial points can be retrieved in the output triangles.
 * @example
 *      var contour = [{x:100, y:100, id:1}, {x:100, y:300, id:2}, {x:300, y:300, id:3}];
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.triangulate();
 *      var triangles = swctx.getTriangles();
 *      typeof triangles[0].getPoint(0).id
 *      // → "number"
 * @param {number} index - vertice index: 0, 1 or 2
 * @public
 * @returns {XY}
 */
Triangle.prototype.getPoint = function(index) {
    return this.points_[index];
};

/**
 * For backward compatibility
 * @function
 * @deprecated use {@linkcode Triangle#getPoint} instead
 */
Triangle.prototype.GetPoint = Triangle.prototype.getPoint;

/**
 * Get all 3 vertices of the triangle as an array
 * @public
 * @return {Array.<XY>}
 */
// Method added in the JavaScript version (was not present in the c++ version)
Triangle.prototype.getPoints = function() {
    return this.points_;
};

/**
 * @private
 * @param {number} index
 * @returns {?Triangle}
 */
Triangle.prototype.getNeighbor = function(index) {
    return this.neighbors_[index];
};

/**
 * Test if this Triangle contains the Point object given as parameter as one of its vertices.
 * Only point references are compared, not values.
 * @public
 * @param {XY} point - point object with {x,y}
 * @return {boolean} <code>True</code> if the Point object is of the Triangle's vertices,
 *         <code>false</code> otherwise.
 */
Triangle.prototype.containsPoint = function(point) {
    var points = this.points_;
    // Here we are comparing point references, not values
    return (point === points[0] || point === points[1] || point === points[2]);
};

/**
 * Test if this Triangle contains the Edge object given as parameter as its
 * bounding edges. Only point references are compared, not values.
 * @private
 * @param {Edge} edge
 * @return {boolean} <code>True</code> if the Edge object is of the Triangle's bounding
 *         edges, <code>false</code> otherwise.
 */
Triangle.prototype.containsEdge = function(edge) {
    return this.containsPoint(edge.p) && this.containsPoint(edge.q);
};

/**
 * Test if this Triangle contains the two Point objects given as parameters among its vertices.
 * Only point references are compared, not values.
 * @param {XY} p1 - point object with {x,y}
 * @param {XY} p2 - point object with {x,y}
 * @return {boolean}
 */
Triangle.prototype.containsPoints = function(p1, p2) {
    return this.containsPoint(p1) && this.containsPoint(p2);
};

/**
 * Has this triangle been marked as an interior triangle?
 * @returns {boolean}
 */
Triangle.prototype.isInterior = function() {
    return this.interior_;
};

/**
 * Mark this triangle as an interior triangle
 * @private
 * @param {boolean} interior
 * @returns {Triangle} this
 */
Triangle.prototype.setInterior = function(interior) {
    this.interior_ = interior;
    return this;
};

/**
 * Update neighbor pointers.
 * @private
 * @param {XY} p1 - point object with {x,y}
 * @param {XY} p2 - point object with {x,y}
 * @param {Triangle} t Triangle object.
 * @throws {Error} if can't find objects
 */
Triangle.prototype.markNeighborPointers = function(p1, p2, t) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if ((p1 === points[2] && p2 === points[1]) || (p1 === points[1] && p2 === points[2])) {
        this.neighbors_[0] = t;
    } else if ((p1 === points[0] && p2 === points[2]) || (p1 === points[2] && p2 === points[0])) {
        this.neighbors_[1] = t;
    } else if ((p1 === points[0] && p2 === points[1]) || (p1 === points[1] && p2 === points[0])) {
        this.neighbors_[2] = t;
    } else {
        throw new Error('poly2tri Invalid Triangle.markNeighborPointers() call');
    }
};

/**
 * Exhaustive search to update neighbor pointers
 * @private
 * @param {!Triangle} t
 */
Triangle.prototype.markNeighbor = function(t) {
    var points = this.points_;
    if (t.containsPoints(points[1], points[2])) {
        this.neighbors_[0] = t;
        t.markNeighborPointers(points[1], points[2], this);
    } else if (t.containsPoints(points[0], points[2])) {
        this.neighbors_[1] = t;
        t.markNeighborPointers(points[0], points[2], this);
    } else if (t.containsPoints(points[0], points[1])) {
        this.neighbors_[2] = t;
        t.markNeighborPointers(points[0], points[1], this);
    }
};


Triangle.prototype.clearNeighbors = function() {
    this.neighbors_[0] = null;
    this.neighbors_[1] = null;
    this.neighbors_[2] = null;
};

Triangle.prototype.clearDelaunayEdges = function() {
    this.delaunay_edge[0] = false;
    this.delaunay_edge[1] = false;
    this.delaunay_edge[2] = false;
};

/**
 * Returns the point clockwise to the given point.
 * @private
 * @param {XY} p - point object with {x,y}
 */
Triangle.prototype.pointCW = function(p) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if (p === points[0]) {
        return points[2];
    } else if (p === points[1]) {
        return points[0];
    } else if (p === points[2]) {
        return points[1];
    } else {
        return null;
    }
};

/**
 * Returns the point counter-clockwise to the given point.
 * @private
 * @param {XY} p - point object with {x,y}
 */
Triangle.prototype.pointCCW = function(p) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if (p === points[0]) {
        return points[1];
    } else if (p === points[1]) {
        return points[2];
    } else if (p === points[2]) {
        return points[0];
    } else {
        return null;
    }
};

/**
 * Returns the neighbor clockwise to given point.
 * @private
 * @param {XY} p - point object with {x,y}
 */
Triangle.prototype.neighborCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.neighbors_[1];
    } else if (p === this.points_[1]) {
        return this.neighbors_[2];
    } else {
        return this.neighbors_[0];
    }
};

/**
 * Returns the neighbor counter-clockwise to given point.
 * @private
 * @param {XY} p - point object with {x,y}
 */
Triangle.prototype.neighborCCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.neighbors_[2];
    } else if (p === this.points_[1]) {
        return this.neighbors_[0];
    } else {
        return this.neighbors_[1];
    }
};

Triangle.prototype.getConstrainedEdgeCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.constrained_edge[1];
    } else if (p === this.points_[1]) {
        return this.constrained_edge[2];
    } else {
        return this.constrained_edge[0];
    }
};

Triangle.prototype.getConstrainedEdgeCCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.constrained_edge[2];
    } else if (p === this.points_[1]) {
        return this.constrained_edge[0];
    } else {
        return this.constrained_edge[1];
    }
};

// Additional check from Java version (see issue #88)
Triangle.prototype.getConstrainedEdgeAcross = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.constrained_edge[0];
    } else if (p === this.points_[1]) {
        return this.constrained_edge[1];
    } else {
        return this.constrained_edge[2];
    }
};

Triangle.prototype.setConstrainedEdgeCW = function(p, ce) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        this.constrained_edge[1] = ce;
    } else if (p === this.points_[1]) {
        this.constrained_edge[2] = ce;
    } else {
        this.constrained_edge[0] = ce;
    }
};

Triangle.prototype.setConstrainedEdgeCCW = function(p, ce) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        this.constrained_edge[2] = ce;
    } else if (p === this.points_[1]) {
        this.constrained_edge[0] = ce;
    } else {
        this.constrained_edge[1] = ce;
    }
};

Triangle.prototype.getDelaunayEdgeCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.delaunay_edge[1];
    } else if (p === this.points_[1]) {
        return this.delaunay_edge[2];
    } else {
        return this.delaunay_edge[0];
    }
};

Triangle.prototype.getDelaunayEdgeCCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.delaunay_edge[2];
    } else if (p === this.points_[1]) {
        return this.delaunay_edge[0];
    } else {
        return this.delaunay_edge[1];
    }
};

Triangle.prototype.setDelaunayEdgeCW = function(p, e) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        this.delaunay_edge[1] = e;
    } else if (p === this.points_[1]) {
        this.delaunay_edge[2] = e;
    } else {
        this.delaunay_edge[0] = e;
    }
};

Triangle.prototype.setDelaunayEdgeCCW = function(p, e) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        this.delaunay_edge[2] = e;
    } else if (p === this.points_[1]) {
        this.delaunay_edge[0] = e;
    } else {
        this.delaunay_edge[1] = e;
    }
};

/**
 * The neighbor across to given point.
 * @private
 * @param {XY} p - point object with {x,y}
 * @returns {Triangle}
 */
Triangle.prototype.neighborAcross = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.neighbors_[0];
    } else if (p === this.points_[1]) {
        return this.neighbors_[1];
    } else {
        return this.neighbors_[2];
    }
};

/**
 * @private
 * @param {!Triangle} t Triangle object.
 * @param {XY} p - point object with {x,y}
 */
Triangle.prototype.oppositePoint = function(t, p) {
    var cw = t.pointCW(p);
    return this.pointCW(cw);
};

/**
 * Legalize triangle by rotating clockwise around oPoint
 * @private
 * @param {XY} opoint - point object with {x,y}
 * @param {XY} npoint - point object with {x,y}
 * @throws {Error} if oPoint can not be found
 */
Triangle.prototype.legalize = function(opoint, npoint) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if (opoint === points[0]) {
        points[1] = points[0];
        points[0] = points[2];
        points[2] = npoint;
    } else if (opoint === points[1]) {
        points[2] = points[1];
        points[1] = points[0];
        points[0] = npoint;
    } else if (opoint === points[2]) {
        points[0] = points[2];
        points[2] = points[1];
        points[1] = npoint;
    } else {
        throw new Error('poly2tri Invalid Triangle.legalize() call');
    }
};

/**
 * Returns the index of a point in the triangle. 
 * The point *must* be a reference to one of the triangle's vertices.
 * @private
 * @param {XY} p - point object with {x,y}
 * @returns {number} index 0, 1 or 2
 * @throws {Error} if p can not be found
 */
Triangle.prototype.index = function(p) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if (p === points[0]) {
        return 0;
    } else if (p === points[1]) {
        return 1;
    } else if (p === points[2]) {
        return 2;
    } else {
        throw new Error('poly2tri Invalid Triangle.index() call');
    }
};

/**
 * @private
 * @param {XY} p1 - point object with {x,y}
 * @param {XY} p2 - point object with {x,y}
 * @return {number} index 0, 1 or 2, or -1 if errror
 */
Triangle.prototype.edgeIndex = function(p1, p2) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if (p1 === points[0]) {
        if (p2 === points[1]) {
            return 2;
        } else if (p2 === points[2]) {
            return 1;
        }
    } else if (p1 === points[1]) {
        if (p2 === points[2]) {
            return 0;
        } else if (p2 === points[0]) {
            return 2;
        }
    } else if (p1 === points[2]) {
        if (p2 === points[0]) {
            return 1;
        } else if (p2 === points[1]) {
            return 0;
        }
    }
    return -1;
};

/**
 * Mark an edge of this triangle as constrained.
 * @private
 * @param {number} index - edge index
 */
Triangle.prototype.markConstrainedEdgeByIndex = function(index) {
    this.constrained_edge[index] = true;
};
/**
 * Mark an edge of this triangle as constrained.
 * @private
 * @param {Edge} edge instance
 */
Triangle.prototype.markConstrainedEdgeByEdge = function(edge) {
    this.markConstrainedEdgeByPoints(edge.p, edge.q);
};
/**
 * Mark an edge of this triangle as constrained.
 * This method takes two Point instances defining the edge of the triangle.
 * @private
 * @param {XY} p - point object with {x,y}
 * @param {XY} q - point object with {x,y}
 */
Triangle.prototype.markConstrainedEdgeByPoints = function(p, q) {
    var points = this.points_;
    // Here we are comparing point references, not values        
    if ((q === points[0] && p === points[1]) || (q === points[1] && p === points[0])) {
        this.constrained_edge[2] = true;
    } else if ((q === points[0] && p === points[2]) || (q === points[2] && p === points[0])) {
        this.constrained_edge[1] = true;
    } else if ((q === points[1] && p === points[2]) || (q === points[2] && p === points[1])) {
        this.constrained_edge[0] = true;
    }
};


// ---------------------------------------------------------Exports (public API)

module.exports = Triangle;

},{"./xy":11}],10:[function(require,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 * 
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

"use strict";

/**
 * Precision to detect repeated or collinear points
 * @private
 * @const {number}
 * @default
 */
var EPSILON = 1e-12;
exports.EPSILON = EPSILON;

/**
 * @private
 * @enum {number}
 * @readonly
 */
var Orientation = {
    "CW": 1,
    "CCW": -1,
    "COLLINEAR": 0
};
exports.Orientation = Orientation;


/**
 * Formula to calculate signed area<br>
 * Positive if CCW<br>
 * Negative if CW<br>
 * 0 if collinear<br>
 * <pre>
 * A[P1,P2,P3]  =  (x1*y2 - y1*x2) + (x2*y3 - y2*x3) + (x3*y1 - y3*x1)
 *              =  (x1-x3)*(y2-y3) - (y1-y3)*(x2-x3)
 * </pre>
 *
 * @private
 * @param {!XY} pa  point object with {x,y}
 * @param {!XY} pb  point object with {x,y}
 * @param {!XY} pc  point object with {x,y}
 * @return {Orientation}
 */
function orient2d(pa, pb, pc) {
    var detleft = (pa.x - pc.x) * (pb.y - pc.y);
    var detright = (pa.y - pc.y) * (pb.x - pc.x);
    var val = detleft - detright;
    if (val > -(EPSILON) && val < (EPSILON)) {
        return Orientation.COLLINEAR;
    } else if (val > 0) {
        return Orientation.CCW;
    } else {
        return Orientation.CW;
    }
}
exports.orient2d = orient2d;


/**
 *
 * @private
 * @param {!XY} pa  point object with {x,y}
 * @param {!XY} pb  point object with {x,y}
 * @param {!XY} pc  point object with {x,y}
 * @param {!XY} pd  point object with {x,y}
 * @return {boolean}
 */
function inScanArea(pa, pb, pc, pd) {
    var oadb = (pa.x - pb.x) * (pd.y - pb.y) - (pd.x - pb.x) * (pa.y - pb.y);
    if (oadb >= -EPSILON) {
        return false;
    }

    var oadc = (pa.x - pc.x) * (pd.y - pc.y) - (pd.x - pc.x) * (pa.y - pc.y);
    if (oadc <= EPSILON) {
        return false;
    }
    return true;
}
exports.inScanArea = inScanArea;


/**
 * Check if the angle between (pa,pb) and (pa,pc) is obtuse i.e. (angle > π/2 || angle < -π/2)
 *
 * @private
 * @param {!XY} pa  point object with {x,y}
 * @param {!XY} pb  point object with {x,y}
 * @param {!XY} pc  point object with {x,y}
 * @return {boolean} true if angle is obtuse
 */
function isAngleObtuse(pa, pb, pc) {
    var ax = pb.x - pa.x;
    var ay = pb.y - pa.y;
    var bx = pc.x - pa.x;
    var by = pc.y - pa.y;
    return (ax * bx + ay * by) < 0;
}
exports.isAngleObtuse = isAngleObtuse;


},{}],11:[function(require,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 * 
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

"use strict";

/**
 * The following functions operate on "Point" or any "Point like" object with {x,y},
 * as defined by the {@link XY} type
 * ([duck typing]{@link http://en.wikipedia.org/wiki/Duck_typing}).
 * @module
 * @private
 */

/**
 * poly2tri.js supports using custom point class instead of {@linkcode Point}.
 * Any "Point like" object with <code>{x, y}</code> attributes is supported
 * to initialize the SweepContext polylines and points
 * ([duck typing]{@link http://en.wikipedia.org/wiki/Duck_typing}).
 *
 * poly2tri.js might add extra fields to the point objects when computing the
 * triangulation : they are prefixed with <code>_p2t_</code> to avoid collisions
 * with fields in the custom class.
 *
 * @example
 *      var contour = [{x:100, y:100}, {x:100, y:300}, {x:300, y:300}, {x:300, y:100}];
 *      var swctx = new poly2tri.SweepContext(contour);
 *
 * @typedef {Object} XY
 * @property {number} x - x coordinate
 * @property {number} y - y coordinate
 */


/**
 * Point pretty printing : prints x and y coordinates.
 * @example
 *      xy.toStringBase({x:5, y:42})
 *      // → "(5;42)"
 * @protected
 * @param {!XY} p - point object with {x,y}
 * @returns {string} <code>"(x;y)"</code>
 */
function toStringBase(p) {
    return ("(" + p.x + ";" + p.y + ")");
}

/**
 * Point pretty printing. Delegates to the point's custom "toString()" method if exists,
 * else simply prints x and y coordinates.
 * @example
 *      xy.toString({x:5, y:42})
 *      // → "(5;42)"
 * @example
 *      xy.toString({x:5,y:42,toString:function() {return this.x+":"+this.y;}})
 *      // → "5:42"
 * @param {!XY} p - point object with {x,y}
 * @returns {string} <code>"(x;y)"</code>
 */
function toString(p) {
    // Try a custom toString first, and fallback to own implementation if none
    var s = p.toString();
    return (s === '[object Object]' ? toStringBase(p) : s);
}


/**
 * Compare two points component-wise. Ordered by y axis first, then x axis.
 * @param {!XY} a - point object with {x,y}
 * @param {!XY} b - point object with {x,y}
 * @return {number} <code>&lt; 0</code> if <code>a &lt; b</code>,
 *         <code>&gt; 0</code> if <code>a &gt; b</code>, 
 *         <code>0</code> otherwise.
 */
function compare(a, b) {
    if (a.y === b.y) {
        return a.x - b.x;
    } else {
        return a.y - b.y;
    }
}

/**
 * Test two Point objects for equality.
 * @param {!XY} a - point object with {x,y}
 * @param {!XY} b - point object with {x,y}
 * @return {boolean} <code>True</code> if <code>a == b</code>, <code>false</code> otherwise.
 */
function equals(a, b) {
    return a.x === b.x && a.y === b.y;
}


module.exports = {
    toString: toString,
    toStringBase: toStringBase,
    compare: compare,
    equals: equals
};

},{}],12:[function(require,module,exports){

/*
The constructor for the Engine class.

@constructor
@name Engine
@class The main game engine class.
Responsible for the main loop, the main canvas, etc.

@property {boolean} running Whether or not the engine is currently running
@property {int} canvasResX The main canvas horizontal resolution
@property {int} canvasResY The main canvas vertical resolution
@property {string} enginePath The url to jsEngine's source folder
@property {boolean} focusOnLoad If the engine should focus itself when loaded
@property {string} themesPath The url to jsEngine's theme folder
@property {boolean} drawBoundingBoxes Whether or not the bounding boxes of all collidable objects are drawn
@property {boolean} drawMasks Whether or not the masks of all collidable objects are drawn
@property {boolean} pauseOnBlur Whether or the engine will pause itself when the window is blurred
@property {boolean} disableRightClick Whether or not right click context menu is disabled inside the main canvas
@property {boolean} preventDefaultKeyboard Whether or not preventDefault is called for keyboard events
@property {HTMLElement} arena The HTML element to use as parent to the main canvas
@property {boolean} autoResize Whether or not the arena will autoresize itself to fit the window
@property {boolean} autoResizeLimitToResolution Whether or not the arena should not autoresize itself to be bigger than the main canvas' resolution
@property {int} cachedSoundCopies The number of copies each sound object caches of it's source to enable multiple playbacks
@property {string} loadText The text shown while loading the engine
@property {string} backgroundColor A CSS color string which is used as the background color of the main canvas
@property {number} timeFactor The factor to multiply the time increase with. A factor of 2 will make everything happen with double speed
@property {boolean} resetCursorOnEachFrame Whether or not the mouse cursor will be reset on each frame
@property {boolean} disableTouchScroll Whether or not touch scroll has been disabled
@property {Camera[]} cameras An array containing the engine's cameras
@property {int} defaultCollisionResolution The collision resolution set for all created collidable objects
@property {boolean} soundsMuted Whether or not all sound effects are currently muted
@property {boolean} musicMuted Whether or not all music is currently muted

@param {object} options An object containing key-value pairs that will be used as launch options for the engine.
The default options are:
<code>{
"arena": document.getElementById('arena'), // The element to use as game arena
"avoidSubPixelRendering": true, // If subpixelrendering should be avoided
"autoResize": true, // If the arena should autoresize to fit the window (or iframe)
"autoResizeLimitToResolution": true, // If the autoresizing should be limited to the game's resolution
"backgroundColor": "#000", // The color of the arena's background
"cachedSoundCopies": 5, // How many times sounds should be duplicated to allow multiple playbacks
"canvasResX": 800, // The horizontal resolution to set for the game's main canvas
"canvasResY": 600, // The vertical resolution to set for the game's main canvas
"defaultCollisionResolution": 1, // Res. of collision checking, by default every 6th px is checked
"disableRightClick": true, // If right clicks inside the arena should be disabled
"disableWebGL": false, // If WebGL rendering should be disabled
"preventDefaultKeyboard": false, // Whether or not preventDefault should be called for keyboard events
"disableTouchScroll": true, // If touch scroll on tablets and phones should be disable
"drawBoundingBoxes": false, // If Collidable object's bounding boxes should be drawn
"drawMasks": false, // If Collidable object's masks should be drawn
"enginePath": "js/jsEngine", // The path for the engine classes' directory
"focusOnLoad": true, // Whether or not to focus the engine's window when the engine is ready
"loadText": 'jsEngine loading...'
"musicMuted": false, // If all music playback should be initially muted
"pauseOnBlur": true, // If the engine should pause when the browser window loses its focus
"resetCursorOnEachFrame": true // Whether or not the mouse cursor should be reset on each frame
"soundsMuted": false, // If all sound effects should be initially muted
"themesPath": "assets", // The path to the themes-directory
}</code>
 */
var Engine;

module.exports = window.Engine = Engine = (function() {
  Engine.Helpers = {
    MatrixCalculation: require('./helpers/matrix-calculation'),
    Mixin: require('./helpers/mixin'),
    RoomTransition: require('./helpers/room-transition'),
    WebGL: require('./helpers/webgl')
  };

  Engine.Geometry = {
    Vector: require('./geometry/vector'),
    Circle: require('./geometry/circle'),
    Line: require('./geometry/line'),
    Rectangle: require('./geometry/rectangle'),
    Polygon: require('./geometry/polygon')
  };

  Engine.Mixins = {
    Animatable: require('./mixins/animatable')
  };

  Engine.Input = {
    Keyboard: require('./input/keyboard'),
    Pointer: require('./input/pointer')
  };

  Engine.Renderers = {
    WebGLRenderer: require('./renderer/webgl'),
    CanvasRenderer: require('./renderer/canvas')
  };

  Engine.Sounds = {
    Effect: require('./sounds/effect'),
    Music: require('./sounds/music')
  };

  Engine.Views = {
    Child: require('./views/child'),
    Container: require('./views/container'),
    Circle: require('./views/circle'),
    Line: require('./views/line'),
    Rectangle: require('./views/rectangle'),
    Polygon: require('./views/polygon'),
    Sprite: require('./views/sprite'),
    TextBlock: require('./views/text-block'),
    Collidable: require('./views/collidable'),
    GameObject: require('./views/game-object')
  };

  Engine.Room = require('./engine/room');

  Engine.Globals = require('./engine/globals');

  Engine.ObjectCreator = require('./engine/object-creator');

  Engine.CustomLoop = require('./engine/custom-loop');

  Engine.Camera = require('./engine/camera');

  Engine.Loader = require('./engine/loader');

  function Engine(options) {

    /*
    Global engine var set upon engine initialization
    @global
     */
    window.engine = this;
    this.options = options || {};
    this.load();
  }


  /*
  Load all files and functions, that are needed before the engine can start.
  @private
   */

  Engine.prototype.load = function() {
    var audioFormats, copyOpt, i, opt;
    this.host = {
      hasTouch: "ontouchstart" in document,
      hasMouse: false,
      browserEngine: "Unknown",
      device: "Unknown",
      supportedAudio: []
    };
    if (navigator.userAgent.match(/Firefox/)) {
      this.host.browserEngine = "Gecko";
    } else if (navigator.userAgent.match(/AppleWebKit/)) {
      this.host.browserEngine = "WebKit";
      if (navigator.userAgent.match(/iPad|iPhone/)) {
        this.host.device = "iDevice";
      } else {
        if (navigator.userAgent.match(/Android/)) {
          this.host.device = "Android";
        }
      }
    } else {
      if (navigator.userAgent.match(/Trident/)) {
        this.host.browserEngine = "Trident";
      }
    }
    audioFormats = ["mp3", "ogg", "wav"];
    i = 0;
    while (i < audioFormats.length) {
      if (document.createElement("audio").canPlayType("audio/" + audioFormats[i])) {
        this.host.supportedAudio.push(audioFormats[i]);
      }
      i++;
    }
    this.avoidSubPixelRendering = true;
    this.preloadSounds = true;
    switch (this.host.device) {
      case "iDevice":
        this.preloadSounds = false;
    }
    this.running = false;
    this.canvasResX = 800;
    this.canvasResY = 600;
    this.enginePath = "js/jsEngine";
    this.focusOnLoad = true;
    this.themesPath = "assets";
    this.drawBoundingBoxes = false;
    this.drawMasks = false;
    this.pauseOnBlur = true;
    this.disableRightClick = true;
    this.preventDefaultKeyboard = false;
    this.arena = document.getElementById("arena");
    this.autoResize = true;
    this.autoResizeLimitToResolution = true;
    this.cachedSoundCopies = 5;
    this.loadText = "jsEngine loading...";
    this.backgroundColor = "#000";
    this.timeFactor = 1;
    this.disableTouchScroll = true;
    this.resetCursorOnEachFrame = true;
    this.cameras = [];
    this.defaultCollisionResolution = 1;
    this.redrawObjects = [];
    this.disableWebGL = false;
    this.soundsMuted = false;
    this.musicMuted = false;
    copyOpt = ["arena", "autoResize", "autoResizeLimitToResolution", "avoidSubPixelRendering", "backgroundColor", "cachedSoundCopies", "canvasResX", "canvasResY", "defaultCollisionResolution", "disableWebGL", "disableRightClick", "disableTouchScroll", "drawBoundingBoxes", "drawMasks", "enginePath", "focusOnLoad", "gameClass", "loadText", "musicMuted", "pauseOnBlur", "preventDefaultKeyboard", "resetCursorOnEachFrame", "soundsMuted", "themesPath"];
    i = 0;
    while (i < copyOpt.length) {
      opt = copyOpt[i];
      if (this.options[opt] !== void 0) {
        this[opt] = this.options[opt];
        delete this.options[opt];
      }
      i++;
    }
    if (!this.gameClass) {
      throw new Error('Game class missing');
    }
    this.arena.style.position = "absolute";
    this.arena.style.backgroundColor = this.backgroundColor;
    this.arena.style.userSelect = "none";
    this.arena.style.webkitUserSelect = "none";
    this.arena.style.MozUserSelect = "none";
    this.createCanvas();
    this.initRenderer();
    if (this.autoResize) {
      this.autoResize = false;
      this.setAutoResize(true);
    } else {
      this.autoResize = true;
      this.setAutoResize(false);
    }
    if (this.disableTouchScroll) {
      document.addEventListener("touchmove", (function(event) {
        event.preventDefault();
      }), false);
      document.addEventListener("touchstart", (function(event) {
        event.preventDefault();
      }), false);
    }

    /*
    Global Loader instance which is created upon engine initialization
    @global
     */
    this.loader = new this.constructor.Loader();
    this.defaultTheme = this.options.themes[0];
    this.loader.onthemesloaded = function() {
      engine.initialize();
    };
    this.loader.loadThemes(this.options.themes);
  };


  /*
  Starts the engine
  
  @private
   */

  Engine.prototype.initialize = function() {
    this.frames = 0;
    this.last = new Date().getTime();
    this.now = this.last;
    this.gameTime = 0;
    this.currentId = 0;
    this.fps = 0;
    this.fpsCounter = 0;
    this.drawTime = 0;
    this.drawTimeCounter = 0;
    this.drawCalls = 0;
    this.roomList = [];
    this.masterRoom = new this.constructor.Room("master");
    this.currentRoom = new this.constructor.Room("main");
    this.defaultAnimationLoop = this.currentRoom.loops.eachFrame;
    this.defaultActivityLoop = this.currentRoom.loops.eachFrame;
    this.cameras.push(new this.constructor.Camera(new this.constructor.Geometry.Rectangle(0, 0, this.canvasResX, this.canvasResY), new this.constructor.Geometry.Rectangle(0, 0, this.canvasResX, this.canvasResY)));
    if (this.disableRightClick) {
      this.arena.oncontextmenu = function() {
        return false;
      };
    }
    this.keyboard = new this.constructor.Input.Keyboard();
    this.pointer = new this.constructor.Input.Pointer();
    if (this.pauseOnBlur) {
      window.addEventListener("blur", function() {
        engine.stopMainLoop();
      });
      window.addEventListener("focus", function() {
        engine.startMainLoop();
      });
    }
    new this.gameClass();
    this.startMainLoop();
    if (this.focusOnLoad) {
      window.focus();
    }
    if (this.onload) {
      this.onload();
    }
    console.log("jsEngine started");
  };


  /*
  Creates and prepares the game canvas for being used
   */

  Engine.prototype.createCanvas = function() {
    this.canvas = document.createElement("canvas");
    this.canvas.style.display = "block";
    this.canvas.width = this.canvasResX;
    this.canvas.height = this.canvasResY;
    this.arena.appendChild(this.canvas);
  };

  Engine.prototype.initRenderer = function() {
    if (!this.disableWebGL && (this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl"))) {
      console.log('Using WebGL renderer');
      this.renderer = new this.constructor.Renderers.WebGLRenderer(this.canvas);
    } else {
      console.log('Using canvas renderer');
      this.renderer = new this.constructor.Renderers.CanvasRenderer(this.canvas);
    }
  };


  /*
  Enables or disables canvas autoresize.
  
  @param {boolean} enable Decides whether autoresize should be enabled or disabled
   */

  Engine.prototype.setAutoResize = function(enable) {
    if (enable && !this.autoResize) {
      this.autoResize = true;
      this.autoResizeCanvas();
      window.addEventListener("resize", engine.autoResizeCanvas, false);
      window.addEventListener("load", engine.autoResizeCanvas, false);
    } else if (!enable && this.autoResize) {
      this.autoResize = false;
      window.removeEventListener("resize", engine.autoResizeCanvas, false);
      window.removeEventListener("load", engine.autoResizeCanvas, false);
      this.arena.style.top = "50%";
      this.arena.style.left = "50%";
      this.arena.style.marginLeft = -this.canvasResX / 2 + "px";
      this.arena.style.marginTop = -this.canvasResY / 2 + "px";
      this.canvas.style.width = this.canvasResX + "px";
      this.canvas.style.height = this.canvasResY + "px";
    }
  };


  /*
  Function for resizing the canvas. Not used if engine option "autoResizeCanvas" is false.
  
  @private
   */

  Engine.prototype.autoResizeCanvas = function() {
    var gameWH, h, w, windowWH;
    if (this !== engine) {
      engine.autoResizeCanvas();
      return;
    }
    windowWH = window.innerWidth / window.innerHeight;
    gameWH = this.canvasResX / this.canvasResY;
    if (windowWH > gameWH) {
      h = window.innerHeight;
      w = this.canvasResX / this.canvasResY * h;
    } else {
      w = window.innerWidth;
      h = this.canvasResY / this.canvasResX * w;
    }
    if (this.autoResizeLimitToResolution) {
      w = Math.min(w, this.canvasResX);
      h = Math.min(h, this.canvasResY);
    }
    this.arena.style.top = "50%";
    this.arena.style.left = "50%";
    this.arena.style.marginTop = -h / 2 + "px";
    this.arena.style.marginLeft = -w / 2 + "px";
    this.canvas.style.height = h + "px";
    this.canvas.style.width = w + "px";
  };

  Engine.prototype.perFrameSpeed = function(speed) {
    return speed * this.gameTimeIncrease / 1000;
  };


  /*
  Function for converting between speed units
  
  @param {number} speed The value to convert
  @param {number} from The unit to convert from. Can be SPEED_PIXELS_PER_SECOND or SPEED_PIXELS_PER_FRAME
  @param {number} to The unit to convert to. Can be SPEED_PIXELS_PER_SECOND or SPEED_PIXELS_PER_FRAME
  @return {number} The resulting value of the conversion
   */

  Engine.prototype.convertSpeed = function(speed, from, to) {
    if (speed === void 0) {
      throw new Error("Missing argument: speed");
    }
    if (speed instanceof this.constructor.Geometry.Vector) {
      return new this.constructor.Vector(this.convertSpeed(speed.x, from, to), this.convertSpeed(speed.y, from, to));
    }
    if (from == null) {
      from = this.constructor.Globals.SPEED_PIXELS_PER_SECOND;
    }
    if (to == null) {
      to = this.constructor.Globals.SPEED_PIXELS_PER_FRAME;
    }
    switch (from) {
      case this.constructor.Globals.SPEED_PIXELS_PER_SECOND:
        speed = speed * this.gameTimeIncrease / 1000;
        break;
      case this.constructor.Globals.SPEED_PIXELS_PER_FRAME:
        speed;
    }
    switch (to) {
      case this.constructor.Globals.SPEED_PIXELS_PER_SECOND:
        return speed = speed / this.gameTimeIncrease * 1000;
      case this.constructor.Globals.SPEED_PIXELS_PER_FRAME:
        return speed;
    }
  };


  /*
  Leaves the current room and opens another room
  
  @param {Room|string} room A pointer to the desired room, or a string representing the name of the room
  @param {number} transition A room transition constant or function
   */

  Engine.prototype.goToRoom = function(room, transition, transitionOptions) {
    var oldRoom;
    if (this.changingRoom) {
      return false;
    }
    if (room === void 0) {
      throw new Error("Missing argument: room");
    }
    if (typeof room === "string") {
      room = this.roomList.filter(function(r) {
        return r.name === room;
      })[0];
      if (!room) {
        throw new Error("Could not find a room with the specified name");
      }
    } else {
      if (this.roomList.indexOf(room) === -1) {
        throw new Error("Room is not on room list, has it been removed?");
      }
    }
    transition = (transition ? transition : ROOM_TRANSITION_NONE);
    oldRoom = this.currentRoom;
    engine.changingRoom = true;
    this.constructor.Helpers.RoomTransition[transition](oldRoom, room, transitionOptions, function() {
      engine.changingRoom = false;
      return engine.currentRoom = room;
    });
    return oldRoom;
  };


  /*
  Adds a room to the room list. This function is automatically called by the Room class' constructor.
  
  @private
  @param {Room} room The room which should be added
   */

  Engine.prototype.addRoom = function(room) {
    if (room === void 0) {
      throw new Error("Missing argument: room");
    }
    if (this.roomList.indexOf(room) !== -1) {
      throw new Error("Room is already on room list, rooms are automatically added upon instantiation");
    }
    this.roomList.push(room);
  };


  /*
  Removes a room from the room list.
  
  @param {Room|string} room A pointer to the room, or a string representing the name of the room, which should be removed
   */

  Engine.prototype.removeRoom = function(room) {
    var index;
    if (room === void 0) {
      throw new Error("Missing argument: room");
    }
    if (typeof room === "string") {
      room = this.roomList.getElementByPropertyValue("name", room);
      if (!room) {
        throw new Error("Could not find a room with the specified name");
      }
    }
    index = this.roomList.indexOf(room);
    if (index === -1) {
      throw new Error("Room is not on room list, has it been removed?");
    }
    if (room === this.masterRoom) {
      throw new Error("Cannot remove master room");
    } else {
      if (room === this.currentRoom) {
        throw new Error("Cannot remove current room, remember to leave the room first, by entering another room (use engine.goToRoom)");
      }
    }
    this.roomList.splice(i, 1);
  };


  /*
  Toggles if all sound effects should be muted.
  
  @param {boolean} muted Whether or not the sound effects should be muted
   */

  Engine.prototype.setSoundsMuted = function(muted) {
    muted = (muted !== void 0 ? muted : true);
    if (muted) {
      loader.getAllSounds().forEach(function(s) {
        s.stopAll();
      });
    }
    this.soundsMuted = muted;
  };


  /*
  Toggles if all music should be muted.
  
  @param {boolean} muted Whether of not the music should be muted
   */

  Engine.prototype.setMusicMuted = function(muted) {
    muted = (muted !== void 0 ? muted : true);
    if (muted) {
      loader.getAllMusic().forEach(function(m) {
        m.stop();
      });
    }
    this.musicMuted = muted;
  };


  /*
  Sets the default theme for the engine objects
  
  @param {string} themeName A string representing the name of the theme
  @param {boolean} enforce Whether or not the enforce the theme on objects for which another theme has already been set
   */

  Engine.prototype.setDefaultTheme = function(themeName, enforce) {
    if (themeName === void 0) {
      throw new Error("Missing argument: themeName");
    }
    if (loader.themes[themeName] === void 0) {
      throw new Error("Trying to set nonexistent theme: " + themeName);
    }
    enforce = (enforce !== void 0 ? enforce : false);
    this.defaultTheme = themeName;
    this.currentRoom.setTheme(void 0, enforce);
  };


  /*
  Starts the engine's main loop
   */

  Engine.prototype.startMainLoop = function() {
    if (this.running) {
      return;
    }
    this.now = new Date().getTime();
    this.running = true;
    engine.mainLoop();
  };


  /*
  Stops the engine's main loop
   */

  Engine.prototype.stopMainLoop = function() {
    if (!this.running) {
      return;
    }
    this.running = false;
  };


  /*
  The engine's main loop function (should not be called manually)
  
  @private
   */

  Engine.prototype.mainLoop = function() {
    var drawTime;
    if (!this.running) {
      return;
    }
    this.last = this.now;
    this.now = new Date().getTime();
    this.timeIncrease = this.now - this.last;
    this.gameTimeIncrease = this.timeIncrease * this.timeFactor;
    this.gameTime += this.gameTimeIncrease;
    this.frames++;
    if (this.resetCursorOnEachFrame) {
      this.pointer.resetCursor();
    }
    this.masterRoom.update();
    this.currentRoom.update();
    this.drawCalls = 0;
    drawTime = new Date().getTime();
    this.renderer.render(this.cameras);
    drawTime = new Date().getTime() - drawTime;
    if (this.fpsMsCounter < 1000) {
      this.fpsCounter++;
      this.drawTimeCounter += drawTime;
      this.fpsMsCounter += this.timeIncrease;
    } else {
      this.fps = this.fpsCounter;
      this.drawTime = this.drawTimeCounter / this.fpsCounter;
      this.fpsCounter = 0;
      this.drawTimeCounter = 0;
      this.fpsMsCounter = 0;
    }
    requestAnimationFrame(function(time) {
      engine.mainLoop(time);
    });
  };


  /*
  Sets the horizontal resolution of the main canvas
  
  @param {number} res The new horizontal resolution
   */

  Engine.prototype.setCanvasResX = function(res) {
    this.canvas.width = res;
    this.canvasResX = res;
    if (this.autoResize) {
      this.autoResizeCanvas();
    }
  };


  /*
  Sets the vertical resolution of the main canvas
  
  @param {number} res The new vertical resolution
   */

  Engine.prototype.setCanvasResY = function(res) {
    this.canvas.height = res;
    this.canvasResY = res;
    if (this.autoResize) {
      this.autoResizeCanvas();
    }
  };

  Engine.prototype.loadFileContent = function(filePath) {
    var req;
    req = new XMLHttpRequest();
    req.open("GET", filePath, false);
    req.send();
    return req.responseText;
  };


  /*
  Loads and executes one or multiple JavaScript file synchronously
  
  @param {string|string[]} filePaths A file path (string), or an array of file paths to load and execute as JavaScript
   */

  Engine.prototype.loadFiles = function(filePaths) {
    var i, req, script;
    if (typeof filePaths === "string") {
      filePaths = [filePaths];
    }
    i = 0;
    while (i < filePaths.length) {
      req = new XMLHttpRequest();
      req.open("GET", filePaths[i], false);
      req.send();
      script = document.createElement("script");
      script.type = "text/javascript";
      script.text = req.responseText + "\n//# sourceURL=/" + filePaths[i];
      document.body.appendChild(script);
      i++;
    }
    if (window.loadedFiles === void 0) {
      window.loadedFiles = [];
    }
    window.loadedFiles = window.loadedFiles.concat(filePaths);
  };


  /*
  Uses an http request to fetch the data from a file and runs a callback function with the file data as first parameter
  
  @param {string} url A URL path for the file to load
  @param {string|Object} params A parameter string or an object to JSON-stringify and use as URL parameter (will be send as "data=[JSON String]")
  @param {boolean} async Whether or not the request should be synchronous.
  @param {function} callback A callback function to run when the request has finished
  @param {object} caller An object to call the callback function as.
   */

  Engine.prototype.ajaxRequest = function(url, params, async, callback, caller) {
    var req;
    if (url === void 0) {
      throw new Error("Missing argument: url");
    }
    if (callback === void 0) {
      throw new Error("Missing argument: callback");
    }
    params = (params !== void 0 ? params : "");
    async = (async !== void 0 ? async : true);
    caller = (caller !== void 0 ? caller : window);
    if (typeof params !== "string") {
      params = "data=" + JSON.stringify(params);
    }
    req = new XMLHttpRequest();
    if (async) {
      req.onreadystatechange = function() {
        if (req.readyState === 4 && req.status === 200) {
          callback.call(caller, req.responseText);
        }
      };
    }
    req.open("POST", url, async);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send(params);
    if (!async) {
      if (req.readyState === 4 && req.status === 200) {
        callback.call(caller, req.responseText);
      } else {
        throw new Error("XMLHttpRequest failed: " + url);
      }
    }
  };


  /*
  Removes an object from all engine containers and timers
  
  param {Object} obj The object to remove
   */

  Engine.prototype.purge = function(obj) {
    var customLoop, len, name, room, _i, _len, _ref, _ref1;
    if (obj === void 0) {
      throw new Error("Cannot purge object: " + obj);
    }
    if (obj.children) {
      len = obj.children.length;
      while (len--) {
        engine.purge(obj.children[len]);
      }
    }
    _ref = this.roomList;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      room = _ref[_i];
      _ref1 = room.loops;
      for (name in _ref1) {
        customLoop = _ref1[name];
        customLoop.detachFunction(obj);
        customLoop.unschedule(obj);
        customLoop.unsubscribeFromOperation(void 0, obj);
        customLoop.removeAnimationsOfObject(obj);
      }
    }
    if (obj.parent) {
      obj.parent.removeChildren(obj);
    }
  };


  /*
  Downloads a screen dump of the main canvas. Very usable for creating game screenshots directly from browser consoles.
   */

  Engine.prototype.dumpScreen = function() {
    var a, dataString;
    dataString = this.canvas.toDataURL().replace(/image\/png/, "image/octet-stream");
    a = document.createElement("a");
    a.href = dataString;
    a.setAttribute("download", "screendump.png");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a, document.body);
  };

  return Engine;

})();



},{"./engine/camera":13,"./engine/custom-loop":14,"./engine/globals":15,"./engine/loader":16,"./engine/object-creator":17,"./engine/room":18,"./geometry/circle":19,"./geometry/line":20,"./geometry/polygon":21,"./geometry/rectangle":22,"./geometry/vector":23,"./helpers/matrix-calculation":25,"./helpers/mixin":26,"./helpers/room-transition":27,"./helpers/webgl":28,"./input/keyboard":29,"./input/pointer":30,"./mixins/animatable":31,"./renderer/canvas":33,"./renderer/webgl":34,"./sounds/effect":38,"./sounds/music":39,"./views/child":40,"./views/circle":41,"./views/collidable":42,"./views/container":43,"./views/game-object":44,"./views/line":45,"./views/polygon":46,"./views/rectangle":47,"./views/sprite":48,"./views/text-block":49}],13:[function(require,module,exports){

/*
Constructor for Camera class

@name Camera
@class A camera represents a part of the arena which is "projected" on to the engines main canvas.
the camera contains both a capture region and a projection region, the capture region decides which part of the arena to "capture".
The projection region decides where the captured region will be drawn on the main canvas.

@property {Math.Rectangle} captureRegion A rectangle which defines the region of the current room to capture
@property {Math.Rectangle} projectionRegion A rectangle which defines the region on the main canvas where the captured region should be drawn
@property {Room} room The room to capture from

@param {Math.Rectangle} captureRegion A rectangle which defines the region of the current room to capture
@param {Math.Rectangle} projectionRegion A rectangle which defines the region on the main canvas where the captured region should be drawn
@param {Room} room The room to capture from
 */
var Camera, Geometry;

module.exports = Camera = (function() {
  function Camera(captureRegion, projectionRegion, room) {
    if (!captureRegion instanceof Geometry.Rectangle) {
      throw new Error("Argument captureRegion should be of type: Rectangle");
    }
    if (!projectionRegion instanceof Geometry.Rectangle) {
      throw new Error("Argument projectionRegion should be of type: Rectangle");
    }
    this.captureRegion = captureRegion;
    this.projectionRegion = projectionRegion;
    this.room = room || engine.currentRoom;
    return;
  }

  return Camera;

})();

Geometry = {
  Rectangle: require('../geometry/rectangle')
};



},{"../geometry/rectangle":22}],14:[function(require,module,exports){

/*
@name CustomLoop
@class A loop class.
Contains a list of functions to run each time the loop executes.
For the loop to be executed, it will have to be added to the current room via the engine.currentRoom.addLoop.
A loop also has it's own time that is stopped whenever the loop is not executed. This makes it possible to schedule a function execution that will be "postponed" if the loop gets paused.

@property {number} framesPerExecution The number of frames between each execution of the custom loop
@property {function} maskFunction A function that will be run before each execution, if the function returns true the execution proceeds as planned, if not, the execution will not be run
@property {number} time The "local" time of the loop. The loop's time is stopped when the loop is not executed.
@property {number} execTime The time it took to perform the last execution

@param {number} [framesPerExecution=1] The number of frames between each execution of the custom loop
@param {function} [maskFunction=function(){}] A function that will be run before each execution, if the function returns true the execution proceeds as planned, if not, the execution will not be run
 */
var CustomLoop, Helpers;

module.exports = CustomLoop = (function() {
  function CustomLoop(framesPerExecution, maskFunction) {
    this.framesPerExecution = (framesPerExecution != null) || 1;
    this.maskFunction = (maskFunction != null) || function() {
      return true;
    };
    this.operationsQueue = [];
    this.operations = [];
    this.functionsQueue = [];
    this.functions = [];
    this.executionsQueue = [];
    this.executions = [];
    this.animations = [];
    this.lastFrame = window.engine.frames;
    this.time = 0;
  }


  /*
  Attaches a function to the loop.
  
  @param {Object} caller The object to run the function as
  @param {function} func The function to run on each execution of the custom loop
   */

  CustomLoop.prototype.attachOperation = function(name, func) {
    if (typeof func !== "function") {
      throw new Error("Argument func must be of type function");
    }
    this.operationsQueue.unshift({
      name: name,
      objects: [],
      operation: func
    });
  };

  CustomLoop.prototype.hasOperation = function(name, func) {
    var exec, _i, _j, _len, _len1, _ref, _ref1;
    _ref = this.operations;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      exec = _ref[_i];
      if ((!name || exec.name === name) && (!func || exec.operation === func)) {
        return true;
      }
    }
    _ref1 = this.operationsQueue;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      exec = _ref1[_j];
      if ((!name || exec.name === name) && (!func || exec.operation === func)) {
        return true;
      }
    }
    return false;
  };


  /*
  Detaches a function from the loop. If the same function is attached multiple times (which is never a good idea), only the first occurrence is detached.
  
  @param {Object} caller The object the function was run as
  @param {function} func The function to detach from the loop
  @return {boolean} Whether or not the function was found and detached
   */

  CustomLoop.prototype.detachOperation = function(name, func) {
    var exec, _i, _j, _len, _len1, _ref, _ref1;
    _ref = this.operations;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      exec = _ref[_i];
      if ((!name || exec.name === name) && (!func || exec.operation === func)) {
        this.operations.splice(i, 1);
        return true;
      }
    }
    _ref1 = this.operationsQueue;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      exec = _ref1[_j];
      if ((!name || exec.name === name) && (!func || exec.operation === func)) {
        this.operationsQueue.splice(i, 1);
        return true;
      }
    }
    return false;
  };

  CustomLoop.prototype.subscribeToOperation = function(name, object) {
    var exec, _i, _j, _len, _len1, _ref, _ref1;
    _ref = this.operations;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      exec = _ref[_i];
      if (!name || exec.name === name) {
        exec.objects.unshift(object);
        return true;
      }
    }
    _ref1 = this.operationsQueue;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      exec = _ref1[_j];
      if (!name || exec.name === name) {
        exec.objects.unshift(object);
        return true;
      }
    }
    return false;
  };

  CustomLoop.prototype.unsubscribeFromOperation = function(name, object) {
    var exec, i, _i, _j, _len, _len1, _ref, _ref1;
    _ref = this.operations;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      exec = _ref[_i];
      if (!name || exec.name === name) {
        i = exec.objects.indexOf(object);
        if (i !== -1) {
          exec.objects.splice(i, 1);
        }
      }
    }
    _ref1 = this.operationsQueue;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      exec = _ref1[_j];
      if (!name || exec.name === name) {
        i = exec.objects.indexOf(object);
        if (i !== -1) {
          exec.objects.splice(i, 1);
        }
      }
    }
    return false;
  };


  /*
  Attaches a function to the loop.
  
  @param {Object} caller The object to run the function as
  @param {function} func The function to run on each execution of the custom loop
   */

  CustomLoop.prototype.attachFunction = function(caller, func) {
    if (caller === void 0) {
      throw new Error("Missing argument: caller");
    }
    if (func === void 0) {
      throw new Error("Missing argument: func");
    }
    if (typeof func !== "function") {
      throw new Error("Argument func must be of type function");
    }
    this.functionsQueue.unshift({
      object: caller,
      activity: func
    });
  };


  /*
  Detaches a function from the loop. If the same function is attached multiple times all occurrences will be removed
  
  @param {Object} caller The object the function was run as
  @param {function} func The function to detach from the loop
  @return {boolean} Whether or not the function was found and detached
   */

  CustomLoop.prototype.detachFunction = function(caller, func) {
    var exec, i;
    i = this.functions.length;
    while (i--) {
      exec = this.functions[i];
      if ((!caller || exec.object === caller) && (!func || exec.activity === func)) {
        this.functions.splice(i, 1);
      }
    }
    i = this.functionsQueue.length;
    while (i--) {
      exec = this.functionsQueue[i];
      if ((!caller || exec.object === caller) && (!func || exec.activity === func)) {
        this.functionsQueue.splice(i, 1);
      }
    }
    return false;
  };


  /*
  Schedules a function to be run after a given amount of time in the loop.
  If the loop is paused before the execution has happened, the loop's time will stand still, and therefore the scheduled execution will not happen until the loop is started again.
  
  @param {Object} caller The object with which to run the function (by default the custom loop itself)
  @param {function} func The function to execute
  @param {number} delay The delay in ms
   */

  CustomLoop.prototype.schedule = function(caller, func, delay) {
    if (caller === void 0) {
      throw new Error("Missing argument: caller");
    }
    if (func === void 0) {
      throw new Error("Missing argument: function");
    }
    if (delay === void 0) {
      throw new Error("Missing argument: delay");
    }
    this.executionsQueue.unshift({
      func: func,
      execTime: this.time + delay,
      caller: caller
    });
  };


  /*
  Unschedules a single scheduled execution. If multiple similar executions exists they will all be removed.
  
  @param {function} func The function to unschedule an execution of
  @param {Object} caller The object with which the function was to be executed (by default the custom loop itself)
  @return {boolean} Whether or not the function was found and unscheduled
   */

  CustomLoop.prototype.unschedule = function(caller, func) {
    var exec, i;
    i = this.executions.length;
    while (i--) {
      exec = this.executions[i];
      if ((!caller || exec.object === caller) && (!func || exec.activity === func)) {
        this.executions.splice(i, 1);
      }
    }
    i = this.executionsQueue.length;
    while (i--) {
      exec = this.executionsQueue[i];
      if ((!caller || exec.object === caller) && (!func || exec.activity === func)) {
        this.executionsQueue.splice(i, 1);
      }
    }
    return false;
  };


  /*
  Unschedules all scheduled executions
  
  @return {function[]} An array of all the unscheduled functions
   */

  CustomLoop.prototype.unscheduleAll = function() {
    var removeArray;
    removeArray = [].concat(this.executions, this.executionsQueue);
    this.executions = [];
    this.executionsQueue = [];
    return removeArray;
  };


  /*
  Adds a new animation to the animator class (done automatically when running the animate-function).
  
  @private
  @param {object} animation An animation object
   */

  CustomLoop.prototype.addAnimation = function(animation) {
    var anim, cur, currentAnimations, i, propList, propName;
    if (animation === void 0) {
      throw new Error("Missing argument: animation");
    }
    anim = animation;
    anim.start = this.time;
    propList = Object.keys(anim.prop);
    currentAnimations = anim.obj.getAnimations();
    i = 0;
    while (i < currentAnimations.length) {
      cur = currentAnimations[i];
      for (propName in cur.prop) {
        if (cur.prop.hasOwnProperty(propName)) {
          if (propList.indexOf(propName) !== -1) {
            delete cur.prop[propName];
          }
        }
      }
      i++;
    }
    this.animations.push(anim);
  };


  /*
  Stop all animations of a specific object from the loop
  
  @param {Mixin.Animatable} object The object to stop all animations of
   */

  CustomLoop.prototype.removeAnimationsOfObject = function(object) {
    var i;
    i = this.animations.length;
    while (i--) {
      if (object === this.animations[i].obj) {
        this.animations.splice(i, 1);
      }
    }
  };


  /*
  Update the loop's animations in a single loop (called by updateAllLoops)
  
  @private
   */

  CustomLoop.prototype.updateAnimations = function() {
    var a, animId, propId, t;
    animId = this.animations.length - 1;
    while (animId > -1) {
      a = this.animations[animId];
      if (a === void 0) {
        continue;
      }
      t = this.time - a.start;
      if (t > a.duration) {
        this.animations.splice(animId, 1);
        for (propId in a.prop) {
          if (a.prop.hasOwnProperty(propId)) {
            a.obj[propId] = a.prop[propId].end;
          }
        }
        a.callback.call(a.obj);
      } else {
        for (propId in a.prop) {
          if (a.prop.hasOwnProperty(propId)) {
            a.obj[propId] = Helpers.Easing[a.easing](t, a.prop[propId].begin, a.prop[propId].end - a.prop[propId].begin, a.duration);
          }
        }
      }
      a.onStep && a.onStep();
      animId--;
    }
  };


  /*
  Executes the custom loop. This will execute all the functions that have been added to the loop, and checks all scheduled executions to see if they should fire.
  This function will automatically be executed, if the loop has been added to the current room, or the engine's masterRoom
   */

  CustomLoop.prototype.execute = function() {
    var exec, i;
    if (engine.frames % this.framesPerExecution || !this.maskFunction()) {
      return;
    }
    if (engine.frames - this.lastFrame === this.framesPerExecution) {
      this.time += engine.gameTimeIncrease;
    }
    this.lastFrame = engine.frames;
    this.last = engine.now;
    this.updateAnimations();
    i = this.executions.length;
    while (i--) {
      exec = this.executions[i];
      if (this.time >= exec.execTime) {
        exec.func.call(exec.caller);
        this.executions.splice(i, 1);
      }
    }
    i = this.operations.length;
    while (i--) {
      exec = this.operations[i];
      if (!exec) {
        continue;
      }
      if (!exec.operation) {
        throw new Error("Trying to exec non-existent attached operation");
      }
      exec.operation(exec.objects);
    }
    i = this.functions.length;
    while (i--) {
      exec = this.functions[i];
      if (!exec) {
        continue;
      }
      if (!exec.activity) {
        throw new Error("Trying to exec non-existent attached function");
      }
      exec.activity.call(exec.object);
    }
    this.operations = this.operations.concat(this.operationsQueue);
    this.operationsQueue = [];
    this.functions = this.functions.concat(this.functionsQueue);
    this.functionsQueue = [];
    this.executions = this.executions.concat(this.executionsQueue);
    this.executionsQueue = [];
  };

  return CustomLoop;

})();

Helpers = {
  Easing: require('../helpers/easing')
};



},{"../helpers/easing":24}],15:[function(require,module,exports){

/*
jseGlobals.js:
This file contains global JsEngine variables.
The purpose of the global variables is to be used as readable alternatives to magic numbers or strings.
 */
module.exports = {
  KEY_LEFT: 37,
  KEY_UP: 38,
  KEY_RIGHT: 39,
  KEY_DOWN: 40,
  KEY_SPACE: 32,
  KEY_BACKSPACE: 8,
  KEY_TAB: 9,
  KEY_ENTER: 13,
  KEY_SHIFT: 16,
  KEY_CONTROL: 17,
  KEY_ALT_LEFT: 18,
  KEY_CAPSLOCK: 20,
  KEY_ESCAPE: 27,
  KEY_ALT_RIGHT: 0,
  KEY_F1: 112,
  KEY_F2: 113,
  KEY_F3: 114,
  KEY_F4: 115,
  KEY_F5: 116,
  KEY_F6: 117,
  KEY_F7: 118,
  KEY_F8: 119,
  KEY_F9: 120,
  KEY_F10: 121,
  KEY_F11: 122,
  KEY_F12: 123,
  MOUSE_ANY: 0,
  MOUSE_1: 1,
  MOUSE_2: 2,
  MOUSE_3: 3,
  MOUSE_4: 4,
  MOUSE_5: 5,
  MOUSE_6: 6,
  MOUSE_7: 7,
  MOUSE_8: 8,
  MOUSE_9: 9,
  MOUSE_10: 10,
  TOUCH_ANY: 20,
  TOUCH_1: 21,
  TOUCH_2: 22,
  TOUCH_3: 23,
  TOUCH_4: 24,
  TOUCH_5: 25,
  TOUCH_6: 26,
  TOUCH_7: 27,
  TOUCH_8: 28,
  TOUCH_9: 29,
  TOUCH_10: 30,
  MOUSE_TOUCH_ANY: 100,
  SPEED_PIXELS_PER_SECOND: 1,
  SPEED_PIXELS_PER_FRAME: 2,
  OFFSET_TOP_LEFT: 0x100,
  OFFSET_TOP_CENTER: 0x80,
  OFFSET_TOP_RIGHT: 0x40,
  OFFSET_MIDDLE_LEFT: 0x20,
  OFFSET_MIDDLE_CENTER: 0x10,
  OFFSET_MIDDLE_RIGHT: 0x8,
  OFFSET_BOTTOM_LEFT: 0x4,
  OFFSET_BOTTOM_CENTER: 0x2,
  OFFSET_BOTTOM_RIGHT: 0x1,
  ALIGNMENT_LEFT: "left",
  ALIGNMENT_CENTER: "center",
  ALIGNMENT_RIGHT: "right",
  ROOM_TRANSITION_NONE: 'roomTransitionNone',
  ROOM_TRANSITION_SLIDE_SLIDE: 'roomTransitionSlideSlide',
  ROOM_TRANSITION_SQUEEZE_SLIDE: 'roomTransitionSqueezeSlide',
  ROOM_TRANSITION_SQUEEZE_SQUEEZE: 'roomTransitionSqueezeSqueeze',
  ROOM_TRANSITION_SLIDE_SQUEEZE: 'roomTransitionSlideSqueeze',
  EASING_LINEAR: 'linear',
  EASING_QUAD_IN: 'quadIn',
  EASING_QUAD_OUT: 'quadOut',
  EASING_QUAD_IN_OUT: 'quadInOut',
  EASING_POWER_IN: 'powerIn',
  EASING_POWER_OUT: 'powerOut',
  EASING_POWER_IN_OUT: 'powerInOut',
  EASING_SINUS_IN_OUT: 'sinusInOut'
};



},{}],16:[function(require,module,exports){

/*
Constructor for the Loader class.
This function will also create a load overlay which will not disappear until the hideOverlay is called.
Therefore, remember to call hideOverlay, when your game is ready to be shown.

@name Loader
@class Class for loading and storing resources.
On engine startup a Loader object is instantiated to the global variable "loader".
This loader object will also create a load overlay (the overlay saying "jsEngine loading"), this overlay will not be removed until the loader.hideOverlay() is called.
 */
var Geometry, Loader, Sounds;

module.exports = Loader = (function() {
  function Loader() {
    var name, value, _ref;
    this.images = {};
    this.loaded = {
      classes: []
    };
    this.themes = {
      External: {
        name: "External",
        inherit: [],
        music: {},
        sfx: {},
        images: {},
        masks: {},
        textures: {},
        resourcesCount: 0,
        resourcesLoaded: 0
      }
    };
    this.loadOverlay = document.createElement("div");
    _ref = {
      border: 0,
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 100,
      opacity: 1
    };
    for (name in _ref) {
      value = _ref[name];
      this.loadOverlay.style[name] = value;
    }
    this.loadOverlay.className = "load-overlay";
    this.loadOverlay.innerHTML = "<div class=\"load-overlay-text\">" + engine.loadText + "</div>";
    engine.arena.appendChild(this.loadOverlay);
    return;
  }


  /*
  Fades out the load overlay (which is automatically created by Loader's constructor).
  Remember to call this function, when your game is ready to be shown. Otherwise, the load overlay will never disappear.
  
  @param {function} callback A callback function to run when the overlay has finished fading out
   */

  Loader.prototype.hideOverlay = function(callback) {
    this.fadeCallback = callback;
    this.fadeOpacity = 1;
    this.fade = (function(_this) {
      return function() {
        var obj;
        obj = _this.loadOverlay;
        _this.fadeOpacity = Math.max(0, _this.fadeOpacity - 0.1);
        _this.fadeOpacity = Math.floor(_this.fadeOpacity * 100) / 100;
        obj.style.opacity = _this.fadeOpacity;
        if (_this.fadeOpacity !== 0) {
          setTimeout(function() {
            _this.fade();
          }, 30);
        } else {
          engine.arena.removeChild(_this.loadOverlay);
          delete _this.fade;
          if (_this.fadeCallback) {
            _this.fadeCallback();
          }
          delete _this.fadeCallback;
        }
      };
    })(this);
    this.fade();
  };


  /*
  Fetches an image from the Loader. This function will automatically be called by objects that implements the Sprite object.
  
  @param {string} resource The resource string of the image that should be fetched
  @param {string} themeName The name of the theme from which the image should be fetched. If unset, the engine's default theme will be used
  @return {HTMLImageElement} The image element corresponding to the resource string and theme
   */

  Loader.prototype.getImage = function(resource, themeName) {
    if (resource === void 0) {
      throw new Error("Missing argument: resource");
    }
    themeName = (themeName !== void 0 ? themeName : engine.defaultTheme);
    return this.getResource(resource, "images", themeName);
  };


  /*
  Fetches a sound from the Loader.
  
  @param {string} resource The resource string of the sound that should be fetched
  @param {string} themeName The name of the theme from which the sound should be fetched. If unset, the engine's default theme will be used
  @return {Sounds.Effect} A Sound object corresponding to the resource string and theme
   */

  Loader.prototype.getSound = function(resource, themeName) {
    if (resource === void 0) {
      throw new Error("Missing argument: resource");
    }
    themeName = (themeName !== void 0 ? themeName : engine.defaultTheme);
    return this.getResource(resource, "sfx", themeName);
  };


  /*
  Fetches a music track from the Loader.
  
  @param {string} resource The resource string of the track that should be fetched
  @param {string} themeName The name of the theme from which the track should be fetched. If unset, the engine's default theme will be used
  @return {Sounds.Music} A Music object corresponding to the resource string and theme
   */

  Loader.prototype.getMusic = function(resource, themeName) {
    if (resource === void 0) {
      throw new Error("Missing argument: resource");
    }
    themeName = (themeName !== void 0 ? themeName : engine.defaultTheme);
    return this.getResource(resource, "music", themeName);
  };


  /*
  Creates (or loads from cache) a mask for an image which is loaded by the Loader.
  This function is automatically used by the Collidable object for fetching masks for collision checking.
  
  @param {string} resource The resource string of the image that should be fetched
  @param {string} themeName The name of the theme from which the image should be fetched. If unset, the engine's default theme will be used
  @return {HTMLCanvasElement} A generated mask (canvas element) for the image element corresponding to the resource string and theme
   */

  Loader.prototype.getMask = function(resource, themeName) {
    var mask;
    if (resource === void 0) {
      throw new Error("Missing argument: resource");
    }
    themeName = (themeName !== void 0 ? themeName : engine.defaultTheme);
    mask = this.getResource(resource, "masks", themeName);
    if (mask) {
      return mask;
    } else {
      mask = this.generateMask(resource);
      this.themes[themeName].masks[resource] = mask;
      return mask;
    }
  };


  /*
  Fetches a resource from the Loader's cache. Used by the getImage-, getSound- and getMusic functions.
  
  @private
  @param {string} resource The resource string of the resource that should be fetched
  @param {string} typeString A string representing the resource type, possible values are: "image", "sfx" and "music"
  @param {string} themeName The name of the theme from which the image should be fetched. If unset, the engine's default theme will be used
  @return {HTMLImageElement|Sounds.Effect|Sounds.Music} The resource corresponding to the provided resource string, resource type and theme name
   */

  Loader.prototype.getResource = function(resource, typeString, themeName) {
    var i, inh, res;
    if (resource === void 0) {
      throw new Error("Missing argument: resource");
    }
    if (typeString === void 0) {
      throw new Error("Missing argument: typeString");
    }
    if (themeName === void 0) {
      throw new Error("Missing argument: themeName");
    }
    res = this.themes[themeName][typeString][resource];
    if (res === void 0) {
      i = 0;
      while (i < this.themes[themeName].inherit.length) {
        inh = this.themes[themeName].inherit[i];
        if (this.themes[inh]) {
          res = this.themes[inh][typeString][resource];
          if (res) {
            break;
          }
        }
        i++;
      }
    }
    if (res === void 0) {
      return false;
    } else {
      return res;
    }
  };


  /*
  Fetches all loaded images' resource strings (from all themes).
  
  @return {string[]} An array containing all loaded images' resource strings
   */

  Loader.prototype.getImageSources = function() {
    var currentDir, i, inheritTheme, loopThrough, object, sourceStrings;
    object = this.themes[engine.defaultTheme].images;
    sourceStrings = [];
    currentDir = [];
    loopThrough = function(object) {
      var name, pushStr;
      if (object.src !== void 0) {
        pushStr = currentDir.join(".");
        if (sourceStrings.indexOf(pushStr) === -1) {
          sourceStrings.push(pushStr);
        }
      } else {
        for (name in object) {
          if (object.hasOwnProperty(name)) {
            currentDir.push(name);
            loopThrough(object[name]);
            currentDir.pop();
          }
        }
      }
    };
    loopThrough(object);
    i = 0;
    while (i < this.themes[engine.defaultTheme].inherit.length) {
      inheritTheme = this.themes[this.themes[engine.defaultTheme].inherit[i]];
      if (inheritTheme !== void 0 && inheritTheme.images !== void 0) {
        loopThrough(inheritTheme.images);
      }
      i++;
    }
    return sourceStrings;
  };


  /*
  Fetches all loaded sounds' resource strings (from all themes).
  
  @return {string[]} An array containing all loaded sounds' resource strings
   */

  Loader.prototype.getAllSounds = function() {
    var res, resourceString, theme, themeName;
    res = [];
    for (themeName in this.themes) {
      if (this.themes.hasOwnProperty(themeName)) {
        theme = this.themes[themeName];
        for (resourceString in theme.sfx) {
          if (theme.sfx.hasOwnProperty(resourceString)) {
            res.push(theme.sfx[resourceString]);
          }
        }
      }
    }
    return res;
  };


  /*
  Fetches all loaded music tracks' resource strings (from all themes).
  
  @return {string[]} An array containing all loaded music tracks' resource strings
   */

  Loader.prototype.getAllMusic = function() {
    var res, resourceString, theme, themeName;
    res = [];
    for (themeName in this.themes) {
      if (this.themes.hasOwnProperty(themeName)) {
        theme = this.themes[themeName];
        for (resourceString in theme.music) {
          if (theme.music.hasOwnProperty(resourceString)) {
            res.push(theme.music[resourceString]);
          }
        }
      }
    }
    return res;
  };


  /*
  Reloads all classes. This function is very useful for applying code changes without having to refresh the browser, usually it has to be run multiple times though, to force the browser not to just load the files from its cache.
   */

  Loader.prototype.reloadAllClasses = function() {
    var i;
    for (i in this.loaded.classes) {
      if (this.loaded.classes.hasOwnProperty(i)) {
        engine.loadFiles(this.loaded.classes[i]);
      }
    }
  };


  /*
  Loads a list of themes. This function is automatically called by the Engine during its startup, for loading the themes specified by the launch options.
  
  @private
  @param {string[]} themeNames An array of theme names (as strings) to load
  @param {function} callback A callback function to run when all the themes has been loaded
   */

  Loader.prototype.loadThemes = function(themeNames, callback) {
    var i, name, req, _results;
    if (themeNames === void 0) {
      throw new Error("Missing argument: themeNames");
    }
    if (callback !== void 0) {
      this.onthemesloaded = callback;
    }
    i = 0;
    _results = [];
    while (i < themeNames.length) {
      name = themeNames[i];
      if (this.themes[name]) {
        continue;
      }
      req = new XMLHttpRequest();
      req.open("GET", engine.themesPath + "/" + name + "/theme.js");
      req.send();
      req.addEventListener('error', (function(_this) {
        return function() {
          throw new Error("Theme not found: " + name);
        };
      })(this));
      req.addEventListener('load', (function(_this) {
        return function() {
          var codeString;
          codeString = req.responseText + "\n//# sourceURL=/" + engine.themesPath + "/" + name + "/theme.js";
          eval("theme = " + codeString);
          if (theme.inherit.length) {
            _this.loadThemes(theme.inherit);
          }
          theme.inherit.push("External");
          _this.themes[name] = theme;
          theme.resourcesCount = 0;
          theme.resourcesLoaded = 0;
          theme.masks = {};
          theme.textures = {};
          _this.loadResources(theme, theme.images, "images");
          _this.loadResources(theme, theme.sfx, "sfx");
          return _this.loadResources(theme, theme.music, "music");
        };
      })(this));
      _results.push(i++);
    }
    return _results;
  };


  /*
  Loads resources to a theme. This function is used by loadThemes for caching the theme resources.
  
  @private
  @param {Object} theme A theme object to load the resources to
  @param {Object} object An object containing references to theme resources (like the subcategories of theme files)
  @param {string} typeString A string defining the resource type. Supported types are: "images", "sfx" and "music"
   */

  Loader.prototype.loadResources = function(theme, object, typeString) {
    var format, i, images, onload, path, res;
    if (theme === void 0) {
      throw new Error("Missing argument: theme");
    }
    if (object === void 0) {
      throw new Error("Missing argument: object");
    }
    if (typeString === void 0) {
      throw new Error("Missing argument: typeString");
    }
    onload = (function(_this) {
      return function(event) {
        if (event.target.hasAttribute("data-loaded")) {
          return;
        }
        event.target.setAttribute("data-loaded", "true");
        theme = _this.themes[event.target.getAttribute("data-theme")];
        theme.resourcesLoaded++;
        _this.checkAllLoaded();
      };
    })(this);
    for (path in object) {
      if (object.hasOwnProperty(path)) {
        switch (typeString) {
          case "images":
            res = new Image();
            res.cacheKey = "" + theme.name + "/" + path;
            format = object[path].match(/(png|jpg|jpeg|svg)/);
            if (format) {
              format = format[0];
            }
            res.src = engine.themesPath + "/" + theme.name + "/images/" + path + "." + format;
            images = object[path].match(/; *(\d+) *images?/);
            if (images) {
              res.imageLength = parseInt(images[1], 10);
            } else {
              res.imageLength = 1;
            }
            if (object[path].match(/; *bordered/)) {
              res.spacing = 1;
            } else {
              res.spacing = 0;
            }
            theme.images[path] = res;
            res.onload = onload;
            theme.resourcesCount++;
            break;
          case "sfx":
            format = false;
            i = 0;
            while (i < engine.host.supportedAudio.length) {
              if (object[path].search(engine.host.supportedAudio[i]) !== -1) {
                format = engine.host.supportedAudio[i];
              }
              i++;
            }
            if (!format) {
              console.log("Sound was not available in a supported format: " + theme.name + "/sfx/" + path);
              continue;
            }
            res = new Audio(engine.themesPath + "/" + theme.name + "/sfx/" + path + "." + format);
            theme.sfx[path] = new Sounds.Effect(res);
            if (engine.preloadSounds) {
              res.setAttribute("preload", "auto");
              res.addEventListener("canplaythrough", onload, false);
              theme.resourcesCount++;
            }
            break;
          case "music":
            format = false;
            i = 0;
            while (i < engine.host.supportedAudio.length) {
              if (object[path].search(engine.host.supportedAudio[i]) !== -1) {
                format = engine.host.supportedAudio[i];
              }
              i++;
            }
            if (!format) {
              throw new Error("Sound was not available in a supported format: " + theme.name + "/sfx/" + path);
            }
            res = new Audio(engine.themesPath + "/" + theme.name + "/music/" + path + "." + format);
            theme.music[path] = new Sounds.Music(res);
            if (engine.preloadSounds) {
              res.setAttribute("preload", "auto");
              res.addEventListener("canplaythrough", onload, false);
              theme.resourcesCount++;
            }
        }
        res.setAttribute("data-theme", theme.name);
        res.setAttribute("data-resourceString", path);
      }
    }
  };


  /*
  Loads an external resource to the built in External-theme
  
  @param {string} resourceString The proposed resource string of the resource when loaded
  @param {string} path The path to the resource's file
  @param {string} [typeString = "images"] A string defining the type of resource, can be: "images" (image file), sfx (sound effects) or "music" (background music)
  @param {function} [onLoaded = function () {}] A function to call when the resource has been loaded
  @param {string} [options = ""] A string defining the resource options (same as the string used for defining animations in a theme file)
   */

  Loader.prototype.loadExternalResource = function(resourceString, path, onLoaded, typeString, options) {
    var format, images, res, theme;
    if (resourceString === void 0) {
      throw new Error("Missing argument: resourceString");
    }
    if (path === void 0) {
      throw new Error("Missing argument: path");
    }
    typeString = typeString || "images";
    onLoaded = onLoaded || function() {};
    options = options || "";
    theme = this.themes.External;
    switch (typeString) {
      case "images":
        res = new Image();
        res.src = path;
        images = options.match(RegExp(" *(\\d+) *images?"));
        if (images) {
          res.imageLength = parseInt(images[1], 10);
        } else {
          res.imageLength = 1;
        }
        if (options.match(/; *bordered/)) {
          res.spacing = 1;
        } else {
          res.spacing = 0;
        }
        theme.images[resourceString] = res;
        res.onload = onLoaded;
        theme.resourcesCount++;
        break;
      case "sfx":
        format = path.match(/[^\.]*$/)[0];
        if (engine.host.supportedAudio.indexOf(format) === -1) {
          throw new Error("Sound format is not supported:", format);
        }
        res = new Audio(path);
        theme.sfx[resourceString] = new Sounds.Effect(res);
        if (engine.preloadSounds) {
          res.setAttribute("preload", "auto");
          res.addEventListener("canplaythrough", onLoaded, false);
          theme.resourcesCount++;
        }
        break;
      case "music":
        format = path.match(/[^\.]*$/)[0];
        if (engine.host.supportedAudio.indexOf(format) === -1) {
          throw new Error("Sound format is not supported:", format);
        }
        res = new Audio(path);
        theme.music[resourceString] = new Sounds.Music(res);
        if (engine.preloadSounds) {
          res.setAttribute("preload", "auto");
          res.addEventListener("canplaythrough", onLoaded, false);
          theme.resourcesCount++;
        }
    }
    res.setAttribute("data-theme", theme.name);
    res.setAttribute("data-resourceString", resourceString);
  };


  /*
  Generates a mask for an image specified by its resource string.
  This function is used by getMask to fetch and cache masks for each of the loaded images.
  
  @param {string} resourceString A resource string specifying the image to generate a mask for
  @param {number} alphaLimit An alpha value (0-255). Pixel having this alpha value or larger will become black on the mask, pixels with a value below the limit will become completely transparent
  @return {HTMLCanvasElement} A canvas element with the generated mask
   */

  Loader.prototype.generateMask = function(resourceString, alphaLimit) {
    var bitmap, bottom, canvas, ctx, data, image, left, length, pixel, right, top, x, y;
    if (resourceString === void 0) {
      throw new Error("Missing argument: resourceString");
    }
    alphaLimit = (alphaLimit !== void 0 ? alphaLimit : 255);
    image = engine.loader.getImage(resourceString);
    canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.imageLength = image.imageLength;
    canvas.cacheKey = "mask:" + image.cacheKey;
    ctx = canvas.getContext("2d");
    if (image === false) {
      throw new Error("Trying to create mask for non-existing resource: " + resourceString);
    }
    ctx.drawImage(image, 0, 0, image.width, image.height);
    bitmap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    data = bitmap.data;
    length = data.length / 4;
    top = bitmap.height;
    bottom = 0;
    left = bitmap.width;
    right = 0;
    pixel = 0;
    while (pixel < length) {
      if (data[pixel * 4 + 3] < alphaLimit) {
        data[pixel * 4] = 0;
        data[pixel * 4 + 1] = 0;
        data[pixel * 4 + 2] = 0;
        data[pixel * 4 + 3] = 0;
      } else {
        data[pixel * 4] = 0;
        data[pixel * 4 + 1] = 0;
        data[pixel * 4 + 2] = 0;
        data[pixel * 4 + 3] = 255;
        y = Math.floor(pixel / bitmap.width);
        x = pixel - y * bitmap.width;
        while (x >= Math.floor(image.width / image.imageLength)) {
          x -= Math.floor(image.width / image.imageLength) + image.spacing;
        }
        if (x < 0) {
          continue;
        }
        top = Math.min(y, top);
        bottom = Math.max(y + 1, bottom);
        left = Math.min(x, left);
        right = Math.max(x + 1, right);
      }
      pixel++;
    }
    ctx.putImageData(bitmap, 0, 0);
    canvas.boundingBox = new Geometry.Rectangle(left, top, right - left, bottom - top).getPolygon();
    return canvas;
  };


  /*
  Checks if all resources - of all themes - has been loaded. This check is automatically called any time a single resource has finished loading.
  
  @private
  @return {boolean} Whether or not all themes' resources has been successfully loaded
   */

  Loader.prototype.checkAllLoaded = function() {
    var i, loaded, theme, total;
    total = 0;
    loaded = 0;
    for (i in this.themes) {
      if (this.themes.hasOwnProperty(i)) {
        theme = this.themes[i];
        total += theme.resourcesCount;
        loaded += theme.resourcesLoaded;
      }
    }
    if (loaded === total) {
      if (this.onthemesloaded) {
        this.onthemesloaded();
      }
      return true;
    }
    return false;
  };

  return Loader;

})();

Sounds = {
  Music: require('../sounds/music'),
  Effect: require('../sounds/effect')
};

Geometry = {
  Rectangle: require('../geometry/rectangle')
};



},{"../geometry/rectangle":22,"../sounds/effect":38,"../sounds/music":39}],17:[function(require,module,exports){
var ObjectCreator, Views,
  __slice = [].slice;

module.exports = ObjectCreator = (function() {
  function ObjectCreator(container) {
    this.container = container;
  }

  ObjectCreator.prototype.Container = function() {
    var a, children, o;
    children = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    a = arguments;
    o = new Views.Container;
    o.addChildren.apply(o, children);
    this.container.addChildren(o);
    return o;
  };

  ObjectCreator.prototype.Circle = function(x, y, radius, fillStyle, strokeStyle, lineWidth) {
    var o;
    o = new Views.Circle(x, y, radius, fillStyle, strokeStyle, lineWidth);
    this.container.addChildren(o);
    return o;
  };

  ObjectCreator.prototype.Line = function(startVector, endVector, strokeStyle, lineWidth, lineCap) {
    var o;
    o = new Views.Line(startVector, endVector, strokeStyle, lineWidth, lineCap);
    this.container.addChildren(o);
    return o;
  };

  ObjectCreator.prototype.Polygon = function(points, fillStyle, strokeStyle, lineWidth) {
    var o;
    o = new Views.Polygon(points, fillStyle, strokeStyle, lineWidth);
    this.container.addChildren(o);
    return o;
  };

  ObjectCreator.prototype.Rectangle = function(x, y, width, height, fillStyle, strokeStyle, lineWidth) {
    var o;
    o = new Views.Rectangle(x, y, width, height, fillStyle, strokeStyle, lineWidth);
    this.container.addChildren(o);
    return o;
  };

  ObjectCreator.prototype.TextBlock = function(string, x, y, width, additionalProperties) {
    var o;
    o = new Views.TextBlock(string, x, y, width, additionalProperties);
    this.container.addChildren(o);
    return o;
  };

  ObjectCreator.prototype.Sprite = function(source, x, y, direction, additionalProperties) {
    var o;
    o = new Views.Sprite(source, x, y, direction, additionalProperties);
    this.container.addChildren(o);
    return o;
  };

  ObjectCreator.prototype.Collidable = function(source, x, y, direction, additionalProperties) {
    var o;
    o = new Views.Collidable(source, x, y, direction, additionalProperties);
    this.container.addChildren(o);
    return o;
  };

  ObjectCreator.prototype.GameObject = function(source, x, y, direction, additionalProperties) {
    var o;
    o = new Views.GameObject(source, x, y, direction, additionalProperties);
    this.container.addChildren(o);
    return o;
  };

  return ObjectCreator;

})();

Views = {
  Circle: require('../views/circle'),
  Collidable: require('../views/collidable'),
  Container: require('../views/container'),
  GameObject: require('../views/game-object'),
  Line: require('../views/line'),
  Polygon: require('../views/polygon'),
  Rectangle: require('../views/rectangle'),
  Sprite: require('../views/sprite'),
  TextBlock: require('../views/text-block')
};



},{"../views/circle":41,"../views/collidable":42,"../views/container":43,"../views/game-object":44,"../views/line":45,"../views/polygon":46,"../views/rectangle":47,"../views/sprite":48,"../views/text-block":49}],18:[function(require,module,exports){
var CustomLoop, Room, Views,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Views = {
  Container: require('../views/container')
};


/*
Constructor for the Room class

@name Room
@class A room is the space wherein game objects reside.
A room holds a list of objects to draw, and a list of custom loops.
If a room is set as the engine's current room (engine.currentRoom); its objects will be drawn, and its custom loops will be executed each time the engine's main loop executes.
The engine also has a master room (engine.masterRoom), which is persistent throughout a game (this is the room where you would add persistent objects and custom loops)
@augments View.Container

@property {string} name The name of the room
@property {function} onEntered A function which will be executed when the room is entered
@property {function} onLeft A function which will be executed when the room is left
@property {Object} loops An object containing the custom loops which has been added to the room

@param {string} name The name of the room. You can use this name later, to enter the room or to remove it
@param {function} [onEntered=function () {}] A function to run when the room is entered (set as the engine's current room)
@param {function} [onLeft=function () {}] A function to run when the room is left
 */

module.exports = Room = (function(_super) {
  __extends(Room, _super);

  function Room(name, onEntered, onLeft) {
    Room.__super__.constructor.call(this);
    this.name = (name ? name : engine.roomList.length);
    this.onEntered = (onEntered !== void 0 ? onEntered : function() {});
    this.onLeft = (onLeft !== void 0 ? onLeft : function() {});
    this.loops = {};
    this.paused = false;
    this.addLoop("eachFrame", new CustomLoop());
    engine.addRoom(this);
    return;
  }


  /*
  Prevents all the room's loops from being executed, this function is used by the engine before making room transitions
   */

  Room.prototype.pause = function() {
    this.paused = true;
  };


  /*
  Enables the room's loops after again after the room has been paused.
   */

  Room.prototype.play = function() {
    this.paused = false;
  };


  /*
  Updates all the room's loops.
  
  @private
   */

  Room.prototype.update = function() {
    var l, name, _ref;
    if (this.paused) {
      return;
    }
    _ref = this.loops;
    for (name in _ref) {
      l = _ref[name];
      l.execute();
    }
  };


  /*
  Adds a custom loop to the room.
  After being added, the loop will be executed in each frame.
  
  @param {string} name The name the use for the custom loop in the room. When added the loop can be accessed with: [The room].loops[name]
  @param {CustomLoop} loop The loop to add
   */

  Room.prototype.addLoop = function(name, loop_) {
    if (loop_ === void 0) {
      throw new Error("Missing argument: loop");
    }
    if (name === void 0) {
      throw new Error("Missing argument: name");
    }
    if (this.loops[name] !== void 0) {
      throw new Error("Name is taken: " + name);
    }
    this.loops[name] = loop_;
  };


  /*
  Removes a custom loop from the room.
  
  @param {string} name The name that the custom loop has been added as
   */

  Room.prototype.removeLoop = function(name) {
    if (name === void 0) {
      throw new Error("Missing argument: name");
    }
    if (name === "eachFrame") {
      throw new Error("The \"eachFrame\" loop cannot be removed");
    }
    delete this.loops[name];
  };


  /*
  Delete the remove-method which was inherited from View
   */

  Room.prototype.remove = void 0;

  return Room;

})(Views.Container);

CustomLoop = require('./custom-loop');



},{"../views/container":43,"./custom-loop":14}],19:[function(require,module,exports){
var Circle, Geometry, Helpers, Mixins;

Helpers = {
  Mixin: require('../helpers/mixin')
};

Mixins = {
  Animatable: require('../mixins/animatable')
};


/*
Constructor for Circle class, uses the set function, to set the properties of the circle.

@name Geometry.Circle
@class A math class which is used for handling circles
@augments Mixin.Animatable

@property {number} x The circle's horizontal position
@property {number} y The circle's vertical position
@property {number} radius The circle's radius

@param {number} x The x-coordinate for the center of the circle
@param {number} y The y-coordinate for the center of the circle
@param {number} radius The radius for the circle
 */

module.exports = Circle = (function() {
  Helpers.Mixin.mixin(Circle, Mixins.Animatable);

  function Circle(x, y, radius) {
    this.set(x, y, radius);
    return;
  }


  /*
  Sets the properties of the circle.
  
  @param {number} x The x-coordinate for the center of the circle
  @param {number} y The y-coordinate for the center of the circle
  @param {number} radius The radius for the circle
  @return {Geometry.Circle} The resulting Circle object (itself)
   */

  Circle.prototype.set = function(x, y, radius) {
    x = (x !== void 0 ? x : 0);
    y = (y !== void 0 ? y : 0);
    radius = (radius !== void 0 ? radius : 0);
    this.x = x;
    this.y = y;
    this.radius = radius;
    return this;
  };


  /*
  Copies the Circle object.
  
  @return {Geometry.Circle} A copy of the Circle object (which can be modified without changing the original object)
   */

  Circle.prototype.copy = function() {
    return new this.constructor(this.x, this.y, this.radius);
  };


  /*
  Moves the Circle by adding a value to its x-coordinate and another value to its y-coordinate.
  
  @param {number} x The value to add to the x-coordinate (can be negative)
  @param {number} y The value to add to the y-coordinate (can be negative)
  @return {Geometry.Circle} The resulting Circle object (itself)
   */

  Circle.prototype.move = function(x, y) {
    if (typeof x !== "number") {
      throw new Error("Argument x should be of type: Number");
    }
    if (typeof y !== "number") {
      throw new Error("Argument y should be of type: Number");
    }
    this.x += x;
    this.y += y;
    return this;
  };


  /*
  Moves the Circle to a fixed position by setting its x- and y-coordinates.
  
  @param {number} x The x-coordinate of the position to move the Circle to
  @param {number} y The y-coordinate of the position to move the Circle to
  @return {Geometry.Circle} The resulting Circle object (itself)
   */

  Circle.prototype.moveTo = function(x, y) {
    if (typeof x !== "number") {
      throw new Error("Argument x should be of type: Number");
    }
    if (typeof y !== "number") {
      throw new Error("Argument y should be of type: Number");
    }
    this.x = x;
    this.y = y;
    return this;
  };


  /*
  Scales the Circle object by multiplying it radius with a factor.
  Please notice that, opposite to the Polygon and Line objects, the position of the Circle will not be changed by scaling it, since the center of the circle will not be scaled.
  Also: since ellipses are not supported yet, circles cannot be scaled with various factors horizontally and vertically, like the other geometric objects.
  
  @param {number} factor A factor with which to scale the Circle
  @return {Geometry.Circle} The resulting Circle object (itself)
   */

  Circle.prototype.scale = function(factor) {
    if (typeof factor !== "number") {
      throw new Error("Argument factor should be of type Number");
    }
    this.radius *= factor;
    return this;
  };


  /*
  Calculates the perimeter of the circle
  
  @return {number} The perimeter of the Circle
   */

  Circle.prototype.getPerimeter = function() {
    return this.radius * 2 * PI;
  };


  /*
  Calculates the area of the Circle.
  
  @return {number} The area of the Circle
   */

  Circle.prototype.getArea = function() {
    return pow(this.radius) * PI;
  };


  /*
  Calculates the shortest distance from the Circle object to another geometric object
  
  @param {Geometry.Vector|Geometry.Line|Geometry.Circle|Geometry.Rectangle|Geometry.Polygon} object The object to calculate the distance to
  @return {number} The distance
   */

  Circle.prototype.getDistance = function(object) {
    if (object instanceof Geometry.Vector) {
      return Math.max(0, object.getDistance(new Geometry.Vector(this.x, this.y)) - this.radius);
    } else if (object instanceof Geometry.Line) {
      return Math.max(0, object.getDistance(new Geometry.Vector(this.x, this.y)) - this.radius);
    } else if (object instanceof this.constructor) {
      return Math.max(0, new Geometry.Vector(this.x, this.y).getDistance(new Geometry.Vector(object.x, object.y)) - (this.radius + object.radius));
    } else if (object instanceof Geometry.Rectangle) {
      return object.getDistance(this);
    } else if (object instanceof Geometry.Polygon) {
      return object.getDistance(this);
    } else {
      throw new Error("Argument object should be of type: Vector, Line, Circle, Rectangle or Polygon");
    }
  };


  /*
  Checks whether or not the Circle contains another geometric object.
  
  @param {Geometry.Vector|Geometry.Line|Geometry.Circle|Geometry.Rectangle|Geometry.Polygon} object A geometric object to check
  @return {boolean} True if the Rectangle contains the checked object, false if not
   */

  Circle.prototype.contains = function(object) {
    var cDist, i;
    if (object instanceof Geometry.Vector) {
      return object.copy().move(-this.x, -this.y).getLength() < this.radius;
    } else if (object instanceof Geometry.Line) {
      return this.contains(object.a) && this.contains(object.b);
    } else if (object instanceof this.constructor) {
      cDist = new Geometry.Vector(object.x, object.y).move(-this.x, -this.y).getLength();
      return cDist + object.radius < this.radius;
    } else if (object instanceof Geometry.Rectangle) {
      return this.contains(object.getPolygon());
    } else if (object instanceof Geometry.Polygon) {
      i = 0;
      while (i < object.points.length) {
        if (!this.contains(object.points[i])) {
          return false;
        }
        i++;
      }
      return true;
    } else {
      throw new Error("Argument object has to be of type: Vector, Line, Circle, Rectangle or Polygon");
    }
  };


  /*
  Checks whether or not the Circle intersects with another geometric object.
  
  @param {Geometry.Line|Geometry.Circle|Geometry.Rectangle|Geometry.Polygon} object A geometric object to check. Supported objects are
  @return {boolean} True if the Circle intersects with the checked object, false if not
   */

  Circle.prototype.intersects = function(object) {
    if (object instanceof Geometry.Line) {
      return this.contains(object) === false && object.getDistance(this) <= 0;
    } else if (object instanceof this.constructor) {
      return !this.contains(object) && !object.contains(this) && new Geometry.Vector(this.x, this.y).getDistance(new Geometry.Vector(object.x, object.y)) <= this.radius + object.radius;
    } else if (object instanceof Geometry.Rectangle) {
      return object.getPolygon().intersects(this);
    } else if (object instanceof Geometry.Polygon) {
      return object.intersects(this);
    } else {
      throw new Error("Argument object has to be of type: Line, Circle, Rectangle or Polygon");
    }
  };

  return Circle;

})();

Geometry = {
  Line: require('./line'),
  Rectangle: require('./rectangle'),
  Polygon: require('./polygon'),
  Vector: require('./vector')
};



},{"../helpers/mixin":26,"../mixins/animatable":31,"./line":20,"./polygon":21,"./rectangle":22,"./vector":23}],20:[function(require,module,exports){

/*
Constructor for the Line class. Uses setFromVectors to create the line's start and end points

@name Geometry.Line
@class A math class which is used for handling lines
@augments Mixin.Animatable

@property {Geometry.Vector} a The line's starting point
@property {Geometry.Vector} b The line's ending point

@param {Geometry.Vector} startVector A Vector representing the start point of the line
@param {Geometry.Vector} endVector A Vector representing the end point of the line
 */
var Geometry, Line;

module.exports = Line = (function() {
  function Line(startVector, endVector) {
    startVector = (startVector !== void 0 ? startVector : new Geometry.Vector());
    endVector = (endVector !== void 0 ? endVector : new Geometry.Vector());
    this.setFromVectors(startVector, endVector);
    return;
  }


  /*
  Sets the start- and end points from two Vector's.
  
  @param {Geometry.Vector} startVector A Vector representing the start point of the line
  @param {Geometry.Vector} endVector A Vector representing the end point of the line
  @return {Geometry.Line} The resulting Line object (itself)
   */

  Line.prototype.setFromVectors = function(startVector, endVector) {
    if (!startVector instanceof Geometry.Vector) {
      throw new Error("Argument startVector should be of type: Vector");
    }
    if (!endVector instanceof Geometry.Vector) {
      throw new Error("Argument endVector should be of type: Vector");
    }
    this.a = startVector;
    this.b = endVector;
    return this;
  };


  /*
  Sets the start- and end points directly from x- and y-coordinates.
  
  @param {number} x1 The start points' x-coordinate
  @param {number} y1 The start points' y-coordinate
  @param {number} x2 The end points' x-coordinate
  @param {number} y2 The end points' y-coordinate
  @return {Geometry.Line} The resulting Line object (itself)
   */

  Line.prototype.setFromCoordinates = function(x1, y1, x2, y2) {
    x1 = (x1 !== void 0 ? x1 : 0);
    y1 = (y1 !== void 0 ? y1 : 0);
    x2 = (x2 !== void 0 ? x2 : 0);
    y2 = (y2 !== void 0 ? y2 : 0);
    this.a = new Geometry.Vector(x1, y1);
    this.b = new Geometry.Vector(x2, y2);
    return this;
  };


  /*
  Copies the Line object
  
  @return {Geometry.Line} A copy of the Line object (which can be modified without changing the original object)
   */

  Line.prototype.copy = function() {
    return new this.constructor(this.a, this.b);
  };


  /*
  Moves the line by moving the start- and the end point
  
  @param {number} x The value to add to both points' x-coordinates
  @param {number} y The value to add to both points' y-coordinates
  @return {Geometry.Line} The resulting Line object (itself)
   */

  Line.prototype.move = function(x, y) {
    this.a.move(x, y);
    this.b.move(x, y);
    return this;
  };


  /*
  Rotates the line around the zero-vector.
  
  @param {number} direction The number of radians to rotate the line
  @return {Geometry.Line} The resulting Line object (itself)
   */

  Line.prototype.rotate = function(direction) {
    if (typeof direction !== "number") {
      throw new Error("Argument direction should be of type: Number");
    }
    this.a.rotate(direction);
    this.b.rotate(direction);
    return this;
  };


  /*
  Scales the line by multiplying the start- and end points
  
  @param {number} scaleH A factor with which to scale the Line horizontally.
  @param {number} [scaleV=scaleH] A factor with which to scale the Line vertically
  @return {Geometry.Line} The resulting Line object (itself)
   */

  Line.prototype.scale = function(scaleH, scaleV) {
    this.a.scale(scaleH, scaleV);
    this.b.scale(scaleH, scaleV);
    return this;
  };


  /*
  Adds a vector to the start- and end points of the line.
  Can by used for the same purpose as move, but takes a vector as argument.
  
  @param {Geometry.Vector} vector A vector to add to the line's start- and end points
  @return {Geometry.Line} The resulting Line object (itself)
   */

  Line.prototype.add = function(vector) {
    this.a.add(vector);
    this.b.add(vector);
    return this;
  };


  /*
  Subtracts a vector from the start- and end points of the line.
  
  @param {Geometry.Vector} vector A vector to subtract from the line's start- and end points
  @return {Geometry.Line} The resulting Line object (itself)
   */

  Line.prototype.subtract = function(vector) {
    this.a.substract(vector);
    this.b.substract(vector);
    return this;
  };


  /*
  Divides the start- and end points of the line with a vector.
  
  @param {Geometry.Vector} vector A vector to divide the line's start- and end points with
  @return {Geometry.Line} The resulting Line object (itself)
   */

  Line.prototype.divide = function(vector) {
    this.a.divide(vector);
    this.b.divide(vector);
    return this;
  };


  /*
  Multiplies the start- and end points of the line with a vector.
  
  @param {Geometry.Vector} vector A vector to multiply the line's start- and end points with
  @return {Geometry.Line} The resulting Line object (itself)
   */

  Line.prototype.multiply = function(vector) {
    this.a.multiply(vector);
    this.b.multiply(vector);
    return this;
  };


  /*
  Checks whether the line intersects with another line or polygon.
  
  @param {Geometry.Line|Geometry.Circle|Geometry.Rectangle|Geometry.Polygon} object Geometric object to check for an intersection with
  @return {boolean} True if the checked object intersects with the line, false if not
   */

  Line.prototype.intersects = function(object) {
    var c1, c2;
    if (object instanceof this.constructor) {
      c1 = (this.b.x - this.a.x) * (object.a.y - this.b.y) - (object.a.x - this.b.x) * (this.b.y - this.a.y);
      c2 = (this.b.x - this.a.x) * (object.b.y - this.b.y) - (object.b.x - this.b.x) * (this.b.y - this.a.y);
      if (c1 * c2 > 0) {
        return false;
      }
      c1 = (object.b.x - object.a.x) * (this.a.y - object.b.y) - (this.a.x - object.b.x) * (object.b.y - object.a.y);
      c2 = (object.b.x - object.a.x) * (this.b.y - object.b.y) - (this.b.x - object.b.x) * (object.b.y - object.a.y);
      return c1 * c2 < 0;
    } else if (object instanceof Geometry.Circle) {
      return object.intersects(this);
    } else if (object instanceof Geometry.Rectangle) {
      return object.getPolygon().intersects(this);
    } else if (object instanceof Geometry.Polygon) {
      return object.intersects(this);
    } else {
      throw new Error("Argument object should be of type: Line, Rectangle, Circle or Polygon");
    }
  };


  /*
  Calculates the length of the line.
  
  @return {number} The length of the line
   */

  Line.prototype.getLength = function() {
    return this.b.copy().subtract(this.a).getLength();
  };


  /*
  Calculates the shortest distance from the Line object to another geometric object
  
  @param {Geometry.Vector|Geometry.Line|Geometry.Circle|Geometry.Rectangle|Geometry.Polygon} object The object to calculate the distance to
  @return {number} The distance
   */

  Line.prototype.getDistance = function(object) {
    var ab, ac, ba, bc;
    if (object instanceof Geometry.Vector) {
      ba = this.a.copy().subtract(this.b);
      ab = this.b.copy().subtract(this.a);
      bc = object.copy().subtract(this.b);
      ac = object.copy().subtract(this.a);
      if (ab.getDot(bc) > 0) {
        return bc.getLength();
      } else if (ba.getDot(ac) > 0) {
        return ac.getLength();
      } else {
        return Math.abs(ab.getCross(ac) / ab.getLength());
      }
    } else if (object instanceof this.constructor) {
      if (this.intersects(object)) {
        return 0;
      } else {
        return Math.min(this.getDistance(object.a), this.getDistance(object.b), object.getDistance(this.a), object.getDistance(this.b));
      }
    } else if (object instanceof Geometry.Rectangle) {
      return object.getDistance(this);
    } else if (object instanceof Geometry.Circle) {
      return object.getDistance(this);
    } else {
      throw new Error("Argument object should be of type: Vector, Line, Circle, Rectangle or Polygon");
    }
  };


  /*
  Creates a rectangular polygon based on the line segment and a width
  
  @param {Number} width The wished width of the created polygon
  @param {String} lineCap The type of line capsulation, supported types are: "butt", "square", "round"
   */

  Line.prototype.createPolygonFromWidth = function(width, lineCap) {
    var a, angle, b, c, d, i, ort, points, r, segmentRad, startAngle, v;
    lineCap = lineCap || "butt";
    v = this.a.copy().subtract(this.b);
    v.set(v.y, -v.x);
    r = (width / 2) / v.getLength();
    ort = v.scale(r);
    if (lineCap !== "round") {
      a = this.a.copy().add(ort);
      b = this.a.copy().subtract(ort);
      c = this.b.copy().subtract(ort);
      d = this.b.copy().add(ort);
      if (lineCap === "square") {
        a.move(-ort.y, ort.x);
        b.move(-ort.y, ort.x);
        c.move(ort.y, -ort.x);
        d.move(ort.y, -ort.x);
      }
      return new Geometry.Polygon([a, b, c, d]);
    } else {
      points = new Array(32);
      startAngle = ort.getDirection();
      width /= 2;
      segmentRad = Math.PI / 15;
      i = 0;
      while (i < 16) {
        angle = startAngle + segmentRad * i;
        points[i] = new Geometry.Vector(this.a.x + width * Math.cos(angle), this.a.y + width * Math.sin(angle));
        i++;
      }
      i = 0;
      while (i < 16) {
        angle = startAngle + segmentRad * (i + 15);
        points[i + 16] = new Geometry.Vector(this.b.x + width * Math.cos(angle), this.b.y + width * Math.sin(angle));
        i++;
      }
      return new Geometry.Polygon(points);
    }
  };


  /*
  Creates a polygon with the same points as the line.
  
  @return {Geometry.Polygon} The created Polygon object
   */

  Line.prototype.getPolygon = function() {
    return new Geometry.Polygon([this.a.copy(), this.b.copy()]);
  };

  return Line;

})();

Geometry = {
  Circle: require('./circle'),
  Rectangle: require('./rectangle'),
  Polygon: require('./polygon'),
  Vector: require('./vector')
};



},{"./circle":19,"./polygon":21,"./rectangle":22,"./vector":23}],21:[function(require,module,exports){
var Geometry, Polygon;

module.exports = Polygon = (function() {

  /*
  The constructor for the Polygon class. Uses the setFromPoints-function to set the points of the polygon.
  
  @name Geometry.Polygon
  @class A math class which is used for handling polygons
  @property {Geometry.Vector[]} points An array of the polygon's points. Each point is connect to the previous- and next points, and the first and last points are connected
  @param {Geometry.Vector[]} points An array of Vector's which are to be used as points for the polygon. Keep in mind that the polygon will NOT copy the points, so changing another reference to one of the added points will change the point inside the polygon.
   */
  function Polygon(points) {
    this.setFromPoints(points);
    return;
  }


  /*
  Sets the points of the polygon from Vector's.
  
  @param {Geometry.Vector[]} points An array of Vector's which are to be used as points for the polygon. Keep in mind that the polygon will NOT copy the points, so changing another reference to one of the added points will change the point inside the polygon.
  @return {Object} The resulting Polygon object (itself)
   */

  Polygon.prototype.setFromPoints = function(points) {
    this.points = points;
    return this;
  };


  /*
  Sets the points of the polygon from a list on point coordinates. Please notice that this function can take as an infinite number of x- and y coordinates as arguments.
  
  @param {number} x1 The x-coordinate for the first point in the polygon
  @param {number} y1 The y-coordinate for the first point in the polygon
  @param {number} x2 The x-coordinate for the second point ...
  @param {number} y2 The y-coordinate for the second point ...
  @param {number} x3 The x-coordinate for the third point ...
  @param {number} y3 The y-coordinate for the third point ...
  @return {Polygon} The resulting Polygon object (itself)
   */

  Polygon.prototype.setFromCoordinates = function(x1, y1, x2, y2, x3, y3) {
    var i, numPoints, x, y;
    numPoints = Math.floor(arguments.length / 2);
    this.points = [];
    i = 0;
    while (i < numPoints) {
      x = arguments[i * 2];
      y = arguments[i * 2 + 1];
      if (typeof x !== "number" || typeof y !== "number") {
        throw new Error("All arguments should be of type: Number");
      }
      this.points.push(new Geometry.Vector(x, y));
      i++;
    }
    return this;
  };


  /*
  Gets the polygons points as a list of coordinates
  
  @return {Array} An array of x- and y values
   */

  Polygon.prototype.getCoordinates = function() {
    var coords, i, len;
    coords = [];
    len = this.points.length;
    i = 0;
    while (i < len) {
      coords.push(this.points[i].x, this.points[i].y);
      i++;
    }
    return coords;
  };


  /*
  Moves the Polygon object by moving all of its points.
  
  @param {number} x The value to add to all points' x-coordinates
  @param {number} y The value to add to all points' y-coordinates
  @return {Geometry.Polygon} The resulting Polygon object (itself)
   */

  Polygon.prototype.move = function(x, y) {
    if (typeof x !== "number") {
      throw new Error("Argument x should be of type Number");
    }
    if (typeof y !== "number") {
      throw new Error("Argument y should be of type Number");
    }
    return this.add(new Geometry.Vector(x, y));
  };


  /*
  Adds a vector to all points.
  
  @param {Geometry.Vector} vector A Vector to add to all points
  @return {Geometry.Polygon} The resulting Polygon object (itself)
   */

  Polygon.prototype.add = function(vector) {
    var i;
    if (!vector instanceof Geometry.Vector) {
      throw new Error("Argument vector should be of type Vector");
    }
    i = 0;
    while (i < this.points.length) {
      this.points[i].add(vector);
      i++;
    }
    return this;
  };


  /*
  Rotates the Polygon object by rotating all of its points around the zero vector.
  
  @param {number} direction The number of radians to rotate the polygon
  @return {Geometry.Polygon} The resulting Polygon object (itself)
   */

  Polygon.prototype.rotate = function(direction) {
    var i;
    if (typeof direction !== "number") {
      throw new Error("Argument direction should be of type Number");
    }
    i = 0;
    while (i < this.points.length) {
      this.points[i].rotate(direction);
      i++;
    }
    return this;
  };


  /*
  Scales the polygon by multiplying all of its points
  
  @param {number} scaleH A factor with which to scale the Polygon horizontally. If scaleH is undefined, both width and height will be scaled after this factor
  @param {number} scaleV A factor with which to scale the Polygon vertically
  @return {Geometry.Polygon} The resulting Polygon object (itself)
   */

  Polygon.prototype.scale = function(scaleH, scaleV) {
    var i;
    i = 0;
    while (i < this.points.length) {
      this.points[i].scale(scaleH, scaleV);
      i++;
    }
    return this;
  };


  /*
  Copies the Polygon object
  
  @return {Geometry.Polygon} A copy of the Polygon object (which can be modified without changing the original object)
   */

  Polygon.prototype.copy = function() {
    return new this.constructor(this.getPoints());
  };


  /*
  Fetches all of the polygon's points as Vector objects
  
  @return {Geometry.Vector} An array containing all the points of the polygon, as Vector objects
   */

  Polygon.prototype.getPoints = function() {
    return this.points.map(function(p) {
      return p.copy();
    });
  };


  /*
  Fetches all of the polygon's sides as Line objects.
  
  @return {Geometry.Vector} An array containing all of the polygon's sides as Line objects
   */

  Polygon.prototype.getLines = function() {
    var i, lines, points, to;
    lines = [];
    points = this.points;
    i = 0;
    while (i < points.length) {
      to = (i === points.length - 1 ? 0 : i + 1);
      lines.push(new Geometry.Line(points[i], points[to]));
      i++;
    }
    return lines;
  };


  /*
  Calculates the bounding rectangle of the polygon
  
  @return {Geometry.Rectangle} The bounding rectangle
   */

  Polygon.prototype.getBoundingRectangle = function() {
    var endVector, i, startVector;
    if (this.points.length === 0) {
      throw new Error("Cannot create bounding rectangle for pointless polygon");
    }
    startVector = new Geometry.Vector(this.points[0].x, this.points[0].y);
    endVector = startVector.copy();
    i = 0;
    while (i < this.points.length) {
      startVector.x = Math.min(this.points[i].x, startVector.x);
      startVector.y = Math.min(this.points[i].y, startVector.y);
      endVector.x = Math.max(this.points[i].x, endVector.x);
      endVector.y = Math.max(this.points[i].y, endVector.y);
      i++;
    }
    return new Geometry.Rectangle().setFromVectors(startVector, endVector.subtract(startVector));
  };


  /*
  Calculates the shortest distance from the Polygon object to another geometric object
  
  @param {Geometry.Vector|Geometry.Line|Geometry.Circle|Geometry.Rectangle|Geometry.Polygon} object The object to calculate the distance to
  @return {number} The distance
   */

  Polygon.prototype.getDistance = function(object) {
    var dist, i, ii, lines, objLines, pVector;
    dist = Number.POSITIVE_INFINITY;
    lines = this.getLines();
    if (object instanceof Geometry.Vector) {
      i = 0;
      while (i < lines.length) {
        dist = Math.min(dist, lines[i].getDistance(object));
        if (dist < 0) {
          break;
        }
        i++;
      }
      return dist;
    } else if (object instanceof Geometry.Line) {
      i = 0;
      while (i < lines.length) {
        dist = Math.min(dist, lines[i].getDistance(object));
        if (dist < 0) {
          break;
        }
        i++;
      }
      return dist;
    } else if (object instanceof Geometry.Circle) {
      pVector = new Geometry.Vector(object.x, object.y);
      i = 0;
      while (i < lines.length) {
        dist = Math.min(dist, lines[i].getDistance(pVector));
        if (dist < 0) {
          break;
        }
        i++;
      }
      return Math.max(0, dist - object.radius);
    } else if (object instanceof Geometry.Rectangle) {
      return object.getDistance(this);
    } else if (object instanceof this.constructor) {
      objLines = object.getLines();
      i = 0;
      while (i < lines.length) {
        ii = 0;
        while (ii < objLines.length) {
          dist = Math.min(dist, lines[i].getDistance(objLines[ii]));
          if (dist < 0) {
            break;
          }
          ii++;
        }
        if (dist < 0) {
          break;
        }
        i++;
      }
      return dist;
    } else {
      throw new Error("Argument object should be of type: Vector, Line, Circle, Rectangle or Polygon");
    }
  };


  /*
  Checks whether or not the Polygon contains another geometric object.
  
  @param {Geometry.Vector|Geometry.Line|Geometry.Circle|Geometry.Rectangle} object A geometric object to check
  @return {boolean} True if the Polygon contains the checked object, false if not
   */

  Polygon.prototype.contains = function(object) {
    if (object instanceof Geometry.Vector) {
      return this.intersects(new Geometry.Line().setFromCoordinates(-123456, -98765, object.x, object.y), true) % 2;
    } else if (object instanceof Geometry.Line) {
      return !this.intersects(object) && this.contains(object.a);
    } else if (object instanceof Geometry.Circle) {
      if (this.contains(new Geometry.Vector(object.x, object.y))) {
        return !this.intersects(object);
      } else {
        return false;
      }
    } else if (object instanceof Geometry.Rectangle) {
      return this.contains(object.getPolygon());
    } else if (object instanceof this.constructor) {
      return object.points.length > 0 && !this.intersects(object) && this.contains(object.points[0]);
    } else {
      throw new Error("Argument object has to be of type: Vector, Line, Rectangle or Polygon");
    }
  };


  /*
  Checks whether or not the Polygon intersects with another geometric object.
  
  @param {Geometry.Line|Geometry.Circle|Geometry.Rectangle|Geometry.Polygon} object A geometric object to check for intersections with
  @param {boolean} [countIntersections=true] A geometric object to check for intersections with
  @return {boolean} True if the Polygon intersects with the checked object, false if not
   */

  Polygon.prototype.intersects = function(object, countIntersections) {
    var i, ii, intersectionCount, line, lines, oLine, oLines;
    countIntersections = (countIntersections !== void 0 ? countIntersections : false);
    if (countIntersections) {
      intersectionCount = 0;
    }
    if (object instanceof Geometry.Line) {
      lines = this.getLines();
      i = 0;
      while (i < lines.length) {
        line = lines[i];
        if (line.intersects(object)) {
          if (countIntersections) {
            intersectionCount++;
          } else {
            return true;
          }
        }
        i++;
      }
    } else if (object instanceof Geometry.Circle) {
      lines = this.getLines();
      i = 0;
      while (i < lines.length) {
        if (object.intersects(lines[i])) {
          if (countIntersections) {
            intersectionCount++;
          } else {
            return true;
          }
        }
        i++;
      }
    } else if (object instanceof Geometry.Rectangle) {
      return this.intersects(object.getPolygon());
    } else if (object instanceof this.constructor) {
      lines = this.getLines();
      oLines = object.getLines();
      i = 0;
      while (i < lines.length) {
        line = lines[i];
        ii = 0;
        while (ii < oLines.length) {
          oLine = oLines[ii];
          if (line.intersects(oLine)) {
            if (countIntersections) {
              intersectionCount++;
            } else {
              return true;
            }
          }
          ii++;
        }
        i++;
      }
    } else {
      throw new Error("Argument object has to be of type: Line, Circle, Rectangle or Polygon");
    }
    if (countIntersections) {
      return intersectionCount;
    } else {
      return false;
    }
  };

  return Polygon;

})();

Geometry = {
  Circle: require('./circle'),
  Line: require('./line'),
  Rectangle: require('./rectangle'),
  Vector: require('./vector')
};



},{"./circle":19,"./line":20,"./rectangle":22,"./vector":23}],22:[function(require,module,exports){
var Geometry, Helpers, Mixins, Rectangle;

Helpers = {
  Mixin: require('../helpers/mixin')
};

Mixins = {
  Animatable: require('../mixins/animatable')
};


/*
The constructor for the Rectangle class. Uses the set-function to set the properties of the rectangle.

@name Geometry.Rectangle
@class A rectangle class which is used for handling non-rotated rectangles
@augments Vector

@property {number} x The top left corner's x-coordinate
@property {number} y The top left corner's y-coordinate
@property {number} width The width of the rectangle
@property {number} height The height of the rectangle

@param {number} x The x-coordinate for the rectangle's top left corner
@param {number} y The y-coordinate for the rectangle's top left corner
@param {number} width The width of the rectangle
@param {number} height The height of the rectangle
 */

module.exports = Rectangle = (function() {
  Helpers.Mixin.mixin(Rectangle, Mixins.Animatable);

  function Rectangle(x, y, width, height, fillStyle, strokeStyle, lineWidth) {
    this.set(x, y, width, height);
  }


  /*
  Sets the properties of the rectangle.
  
  @param {number} x The x-coordinate for the rectangle's top left corner
  @param {number} y The y-coordinate for the rectangle's top left corner
  @param {number} width The width of the rectangle
  @param {number} height The height of the rectangle
  @return {Geometry.Rectangle} The resulting Rectangle object (itself)
   */

  Rectangle.prototype.set = function(x, y, width, height) {
    this.x = (x !== void 0 ? x : 0);
    this.y = (y !== void 0 ? y : 0);
    this.width = (width !== void 0 ? width : 0);
    this.height = (height !== void 0 ? height : 0);
    return this;
  };


  /*
  Sets the properties of the rectangle from two vectors: one representing the position of the top left corner, another representing the width and height of the rectangle.
  
  @param {Geometry.Vector} position A Vector representing the position of the top left corner to set for the Rectangle
  @param {Geometry.Vector} size A Vector representing the size (width and height) to set for the Rectangle
  @return {Geometry.Rectangle} The resulting Rectangle object (itself)
   */

  Rectangle.prototype.setFromVectors = function(position, size) {
    position = (position !== void 0 ? position : new Geometry.Vector());
    size = (size !== void 0 ? size : new Geometry.Vector());
    this.x = position.x;
    this.y = position.y;
    this.width = size.x;
    this.height = size.y;
    return this;
  };


  /*
  Copies the Rectangle object
  
  @return {Geometry.Rectangle} A copy of the Rectangle object (which can be modified without changing the original object)
   */

  Rectangle.prototype.copy = function() {
    return new this.constructor(this.x, this.y, this.width, this.height);
  };


  /*
  Moves the Rectangle by adding a value to its x-coordinate and another value to its y-coordinate.
  
  @param {number} x The value to add to the x-coordinate (can be negative)
  @param {number} y The value to add to the y-coordinate (can be negative)
  @return {Geometry.Rectangle} The resulting Rectangle object (itself)
   */

  Rectangle.prototype.move = function(x, y) {
    if (typeof x !== "number") {
      throw new Error("Argument x should be of type: Number");
    }
    if (typeof y !== "number") {
      throw new Error("Argument y should be of type: Number");
    }
    this.x += x;
    this.y += y;
    return this;
  };


  /*
  Moves the Rectangle to a fixed position by setting its x- and y-coordinates.
  
  @param {number} x The x-coordinate of the position to move the Rectangle to
  @param {number} y The y-coordinate of the position to move the Rectangle to
  @return {Geometry.Rectangle} The resulting Rectangle object (itself)
   */

  Rectangle.prototype.moveTo = function(x, y) {
    if (typeof x !== "number") {
      throw new Error("Argument x should be of type: Number");
    }
    if (typeof y !== "number") {
      throw new Error("Argument y should be of type: Number");
    }
    this.x = x;
    this.y = y;
    return this;
  };


  /*
  Calculates the overlapping area of the rectangle and another rectangle
  @param  {Geometry.Rectangle} rectangle The rectangle to use for the operation
  @return {Geometry.Rectangle|boolean} The overlapping rectangle, or false if there is no overlap
   */

  Rectangle.prototype.getOverlap = function(rectangle) {
    var crop, rx2, ry2, x2, y2;
    x2 = this.x + this.width;
    y2 = this.y + this.height;
    rx2 = rectangle.x + rectangle.width;
    ry2 = rectangle.y + rectangle.height;
    crop = new Geometry.Rectangle();
    crop.x = (rectangle.x > this.x ? rectangle.x : this.x);
    crop.y = (rectangle.y > this.y ? rectangle.y : this.y);
    x2 = (rx2 > x2 ? x2 : rx2);
    y2 = (ry2 > y2 ? y2 : ry2);
    crop.width = x2 - crop.x;
    crop.height = y2 - crop.y;
    if (crop.width <= 0 || crop.height <= 0) {
      return false;
    } else {
      return crop;
    }
  };


  /*
  Scales the Rectangle by multiplying the width and height values.
  Please notice that, opposed to the Polygon and Line objects, the position of the Rectangle will not be changed by scaling it, since the position of the top left corner will not be scaled.
  
  @param {number} scaleH A factor with which to scale the Rectangle horizontally. If scaleH is undefined, both width and height will be scaled after this factor
  @param {number} scaleV A factor with which to scale the Rectangle vertically
  @return {Geometry.Rectangle} The resulting Rectangle object (itself)
   */

  Rectangle.prototype.scale = function(scaleH, scaleV) {
    if (typeof scaleH !== "number") {
      throw new Error("Argument scaleH should be of type Number");
    }
    scaleV = (scaleV !== void 0 ? scaleV : scaleH);
    this.width *= scaleH;
    this.height *= scaleV;
    return this;
  };


  /*
  Calculates the bounding rectangle of the of the two rectangles
  
  @param {Geometry.Rectangle} rectangle The rectangle to use for the calculation
  @return {Geometry.Rectangle} The bounding rectangle for the two rectangles
   */

  Rectangle.prototype.getBoundingRectangle = function(rectangle) {
    var crop, rx2, ry2, x2, y2;
    x2 = this.x + this.width;
    y2 = this.y + this.height;
    rx2 = rectangle.x + rectangle.width;
    ry2 = rectangle.y + rectangle.height;
    crop = new Geometry.Rectangle();
    crop.x = (rectangle.x < this.x ? rectangle.x : this.x);
    crop.y = (rectangle.y < this.y ? rectangle.y : this.y);
    x2 = (rx2 < x2 ? x2 : rx2);
    y2 = (ry2 < y2 ? y2 : ry2);
    crop.width = x2 - crop.x;
    crop.height = y2 - crop.y;
    return crop;
  };


  /*
  Creates a polygon with the same points as the rectangle.
  
  @return {Geometry.Polygon} The created Polygon object
   */

  Rectangle.prototype.getPolygon = function() {
    return new Geometry.Polygon(this.getPoints());
  };


  /*
  Fetches the Rectangles points.
  
  @return {Geometry.Vector[]} Array of points, in the following order: top left corner, top right corner, bottom right corner, bottom left corner
   */

  Rectangle.prototype.getPoints = function() {
    return [new Geometry.Vector(this.x, this.y), new Geometry.Vector(this.x + this.width, this.y), new Geometry.Vector(this.x + this.width, this.y + this.height), new Geometry.Vector(this.x, this.y + this.height)];
  };


  /*
  Calculates the area of the Rectangle.
  
  @return {number} The area of the Rectangle
   */

  Rectangle.prototype.getArea = function() {
    return this.width * this.height;
  };


  /*
  Calculates the diagonal length of the Rectangle
  
  @return {number} The diagonal length of the Rectangle
   */

  Rectangle.prototype.getDiagonal = function() {
    return Rectangle.sqrt(Rectangle.pow(this.width, 2) + Rectangle.pow(this.height, 2));
  };


  /*
  Calculates the shortest distance from the Rectangle object to another geometric object
  
  @param {Geometry.Vector|Geometry.Line|Geometry.Circle|Geometry.Rectangle|Geometry.Polygon} object The object to calculate the distance to
  @return {number} The distance
   */

  Rectangle.prototype.getDistance = function(object) {
    return this.getPolygon().getDistance(object);
  };


  /*
  Checks whether or not the Rectangle contains another geometric object.
  
  @param {Geometry.Vector|Geometry.Line|Geometry.Circle|Geometry.Rectangle|Geometry.Polygon} object A geometric object to check
  @return {boolean} True if the Rectangle contains the checked object, false if not
   */

  Rectangle.prototype.contains = function(object) {
    if (object instanceof this.constructor) {
      return this.contains(new Geometry.Vector(object.x, object.y)) && this.contains(new Geometry.Vector(object.x + object.width, object.y + object.height));
    } else if (object instanceof Geometry.Line) {
      return this.contains(object.a) && this.contains(object.b);
    } else if (object instanceof Geometry.Vector) {
      return object.x > this.x && object.x < this.x + this.width && object.y > this.y && object.y < this.y + this.height;
    }
    return this.getPolygon().contains(object);
  };


  /*
  Checks whether or not the Rectangle intersects with another geometric object.
  
  @param {Geometry.Line|Geometry.Circle|Geometry.Rectangle|Geometry.Polygon} object A geometric object to check
  @return {boolean} True if the Polygon intersects with the checked object, false if not
   */

  Rectangle.prototype.intersects = function(object) {
    return this.getPolygon().intersects(object);
  };

  return Rectangle;

})();

Geometry = {
  Circle: require('./circle'),
  Line: require('./line'),
  Polygon: require('./polygon'),
  Vector: require('./vector')
};



},{"../helpers/mixin":26,"../mixins/animatable":31,"./circle":19,"./line":20,"./polygon":21,"./vector":23}],23:[function(require,module,exports){
var Geometry, Helpers, Mixins, Vector;

Helpers = {
  Mixin: require('../helpers/mixin')
};

Mixins = {
  Animatable: require('../mixins/animatable')
};


/*
Constructor for the Vector class. Uses set-function to set the vector from x- and y values.

@name Vector
@class A math class which is used for handling two-dimensional vectors
@augments Mixin.Animatable

@property {number} x The x-value of the vector
@property {number} y The y-value of the vector
@param {number} [x=0] The x-value to set for the vector
@param {number} [y=0] The y-value to set for the vector
 */

module.exports = Vector = (function() {
  Helpers.Mixin.mixin(Vector, Mixins.Animatable);

  function Vector(x, y) {
    this.set(x, y);
    return;
  }


  /*
  Sets the vector from x- and y values.
  
  @param {number} [x=0] The x-value to set for the vector
  @param {number} [y=0] The y-value to set for the vector
  @return {Geometry.Vector} The resulting Vector object (itself)
   */

  Vector.prototype.set = function(x, y) {
    this.x = (x !== void 0 ? x : 0);
    this.y = (y !== void 0 ? y : 0);
    return this;
  };


  /*
  Calculates and sets the vector from a direction and a length.
  
  @param {number} direction The direction (in radians)
  @param {number} length The length
  @return {Geometry.Vector} The resulting Vector object (itself)
   */

  Vector.prototype.setFromDirection = function(direction, length) {
    if (typeof direction !== "number") {
      throw new Error("Argument direction should be of type: Number");
    }
    if (typeof length !== "number") {
      throw new Error("Argument length should be of type: Number");
    }
    this.x = Math.cos(direction) * length;
    this.y = Math.sin(direction) * length;
    return this;
  };


  /*
  Copies the Vector object
  
  @return {Geometry.Vector} A copy of the Vector object (which can be modified without changing the original object)
   */

  Vector.prototype.copy = function() {
    return new module.exports(this.x, this.y);
  };


  /*
  Moves the vector by adding a value to its x-property and another value to its y-property.
  
  @param {number} x The value to add to the x-property (can be negative)
  @param {number} y The value to add to the y-property (can be negative)
  @return {Geometry.Vector} The resulting Vector object (itself)
   */

  Vector.prototype.move = function(x, y) {
    if (typeof x !== "number") {
      throw new Error("Argument x should be of type: Number");
    }
    if (typeof y !== "number") {
      throw new Error("Argument y should be of type: Number");
    }
    this.x += x;
    this.y += y;
    return this;
  };


  /*
  Rotates the vector around the zero-vector.
  
  @param {number} direction The number of radians to rotate the vector
  @return {Geometry.Vector} The resulting Vector object (itself)
   */

  Vector.prototype.rotate = function(direction) {
    if (typeof direction !== "number") {
      throw new Error("Argument direction should be of type: Number");
    }
    this.setFromDirection(this.getDirection() + direction, this.getLength());
    return this;
  };


  /*
  Scales the vector by multiplying the x- and y values.
  
  @param {number} scaleH A factor with which to scale the Vector horizontally. If scaleH is undefined, both width and height will be scaled after this factor
  @param {number} scaleV A factor with which to scale the Vector vertically
  @return {Geometry.Vector} The resulting Vector object (itself)
   */

  Vector.prototype.scale = function(scaleH, scaleV) {
    if (typeof scaleH !== "number") {
      throw new Error("Argument scaleH should be of type Number");
    }
    scaleV = (scaleV !== void 0 ? scaleV : scaleH);
    this.x *= scaleH;
    this.y *= scaleV;
    return this;
  };


  /*
  Adds another vector to the Vector.
  Can by used for the same purpose as move, but takes a vector as argument.
  
  @param {Geometry.Vector} vector A vector to add to the Vector
  @return {Geometry.Vector} The resulting Vector object (itself)
   */

  Vector.prototype.add = function(vector) {
    if (vector instanceof this.constructor) {
      this.x += vector.x;
      this.y += vector.y;
    } else if (typeof vector === "number") {
      this.x += vector;
      this.y += vector;
    } else {
      throw new Error("Argument vector should be of type Vector or Number");
    }
    return this;
  };


  /*
  Subtracts another vector from the Vector.
  
  @param {Geometry.Vector} vector A vector to subtract from the Vector
  @return {Geometry.Vector} The resulting Vector object (itself)
   */

  Vector.prototype.subtract = function(vector) {
    if (vector instanceof module.exports) {
      this.x -= vector.x;
      this.y -= vector.y;
    } else if (typeof vector === "number") {
      this.x -= vector;
      this.y -= vector;
    } else {
      throw new Error("Argument vector should be of type Vector or Number");
    }
    return this;
  };


  /*
  Divides the Vector with another vector.
  
  @param {Geometry.Vector} vector A vector to divide the Vector with
  @return {Geometry.Vector} The resulting Vector object (itself)
   */

  Vector.prototype.divide = function(vector) {
    if (vector instanceof module.exports) {
      this.x /= vector;
      this.y /= vector;
    } else if (typeof vector === "number") {
      this.x /= vector;
      this.y /= vector;
    } else {
      throw new Error("Argument vector should be of type Vector or Number");
    }
    return this;
  };


  /*
  Multiplies the Vector with another vector.
  
  @param {Geometry.Vector} vector A vector to multiply the Vector with
  @return {Geometry.Vector} The resulting Vector object (itself)
   */

  Vector.prototype.multiply = function(vector) {
    if (!vector instanceof module.exports) {
      throw new Error("Argument vector should be of type Vector");
    }
    this.x *= vector.x;
    this.y *= vector.y;
    return this;
  };

  Vector.prototype.reverse = function() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  };


  /*
  Calculates the cross product of the Vector and another vector
  
  @param {Geometry.Vector} vector The vector to use for the calculation
  @return {number} The dot product
   */

  Vector.prototype.getDot = function(vector) {
    if (!vector instanceof module.exports) {
      throw new Error("Argument vector should be of type: Vector");
    }
    return this.x * vector.x + this.y * vector.y;
  };


  /*
  Calculates the cross product of the Vector and another vector
  
  @param {Geometry.Vector} vector The vector to use for the calculation
  @return {number} The cross product
   */

  Vector.prototype.getCross = function(vector) {
    if (!vector instanceof module.exports) {
      throw new Error("Argument vector should be of type: Vector");
    }
    return this.x * vector.y - this.y * vector.x;
  };


  /*
  Calculates the length of the Vector
  
  @return {number} The vector's length
   */

  Vector.prototype.getLength = function() {
    return Math.sqrt(this.getDot(this));
  };


  /*
  Calculates the direction of the Vector
  
  @return {number} The vector's direction (in radians)
   */

  Vector.prototype.getDirection = function() {
    return Math.atan2(this.y, this.x);
  };


  /*
  Calculates the direction to another Vector
  
  @param {Geometry.Vector} point A Vector to calculate the direction to
  @return {number} The direction to the object
   */

  Vector.prototype.getDirectionTo = function(point) {
    if (!point instanceof module.exports) {
      throw new Error("Only Vectors or objects inheriting Vector are supported");
    }
    return point.getDirection() - this.getDirection();
  };


  /*
  Calculates the shortest distance from the Vector object to another geometric object
  
  @param {Geometry.Vector|Geometry.Line|Geometry.Circle|Geometry.Rectangle|Geometry.Polygon} object The object to calculate the distance to
  @return {number} The distance
   */

  Vector.prototype.getDistance = function(object) {
    if (object instanceof module.exports) {
      return object.copy().subtract(this).getLength();
    }
    if (object instanceof Geometry.Line) {
      return object.getDistance(this);
    }
    if (object instanceof Geometry.Circle) {
      return object.getDistance(this);
    }
    if (object instanceof Geometry.Rectangle) {
      return object.getDistance(this);
    }
    if (object instanceof Geometry.Polygon) {
      return object.getDistance(this);
    }
    throw new Error("Argument object should be of type: Vector, Line, Circle, Rectangle or Polygon");
  };

  return Vector;

})();

Geometry = {
  Circle: require('./circle'),
  Line: require('./line'),
  Rectangle: require('./rectangle'),
  Polygon: require('./polygon')
};



},{"../helpers/mixin":26,"../mixins/animatable":31,"./circle":19,"./line":20,"./polygon":21,"./rectangle":22}],24:[function(require,module,exports){
module.exports = {
  linear: function(t, b, c, d) {
    t /= d;
    return b + c * t;
  },
  quadIn: function(t, b, c, d) {
    t /= d;
    return b + c * t * t;
  },
  quadOut: function(t, b, c, d) {
    t /= d;
    return b - c * t * (t - 2);
  },
  quadInOut: function(t, b, c, d) {
    t = t / d * 2;
    if (t < 1) {
      return b + c * t * t / 2;
    } else {
      t--;
      return b + c * (1 - t * (t - 2)) / 2;
    }
  },
  powerIn: function(t, b, c, d) {
    var a;
    t /= d;
    a = c / Math.abs(c);
    return b + a * Math.pow(Math.abs(c), t);
  },
  powerOut: function(t, b, c, d) {
    var a;
    t /= d;
    a = c / Math.abs(c);
    return b + c - a * Math.pow(Math.abs(c), 1 - t);
  },
  powerInOut: function(t, b, c, d) {
    var a;
    t = t / d * 2;
    a = c / Math.abs(c);
    if (t < 1) {
      return b + a * Math.pow(Math.abs(c), t) / 2;
    } else {
      t--;
      return b + c - a * Math.pow(Math.abs(c), 1 - t) / 2;
    }
  },
  sinusInOut: function(t, b, c, d) {
    t /= d;
    return b + c * (1 + Math.cos(Math.PI * (1 + t))) / 2;
  }
};



},{}],25:[function(require,module,exports){
var MatrixCalculationHelper;

module.exports = MatrixCalculationHelper = {
  operationMatrix: new Float32Array(9),
  tempLocalMatrix: new Float32Array(9),
  setLocalMatrix: function(matrix, object) {
    this.setScale(matrix, object.widthScale * object.size, object.heightScale * object.size);
    this.multiply(matrix, this.getRotation(-object.direction));
    this.multiply(matrix, this.getTranslation(object.x, object.y));
  },
  getLocalMatrix: function(object) {
    this.setLocalMatrix(this.tempLocalMatrix, object);
    return this.tempLocalMatrix;
  },
  setInverseLocalMatrix: function(matrix, object) {
    this.setTranslation(matrix, -object.x, -object.y);
    this.multiply(matrix, this.getRotation(object.direction));
    this.multiply(matrix, this.getScale(1 / (object.widthScale * object.size), 1 / (object.heightScale * object.size)));
  },
  getInverseLocalMatrix: function(object) {
    this.setInverseLocalMatrix(this.tempLocalMatrix, object);
    return this.tempLocalMatrix;
  },
  setIdentity: function(matrix) {
    matrix[0] = 1;
    matrix[1] = 0;
    matrix[2] = 0;
    matrix[3] = 0;
    matrix[4] = 1;
    matrix[5] = 0;
    matrix[6] = 0;
    matrix[7] = 0;
    matrix[8] = 1;
    return matrix;
  },
  getIdentity: function() {
    return this.setIdentity(this.operationMatrix);
  },
  setRotation: function(matrix, direction) {
    var c, s;
    c = Math.cos(direction);
    s = Math.sin(direction);
    matrix[0] = c;
    matrix[1] = -s;
    matrix[2] = 0;
    matrix[3] = s;
    matrix[4] = c;
    matrix[5] = 0;
    matrix[6] = 0;
    matrix[7] = 0;
    matrix[8] = 1;
    return matrix;
  },
  getRotation: function(direction) {
    return this.setRotation(this.operationMatrix, direction);
  },
  setTranslation: function(matrix, tx, ty) {
    matrix[0] = 1;
    matrix[1] = 0;
    matrix[2] = 0;
    matrix[3] = 0;
    matrix[4] = 1;
    matrix[5] = 0;
    matrix[6] = tx;
    matrix[7] = ty;
    matrix[8] = 1;
    return matrix;
  },
  getTranslation: function(tx, ty) {
    return this.setTranslation(this.operationMatrix, tx, ty);
  },
  setScale: function(matrix, sx, sy) {
    matrix[0] = sx;
    matrix[1] = 0;
    matrix[2] = 0;
    matrix[3] = 0;
    matrix[4] = sy;
    matrix[5] = 0;
    matrix[6] = 0;
    matrix[7] = 0;
    matrix[8] = 1;
    return matrix;
  },
  getScale: function(sx, sy) {
    return this.setScale(this.operationMatrix, sx, sy);
  },
  multiply: function(a, b) {
    var a1, a2, b1, b2, c1, c2, d1, d2, e1, e2, f1, f2, g1, g2, h1, h2, i1, i2;
    if (a === b) {
      throw new Error('Multiplying matrix with itself');
    }
    a1 = a[0 * 3 + 0];
    b1 = a[0 * 3 + 1];
    c1 = a[0 * 3 + 2];
    d1 = a[1 * 3 + 0];
    e1 = a[1 * 3 + 1];
    f1 = a[1 * 3 + 2];
    g1 = a[2 * 3 + 0];
    h1 = a[2 * 3 + 1];
    i1 = a[2 * 3 + 2];
    a2 = b[0 * 3 + 0];
    b2 = b[0 * 3 + 1];
    c2 = b[0 * 3 + 2];
    d2 = b[1 * 3 + 0];
    e2 = b[1 * 3 + 1];
    f2 = b[1 * 3 + 2];
    g2 = b[2 * 3 + 0];
    h2 = b[2 * 3 + 1];
    i2 = b[2 * 3 + 2];
    a[0] = a1 * a2 + b1 * d2 + c1 * g2;
    a[1] = a1 * b2 + b1 * e2 + c1 * h2;
    a[2] = a1 * c2 + b1 * f2 + c1 * i2;
    a[3] = d1 * a2 + e1 * d2 + f1 * g2;
    a[4] = d1 * b2 + e1 * e2 + f1 * h2;
    a[5] = d1 * c2 + e1 * f2 + f1 * i2;
    a[6] = g1 * a2 + h1 * d2 + i1 * g2;
    a[7] = g1 * b2 + h1 * e2 + i1 * h2;
    a[8] = g1 * c2 + h1 * f2 + i1 * i2;
  },
  reverseMultiply: function(b, a) {
    var a1, a2, b1, b2, c1, c2, d1, d2, e1, e2, f1, f2, g1, g2, h1, h2, i1, i2;
    if (a === b) {
      throw new Error('Multiplying matrix with itself');
    }
    a1 = a[0 * 3 + 0];
    b1 = a[0 * 3 + 1];
    c1 = a[0 * 3 + 2];
    d1 = a[1 * 3 + 0];
    e1 = a[1 * 3 + 1];
    f1 = a[1 * 3 + 2];
    g1 = a[2 * 3 + 0];
    h1 = a[2 * 3 + 1];
    i1 = a[2 * 3 + 2];
    a2 = b[0 * 3 + 0];
    b2 = b[0 * 3 + 1];
    c2 = b[0 * 3 + 2];
    d2 = b[1 * 3 + 0];
    e2 = b[1 * 3 + 1];
    f2 = b[1 * 3 + 2];
    g2 = b[2 * 3 + 0];
    h2 = b[2 * 3 + 1];
    i2 = b[2 * 3 + 2];
    b[0] = a1 * a2 + b1 * d2 + c1 * g2;
    b[1] = a1 * b2 + b1 * e2 + c1 * h2;
    b[2] = a1 * c2 + b1 * f2 + c1 * i2;
    b[3] = d1 * a2 + e1 * d2 + f1 * g2;
    b[4] = d1 * b2 + e1 * e2 + f1 * h2;
    b[5] = d1 * c2 + e1 * f2 + f1 * i2;
    b[6] = g1 * a2 + h1 * d2 + i1 * g2;
    b[7] = g1 * b2 + h1 * e2 + i1 * h2;
    b[8] = g1 * c2 + h1 * f2 + i1 * i2;
  }
};



},{}],26:[function(require,module,exports){
var MixinHelper;

module.exports = MixinHelper = {

  /*
  Imports all properties of another object.
  
  @param {Object} from The object from which to copy the properties
  @param {boolean} [copyIfPossible=false] If possible, copy properties which are actually pointers. This option will look for and use a copy()- or clone() function inside the properties
   */
  "import": function(to, from, exclude) {
    var i;
    if (exclude == null) {
      exclude = [];
    }
    for (i in from) {
      if (exclude.indexOf(i) === -1) {
        to[i] = from[i];
      }
    }
  },
  mixin: function(to, from) {
    return this["import"](to.prototype, from.prototype, ['constructor']);
  }
};



},{}],27:[function(require,module,exports){
var Camera, RoomTransitionHelper;

module.exports = RoomTransitionHelper = {
  slideOut: function(camera, from, animOptions) {
    switch (from) {
      case "left":
        return camera.projectionRegion.animate({
          x: camera.projectionRegion.x + engine.canvasResX
        }, animOptions);
      case "right":
        return camera.projectionRegion.animate({
          x: camera.projectionRegion.x - engine.canvasResX
        }, animOptions);
      case "top":
        return camera.projectionRegion.animate({
          y: camera.projectionRegion.y + engine.canvasResY
        }, animOptions);
      case "bottom":
        return camera.projectionRegion.animate({
          y: camera.projectionRegion.y - engine.canvasResY
        }, animOptions);
    }
  },
  slideIn: function(camera, from, animOptions) {
    switch (from) {
      case "left":
        camera.projectionRegion.x -= engine.canvasResX;
        return camera.projectionRegion.animate({
          x: camera.projectionRegion.x + engine.canvasResX
        }, animOptions);
      case "right":
        camera.projectionRegion.x += engine.canvasResX;
        return camera.projectionRegion.animate({
          x: camera.projectionRegion.x - engine.canvasResX
        }, animOptions);
      case "top":
        camera.projectionRegion.y -= engine.canvasResY;
        return camera.projectionRegion.animate({
          y: camera.projectionRegion.y + engine.canvasResY
        }, animOptions);
      case "bottom":
        camera.projectionRegion.y += engine.canvasResY;
        return camera.projectionRegion.animate({
          y: camera.projectionRegion.y - engine.canvasResY
        }, animOptions);
    }
  },
  squeezeOut: function(camera, from, animOptions) {
    switch (from) {
      case "left":
        return camera.projectionRegion.animate({
          width: 0,
          x: camera.projectionRegion.x + engine.canvasResX
        }, animOptions);
      case "right":
        return camera.projectionRegion.animate({
          width: 0
        }, animOptions);
      case "top":
        return camera.projectionRegion.animate({
          height: 0,
          y: camera.projectionRegion.y + engine.canvasResY
        }, animOptions);
      case "bottom":
        return camera.projectionRegion.animate({
          height: 0
        }, animOptions);
    }
  },
  squeezeIn: function(camera, from, animOptions) {
    var oldHeight, oldWidth;
    switch (from) {
      case "left":
        oldWidth = camera.projectionRegion.width;
        camera.projectionRegion.width = 0;
        return camera.projectionRegion.animate({
          width: oldWidth
        }, animOptions);
      case "right":
        oldWidth = camera.projectionRegion.width;
        camera.projectionRegion.width = 0;
        camera.projectionRegion.x += engine.canvasResX;
        return camera.projectionRegion.animate({
          x: camera.projectionRegion.x - engine.canvasResX,
          width: oldWidth
        }, animOptions);
      case "top":
        oldHeight = camera.projectionRegion.height;
        camera.projectionRegion.height = 0;
        return camera.projectionRegion.animate({
          height: oldHeight
        }, animOptions);
      case "bottom":
        oldHeight = camera.projectionRegion.height;
        camera.projectionRegion.height = 0;
        camera.projectionRegion.y += engine.canvasResY;
        return camera.projectionRegion.animate({
          y: camera.projectionRegion.y - engine.canvasResY,
          height: oldHeight
        }, animOptions);
    }
  },

  /*
  Room transition global for entering a new room with no transition (this is default)
  
  @global
  @param {Room} oldRoom The room that is left
  @param {Room} newRoom The room that is entered
   */
  roomTransitionNone: function(oldRoom, newRoom, options, callback) {
    var camera, i;
    i = 0;
    while (i < engine.cameras.length) {
      camera = engine.cameras[i];
      if (camera.room === oldRoom) {
        camera.room = newRoom;
      }
      i++;
    }
    return callback();
  },

  /*
  Room transition global for entering a new room by sliding the current room to the left
  
  @global
  @param {Room} oldRoom The room that is left
  @param {Room} newRoom The room that is entered
   */
  roomTransitionSlideSlide: function(oldRoom, newRoom, options, callback) {
    var animOptions, c, camera, i, newCam, newCams, _i, _len;
    newCams = [];
    oldRoom.pause();
    options = options || {};
    options.from = options.from || "right";
    animOptions = {
      easing: options.easing || this.EASING_QUAD_IN_OUT,
      duration: options.duration || 2000,
      loop: engine.masterRoom.loops.eachFrame
    };
    i = 0;
    while (i < engine.cameras.length) {
      camera = engine.cameras[i];
      if (camera.room === oldRoom) {
        this.slideOut(camera, options.from, animOptions);
        newCam = new Camera(camera.captureRegion.copy(), camera.projectionRegion.copy(), newRoom);
        newCams.push(newCam);
      }
      i++;
    }
    engine.cameras.push.apply(engine.cameras, newCams);
    for (_i = 0, _len = newCams.length; _i < _len; _i++) {
      c = newCams[_i];
      this.slideIn(c, options.from, animOptions);
    }
    return engine.masterRoom.loops.eachFrame.schedule(oldRoom, (function() {
      this.play();
      engine.cameras = engine.cameras.filter(function(camera) {
        return newCams.indexOf(camera) !== -1;
      });
      return callback();
    }), animOptions.duration);
  },

  /*
  Room transition global for entering a new room by squeezing the old room out and sliding the new room in
  
  @global
  @param {Room} oldRoom The room that is left
  @param {Room} newRoom The room that is entered
   */
  roomTransitionSqueezeSlide: function(oldRoom, newRoom, options, callback) {
    var animOptions, c, camera, i, newCam, newCams, _i, _len;
    newCams = [];
    oldRoom.pause();
    options = options || {};
    options.from = options.from || "right";
    animOptions = {
      easing: options.easing || this.EASING_QUAD_IN_OUT,
      duration: options.duration || 2000,
      loop: engine.masterRoom.loops.eachFrame
    };
    i = 0;
    while (i < engine.cameras.length) {
      camera = engine.cameras[i];
      if (camera.room === oldRoom) {
        this.squeezeOut(camera, options.from, animOptions);
        newCam = new Camera(camera.captureRegion.copy(), camera.projectionRegion.copy(), newRoom);
        newCams.push(newCam);
      }
      i++;
    }
    engine.cameras.push.apply(engine.cameras, newCams);
    for (_i = 0, _len = newCams.length; _i < _len; _i++) {
      c = newCams[_i];
      this.slideIn(c, options.from, animOptions);
    }
    return engine.masterRoom.loops.eachFrame.schedule(oldRoom, (function() {
      this.play();
      engine.cameras = engine.cameras.filter(function(camera) {
        return newCams.indexOf(camera) !== -1;
      });
      return callback();
    }), animOptions.duration);
  },

  /*
  Room transition global for squeezing the old room out and squeezing the new room in
  
  @global
  @param {Room} oldRoom The room that is left
  @param {Room} newRoom The room that is entered
   */
  roomTransitionSqueezeSqueeze: function(oldRoom, newRoom, options, callback) {
    var animOptions, c, camera, i, newCam, newCams, _i, _len;
    newCams = [];
    oldRoom.pause();
    options = options || {};
    options.from = options.from || "right";
    animOptions = {
      easing: options.easing || this.EASING_QUAD_IN_OUT,
      duration: options.duration || 2000,
      loop: engine.masterRoom.loops.eachFrame
    };
    i = 0;
    while (i < engine.cameras.length) {
      camera = engine.cameras[i];
      if (camera.room === oldRoom) {
        this.squeezeOut(camera, options.from, animOptions);
        newCam = new Camera(camera.captureRegion.copy(), camera.projectionRegion.copy(), newRoom);
        newCams.push(newCam);
      }
      i++;
    }
    engine.cameras.push.apply(engine.cameras, newCams);
    for (_i = 0, _len = newCams.length; _i < _len; _i++) {
      c = newCams[_i];
      this.squeezeIn(c, options.from, animOptions);
    }
    return engine.masterRoom.loops.eachFrame.schedule(oldRoom, (function() {
      this.play();
      engine.cameras = engine.cameras.filter(function(camera) {
        return newCams.indexOf(camera) !== -1;
      });
      return callback();
    }), animOptions.duration);
  },

  /*
  Room transition global for sliding the old room out and squeezing the new room in
  
  @global
  @param {Room} oldRoom The room that is left
  @param {Room} newRoom The room that is entered
   */
  roomTransitionSlideSqueeze: function(oldRoom, newRoom, options, callback) {
    var animOptions, c, camera, i, newCam, newCams, _i, _len;
    newCams = [];
    oldRoom.pause();
    options = options || {};
    options.from = options.from || "right";
    animOptions = {
      easing: options.easing || this.EASING_QUAD_IN_OUT,
      duration: options.duration || 2000,
      loop: engine.masterRoom.loops.eachFrame
    };
    i = 0;
    while (i < engine.cameras.length) {
      camera = engine.cameras[i];
      if (camera.room === oldRoom) {
        this.slideOut(camera, options.from, animOptions);
        newCam = new Camera(camera.captureRegion.copy(), camera.projectionRegion.copy(), newRoom);
        newCams.push(newCam);
      }
      i++;
    }
    engine.cameras.push.apply(engine.cameras, newCams);
    for (_i = 0, _len = newCams.length; _i < _len; _i++) {
      c = newCams[_i];
      this.squeezeIn(c, options.from, animOptions);
    }
    return engine.masterRoom.loops.eachFrame.schedule(oldRoom, (function() {
      this.play();
      engine.cameras = engine.cameras.filter(function(camera) {
        return newCams.indexOf(camera) !== -1;
      });
      return callback();
    }), animOptions.duration);
  }
};

Camera = require('../engine/camera');



},{"../engine/camera":13}],28:[function(require,module,exports){
var WebGLHelper, poly2tri;

poly2tri = require('poly2tri');

module.exports = WebGLHelper = {
  planeCache: new Float32Array(12),
  colorCache: {},
  polygonCoordsCache: {},
  polygonOutlineCoordsCache: {},
  lineCoordsCache: {},
  planeOutlineCoordsCache: {},
  generateCacheKeyForPoints: function(points) {
    var p, string, _i, _len;
    string = '';
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      p = points[_i];
      string += "" + p.x + "," + p.y + ",";
    }
    return string;
  },
  getLineCoords: function(line) {
    var cacheKey, coords;
    cacheKey = "" + line.a.x + "," + line.a.y + "," + line.b.x + "," + line.b.y + "," + line.lineWidth + "," + line.lineCap;
    coords = this.lineCoordsCache[cacheKey];
    if (!coords) {
      coords = line.createPolygonFromWidth(line.lineWidth, line.lineCap).getCoordinates();
      this.lineCoordsCache[cacheKey] = coords;
    }
    return coords;
  },
  colorFromCSSString: function(string) {
    var color;
    color = this.colorCache[string];
    if (!color) {
      color = new Float32Array(3);
      if (string.length === 4) {
        color[0] = parseInt(string.substr(1, 1), 16) / 16;
        color[1] = parseInt(string.substr(2, 1), 16) / 16;
        color[2] = parseInt(string.substr(3, 1), 16) / 16;
      } else {
        color[0] = parseInt(string.substr(1, 2), 16) / 255;
        color[1] = parseInt(string.substr(3, 2), 16) / 255;
        color[2] = parseInt(string.substr(5, 2), 16) / 255;
      }
      this.colorCache[string] = color;
    }
    return color;
  },
  getPlaneOutlineCoords: function(width, height, outlineWidth) {
    var cacheKey, coords, ix1, ix2, iy1, iy2, ox1, ox2, oy1, oy2;
    cacheKey = "" + width + "," + height + "," + outlineWidth;
    coords = this.planeOutlineCoordsCache[cacheKey];
    if (!coords) {
      outlineWidth /= 2;
      ox1 = -outlineWidth;
      ox2 = width + outlineWidth;
      oy1 = -outlineWidth;
      oy2 = height + outlineWidth;
      ix1 = outlineWidth;
      ix2 = width - outlineWidth;
      iy1 = outlineWidth;
      iy2 = height - outlineWidth;
      coords = new Float32Array([ox1, oy1, ox2, oy1, ix1, iy1, ix1, iy1, ix2, iy1, ox2, oy1, ox1, oy1, ox1, oy2, ix1, iy1, ix1, iy1, ix1, iy2, ox1, oy2, ix1, iy2, ox1, oy2, ox2, oy2, ix1, iy2, ix2, iy2, ox2, oy2, ox2, oy1, ox2, oy2, ix2, iy1, ix2, iy1, ix2, iy2, ox2, oy2]);
      this.planeOutlineCoordsCache[cacheKey] = coords;
    }
    return coords;
  },
  setConvexPolygon: function(gl, coords) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
  },
  setCircle: function(gl, x, y, segmentsCount, radius) {
    var coords, i, segmentLength;
    coords = new Array(segmentsCount * 2);
    segmentLength = Math.PI * 2 / segmentsCount;
    i = 0;
    while (i < segmentsCount) {
      coords[i * 2] = x + Math.cos(segmentLength * i) * radius;
      coords[i * 2 + 1] = y + Math.sin(segmentLength * i) * radius;
      i++;
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
  },
  setCircleOutline: function(gl, x, y, segmentsCount, radius, outlineWidth) {
    var coords, i, ir, or_, segmentLength;
    coords = new Array(segmentsCount * 4);
    segmentLength = Math.PI * 2 / segmentsCount;
    or_ = radius + outlineWidth / 2;
    ir = radius - outlineWidth / 2;
    i = 0;
    while (i <= segmentsCount) {
      coords[i * 4] = x + Math.cos(segmentLength * i) * or_;
      coords[i * 4 + 1] = y + Math.sin(segmentLength * i) * or_;
      coords[i * 4 + 2] = x + Math.cos(segmentLength * i) * ir;
      coords[i * 4 + 3] = y + Math.sin(segmentLength * i) * ir;
      i++;
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
  },
  triangulatePolygonPoints: function(points) {
    var triangles;
    triangles = new poly2tri.SweepContext(points.slice()).triangulate().getTriangles();
    return new Float32Array(triangles.reduce(function(coords, triangle) {
      var p;
      p = triangle.getPoints();
      coords.push(p[0].x, p[0].y, p[1].x, p[1].y, p[2].x, p[2].y);
      return coords;
    }, []));
  },
  calculatePolygonOutlineCoords: function(points, width) {
    var angle, coords, i, length, nN, next, p1, p2, pN, point, pointNormal, prev, _i, _len;
    coords = new Float32Array(points.length * 4 + 4);
    for (i = _i = 0, _len = points.length; _i < _len; i = ++_i) {
      point = points[i];
      prev = points[(i - 1 + points.length) % points.length];
      next = points[(i + 1 + points.length) % points.length];
      pN = point.copy().subtract(prev);
      pN.set(-pN.y, pN.x);
      pN.scale(1 / pN.getLength());
      nN = next.copy().subtract(point);
      nN.set(-nN.y, nN.x);
      nN.scale(1 / nN.getLength());
      pointNormal = pN.copy().add(nN);
      angle = pN.getDirectionTo(pointNormal);
      length = width / 2 / Math.cos(angle);
      pointNormal.scale(length / pointNormal.getLength());
      p1 = point.copy().add(pointNormal);
      p2 = point.copy().subtract(pointNormal);
      coords[i * 4] = p1.x;
      coords[i * 4 + 1] = p1.y;
      coords[i * 4 + 2] = p2.x;
      coords[i * 4 + 3] = p2.y;
    }
    coords[coords.length - 4] = coords[0];
    coords[coords.length - 3] = coords[1];
    coords[coords.length - 2] = coords[2];
    coords[coords.length - 1] = coords[3];
    return coords;
  },
  setPolygon: function(gl, points) {
    var cacheKey, coords;
    cacheKey = this.generateCacheKeyForPoints(points);
    if (!this.polygonCoordsCache[cacheKey]) {
      this.polygonCoordsCache[cacheKey] = this.triangulatePolygonPoints(points);
    }
    coords = this.polygonCoordsCache[cacheKey];
    gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW);
  },
  setPolygonOutline: function(gl, points, width) {
    var cacheKey, coords;
    cacheKey = this.generateCacheKeyForPoints(points) + width;
    if (!this.polygonOutlineCoordsCache[cacheKey]) {
      this.polygonOutlineCoordsCache[cacheKey] = this.calculatePolygonOutlineCoords(points, width);
    }
    coords = this.polygonOutlineCoordsCache[cacheKey];
    gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW);
  }
};



},{"poly2tri":6}],29:[function(require,module,exports){

/*
Constructor for the Keyboard class

@name Input.Keyboard
@class A class that eases checking of the current state of all keys.
 */
var Keyboard;

module.exports = Keyboard = (function() {
  function Keyboard() {
    var key;
    document.addEventListener("keydown", (function(_this) {
      return function(event) {
        _this.onKeyDown(event);
        if (engine.preventDefaultKeyboard) {
          event.preventDefault();
        }
      };
    })(this), false);
    document.addEventListener("keyup", (function(_this) {
      return function(event) {
        _this.onKeyUp(event);
        if (engine.preventDefaultKeyboard) {
          event.preventDefault();
        }
      };
    })(this), false);
    this.keys = new Array(400);
    key = 0;
    while (key < this.keys.length) {
      this.keys[key] = {
        events: []
      };
      key++;
    }
    return;
  }


  /*
  Registers every onkeydown event to the Keyboard object.
  
  @private
  @param {KeyboardEvent} event Event object passed by the onkeydown event
   */

  Keyboard.prototype.onKeyDown = function(event) {
    var key;
    if (event === void 0) {
      throw new Error("Missing argument: event");
    }
    if (!this.isDown(event.keyCode)) {
      key = this.keys[event.keyCode];
      key.events = key.events.slice(0, 1);
      key.events.unshift(new Date().getTime());
    }
  };


  /*
  Registers every onkeyup event to the Keyboard object.
  
  @private
  @param {KeyboardEvent} event Event object passed by the onkeyup event
   */

  Keyboard.prototype.onKeyUp = function(event) {
    var key;
    if (event === void 0) {
      throw new Error("Missing argument: event");
    }
    if (this.isDown(event.keyCode)) {
      key = this.keys[event.keyCode];
      key.events = key.events.slice(0, 1);
      key.events.unshift(-new Date().getTime());
    }
  };


  /*
  Checks if a given key is down.
  
  @param {number|string} key A charcode or a string representing the key
  @return {boolean} True if the key is down, false if not
   */

  Keyboard.prototype.isDown = function(key) {
    if (key === void 0) {
      throw new Error("Missing argument: key");
    }
    if (typeof key === "string") {
      key = key.toUpperCase().charCodeAt(0);
    }
    return this.keys[key].events.length && this.keys[key].events[0] > 0;
  };


  /*
  Checks if a given key has been pressed (between last and current frame).
  
  @param {number|string} key A charcode or a string representing the key
  @return {boolean} True if the key has been pressed, false if not
   */

  Keyboard.prototype.isPressed = function(key) {
    if (key === void 0) {
      throw new Error("Missing argument: key");
    }
    if (typeof key === "string") {
      key = key.toUpperCase().charCodeAt(0);
    }
    return this.keys[key].events.length && this.keys[key].events[0] > engine.last;
  };


  /*
  Checks if a given key has been released (between last and current frame).
  
  @param {number|string} key A charcode or a string representing the key
  @return {boolean} True if the key has been pressed, false if not
   */

  Keyboard.prototype.isReleased = function(key) {
    if (key === void 0) {
      throw new Error("Missing argument: key");
    }
    if (typeof key === "string") {
      key = key.toUpperCase().charCodeAt(0);
    }
    return this.keys[key].events.length && -this.keys[key].events[0] > engine.last;
  };

  return Keyboard;

})();



},{}],30:[function(require,module,exports){

/*
Constructor for the Pointer class

@name Input.Pointer
@class A class that eases the use of mouse and touch, by providing functions for checking the current state of both.
 */
var Geometry, Globals, Pointer;

module.exports = Pointer = (function() {
  function Pointer() {
    var button;
    if (engine.host.hasTouch) {
      document.addEventListener("touchstart", (function(_this) {
        return function(event) {
          _this.onTouchStart(event);
        };
      })(this), false);
      document.addEventListener("touchend", (function(_this) {
        return function(event) {
          _this.onTouchEnd(event);
        };
      })(this), false);
      document.addEventListener("touchmove", (function(_this) {
        return function(event) {
          _this.onTouchMove(event);
        };
      })(this), false);
    } else {
      document.addEventListener("mousedown", (function(_this) {
        return function(event) {
          _this.onMouseDown(event);
        };
      })(this), false);
      document.addEventListener("mouseup", (function(_this) {
        return function(event) {
          _this.onMouseUp(event);
        };
      })(this), false);
      document.addEventListener("mousemove", (function(_this) {
        return function(event) {
          engine.host.hasMouse = true;
          _this.onMouseMove(event);
        };
      })(this), false);
    }
    this.mouse = new Geometry.Vector();
    this.mouse.window = new Geometry.Vector();
    this.mouse.buttons = new Array(11);
    button = 0;
    while (button < this.mouse.buttons.length) {
      this.mouse.buttons[button] = new Geometry.Vector();
      this.mouse.buttons[button].events = new Array(2);
      button++;
    }
    this.mouse.lastMoved = 0;
    this.touches = new Array(10);
    button = 0;
    while (button < this.touches.length) {
      this.touches[button] = new Geometry.Vector();
      this.touches[button].x = void 0;
      this.touches[button].y = void 0;
      this.touches[button].events = new Array(2);
      button++;
    }
    return;
  }


  /*
  Registers every onmousedown event to the Mouse object.
  
  @private
  @param {MouseEvent} event Event object passed by the onmousedown event
   */

  Pointer.prototype.onMouseDown = function(event) {
    var button;
    if (event === void 0) {
      throw new Error("Missing argument: event");
    }
    this.onMouseMove(event);
    if (!this.isDown(event.which)) {
      button = this.mouse.buttons[event.which];
      button.events = button.events.slice(0, 1);
      button.events.unshift(new Date().getTime());
    }
  };


  /*
  Registers every onmouseup event to the Mouse object.
  
  @private
  @param {MouseEvent} event Event object passed by the onmouseup event
   */

  Pointer.prototype.onMouseUp = function(event) {
    var button;
    if (event === void 0) {
      throw new Error("Missing argument: event");
    }
    this.onMouseMove(event);
    if (this.isDown(event.which)) {
      button = this.mouse.buttons[event.which];
      button.events = button.events.slice(0, 1);
      button.events.unshift(-new Date().getTime());
    }
  };


  /*
  Registers every onmousemove event to the Mouse object.
  
  @private
  @param {MouseEvent} event Event object passed by the onmousemove event
   */

  Pointer.prototype.onMouseMove = function(event) {
    var roomPos;
    if (event === void 0) {
      throw new Error("Missing argument: event");
    }
    this.mouse.window.set(event.pageX, event.pageY);
    this.mouse.set(this.mouse.window.x - engine.arena.offsetLeft - engine.canvas.offsetLeft + document.body.scrollLeft, this.mouse.window.y - engine.arena.offsetTop - engine.canvas.offsetTop + document.body.scrollTop);
    this.mouse.x = this.mouse.x / engine.arena.offsetWidth * engine.canvasResX;
    this.mouse.y = this.mouse.y / engine.arena.offsetHeight * engine.canvasResY;
    roomPos = this.calculateRoomPosition(this.mouse);
    this.mouse.x = roomPos.x;
    this.mouse.y = roomPos.y;
    this.mouse.buttons.forEach((function(_this) {
      return function(b) {
        b.x = _this.mouse.x;
        b.y = _this.mouse.y;
      };
    })(this));
    this.mouse.lastMoved = new Date().getTime();
    if (this.cursor) {
      this.cursor.x = this.mouse.x;
      this.cursor.y = this.mouse.y;
    }
  };


  /*
  Registers every ontouchstart event to the Mouse object.
  
  @private
  @param {TouchEvent} event Event object passed by the ontouchstart event
   */

  Pointer.prototype.onTouchStart = function(event) {
    var eventTouch, pointerTouch, touchNumber, _i, _len, _ref;
    if (event === void 0) {
      throw new Error("Missing argument: event");
    }
    _ref = event.changedTouches;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      eventTouch = _ref[_i];
      touchNumber = this.findTouchNumber();
      pointerTouch = this.touches[touchNumber];
      pointerTouch.identifier = eventTouch.identifier;
      pointerTouch.events = pointerTouch.events.slice(0, 1);
      pointerTouch.events.unshift(new Date().getTime());
    }
    this.onTouchMove(event);
  };


  /*
  Registers every ontouchend event to the Mouse object.
  
  @private
  @param {TouchEvent} event Event object passed by the ontouchend event
   */

  Pointer.prototype.onTouchEnd = function(event) {
    var eventTouch, pointerTouch, _i, _len, _ref;
    if (event === void 0) {
      throw new Error("Missing argument: event");
    }
    _ref = event.changedTouches;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      eventTouch = _ref[_i];
      pointerTouch = this.touches.filter(function(t) {
        return t.identifier === eventTouch.identifier;
      })[0];
      pointerTouch.events = pointerTouch.events.slice(0, 1);
      pointerTouch.events.unshift(-new Date().getTime());
    }
    this.onTouchMove(event);
  };


  /*
  Registers every ontouchmove event to the Mouse object.
  
  @private
  @param {TouchEvent} event Event object passed by the ontouchmove event
   */

  Pointer.prototype.onTouchMove = function(event) {
    var eventTouch, pointerTouch, roomPos, _i, _len, _ref;
    if (event === void 0) {
      throw new Error("Missing argument: event");
    }
    _ref = event.touches;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      eventTouch = _ref[_i];
      pointerTouch = this.touches.filter(function(t) {
        return t.identifier === eventTouch.identifier;
      })[0];
      pointerTouch.set(eventTouch.pageX - engine.arena.offsetLeft - engine.canvas.offsetLeft + document.body.scrollLeft, eventTouch.pageY - engine.arena.offsetTop - engine.canvas.offsetTop + document.body.scrollTop);
      pointerTouch.x = pointerTouch.x / engine.arena.offsetWidth * engine.canvasResX;
      pointerTouch.y = pointerTouch.y / engine.arena.offsetHeight * engine.canvasResY;
      roomPos = this.calculateRoomPosition(pointerTouch);
      pointerTouch.x = roomPos.x;
      pointerTouch.y = roomPos.y;
    }
  };


  /*
  Checks if the mouse has been moved between the last and the current frame.
  
  @return {boolean} True if the pointer has been moved, false if not
   */

  Pointer.prototype.mouseHasMoved = function() {
    return engine.last < this.mouse.lastMoved;
  };


  /*
  Checks if a mouse button or touch is currently down.
  
  @param {number} button A pointer constant representing the pointer to check
  @return {Object[]|boolean} Returns an array containing the pointers that are currently down, or false if no pointers are down
   */

  Pointer.prototype.isDown = function(button) {
    var pointers;
    if (button === void 0) {
      throw new Error("Missing argument: button");
    }
    switch (this.getButtonType(button)) {
      case "mouse":
        pointers = (button === Globals.MOUSE_ANY ? this.mouse.buttons : this.mouse.buttons[button]);
        break;
      case "touch":
        pointers = (button === Globals.TOUCH_ANY ? this.touches : this.touches[button - Globals.TOUCH_1]);
        break;
      case "any":
        pointers = this.mouse.buttons.concat(this.touches);
    }
    return this.checkPointer(pointers, "down");
  };


  /*
  Checks if a mouse button or touch has just been pressed (between the last and the current frame).
  
  @param {number} button A pointer constant representing the pointer to check
  @return {Object[]|boolean} Returns an array containing the pointers that have just been pressed, or false if no pressed pointers where detected
   */

  Pointer.prototype.isPressed = function(button) {
    var pointers;
    if (button === void 0) {
      throw new Error("Missing argument: button");
    }
    switch (this.getButtonType(button)) {
      case "mouse":
        pointers = (button === Globals.MOUSE_ANY ? this.mouse.buttons : this.mouse.buttons[button]);
        break;
      case "touch":
        pointers = (button === Globals.TOUCH_ANY ? this.touches : this.touches[button - Globals.TOUCH_1]);
        break;
      case "any":
        pointers = this.mouse.buttons.concat(this.touches);
    }
    return this.checkPointer(pointers, "pressed");
  };


  /*
  Checks if a mouse button or touch just been released (between the last and the current frame).
  
  @param {number} button A pointer constant representing the pointer to check
  @return {Object[]|boolean} Returns an array containing the pointers that have just been released, or false if no released pointers where detected
   */

  Pointer.prototype.isReleased = function(button) {
    var pointers;
    if (button === void 0) {
      throw new Error("Missing argument: button");
    }
    switch (this.getButtonType(button)) {
      case "mouse":
        pointers = (button === Globals.MOUSE_ANY ? this.mouse.buttons : this.mouse.buttons[button]);
        break;
      case "touch":
        pointers = (button === Globals.TOUCH_ANY ? this.touches : this.touches[button - Globals.TOUCH_1]);
        break;
      case "any":
        pointers = this.mouse.buttons.concat(this.touches);
    }
    return this.checkPointer(pointers, "released");
  };


  /*
  Checks if an area defined by a geometric shape, or its outside, has just been pressed (between the last and the current frame).
  The shape can be any geometric object that has a contains function (Rectangle, Polygon).
  
  @param {button} button A pointer constant representing the pointers to check
  @param {Math.Rectangle|Math.Polygon|Math.Circle} shape A geometric shape defining the area to check
  @param {boolean} outside [Whether or not to check the outside of the specified area]
  @return {Object[]|boolean} An array containing the pointers that have pressed the shape, or false if no presses inside the shape were detected
   */

  Pointer.prototype.shapeIsPressed = function(button, shape, outside) {
    var pointer, pointers, ret, _i, _len;
    button = (button !== void 0 ? button : Globals.MOUSE_TOUCH_ANY);
    if (shape === void 0) {
      throw new Error("Missing argument: shape");
    }
    if (typeof shape.contains !== "function") {
      throw new Error("Argument shape has implement a \"contains\"-function");
    }
    pointers = this.isPressed(button);
    ret = [];
    for (_i = 0, _len = pointers.length; _i < _len; _i++) {
      pointer = pointers[_i];
      if (pointer.x === false || pointer.y === false) {
        continue;
      }
      if (!outside && shape.contains(pointer)) {
        ret.push(pointer);
      } else {
        if (outside && !shape.contains(pointer)) {
          ret.push(pointer);
        }
      }
    }
    return ret;
  };


  /*
  Checks if an area defined by a geometric shape, or its outside, has just been released (between the last and the current frame).
  The shape can be any geometric object that has a contains function (Rectangle, Polygon).
  
  @param {button} button A pointer constant representing the pointers to check
  @param {Math.Rectangle|Math.Polygon|Math.Circle} shape A geometric shape defining the area to check
  @param {boolean} outside [Whether or not to check the outside of the specified area]
  @return {Object[]|boolean} An array containing the pointers that have released the shape, or false if no releases inside the shape were detected
   */

  Pointer.prototype.shapeIsReleased = function(button, shape, outside) {
    var pointer, pointers, ret, _i, _len;
    button = (button !== void 0 ? button : Globals.MOUSE_TOUCH_ANY);
    if (shape === void 0) {
      throw new Error("Missing argument: shape");
    }
    if (typeof shape.contains !== "function") {
      throw new Error("Argument shape has implement a \"contains\"-function");
    }
    pointers = this.isReleased(button);
    ret = [];
    for (_i = 0, _len = pointers.length; _i < _len; _i++) {
      pointer = pointers[_i];
      if (pointer.x === false || pointer.y === false) {
        continue;
      }
      if (!outside && shape.contains(pointer)) {
        ret.push(pointer);
      } else {
        if (outside && !shape.contains(pointer)) {
          ret.push(pointer);
        }
      }
    }
    return ret;
  };


  /*
  Checks if an area defined by a geometric shape, or its outside, is down (currently clicked by mouse or touch).
  The shape can be any geometric object that has a contains function (Rectangle, Polygon).
  
  @param {button} button A pointer constant representing the pointers to check
  @param {Math.Rectangle|Math.Polygon|Math.Circle} shape A geometric shape defining the area to check
  @param {boolean} outside [Whether or not to check the outside of the specified area]
  @return {Object[]|boolean} An array containing the pointers that are currently pressing the shape, or false if no pointers inside the shape were detected
   */

  Pointer.prototype.shapeIsDown = function(button, shape, outside) {
    var pointer, pointers, ret, _i, _len;
    button = (button !== void 0 ? button : Globals.MOUSE_TOUCH_ANY);
    if (shape === void 0) {
      throw new Error("Missing argument: shape");
    }
    if (typeof shape.contains !== "function") {
      throw new Error("Argument shape has implement a \"contains\"-function");
    }
    pointers = this.isDown(button);
    ret = [];
    for (_i = 0, _len = pointers.length; _i < _len; _i++) {
      pointer = pointers[_i];
      if (pointer.x === false || pointer.y === false) {
        continue;
      }
      if (!outside && shape.contains(pointer)) {
        ret.push(pointer);
      } else {
        if (outside && !shape.contains(pointer)) {
          ret.push(pointer);
        }
      }
    }
    return ret;
  };


  /*
  Returns a string representing the button type.
  
  @private
  @param {number} button A pointer button constant representing the button
  @return {string} A string representing the type of button ("mouse", "touch" or "any")
   */

  Pointer.prototype.getButtonType = function(button) {
    if (button >= Globals.MOUSE_ANY && button <= Globals.MOUSE_10) {
      return "mouse";
    } else if (button >= Globals.TOUCH_ANY && button <= Globals.TOUCH_10) {
      return "touch";
    } else if (button === Globals.MOUSE_TOUCH_ANY) {
      return "any";
    } else {
      throw new Error("Argument button has to be a pointer constant (see jseGlobals.js)");
    }
  };


  /*
  Checks the state of a pointer object
  
  @private
  @param {Object|Object[]} pointers A pointer object or an array of pointer objects to check the state of
  @param {string} state A state to check for "pressed", "released" or "down"
  @return {boolean} Whether or not the pointer or one of the pointers has the provided state
   */

  Pointer.prototype.checkPointer = function(pointers, state) {
    var pointer, ret, _i, _len;
    if (pointers === "undefined") {
      throw new Error("Missing argument: pointers");
    }
    if (state === "undefined") {
      throw new Error("Missing argument: state");
    }
    if (["pressed", "released", "down"].indexOf(state) === -1) {
      throw new Error("Argument state must be one of the following values: \"pressed\", \"released\" or \"down\"");
    }
    if (!Array.prototype.isPrototypeOf(pointers)) {
      pointers = [pointers];
    }
    ret = [];
    for (_i = 0, _len = pointers.length; _i < _len; _i++) {
      pointer = pointers[_i];
      switch (state) {
        case "pressed":
          if (pointer.events[0] > engine.last || pointer.events[1] > engine.last) {
            ret.push(pointer);
          }
          break;
        case "released":
          if (-pointer.events[0] > engine.last || -pointer.events[1] > engine.last) {
            ret.push(pointer);
          }
          break;
        case "down":
          if (pointer.events[0] > 0) {
            ret.push(pointer);
          }
      }
    }
    if (ret.length) {
      return ret;
    } else {
      return false;
    }
  };


  /*
  Converts a coordinate which is relative to the main canvas to a position in the room (based on the room's cameras)
  
  @private
  @param {Geometry.Vector} vector A vector representing a position which is relative to the main canvas
  @return {Geometry.Vector} vector A vector representing the calculated position relative to the room
   */

  Pointer.prototype.calculateRoomPosition = function(vector) {
    var camera, len, ret;
    ret = vector.copy();
    len = engine.cameras.length;
    while (len--) {
      camera = engine.cameras[len];
      if (camera.projectionRegion.contains(vector) || len === 0) {
        ret.move(-camera.projectionRegion.x, -camera.projectionRegion.y);
        ret.x *= camera.captureRegion.width / camera.projectionRegion.width;
        ret.y *= camera.captureRegion.height / camera.projectionRegion.height;
        ret.move(camera.captureRegion.x, camera.captureRegion.y);
        return ret;
      }
    }
    return ret;
  };


  /*
  Finds the first available spot in the Pointer.touches-array, used for registering the touches as numbers from 0-9.
  In Google Chrome, each touch's identifier can be used directly since the numbers - starting from 0 - are reused, when the a touch is released.
  In Safari however each touch has a unique id (a humongous number), and a function (this) is therefore needed for identifying the touches as the numbers 0-9, which can be used in the Pointer.touches-array.
  
  @private
  @return {number|boolean} The first available spot in the Pointer.touches-array where a new touch can be registered. If no spot is available, false is returned
   */

  Pointer.prototype.findTouchNumber = function() {
    var i, touch, _i, _len, _ref;
    _ref = this.touches;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      touch = _ref[i];
      if (!(touch.events[0] > 0)) {
        return i;
      }
    }
    return false;
  };


  /*
  Checks if an area defined by a geometric shape, or its outside, is hovered by the mouse pointer.
  The shape can be any geometric object that has a contains function (Rectangle, Polygon).
  
  @param {Math.Rectangle|Math.Polygon|Math.Circle} shape A geometric shape defining the area to check
  @param {boolean} outside [Whether or not to check the outside of the specified area]
  @return {boolean} True if the shape if hovered, false if not
   */

  Pointer.prototype.shapeIsHovered = function(shape, outside) {
    if (!outside && (shape.contains(this.mouse))) {
      return true;
    } else {
      if (outside && (!shape.contains(this.mouse))) {
        return true;
      }
    }
    return false;
  };


  /*
  Releases a button, and thereby prevents the button from being detected as "pressed" by the isPressed function.
  This function is very useful for preventing one button press from having multiple effects inside the game. For instance on buttons that are placed on top of each other.
  
  @param {number} button The button to release
  @return {boolean} True if the button has now been released, false if the button was not already pressed
   */

  Pointer.prototype.release = function(button) {
    var events, i, pointers, unpressed;
    if (button === void 0) {
      throw new Error("Missing argument: button");
    }
    pointers = this.isPressed(button);
    if (!pointers) {
      return false;
    }
    i = 0;
    while (i < pointers.length) {
      events = pointers[i].events;
      if (events[0] > engine.last) {
        events.shift();
        events.push(void 0);
        unpressed = true;
      }
      if (events[1] > engine.last) {
        events.pop();
        events.push(void 0);
        unpressed = true;
      }
      i++;
    }
    return unpressed;
  };


  /*
  Checks if the mouse pointer is outside the game arena.
  
  @return {boolean} True if the pointer is outside, false if not
   */

  Pointer.prototype.outside = function() {
    return new Math.Rectangle(engine.arena.offsetLeft, engine.arena.offsetTop, engine.arena.offsetWidth, engine.arena.offsetHeight).contains(this.mouse.window) === false;
  };


  /*
  Resets the mouse cursor, automatically called by the engine before each frame i executed, unless engine.resetCursorOnEachFrame is set to false
  
  @private
   */

  Pointer.prototype.resetCursor = function() {
    engine.arena.style.cursor = "default";
  };


  /*
  Sets the mouse cursor for the arena.
  By default the mouse cursor will be reset on each frame (this can be changed with the "resetCursorOnEachFrame" engine option)
  Please be aware that not all images can be used as cursor. Not all sizes and formats are supported by all browsers.
  
  @param {string} A resource string, image path string or css cursor of the cursor
   */

  Pointer.prototype.setCursor = function(cursor) {
    var resource;
    if (cursor === void 0) {
      throw new Error("Missing argument: cursor");
    }
    if (typeof cursor !== "string") {
      throw new Error("Argument cursor should be of type: string");
    }
    resource = engine.loader.getImage(cursor);
    if (resource) {
      cursor = "url('" + resource.src + "') 0 0, auto";
    } else {
      if (!/^\w*$/.test(cursor)) {
        cursor = "url('" + cursor + "') 0 0, auto";
      }
    }
    engine.arena.style.cursor = cursor;
  };

  return Pointer;

})();

Geometry = {
  Vector: require('../geometry/vector')
};

Globals = require('../engine/globals');



},{"../engine/globals":15,"../geometry/vector":23}],31:[function(require,module,exports){
var Animatable, Globals;

module.exports = Animatable = (function() {
  function Animatable() {}


  /*
  Used for animating numeric properties of the owner of the function.
  Available easing functions are:
  "linear"
  "quadIn"
  "quadOut"
  "quadInOut"
  "powerIn"
  "powerOut"
  "powerInOut"
  "sinusInOut"
  
  @param {object} properties An object containing key-value pairs in the following format:<code>
  {
  "[property name]": "[end value]"
  }
  </code>
  @param {object} options An object containing key-value pairs for the animation's option:<code>
  {
  "duraton": "[animation duration (in ms)]",
  "callback": "[callback function]",
  "easing": "[easing function to use]"
  }
  </code>
   */

  Animatable.prototype.animate = function(properties, options) {
    var anim, c, i, loop_, map, opt;
    if (properties === void 0) {
      throw new Error("Missing argument: properties");
    }
    if (options === void 0) {
      throw new Error("Missing argument: options");
    }
    anim = {};
    map = properties;
    opt = (options ? options : {});
    anim.obj = this;
    loop_ = (options.loop !== void 0 ? options.loop : (this.loop !== void 0 ? this.loop : engine.defaultAnimationLoop));
    anim.callback = (opt.callback !== void 0 ? opt.callback : function() {});
    anim.easing = (opt.easing !== void 0 ? opt.easing : Globals.EASING_QUAD_IN_OUT);
    anim.duration = (opt.duration !== void 0 ? opt.duration : 1000);
    anim.onStep = (opt.onStep !== void 0 ? opt.onStep : function() {});
    anim.prop = {};
    for (i in map) {
      if (map.hasOwnProperty(i)) {
        anim.prop[i] = {
          begin: this[i],
          end: map[i]
        };
      }
    }
    c = 0;
    for (i in anim.prop) {
      if (anim.prop.hasOwnProperty(i)) {
        if (anim.prop[i].begin === anim.prop[i].end && !this.propertyIsAnimated(i)) {
          delete anim.prop[i];
        } else {
          c++;
        }
      }
    }
    if (!c && anim.callback === function() {}) {
      return;
    }
    loop_.addAnimation(anim);
  };


  /*
  @scope Mixin.Animatable
   */


  /*
  Checks if the object is currently being animated.
  
  @return {boolean} Whether or not the object is being animated
   */

  Animatable.prototype.isAnimated = function() {
    var animId, animation, loop_, name, room, roomId;
    roomId = 0;
    while (roomId < engine.roomList.length) {
      room = engine.roomList[roomId];
      for (name in room.loops) {
        if (room.loops.hasOwnProperty(name)) {
          loop_ = room.loops[name];
          animId = loop_.animations.length - 1;
          while (animId > -1) {
            animation = loop_.animations[animId];
            if (animation.obj === this) {
              return true;
            }
            animId--;
          }
        }
      }
      roomId++;
    }
    return false;
  };


  /*
  Checks if a specific property is current being animated
  
  @return {boolean} Whether or not the property is being animated
   */

  Animatable.prototype.propertyIsAnimated = function(property) {
    var animId, animation, loop_, name, room, roomId;
    roomId = 0;
    while (roomId < engine.roomList.length) {
      room = engine.roomList[roomId];
      for (name in room.loops) {
        if (room.loops.hasOwnProperty(name)) {
          loop_ = room.loops[name];
          animId = loop_.animations.length - 1;
          while (animId > -1) {
            animation = loop_.animations[animId];
            if (animation.obj === this && animation.prop[property] !== void 0) {
              return true;
            }
            animId--;
          }
        }
      }
      roomId++;
    }
    return false;
  };


  /*
  Fetches all current animations of the object.
  
  @return {Object[]} An array of all the current animations of the object
   */

  Animatable.prototype.getAnimations = function() {
    var animId, animation, animations, loop_, name, room, roomId;
    animations = [];
    roomId = 0;
    while (roomId < engine.roomList.length) {
      room = engine.roomList[roomId];
      for (name in room.loops) {
        if (room.loops.hasOwnProperty(name)) {
          loop_ = room.loops[name];
          animId = loop_.animations.length - 1;
          while (animId > -1) {
            animation = loop_.animations[animId];
            if (animation.obj === this) {
              animations.push(animation);
            }
            animId--;
          }
        }
      }
      roomId++;
    }
    return animations;
  };


  /*
  Stops all current animations of the object.
   */

  Animatable.prototype.stopAnimations = function() {
    var name, room, roomId;
    roomId = 0;
    while (roomId < engine.roomList.length) {
      room = engine.roomList[roomId];
      for (name in room.loops) {
        if (room.loops.hasOwnProperty(name)) {
          room.loops[name].removeAnimationsOfObject(this);
        }
      }
      roomId++;
    }
  };

  Animatable.prototype.schedule = function(func, delay, loopName) {
    var room;
    loopName = loopName || "eachFrame";
    room = this.getRoom();
    if (!room) {
      throw new Error("Schedule requires that the object is added to a room");
    }
    room.loops[loopName].schedule(this, func, delay);
  };

  return Animatable;

})();

Globals = require('../engine/globals');



},{"../engine/globals":15}],32:[function(require,module,exports){
var Geometry, Globals, Texture;

module.exports = Texture = (function() {
  function Texture() {}


  /*
  Parses an offset global into an actual Math.Vector offset that fits the object's texture
  
  @param  {number} offset Offset global (OFFSET_TOP_LEFT, etc.)
  @return {Math.Vector} The offset vector the offset global corresponds to for the object
   */

  Texture.prototype.parseOffsetGlobal = function(offset) {
    var bottom, center, left, middle, ret, right, top;
    ret = new Geometry.Vector();
    left = Globals.OFFSET_TOP_LEFT | Globals.OFFSET_MIDDLE_LEFT | Globals.OFFSET_BOTTOM_LEFT;
    center = Globals.OFFSET_TOP_CENTER | Globals.OFFSET_MIDDLE_CENTER | Globals.OFFSET_BOTTOM_CENTER;
    right = Globals.OFFSET_TOP_RIGHT | Globals.OFFSET_MIDDLE_RIGHT | Globals.OFFSET_BOTTOM_RIGHT;
    if (offset & left) {
      ret.x = 0;
    } else if (offset & center) {
      ret.x = this.clipWidth / 2;
    } else if (offset & right) {
      ret.x = this.clipWidth;
    }
    top = Globals.OFFSET_TOP_LEFT | Globals.OFFSET_TOP_CENTER | Globals.OFFSET_TOP_RIGHT;
    middle = Globals.OFFSET_MIDDLE_LEFT | Globals.OFFSET_MIDDLE_CENTER | Globals.OFFSET_MIDDLE_RIGHT;
    bottom = Globals.OFFSET_BOTTOM_LEFT | Globals.OFFSET_BOTTOM_CENTER | Globals.OFFSET_BOTTOM_RIGHT;
    if (offset & top) {
      ret.y = 0;
    } else if (offset & middle) {
      ret.y = this.clipHeight / 2;
    } else if (offset & bottom) {
      ret.y = this.clipHeight;
    }
    return ret;
  };


  /*
  Calculates the region which the object will fill out when redrawn.
  
  @private
  @return {Rectangle} The bounding rectangle of the object
   */

  Texture.prototype.getRedrawRegion = function() {
    var box, i, parent, parents;
    box = new Geometry.Rectangle(-this.offset.x, -this.offset.y, this.clipWidth, this.clipHeight).getPolygon();
    parents = this.getParents();
    parents.unshift(this);
    i = 0;
    while (i < parents.length) {
      parent = parents[i];
      box.scale(parent.size * parent.widthScale, parent.size * parent.heightScale);
      box.rotate(parent.direction);
      box.move(parent.x, parent.y);
      i++;
    }
    box = box.getBoundingRectangle();
    box.x = Math.floor(box.x);
    box.y = Math.floor(box.y);
    box.width = Math.ceil(box.width + 1);
    box.height = Math.ceil(box.height + 1);
    return box;
  };

  return Texture;

})();

Geometry = {
  Vector: require('../geometry/vector'),
  Rectangle: require('../geometry/rectangle')
};

Globals = require('../engine/globals');



},{"../engine/globals":15,"../geometry/rectangle":22,"../geometry/vector":23}],33:[function(require,module,exports){
var CanvasRenderer, Helpers;

module.exports = CanvasRenderer = (function() {
  function CanvasRenderer(canvas) {
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d");
    return;
  }

  CanvasRenderer.prototype.render = function(cameras) {
    var c, camera, camerasLength, h, i, ii, rooms, roomsLength, sx, sy, w;
    camerasLength = cameras.length;
    c = this.context;
    c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    i = 0;
    while (i < camerasLength) {
      camera = cameras[i];
      c.save();
      w = camera.captureRegion.width;
      h = camera.captureRegion.height;
      if (camera.wm == null) {
        camera.wm = new Float32Array(9);
      }
      Helpers.MatrixCalculation.setTranslation(camera.wm, -camera.captureRegion.x, -camera.captureRegion.y);
      if (camera.captureRegion.width !== 0 && camera.captureRegion.height !== 0) {
        sx = camera.projectionRegion.width / camera.captureRegion.width;
        sy = camera.projectionRegion.height / camera.captureRegion.height;
        Helpers.MatrixCalculation.multiply(camera.wm, Helpers.MatrixCalculation.getScale(sx, sy));
      }
      Helpers.MatrixCalculation.multiply(camera.wm, Helpers.MatrixCalculation.getTranslation(camera.projectionRegion.x, camera.projectionRegion.y));
      c.beginPath();
      c.moveTo(camera.projectionRegion.x, camera.projectionRegion.y);
      c.lineTo(camera.projectionRegion.x + camera.projectionRegion.width, camera.projectionRegion.y);
      c.lineTo(camera.projectionRegion.x + camera.projectionRegion.width, camera.projectionRegion.y + camera.projectionRegion.height);
      c.lineTo(camera.projectionRegion.x, camera.projectionRegion.y + camera.projectionRegion.height);
      c.closePath();
      c.clip();
      rooms = [engine.masterRoom, camera.room];
      roomsLength = rooms.length;
      ii = 0;
      while (ii < roomsLength) {
        this.renderTree(rooms[ii], camera.wm);
        ii++;
      }
      c.restore();
      i++;
    }
  };

  CanvasRenderer.prototype.renderTree = function(object, wm) {
    var i, len, wmWithOffset, _results;
    if (object.wm == null) {
      object.wm = new Float32Array(9);
    }
    Helpers.MatrixCalculation.setLocalMatrix(object.wm, object);
    Helpers.MatrixCalculation.multiply(object.wm, wm);
    if (!object.isVisible()) {
      return;
    }
    if (object.renderType !== "") {
      wmWithOffset = Helpers.MatrixCalculation.getTranslation(-object.offset.x, -object.offset.y);
      Helpers.MatrixCalculation.multiply(wmWithOffset, object.wm);
      this.context.setTransform(wmWithOffset[0], wmWithOffset[1], wmWithOffset[3], wmWithOffset[4], wmWithOffset[6], wmWithOffset[7]);
      this.context.globalAlpha = object.opacity;
    }
    switch (object.renderType) {
      case "textblock":
        this.renderSprite(object);
        break;
      case "sprite":
        object.updateSubImage();
        this.renderSprite(object);
        if (engine.drawMasks) {
          this.renderMask(object);
        }
        if (engine.drawBoundingBoxes) {
          this.renderBoundingBox(object);
        }
        break;
      case "circle":
        this.renderCircle(object);
        break;
      case "line":
        this.renderLine(object);
        break;
      case "rectangle":
        this.renderRectangle(object);
        break;
      case "polygon":
        this.renderPolygon(object);
    }
    if (object.children) {
      len = object.children.length;
      i = 0;
      _results = [];
      while (i < len) {
        this.renderTree(object.children[i], object.wm);
        _results.push(i++);
      }
      return _results;
    }
  };

  CanvasRenderer.prototype.renderSprite = function(object) {
    this.context.drawImage(object.texture, (object.clipWidth + object.texture.spacing) * object.imageNumber, 0, object.clipWidth, object.clipHeight, 0, 0, object.clipWidth, object.clipHeight);
  };

  CanvasRenderer.prototype.renderCircle = function(object) {
    var c;
    c = this.context;
    c.strokeStyle = object.strokeStyle;
    c.fillStyle = object.fillStyle;
    c.beginPath();
    c.arc(0, 0, object.radius, 0, Math.PI * 2, true);
    c.globalAlpha = object.opacity;
    c.fill();
    if (object.lineWidth) {
      c.lineWidth = object.lineWidth;
      c.stroke();
    }
  };

  CanvasRenderer.prototype.renderPolygon = function(object) {
    var c, i, len;
    c = this.context;
    c.strokeStyle = object.strokeStyle;
    c.fillStyle = object.fillStyle;
    if (object.lineDash !== [] && c.setLineDash) {
      c.setLineDash(object.lineDash);
    }
    c.beginPath();
    len = object.points.length;
    i = 0;
    while (i < len) {
      c.lineTo(object.points[i].x, object.points[i].y);
      i++;
    }
    c.lineWidth = object.lineWidth;
    c.globalAlpha = object.opacity;
    if (object.closed) {
      c.closePath();
      c.fill();
      if (object.lineWidth) {
        c.stroke();
      }
    } else {
      c.fill();
      if (object.lineWidth) {
        c.stroke();
      }
      c.closePath();
    }
  };

  CanvasRenderer.prototype.renderLine = function(object) {
    var c;
    c = this.context;
    c.strokeStyle = object.strokeStyle;
    c.globalAlpha = object.opacity;
    c.beginPath();
    c.moveTo(object.a.x, object.a.y);
    c.lineTo(object.b.x, object.b.y);
    c.lineWidth = object.lineWidth;
    c.lineCap = object.lineCap;
    c.stroke();
  };

  CanvasRenderer.prototype.renderRectangle = function(object) {
    var c;
    c = this.context;
    c.strokeStyle = object.strokeStyle;
    c.fillStyle = object.fillStyle;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(object.width, 0);
    c.lineTo(object.width, object.height);
    c.lineTo(0, object.height);
    c.closePath();
    c.fill();
    if (object.lineWidth) {
      c.lineWidth = object.lineWidth;
      c.stroke();
    }
  };

  CanvasRenderer.prototype.renderMask = function(object) {
    var mask;
    mask = engine.loader.getMask(object.source, object.getTheme());
    if (object.imageLength !== 1 && object.animationSpeed !== 0) {
      if (engine.gameTime - object.animationLastSwitch > 1000 / object.animationSpeed) {
        object.imageNumber = object.imageNumber + (object.animationSpeed > 0 ? 1 : -1);
        object.animationLastSwitch = engine.gameTime;
        if (object.imageNumber === object.imageLength) {
          object.imageNumber = (object.animationLoops ? 0 : object.imageLength - 1);
        } else {
          if (object.imageNumber === -1) {
            object.imageNumber = (object.animationLoops ? object.imageLength - 1 : 0);
          }
        }
      }
    }
    return this.context.drawImage(mask, (object.clipWidth + object.texture.spacing) * object.imageNumber, 0, object.clipWidth, object.clipHeight, 0, 0, object.clipWidth, object.clipHeight);
  };

  CanvasRenderer.prototype.renderBoundingBox = function(object) {
    var box, c, mask, point, _i, _len, _ref;
    mask = engine.loader.getMask(object.source, object.getTheme());
    box = mask.boundingBox;
    c = this.context;
    c.strokeStyle = '#0F0';
    c.setLineDash([]);
    c.beginPath();
    _ref = box.points;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      point = _ref[_i];
      c.lineTo(point.x, point.y);
    }
    c.lineWidth = 1;
    c.globalAlpha = 1;
    c.closePath();
    return c.stroke();
  };

  return CanvasRenderer;

})();

Helpers = {
  MatrixCalculation: require('../helpers/matrix-calculation')
};



},{"../helpers/matrix-calculation":25}],34:[function(require,module,exports){
var ColorShaderProgram, Helpers, TextureShaderProgram, View, WebGLRenderer;

module.exports = WebGLRenderer = (function() {
  WebGLRenderer.prototype.currentResolution = {
    width: 0,
    height: 0
  };

  function WebGLRenderer(canvas) {
    var context, options, _i, _len, _ref;
    this.canvas = canvas;
    this.currentResolution.width = 0;
    this.currentResolution.height = 0;
    this.programs = {};
    this.currentProgram = false;
    options = {
      premultipliedAlpha: false,
      alpha: false
    };
    _ref = ["webgl", "experimental-webgl"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      context = _ref[_i];
      this.gl = this.canvas.getContext(context, options);
      if (this.gl) {
        break;
      }
    }
    this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.BLEND);
    this.programs = {
      texture: new TextureShaderProgram(this.gl),
      color: new ColorShaderProgram(this.gl)
    };
  }

  WebGLRenderer.prototype.setProgram = function(program) {
    var gl, l, _base, _base1;
    if (this.currentProgram !== program) {
      gl = this.gl;
      if (typeof (_base = this.currentProgram).flushBuffers === "function") {
        _base.flushBuffers(gl);
      }
      this.currentProgram = program;
      gl.useProgram(program.program);
      if (typeof (_base1 = this.currentProgram).onSet === "function") {
        _base1.onSet(gl);
      }
      l = program.locations;
      gl.uniform2f(l.u_resolution, this.currentResolution.width, this.currentResolution.height);
    }
  };

  WebGLRenderer.prototype.render = function(cameras) {
    var camera, cr, gl, h, pr, room, rooms, w, _i, _j, _len, _len1;
    gl = this.gl;
    for (_i = 0, _len = cameras.length; _i < _len; _i++) {
      camera = cameras[_i];
      cr = camera.captureRegion;
      pr = camera.projectionRegion;
      w = cr.width;
      h = cr.height;
      if (this.currentResolution.width !== w || this.currentResolution.height !== h) {
        this.currentResolution.width = w;
        this.currentResolution.height = h;
        if (this.currentProgram) {
          gl.uniform2f(this.currentProgram.locations.u_resolution, w, h);
        }
      }
      if (camera.wm == null) {
        camera.wm = new Float32Array(9);
      }
      Helpers.MatrixCalculation.setTranslation(camera.wm, -cr.x, -cr.y);
      gl.viewport(pr.x, pr.y, pr.width, pr.height);
      rooms = [engine.masterRoom, camera.room];
      for (_j = 0, _len1 = rooms.length; _j < _len1; _j++) {
        room = rooms[_j];
        this.renderRoom(room, camera.wm);
      }
    }
  };

  WebGLRenderer.prototype.renderRoom = function(room, wm) {
    var list;
    if (!room.parent) {
      room.parent = new View.Child();
      room.parent.wm = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
      room.parent.changed = false;
    }
    list = room.renderList != null ? room.renderList : room.renderList = [];
    this.updateRenderList(list, room, new Uint16Array([0]));
    this.processRenderList(list);
    if (engine.drawMasks) {
      this.renderMasks(list);
    }
    if (engine.drawBoundingBoxes) {
      this.renderBoundingBoxes(list);
    }
  };

  WebGLRenderer.prototype.updateRenderList = function(list, object, counter) {
    var child, last, _i, _len, _ref, _results;
    if (!object.isVisible()) {
      return;
    }
    last = list[counter[0]];
    if (object !== last) {
      if (last === void 0) {
        list.push(object);
      } else {
        list.splice(counter[0], list.length - counter[0], object);
      }
    }
    counter[0] += 1;
    if (object.children) {
      _ref = object.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(this.updateRenderList(list, child, counter));
      }
      return _results;
    }
  };

  WebGLRenderer.prototype.processRenderList = function(list) {
    var gl, object, offset, program, _base, _i, _len;
    gl = this.gl;
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      object = list[_i];
      if (object.wm == null) {
        object.wm = new Float32Array(9);
      }
      Helpers.MatrixCalculation.setLocalMatrix(object.wm, object);
      Helpers.MatrixCalculation.multiply(object.wm, object.parent.wm);
      offset = Helpers.MatrixCalculation.getTranslation(-object.offset.x, -object.offset.y);
      Helpers.MatrixCalculation.reverseMultiply(object.wm, offset);
      switch (object.renderType) {
        case "sprite":
          program = this.programs.texture;
          this.setProgram(program);
          program.renderSprite(gl, object, object.wm);
          break;
        case "textblock":
          program = this.programs.texture;
          this.setProgram(program);
          program.renderTextBlock(gl, object, object.wm);
          break;
        case "line":
          program = this.programs.color;
          this.setProgram(program);
          program.renderLine(gl, object, object.wm);
          break;
        case "rectangle":
          program = this.programs.color;
          this.setProgram(this.programs.color);
          program.renderRectangle(gl, object, object.wm);
      }
    }
    if (typeof (_base = this.currentProgram).flushBuffers === "function") {
      _base.flushBuffers(gl);
    }
  };

  WebGLRenderer.prototype.renderMasks = function(list) {
    var gl, object, _base, _i, _len;
    gl = this.gl;
    this.setProgram(this.programs.texture);
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      object = list[_i];
      if (object.mask) {
        this.currentProgram.renderMask(gl, object, object.wm);
      }
    }
    if (typeof (_base = this.currentProgram).flushBuffers === "function") {
      _base.flushBuffers(gl);
    }
  };

  WebGLRenderer.prototype.renderBoundingBoxes = function(list) {
    var gl, object, _base, _i, _len;
    gl = this.gl;
    this.setProgram(this.programs.color);
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      object = list[_i];
      if (object.mask) {
        this.currentProgram.renderBoundingBox(gl, object, object.wm);
      }
    }
    if (typeof (_base = this.currentProgram).flushBuffers === "function") {
      _base.flushBuffers(gl);
    }
  };

  return WebGLRenderer;

})();

TextureShaderProgram = require('./webgl/texture-shader-program');

ColorShaderProgram = require('./webgl/color-shader-program');

Helpers = {
  MatrixCalculation: require('../helpers/matrix-calculation')
};

View = {
  Child: require('../views/child')
};



},{"../helpers/matrix-calculation":25,"../views/child":40,"./webgl/color-shader-program":35,"./webgl/texture-shader-program":36}],35:[function(require,module,exports){
var Helpers, TriangleBuffer, WebGLColorShaderProgram;

TriangleBuffer = require('./triangle-buffer');

module.exports = WebGLColorShaderProgram = (function() {
  WebGLColorShaderProgram.prototype.program = null;

  WebGLColorShaderProgram.prototype.locations = {};

  WebGLColorShaderProgram.prototype.triangleBuffer = new TriangleBuffer(20000);

  WebGLColorShaderProgram.prototype.coordsBuffer = null;

  function WebGLColorShaderProgram(gl) {
    this.program = gl.createProgram();
    this.initShaders(gl);
    this.bindLocations(gl);
    this.initBuffers(gl);
  }

  WebGLColorShaderProgram.prototype.initShaders = function(gl) {
    var fragmentCode, fragmentShader, vertexCode, vertexShader;
    vertexCode = "uniform vec2 u_resolution; attribute vec2 a_position; attribute vec3 a_color; attribute float a_opacity; varying float v_opacity; varying vec3 v_color; void main() { vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0; gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1); v_color = a_color; v_opacity = a_opacity; }";
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexCode);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(vertexShader));
    }
    gl.attachShader(this.program, vertexShader);
    fragmentCode = "precision mediump float; varying vec3 v_color; varying float v_opacity; void main() { gl_FragColor = vec4(v_color, v_opacity); }";
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentCode);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(fragmentShader));
    }
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);
  };

  WebGLColorShaderProgram.prototype.bindLocations = function(gl) {
    this.locations = {
      a_position: gl.getAttribLocation(this.program, "a_position"),
      a_color: gl.getAttribLocation(this.program, "a_color"),
      a_opacity: gl.getAttribLocation(this.program, "a_opacity"),
      u_resolution: gl.getUniformLocation(this.program, "u_resolution")
    };
  };

  WebGLColorShaderProgram.prototype.initBuffers = function(gl) {
    this.vertexBuffer = gl.createBuffer();
  };

  WebGLColorShaderProgram.prototype.onSet = function(gl) {
    var floatSize;
    floatSize = this.triangleBuffer.getBuffer().BYTES_PER_ELEMENT;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.locations.a_position, 2, gl.FLOAT, false, 6 * floatSize, 0);
    gl.enableVertexAttribArray(this.locations.a_position);
    gl.vertexAttribPointer(this.locations.a_color, 3, gl.FLOAT, false, 6 * floatSize, 2 * floatSize);
    gl.enableVertexAttribArray(this.locations.a_color);
    gl.vertexAttribPointer(this.locations.a_opacity, 1, gl.FLOAT, false, 6 * floatSize, 5 * floatSize);
    gl.enableVertexAttribArray(this.locations.a_opacity);
  };

  WebGLColorShaderProgram.prototype.renderLine = function(gl, object, wm) {
    var color, coords, offset, triangleCount;
    if (object.strokeStyle === "transparent") {
      return;
    }
    color = Helpers.WebGL.colorFromCSSString(object.strokeStyle);
    coords = Helpers.WebGL.getLineCoords(object);
    triangleCount = coords.length / 2 - 2;
    while (--triangleCount) {
      offset = triangleCount * 2;
      if (!this.triangleBuffer.pushTriangle(coords[0], coords[1], coords[offset], coords[offset + 1], coords[offset + 2], coords[offset + 3], color, object.opacity, wm)) {
        this.flushBuffers(gl);
      }
    }
  };

  WebGLColorShaderProgram.prototype.renderRectangle = function(gl, object, wm) {
    var color, coords, offset, triangleCount;
    if (object.fillStyle !== "transparent") {
      color = Helpers.WebGL.colorFromCSSString(object.fillStyle);
      if (!this.triangleBuffer.pushTriangle(0, 0, object.width, 0, object.width, object.height, color, object.opacity, wm)) {
        this.flushBuffers(gl);
      }
      if (!this.triangleBuffer.pushTriangle(0, 0, object.width, object.height, 0, object.height, color, object.opacity, wm)) {
        this.flushBuffers(gl);
      }
    }
    if (object.strokeStyle !== "transparent" && object.lineWidth !== 0) {
      color = Helpers.WebGL.colorFromCSSString(object.strokeStyle);
      coords = Helpers.WebGL.getPlaneOutlineCoords(object.width, object.height, object.lineWidth);
      triangleCount = coords.length / 6;
      while (triangleCount--) {
        offset = triangleCount * 6;
        if (!this.triangleBuffer.pushTriangle(coords[offset], coords[offset + 1], coords[offset + 2], coords[offset + 3], coords[offset + 4], coords[offset + 5], color, object.opacity, wm)) {
          this.flushBuffers(gl);
        }
      }
    }
  };

  WebGLColorShaderProgram.prototype.flushBuffers = function(gl) {
    var triangleCount;
    triangleCount = this.triangleBuffer.getTriangleCount();
    if (triangleCount !== 0) {
      gl.bufferData(gl.ARRAY_BUFFER, this.triangleBuffer.getBuffer(), gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, triangleCount * 3);
      this.triangleBuffer.resetIndex();
    }
  };

  return WebGLColorShaderProgram;

})();

Helpers = {
  WebGL: require('../../helpers/webgl')
};



},{"../../helpers/webgl":28,"./triangle-buffer":37}],36:[function(require,module,exports){
var WebGLTextureShaderProgram, coordsBufferLength;

coordsBufferLength = 5 * 6 * 20000;

module.exports = WebGLTextureShaderProgram = (function() {
  WebGLTextureShaderProgram.prototype.textureCache = {};

  WebGLTextureShaderProgram.prototype.maskCache = {};

  WebGLTextureShaderProgram.prototype.locations = {};

  WebGLTextureShaderProgram.prototype.currentTexture = document.createElement('img');

  WebGLTextureShaderProgram.prototype.program = null;

  WebGLTextureShaderProgram.prototype.coordsCount = 0;

  WebGLTextureShaderProgram.prototype.coords = new Float32Array(coordsBufferLength);

  WebGLTextureShaderProgram.prototype.coordsBuffer = null;

  WebGLTextureShaderProgram.prototype.cornerCoords = new Float32Array(8);

  function WebGLTextureShaderProgram(gl) {
    this.program = gl.createProgram();
    this.initShaders(gl);
    this.bindLocations(gl);
    this.initBuffers(gl);
  }

  WebGLTextureShaderProgram.prototype.initShaders = function(gl) {
    var compiled, fragmentCode, fragmentShader, vertexCode, vertexShader;
    vertexCode = "uniform vec2 u_resolution; attribute vec2 a_position; attribute vec2 a_texCoord; attribute float a_opacity; varying vec2 v_texCoord; varying float v_opacity; void main() { vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0; gl_Position = vec4(clipSpace * vec2(1, -1), 0.0, 1.0); v_texCoord = a_texCoord; v_opacity = a_opacity; }";
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexCode);
    gl.compileShader(vertexShader);
    gl.attachShader(this.program, vertexShader);
    compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (!compiled) {
      console.error(gl.getShaderInfoLog(vertexShader));
    }
    fragmentCode = "precision mediump float; uniform sampler2D u_image; varying vec2 v_texCoord; varying float v_opacity; void main() { vec4 textureColor = texture2D(u_image, v_texCoord); gl_FragColor = vec4(textureColor.rgb, textureColor.a * v_opacity); }";
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentCode);
    gl.compileShader(fragmentShader);
    compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!compiled) {
      console.error(gl.getShaderInfoLog(fragmentShader));
    }
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);
  };

  WebGLTextureShaderProgram.prototype.bindLocations = function(gl) {
    this.locations.a_position = gl.getAttribLocation(this.program, "a_position");
    this.locations.a_texCoord = gl.getAttribLocation(this.program, "a_texCoord");
    this.locations.a_opacity = gl.getAttribLocation(this.program, "a_opacity");
    this.locations.u_resolution = gl.getUniformLocation(this.program, "u_resolution");
  };

  WebGLTextureShaderProgram.prototype.initBuffers = function(gl) {
    this.coordsBuffer = gl.createBuffer();
  };

  WebGLTextureShaderProgram.prototype.onSet = function(gl) {
    var floatSize;
    floatSize = this.coords.BYTES_PER_ELEMENT;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
    gl.vertexAttribPointer(this.locations.a_position, 2, gl.FLOAT, false, 5 * floatSize, 0);
    gl.enableVertexAttribArray(this.locations.a_position);
    gl.vertexAttribPointer(this.locations.a_texCoord, 2, gl.FLOAT, false, 5 * floatSize, 2 * floatSize);
    gl.enableVertexAttribArray(this.locations.a_texCoord);
    gl.vertexAttribPointer(this.locations.a_opacity, 1, gl.FLOAT, false, 5 * floatSize, 4 * floatSize);
    gl.enableVertexAttribArray(this.locations.a_opacity);
  };

  WebGLTextureShaderProgram.prototype.renderSprite = function(gl, object, wm) {
    this.setSpriteTexture(gl, object);
    this.setTransformedCorners(object.clipWidth, object.clipHeight, wm);
    this.bufferOpacity(object.opacity);
    this.bufferRectangle();
    if (object.imageLength === 1) {
      this.bufferTexture();
    } else {
      this.bufferAnimatedTexture(object);
    }
    this.coordsCount += 30;
  };

  WebGLTextureShaderProgram.prototype.renderTextBlock = function(gl, object, wm) {
    if (this.textureCache[object.texture.lastCacheKey]) {
      gl.deleteTexture(this.textureCache[object.texture.lastCacheKey]);
      this.textureCache[object.texture.lastCacheKey] = null;
    }
    this.renderSprite(gl, object, wm);
  };

  WebGLTextureShaderProgram.prototype.setSpriteTexture = function(gl, object) {
    var texture;
    texture = object.texture;
    this.setTexture(gl, texture);
  };

  WebGLTextureShaderProgram.prototype.renderMask = function(gl, object, wm) {
    this.setMaskTexture(gl, object);
    this.setTransformedCorners(object.clipWidth, object.clipHeight, wm);
    this.bufferOpacity(1);
    this.bufferRectangle();
    if (object.imageLength === 1) {
      this.bufferTexture();
    } else {
      this.bufferAnimatedTexture(object);
    }
    this.coordsCount += 30;
  };

  WebGLTextureShaderProgram.prototype.setMaskTexture = function(gl, object) {
    var texture;
    texture = engine.loader.getMask(object.source, object.getTheme());
    this.setTexture(gl, texture);
  };

  WebGLTextureShaderProgram.prototype.setTexture = function(gl, texture) {
    if (this.coordsCount === this.coords.length || this.currentTexture.cacheKey !== texture.cacheKey) {
      this.flushBuffers(gl);
      this.currentTexture = texture;
    }
  };

  WebGLTextureShaderProgram.prototype.setTransformedCorners = function(width, height, wm) {
    this.cornerCoords[0] = wm[6];
    this.cornerCoords[1] = wm[7];
    this.cornerCoords[2] = width * wm[0] + wm[6];
    this.cornerCoords[3] = width * wm[1] + wm[7];
    this.cornerCoords[4] = height * wm[3] + wm[6];
    this.cornerCoords[5] = height * wm[4] + wm[7];
    this.cornerCoords[6] = width * wm[0] + height * wm[3] + wm[6];
    return this.cornerCoords[7] = width * wm[1] + height * wm[4] + wm[7];
  };

  WebGLTextureShaderProgram.prototype.bufferOpacity = function(opacity) {
    this.coords[this.coordsCount + 4] = opacity;
    this.coords[this.coordsCount + 9] = opacity;
    this.coords[this.coordsCount + 14] = opacity;
    this.coords[this.coordsCount + 19] = opacity;
    this.coords[this.coordsCount + 24] = opacity;
    return this.coords[this.coordsCount + 29] = opacity;
  };

  WebGLTextureShaderProgram.prototype.bufferRectangle = function() {
    this.coords[this.coordsCount] = this.cornerCoords[0];
    this.coords[this.coordsCount + 1] = this.cornerCoords[1];
    this.coords[this.coordsCount + 5] = this.cornerCoords[2];
    this.coords[this.coordsCount + 6] = this.cornerCoords[3];
    this.coords[this.coordsCount + 10] = this.cornerCoords[4];
    this.coords[this.coordsCount + 11] = this.cornerCoords[5];
    this.coords[this.coordsCount + 15] = this.cornerCoords[4];
    this.coords[this.coordsCount + 16] = this.cornerCoords[5];
    this.coords[this.coordsCount + 20] = this.cornerCoords[2];
    this.coords[this.coordsCount + 21] = this.cornerCoords[3];
    this.coords[this.coordsCount + 25] = this.cornerCoords[6];
    this.coords[this.coordsCount + 26] = this.cornerCoords[7];
  };

  WebGLTextureShaderProgram.prototype.bufferTexture = function() {
    this.coords[this.coordsCount + 2] = 0.0;
    this.coords[this.coordsCount + 3] = 0.0;
    this.coords[this.coordsCount + 7] = 1.0;
    this.coords[this.coordsCount + 8] = 0.0;
    this.coords[this.coordsCount + 12] = 0.0;
    this.coords[this.coordsCount + 13] = 1.0;
    this.coords[this.coordsCount + 17] = 0.0;
    this.coords[this.coordsCount + 18] = 1.0;
    this.coords[this.coordsCount + 22] = 1.0;
    this.coords[this.coordsCount + 23] = 0.0;
    this.coords[this.coordsCount + 27] = 1.0;
    this.coords[this.coordsCount + 28] = 1.0;
  };

  WebGLTextureShaderProgram.prototype.bufferAnimatedTexture = function(object) {
    var x1, x2;
    object.updateSubImage();
    x1 = (object.clipWidth + object.texture.spacing) * object.imageNumber;
    x2 = x1 + object.clipWidth;
    x1 /= object.texture.width;
    x2 /= object.texture.width;
    this.coords[this.coordsCount + 2] = x1;
    this.coords[this.coordsCount + 3] = 0.0;
    this.coords[this.coordsCount + 7] = x2;
    this.coords[this.coordsCount + 8] = 0.0;
    this.coords[this.coordsCount + 12] = x1;
    this.coords[this.coordsCount + 13] = 1.0;
    this.coords[this.coordsCount + 17] = x1;
    this.coords[this.coordsCount + 18] = 1.0;
    this.coords[this.coordsCount + 22] = x2;
    this.coords[this.coordsCount + 23] = 0.0;
    this.coords[this.coordsCount + 27] = x2;
    this.coords[this.coordsCount + 28] = 1.0;
  };

  WebGLTextureShaderProgram.prototype.getGLTexture = function(gl, texture) {
    return this.textureCache[texture.cacheKey] || (this.textureCache[texture.cacheKey] = this.createGLTexture(gl, texture));
  };

  WebGLTextureShaderProgram.prototype.createGLTexture = function(gl, image) {
    var texture;
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    if (image.imageLength === 1) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
    return texture;
  };

  WebGLTextureShaderProgram.prototype.flushBuffers = function(gl) {
    var texture;
    if (this.coordsCount) {
      texture = this.getGLTexture(gl, this.currentTexture);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.bufferData(gl.ARRAY_BUFFER, this.coords, gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, this.coordsCount / 5);
      this.coordsCount = 0;
    }
  };

  return WebGLTextureShaderProgram;

})();



},{}],37:[function(require,module,exports){
var TriangleBuffer;

module.exports = TriangleBuffer = (function() {
  function TriangleBuffer(triangleCount) {
    this.triangleCount = triangleCount;
    this.buffer = new Float32Array((2 + 3 + 1) * 3 * this.triangleCount);
    this.currentTriangle = 0;
  }

  TriangleBuffer.prototype.resetIndex = function() {
    return this.currentTriangle = 0;
  };

  TriangleBuffer.prototype.getTriangleCount = function() {
    return this.currentTriangle;
  };

  TriangleBuffer.prototype.getBuffer = function() {
    return this.buffer;
  };

  TriangleBuffer.prototype.pushTriangle = function(x1, y1, x2, y2, x3, y3, color, opacity, wm) {
    var i;
    i = this.currentTriangle * 18;
    ++this.currentTriangle;
    this.buffer[i] = x1 * wm[0] + y1 * wm[3] + wm[6];
    this.buffer[i + 1] = x1 * wm[1] + y1 * wm[4] + wm[7];
    this.buffer[i + 2] = color[0];
    this.buffer[i + 3] = color[1];
    this.buffer[i + 4] = color[2];
    this.buffer[i + 5] = opacity;
    this.buffer[i + 6] = x2 * wm[0] + y2 * wm[3] + wm[6];
    this.buffer[i + 7] = x2 * wm[1] + y2 * wm[4] + wm[7];
    this.buffer[i + 8] = color[0];
    this.buffer[i + 9] = color[1];
    this.buffer[i + 10] = color[2];
    this.buffer[i + 11] = opacity;
    this.buffer[i + 12] = x3 * wm[0] + y3 * wm[3] + wm[6];
    this.buffer[i + 13] = x3 * wm[1] + y3 * wm[4] + wm[7];
    this.buffer[i + 14] = color[0];
    this.buffer[i + 15] = color[1];
    this.buffer[i + 16] = color[2];
    this.buffer[i + 17] = opacity;
    return this.triangleCount !== this.currentTriangle;
  };

  return TriangleBuffer;

})();



},{}],38:[function(require,module,exports){

/*
Constructor for the sound class

@name Sound.Effect
@class A wrapper-class for audio-elements. A Sound object stores multiple copies of the same sound to enable multiple simultaneous playbacks, and provides functions for controlling (start, stop) each playback.

@property {HTMLAudioElement} source The audio element which is used as the source of the music object

@param {HTMLAudioElement} audioElement The Audio element to use as source for the sound object
 */
var Effect;

module.exports = Effect = (function() {
  function Effect(audioElement) {
    if (audioElement === void 0) {
      throw new Error("Missing argument: audioElement");
    }
    if (audioElement.toString() !== "[object HTMLAudioElement]") {
      throw new Error("Argument audioElement has to be of type HTMLAudioElement");
    }
    this.source = audioElement;
    this.playbackId = 0;
    this.elements = [];
    this.source.addEventListener("canplaythrough", (function(_this) {
      return function() {
        _this.cacheCopies();
      };
    })(this), false);
    return;
  }


  /*
  Caches copies of the sound element, to enable simultaneous playback of the sound.
  This function is automatically called when the source sound is ready for playback.
  
  @private
   */

  Effect.prototype.cacheCopies = function() {
    var i, _results;
    i = 0;
    _results = [];
    while (i < engine.cachedSoundCopies) {
      this.elements.push(this.source.cloneNode());
      this.elements[i].started = false;
      _results.push(i++);
    }
    return _results;
  };


  /*
  Starts a playback of the object. The object supports multiple playbacks. Therefore a playback ID is issued for each playback, making it possible to stop a specific playback, or stop it from looping.
  
  @param {boolean} loop Whether or not to loop the playback
  @return {number|boolean} If playback succeeds: a playback ID representing the playback, else: false
   */

  Effect.prototype.play = function(loop_) {
    var sound, _i, _len, _ref;
    if (engine.soundsMuted) {
      return false;
    }
    _ref = this.elements;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sound = _ref[_i];
      if ((sound.started === false || sound.ended) && !sound.loop) {
        sound.started = true;
        sound.volume = 1;
        sound.play();
        if (loop_) {
          sound.loop = "loop";
        }
        this.playbackId++;
        sound.playbackId = this.playbackId;
        return this.playbackId;
      }
    }
    console.log("Too many playbacks of the same sound: " + this.source.src);
    return false;
  };


  /*
  Stops a specific playback of the object
  
  @param {number} playbackId The playback ID of the playback to stop. The ID is generated when a playback is started, and is returned by the play-function
   */

  Effect.prototype.stop = function(playbackId) {
    var sound, _i, _len, _ref;
    if (playbackId === void 0) {
      throw new Error("Missing argument: playbackId");
    }
    _ref = this.elements;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sound = _ref[_i];
      if (sound.playbackId === playbackId && sound.started && !sound.ended) {
        sound.volume = 0;
        sound.loop = false;
        return true;
      }
    }
    return false;
  };


  /*
  Stops all playbacks of the object
   */

  Effect.prototype.stopAll = function() {
    var sound, _i, _len, _ref;
    _ref = this.elements;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sound = _ref[_i];
      if (sound.started && !sound.ended) {
        sound.volume = 0;
        sound.loop = false;
      }
    }
  };


  /*
  Stops a specific playback from looping
  
  @param {number} playbackId The playback ID of the playback to stop from looping. The ID is generated when a playback is started, and is returned by the play-function
   */

  Effect.prototype.stopLoop = function(playbackId) {
    var sound;
    throw new Error("Missing argument: playbackId")((function() {
      var _i, _len, _ref;
      if (playbackId === void 0) {
        _ref = this.elements;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          sound = _ref[_i];
          if (sound.playbackId === playbackId && sound.started && !sound.ended) {
            sound.loop = false;
            true;
          }
        }
        return false;
      }
    }).call(this));
  };

  return Effect;

})();



},{}],39:[function(require,module,exports){

/*
Constructor for the Music class

@name Sound.Music
@class A wrapper-class for audio-elements which are to be used as music.

@property {boolean} paused Whether or not the music object is currently paused
@property {HTMLAudioElement} source The audio element which is used as the source of the music object

@param {HTMLAudioElement} audioElement The Audio element to use as source for the music object
 */
var Music;

module.exports = Music = (function() {
  function Music(audioElement) {
    if (audioElement === void 0) {
      throw new Error("Missing argument: audioElement");
    }
    if (audioElement.toString() !== "[object HTMLAudioElement]") {
      throw new Error("Argument audioElement has to be of type HTMLAudioElement");
    }
    this.source = audioElement;
    this.source.addEventListener('ended', (function(_this) {
      return function() {
        return _this.playing = false;
      };
    })(this));
    this.source.addEventListener('pause', (function(_this) {
      return function() {
        return _this.playing = false;
      };
    })(this));
    this.source.addEventListener('playing', (function(_this) {
      return function() {
        return _this.playing = true;
      };
    })(this));
    this.playing = false;
    return;
  }


  /*
  Starts playback of the object
  
  @param {boolean} loop Whether or not to loop the playback
  @return {boolean} True if the playback has started successfully, false if not
   */

  Music.prototype.play = function(loop_) {
    if (engine.musicMuted) {
      return false;
    }
    this.source.play();
    if (loop_) {
      this.source.loop = "loop";
    }
    return true;
  };


  /*
  Pauses the playback of the object
   */

  Music.prototype.pause = function() {
    this.source.pause();
  };


  /*
  Stops the playback of the object
   */

  Music.prototype.stop = function() {
    if (!this.source.ended) {
      this.source.pause();
      this.source.currentTime = 0;
      this.source.loop = false;
      return true;
    }
    return false;
  };


  /*
  Stops the playback from looping
   */

  Music.prototype.stopLoop = function() {
    if (this.source.started && !this.source.ended) {
      this.source.loop = false;
      return true;
    }
    return false;
  };

  return Music;

})();



},{}],40:[function(require,module,exports){

/*
@name View.Child
@class If a class inherits Child it can be added to the view list. Therefore all objects which can be drawn inherits this class
 */
var Child, Engine, Geometry, Room;

module.exports = Child = (function() {
  Child.prototype.renderType = null;

  function Child() {
    this.x = 0;
    this.y = 0;
    this.opacity = 1;
    this.direction = 0;
    this.size = 1;
    this.widthScale = 1;
    this.heightScale = 1;
    this.offset = new Geometry.Vector();
    return;
  }

  Child.prototype.offsetFromGlobal = function(offset) {
    this.offsetGlobal = offset;
    return this.offset = this.parseOffsetGlobal(offset);
  };


  /*
  Parses an offset global into an actual Vector offset
  (this function is only here for convenience and should be replaced by any class that inherits the child class)
  
  @param  {number} offset Offset global (OFFSET_TOP_LEFT, etc.)
  @return {Vector} A parsed version of the offset global
   */

  Child.prototype.parseOffsetGlobal = function(offset) {
    throw new Error('Offset globals are not supported for this class');
  };


  /*
  Checks if the child object is inside a room that is currently visible
  
  @return {Boolean} Whether or not the child object is currently in a visible room
   */

  Child.prototype.isInVisibleRoom = function() {
    var p;
    p = this.getParents().pop();
    return p === engine.currentRoom || p === engine.masterRoom;
  };


  /*
  Checks if the child object is in a state where it will get drawn.
  For this function to return true, the child object has to be both visible and placed in a visible room.
  
  @return {Boolean} Whether or not the child object is in a state where it will get drawn
   */

  Child.prototype.isDrawn = function() {
    return this.isVisible() && this.isInVisibleRoom();
  };


  /*
  Fetches the position of the child inside the room
  
  @return {Vector|Boolean} The objects position in its room, or false if the object is not placed in any room.
   */

  Child.prototype.getRoomPosition = function() {
    var i, parent, parents, pos;
    parents = this.getParents();
    if (parents.length && parents[parents.length - 1] instanceof Room) {
      pos = new Vector(this.x, this.y);
      i = 0;
      while (i < parents.length) {
        parent = parents[i];
        pos.scale(parent.widthScale * parent.size, parent.heightScale * parent.size);
        pos.rotate(parent.direction);
        pos.move(parent.x, parent.y);
        i++;
      }
      return pos;
    } else {
      return false;
    }
  };


  /*
  Creates and returns and array of all the child's parents (from closest to farthest)
  
  @return {View.Container[]} A list of all the child's parents
   */

  Child.prototype.getParents = function() {
    var parent, parents;
    parents = [];
    parent = this;
    while ((parent = parent.parent) !== void 0) {
      parents.push(parent);
    }
    return parents;
  };


  /*
  Finds the room to which the object is currently added
  
  @return {View.Room|Boolean} The room to which the object is currently added, or false if the object is not added to a room
   */

  Child.prototype.getRoom = function() {
    var ancestor, parents;
    parents = this.getParents();
    if (parents.length === 0) {
      return false;
    }
    ancestor = parents[parents.length - 1];
    if (ancestor instanceof Room) {
      return ancestor;
    } else {
      return false;
    }
  };


  /*
  Sets the position of the object relative to its parent
  
  @param {number} x The horisontal position
  @param {number} y The vertical position
   */

  Child.prototype.moveTo = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  };


  /*
  Calculates the distance to another child (the distance between the object's positions)
  @param  {View.Child} child The object to calculate the distance to
  @return {number} The distance in pixels
   */

  Child.prototype.getDistanceTo = function(child) {
    return this.getRoomPosition().subtract(child.getRoomPosition()).getLength();
  };


  /*
  Calculates the direction to another child
  @param  {View.Child} child The object to calculate the direction to
  @return {number} The direction in radians
   */

  Child.prototype.getDirectionTo = function(child) {
    return child.getRoomPosition().subtract(this.getRoomPosition()).getDirection();
  };


  /*
  Checks if the objects is visible. This function runs before each draw to ensure that it is necessary
  @return {boolean} Whether or not the object is visible (based on its size and opacity vars)
   */

  Child.prototype.isVisible = function() {
    return this.size !== 0 && this.widthScale !== 0 && this.heightScale !== 0;
  };

  return Child;

})();

Engine = Room = require('../engine/room');

Geometry = {
  Vector: require('../geometry/vector')
};



},{"../engine/room":18,"../geometry/vector":23}],41:[function(require,module,exports){
var Circle, Geometry, Helpers, Views,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Helpers = {
  Mixin: require('../helpers/mixin')
};

Geometry = {
  Circle: require('../geometry/circle')
};

Views = {
  Child: require('./child')
};


/*
Constructor for Circle class, uses the set function, to set the properties of the circle.

@name View.Circle
@class A class which is used for handling circles
@augments Math.Circle
@augments View.Child

@property {number} x The circle's horizontal position
@property {number} y The circle's vertical position
@property {number} radius The circle's radius
@property {string} strokeStyle The circle's color if added to a view (css color string)
@property {number} lineWidth The circle's width if added to a view (in px)
@property {string} fillStyle The circle's fill color if added to a view (css color string)

@param {number} x The x-coordinate for the center of the circle
@param {number} y The y-coordinate for the center of the circle
@param {number} radius The radius for the circle
@param {string} [fillStyle = "#000"] The circle's fill color if added to a view (css color string)
@param {string} [strokeStyle = "#000"] The circle's color if added to a view (css color string)
@param {number} [lineWidth = 1] The circle's width if added to a view (in px)
 */

module.exports = Circle = (function(_super) {
  __extends(Circle, _super);

  Helpers.Mixin.mixin(Circle, Views.Child);

  function Circle(x, y, radius, fillStyle, strokeStyle, lineWidth) {
    this.fillStyle = fillStyle != null ? fillStyle : "#000";
    this.strokeStyle = strokeStyle != null ? strokeStyle : "#000";
    this.lineWidth = lineWidth != null ? lineWidth : 0;
    Views.Child.prototype.constructor.call(this);
    this.renderType = "circle";
    this.set(x, y, radius);
    return;
  }

  return Circle;

})(Geometry.Circle);

Geometry.Rectangle = require('../geometry/rectangle');



},{"../geometry/circle":19,"../geometry/rectangle":22,"../helpers/mixin":26,"./child":40}],42:[function(require,module,exports){
var Collidable, Geometry, Helpers, Views,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Views = {
  Sprite: require('./sprite')
};


/*
The constructor for the Collidable class

@name View.Collidable
@class A class with functions for collision checking.
Can check both for precise (bitmap-based) collisions and bounding box collisions
@augments View.Sprite

@property {HTMLCanvasElement|HTMLImageElement} mask The mask to use for bitmap based collision checking, by default the mask will be autogenerated from the collidable's source
@property {int} collisionResolution The space between the checked pixels when checking for bitmap based collisions

@param {string} source A resource string for the sprite of the created object.
@param {number} [x=0] The x-position of the created object.
@param {number} [y=0] The y-position of the created object.
@param {number} [direction=0] The direction of the created object. Defaults to 0
@param {object} [additionalProperties] An object containing key-value pairs that will be set as properties for the created object. Can be used for setting advanced options such as sprite offset and opacity.
 */

module.exports = Collidable = (function(_super) {
  __extends(Collidable, _super);

  function Collidable(source, x, y, direction, additionalProperties) {
    Collidable.__super__.constructor.apply(this, arguments);
    this.mask = (this.mask ? this.mask : engine.loader.getMask(source, this.getTheme()));
    this.collisionResolution = (this.collisionResolution ? this.collisionResolution : engine.defaultCollisionResolution);
  }


  /*
  A "metafunction" for checking if the Collidable collides with another object of the same type.
  This function uses boundingBoxCollidesWith for narrowing down the number of objects to check, then uses maskCollidesWith for doing a precise collision check on the remaining objects.
  
  @param {View.Collidable|View.Collidable[]} objects Target object, or array of target objects
  @param {boolean} getCollisionPosition If true, the function returns an object representing the position of the detected collision. Defaults to false
  @param {boolean} getCollidingObjects If true, the function returns all colliding objects
  @return {Object|boolean} If not getCollisionPosition or getCollidingObjects is true, a boolean representing whether or not a collision was detected. If getCollisionPosition and or getCollidingObjects is true, returns an object of the following type:
  <code>{
  "objects": [Array of colliding objects],
  "positions": [Array of collision positions for each object]
  "combinedPosition": [The combined position of the collision]
  }</code>
  
  If getCollidingObjects is false, the objects-array will be empty and the positions-array will only contain one position which is the average collision position for all colliding objects.
  If getCollisionPosition is false, the positions-array will be empty
  If both getCollisionPosition and getCollidingObjects are true, the objects-array will contain all colliding objects, and the positions-array will contain each colliding object's collision position
   */

  Collidable.prototype.collidesWith = function(objects, getCollisionPosition, getCollidingObjects) {
    var i, position, ret;
    if (getCollisionPosition == null) {
      getCollisionPosition = false;
    }
    if (getCollidingObjects == null) {
      getCollidingObjects = false;
    }
    if (objects === void 0) {
      throw new Error("Missing argument: objects");
    }
    if (!Array.prototype.isPrototypeOf(objects)) {
      objects = [objects];
    }
    if (this.size === 0 || this.widthScale === 0 || this.heightScale === 0) {
      return false;
    }
    objects = this.boundingBoxCollidesWith(objects, true);
    if (objects === false) {
      return false;
    }
    if (!getCollisionPosition && !getCollidingObjects) {
      return this.maskCollidesWith(objects);
    } else {
      ret = {
        objects: [],
        positions: [],
        combinedPosition: false
      };
      if (getCollidingObjects === false) {
        position = this.maskCollidesWith(objects, true);
        if (position) {
          ret.positions.push(position);
          ret.combinedPosition = position.copy();
          ret.combinedPosition.pixelCount = 0;
        }
      } else {
        if (getCollisionPosition) {
          i = 0;
          while (i < objects.length) {
            position = this.maskCollidesWith(objects[i], true);
            if (position) {
              ret.objects.push(objects[i]);
              ret.positions.push(position);
            }
            i++;
          }
          if (ret.positions.length) {
            ret.combinedPosition = new Geometry.Vector();
            ret.combinedPosition.pixelCount = 0;
            ret.positions.forEach(function(p) {
              ret.combinedPosition.add(p.scale(p.pixelCount));
              ret.combinedPosition.pixelCount += p.pixelCount;
            });
            ret.combinedPosition.scale(1 / ret.combinedPosition.pixelCount);
          }
        } else {
          i = 0;
          while (i < objects.length) {
            if (this.maskCollidesWith(objects[i])) {
              ret.objects.push(objects[i]);
            }
            i++;
          }
        }
      }
    }
    if (ret.positions.length + ret.objects.length !== 0) {
      return ret;
    } else {
      return false;
    }
  };


  /*
  Checks for a collision with other objects' rotated BBoxes. The word polygon is used because the check is actually done by using the Polygon object.
  
  @param {Collidable|Collidable[]} objects Target object, or array of target objects
  @param {boolean} getCollidingObjects Whether or not to return an array of colliding objects (is slower because the check cannot stop when a single collission has been detected)
  @return {Object[]|boolean} If getCollidingObjects is set to true, an array of colliding object, else a boolean representing whether or not a collission was detected.
   */

  Collidable.prototype.boundingBoxCollidesWith = function(objects, getCollidingObjects) {
    var collidingObjects, i, obj, pol1, pol2;
    if (getCollidingObjects == null) {
      getCollidingObjects = false;
    }
    if (objects === void 0) {
      throw new Error("Missing argument: objects");
    }
    if (!Array.prototype.isPrototypeOf(objects)) {
      objects = [objects];
    }
    pol1 = this.getTransformedBoundingBox();
    collidingObjects = [];
    i = 0;
    while (i < objects.length) {
      obj = objects[i];
      pol2 = obj.getTransformedBoundingBox();
      if (pol1.intersects(pol2) || pol1.contains(pol2.points[0]) || pol2.contains(pol1.points[0])) {
        if (getCollidingObjects) {
          collidingObjects.push(obj);
        } else {
          return true;
        }
      }
      i++;
    }
    if (collidingObjects.length) {
      return collidingObjects;
    } else {
      return false;
    }
  };

  Collidable.prototype.getTransformedBoundingBox = function() {
    var box, i, parent, parents;
    box = this.mask.boundingBox.copy().move(-this.offset.x, -this.offset.y);
    parents = this.getParents();
    parents.unshift(this);
    i = 0;
    while (i < parents.length) {
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
      i++;
    }
    return box;
  };


  /*
  Checks for a mask based collisions with other Collidable objects.
  
  @param {View.Collidable|View.Collidable[]} objects Target object, or array of target objects
  @param {boolean} getCollisionPosition If true, the function returns an object representing the position of the detected collision. Defaults to false
  @return {Object|boolean} If getCollisionPosition is false, a boolean representing whether or not a collision was detected, else an object of the following type:
  <code>{
  "x": [The average horizontal distance from the Collidable to the detected collision],
  "y": [The average vertical distance from the Collidable to the detected collision],
  "pixelCount": [The number of colliding pixels]
  }</code>
   */

  Collidable.prototype.maskCollidesWith = function(objects, getCollisionPosition) {
    var avX, avY, bitmap, length, pixel, pxArr, retVector, x, y;
    if (objects === void 0) {
      throw new Error("Missing argument: objects");
    }
    if (!Array.prototype.isPrototypeOf(objects)) {
      objects = [objects];
    }
    getCollisionPosition = (getCollisionPosition !== void 0 ? getCollisionPosition : false);
    bitmap = this.createCollisionBitmap(objects);
    length = bitmap.data.length / 4;
    pxArr = [];
    pixel = 0;
    while (pixel < length) {
      x = pixel % bitmap.width;
      if (this.collisionResolution > 1 && x < this.collisionResolution) {
        y = Math.floor(pixel / bitmap.width);
        pixel -= x;
        if (y % 2) {
          pixel += Math.floor(this.collisionResolution / 2);
        }
      }
      if (bitmap.data[pixel * 4] < 127) {
        if (getCollisionPosition) {
          if (y === void 0) {
            y = Math.floor(pixel / bitmap.width);
          }
          pxArr.push({
            x: x,
            y: y
          });
        } else {
          return true;
        }
      }
      pixel += this.collisionResolution;
    }
    if (pxArr.length > 0) {
      pxArr = pxArr.sort(function(a, b) {
        if (a.x === b.x) {
          return 0;
        } else if (a.x > b.x) {
          return 1;
        } else {
          return -1;
        }
      });
      avX = (pxArr[0].x + pxArr[pxArr.length - 1].x) / 2;
      pxArr = pxArr.sort(function(a, b) {
        if (a.y === b.y) {
          return 0;
        } else if (a.y > b.y) {
          return 1;
        } else {
          return -1;
        }
      });
      avY = (pxArr[0].y + pxArr[pxArr.length - 1].y) / 2;
      avX -= this.offset.x;
      avY -= this.offset.y;
      avX /= this.size * this.widthScale;
      avY /= this.size * this.heightScale;
      retVector = new Geometry.Vector(avX, avY);
      retVector.rotate(this.direction);
      retVector.pixelCount = pxArr.length;
      return retVector;
    }
    return false;
  };

  Collidable.prototype.createCollisionBitmap = function(objects) {
    var c, calc, canvas, mask, obj, parent, parents, _i, _j, _k, _len, _len1, _len2;
    mask = this.mask;
    calc = Helpers.MatrixCalculation;
    canvas = document.createElement("canvas");
    canvas.width = Math.ceil(this.clipWidth);
    canvas.height = Math.ceil(this.clipHeight);
    canvas.id = 'colCanvas';
    c = canvas.getContext("2d");
    c.fillStyle = "#FFF";
    c.fillRect(0, 0, canvas.width, canvas.height);
    parents = this.getParents();
    parents.unshift(this);
    if (this.wm == null) {
      this.wm = new Float32Array(9);
    }
    calc.setTranslation(this.wm, this.offset.x, this.offset.y);
    for (_i = 0, _len = parents.length; _i < _len; _i++) {
      parent = parents[_i];
      calc.reverseMultiply(this.wm, calc.getInverseLocalMatrix(parent));
    }
    for (_j = 0, _len1 = objects.length; _j < _len1; _j++) {
      obj = objects[_j];
      if (obj === this) {
        throw new Error("Objects are not allowed to check for collisions with themselves");
      }
      if (obj.wm == null) {
        obj.wm = new Float32Array(9);
      }
      calc.setIdentity(obj.wm);
      parents = obj.getParents();
      parents.reverse();
      parents.push(obj);
      for (_k = 0, _len2 = parents.length; _k < _len2; _k++) {
        parent = parents[_k];
        calc.reverseMultiply(obj.wm, calc.getLocalMatrix(parent));
      }
      calc.multiply(obj.wm, this.wm);
      calc.reverseMultiply(obj.wm, calc.getTranslation(-obj.offset.x, -obj.offset.y));
      c.setTransform(obj.wm[0], obj.wm[1], obj.wm[3], obj.wm[4], obj.wm[6], obj.wm[7]);
      c.drawImage(obj.mask, (obj.clipWidth + obj.texture.spacing) * obj.imageNumber, 0, obj.clipWidth, obj.clipHeight, 0, 0, obj.clipWidth, obj.clipHeight);
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 0.5;
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.drawImage(mask, (this.clipWidth + this.texture.spacing) * this.imageNumber, 0, this.clipWidth, this.clipHeight, 0, 0, this.clipWidth, this.clipHeight);
    return c.getImageData(0, 0, canvas.width, canvas.height);
  };

  return Collidable;

})(Views.Sprite);

Helpers = {
  MatrixCalculation: require('../helpers/matrix-calculation')
};

Geometry = {
  Vector: require('../geometry/vector')
};



},{"../geometry/vector":23,"../helpers/matrix-calculation":25,"./sprite":48}],43:[function(require,module,exports){
var Container, ObjectCreator, Views,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Views = {
  Child: require('./child')
};


/*
Constructor for the View class.

@name Container
@class A class for objects that are to be drawn on the canvas (or to contain drawn objects)
All objects which are drawn on the game's canvas extends the View-class.
@augments Child

@property {Child[]} children The view's children
@property {Container} parent The parent of the view or undefined if the view is an orphan
@property {boolean} drawCacheEnabled Whether or not draw caching is enabled

@param {Child} child1 A child to add to the view upon creation
@param {Child} child2 An other child to add to the view upon creation
@param {Child} child3 A third ...
 */

module.exports = Container = (function(_super) {
  __extends(Container, _super);

  function Container() {
    var children;
    children = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    Container.__super__.constructor.call(this);
    this.children = [];
    this.addChildren.apply(this, children);
    this.create = new ObjectCreator(this);
    return;
  }


  /*
  Adds children to a View object. If the object that the children are added to, is a descendant of the current room, the children will be drawn on the stage when added. The added children will be drawn above the current children.
  
  @param {Child} child1 A child to add to the View object
  @param {Child} child2 Another child to add...
  @return {Child[]} An array containing the added children
   */

  Container.prototype.addChildren = function(child1, child2) {
    var child, i;
    if (arguments.length === 0) {
      return;
    }
    i = 0;
    while (i < arguments.length) {
      child = arguments[i];
      if (!child instanceof Views.Child) {
        throw new Error("Argument child has to be of type: Child");
      }
      if (child.parent) {
        child.parent.removeChildren(child);
      }
      this.children.push(child);
      child.parent = this;
      engine.enableRedrawRegions && child.onAfterChange();
      if (child.refreshSource) {
        child.refreshSource();
      }
      i++;
    }
    return arguments;
  };


  /*
  Adds a child to a View object, below an already added child. This means that the inserted child (or children) will be drawn below the child which they are inserted below.
  
  @param {Child|Child[]} insertChildren Child or array of children to insert before an existing child
  @param {Child} child Current child to insert other children before
  @return {Child[]} Array of the inserted children
   */

  Container.prototype.insertBelow = function(insertChildren, child) {
    var arr, i;
    if (insertChildren === void 0) {
      throw new Error("Missing argument: insertChildren");
    }
    if (child === void 0) {
      throw new Error("Missing argument: child");
    }
    if (!Array.prototype.isPrototypeOf(insertChildren)) {
      arr = [];
      arr.push(insertChildren);
      insertChildren = arr;
    }
    if ((i = this.children.indexOf(child)) !== -1) {
      this.children.splice.apply(this.children, [i, 0].concat(insertChildren));
    }
    i = 0;
    while (i < insertChildren.length) {
      child = insertChildren[i];
      if (!child instanceof Views.Child) {
        throw new Error("Argument child has to be of type: Child");
      }
      if (child.parent) {
        child.parent.removeChildren(child);
      }
      child.parent = this;
      engine.enableRedrawRegions && child.onAfterChange();
      if (child.refreshSource) {
        child.refreshSource();
      }
      i++;
    }
    return insertChildren;
  };


  /*
  Fetches an array of all the View's children.
  This will not return a pointer, so changing the returned array will not change the View's children.
  
  @return {Child[]} Array containing all of the View's children
   */

  Container.prototype.getChildren = function() {
    var i, ret;
    ret = [];
    i = 0;
    while (i < this.children.length) {
      ret.push(this.children[i]);
      i++;
    }
    return ret;
  };


  /*
  Sets theme of an  Children whose theme is not already set, will inherit the set theme. To enforce the theme to all children, use the recursive argument.
  
  @param {string} themeName The name of the theme to apply as the object's theme
  @param {boolean} [recursive=false] Whether or not the set theme will be applied to children for which a theme has already been set. If this argument is unset, it will default to false
   */

  Container.prototype.setTheme = function(themeName, recursive) {
    var i;
    if (themeName && loader.themes[themeName] === void 0) {
      throw new Error("Trying to set nonexistent theme: " + themeName);
    }
    recursive = (recursive !== void 0 ? recursive : false);
    this.theme = themeName;
    if (this.refreshSource) {
      this.refreshSource();
    }
    if (recursive) {
      i = 0;
      while (i < this.children.length) {
        this.children[i].setTheme(void 0, true);
        i++;
      }
    } else {
      this.applyToThisAndChildren(function() {
        if (this.refreshSource) {
          this.refreshSource();
        }
      });
    }
  };


  /*
  Executes a function for the View and all of the its children.
  
  @param {function} func Function to execute
   */

  Container.prototype.applyToThisAndChildren = function(func) {
    var i;
    if (func === void 0) {
      throw new Error("Missing argument: function");
    }
    func.call(this);
    i = 0;
    while (i < this.children.length) {
      if (this.children[i].applyToThisAndChildren) {
        this.children[i].applyToThisAndChildren(func);
      } else {
        func.call(this.children[i]);
      }
      i++;
    }
  };


  /*
  Removes one or more children from the
  
  @param {Child} child1 A child to add to the View object
  @param {Child} child2 Another child to remove...
  @return {Child[]} An array of the children which was removed. If an object, which was supplied as argument, was not a child of the View, it will not appear in the returned array
   */

  Container.prototype.removeChildren = function(child1, child2) {
    var childId, i, removed;
    if (arguments.length === 0) {
      throw new Error("This function needs at least one argument");
    }
    removed = [];
    i = arguments.length;
    while (i > -1) {
      childId = this.children.indexOf(arguments[i]);
      if (childId !== -1) {
        this.children.splice(childId, 1);
        removed.push(arguments[i]);
        arguments[i].parent = void 0;
      }
      i--;
    }
    return removed;
  };


  /*
  Removes all children from the
  
  @param {boolean} purge Whether or not to purge the removed children, meaning that their scheduled functions and loop-attached functions will be removed. (true by default)
   */

  Container.prototype.removeAllChildren = function(purge) {
    var rmChild;
    purge = (purge !== void 0 ? purge : true);
    rmChild = this.children.splice(0, this.children.length);
    rmChild.forEach(function(c) {
      c.parent = void 0;
      if (purge) {
        engine.purge(c);
      }
    });
  };


  /*
  Gets the complete region that will used for drawing on next draw
  
  @return {Math.Rectangle} A rectangle representing the region
   */

  Container.prototype.getCombinedRedrawRegion = function() {
    var addBox, box, child, i;
    if (this.getRedrawRegion) {
      box = this.getRedrawRegion();
    }
    i = 0;
    while (i < this.children.length) {
      child = this.children[i];
      if (child.getCombinedRedrawRegion) {
        addBox = child.getCombinedRedrawRegion();
      } else {
        addBox = child.getRedrawRegion();
      }
      child.currentRedrawRegion = addBox;
      if (addBox) {
        if (box) {
          box = box.getBoundingRectangle(addBox);
        } else {
          box = addBox;
        }
      }
      i++;
    }
    return box;
  };

  return Container;

})(Views.Child);

ObjectCreator = require('../engine/object-creator');



},{"../engine/object-creator":17,"./child":40}],44:[function(require,module,exports){
var GameObject, Geometry, Views,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Views = {
  Collidable: require('./collidable')
};


/*
The constructor for the GameObject class.

@name View.GameObject
@class A class which incorporates functions that are often used by objects in games:
- Is drawn as a sprite
- Has movement vector
- Has collision checking
@augments View.Collidable

@property {CustomLoop} loop The loop to which movement of the object has been assigned
@property {boolean} alive Whether or not the object is alive. If the object is not alive, it will not move
@property {Math.Vector} speed The two-directional velocity of the object in px/second

@param {string} source A string representing the source of the object's bitmap
@param {number} [x=0] The x-position of the object in the game arena, in pixels
@param {number} [y=0] The y-position of the object in the game arena, in pixels
@param {number} [direction=0] The rotation (in radians) of the object when drawn in the game arena
@param {Object} [additionalProperties] An object containing additional properties to assign to the created object.
The default is:
<code>
{
size: 1,
opacity: 1,
composite: 'source-over',
offset: new Math.Vector('center', 'center'),
loop: 'eachFrame',
speed: new Math.Vector(0, 0)
}
</code>
 */

module.exports = GameObject = (function(_super) {
  __extends(GameObject, _super);

  function GameObject(source, x, y, direction, additionalProperties) {
    if (source === void 0) {
      throw new Error("Missing argument: source");
    }
    if (x === void 0) {
      throw new Error("Missing argument: x");
    }
    if (y === void 0) {
      throw new Error("Missing argument: y");
    }
    GameObject.__super__.constructor.call(this, source, x, y, direction, additionalProperties);
    if (this.loop == null) {
      this.loop = engine.defaultActivityLoop;
    }
    if (!this.loop.hasOperation('basic-transforms')) {
      this.loop.attachOperation('basic-transforms', this.constructor.basicTransformsOperation);
    }
    this.loop.subscribeToOperation('basic-transforms', this);
    if (this.speed == null) {
      this.speed = new Geometry.Vector(0, 0);
    }
    if (this.rotationSpeed == null) {
      this.rotationSpeed = 0;
    }
    this.alive = true;
    return;
  }

  GameObject.basicTransformsOperation = function(objects) {
    var object, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = objects.length; _i < _len; _i++) {
      object = objects[_i];
      if (object.alive) {
        object.x += engine.perFrameSpeed(object.speed.x);
        object.y += engine.perFrameSpeed(object.speed.y);
        if (object.rotationSpeed) {
          _results.push(object.direction += engine.perFrameSpeed(object.rotationSpeed));
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return GameObject;

})(Views.Collidable);

Geometry = {
  Vector: require('../geometry/vector')
};



},{"../geometry/vector":23,"./collidable":42}],45:[function(require,module,exports){
var Geometry, Helpers, Line, Views,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Helpers = {
  Mixin: require('../helpers/mixin')
};

Geometry = {
  Line: require('../geometry/line')
};

Views = {
  Child: require('./child')
};


/*
Constructor for the Line class. Uses setFromVectors to create the line's start and end points

@name View.Line
@class A class which is used for handling lines
@augments View.Child
@augments Mixin.Animatable

@property {View.Vector} a The line's starting point
@property {View.Vector} b The line's ending point
@property {string} strokeStyle The line's color if added to a view (css color string)
@property {string} lineWidth The line's width if added to a view (in px)
@property {string} lineCap The line's cap style if added to a view

@param {View.Vector} startVector A Vector representing the start point of the line
@param {View.Vector} endVector A Vector representing the end point of the line
@param {string} [strokeStyle="#000"] The line's color if added to a view (css color string)
@param {number} [lineWidth=1] The line's width if added to a view (in px)
@param {string} [lineCap='butt'] The line's cap style if added to a view
 */

module.exports = Line = (function(_super) {
  __extends(Line, _super);

  Helpers.Mixin.mixin(Line, Views.Child);

  function Line(startVector, endVector, strokeStyle, lineWidth, lineCap) {
    Views.Child.prototype.constructor.call(this);
    this.renderType = "line";
    if (engine.enableRedrawRegions) {
      this.LineInitWithRedrawRegions(startVector, endVector, strokeStyle, lineWidth, lineCap);
    } else {
      this.LineInitWithoutRedrawRegions(startVector, endVector, strokeStyle, lineWidth, lineCap);
    }
    return;
  }

  Line.prototype.LineInitWithoutRedrawRegions = function(startVector, endVector, strokeStyle, lineWidth, lineCap) {
    this.strokeStyle = strokeStyle || "#000";
    this.lineWidth = lineWidth || 1;
    this.lineCap = lineCap || "butt";
    this.setFromVectors(startVector || new Geometry.Vector(), endVector || new Geometry.Vector());
  };

  Line.prototype.LineInitWithRedrawRegions = function(startVector, endVector, strokeStyle, lineWidth, lineCap) {
    var hidden;
    hidden = {
      strokeStyle: strokeStyle || "#000",
      lineWidth: lineWidth || 1,
      lineCap: lineCap || "butt",
      a: void 0,
      b: void 0,
      parentObject: this
    };
    Object.defineProperty(this, "strokeStyle", {
      get: function() {
        return hidden.strokeStyle;
      },
      set: function(value) {
        if (hidden.strokeStyle !== value) {
          hidden.strokeStyle = value;
          this.onAfterChange();
        }
      }
    });
    Object.defineProperty(this, "lineCap", {
      get: function() {
        return hidden.lineCap;
      },
      set: function(value) {
        if (hidden.lineCap !== value) {
          hidden.lineCap = value;
          this.onAfterChange();
        }
      }
    });
    Object.defineProperty(this, "lineWidth", {
      get: function() {
        return hidden.lineWidth;
      },
      set: function(value) {
        if (hidden.lineWidth !== value) {
          hidden.lineWidth = value;
          this.onAfterChange();
        }
      }
    });
    Object.defineProperty(this, "a", {
      get: function() {
        return hidden.a;
      },
      set: function(value) {
        var xHidden, yHidden;
        if (hidden.a !== value) {
          hidden.a = value;
          xHidden = hidden.a.x;
          yHidden = hidden.a.y;
          Object.defineProperty(hidden.a, "x", {
            get: function() {
              return xHidden;
            },
            set: function(value) {
              if (xHidden !== value) {
                xHidden = value;
                hidden.parentObject.onAfterChange();
              }
            }
          });
          Object.defineProperty(hidden.a, "y", {
            get: function() {
              return yHidden;
            },
            set: function(value) {
              if (yHidden !== value) {
                yHidden = value;
                hidden.parentObject.onAfterChange();
              }
            }
          });
          this.onAfterChange();
        }
      }
    });
    Object.defineProperty(this, "b", {
      get: function() {
        return hidden.b;
      },
      set: function(value) {
        var xHidden, yHidden;
        if (hidden.b !== value) {
          hidden.b = value;
          xHidden = hidden.b.x;
          yHidden = hidden.b.y;
          Object.defineProperty(hidden.b, "x", {
            get: function() {
              return xHidden;
            },
            set: function(value) {
              if (xHidden !== value) {
                xHidden = value;
                hidden.parentObject.onAfterChange();
              }
            }
          });
          Object.defineProperty(hidden.b, "y", {
            get: function() {
              return yHidden;
            },
            set: function(value) {
              if (yHidden !== value) {
                yHidden = value;
                hidden.parentObject.onAfterChange();
              }
            }
          });
          this.onAfterChange();
        }
      }
    });
    this.setFromVectors(startVector || new Geometry.Vector(), endVector || new Geometry.Vector());
  };


  /*
  Calculates the region which the object will fill out when redrawn.
  
  @private
  @return {Math.Rectangle} The bounding rectangle of the redraw
   */

  Line.prototype.getRedrawRegion = function() {
    var box, i, ln, parent, parents;
    box = this.getPolygon();
    parents = this.getParents();
    parents.unshift(this);
    i = 0;
    while (i < parents.length) {
      parent = parents[i];
      box.scale(parent.size * parent.widthScale, parent.size * parent.heightScale);
      box.rotate(parent.direction);
      box.move(parent.x, parent.y);
      i++;
    }
    box = box.getBoundingRectangle();
    ln = Math.ceil(this.lineWidth / 2);
    box.x = Math.floor(box.x - ln);
    box.y = Math.floor(box.y - ln);
    box.width = Math.ceil(box.width + ln * 2 + 1);
    box.height = Math.ceil(box.height + ln * 2 + 1);
    return box;
  };


  /*
  Override View.Child's isVisible-function, making the line invisible if its points share the same coordinates
  Above is how canvas does by default (but other renderers should do this by default as well)
  
  @return {Boolean} Whether or not the line is "visible" (if not, renderers will not try to draw it)
   */

  Line.prototype.isVisible = function() {
    return Views.Child.prototype.isVisible.call(this) && (this.a.x !== this.b.x || this.a.y !== this.b.y);
  };

  return Line;

})(Geometry.Line);

Geometry.Vector = require('../geometry/vector');



},{"../geometry/line":20,"../geometry/vector":23,"../helpers/mixin":26,"./child":40}],46:[function(require,module,exports){
var Geometry, Helpers, Polygon, Views,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Helpers = {
  Mixin: require('../helpers/mixin')
};

Geometry = {
  Polygon: require('../geometry/polygon')
};

Views = {
  Child: require('./child')
};


/*
The constructor for the Polygon class. Uses the setFromPoints-function to set the points of the polygon.

@name View.Polygon
@class A class which is used for handling polygons
@augments Math.Polygon
@augments View.Child

@property {Vector[]} points An array of the polygon's points. Each point is connect to the previous- and next points, and the first and last points are connected
@property {string} strokeStyle The polygon's color if added to a view (css color string)
@property {number} lineWidth The polygon's width if added to a view (in px)
@property {string} fillStyle The polygon's fill color if added to a view (css color string)

@param {Vector[]} points An array of Vector's which are to be used as points for the polygon. Keep in mind that the polygon will NOT copy the points, so changing another reference to one of the added points will change the point inside the polygon.
@param {string} [fillStyle = "#000"] The polygon's fill color if added to a view (css color string)
@param {string} [strokeStyle = "#000"] The polygon's color if added to a view (css color string)
@param {number} [lineWidth = 1] The polygon's width if added to a view (in px)
 */

module.exports = Polygon = (function(_super) {
  __extends(Polygon, _super);

  Helpers.Mixin.mixin(Polygon, Views.Child);

  function Polygon(points, fillStyle, strokeStyle, lineWidth) {
    this.fillStyle = fillStyle != null ? fillStyle : '#000';
    this.strokeStyle = strokeStyle != null ? strokeStyle : "#000";
    this.lineWidth = lineWidth != null ? lineWidth : 0;
    Views.Child.prototype.constructor.call(this);
    this.renderType = "polygon";
    this.setFromPoints(points);
    this.opacity = 1;
    this.closed = 1;
    this.lineDash = [];
    return;
  }

  return Polygon;

})(Geometry.Polygon);



},{"../geometry/polygon":21,"../helpers/mixin":26,"./child":40}],47:[function(require,module,exports){
var Geometry, Helpers, Rectangle, Views,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Helpers = {
  Mixin: require('../helpers/mixin')
};

Geometry = {
  Rectangle: require('../geometry/rectangle')
};

Views = {
  Child: require('./child')
};


/*
The constructor for the Rectangle class. Uses the set-function to set the properties of the rectangle.

@name View.Rectangle
@class A class which is used for drawable non-rotated rectangles
@augments Math.Rectangle
@augments View.Child

@property {number} x The top left corner's x-coordinate
@property {number} y The top left corner's y-coordinate
@property {number} width The width of the rectangle
@property {number} height The height of the rectangle
@property {string} strokeStyle The rectangle's color if added to a view (css color string)
@property {number} lineWidth The rectangle's width if added to a view (in px)
@property {string} fillStyle The rectangle's fill color if added to a view (css color string)

@param {number} x The x-coordinate for the rectangle's top left corner
@param {number} y The y-coordinate for the rectangle's top left corner
@param {number} [width = 0] The width of the rectangle
@param {number} [height = 0] The height of the rectangle
@param {string} [fillStyle = "#000"] The rectangle's fill color if added to a view (css color string)
@param {string} [strokeStyle = "#000"] The rectangle's color if added to a view (css color string)
@param {number} [lineWidth = 1] The rectangle's width if added to a view (in px)
 */

module.exports = Rectangle = (function(_super) {
  __extends(Rectangle, _super);

  Helpers.Mixin.mixin(Rectangle, Views.Child);

  function Rectangle(x, y, width, height, fillStyle, strokeStyle, lineWidth) {
    var hidden;
    this.width = width != null ? width : 0;
    this.height = height != null ? height : 0;
    this.fillStyle = fillStyle != null ? fillStyle : "#000";
    this.strokeStyle = strokeStyle != null ? strokeStyle : "#000";
    if (lineWidth == null) {
      lineWidth = 0;
    }
    Views.Child.prototype.constructor.call(this);
    this.x = x;
    this.y = y;
    this.renderType = "rectangle";
    hidden = {
      lineWidth: lineWidth
    };
    Object.defineProperty(this, "lineWidth", {
      get: function() {
        return hidden.lineWidth;
      },
      set: function(value) {
        if (hidden.lineWidth !== value) {
          hidden.lineWidth = value;
          if (this.offsetGlobal) {
            this.offset = this.offsetGlobal;
          }
        }
      }
    });
    return;
  }


  /*
  Parses an offset global into an actual Math.Vector offset that fits the instance
  
  @param  {number} offset Offset global (OFFSET_TOP_LEFT, etc.)
  @return {Math.Vector} The offset vector the offset global corresponds to for the instance
   */

  Rectangle.prototype.parseOffsetGlobal = function(offset) {
    var ret;
    ret = new Math.Vector();
    if ([OFFSET_TOP_LEFT, OFFSET_MIDDLE_LEFT, OFFSET_BOTTOM_LEFT].indexOf(offset) !== -1) {
      ret.x = -this.lineWidth / 2;
    } else if ([OFFSET_TOP_CENTER, OFFSET_MIDDLE_CENTER, OFFSET_BOTTOM_CENTER].indexOf(offset) !== -1) {
      ret.x = this.width / 2;
    } else {
      if ([OFFSET_TOP_RIGHT, OFFSET_MIDDLE_RIGHT, OFFSET_BOTTOM_RIGHT].indexOf(offset) !== -1) {
        ret.x = this.width + this.lineWidth / 2;
      }
    }
    if ([OFFSET_TOP_LEFT, OFFSET_TOP_CENTER, OFFSET_TOP_RIGHT].indexOf(offset) !== -1) {
      ret.y = -this.lineWidth / 2;
    } else if ([OFFSET_MIDDLE_LEFT, OFFSET_MIDDLE_CENTER, OFFSET_MIDDLE_RIGHT].indexOf(offset) !== -1) {
      ret.y = this.height / 2;
    } else {
      if ([OFFSET_BOTTOM_LEFT, OFFSET_BOTTOM_CENTER, OFFSET_BOTTOM_RIGHT].indexOf(offset) !== -1) {
        ret.y = this.height + this.lineWidth / 2;
      }
    }
    return ret;
  };

  return Rectangle;

})(Geometry.Rectangle);



},{"../geometry/rectangle":22,"../helpers/mixin":26,"./child":40}],48:[function(require,module,exports){
var Globals, Helpers, Mixins, Sprite, Views,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Helpers = {
  Mixin: require('../helpers/mixin')
};

Mixins = {
  Animatable: require('../mixins/animatable'),
  Texture: require('../mixins/texture')
};

Views = {
  Child: require('./child')
};


/*
The constructor for Sprite objects.

@name View.Sprite
@class Class for drawing bitmaps with rotation and size.
Usually all graphical objects in a game are sprites or extends this class.
@augments View.Container
@augments Mixin.Animatable

@property {string} source A resource string representing the bitmap source of the sprite, use setSource() to set the source (do not set it directly)
@property {number} direction The direction of the sprite (in radians)
@property {int} imageNumber The current image in the animation (0 the source is not an animation)
@property {int} imageLength The number of images in the source (1 the source is not an animation)
@property {Vector} offset The offset with which the sprite will be drawn (to its position)
@property {number} animationSpeed The number of images / second in the animation (only relevant if the source is an animation)
@property {boolean} animationLoops Whether or not the animation should loop (only relevant if the source is an animation)
@property {number} size A size modifier which modifies both the width and the height of the sprite
@property {number} widthScale A size modifier which modifies the width of the sprite
@property {number} heightScale A size modifier which modifies the height of the object
@property {number} opacity The opacity of the sprite

@param {string} source A string representing the source of the object's bitmap
@param {number} [x=0] The x-position of the object in the game arena, in pixels
@param {number} [y=0] The y-position of the object in the game arena, in pixels
@param {number} [direction=0] The rotation (in radians) of the object when drawn in the game arena
@param {Object} [additionalProperties] An object containing additional properties to assign to the created object.
The default is:<code>
{
size: 1,
opacity: 1,
composite: 'source-over',
offset: new Math.Vector('center', 'center')
}</code>
 */

module.exports = Sprite = (function(_super) {
  __extends(Sprite, _super);

  Helpers.Mixin.mixin(Sprite, Mixins.Animatable);

  Helpers.Mixin.mixin(Sprite, Mixins.Texture);

  Sprite.prototype.renderType = "sprite";

  function Sprite(source, x, y, direction, additionalProperties) {
    var offset;
    if (source === void 0) {
      throw new Error("Missing argument: source");
    }
    Sprite.__super__.constructor.call(this);
    this.x = x || 0;
    this.y = y || 0;
    this.source = source;
    this.direction = (direction !== void 0 ? direction : 0);
    this.imageNumber = 0;
    this.imageLength = 1;
    this.animationSpeed = 30;
    this.animationLastSwitch = engine.gameTime;
    this.animationLoops = true;
    this.clipWidth;
    this.clipHeight;
    Object.defineProperty(this, "width", {
      get: function() {
        return Math.abs(this.clipWidth * this.size * this.widthScale);
      },
      set: function(value) {
        var sign;
        sign = (this.widthScale > 0 ? 1 : -1);
        this.widthScale = sign * Math.abs(value / (this.clipWidth * this.size));
        return value;
      }
    });
    Object.defineProperty(this, "height", {
      get: function() {
        return Math.abs(this.clipHeight * this.size * this.heightScale);
      },
      set: function(value) {
        var sign;
        sign = (this.heightScale > 0 ? 1 : -1);
        this.heightScale = sign * Math.abs(value / (this.clipHeight * this.size));
        return value;
      }
    });
    if (additionalProperties && additionalProperties.offset) {
      if (typeof additionalProperties.offset === 'number') {
        offset = additionalProperties.offset;
        additionalProperties.offset = void 0;
      }
    } else {
      offset = Globals.OFFSET_MIDDLE_CENTER;
    }
    Helpers.Mixin["import"](this, additionalProperties);
    if (!this.refreshSource()) {
      throw new Error("Sprite source was not successfully loaded: " + source);
    }
    if (offset) {
      this.offsetFromGlobal(offset);
    }
  }


  /*
  Fetches the name of the theme which currently applies to the object.
  
  @return {string} The name of the object's current theme
   */

  Sprite.prototype.getTheme = function() {
    var parent, theme;
    theme = this.theme;
    parent = this;
    while (theme === void 0) {
      if (parent.theme) {
        theme = parent.theme;
      } else {
        if (parent.parent) {
          parent = parent.parent;
        } else {
          break;
        }
      }
    }
    if (theme) {
      return theme;
    } else {
      return engine.defaultTheme;
    }
  };


  /*
  Updates the source bitmap of the object to correspond to it's current theme (set with setTheme or inherited).
  Calling this function is usually not necessary since it is automatically called when setting the theme of the object itself or it's parent object.
  
  @private
   */

  Sprite.prototype.refreshSource = function() {
    var theme;
    theme = this.getTheme();
    this.texture = engine.loader.getImage(this.source, theme);
    this.imageLength = this.texture.imageLength;
    this.imageNumber = Math.min(this.imageLength - 1, this.imageNumber);
    this.clipWidth = Math.floor(this.texture.width / this.imageLength);
    this.clipHeight = this.texture.height;
    if (this.offsetGlobal) {
      this.offsetFromGlobal(this.offsetGlobal);
    }
    return this.texture;
  };


  /*
  Sets the bitmap-source of the object. For more information about bitmaps and themes, see themes.
  
  @param {string} source The resource string of the bitmap-source to use for the object
   */

  Sprite.prototype.setSource = function(source) {
    if (source === void 0) {
      throw new Error("Missing argument: source");
    }
    if (this.source === source) {
      return;
    }
    this.source = source;
    this.refreshSource();
  };

  Sprite.prototype.updateSubImage = function() {
    if (this.animationSpeed !== 0 && engine.gameTime - this.animationLastSwitch > 1000 / this.animationSpeed) {
      this.imageNumber = this.imageNumber + (this.animationSpeed > 0 ? 1 : -1);
      this.animationLastSwitch = engine.gameTime;
      if (this.imageNumber === this.imageLength) {
        this.imageNumber = (this.animationLoops ? 0 : this.imageLength - 1);
      } else {
        if (this.imageNumber === -1) {
          this.imageNumber = (this.animationLoops ? this.imageLength - 1 : 0);
        }
      }
    }
  };

  return Sprite;

})(Views.Child);

Globals = require('../engine/globals');



},{"../engine/globals":15,"../helpers/mixin":26,"../mixins/animatable":31,"../mixins/texture":32,"./child":40}],49:[function(require,module,exports){
var Geometry, Globals, Helpers, Mixins, TextBlock, Views,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Helpers = {
  Mixin: require('../helpers/mixin')
};

Mixins = {
  Animatable: require('../mixins/animatable'),
  Texture: require('../mixins/texture')
};

Views = {
  Child: require('./child')
};


/*
The constructor for the TextBlock class.

@name View.TextBlock
@class A block of text with a limited width. If the width is reached by the text, the text will break into multiple lines.
@augments Mixin.Animatable
@augments View.Container

@property {string} font A css string representing the font of the text block
@property {number} width The width of the text block
@property {number} height The height of the text block
@property {string} alignment The text alignment of the text block, possible values are: ALIGNMENT_LEFT, ALIGNMENT_CENTER, ALIGNMENT_RIGHT
@property {string} color A css string representing the text's color
@property {Vector} offset The offset with which the sprite will be drawn (to its position)
@property {number} direction The direction of the sprite (in radians)
@property {number} size A size modifier which modifies both the width and the height of the sprite
@property {number} widthScale A size modifier which modifies the width of the sprite
@property {number} heightScale A size modifier which modifies the height of the object
@property {number} opacity The opacity of the sprite

@param {string} string The string to display inside the TextBlock
@param {number} [x=0] The x-position of the object in the game arena, in pixels
@param {number} [y=0] The y-position of the object in the game arena, in pixels
@param {number} [width=200] The width of the text block, in pixels. When the text reaches the width, it will break into a new line
@param {Object} [additionalProperties] An object containing additional properties to assign to the created object.
The default is:<code>
{
font: 'normal 14px Verdana',
color: '#000',
alignment: ALIGNMENT_LEFT,
size: 1,
opacity: 1,
composite: 'source-over',
offset: new Vector(0, 0)
}</code>
 */

module.exports = TextBlock = (function(_super) {
  __extends(TextBlock, _super);

  Helpers.Mixin.mixin(TextBlock, Mixins.Animatable);

  Helpers.Mixin.mixin(TextBlock, Mixins.Texture);

  TextBlock.prototype.renderType = "textblock";

  function TextBlock(string, x, y, width, additionalProperties) {
    var offset;
    if (string === void 0) {
      throw new Error("Missing argument: string");
    }
    TextBlock.__super__.constructor.call(this);
    this.x = x || 0;
    this.y = y || 0;
    this.imageLength = 1;
    this.imageNumber = 0;
    this.clipWidth = width || 200;
    this.lines = [];
    this.lineWidth = [];
    this.texture = document.createElement("canvas");
    this.textureCtx = this.texture.getContext("2d");
    this.texture.width = this.clipWidth;
    this.texture.height = 10;
    this.texture.spacing = 0;
    this.string = string || '';
    this.font = "normal 14px Verdana";
    this.alignment = "left";
    this.color = "#000000";
    this.lineHeight = 0;
    Object.defineProperty(this, "width", {
      get: function() {
        return Math.abs(this.clipWidth * this.size * this.widthScale);
      },
      set: function(value) {
        var sign;
        sign = (this.widthScale > 0 ? 1 : -1);
        this.widthScale = sign * Math.abs(value / (this.clipWidth * this.size));
        return value;
      }
    });
    Object.defineProperty(this, "height", {
      get: function() {
        return Math.abs(this.clipHeight * this.size * this.heightScale);
      },
      set: function(value) {
        var sign;
        sign = (this.heightScale > 0 ? 1 : -1);
        this.heightScale = sign * Math.abs(value / (this.clipHeight * this.size));
        return value;
      }
    });
    this.lineHeight = (additionalProperties && additionalProperties.lineHeight ? additionalProperties.lineHeight : this.font.match(/[0.0-9]+/) * 1.25);
    if (additionalProperties && additionalProperties.offset) {
      if (typeof additionalProperties.offset === 'number') {
        offset = additionalProperties.offset;
        additionalProperties.offset = void 0;
      }
    } else {
      offset = Globals.OFFSET_TOP_LEFT;
    }
    Helpers.Mixin["import"](this, additionalProperties);
    if (offset) {
      this.offsetFromGlobal(offset);
    }
    this.updateCache();
    return;
  }


  /*
  Breaks the TextBlock's text string into lines.
  
  @private
   */

  TextBlock.prototype.stringToLines = function() {
    var line, lt, paragraphs, pid, wid, word, words;
    lt = document.createElement("span");
    lt.style.font = this.font;
    lt.style.visibility = "hidden";
    lt.style.position = "absolute";
    document.body.appendChild(lt);
    line = 0;
    this.lines = [];
    this.lines[line] = "";
    paragraphs = this.string.split("\n");
    pid = 0;
    while (pid < paragraphs.length) {
      words = paragraphs[pid].split(" ");
      lt.innerHTML = "";
      this.lines[line] = "";
      wid = 0;
      while (wid < words.length) {
        word = words[wid];
        lt.innerHTML += word + " ";
        if (lt.offsetWidth > this.clipWidth) {
          line++;
          this.lines[line] = "";
          lt.innerHTML = "";
          lt.innerHTML += word + " ";
          this.lineWidth[line] = lt.offsetWidth;
        } else {
          this.lineWidth[line] = lt.offsetWidth;
        }
        this.lines[line] += word + " ";
        wid++;
      }
      line++;
      pid++;
    }
    this.calculateCanvasHeight();
    lt.parentNode.removeChild(lt);
  };


  /*
  Calculates and sets the height of the cache canvas based on the number of lines, the font height and the line height
   */

  TextBlock.prototype.calculateCanvasHeight = function() {
    this.texture.height = (this.lines.length - 1) * this.lineHeight + this.font.match(/[0.0-9]+/) * 1.25;
    this.clipHeight = this.texture.height;
  };


  /*
  Does the actual rendering of the text, and caches it (for huge performance gains). This function is automatically called each time a property which affects the rendering has been changed (via the right setter functions).
  
  @private
   */

  TextBlock.prototype.updateCache = function() {
    var cacheKey, i, xOffset;
    cacheKey = this.createCacheKey();
    if (cacheKey === this.texture.cacheKey) {
      return;
    }
    this.texture.lastCacheKey = this.texture.cacheKey;
    this.texture.cacheKey = cacheKey;
    this.stringToLines();
    this.textureCtx.clearRect(0, 0, this.texture.width, this.texture.height);
    this.textureCtx.font = this.font;
    this.textureCtx.fillStyle = this.color;
    i = 0;
    while (i < this.lines.length) {
      xOffset = 0;
      switch (this.alignment) {
        case "left":
          xOffset = 0;
          break;
        case "right":
          xOffset = this.clipWidth - this.lineWidth[i];
          break;
        case "center":
          xOffset = (this.clipWidth - this.lineWidth[i]) / 2;
      }
      if (this.lines[i]) {
        this.textureCtx.fillText(this.lines[i], xOffset, this.lineHeight * i + this.font.match(/[0.0-9]+/) * 1);
      }
      i++;
    }
  };

  TextBlock.prototype.set = function(settings) {
    var name, value;
    for (name in settings) {
      value = settings[name];
      this[name] = value;
    }
    this.updateCache();
  };

  TextBlock.prototype.createCacheKey = function() {
    return ["string", "font", "alignment", "color", "lineHeight", "clipWidth"].map((function(_this) {
      return function(property) {
        return _this[property];
      };
    })(this)).join("-|-");
  };


  /*
  Checks if the objects is visible. This function runs before each draw to ensure that it is necessary
  @return {boolean} Whether or not the object is visible (based on its size and opacity vars)
   */

  TextBlock.prototype.isVisible = function() {
    return !(this.size === 0 || this.widthScale === 0 || this.heightScale === 0 || /^\s*$/.test(this.string));
  };

  return TextBlock;

})(Views.Child);

Geometry = {
  Vector: require('../geometry/vector')
};

Globals = require('../engine/globals');



},{"../engine/globals":15,"../geometry/vector":23,"../helpers/mixin":26,"../mixins/animatable":31,"../mixins/texture":32,"./child":40}]},{},[12]);
