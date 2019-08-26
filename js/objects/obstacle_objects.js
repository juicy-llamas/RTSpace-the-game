


function Square_Obstacle( _origin, _color, _size ) {	

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

	// METHODS:

	

}
