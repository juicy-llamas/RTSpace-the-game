/*

MOTION MECHANICS

*/

const BUFFER_RADIUS = 1.5;

var move_units_to = function ( units, dest ) {

	var largest, slowest, slow_start, c_spd, c_acc, c_t_s, lts;

	units = units.map( u => u.motion_mech );

	largest = units[ 0 ];
	slowest = units[ 0 ];
	slow_start = units[ 0 ];
	lts = units[ 0 ];

	units.forEach( function ( u ) { 

		if ( u.object.radius > largest.object.radius )
			u = largest;
		if ( u.object.speed < slowest.object.speed )
			u = slowest;
		if ( u.object.acceleration < slow_start.object.acceleration )
			u = slow_start;
		if ( u.object.turn_speed < lts.object.turn_speed )
			u = lts;

	} );

	c_spd = slowest.object.root_class.speed;
	c_acc = slow_start.object.root_class.acceleration;
	c_t_s = lts.object.root_class.turn_speed;

	if ( units.every( u => u.center_ship === largest ) ) {

		units[ 0 ].center_ship.set_dest_without_grouping( dest );

	} else {

		units.forEach( u => { u.set_dest( dest, largest, units, c_spd, c_acc, c_t_s ); } );

	}

}

THREE.Vector3.prototype.distanceTo2dSquared = function ( v ) { // I WANT THIS FUNCTION.

	var dx = this.x - v.x, dz = this.z - v.z;

	return dx * dx + dz * dz;

};

THREE.Vector3.prototype.actualFucking2DAngleTo = function ( b, rot ) {

	var x = b.x - this.x;
	var z = b.z - this.z;

	var ret = Math.atan2( x, z ) - rot.y;

	return ( Math.abs( ret ) < Math.PI ) ? ret : ( ret - 2 * Math.PI * Math.sign( ret ) );

}

THREE.Vector3.prototype.actualFucking2DAngleSign = function ( b, rot ) {

	var x = b.x - this.x;
	var z = b.z - this.z;

	return Math.sign( ( z / x ) - Math.tan( rot.y ) );

}
