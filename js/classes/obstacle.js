// DO NOT USE THIS!!!!!!
// use 'obstacle_objects'

var Obstacle = ( () => {

	function Obstacle( _mesh, _radius ) {

		this.object = _mesh;
		this.radius = _radius;

		this.motion_mech = new Idle_Rotation( 
			this.object, 
			Math.random() * 3, 
			new THREE.Vector3( Math.random(), Math.random(), Math.random() ) 
		);

	}

	Obstacle.prototype.update = function () {

		if ( this.motion_mech.update ) this.motion_mech.update.call( this.motion_mech );

	}

	Obstacle.prototype.destroy = function () {



	}

	// add other methods for destruc

} )();


