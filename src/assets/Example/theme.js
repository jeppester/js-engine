/* THEME FILES
* This is a theme.json-file, these files are automatically loaded when loading a theme with the loader object.
* theme-files tells the loader which resources to index and preload.
*
* To add a theme resource (an image for instance), simply add it to the below json object
* */

{
	"name":"Example",
	"inherit":[],
	"music":{},
	"sfx":{
		"Donk":"wav",
		"Donk2":"wav"
	},
	"images":{
		// Images in image root folder
		"Character":"png",
		"Rock":"png",
		"Dot":"png",

		// Images inside a folder
		"Folder.Star1": "png",
		"Folder.Star2": "png",
		"Folder.Star3": "png"
	}
}
