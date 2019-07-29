
// ALL GLOBALS GO HERE!

var MAIN_scene, MAIN_camera, WebGL_renderer, orbit_controls, 

	environment, grid, game_objects = [], selected = [], LOOPEE,

	options, event_handlers, meshes, particles = [];

const Update_In_Milliseconds = 25;
const Update_FPS = 40;

var players = [ {	// this will contain live player data and be updated

	name: "ME",
	color: 0x00ff00,
	status: 0	// status: 0 means you, 1 means an enemy, and 2 means teammates.
				// the only way this is changed is through the server class. if
				// shit is changed not through the server class, then it will
				// know. even if you can also change the flag in the update
				// functions, the server will still update. if you have an
				// invalid data array, you may be kicked or warned. we shall just
				// see what. . .

}, {

	name: "ENEMY",
	color: 0xff0000,
	status: 1

} ];

var fake_player = {

	name: "ye",
	color: 0,
	status: undefined

};

var options = {

	bottom_color: 0x202020,
	top_color: 0xA0A0A0

};

function Animate() {

	var clock;
	var clock2;
	var FPS = NaN;
	
	this.start = function () {
		
		clock = performance.now();
		clock2 = performance.now();
		animate();
		fixed_update();
		
	}

	var animate = function () {

		orbit_controls.update();

		WebGL_renderer.render( MAIN_scene, MAIN_camera );

		clock = performance.now() - clock;
		FPS = 1000 / clock;
		clock = performance.now();
	
		requestAnimationFrame( animate );
	
	}

	var fixed_update = function () {

		for ( var i = 0; i < game_objects.length; i++ ) 
			game_objects[ i ].root_class.update();		

		var diff = performance.now() - clock2 - Update_In_Milliseconds;
		clock2 = performance.now();

		window.setTimeout( fixed_update, Update_In_Milliseconds - diff );
	
	}

	var print = function () { 
			
		console.log( "FPS: " + FPS ); 
		console.log( "Clock: " + clock ); 

	}

	this.getFps = () => FPS;
	this.stopPrint = () => clearInterval( print );
	this.startPrint = () => setInterval( print, 700 );

}

var set_up_camera = function () {
	
	MAIN_camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

	MAIN_camera.position.y = 20;

	orbit_controls = new THREE.OrbitControls( MAIN_camera );

	orbit_controls.minDistance = 4;
	orbit_controls.panSpeed = 0.5;
	orbit_controls.rotateSpeed = 0.1;
	orbit_controls.enableDamping = true;
	orbit_controls.dampingFactor = 0.15;
	orbit_controls.keyPanSpeed = 4;
	
	MAIN_camera.rotation.set( 0, 0, 0 );
	orbit_controls.update();

}

var set_up_context = function () {

	WebGL_renderer = new THREE.WebGLRenderer();

	WebGL_renderer.setPixelRatio( window.devicePixelRatio );
	WebGL_renderer.setSize( window.innerWidth, window.innerHeight );	

	document.body.appendChild( WebGL_renderer.domElement );

	MAIN_scene = new THREE.Scene();	

	environment = new Environment();

	grid = new Infinite_Grid( MAIN_scene );

	mouse_raycast = new THREE.Raycaster();

}

var check_compatability = function () {

	if ( WEBGL.isWebGLAvailable() === false )
		return [ "Your browser has a WebGL issue.", WEBGL.getWebGLErrorMessage() ];
	
	try {

		() => {};
		

	} catch ( error ) {

		return [ "Your browser's javascript standard does not support necessary functions.", error ];

	}

}

var init = function () {

	var err = check_compatability();

	if ( err ) {

		document.body.add( err[ 0 ] + " Check the console for details." );
		console.log( err[ 1 ] );
	
	}

	set_up_context();
	set_up_camera();
	
	event_handlers = new EventHandlers();
	event_handlers.enable_all();

	meshes = new Meshes();

	for ( var i = -6; i <= 6; i++ ) {
		for ( var k = -6; k <= 6; k++ ) {
			if ( i === 0 && k === 0 ) continue;
			var CUBEY = new Ship( new THREE.Vector3( i*24, 0, k*24 ), 0x00ff00, new THREE.Vector3( 0, 0, Math.PI ), players[ 0 ] );
		}
	}// var CUBEY = new Ship( new THREE.Vector3( 4, 0, 4 ), 0x00ff00, new THREE.Vector3( 0, 0, Math.PI ), players[ 0 ] );

	/*var OBJ = new Obstacle( new THREE.Vector3( 25, 0, 22 ), 0xff00ff, 20 );
	console.log( OBJ.object.uuid );
	OBJ = new Obstacle( new THREE.Vector3( 31, 0, 28 ), 0xff00ff, 1 );
	console.log( OBJ.object.uuid );
	OBJ = new Obstacle( new THREE.Vector3( 37, 0, 22 ), 0xff00ff, 1 );
	console.log( OBJ.object.uuid );
	OBJ = new Obstacle( new THREE.Vector3( 43, 0, 28 ), 0xff00ff, 1 );
	console.log( OBJ.object.uuid );*/

	LOOPEE = new Animate();
	LOOPEE.start();

}

document.addEventListener( "DOMContentLoaded", init );

