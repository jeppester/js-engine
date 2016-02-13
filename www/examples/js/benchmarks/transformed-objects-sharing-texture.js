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
    setTimeout(((function(_this) {
      return function() {
        return _this.startTest();
      };
    })(this)), 2000);
  }

  Main.prototype.getSearch = function() {
    var j, len, name, part, parts, ref, s, search, value;
    s = window.location.search.replace(/^\?/, '');
    parts = s.split('&');
    search = {};
    for (j = 0, len = parts.length; j < len; j++) {
      part = parts[j];
      ref = part.split('='), name = ref[0], value = ref[1];
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
    var i, j, ref, results, sprite;
    if (count == null) {
      count = 10;
    }
    results = [];
    for (i = j = 0, ref = count; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      sprite = new Engine.Views.GameObject('rock', Math.random() * 600, Math.random() * 400, Math.random() * Math.PI * 2, {
        speed: new Engine.Geometry.Vector(-5 + Math.random() * 10, -5 + Math.random() * 10)
      });
      sprite.checkBounce = function() {
        if (this.x < 0) {
          this.x = 0;
          this.speed.x = -this.speed.x;
        } else if (this.x > 600) {
          this.x = 600;
          this.speed.x = -this.speed.x;
        }
        if (this.y < 0) {
          this.y = 0;
          return this.speed.y = -this.speed.y;
        } else if (this.y > 400) {
          this.y = 400;
          return this.speed.y = -this.speed.y;
        }
      };
      engine.currentRoom.loops.eachFrame.attachFunction(sprite, sprite.checkBounce);
      results.push(engine.currentRoom.addChildren(sprite));
    }
    return results;
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
