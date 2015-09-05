(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CreatePolygonFromWidth;

CreatePolygonFromWidth = (function() {
  function CreatePolygonFromWidth() {
    engine.loader.hideOverlay((function(_this) {
      return function() {
        return _this.onLoaded();
      };
    })(this));
  }

  CreatePolygonFromWidth.prototype.onLoaded = function() {
    var i, line, polygons, t, tests, _i;
    polygons = [];
    line = new JSEngine.Geometry.Line().setFromCoordinates(10, 10, 590, 310);
    polygons.push(new JSEngine.Views.Polygon(line.createPolygonFromWidth(10).getPoints(), "#88F"));
    line = new JSEngine.Geometry.Line().setFromCoordinates(10, 30, 590, 330);
    polygons.push(new JSEngine.Views.Polygon(line.createPolygonFromWidth(10, 'square').getPoints(), "#88F"));
    line = new JSEngine.Geometry.Line().setFromCoordinates(10, 370, 590, 10);
    polygons.push(new JSEngine.Views.Polygon(line.createPolygonFromWidth(10).getPoints(), "#8F8"));
    line = new JSEngine.Geometry.Line().setFromCoordinates(10, 390, 590, 30);
    polygons.push(new JSEngine.Views.Polygon(line.createPolygonFromWidth(10, 'square').getPoints(), "#8F8"));
    line = new JSEngine.Geometry.Line().setFromCoordinates(10, 200, 590, 200);
    polygons.push(new JSEngine.Views.Polygon(line.createPolygonFromWidth(10).getPoints(), "#F88"));
    line = new JSEngine.Geometry.Line().setFromCoordinates(10, 220, 590, 220);
    polygons.push(new JSEngine.Views.Polygon(line.createPolygonFromWidth(10, 'round').getPoints(), "#F88"));
    line = new JSEngine.Geometry.Line().setFromCoordinates(300, 10, 300, 390);
    polygons.push(new JSEngine.Views.Polygon(line.createPolygonFromWidth(10).getPoints(), "#FFF"));
    line = new JSEngine.Geometry.Line().setFromCoordinates(320, 10, 320, 390);
    polygons.push(new JSEngine.Views.Polygon(line.createPolygonFromWidth(10, 'square').getPoints(), "#FFF"));
    polygons.push(new JSEngine.Views.Line(new JSEngine.Geometry.Vector(10, 50), new JSEngine.Geometry.Vector(590, 350), "#88F", 10, 'butt'));
    polygons.push(new JSEngine.Views.Line(new JSEngine.Geometry.Vector(10, 70), new JSEngine.Geometry.Vector(590, 370), "#88F", 10, 'round'));
    polygons.push(new JSEngine.Views.Line(new JSEngine.Geometry.Vector(10, 90), new JSEngine.Geometry.Vector(590, 390), "#88F", 10, 'square'));
    polygons.push(new JSEngine.Views.Line(new JSEngine.Geometry.Vector(10, 110), new JSEngine.Geometry.Vector(590, 110), "#88F", 10, 'round'));
    engine.currentRoom.addChildren.apply(engine.currentRoom, polygons);
    tests = 10000;
    t = new Date();
    for (i = _i = 0; 0 <= tests ? _i < tests : _i > tests; i = 0 <= tests ? ++_i : --_i) {
      line.createPolygonFromWidth(10);
    }
    return console.log("createPolygonFromWidth (tests/sec): " + ~~(tests / (new Date() - t)) * 1000);
  };

  return CreatePolygonFromWidth;

})();

new JSEngine({
  gameClass: CreatePolygonFromWidth,
  themes: ['Example'],
  backgroundColor: "#000",
  canvasResX: 600,
  canvasResY: 400
});



},{}]},{},[1]);
