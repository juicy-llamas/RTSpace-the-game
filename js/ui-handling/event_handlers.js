
var EventHandlers = ( () => {	// a wrapper to keep event handler context isolated.

	var click_time = 400;
	var mouse_raycast = new THREE.Raycaster();

	var line_coords = new THREE.Float32BufferAttribute( [ 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1 ], 3 );
	line_coords.dynamic = true;

	var drag_line;
	
	function EventHandlers() {

		this.drag_line_material = new THREE.LineBasicMaterial( { color: 0x6688FF, linewidth: 1 } );
	
		drag_line = new THREE.LineLoop( new THREE.BufferGeometry().addAttribute( 'position', line_coords ), this.drag_line_material);
		drag_line.visible = false;

		MAIN_scene.add( drag_line );

	}
			
	var keymap = {

		"switch": 17,
		"select": THREE.MOUSE.LEFT,
		"action": THREE.MOUSE.RIGHT,
		"orbit": THREE.MOUSE.LEFT,
		"pan": THREE.MOUSE.RIGHT

	};
	
	var event_array = {

		"mousedown": Mmouse_down,
		"mouseup": Mmouse_up,
		"wheel": Mmouse_wheel,
		"context_menu": Mcontext_menu,
		// "click": Mmouse_click,
		// "mouseenter": Mmouse_enter,
		"resize": Mon_window_resize

	};

	var Mmouse_down = function ( event ) {

		// may offer a method to change controls later

		if ( event.ctrlKey ) {

			console.log( "CTRL KEY (ORBIT/PAN)" );
			orbit_controls.onMouseDown( event );

		} else if ( event.button === THREE.MOUSE.LEFT ) {

			drag_action( event );

		}
	
	}

	var Mmouse_up = function ( event ) {

		// may offer a method to change controls later

		if ( orbit_controls.mouseUPPE ) {

			orbit_controls.onMouseUp();

		}

		game_mouse_up( event );

	}

	var Mmouse_wheel = function ( event ) {

		orbit_controls.onMouseWheel( event );

	}

	var Mcontext_menu = function ( event ) {

		event.preventDefault();
		event.stopPropagation();
		
		return false;

	}

	/* var Mmouse_click = function ( event ) {

		event.preventDefault();
		event.stopPropagation();

		return false;

	} */
	
	/*var Mmouse_enter = function ( event ) {

		// for select box

		if ( drag_line.visible && event.button != THREE.MOUSE.LEFT ) {

			drag_line.visible = false;

			WebGL_renderer.domElement.removeEventListener( 'mousemove', drag_on_mouse_move );

		}

	} */

	var Mon_window_resize = function () {
	
		MAIN_camera.aspect = window.innerWidth / window.innerHeight;

		MAIN_camera.updateProjectionMatrix();

		WebGL_renderer.setSize( window.innerWidth, window.innerHeight );

	}

	var did_i_click_on_game_obj = function ( event ) {

		var mouse_coords = new THREE.Vector2( event.clientX / window.innerWidth * 2 - 1, -( event.clientY / window.innerHeight * 2 - 1 ) );

		mouse_raycast.setFromCamera( mouse_coords, MAIN_camera );
	
		var clicked = mouse_raycast.intersectObjects( game_objects );

		if ( clicked.length > 0 ) return clicked;

		return undefined;

	}

	var drag_on_mouse_move = function ( event ) {

		var mouse_coords = new THREE.Vector2( event.clientX / window.innerWidth * 2 - 1, -( event.clientY / window.innerHeight * 2 - 1 ) );
		var vector = new THREE.Vector3();

		mouse_raycast.setFromCamera( mouse_coords, MAIN_camera );

		mouse_raycast.ray.intersectPlane( grid.plane, vector );

		var x = vector.x;
		var y = vector.z;
		var store = line_coords.array;

		store[ 3 ] = x;
		store[ 6 ] = x;
		store[ 8 ] = y;
		store[ 11 ] = y;

		line_coords.needsUpdate = true;

		console.log( drag_line );

	}

	var drag_action = function ( event ) {

		var mouse_coords = new THREE.Vector2( event.clientX / window.innerWidth * 2 - 1, -( event.clientY / window.innerHeight * 2 - 1 ) );
		var vector = new THREE.Vector3();

		mouse_raycast.setFromCamera( mouse_coords, MAIN_camera );

		mouse_raycast.ray.intersectPlane( grid.plane, vector );

		var x = vector.x;
		var y = vector.z;

		WebGL_renderer.domElement.addEventListener( 'mousemove', drag_on_mouse_move );
			console.log( "LEFT BTN (DRAG)" );
		
		var store = line_coords.array;

		store[ 0 ] = x;
		store[ 2 ] = y;
		store[ 3 ] = x;
		store[ 5 ] = y;
		store[ 6 ] = x;
		store[ 8 ] = y;
		store[ 9 ] = x;
		store[ 11 ] = y;

		line_coords.needsUpdate = true;
		drag_line.visible = true;

		//console.log( drag_line );

	}

	var game_mouse_up = function ( event ) {

		if ( orbit_controls.mouseUPPE )  {

			// dont fucking move any ships or select things, but perhaps you can do other mouse up routines...

			orbit_controls.mouseUPPE = false;

			if ( event.button === THREE.MOUSE.LEFT ) console.log( "ORBIT" );
			else if ( event.button === THREE.MOUSE.RIGHT ) console.log( "PAN" );

		} else if ( event.button === THREE.MOUSE.LEFT ) {

			// do the drag shit

			selected = [];

			for ( var i = 0; i < game_objects.length; i ++ ) {

				if ( game_objects[ i ].root_class.player.status === 0 ) {

					var obj = game_objects[ i ].position;
					var arr = line_coords.array;

					if ( obj.x <= Math.max(arr[ 0 ], arr[ 6 ]) && obj.z <= Math.max(arr[ 2 ], arr[ 8 ]) && obj.x >= Math.min(arr[ 0 ], arr[ 6 ]) && obj.z >= Math.min(arr[ 2 ], arr[ 8 ]) ) {

						console.log( "selected" );

						selected.push( game_objects[ i ] );

					}

				}

			}

			console.log( "DRAG" );

			drag_line.visible = false;

			WebGL_renderer.domElement.removeEventListener( 'mousemove', drag_on_mouse_move );

		} else if ( event.button === THREE.MOUSE.RIGHT ) {

			var sel = did_i_click_on_game_obj( event );

			if ( sel ) {

				var select = sel[ 0 ].object;

				switch ( select.root_class.player.status ) {

					case 0:
						console.log( "right clicked on my ship" );
						// see if you can group the units
						// or right click to bring up a dialogue of the unit
						break;

					case 1:
						console.log( "right clicked on an enemy ship" );
						// attack the object
						break;

					case 2:	
						console.log( "right clicked on an allied ship" );
						// do something ...?
						break;

					default:
						console.log( "ERROR: invalid player status" );
						break;

				}

			} else if ( selected[ 0 ] ) {	// if the first element is defined, the array should contain valid entries

				// WHEN U WALKIN

				var destination = new THREE.Vector3();

				mouse_raycast.ray.intersectPlane( grid.plane, destination );

				if ( destination ) move_units_to( selected, destination );

			} else { 

				console.log( "NO U" );

			}

			console.log( "ACTION" );

		}

	}

	EventHandlers.prototype.enable_all = function () {

		window.onresize = Mon_window_resize;
		WebGL_renderer.domElement.addEventListener( "mousedown", Mmouse_down );
		WebGL_renderer.domElement.addEventListener( "mouseup", Mmouse_up );
		WebGL_renderer.domElement.addEventListener( "wheel", Mmouse_wheel );
		// WebGL_renderer.domElement.addEventListener( "mouseenter", Mmouse_enter );
		// WebGL_renderer.domElement.addEventListener( "click", Mmouse_click );
		WebGL_renderer.domElement.addEventListener( "contextmenu", Mcontext_menu );

	}

	EventHandlers.prototype.disable_all = function () {

		window.onresize = null;
		WebGL_renderer.domElement.removeEventListener( "mousedown", Mmouse_down );
		WebGL_renderer.domElement.removeEventListener( "mouseup", Mmouse_up );
		WebGL_renderer.domElement.removeEventListener( "wheel", Mmouse_wheel );
		// WebGL_renderer.domElement.removeEventListener( "mouseenter", Mmouse_enter );
		// WebGL_renderer.domElement.removeEventListener( "click", Mmouse_click );
		WebGL_renderer.domElement.removeEventListener( "contextmenu", Mcontext_menu );

	}

	EventHandlers.prototype.change_keymap = function ( keys ) {

		keymap = JSON.parse( JSON.stringify( keys ) );	//simple way to copy string objects

	}

	EventHandlers.prototype.add_key_function = function ( key, func ) {

	}

	return EventHandlers;

/*

		do i really need this shit??

				\~~~~/
				 \~~/
				  \/

	EventHandlers.prototype.enable_parts = function ( events ) { // events is an array of strings

		for ( var i = 0; i < events.length; i++ ) {

			WebGL_renderer.domElement.addEventListener( events[ i ], event_array[ events[ i ] ] );

		}

	}

	EventHandlers.prototype.disable_parts = function ( events ) { // events is an array of strings

		for ( var i = 0; i < events.length; i++ ) {

			WebGL_renderer.domElement.removeEventListener( events[ i ], event_array[ events[ i ] ] );

		}

	}

	EventHandlers.prototype.enable_part = function ( event ) { // please dont add in recursion

		WebGL_renderer.domElement.addEventListener( event, event_array[ event ] );

	}

	EventHandlers.prototype.disable_part = function ( event ) { // please dont remove in recursion

		WebGL_renderer.domElement.removeEventListener( event, event_array[ event ] );

	}

	EventHandlers.prototype.add_event = function ( event, func ) { // events is an array of strings

		

	}

	EventHandlers.prototype.change_event = function ( event, func ) { // events is an array of strings

		

	}

	EventHandlers.prototype.remove_event = function ( event ) { // events is an array of strings

		

	}

*/

} )();


