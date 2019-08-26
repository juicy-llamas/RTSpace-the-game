
function Environment() { // a wrapper for environment stuff that does not affect gameplay.

	var main_light, skybox;

	main_light = new THREE.HemisphereLight( options.top_color, options.bottom_color, 1 );
	
	this.update_brightness = function ( top_color, bottom_color ) {	//brightness < 0x606060
	
		options.top_color = top_color;
		options.bottom_color = bottom_color;

		main_light.color.set( top_color );
		main_light.groundColor.set( bottom_color );

		// port changes to server

	}

	MAIN_scene.add( main_light );

}
