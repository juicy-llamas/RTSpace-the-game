
function Meshes() {	// container for loading/using pre-defined meshes

	// do any loading stuff here

	// then put them in the array

	var meshes = [ new THREE.Mesh( new THREE.BoxBufferGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial() ), 

		new THREE.Mesh( new THREE.BoxBufferGeometry( 1, 1, 1 ), new THREE.MeshLambertMaterial( {

			color: 0x515151,
			emissive: 0x232323
		
		} ) )

	];
	
	this.get_mesh = function ( mesh ) {

		switch ( typeof( mesh ) ) {
		
			case "number":
				if ( mesh >= meshes.length || mesh < 0 ) { 
					console.log( "ERROR: get_mesh received invalid mesh" );
					return false;
				}
				return meshes[ mesh ];
				break;
			
			case "string":
				for ( var i = 0; i < meshes.length; i++ ) {
					if ( meshes[ i ].name === mesh ) return meshes[ i ];
				}
				console.log( "ERROR: get_mesh received invalid mesh" );
				return false;
				break;
			
			default:
				console.log( "ERROR: get_mesh received invalid mesh" );
				return false;

		}

	}

}
