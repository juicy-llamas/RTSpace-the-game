/*

MOTION MECHANICS

*/

const BUFFER_RADIUS = 1.5;

function Idle_Rotation( _object, _speed, _direction ) {

	this.object = _object;
	var speed = _speed * 0.005;
	var direction = _direction.normalize();

	this.update = function () {

		var rot = this.object.rotation.toVector3().addScaledVector( direction, speed );
		this.object.rotation.setFromVector3( rot );

	}

}

function Unit_Motion ( obje ) {

	this.object = obje;			// root objects
	this.center_ship = undefined;			// 
	this.grouped = false;		// if the object is grouped then we can start moving.
	this.reached = false;
	var units = undefined;
	var scope = this;

	var root = obje.root_class;
	var pos = obje.position;
	var dest = undefined;

	var speed = root.speed;
	var acceleration = root.acceleration;
	var turn_speed = root.turn_speed;

	var cruise_speed;
	var cruise_accel;
	var cruise_turn_speed;

	var current_speed;
	var current_speed_cap;
	var current_accel;
	var current_turn_speed;

	var dist_from_dest_sq;
	var angle_from_dest;
	var angle_dest_sign;

	var action_radius;

	var object_avoiding;
	var angle_object_sign;

	var little_ship_deacc = false;
	var BIG_radius = 0;

	var actualFucking2DAngleTo = function ( a, b, rot ) {

		var x = b.x - a.x;
		var z = b.z - a.z;
		var ret = Math.atan2( x, z ) - rot.y;
		return ( Math.abs( ret ) < Math.PI ) ? ret : ( ret - 2 * Math.PI * Math.sign( ret ) );

	}

	var actualFucking2DAngleSign = function ( a, b, rot ) {

		var x = b.x - a.x;
		var z = b.z - a.z;
		return Math.sign( ( z / x ) - Math.tan( rot.y ) );

	}

	var grouping_func = function () {

		game_objects.forEach( function ( obj ) {	// loop through our objects ( obj is the array value at time of loop )

			// radius of the obj + our turn radius (ish) ( squared later )

			var current_accel_radius = current_speed * current_speed * 2.3 / current_accel;
			var current_accel_radius_sq = current_accel_radius * current_accel_radius;

			var radius_of_obj = obj.root_class.radius + action_radius;
			var radius_of_obj_sq = radius_of_obj * radius_of_obj + current_accel_radius_sq;
			var dist_from_obj_sq = pos.distanceTo2dSquared( obj.position );	// our actual distance from the object ( squared )

			if ( dist_from_obj_sq < radius_of_obj_sq && scope.object !== obj ) {	// if obj is in radius

				var obj_mo = obj.root_class.motion_mech;

				if ( scope.center_ship === obj_mo || obj_mo.reached === true )
					little_ship_deacc = true;
	
				if ( dist_from_obj_sq < ( radius_of_obj_sq - current_accel_radius_sq ) )
					avoid( obj, dist_from_obj_sq );
 
			}

		} );

	}

	var big_check_if_avoiding = function () { // USES ACTUAL GAME OBJ
		
		// check if any objects are in the radius of our holy game object ( that are obviously not us ).

		game_objects.forEach( function ( obj ) {	// loop through our objects ( obj is the array value at time of loop )

			if ( obj.root_class.motion_mech.center_ship === scope ) return;

			var dist_from_obj_sq = pos.distanceTo2dSquared( obj.position );	// our actual distance from the object ( squared )
			var radius_of_obj = obj.root_class.radius + BIG_radius;			

			if ( dist_from_obj_sq < ( radius_of_obj * radius_of_obj ) && scope.object !== obj ) {	// if obj is in radius

				avoid( obj, dist_from_obj_sq );
 
			}

		} );

	}

	var avoid = function ( obj, dist ) {

		if ( object_avoiding !== undefined ) {	// and if we are already avoiding something

			if ( dist < pos.distanceTo2dSquared( object_avoiding ) ) {	// but it isnt closer to us

				if ( obj !== object_avoiding )	// we set the turn for reassignment if it isnt our former obj
					angle_object_sign = undefined;
			
				object_avoiding = obj;	// and mark the obj position for avoiding.

			}	// otherwise, just avoid the same thing

		} else {	// if we weren't already avoiding objects, now we can start.

			object_avoiding = obj;
			angle_object_sign = undefined;

		}

	}

	var avoid_object = function () { // now we actually avoid the object

		// find the angle to the object
		var angle_from_object = actualFucking2DAngleTo( scope.object.position, object_avoiding.position, scope.object.rotation );

		angle_dest_sign = dest ? actualFucking2DAngleSign( scope.object.position, dest, scope.object.rotation ) : 0;
			Math.sign( scope.center_ship.object.rotation.y - scope.object.rotation.y );
	
		if ( angle_object_sign === undefined )	// if we marked the turn direction for resetting
			angle_object_sign = Math.sign( angle_from_object );	// reset it

		// if the abs of the angle is aiming towards the obj ( < math.pi/2 ) and we are in danger of crashing
		if ( Math.abs( angle_from_object ) < Math.PI / 2 ) { 

			// rotate away from obj.
			scope.object.rotation.y -= angle_object_sign * current_turn_speed / Update_FPS * current_speed;

		} else if ( angle_from_dest > TOLERANCE * 0.05 )	// if we are veering off from our dest
			// steer towards destination
			scope.object.rotation.y += angle_dest_sign * current_turn_speed / Update_FPS * current_speed;

		object_avoiding = undefined;	// reset our object to be discovered next loop

	}

	var turn_towards = function () {

		angle_from_dest = actualFucking2DAngleTo( scope.object.position, dest, scope.object.rotation );	//angle in between
		return turn( current_speed );
		
	}

	var turn_with_ship = function () {

		angle_from_dest = scope.center_ship.object.rotation.y - scope.object.rotation.y;	//angle from ship
		return turn( current_speed === 0 ? 1 : current_speed );
		
	}

	var turn = function ( speed ) {

		angle_dest_sign = Math.sign( angle_from_dest );
		angle_from_dest = Math.abs( angle_from_dest );

		if ( angle_from_dest > TOLERANCE * 0.2 ) {	// if the abs of the difference in angles is greater than a set tolerance

			//rotate it!
			scope.object.rotation.y += angle_dest_sign * current_turn_speed / Update_FPS * speed;
			return true;

		}

		return false;

	}

	var accelerate_towards = function () {

		dist_from_dest_sq = pos.distanceTo2dSquared( dest );	// check our distance

		var current_accel_radius = current_speed * current_speed * 1.5 / current_accel;
		var current_accel_radius_sq = current_accel_radius * current_accel_radius;

		scope.reached = dist_from_dest_sq <= current_accel_radius_sq || scope.reached;

		return accelerate( scope.reached );

	}

	var accelerate_towards_ship = function () {

		return accelerate( little_ship_deacc );
	
	}

	var accelerate_with_ship = function () {

		return accelerate( scope.center_ship.reached );

	}

	var accelerate = function ( condition ) {

		if ( condition ) {		// if our big ship is slow down / we are da ship and we gettin close to dest

			if ( current_speed > 0 ) 				// and if we still have da speed
				// deaccelerate
				current_speed -= current_accel / Update_FPS;

			else {

				current_speed = 0;					// if we no have da speed, we just stop
				return true;

			}
	
		} else if ( current_speed < current_speed_cap ) {

			current_speed += current_accel / Update_FPS;

		}

		// do the translation
		scope.object.translateOnAxis( scope.object.rotation, current_speed / Update_FPS);
		scope.object.position.y = 0;		// normalize the y coord

		return false;

	}

	var update1 = function () {	// for ships moving towards the cruise ship

		if ( dest !== undefined ) {	// if we are still moving

			grouping_func();	// are we avoiding objects

			if ( object_avoiding )
				avoid_object();
			else
				turn_towards();

			if ( accelerate_towards_ship() ) dest = undefined;	// then we move

		} else if ( turn_with_ship() === true ) {	// if we are still turning

			scope.reached = true;
			return;

		} else {	// if we are done with everything

			console.log( "LITTLE SHIP GROUPED" );
			scope.grouped = true;	// motion finished
			scope.update = update4;
			return;
			
		}

	}

	var update2 = function () {	// big ship wait

		if ( units.every( obj => obj.grouped === true || obj === scope ) ) {	// MOTION MECH OBJ

			var c;

			console.log( "BIG SHIP GROUPED" );

			current_accel = cruise_accel;
			current_speed_cap = cruise_speed;
			current_turn_speed = cruise_turn_speed;
			
			action_radius = 2 / current_turn_speed + BUFFER_RADIUS + root.radius;

			units.forEach( obj => {
				
				var radius_of_obj = obj.object.position.distanceTo2dSquared( scope.object.position );

				if ( radius_of_obj > BIG_radius * BIG_radius ) {
				
					BIG_radius = radius_of_obj;
					c = obj.object.root_class.radius;

				}

			} );

			if ( BIG_radius === 0 )
				BIG_radius = action_radius;
			else
				BIG_radius = Math.sqrt( BIG_radius ) + c + action_radius;

			scope.grouped = true;
			scope.reached = false;
			scope.update = update3;
			return;

		}

	}

	var update3 = function () {	// big ship motion

		dist_from_dest_sq = pos.distanceTo2dSquared( dest );

		big_check_if_avoiding();

		if ( object_avoiding )
			avoid_object();
		else 
			turn_towards();
		
		if ( accelerate_towards() ) {

			console.log( "BIG SHIP STOPP'E" );
			scope.update = null;
			dest = undefined;
			scope.center_ship = undefined;
			return;

		}

	}

	var update4 = function () {	// when small ships are waiting for others

		if ( scope.center_ship.grouped == true ) {

			current_accel = cruise_accel;
			current_speed_cap = cruise_speed;
			current_turn_speed = cruise_turn_speed;

			action_radius = 2 / current_turn_speed + BUFFER_RADIUS + root.radius;

			scope.update = update5;
			return;

		}

	}

	var update5 = function () {	// flock motion for small ships

		/*check_if_avoiding();

		if ( object_avoiding )
			avoid_object();
		else
			turn_with_ship();*/

		scope.object.rotation.y = scope.center_ship.object.rotation.y;	// just a direct assignment

		if ( accelerate_with_ship() ) {

			console.log( "LITTLE SHIP STOPP'E" );
			scope.update = null;
			scope.center_ship = undefined;
			return;

		}

	}

	var update6 = function () {	// so ships _completely_ stop before moving forward

		big_check_if_avoiding();

		if ( object_avoiding )
			avoid_object();

		if ( accelerate( true ) ) {	//always deaccelerating

			BIG_radius = 0;

			current_accel = acceleration;
			current_speed_cap = speed;
			current_turn_speed = turn_speed;

			action_radius = 2 / current_turn_speed + BUFFER_RADIUS + root.radius;

			if ( scope.center_ship === scope )
				scope.update = update2;
			else
				scope.update = update1;
			
		}

	}

	this.set_dest = function ( _dest, _cruise_ship, _units, c_spd, c_acc, c_t_s ) {
	
		scope.center_ship = _cruise_ship;

		scope.grouped = false;
		scope.reached = false;
		little_ship_deacc = false;
		object_avoiding = undefined;

		current_accel = current_accel ? current_accel : acceleration;
		current_speed_cap = current_speed_cap ? current_speed_cap : speed;
		current_turn_speed = current_turn_speed ? current_turn_speed : turn_speed;

		BIG_radius = 2 / current_turn_speed + BUFFER_RADIUS + root.radius;;

		cruise_speed = c_spd;
		cruise_accel = c_acc;
		cruise_turn_speed = c_t_s;

		if ( _cruise_ship === scope ) {

			dest = _dest;
			units = _units;

		} else {

			dest = _cruise_ship.object.position;

		}

		scope.update = update6;

	}

	// we assume the ships are already grouped if they are in the same group as before
	this.set_dest_without_grouping = ( _dest ) => { dest = _dest; }

	this.update = undefined;

	this.set_stats = function ( _speed, _acceleration, _turn_speed ) {

		turn_speed = root.turn_speed;
		acceleration = root.acceleration;
		speed = root.speed;

	}

}

var move_units_to = function ( units, dest ) {

	var largest, slowest, slow_start, c_spd, c_acc, c_t_s, lts;

	units = units.map( u => u.root_class.motion_mech );

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
