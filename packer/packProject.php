#!/usr/bin/php
<?php
/* COLLECT OPTIONS */
$options = array(
	"nominify" => false,
	"keepLogs" => false,
	"keepDev" => false,
	"engineOnly" => false,
	"engineDir" => 'js/jsEngine/',
	"engineFile" => 'Engine.js',
	"gameFile" => dirname(__FILE__) . '/../index.html',
	"gameClassFile" => 'js/Game.js',
	"ignoreHTML" => false,
);

echo "\n";

if (in_array("--help",$argv)) {
	echo "
packProject.php [option 1] [option 2] [...]
Minifies and packs a jsEngine project's code to one single file.

Options:
 --no-minify:         Append all files to each other, but do not minify them
 --engine-only:       Only pack the engine
 --keep-logs:         Do not remove console.log()-calls
 --keep-dev:          Do not remove lines ending with a \"//dev\"-comment
 --game-file [path]:  Specify the game file (.html) to fetch js-file locations from
 --include [path]:    Specify a file containing a list of files to include (one path per line)
 --output-dir [path]: Specify where to save the minified files
";
	exit;
};

if (in_array("--no-minify",$argv)) {
	$options["nominify"] = true;
};

if (in_array("--engine-only",$argv)) {
	$options["engineOnly"] = true;
};

if (in_array("--keep-logs",$argv)) {
	$options["keepLogs"] = true;
};

if (in_array("--keep-dev",$argv)) {
	$options["keepDev"] = true;
};

if (in_array("--ignore-html",$argv)) {
	$options["ignoreHTML"] = true;
};

// Output dir option
if ($id = array_search('--output-dir', $argv)) {
	if (isset($argv[$id + 1])) {
		$options["outputDir"] = $argv[$id + 1];
	}

	if (!is_dir($options["outputDir"])) {
		echo "Could not find output directory\n";
		exit;
	}
}

// Game file options
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
	$options['gameDir'] = dirname($options['gameFile']) . '/';

	if (!isset($options['outputDir'])) {
		$options['outputDir'] = $options['gameDir'];
	}
}

/* SEARCH GAME FILE FOR ENGINE DIR, ENGINE FILE AND GAME CLASS FILE */
preg_match('/["\']([^"\']*)((autoload|jsEngine\.min)\.js)["\']/', $gameFile, $m);
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
if (preg_match('/Object\.prototype\.importProperties/', $engineFile)) {
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
		$e . 'Extension/Object.js',

		$e . 'Polyfill/requestAnimationFrame.js',
		$e . 'Polyfill/Array.prototype.forEach.js',

		$e . 'Engine/Class.js',
		$e . 'Engine/Globals.js',
		$e . 'Engine/Engine.js',
		$e . 'Engine/Loader.js',

		$e . 'Mixin/Animatable.js',
		$e . 'Mixin/MatrixCalculation.js',
		$e . 'Mixin/WebGLHelpers.js',

		$e . 'Renderer/WebGL.js',
		$e . 'Renderer/WebGL.TextureShaderProgram.js',
		$e . 'Renderer/WebGL.ColorShaderProgram.js',
		$e . 'Renderer/Canvas.js',

		$e . 'Math/Vector.js',
		$e . 'Math/Line.js',
		$e . 'Math/Circle.js',
		$e . 'Math/Rectangle.js',
		$e . 'Math/Polygon.js',

		$e . 'View/Child.js',
		$e . 'View/Line.js',
		$e . 'View/Circle.js',
		$e . 'View/Rectangle.js',
		$e . 'View/Polygon.js',
		$e . 'View/Container.js',
		$e . 'View/Sprite.js',
		$e . 'View/Collidable.js',
		$e . 'View/TextBlock.js',
		$e . 'View/GameObject.js',

		$e . 'Engine/Room.js',
		$e . 'Engine/Camera.js',
		$e . 'Engine/CustomLoop.js',

		$e . 'Input/Keyboard.js',
		$e . 'Input/Pointer.js',

		$e . 'Sound/Effect.js',
		$e . 'Sound/Music.js'
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

		// Search the files for loaded files and classes
		preg_match_all('/(?:loader|engine)\.load(?:Classes|Files)\(\[[^\]]*\]\)/', $fCon, $m1);
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

	// Include option
	if ($id = array_search('--include', $argv)) {
		if (isset($argv[$id + 1])) {
			$includeFiles = file($argv[$id + 1]);

			foreach ($includeFiles as $file) {
				scanLoad(str_replace("\n", '', $file));
			}
		}
	}
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
	// Remove trailing newline (introduced by include files)
	$file = preg_replace('/\n\r?$/', '', $file);

	$filesContent .= file_get_contents($options['gameDir'] . $file) . "\n";
}

// Remove line with a "//dev"-comment after (unless other is specified)
if ($options['keepDev'] === false) {
	$filesContent = preg_replace('/[^\n]*\/\/dev\r?\n/', '', $filesContent);
}
else {
	echo "Keep dev specified, Removing dev lines\n";
}

//echo $filesContent;
//exit;

if (!$options['keepLogs']) {
	// remove all occurrences of "console.log([something])"
	$filesContent = preg_replace ('/console\.log[^\n|;]*(\n|;)?/', '$1', $filesContent);
}
else {
	echo "Keep logs specified, keeping logs\n";
}

if ($options['nominify']) {
	echo "Nominify option used, saving concatenated files\n";

	$packedJS = $filesContent;
}
else {
	echo "Minifying files\n";
	require dirname(__FILE__) . '/jsmin.php';
	$packedJS = JSMin::minify($filesContent);
}

$outputFileName = basename($options['gameFile'], ".html") . '.min.' . pathinfo($options['gameFile'], PATHINFO_EXTENSION);

if ($options['engineOnly']) {
	echo "Saving to " . $options['outputDir'] . '/' . "jsEngine.min.js' (only engine was packed)\n";
	file_put_contents($options['outputDir'] . '/' . 'jsEngine.min.js', $packedJS);
}
else {
	echo "Saving game to game.packed.js\n";
	file_put_contents($options['outputDir'] . '/'. 'game.min.js', $packedJS);

	if (!$options['ignoreHTML']) {
		echo "Saving HTML-file with fixed references to " . $options['outputDir'] . '/' . $outputFileName . "\n\n";
		file_put_contents($options['outputDir'] . '/' . $outputFileName, str_replace($options['engineDir'] . $options['engineFile'], 'game.min.js', $gameFile));
	}
	else {
		echo "Ignoring HTML file\n";
	}
}
?>
