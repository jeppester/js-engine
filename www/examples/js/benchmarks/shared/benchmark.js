(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Benchmark;

module.exports = Benchmark = (function() {
  Benchmark.prototype.defaultObjectsCount = 8000;

  function Benchmark() {
    engine.loader.hideOverlay((function(_this) {
      return function() {
        return _this.onLoaded();
      };
    })(this));
    this.lastFive = [];
    this.posX = 0;
    this.posY = 0;
    setTimeout(((function(_this) {
      return function() {
        return _this.startTest();
      };
    })(this)), 2000);
  }

  Benchmark.prototype.getSearch = function() {
    var name, part, parts, s, search, value, _i, _len, _ref;
    s = window.location.search.replace(/^\?/, '');
    parts = s.split('&');
    search = {};
    for (_i = 0, _len = parts.length; _i < _len; _i++) {
      part = parts[_i];
      _ref = part.split('='), name = _ref[0], value = _ref[1];
      search[name] = value;
    }
    return search;
  };

  Benchmark.prototype.onLoaded = function() {
    return this.addObjects(this.getSearch()['objects'] || this.defaultObjectsCount);
  };

  Benchmark.prototype.startTest = function() {
    this.startFrames = engine.frames;
    return setTimeout(((function(_this) {
      return function() {
        return _this.endTest();
      };
    })(this)), 1000);
  };

  Benchmark.prototype.endTest = function() {
    var average, fps, frames, objectsCount;
    objectsCount = this.getObjectsCount();
    frames = engine.frames - this.startFrames;
    fps = engine.frames - this.startFrames;
    this.lastFive.push(frames);
    if (this.lastFive.length > 5) {
      this.lastFive.shift();
    }
    average = this.lastFive.reduce(function(a, b) {
      return a + b;
    });
    average /= this.lastFive.length;
    console.log("Objects: " + objectsCount + " - FPS: " + fps + " - Average: " + average);
    return this.startTest();
  };

  Benchmark.prototype.getObjectsCount = function() {
    return engine.currentRoom.children.length;
  };

  Benchmark.prototype.addObjects = function(count) {
    var col, cols, direction, directionInt, i, row, rows, x, xInt, y, yInt, _i, _results;
    if (count == null) {
      count = 10;
    }
    cols = rows = Math.max(Math.sqrt(count));
    col = 0;
    row = 0;
    direction = 0;
    xInt = engine.canvasResX / cols;
    yInt = engine.canvasResY / rows;
    directionInt = Math.PI / 100;
    _results = [];
    for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
      x = col * xInt;
      y = row * yInt;
      engine.currentRoom.addChildren(this.getObject(x, y, direction));
      direction += directionInt;
      ++row;
      if (row > rows) {
        row = 0;
        _results.push(++col);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Benchmark.prototype.getObject = function(x, y) {
    throw new Error('getObject must be overwritten');
  };

  return Benchmark;

})();



},{}]},{},[1]);