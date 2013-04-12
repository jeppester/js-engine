#!/usr/bin/php5
<?php
/* COLLECT OPTIONS */
$options = array(
	"nominify" => false,
	"keepLogs" => false,
	"engineOnly" => false,
	"engineDir" => 'js/jsEngine/',
	"engineFile" => 'Engine.js',
	"gameFile" => dirname(__FILE__) . '/../index.html',
	"gameClassFile" => 'js/Game.js',
);

echo "\n";

if (in_array("--help",$argv)) {
	echo "
packProject.php
Minifies and packs a jsEngine project's code to one single file.

Options:
 --nominify: Append all files to each other, but do not minify them
 --engine-only: Only pack the engine
 --keeplogs: Do not remove console.log()-calls
 --game-file [path]: Specify the game file (.html) to fetch js-file locations from
";
	exit;
};

if (in_array("--nominify",$argv)) {
	$options["nominify"] = true;
};

if (in_array("--engine-only",$argv)) {
	$options["engineOnly"] = true;
};

if (!in_array("--keeplogs",$argv)) {
	$options["keepLogs"] = true;
};

if ($id = array_search('--game-file', $argv)) {
	if (isset($argv[$id + 1])) {
		$options["gameFile"] = $argv[$id + 1];
	}
}

if (!file_exists($options["gameFile"])) {
	echo "Could not find game file\n";
	exit;
}
else {
	$gameFile = file_get_contents($options['gameFile']);
	$options['gameDir'] = preg_replace('/\/[^\/]*$/', '/', $options['gameFile']);
}

/* SEARCH GAME FILE FOR ENGINE DIR, ENGINE FILE AND GAME CLASS FILE */
preg_match('/["|\']([^"|\']*)(Engine(\.packed)?\.js)["|\']/', $gameFile, $m);
$options['engineDir'] = $m[1];
$options['engineFile'] = $m[2];

preg_match('/["|\']?gameClassPath["|\']?:\s*["|\']([^"|\']*)["|\']/', $gameFile, $m);
if (!empty($m)) {
	$options['gameClassFile'] = $m[1];
}

// Initialize files-array
$files = array();

// Check if jsEngine-file is already packed
$e = $options['engineDir'];
$engineFile = file_get_contents($options['gameDir'] . $e . $options['engineFile']);
if (preg_match('/Array\.prototype\.sortByNumericProperty/', $engineFile)) {
	echo "Packed JsEngine detected\n";
	if ($options['engineOnly']) {
		echo "Engine already packed, nothing to do\n\n";
		exit;
	}

	// If minified, include JsEngine.js
	array_push($files, $e . $options['engineFile']);
}
else {
	echo "Non-packed JsEngine detected\n";

	// If not minified, include all engine files separately
	array_push($files, 
		$e . 'jseFunctions.js',
		$e . 'jseExtensions.js',
		$e . 'jseGlobals.js',
		$e . 'jsePolyfills.js',

		$e . 'Engine.js',

		$e . "objects/Animator.js",
		$e . "objects/Animatable.js",
		$e . "objects/Vector2D.js",
		$e . "objects/Line.js",
		$e . "objects/Polygon.js",
		$e . "objects/Rectangle.js",
		$e . "objects/Loader.js",
		$e . "objects/View.js",
		$e . "objects/CustomLoop.js",
		$e . "objects/Sprite.js",
		$e . "objects/Collidable.js",
		$e . "objects/TextBlock.js",
		$e . "objects/GameObject.js",
		$e . "objects/Keyboard.js",
		$e . "objects/Pointer.js",
		$e . "objects/Sound.js",
		$e . "objects/Music.js"
	);
}

function scanLoad($file) {
	global $files, $options;

	$fPath = $options['gameDir'] . $file;

	if (in_array($file, $files)) {
		echo "Skipping already loaded object file: " . $file . "\n";
		return;
	}

	if (file_exists($fPath)) {
		echo 'Adding file: ' . $file . "\n";
		$files[] = $file;

		$fCon = file_get_contents($fPath);

		// Search the files for loaded objects
		preg_match_all('/loader\.loadObjects\(\[[^\]]*\]\)/', $fCon, $m1);

		$m = $m1[0];

		foreach($m as $val) {
			preg_match_all('/[\'|"]([^\.]+\.js)[\'|"]/', $val, $jsFiles);

			foreach($jsFiles[1] as $val2) {
				scanLoad($val2);
			}
		}
	}
	else {
		echo "Skipping non-existing object file: " . $file . "\n";
		return;
	}
}

if (!$options['engineOnly']) {
	scanLoad($options['gameClassFile']);
}
else {
	echo "Skipping game, packing engine only\n";
}

// For debug purposes
//print_r($files);
//exit;

// Append all these files to each other
$filesContent="";
foreach ($files as $file) {
	$filesContent .= file_get_contents($options['gameDir'] . $file) . "\n";
}

if (!$options['keepLogs']) {
	echo "Keep logs specified, keeping logs\n";

	// remove all occurrences of "console.log([something])"
	$filesContent=preg_replace ('/console\.log[^\n|;]*(\n|;)?/', '', $filesContent);
};

require dirname(__FILE__) . '/jsmin.php';

if ($options['nominify']) {
	echo "Nominify option used, saving concatenated files\n";

	$packedJS = $filesContent;
}
else {
	echo "Minifying files\n";

	$packedJS = JSMin::minify($filesContent);
}

$packedFileName = preg_replace('/\.(\w*)$/', '.packed.$1', $options['gameFile']);

if ($options['engineOnly']) {
	echo "Saving to JsEngine.js (only engine was packed)\n";
	file_put_contents($options['gameDir'].'JsEngine.packed.js', $packedJS);

	echo "Saving HTML-file with fixed references to " . $packedFileName . "\n\n";
	file_put_contents($packedFileName, preg_replace('/["|\']([^"|\']*)JsEngine\.js["|\']/', '"JsEngine.packed.js"', $gameFile));
}
else {
	echo "Saving game to game.packed.js\n";
	file_put_contents($options['gameDir'].'game.packed.js', $packedJS);

	echo "Saving HTML-file with fixed references to " . $packedFileName . "\n\n";
	file_put_contents($packedFileName, str_replace($options['engineDir'] . $options['engineFile'], 'game.packed.js', $gameFile));
}
?>
