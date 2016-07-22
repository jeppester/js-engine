(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Main;

Main = (function() {
  function Main() {
    engine.loader.hideOverlay((function(_this) {
      return function() {
        return _this.onLoaded();
      };
    })(this));
    this.lastFive = [];
    this.posX = 0;
    this.posY = 0;
    this.rotation = 0;
    setTimeout(((function(_this) {
      return function() {
        return _this.startTest();
      };
    })(this)), 2000);
  }

  Main.prototype.getSearch = function() {
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

  Main.prototype.onLoaded = function() {
    return this.addObjects(this.getSearch()['objects'] || 8000);
  };

  Main.prototype.startTest = function() {
    this.startFrames = engine.frames;
    return setTimeout(((function(_this) {
      return function() {
        return _this.endTest();
      };
    })(this)), 10000);
  };

  Main.prototype.endTest = function() {
    var average, fps, frames, objects;
    objects = Object.keys(engine.objectIndex).length - 2;
    frames = engine.frames - this.startFrames;
    fps = (engine.frames - this.startFrames) / 10;
    this.lastFive.push(frames);
    if (this.lastFive.length > 5) {
      this.lastFive.shift();
    }
    average = this.lastFive.reduce(function(a, b) {
      return a + b;
    });
    average /= this.lastFive.length * 10;
    console.log("Objects: " + objects + " - Frames: " + frames + " - FPS: " + fps + " - Average: " + average);
    return this.startTest();
  };

  Main.prototype.addObjects = function(count) {
    var col, cols, direction, directionInt, i, row, rows, sprite, x, xInt, y, yInt, _i, _results;
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
      sprite = new Engine.Views.Sprite('animation', x, y, direction);
      engine.currentRoom.addChildren(sprite);
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

  return Main;

})();

new Engine({
  gameClass: Main,
  themesPath: '../assets',
  themes: ['example'],
  backgroundColor: "#000",
  disableWebGL: /canvas/.test(window.location.search),
  pauseOnBlur: false,
  canvasResX: 600,
  canvasResY: 400
});



},{}]},{},[1]);
