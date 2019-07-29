
/*

GAME OBJECTS

*/

const TOLERANCE = 0.2;			//global constant 
const TOLERANCE2 = TOLERANCE * TOLERANCE;

function Ship( _origin, _color, _rotation, _player ) {

	// this.id = ""; USE THE OBJECT ID

	var scope = this;

	this.player = _player;

	this.object = new THREE.Mesh( new THREE.BoxBufferGeometry( 3, 1, 2 ), new THREE.MeshBasicMaterial() );
	this.object.material.color.setHex( _color );
	this.object.position.copy( _origin );
	this.object.rotation.setFromVector3( _rotation );
	this.object.root_class = this;

	this.radius = Math.sqrt( 3 * 3 + 2 * 2 );

	MAIN_scene.add( this.object );
	game_objects.push( this.object );

	this.max_speed = 30 * 0.1;
	this.max_turn_speed = 20 * 0.05;
	this.max_acceleration = 40 * 0.04;

	this.speed = this.max_speed;
	this.turn_speed = this.max_turn_speed;
	this.acceleration = this.max_acceleration;

	this.motion_mech = new Unit_Motion( this.object );

	this.max_health = 100;
	this.max_shielding = 50;

	this.health = this.max_health;
	this.shielding = this.max_shielding;

	this.event_tracker = function () {

		particles.forEach( function ( part ) {

			if ( part.hit( scope ) ) {

				if ( part.player.status === 1 ) {

					part.destroy();
					part.inflict_damage( scope );

				}

			}

		} );

	}

	//add other child objects/parameters

	this.cannon  = new THREE.Mesh( new THREE.BoxBufferGeometry( 2, 0.5, 0.5 ), new THREE.MeshBasicMaterial() );
	this.cannon.material.color.setHex( _color );
	this.cannon.position.copy( _origin );
	this.cannon.rotation.setFromVector3( _rotation );
	this.object.attach( this.cannon );

	this.cannon_speed = 10;

	this.cannon_mech = new Cannon_Tracking( this.cannon );

	this.part_dmg = 10;
	this.part_type = 0;			// 0 for 'dumb' projectiles, 1 for BEAMS, 2 for tracking projectiles ( like missiles ), 3 for mines
	this.part_id = 0;			// each particle model has an id. the particle model and its behavior are handled separately.
	this.part_vel = 10;

	//position and rotation can be accessed via the object

	//METHODS:

	this.update = function () {

		if ( this.motion_mech.update ) this.motion_mech.update();

	}

}

function Obstacle( _origin, _color, _size ) {	

	this.object = new THREE.Mesh( new THREE.BoxBufferGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial() );
	this.object.material.color.setHex( _color );
	this.object.position.copy( _origin );
	this.object.root_class = this;
	this.object.scale.multiplyScalar( _size );
	this.player = fake_player;
	
	this.radius = _size * Math.sqrt(3) / 2;

	MAIN_scene.add( this.object );
	game_objects.push( this.object );

	this.motion_mech = new Idle_Rotation( this.object, Math.random() * 3, new THREE.Vector3( Math.random(), Math.random(), Math.random() ) );

	//METHODS:

	this.update = function () {

		if ( this.motion_mech.update ) this.motion_mech.update();

	}

}

function Infinite_Grid() {

 	this.plane = new THREE.Plane( THREE.Object3D.DefaultUp );
	this.hellp = new THREE.PlaneHelper( this.plane );

	MAIN_scene.add( this.hellp );

}

