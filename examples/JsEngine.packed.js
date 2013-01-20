
jseCreateClass=function(className,inherits){var constructorName,i,inheritClass,newClass,functionName;if(!/^\w*$/.test(className)){throw new Error("Invalid class name: "+className);}
constructorName=className.charAt(0).toLowerCase()+className.slice(1);eval('window.'+className+' = function () {this.'+constructorName+'.apply(this, arguments); }');window[className].prototype[constructorName]=function(){};newClass=window[className];if(inherits){if(!Array.prototype.isPrototypeOf(inherits)){throw new Error("Arguments inherits is not an array");}
for(i=0;i<inherits.length;i++){inheritClass=inherits[i];jseExtend(newClass,inheritClass);}}
return newClass;};jseExtend=function(newClass,inheritClass){for(functionName in inheritClass.prototype){if(typeof inheritClass.prototype[functionName]==="function"){newClass.prototype[functionName]=inheritClass.prototype[functionName];}}}
jsePurge=function(obj){var name,loop,i;if(obj===undefined){throw new Error(obj);}
if(typeof obj==="string"){obj=engine.objectIndex[obj];}
for(name in engine.loops){if(engine.loops.hasOwnProperty(name)){loop=engine.loops[name];i=loop.activities.length;while(i--){if(obj===loop.activities[i].object){loop.activities.splice(i,1);}}
i=loop.animations.length;while(i--){if(obj===loop.animations[i].obj){loop.animations.splice(i,1);}}}}
if(obj.parent){obj.parent.removeChild(obj);}
delete engine.objectIndex[obj.id];};jseSyncLoad=function(filePaths){var i,req;if(typeof filePaths==="string"){filePaths=[filePaths];}
for(i=0;i<filePaths.length;i++){req=new XMLHttpRequest();req.open('GET',filePaths[i],false);req.send();try{eval.call(window,req.responseText);}
catch(e){throw new Error('Failed loading "'+filePaths[i]+'": '+e.type+' "'+e.arguments[0]+'"');}}
if(window.loadedFiles===undefined){window.loadedFiles=[];}
window.loadedFiles=window.loadedFiles.concat(filePaths);};jsonEncode=function(obj,ignore){function jsonIterate(obj,ignore){var ret,i;ignore=ignore===undefined?[]:ignore;switch(typeof obj){case'string':case'number':case'boolean':ret+='"'+obj+'",';break;case'object':if(obj instanceof Array){ret+='[';for(i=0;i<obj.length;i++){ret+=jsonIterate(obj[i],ignore);}
ret+='],';}else{ret+='{';for(i in obj){if(obj.hasOwnProperty(i)){if(ignore.indexOf(i)!==-1){continue;}
ret+='"'+i+'":';ret+=jsonIterate(obj[i],ignore);}}
ret+='},';}
break;}
return ret;}
var json=jsonIterate(obj,ignore);return json.replace(/,\}/gi,'}').replace(/,\]/gi,']').replace(/,$/,'');};Array.prototype.getElementByPropertyValue=function(property,value){var i;for(i=0;i<this.length;i++){if(this[i][property]===value){return this[i];}}
return undefined;};Array.prototype.sortByNumericProperty=function(property,desc){var sortedArray=[],copy=[],currentID,currentVal,i;Array.prototype.push.apply(copy,this);while(copy.length){currentVal=false;for(i=0;i<copy.length;i++){if(!desc){if(copy[i][property]<currentVal||currentVal===false){currentID=i;currentVal=copy[i][property];}}
else{if(copy[i][property]>currentVal||currentVal===false){currentID=i;currentVal=copy[i][property];}}}
sortedArray.push(copy.splice(currentID,1)[0]);}
return sortedArray;};Array.prototype.forEach=function(func){for(var i=0;i<this.length;i++){func.call(this[i],i);}}
Object.prototype.importProperties=function(from){var i;for(i in from){if(from.hasOwnProperty(i)){if(i===undefined){continue;}
this[i]=from[i];}}};KEY_LEFT=37;KEY_UP=38;KEY_RIGHT=39;KEY_DOWN=40;KEY_SPACE=32;KEY_BACKSPACE=8;KEY_TAB=9;KEY_ENTER=13;KEY_SHIFT=16;KEY_CONTROL=17;KEY_ALT_LEFT=18;KEY_CAPSLOCK=20;KEY_ESCAPE=27;KEY_ALT_RIGHT=0;KEY_F1=112;KEY_F2=113;KEY_F3=114;KEY_F4=115;KEY_F5=116;KEY_F6=117;KEY_F7=118;KEY_F8=119;KEY_F9=120;KEY_F10=121;KEY_F11=122;KEY_F12=123;SPEED_PIXELS_PER_SECOND=1;SPEED_PIXELS_PER_FRAME=2;JsEngine=function(_opt){var copyOpt,i,opt,req,resize,gc;engine=this;this.loopSpeed=navigator.userAgent.match(/Gecko\//)?20:10;this.running=false;this.manualRedrawDepths=[];this.canvasResX=800;this.canvasResY=600;this.enginePath='js/JsEngine';this.themesPath='themes'
this.drawBBoxes=false;this.drawMasks=false;this.pauseOnBlur=true;this.arena=document.getElementById('arena');this.autoResize=true;this.autoResizeLimitToResolution=true;this.compositedDepths=[];this.gameClassPath="js/Game.js";this.backgroundColor="#FFF";this.timeFactor=1;this.options=_opt?_opt:{};copyOpt=['backgroundColor','arena','pauseOnBlur','drawBBoxes','drawMasks','loopSpeed','loopsPerColCheck','manualRedrawDepths','compositedDepths','canvasResX','canvasResY','autoResize','autoResizeLimitToResolution','enginePath','themesPath','gameClassPath'];for(i=0;i<copyOpt.length;i++){opt=copyOpt[i];if(this.options[opt]!==undefined){this[opt]=this.options[opt];delete this.options[opt];}}
audioFormats=['mp3','ogg','wav'];supportedFormats=[];for(i=0;i<audioFormats.length;i++){if(document.createElement('audio').canPlayType('audio/'+audioFormats[i])){supportedFormats.push(audioFormats[i]);}}
this.host={hasTouch:'ontouchstart'in document,hasMouse:false,supportedAudio:supportedFormats};this.mainCanvas=document.createElement("canvas");this.mainCanvas.style.display="block";this.mainCanvas.width=this.canvasResX;this.mainCanvas.height=this.canvasResY;this.arena.appendChild(this.mainCanvas);if(this.autoResize){this.autoResizeCanvas();window.addEventListener('resize',function(){engine.autoResizeCanvas();},false);window.addEventListener('load',function(){engine.autoResizeCanvas();},false);}
if(typeof jseCreateClass==="undefined"){req=new XMLHttpRequest();req.open('GET',this.enginePath+'/jseFunctions.js',false);req.send();eval(req.responseText);}
if(typeof Array.prototype.getElementByPropertyValue==="undefined"){jseSyncLoad(this.enginePath+'/jseExtensions.js');}
if(typeof KEY_UP==="undefined"){jseSyncLoad(this.enginePath+'/jseGlobals.js');}
if(typeof Loader==="undefined"){jseSyncLoad(this.enginePath+'/classes/Loader.js');}
loader=new Loader();loader.loadClasses([this.enginePath+'/classes/Animation.js',this.enginePath+'/classes/Animator.js',this.enginePath+'/classes/View.js',this.enginePath+'/classes/CustomLoop.js',this.enginePath+'/classes/Director.js',this.enginePath+'/classes/Sprite.js',this.enginePath+'/classes/Collidable.js',this.enginePath+'/classes/TextBlock.js',this.enginePath+'/classes/GameObject.js',this.enginePath+'/classes/GravityObject.js',this.enginePath+'/classes/Keyboard.js',this.enginePath+'/classes/Mouse.js',]);gc=this.gameClassPath;loader.loadClasses([gc]);this.gameClassName=gc.match(/(\w*)\.\w+$/)[1];this.defaultTheme=this.options.themes[0];loader.onthemesloaded=function(){engine.initialize();};loader.loadThemes(this.options.themes);};JsEngine.prototype.initialize=function(){var i,d,objectName,c,audioFormats,supportedFormats;this.objectIndex={};this.frames=0;this.last=new Date().getTime();this.now=this.last;this.gameTime=0;this.executingLoops=false;this.currentId=0;this.drawing=0;this.fps=0;this.fpsCounter=0;this.fpsSecCounter=0;this.depth=[];this.loops={eachFrame:new CustomLoop()};this.defaultAnimationLoop='eachFrame';this.defaultActivityLoop='eachFrame';this.depthMap=[];lastIsManualRedrawed=-1;lastIsComposited=false;for(i=0;i<this.options.depths;i++){d=new View(i);d.manualRedraw=this.manualRedrawDepths.indexOf(i)!==-1;d.composited=this.compositedDepths.indexOf(i)!==-1;d.ownCanvas=this.makeCanvas();if(d.manualRedraw||d.composited){d.ctx=d.ownCanvas.getContext('2d');}
else{d.ctx=this.mainCanvas.getContext('2d');}
this.depth.push(d);}
this.arena.oncontextmenu=function(){return false;};keyboard=new Keyboard();mouse=new Mouse();animator=new Animator();if(window[this.gameClassName]!=="undefined"){objectName=this.gameClassName.substr(0,1).toLowerCase()+this.gameClassName.substr(1);eval(objectName+" = new "+this.gameClassName+'()');}
else{console.log('No game class found');loader.hideOverlay();}
this.startMainLoop();if(this.pauseOnBlur){window.addEventListener('blur',function(){engine.stopMainLoop();});window.addEventListener('focus',function(){engine.startMainLoop();});}
console.log('JsEngine started');};JsEngine.prototype.autoResizeCanvas=function(){var h,w,windowWH,gameWH;windowWH=window.innerWidth/window.innerHeight;gameWH=this.canvasResX/this.canvasResY;if(windowWH>gameWH){h=window.innerHeight;w=this.canvasResX/this.canvasResY*h;}else{w=window.innerWidth;h=this.canvasResY/this.canvasResX*w;}
if(this.autoResizeLimitToResolution){w=Math.min(w,this.canvasResX);h=Math.min(h,this.canvasResY);}
this.arena.style.top="50%";this.arena.style.left="50%";this.arena.style.marginTop=-h/2+"px";this.arena.style.marginLeft=-w/2+"px";this.mainCanvas.style.height=h+"px";this.mainCanvas.style.width=w+"px";};JsEngine.prototype.makeCanvas=function(){var c;c=document.createElement("canvas");c.width=this.canvasResX;c.height=this.canvasResY;return c;};JsEngine.prototype.convertSpeed=function(speed,from,to){if(speed===undefined){throw new Error('Missing argument: speed');}
from=from!==undefined?from:SPEED_PIXELS_PER_SECOND;to=to!==undefined?to:SPEED_PIXELS_PER_FRAME;switch(from){case SPEED_PIXELS_PER_SECOND:speed=speed*this.timeIncrease/1000
break;case SPEED_PIXELS_PER_FRAME:break;}
switch(to){case SPEED_PIXELS_PER_SECOND:speed=speed/this.timeIncrease*1000
break;case SPEED_PIXELS_PER_FRAME:break;}
return speed;}
JsEngine.prototype.clearStage=function(){var depthId;for(depthId=0;depthId<this.depth.length;depthId++){this.depth[depthId].remove();}};JsEngine.prototype.setLoopSpeed=function(loopSpeed){if(loopSpeed===undefined){throw new Error('Missing argument: loopSpeed');}
this.loopSpeed=loopSpeed;}
JsEngine.prototype.setDefaultTheme=function(themeName,enforce){if(themeName===undefined){throw new Error('Missing argument: themeName');}
if(loader.themes[themeName]===undefined){throw new Error('Trying to set unexisting theme: '+themeName);}
var i;enforce=enforce!==undefined?enforce:false
this.defaultTheme=themeName;i=this.depth.length;while(i--){if(enforce){this.depth[i].setTheme(undefined,enforce);}
else{this.depth[i].applyToThisAndChildren(function(){if(this.refreshSource){this.refreshSource();}});}}
this.redraw(1);};JsEngine.prototype.newLoop=function(name,framesPerExecution,maskFunction){if(name===undefined){throw new Error('Missing argument: object');}
this.loops[name]=new CustomLoop(framesPerExecution,maskFunction);};JsEngine.prototype.attachFunctionToLoop=function(caller,func,loop){if(caller===undefined){throw new Error('Missing argument: caller');}
if(func===undefined){throw new Error('Missing argument: func');}
if(loop===undefined){throw new Error('Missing argument: loop');}
this.loops[loop].activitiesQueue.push({object:caller,activity:func});};JsEngine.prototype.detachFunctionFromLoop=function(caller,func,loop){if(caller===undefined){throw new Error('Missing argument: caller');}
if(func===undefined){throw new Error('Missing argument: func');}
if(loop===undefined){throw new Error('Missing argument: loop');}
var removeArray,i,a;removeArray=[];for(i=0;i<this.loops[loop].activities.length;i++){a=this.loops[loop].activities[i];if(a.object===caller&&a.activity===func){removeArray.push(this.loops[loop].activities.splice(i,1));}}
if(removeArray.length){return removeArray;}
else{return false;}};JsEngine.prototype.startMainLoop=function(){if(this.running){return;}
this.last=new Date().getTime();this.now=this.last;this.running=true;this.loop=setTimeout(function(){engine.mainLoop()},this.loopSpeed);};JsEngine.prototype.stopMainLoop=function(){if(!this.running){return;}
this.running=false;};JsEngine.prototype.mainLoop=function(){var name;if(!this.running){return;}
this.now=new Date().getTime();this.timeIncrease=(this.now-this.last)*this.timeFactor;this.executingLoops=true;this.frames++;animator.updateAllLoops();for(name in this.loops){if(this.loops.hasOwnProperty(name)){this.loops[name].execute();}}
this.gameTime+=this.timeIncrease;this.executingLoops=false;this.lastLoopTime=this.now-this.last;this.last=this.now;this.redraw(0);if(this.fpsMsCounter<1000){this.fpsCounter++;this.fpsMsCounter+=this.lastLoopTime;}
else{this.fps=this.fpsCounter;this.fpsCounter=0;this.fpsMsCounter=0;}
this.loop=setTimeout(function(){engine.mainLoop()},this.loopSpeed);};JsEngine.prototype.setCanvasResX=function(res){this.mainCanvas.width=res;this.canvasResX=res;if(this.autoResize){this.autoResizeCanvas();}}
JsEngine.prototype.setCanvasResY=function(res){this.mainCanvas.height=res;this.canvasResY=res;if(this.autoResize){this.autoResizeCanvas();}}
JsEngine.prototype.registerObject=function(obj,id){if(obj===undefined){throw new Error('Missing argument: obj');}
if(id===undefined){this.currentId++;id="obj"+(this.currentId-1);}else if(this.objectIndex[id]!==undefined){throw new Error('Object id already taken: '+id);}
this.objectIndex[id]=obj;obj.id=id;return id;};JsEngine.prototype.redraw=function(drawManualRedrawDepths){if(drawManualRedrawDepths===undefined){throw new Error('Missing argument: manualRedrawDepths');}
var i,d,ctx;this.mainCanvas.getContext('2d').fillStyle=this.backgroundColor;this.mainCanvas.getContext('2d').fillRect(0,0,this.canvasResX,this.canvasResY);for(i=0;i<this.depth.length;i++){d=this.depth[i];if(d.manualRedraw||d.composited){if(d.manualRedraw){if(drawManualRedrawDepths){d.ctx.clearRect(0,0,this.canvasResX,this.canvasResY);d.drawChildren();}}
else{d.ctx.clearRect(0,0,this.canvasResX,this.canvasResY);d.drawChildren();}
this.mainCanvas.getContext('2d').drawImage(d.ownCanvas,0,0,this.canvasResX,this.canvasResY);}
else{d.drawChildren();}}};jseCreateClass('Loader');Loader.prototype.loader=function(){this.sounds={};this.images={};this.scripts={};this.loaded={classes:[]};this.themes={};this.callback=false;this.loadOverlay=document.createElement('div');this.loadOverlay.setAttribute('style','border: 0;position: absolute;top: 0;left: 0;width: 100%;height: 100%;z-index: 100;opacity: 1;');this.loadOverlay.id="loadOverlay";this.loadOverlay.innerHTML='<div id="loadOverlayText">JsEngine loading...</div>';engine.arena.appendChild(this.loadOverlay);};Loader.prototype.hideOverlay=function(callback){this.fadeCallback=callback;this.fadeOpacity=1;this.fade=function(){var obj=loader.loadOverlay;loader.fadeOpacity=Math.max(0,loader.fadeOpacity-0.1);obj.style.opacity=loader.fadeOpacity;if(loader.fadeOpacity!==0){setTimeout(function(){loader.fade();},30);}
else{engine.arena.removeChild(loader.loadOverlay);delete loader.fade;if(loader.fadeCallback){loader.fadeCallback();}
delete loader.fadeCallback;}};this.fade();};Loader.prototype.getImage=function(ressource,themeName){if(ressource===undefined){throw new Error('Missing argument: ressource');}
themeName=themeName!==undefined?themeName:engine.defaultTheme;return this.getRessource(ressource,'images',themeName);};Loader.prototype.getSound=function(ressource,clone,themeName){if(ressource===undefined){throw new Error('Missing argument: ressource');}
clone=clone!==undefined?clone:true;themeName=themeName!==undefined?themeName:engine.defaultTheme;var sfx;clone=clone===undefined?true:clone;sfx=this.getRessource(ressource,'sfx',themeName);return sfx?(clone?sfx.cloneNode():sfx):false;};Loader.prototype.getMusic=function(ressource,themeName){themeName=themeName!==undefined?themeName:engine.defaultTheme;return this.getRessource(ressource,'music',themeName);};Loader.prototype.getMask=function(ressource,themeName){if(ressource===undefined){throw new Error('Missing argument: ressource');}
themeName=themeName!==undefined?themeName:engine.defaultTheme;return this.getRessource(ressource,'masks',themeName);}
Loader.prototype.getBBox=function(ressource,themeName){if(ressource===undefined){throw new Error('Missing argument: ressource');}
themeName=themeName!==undefined?themeName:engine.defaultTheme;return this.getRessource(ressource,'bBoxes',themeName);};Loader.prototype.getRessource=function(ressource,typeString,themeName){if(ressource===undefined){throw new Error('Missing argument: ressource');}
if(typeString===undefined){throw new Error('Missing argument: typeString');}
if(themeName===undefined){throw new Error('Missing argument: themeName');}
var res,inh,i;if(ressource.indexOf('/')!==-1){ressource=ressource.replace('/','.');}
res=this.themes[themeName][typeString][ressource];if(res===undefined){for(i=0;i<this.themes[themeName].inherit.length;i++){inh=this.themes[themeName].inherit[i];if(this.themes[inh]){res=this.themes[inh][typeString][ressource];if(res){break;}}}}
return res===undefined||res.toString()==="[object Object]"?false:res;};Loader.prototype.getImageSources=function(){var object,sourceStrings,currentDir,loopThrough,inheritTheme,i;object=this.themes[engine.defaultTheme].images;sourceStrings=[];currentDir=[];loopThrough=function(object){var pushStr,name;if(object.src!==undefined){pushStr=currentDir.join('.');if(sourceStrings.indexOf(pushStr)===-1){sourceStrings.push(pushStr);}}
else{for(name in object){if(object.hasOwnProperty(name)){currentDir.push(name);loopThrough(object[name]);currentDir.pop();}}}};loopThrough(object);for(i=0;i<this.themes[engine.defaultTheme].inherit.length;i++){inheritTheme=this.themes[this.themes[engine.defaultTheme].inherit[i]];if(inheritTheme!==undefined&&inheritTheme.images!==undefined){loopThrough(inheritTheme.images);}}
return sourceStrings;};Loader.prototype.loadClasses=function(paths){if(paths===undefined){throw new Error('Missing argument: paths');}
var className,i;for(i in paths){if(paths.hasOwnProperty(i)){className=paths[i].match(/(\w*)\.\w+$/)[1];if(window[className]){continue;}
jseSyncLoad(paths[i]);this.loaded.classes[className]=paths[i];}}
return true;};Loader.prototype.reloadAllClasses=function(){var i;for(i in this.loaded.classes){if(this.loaded.classes.hasOwnProperty(i)){jseSyncLoad(this.loaded.classes[i]);}}};Loader.prototype.loadThemes=function(themeNames,callback){if(themeNames===undefined){throw new Error('Missing argument: themeNames');}
if(callback!==undefined){this.onthemesloaded=callback;}
var name,req,i,total;for(i=0;i<themeNames.length;i++){name=themeNames[i];if(this.themes[name]){continue;}
req=new XMLHttpRequest();req.open('GET',engine.themesPath+'/'+name+'/theme.json',false);req.send();if(req.status===404){console.log('Theme not found: '+name);continue;}
eval('var theme = '+req.responseText);if(theme.inherit.length){this.loadThemes(theme.inherit);}
this.themes[name]=theme;theme.ressourcesCount=0;theme.ressourcesLoaded=0;theme.masksCount=0;theme.bBoxesCount=0;theme.masksGenerated=0;theme.bBoxesGenerated=0;theme.masks={};theme.bBoxes={};this.loadRessources(theme,theme.images,'images');this.loadRessources(theme,theme.sfx,'sfx');this.loadRessources(theme,theme.music,'music');}
total=0;for(i in this.themes){if(this.themes.hasOwnProperty(i)){total+=this.themes[i].ressourcesCount;}}
if(total===0){if(this.onthemesloaded){this.onthemesloaded();}}};Loader.prototype.preGenerateMask=function(theme,ressourceString){theme.masks[ressourceString]=Collidable.prototype.generateMask(ressourceString);theme.masksGenerated++;}
Loader.prototype.preGenerateBBox=function(theme,ressourceString){theme.bBoxes[ressourceString]=Collidable.prototype.generateBBox(theme.masks[ressourceString]);theme.bBoxesGenerated++;}
Loader.prototype.loadRessources=function(theme,object,typeString){if(theme===undefined){throw new Error('Missing argument: theme');}
if(object===undefined){throw new Error('Missing argument: object');}
if(typeString===undefined){throw new Error('Missing argument: typeString');}
var onload,res,path,i,format;onload=function(){var total,loaded,ressourceString,theme,i;if(this.hasAttribute('data-loaded')){return;}
this.setAttribute('data-loaded','true');theme=loader.themes[this.getAttribute('data-theme')];ressourceString=this.getAttribute('data-ressourceString');theme.ressourcesLoaded++;if(this.toString()==='[object HTMLImageElement]'){if(this.width*this.height<20000){theme.masksCount++;theme.bBoxesCount++;setTimeout(function(){loader.preGenerateMask(theme,ressourceString);loader.preGenerateBBox(theme,ressourceString);loader.checkAllLoaded();},1);}
else{console.log('Skipping generation of mask and bbox (> 20000 px): '+ressourceString);}}
loader.checkAllLoaded();};for(path in object){if(object.hasOwnProperty(path)){switch(typeString){case'images':res=new Image();res.src=engine.themesPath+"/"+theme.name+"/images/"+path.replace(/\./g,'/')+'.png';theme.images[path]=res;res.onload=onload;break;case'sfx':format=false;for(i=0;i<engine.host.supportedAudio.length;i++){if(object[path].search(engine.host.supportedAudio[i])!==-1){format=engine.host.supportedAudio[i];}}
if(!format){console.log('Sound was not available in a supported format: '+theme.name+"/sfx/"+path.replace(/\./g,'/'));continue;}
res=new Audio(engine.themesPath+"/"+theme.name+"/sfx/"+path.replace(/\./g,'/')+'.'+format);theme.sfx[path]=res;res.addEventListener("canplaythrough",onload,false);break;case'music':format=false;for(i=0;i<engine.host.supportedAudio.length;i++){if(object[path].search(engine.host.supportedAudio[i])!==-1){format=engine.host.supportedAudio[i];}}
if(!format){console.log('Sound was not available in a supported format: '+theme.name+"/sfx/"+path.replace(/\./g,'/'));continue;}
res=new Audio(engine.themesPath+"/"+theme.name+"/music/"+path.replace(/\./g,'/')+'.'+format);res.setAttribute('preload','preload');theme.music[path]=res;res.addEventListener("canplaythrough",onload,false);break;}
theme.ressourcesCount++;res.setAttribute('data-theme',theme.name);res.setAttribute('data-ressourceString',path.replace(/\./g,'/'));}}};Loader.prototype.checkAllLoaded=function(){total=0;loaded=0;for(i in this.themes){if(this.themes.hasOwnProperty(i)){theme=this.themes[i];total+=theme.ressourcesCount;total+=theme.masksCount;total+=theme.bBoxesCount;loaded+=theme.ressourcesLoaded;loaded+=theme.masksGenerated;loaded+=theme.bBoxesGenerated;}}
if(loaded===total){if(this.onthemesloaded){this.onthemesloaded();}}}
jseCreateClass('Animation');Animation.prototype.animate=function(properties,options){if(properties===undefined){throw new Error('Missing argument: properties');}
if(options===undefined){throw new Error('Missing argument: options');}
var anim,i,c,loop,map,opt;anim={},map=properties,opt=options?options:{};if(!map){return false;}
anim.obj=this;loop=opt.loop!==undefined?opt.loop:engine.defaultAnimationLoop;anim.callback=opt.callback!==undefined?opt.callback:function(){};anim.easing=opt.easing!==undefined?opt.easing:"quadInOut";anim.dur=opt.dur!==undefined?opt.dur:1000;anim.prop={};for(i in map){if(map.hasOwnProperty(i)){anim.prop[i]={begin:this[i],end:map[i]};}}
c=0;for(i in anim.prop){if(anim.prop[i].begin===anim.prop[i].end){delete anim.prop[i];}else{c++;}}
if(!c&&anim.callback===function(){}){console.log('Animation skipped, nothing to animate');return;}
animator.addAnimation(anim,loop);};Animation.prototype.isAnimated=function(){var name,loop,animId,animation;for(name in engine.loops){if(engine.loops.hasOwnProperty(name)){loop=engine.loops[name];for(animId=loop.animations.length-1;animId>-1;animId--){animation=loop.animations[animId];if(animation.obj===this){return true;}}}}
return false;};Animation.prototype.getAnimations=function(){var animations,name,loop,animId,animation;animations=[];for(name in engine.loops){if(engine.loops.hasOwnProperty(name)){loop=engine.loops[name];for(animId=loop.animations.length-1;animId>-1;animId--){animation=loop.animations[animId];if(animation.obj===this){animations.push(animation);}}}}
return animations;};Animation.prototype.stopAnimations=function(){var animations,name,loop,animId,animation;animations=[];for(name in engine.loops){if(engine.loops.hasOwnProperty(name)){loop=engine.loops[name];for(animId=loop.animations.length-1;animId>-1;animId--){animation=loop.animations[animId];if(animation.obj===this){loop.animations.splice(animId,1);}}}}}
jseCreateClass('Animator');Animator.prototype.addAnimation=function(animation,loop){if(animation===undefined){throw new Error('Missing argument: animation');}
if(loop===undefined){throw new Error('Missing argument: loop');}
var anim,propList,currentAnimations,i,cur,propName;loop=engine.loops[loop];anim=animation;anim.start=loop.time;propList=Object.keys(anim.prop);currentAnimations=anim.obj.getAnimations();for(i=0;i<currentAnimations.length;i++){cur=currentAnimations[i];for(propName in cur.prop){if(cur.prop.hasOwnProperty(propName)){if(propList.indexOf(propName)!==-1){delete cur.prop[propName];}}}}
loop.animations.push(anim);};Animator.prototype.updateAllLoops=function(){var name;for(name in engine.loops){if(engine.loops.hasOwnProperty(name)){this.updateLoop(name);}}};Animator.prototype.updateLoop=function(loop){if(loop===undefined){throw new Error('Missing argument: loop');}
var animId,a,propId,t;loop=engine.loops[loop];for(animId=loop.animations.length-1;animId>-1;animId--){a=loop.animations[animId];if(a===undefined){continue;}
t=loop.time-a.start;if(t>a.dur){loop.animations.splice(animId,1);for(propId in a.prop){if(a.prop.hasOwnProperty(propId)){a.obj[propId]=a.prop[propId].end;}}
if(typeof a.callback==="string"){eval(a.callback);}else{a.callback.call(a.obj);}}else{for(propId in a.prop){if(a.prop.hasOwnProperty(propId)){a.obj[propId]=this.ease(a.easing,t,a.prop[propId].begin,a.prop[propId].end-a.prop[propId].begin,a.dur);}}}}};Animator.prototype.ease=function(type,t,b,c,d){var a;switch(type){case"linear":t/=d;return b+c*t;case"quadIn":t/=d;return b+c*t*t;case"quadOut":t/=d;return b-c*t*(t-2);case"quadInOut":t=t/d*2;if(t<1){return b+c*t*t/2;}else{t--;return b+c*(1-t*(t-2))/2;}
case"powerIn":t/=d;a=c/Math.abs(c);return b+a*Math.pow(Math.abs(c),t);case"powerOut":t/=d;a=c/Math.abs(c);return b+c-a*Math.pow(Math.abs(c),1-t);case"powerInOut":t=t/d*2;a=c/Math.abs(c);if(t<1){return b+a*Math.pow(Math.abs(c),t)/2;}else{t--;return b+c-a*Math.pow(Math.abs(c),1-t)/2;}
case"sinusInOut":t/=d;return b+c*(1+Math.cos(Math.PI*(1+t)))/2;}
return b+c;};jseCreateClass('View');View.prototype.view=function(depth){if(depth===undefined){throw new Error('Missing argument: depth');}
this.depth=depth!==undefined?depth:undefined;this.children=[];};View.prototype.addChild=function(child){if(child===undefined){throw new Error('Missing argument: child');}
if(typeof child!=='object'){throw new Error('Argument "child" has to be of type "object"');}
if(this.children===undefined){this.children=[];}
this.children.push(child);child.parent=this;if(child.setDepth&&this.depth!==undefined){child.setDepth(this.depth);}
if(child.refreshSource){child.refreshSource;}
return child;};View.prototype.addChildren=function(child1,child2){if(arguments.length===0){throw new Error('This function needs at least one argument');}
var i;for(i=0;i<arguments.length;i++){this.addChild(arguments[i]);}
return arguments;};View.prototype.insertBefore=function(insertChildren,child){if(insertChildren===undefined){throw new Error('Missing argument: insertChildren');}
if(child===undefined){throw new Error('Missing argument: child');}
var arr,i;if(this.children===undefined){this.children=[];}
if(!Array.prototype.isPrototypeOf(insertChildren)){arr=[];arr.push(insertChildren);insertChildren=arr;}
if((i=this.children.indexOf(child))!==-1){this.children.splice.apply(this.children,[i,0].concat(insertChildren));}
for(i=0;i<insertChildren.length;i++){child=insertChildren[i];child.parent=this;if(child.setDepth&&this.depth!==undefined){child.setDepth(this.depth);}
if(child.refreshSource){child.refreshSource;}}
return insertChildren;};View.prototype.getChildren=function(){var ret=[];if(this.children){this.children.forEach(function(){ret.push(this);})}
return ret;};View.prototype.setDepth=function(depth){if(depth===undefined){throw new Error('Missing argument: depth');}
var i;this.depth=depth;this.ctx=engine.depth[depth].ctx;if(this.children){for(i=0;i<this.children.length;i++){if(this.children[i].setDepth){this.children[i].setDepth(this.depth);}}}};View.prototype.applyToThisAndChildren=function(func){if(func===undefined){throw new Error('Missing argument: function');}
var i;func.call(this);if(this.children){for(i=0;i<this.children.length;i++){this.children[i].applyToThisAndChildren(func);}}};View.prototype.setTheme=function(themeName,recursive){if(themeName){if(loader.themes[themeName]===undefined){throw new Error('Trying to set unexisting theme: '+themeName);}}
else{themeName=undefined;}
var i;recursive=recursive!==undefined?recursive:false;this.theme=themeName;if(this.refreshSource){this.refreshSource();}
if(this.children){if(recursive){for(i=0;i<this.children.length;i++){this.children[i].setTheme(undefined,true);}}
else{this.applyToThisAndChildren(function(){if(this.refreshSource){this.refreshSource();}});}}}
View.prototype.remove=function(){this.removeAllChildren();jsePurge(this);};View.prototype.removeAllChildren=function(){var len;if(this.children){len=this.children.length;while(len--){this.children[len].remove();this.children.splice(len,1);}}};View.prototype.removeChildren=function(child1,child2){if(arguments.length===0){throw new Error('This function needs at least one argument');}
var i;for(i=0;i<arguments.length;i++){this.removeChild(arguments[i]);}
return arguments;};View.prototype.removeChild=function(child){if(child===undefined){throw new Error('Missing argument: child');}
var i;if(this.children){for(i=0;i<this.children.length;i++){if(this.children[i]===child){this.children.splice(i,1);}}}};View.prototype.drawChildren=function(){var i;if(this.drawCanvas){if(this.depth!==undefined){this.drawCanvas();if(engine.drawBBoxes&&this.drawBBox){this.drawBBox();}
if(engine.drawMasks&&this.drawMask){this.drawMask();}}
else{console.log(this);}}
if(this.children){for(i=0;i<this.children.length;i++){if(this.children[i].drawChildren){this.children[i].drawChildren();}}}};jseCreateClass('CustomLoop');CustomLoop.prototype.customLoop=function(framesPerExecution,maskFunction){this.framesPerExecution=framesPerExecution===undefined?1:framesPerExecution;this.maskFunction=maskFunction===undefined?function(){return true;}:maskFunction;this.activitiesQueue=[];this.activities=[];this.animations=[];this.lastFrame=engine.frames;this.last=engine.now?engine.now:new Date().getTime();this.time=0;this.execTime=0;this.scheduledExecutions=[];};CustomLoop.prototype.schedule=function(func,delay){if(func===undefined){throw new Error('Missing argument: function');}
if(delay===undefined){throw new Error('Missing argument: delay');}
this.scheduledExecutions.push({func:func,execTime:this.time+delay});};CustomLoop.prototype.addQueue=function(){this.activities=this.activities.concat(this.activitiesQueue);this.activitiesQueue=[];}
CustomLoop.prototype.execute=function(){var timer,loop;timer=new Date().getTime();if(!this.maskFunction()||engine.frames%this.framesPerExecution){return;}
if(engine.frames-this.lastFrame===this.framesPerExecution){this.time+=engine.timeIncrease;}
this.lastFrame=engine.frames;this.last=engine.now;loop=this;this.scheduledExecutions.forEach(function(i){if(loop.time>=this.execTime){this.func();loop.scheduledExecutions.splice(i,1);}})
this.activities.forEach(function(){if(!this.activity){console.log(this);return;}
this.activity.call(this.object);})
this.addQueue();this.execTime=(new Date().getTime())-timer;};jseCreateClass('Collidable');Collidable.prototype.collidable=function(maskSource,x,y,dir,additionalProperties){if(maskSource===undefined){throw new Error('Missing argument: maskSource');}
this.maskSource=maskSource
this.x=x!==undefined?x:0;this.y=y!==undefined?y:0;this.dir=dir!==undefined?dir:0;this.maskGenerate=false;engine.registerObject(this);this.bmSize=1;this.opacity=1;this.importProperties(additionalProperties);if(!this.refreshMaskSource()){throw new Error('Mask source was not successfully loaded: '+maskSource);}
this.bmWidth=this.mask.width;this.bmHeight=this.mask.height;this.xOff=this.xOff!==undefined&&this.xOff!=='center'?this.xOff:this.bmWidth/2;this.yOff=this.yOff!==undefined&&this.xOff!=='center'?this.yOff:this.bmHeight/2;};Collidable.prototype.refreshMaskSource=function(){var parent,theme;theme=this.theme;if(theme===undefined){if(this.parent){parent=this.parent;while(theme===undefined){if(parent.theme){theme=parent.theme;}
else{if(parent.parent){parent=parent.parent;}
else{break;}}}}}
this.mask=loader.getImage(this.maskSource,theme);return this.mask;};Collidable.prototype.setMask=function(ressourceString){this.maskSource=ressourceString;this.maskGenerate=false;this.refreshMaskSource();};Collidable.prototype.bBoxCollidesWith=function(objects,getCollidingObjects){if(objects===undefined){throw new Error('Missing argument: objects');}
if(!Array.prototype.isPrototypeOf(objects)){objects=[objects];}
getCollidingObjects=getCollidingObjects!==undefined?getCollidingObjects:false;var obj,bBox,rVect,bb1,bb2,i,collideObjects;bBox=Math.round(this.dir/Math.PI*50);while(bBox>99){bBox-=100;}
bb1=this.bBox[bBox];rVect=this.rotateVector(this.bm.width/2-this.xOff,this.bm.height/2-this.yOff,this.dir);bb1={x1:this.x+(rVect.x+bb1.xOff)*this.bmSize,x2:this.x+(rVect.x+bb1.xOff+bb1.width)*this.bmSize,y1:this.y+(rVect.y+bb1.yOff)*this.bmSize,y2:this.y+(rVect.y+bb1.yOff+bb1.height)*this.bmSize};collidingObjects=[];for(i=0;i<objects.length;i++){obj=objects[i];bBox=Math.round(obj.dir/Math.PI*50);while(bBox>99){bBox-=100;}
bb2=obj.bBox[bBox];rVect=this.rotateVector(obj.bm.width/2-obj.xOff,obj.bm.height/2-obj.yOff,obj.dir);bb2={x1:obj.x+(rVect.x+bb2.xOff)*obj.bmSize,x2:obj.x+(rVect.x+bb2.xOff+bb2.width)*obj.bmSize,y1:obj.y+(rVect.y+bb2.yOff)*obj.bmSize,y2:obj.y+(rVect.y+bb2.yOff+bb2.height)*obj.bmSize};if(bb1.x1<bb2.x2&&bb1.x2>bb2.x1&&bb1.y1<bb2.y2&&bb1.y2>bb2.y1){if(getCollidingObjects){collidingObjects.push(obj);}
else{return true;}}}
if(collidingObjects.length){return collidingObjects;}
else{return false;}};Collidable.prototype.generateBBox=function(mask){mask=mask!==undefined?mask:this.mask;var bBoxes,i,canvas,ctx,bitmap,data,length,pixel,left,top,right,bottom;bBoxes=[];canvas=document.createElement('canvas');canvas.width=Math.ceil(Math.max(mask.width,mask.height)*1.42);canvas.height=canvas.width;ctx=canvas.getContext('2d');for(i=0;i<100;i++){ctx.save();ctx.fillStyle="#FFF";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(Math.PI*2/100*i);ctx.drawImage(mask,-mask.width/2,-mask.height/2,mask.width,mask.height);ctx.restore();top=canvas.height;bottom=0;left=canvas.width;right=0;bitmap=ctx.getImageData(0,0,canvas.width,canvas.height);data=bitmap.data;length=data.length/4;pxArr=[];for(pixel=0;pixel<length;pixel++){if(data[pixel*4]<255){y=Math.floor(pixel/bitmap.width);x=pixel-y*bitmap.width;top=Math.min(y,top);bottom=Math.max(y,top);left=Math.min(x,left);right=Math.max(x,right);}}
bBoxes[i]={xOff:left-canvas.width/2,yOff:top-canvas.height/2,width:right-left,height:bottom-top}}
return bBoxes;};Collidable.prototype.generateMask=function(ressourceString,alphaLimit){if(ressourceString===undefined){throw new Error('Missing argument: ressourceString');}
this.maskSource=ressourceString;this.maskGenerate=true;this.maskGenerateAlphaLimit=alphaLimit;this.refreshMaskSource();alphaLimit=alphaLimit!==undefined?alphaLimit:255;var canvas,ctx,bitmap,data,length,pixel;canvas=document.createElement('canvas');canvas.width=this.mask.width;canvas.height=this.mask.height;ctx=canvas.getContext('2d');ctx.drawImage(this.mask,0,0,this.mask.width,this.mask.height);bitmap=ctx.getImageData(0,0,canvas.width,canvas.height);data=bitmap.data;length=data.length/4;for(pixel=0;pixel<data.length;pixel++){if(data[pixel*4+3]<alphaLimit){data[pixel*4]=0;data[pixel*4+1]=0;data[pixel*4+2]=0;data[pixel*4+3]=0;}
else{data[pixel*4]=0;data[pixel*4+1]=0;data[pixel*4+2]=0;data[pixel*4+3]=255;}}
ctx.putImageData(bitmap,0,0);return canvas;};Collidable.prototype.bitmapCollidesWith=function(objects,resolution,getCollisionPosition,checkbBox){if(objects===undefined){throw new Error('Missing argument: objects');}
if(!Array.prototype.isPrototypeOf(objects)){objects=[objects];}
resolution=resolution!==undefined?resolution:1;getCollisionPosition=getCollisionPosition!==undefined?getCollisionPosition:false;checkbBox=checkbBox!==undefined?checkbBox:true;var canvas,canvasSize,ctx,obj,bitmap,i,data,length,pixel,pxArr,x,y,sumX,sumY,avX,avY,avDist,avDir;if(this.bmSize===0){return false;}
if(checkbBox){objects=this.bBoxCollidesWith(objects,true);if(objects===false){return false;}}
canvas=document.createElement('canvas');canvas.width=Math.ceil(this.mask.width*this.bmSize);canvas.height=Math.ceil(this.mask.height*this.bmSize);ctx=canvas.getContext('2d');ctx.fillStyle="#FFF";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.globalAlpha=0.5;ctx.save();ctx.drawImage(this.mask,0,0,this.bmWidth*this.bmSize,this.bmHeight*this.bmSize);ctx.translate(this.xOff*this.bmSize,this.yOff*this.bmSize);ctx.rotate(-this.dir);for(i=0;i<objects.length;i++){obj=objects[i];ctx.translate(obj.x-this.x,obj.y-this.y);ctx.rotate(obj.dir);ctx.drawImage(obj.mask,-obj.xOff*obj.bmSize,-obj.yOff*obj.bmSize,obj.bmWidth*obj.bmSize,obj.bmHeight*obj.bmSize);ctx.translate(this.x-obj.x,this.y-obj.y);ctx.rotate(-obj.dir);}
ctx.restore();bitmap=ctx.getImageData(0,0,canvas.width,canvas.height);data=bitmap.data;length=data.length/4;pxArr=[];for(pixel=0;pixel<length;pixel+=resolution){if(data[pixel*4]<127){if(getCollisionPosition){y=Math.floor(pixel/bitmap.width);x=pixel-y*bitmap.width;pxArr.push({x:x,y:y});}
else{return true;}}}
if(pxArr.length>0){pxArr=pxArr.sortByNumericProperty('x');avX=(pxArr[0].x+pxArr[pxArr.length-1].x)/2;pxArr=pxArr.sortByNumericProperty('y');avY=(pxArr[0].y+pxArr[pxArr.length-1].y)/2;avX-=this.xOff*this.bmSize;avY-=this.yOff*this.bmSize;avDir=Math.atan2(avY,avX);avDist=Math.sqrt(Math.pow(avX,2)+Math.pow(avY,2));avDir+=this.dir;avX=Math.cos(avDir)*avDist;avY=Math.sin(avDir)*avDist;return{x:avX,y:avY,dir:avDir};}
return false;};Collidable.prototype.rotateVector=function(x,y,dir){var dist,initDir;dist=Math.sqrt(Math.pow(x,2)+Math.pow(y,2));initDir=Math.atan2(y,x);initDir+=dir;return{x:Math.cos(initDir)*dist,y:Math.sin(initDir)*dist};}
Collidable.prototype.drawBBox=function(){var c,bBox,rVect;if(this.bBox){bBox=Math.round(this.dir/Math.PI*50);while(bBox>99){bBox-=100;}
bBox=this.bBox[bBox];}
else{return;}
rVect=this.rotateVector(this.bm.width/2-this.xOff,this.bm.height/2-this.yOff,this.dir);c=this.ctx;c.save();c.translate(this.x,this.y);c.strokeStyle="#00F";try{c.strokeRect((rVect.x+bBox.xOff)*this.bmSize,(rVect.y+bBox.yOff)*this.bmSize,bBox.width*this.bmSize,bBox.height*this.bmSize);}catch(e){console.log(bBox);engine.stopMainLoop();throw new Error(e);}
c.restore();};Collidable.prototype.drawMask=function(){var c,mask;if(this.mask){mask=this.mask;}
else{return;}
c=this.ctx;c.save();c.translate(this.x,this.y);c.rotate(this.dir);try{c.drawImage(this.mask,-this.xOff*this.bmSize,-this.yOff*this.bmSize,this.bmWidth*this.bmSize,this.bmHeight*this.bmSize);}catch(e){console.log(this.source);console.log(this.bm);engine.stopMainLoop();throw new Error(e);}
c.restore();};jseCreateClass('Director',[View]);Director.prototype.director=function(){this.actors={};this.frame=0;};Director.prototype.loadScene=function(scene){if(scene===undefined){throw new Error('Missing argument: scene');}
this.scene=scene;this.removeActors();this.createActors();};Director.prototype.removeActors=function(){var name;for(name in this.actors){if(this.actors.hasOwnProperty(name)){this.actors[name].remove();}}};Director.prototype.createActors=function(){var name,actor;for(name in this.scene.actors){if(this.scene.actors.hasOwnProperty(name)){actor=this.scene.actors[name];this.actors[name]=new Sprite(actor.source,0,0,0,{opacity:0,drawOrder:actor.drawOrder});this.addChild(this.actors[name]);this.children=this.children.sortByNumericProperty('drawOrder');}}};Director.prototype.startScene=function(){this.frame=0;this.updateScene();this.pauseScene();this.playScene();};Director.prototype.pauseScene=function(){engine.detachFunctionFromLoop(this,this.onRunning,'eachFrame');};Director.prototype.playScene=function(){engine.detachFunctionFromLoop(this,this.onRunning,'eachFrame');engine.attachFunctionToLoop(this,this.onRunning,'eachFrame');};Director.prototype.goToFrame=function(frameNumber){if(frameNumber===undefined){throw new Error('Missing argument: frameNumber');}
this.frame=frameNumber;this.updateScene();};Director.prototype.getKeyFrameProperties=function(actor,keyFrameNumber){if(actor===undefined){throw new Error('Missing argument: actor');}
if(keyFrameNumber===undefined){throw new Error('Missing argument: keyFrameNumber');}
var ret,propName,frame,propValue;ret={x:0,y:0,dir:0,opacity:0,bmSize:1};for(propName in ret){if(ret.hasOwnProperty(propName)){frame=actor.keyFrames.getElementByPropertyValue('frame',keyFrameNumber);propValue=frame.properties[propName];if(propValue===undefined){propValue=this.getInheritedPropertyValue(actor,keyFrameNumber,propName);}
ret[propName]=propValue!==false?propValue:ret[propName];}}
return ret;};Director.prototype.getInheritedPropertyValue=function(actor,keyFrameNumber,propName){if(actor===undefined){throw new Error('Missing argument: actor');}
if(keyFrameNumber===undefined){throw new Error('Missing argument: keyFrameNumber');}
if(propName===undefined){throw new Error('Missing argument: propName');}
var defaults,value,inheritFrameNumber,inheritFrame,i;defaults={x:0,y:0,dir:0,opacity:0,bmSize:1};value=defaults[propName];inheritFrameNumber=0;for(i=0;i<actor.keyFrames.length;i++){inheritFrame=actor.keyFrames[i];if(inheritFrame.frame<inheritFrameNumber||inheritFrame.frame>keyFrameNumber){continue;}
if(inheritFrame.properties[propName]!==undefined){value=inheritFrame.properties[propName];inheritFrameNumber=inheritFrame.frame;}}
return value;};Director.prototype.onRunning=function(){this.frame++;if(this.frame===this.scene.duration){engine.detachFunctionFromLoop(this,this.updateScene,'eachFrame');this.frame=0;}
this.updateScene();};Director.prototype.updateScene=function(){var name,a,lastFrame,nextFrame,last,next,i,frame,props,propName,ease,lastProps,nextProps,t,b,c,d;for(name in this.scene.actors){if(this.scene.actors.hasOwnProperty(name)){a=this.scene.actors[name];lastFrame=false;nextFrame=this.scene.duration;last=false;next=false;for(i=0;i<a.keyFrames.length;i++){frame=a.keyFrames[i].frame;if(frame<=this.frame&&frame>=lastFrame){lastFrame=frame;last=a.keyFrames[i];}
else if(frame<nextFrame){nextFrame=frame;next=a.keyFrames[i];}}
if(lastFrame===false){this.actors[name].x=0;this.actors[name].y=0;this.actors[name].dir=0;this.actors[name].opacity=0;this.actors[name].bmSize=1;continue;}
if(lastFrame===this.frame||nextFrame===false||next.ease===undefined){props=this.getKeyFrameProperties(a,lastFrame);for(propName in props){if(props.hasOwnProperty(propName)){this.actors[name][propName]=props[propName];}}}
else{ease=next.ease;lastProps=this.getKeyFrameProperties(a,lastFrame);nextProps=this.getKeyFrameProperties(a,nextFrame);for(propName in nextProps){if(nextProps.hasOwnProperty(propName)){t=this.frame-lastFrame;b=lastProps[propName];c=nextProps[propName]-b;d=nextFrame-lastFrame;this.actors[name][propName]=Animator.prototype.ease(ease,t,b,c,d);}}}}}};jseCreateClass('Sprite',[View,Animation]);Sprite.prototype.sprite=function(source,x,y,dir,additionalProperties){if(source===undefined){throw new Error('Missing argument: source');}
this.source=source;this.x=x!==undefined?x:0;this.y=y!==undefined?y:0;this.dir=dir!==undefined?dir:0;engine.registerObject(this);this.bmSize=1;this.opacity=1;this.composite='source-over';this.importProperties(additionalProperties);if(!this.refreshSource()){throw new Error('Sprite source was not successfully loaded: '+source);}
this.bmWidth=this.bm.width;this.bmHeight=this.bm.height;this.xOff=this.xOff!==undefined&&this.xOff!=='center'?this.xOff:this.bmWidth/2;this.yOff=this.yOff!==undefined&&this.yOff!=='center'?this.yOff:this.bmHeight/2;};Sprite.prototype.refreshSource=function(){var parent,theme;theme=this.theme;if(theme===undefined){if(this.parent){parent=this.parent;while(theme===undefined){if(parent.theme){theme=parent.theme;}
else{if(parent.parent){parent=parent.parent}
else{break;}}}}}
this.bm=loader.getImage(this.source,theme);this.bmWidth=this.bm.width;this.bmHeight=this.bm.height;return this.bm;};Sprite.prototype.setSource=function(source){if(source===undefined){throw new Error('Missing argument: source');}
if(this.source===source){return;}
this.source=source;this.refreshSource();};Sprite.prototype.drawCanvas=function(){var c=this.ctx;c.save();c.translate(this.x,this.y);c.globalAlpha=this.opacity;c.rotate(this.dir);c.globalCompositeOperation=this.composite;try{c.drawImage(this.bm,-this.xOff*this.bmSize,-this.yOff*this.bmSize,this.bmWidth*this.bmSize,this.bmHeight*this.bmSize);}catch(e){console.log(this.source);console.log(this.bm);engine.stopMainLoop();throw new Error(e);}
c.restore();};jseCreateClass('TextBlock',[Animation,View]);TextBlock.prototype.textBlock=function(string,x,y,width,additionalProperties){if(string===undefined){throw new Error('Missing argument: string');}
if(width===undefined){throw new Error('Missing argument: width');}
this.x=x!==undefined?x:0;this.y=y!==undefined?y:0;this.width=width;this.font='normal 14px Verdana';this.alignment='left';this.xOff=0;this.yOff=0;this.color="#000000";this.opacity=1;this.bmSize=1;this.dir=0;this.composite='source-over';this.importProperties(additionalProperties);this.lineHeight=this.lineHeight?this.lineHeight:this.font.match(/[0.0-9]+/)*1.25;this.lines=[];this.lineWidth=[];this.cache=document.createElement('canvas');this.cacheCtx=this.cache.getContext('2d');this.cache.width=this.width;this.cache.height=1000;engine.registerObject(this);this.setString(string);this.cacheRendering();};TextBlock.prototype.setString=function(string){if(string===undefined){throw new Error('Missing argument: string');}
this.string=string;if(typeof this.string!=='string'){this.string=this.string.toString();}
if(this.string===''){this.string===' ';}
this.stringToLines();this.cacheRendering();};TextBlock.prototype.setAlignment=function(alignment){if(alignment===undefined){throw new Error('Missing argument: alignment');}
if(/left|right|center/.test(alignment)===false){throw new Error('Invalid alignment given. Valid alignments are: left, right, center');}
this.alignment=alignment;this.cacheRendering();}
TextBlock.prototype.setColor=function(colorString){if(colorString===undefined){throw new Error('Missing argument: colorString');}
this.color=colorString;this.cacheRendering();}
TextBlock.prototype.cacheRendering=function(){var xOffset,i;this.cacheCtx.clearRect(0,0,this.cache.width,this.cache.height);this.cacheCtx.font=this.font;this.cacheCtx.fillStyle=this.color;for(i=0;i<this.lines.length;i++){xOffset=0;switch(this.alignment){case'left':xOffset=0;break;case'right':xOffset=this.width-this.lineWidth[i];break;case'center':xOffset=(this.width-this.lineWidth[i])/2;break;}
if(this.lines[i]){this.cacheCtx.fillText(this.lines[i],xOffset,this.lineHeight*(1+i));}}};TextBlock.prototype.drawCanvas=function(){var c;if(/^\s*$/.test(this.string)){return;}
c=this.ctx;c.save();c.translate(this.x,this.y);c.rotate(this.dir);c.globalAlpha=this.opacity;c.globalCompositeOperation=this.composite;c.drawImage(this.cache,-this.xOff*this.bmSize,-this.yOff*this.bmSize,this.cache.width*this.bmSize,this.cache.height*this.bmSize);c.restore();};TextBlock.prototype.stringToLines=function(){var lt,line,paragraphs,pid,words,wid,word;lt=document.createElement('span');lt.style.font=this.font;lt.style.visibility='hidden';lt.style.position='absolute';document.body.appendChild(lt);line=0;this.lines=[];this.lines[line]='';paragraphs=this.string.split("\n");for(pid=0;pid<paragraphs.length;pid++){words=paragraphs[pid].split(' ');for(wid=0;wid<words.length;wid++){word=words[wid];lt.innerHTML+=word+" ";if(lt.offsetWidth>this.width){line++;this.lines[line]='';lt.innerHTML='';lt.innerHTML+=word+" ";}
else{this.lineWidth[line]=lt.offsetWidth;}
this.lines[line]+=word+" ";}
line++;lt.innerHTML='';this.lines[line]='';}
lt.parentNode.removeChild(lt);};jseCreateClass('GameObject',[Sprite,Collidable]);GameObject.prototype.gameObject=function(source,x,y,dir,additionalProperties){if(source===undefined){throw new Error('Missing argument: source');}
if(x===undefined){throw new Error('Missing argument: x');}
if(y===undefined){throw new Error('Missing argument: y');}
this.sprite(source,x,y,dir,additionalProperties);if(this.maskSource){this.setMask(this.maskSource);this.boundingBox={xOff:-this.xOff,yOff:-this.yOff,width:this.bmWidth,height:this.bmHeight};}
else{this.maskGenerateAlphaLimit=this.maskGenerateAlphaLimit?this.maskGenerateAlphaLimit:255;this.mask=loader.getMask(source);this.bBox=loader.getBBox(source);}
this.loop=this.loop?this.loop:'eachFrame';engine.attachFunctionToLoop(this,this.update,this.loop);this.dX=this.dX?this.dX:0;this.dY=this.dY?this.dY:0;this.alive=true;};GameObject.prototype.getSpeed=function(){return Math.sqrt(Math.pow(this.dX,2)+Math.pow(this.dY,2));}
GameObject.prototype.getDirection=function(){return Math.atan2(this.dY,this.dX);}
GameObject.prototype.setVelocity=function(dir,speed){dir=dir!==undefined?dir:0;speed=speed!==undefined?speed:0;this.dX=Math.cos(dir)*speed;this.dY=Math.sin(dir)*speed;}
GameObject.prototype.directionTo=function(obj){return Math.atan2(obj.y-this.y,obj.x-this.x);}
GameObject.prototype.accelerate=function(direction,speed){this.dX+=Math.cos(direction)*speed;this.dY+=Math.sin(direction)*speed;}
GameObject.prototype.update=function(){if(this.alive){this.x+=this.dX*engine.timeIncrease/1000;this.y+=this.dY*engine.timeIncrease/1000;}};jseCreateClass('GravityObject',[GameObject]);GravityObject.prototype.gravityObject=function(source,x,y,dir,additionalProperties){if(source===undefined){throw new Error('Missing argument: source');}
if(x===undefined){throw new Error('Missing argument: x');}
if(y===undefined){throw new Error('Missing argument: y');}
if(dir===undefined){throw new Error('Missing argument: dir');}
this.gameObject(source,x,y,dir,additionalProperties);engine.attachFunctionToLoop(this,this.doGrav,this.loop);engine.attachFunctionToLoop(this,this.doBorders,this.loop);this.gravity=this.gravity?this.gravity:0;this.gravDir=this.gravityDirection?this.gravityDirection:Math.PI/2;};GravityObject.prototype.doGrav=function(){this.dX+=Math.cos(this.gravDir)*this.gravity*engine.timeIncrease/1000;this.dY+=Math.sin(this.gravDir)*this.gravity*engine.timeIncrease/1000;};GravityObject.prototype.doBorders=function(){if(this.x<this.bmSize/2||this.x>engine.canvasResX-this.bmSize/2){while(this.x<this.bmSize/2||this.x>engine.canvasResX-this.bmSize/2){this.x-=this.dX*engine.timeIncrease/1000;}
this.dX=-this.dX;}
if(this.y>engine.canvasResY-this.bmSize/2){this.y=engine.canvasResY-this.bmSize/2;if(Math.abs(this.dY)<100){this.dY*=-0.4;if(Math.abs(this.dY*engine.timeIncrease/1000)<1){this.dY=0;}}else{this.dY=-this.dY*0.6;}
this.dX*=0.8;}};jseCreateClass('Keyboard');Keyboard.prototype.keyboard=function(){document.addEventListener('keydown',function(event){keyboard.onKeyDown.call(keyboard,event);},false);document.addEventListener('keyup',function(event){keyboard.onKeyUp.call(keyboard,event);},false);this.events=[];};Keyboard.prototype.onKeyDown=function(event){if(event===undefined){throw new Error('Missing argument: event');}
var frame;if(this.isDown(event.keyCode)){return;}
frame=engine.frames;if(engine.updatesPerformed){frame++;}
this.cleanUp(event.keyCode);this.events.push({'key':event.keyCode,'frame':frame,'type':'pressed'});};Keyboard.prototype.onKeyUp=function(event){if(event===undefined){throw new Error('Missing argument: event');}
var frame,evt,i;frame=engine.frames;for(i=this.events.length-1;i>=0;i--){evt=this.events[i];if(evt.key===event.keyCode){if(evt.frame>=engine.frames){frame=evt.frame+1;}}}
this.cleanUp(event.keyCode);this.events.push({'key':event.keyCode,'frame':frame,'type':'released'});};Keyboard.prototype.cleanUp=function(key){if(key===undefined){throw new Error('Missing argument: key');}
var clean,evt,i;if(typeof key==='string'){key=key.toUpperCase().charCodeAt(0);}
clean=false;for(i=this.events.length-1;i>=0;i--){evt=this.events[i];if(evt.key===key){if(clean){this.events.splice(i,1);}
if(evt.frame<=engine.frames){clean=true;}}}};Keyboard.prototype.isDown=function(key){if(key===undefined){throw new Error('Missing argument: key');}
var evt,i;if(typeof key==='string'){key=key.toUpperCase().charCodeAt(0);}
for(i=this.events.length-1;i>=0;i--){evt=this.events[i];if(evt.key===key&&evt.frame<=engine.frames){return(evt.type==='pressed');}}
return false;};Keyboard.prototype.isPressed=function(key){if(key===undefined){throw new Error('Missing argument: key');}
var evt,i;if(typeof key==='string'){key=key.toUpperCase().charCodeAt(0);}
for(i=this.events.length-1;i>=0;i--){evt=this.events[i];if(evt.key===key){if(evt.frame===engine.frames-1&&evt.type==='pressed'){return true;}}}
return false;};jseCreateClass('Mouse');Mouse.prototype.mouse=function(){if(engine.host.hasTouch){arena.addEventListener('touchstart',function(event){mouse.onTouchStart.call(mouse,event);},false);arena.addEventListener('touchend',function(event){mouse.onTouchEnd.call(mouse,event);},false);document.addEventListener('touchmove',function(event){mouse.onTouchMove.call(mouse,event);this.touches=event.touches;},false);}
else{arena.addEventListener('mousedown',function(event){mouse.onMouseDown.call(mouse,event);},false);arena.addEventListener('mouseup',function(event){mouse.onMouseUp.call(mouse,event);},false);document.addEventListener('mousemove',function(event){engine.host.hasMouse=true;mouse.onMouseMove.call(mouse,event);},false);if(engine.options.cursor){engine.arena.style.cursor="url('"+loader.getImage(engine.options.cursor).src+"') 0 0, auto";}}
this.x=0;this.y=0;this.windowX=0;this.windowY=0;this.events=[];};Mouse.prototype.onMouseDown=function(event){if(event===undefined){throw new Error('Missing argument: event');}
var frame=engine.frames;if(engine.updatesPerformed){frame++;}
this.cleanUp(event.which);this.events.push({'button':event.which,'frame':frame,'type':'pressed'});};Mouse.prototype.onMouseUp=function(event){if(event===undefined){throw new Error('Missing argument: event');}
var frame,evt,i;frame=engine.frames;for(i=this.events.length-1;i>=0;i--){evt=this.events[i];if(evt.button===event.which){if(evt.frame>=engine.frames){frame=evt.frame+1;}}}
this.cleanUp(event.which);this.events.push({'button':event.which,'frame':frame,'type':'released'});};Mouse.prototype.onMouseMove=function(event){if(event===undefined){throw new Error('Missing argument: event');}
this.windowX=event.pageX;this.windowY=event.pageY;this.x=this.windowX-arena.offsetLeft+document.body.scrollLeft;this.y=this.windowY-arena.offsetTop+document.body.scrollTop;this.x=this.x/arena.offsetWidth*engine.canvasResX;this.y=this.y/arena.offsetHeight*engine.canvasResY;if(this.cursor){this.cursor.x=this.x;this.cursor.y=this.y;}};Mouse.prototype.onTouchStart=function(event){if(event===undefined){throw new Error('Missing argument: event');}
var frame=engine.frames;this.touches=event.touches;if(engine.updatesPerformed){frame++;}
this.onTouchMove(event);this.cleanUp(1);this.events.push({'button':1,'frame':frame,'type':'pressed'});};Mouse.prototype.onTouchEnd=function(event){if(event===undefined){throw new Error('Missing argument: event');}
var frame,evt,i;this.touches=event.touches;frame=engine.frames;for(i=this.events.length-1;i>=0;i--){evt=this.events[i];if(evt.button===1){if(evt.frame>=engine.frames){frame=evt.frame+1;}}}
this.onTouchMove(event);this.cleanUp(1);this.events.push({'button':1,'frame':frame,'type':'released'});};Mouse.prototype.onTouchMove=function(event){if(event===undefined){throw new Error('Missing argument: event');}
this.touches=event.touches;this.windowX=event.targetTouches[0].pageX;this.windowY=event.targetTouches[0].pageY;this.x=this.windowX-arena.offsetLeft+document.body.scrollLeft;this.y=this.windowY-arena.offsetTop+document.body.scrollTop;this.x=this.x/arena.offsetWidth*engine.canvasResX;this.y=this.y/arena.offsetHeight*engine.canvasResY;};Mouse.prototype.cleanUp=function(button){if(button===undefined){throw new Error('Missing argument: button');}
var clean,evt,i;clean=false;for(i=this.events.length-1;i>=0;i--){evt=this.events[i];if(evt.button===button){if(clean){this.events.splice(i,1);}
if(evt.frame<=engine.frames){clean=true;}}}};Mouse.prototype.isDown=function(button){if(button===undefined){throw new Error('Missing argument: button');}
var evt,i;for(i=this.events.length-1;i>=0;i--){evt=this.events[i];if(evt.button===button&&evt.frame<=engine.frames){return(evt.type==='pressed');}}
return false;};Mouse.prototype.isPressed=function(button){if(button===undefined){throw new Error('Missing argument: button');}
var evt,i;for(i=this.events.length-1;i>=0;i--){evt=this.events[i];if(evt.button===button){if(evt.frame===engine.frames-1&&evt.type==='pressed'){return evt;}}}
return false;};Mouse.prototype.squareIsPressed=function(x,y,w,h){if(x===undefined){throw new Error('Missing argument: x');}
if(y===undefined){throw new Error('Missing argument: y');}
if(w===undefined){throw new Error('Missing argument: w');}
if(h===undefined){throw new Error('Missing argument: h');}
var btn,i;btn=false;for(i=1;i<4;i++){if(this.isPressed(i)){btn=i;break;}}
if(btn&&this.x>x&&this.x<x+w&&this.y>y&&this.y<y+h){return btn;}};Mouse.prototype.squareOutsideIsPressed=function(x,y,w,h){if(x===undefined){throw new Error('Missing argument: x');}
if(y===undefined){throw new Error('Missing argument: y');}
if(w===undefined){throw new Error('Missing argument: w');}
if(h===undefined){throw new Error('Missing argument: h');}
return this.isPressed(1)&&(this.x<x||this.x>x+w||this.y<y||this.y>y+h);};Mouse.prototype.circleIsPressed=function(x,y,r){if(x===undefined){throw new Error('Missing argument: x');}
if(y===undefined){throw new Error('Missing argument: y');}
if(r===undefined){throw new Error('Missing argument: r');}
var dX,dY;dX=this.x-x;dY=this.y-y;btn=false;for(i=1;i<4;i++){if(this.isPressed(i)){btn=i;break;}}
if(this.isPressed(1)&&r>Math.sqrt(dX*dX+dY*dY)){return btn;}};Mouse.prototype.unPress=function(button){if(button===undefined){throw new Error('Missing argument: button');}
var evt,i;for(i=this.events.length-1;i>=0;i--){evt=this.events[i];if(evt.button===button){if(evt.frame===engine.frames-1&&evt.type==='pressed'){evt.frame--;return true;}}}
return false;};Mouse.prototype.outside=function(){return this.x<0||this.x>arena.offsetWidth||this.y<0||this.y>arena.offsetHeight;};