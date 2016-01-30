/* THEME FILES
* This is a theme.json-file, these files are automatically loaded when loading a theme with the loader object.
* theme-files tells the loader which resources to index and preload.
*
* To add a theme resource (an image for instance), simply add it to the below json object
* */

{
	"name":"example",
	"inherit":[],
	"music":{
		"space-music": "ogg mp3"
	},
	"sfx":{
		"donk":"ogg mp3",
		"donk2":"ogg mp3"
	},
	"images":{
		// Images in image root folder
		"character":"png",
		"rock":"png",
		"dot":"png",

		// Images inside a folder
		"folder/star1": "png",
		"folder/star2": "png",
		"folder/star3": "png"
	}
}
