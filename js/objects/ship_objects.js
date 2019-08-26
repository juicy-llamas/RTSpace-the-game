

function Basic_Ship( origin, color, rotation, player ) {	// NOTE: DO NOT use new keyword

	var mesh = new THREE.Mesh( new THREE.BoxBufferGeometry( 3, 1, 2 ), new THREE.MeshBasicMaterial() );
	mesh.material.color.setHex( color );
	mesh.position.copy( origin );
	mesh.rotation.setFromVector3( rotation );
	
	MAIN_scene.add( mesh );
	game_objects.push( mesh );

	var ship = new Ship( player, mesh, Math.sqrt( 3 * 3 + 2 * 2 ) );

	mesh.root_class = ship;
	ship.motion_mech = new Unit_Motion( mesh );

	return ship;

}
