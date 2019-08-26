const TOLERANCE = 0.07;

var Unit_Motion = ( () => {

	function Unit_Motion ( obje ) {

		this.object = obje;			// root objects
		obje.motion_mech = this;

		this.center_ship = undefined;			// 
		this.grouped = false;		// if the object is grouped then we can start moving.
		this.reached = false;
		this.units = undefined;

		this.root = obje.root_class;
		this.pos = obje.position;
		this.dest = undefined;

		this.speed = obje.root_class.statistics[ 4 ];	// CHANGE THESE FUCKING NUMBERS!!!!!! THEY AER THE MAX
		this.acceleration = obje.root_class.statistics[ 5 ];
		this.turn_speed = obje.root_class.statistics[ 6 ];

		this.cruise_speed;
		this.cruise_accel;
		this.cruise_turn_speed;

		this.current_speed;
		this.current_speed_cap;
		this.current_accel;
		this.current_turn_speed;

		this.dist_from_dest_sq;
		this.angle_from_dest;
		this.angle_dest_sign;

		this.action_radius;

		this.object_avoiding;
		this.angle_object_sign;

		this.little_ship_deacc = false;
		this.BIG_radius = 0;

		this.update = undefined;

	}	

	var grouping_func = function () {

		var scope = this;

		game_objects.forEach( function ( obj ) {	// loop through our objects ( obj is the array value at time of loop )

			// radius of the obj + our turn radius (ish) ( squared later )

			var current_accel_radius = scope.current_speed * scope.current_speed * 2.3 / scope.current_accel;
			var current_accel_radius_sq = current_accel_radius * current_accel_radius;

			var radius_of_obj = obj.root_class.radius + scope.action_radius;
			var radius_of_obj_sq = radius_of_obj * radius_of_obj + current_accel_radius_sq;
			var dist_from_obj_sq = scope.pos.distanceTo2dSquared( obj.position );	// our actual distance from the object ( squared )

			if ( dist_from_obj_sq < radius_of_obj_sq && scope.object !== obj ) {	// if obj is in radius

				var obj_mo = obj.motion_mech;

				if ( scope.center_ship === obj_mo || obj_mo.reached === true )
					scope.little_ship_deacc = true;
	
				if ( dist_from_obj_sq < ( radius_of_obj_sq - current_accel_radius_sq ) )
					avoid.call( scope, obj, dist_from_obj_sq );
 
			}

		} );

	}

	var big_check_if_avoiding = function () { // USES ACTUAL GAME OBJ
		
		var scope = this;

		// check if any objects are in the radius of our holy game object ( that are obviously not us ).

		game_objects.forEach( function ( obj ) {	// loop through our objects ( obj is the array value at time of loop )

			if ( obj.motion_mech.center_ship === scope ) return;

			var dist_from_obj_sq = scope.pos.distanceTo2dSquared( obj.position );	// our actual distance from the object ( squared )
			var radius_of_obj = obj.root_class.radius + scope.BIG_radius;			

			if ( dist_from_obj_sq < ( radius_of_obj * radius_of_obj ) && scope.object !== obj ) {	// if obj is in radius

				avoid.call( this, obj, dist_from_obj_sq );
 
			}

		} );

	}

	var avoid = function ( obj, dist ) {

		if ( this.object_avoiding !== undefined ) {	// and if we are already avoiding something

			if ( dist < this.pos.distanceTo2dSquared( this.object_avoiding ) ) {	// but it isnt closer to us

				if ( obj !== this.object_avoiding )	// we set the turn for reassignment if it isnt our former obj
					this.angle_object_sign = undefined;
			
				this.object_avoiding = obj;	// and mark the obj position for avoiding.

			}	// otherwise, just avoid the same thing

		} else {	// if we weren't already avoiding objects, now we can start.

			this.object_avoiding = obj;
			this.angle_object_sign = undefined;

		}

	}

	var avoid_object = function () { // now we actually avoid the object

		// find the angle to the object
		var angle_from_object = this.object.position.actualFucking2DAngleTo( this.object_avoiding.position, this.object.rotation );

		this.angle_dest_sign = this.dest ? this.object.position.actualFucking2DAngleSign( this.dest, this.object.rotation ) : 0;
			Math.sign( this.center_ship.object.rotation.y - this.object.rotation.y );
	
		if ( this.angle_object_sign === undefined )	// if we marked the turn direction for resetting
			this.angle_object_sign = Math.sign( angle_from_object );	// reset it

		// if the abs of the angle is aiming towards the obj ( < math.pi/2 ) and we are in danger of crashing
		if ( Math.abs( angle_from_object ) < Math.PI / 2 ) { 

			// rotate away from obj.
			this.object.rotation.y -= this.angle_object_sign * this.current_turn_speed / Update_FPS * this.current_speed;

		} else if ( this.angle_from_dest > TOLERANCE )	// if we are veering off from our this.dest
			// steer towards destination
			this.object.rotation.y += this.angle_dest_sign * this.current_turn_speed / Update_FPS * this.current_speed;

		this.object_avoiding = undefined;	// reset our object to be discovered next loop

	}

	var turn_towards = function () {

		this.angle_from_dest = this.object.position.actualFucking2DAngleTo( this.dest, this.object.rotation );	//angle in between
		return turn.call( this, this.current_speed );
		
	}

	var turn_with_ship = function () {

		this.angle_from_dest = this.center_ship.object.rotation.y - this.object.rotation.y;	//angle from ship
		return turn.call( this, this.current_speed === 0 ? 1 : this.current_speed );
		
	}

	var turn = function ( speed ) {

		this.angle_dest_sign = Math.sign( this.angle_from_dest );
		this.angle_from_dest = Math.abs( this.angle_from_dest );

		if ( this.angle_from_dest > TOLERANCE ) {	// if the abs of the difference in angles is greater than a set tolerance

			//rotate it!
			this.object.rotation.y += this.angle_dest_sign * this.current_turn_speed / Update_FPS * speed;
			return true;

		}

		return false;

	}

	var accelerate_towards = function () {

		this.dist_from_dest_sq = this.pos.distanceTo2dSquared( this.dest );	// check our distance

		var current_accel_radius = this.current_speed * this.current_speed * 1.5 / this.current_accel;
		var current_accel_radius_sq = current_accel_radius * current_accel_radius;

		this.reached = this.dist_from_dest_sq <= current_accel_radius_sq || this.reached;

		return accelerate.call( this, this.reached );

	}

	var accelerate_towards_ship = function () {

		return accelerate.call( this, this.little_ship_deacc );
	
	}

	var accelerate_with_ship = function () {

		return accelerate.call( this, this.center_ship.reached );

	}

	var accelerate = function ( condition ) {

		if ( condition ) {		// if our big ship is slow down / we are da ship and we gettin close to dest

			if ( this.current_speed > 0 ) 				// and if we still have da speed
				// deaccelerate
				this.current_speed -= this.current_accel / Update_FPS;

			else {

				this.current_speed = 0;					// if we no have da speed, we just stop
				return true;

			}
	
		} else if ( this.current_speed < this.current_speed_cap ) {

			this.current_speed += this.current_accel / Update_FPS;

		}

		// do the translation
		this.object.translateOnAxis( this.object.rotation, this.current_speed / Update_FPS);
		this.object.position.y = 0;		// normalize the y coord

		return false;

	}

	var update1 = function () {	// for ships moving towards the cruise ship

		if ( this.dest !== undefined ) {	// if we are still moving

			grouping_func.call( this );	// are we avoiding objects

			if ( this.object_avoiding )
				avoid_object.call( this );
			else
				turn_towards.call( this );

			if ( accelerate_towards_ship.call( this ) ) this.dest = undefined;	// then we move

		} else if ( turn_with_ship.call( this ) === true ) {	// if we are still turning

			this.reached = true;
			return;

		} else {	// if we are done with everything

			console.log( "LITTLE SHIP GROUPED" );
			this.grouped = true;	// motion finished
			this.update = update4;
			return;
			
		}

	}

	var update2 = function () {	// big ship wait

		var scope = this;

		if ( scope.units.every( obj => obj.grouped === true || obj === scope ) ) {	// MOTION MECH OBJ

			var c;

			console.log( "BIG SHIP GROUPED" );

			scope.current_accel = scope.cruise_accel;
			scope.current_speed_cap = scope.cruise_speed;
			scope.current_turn_speed = scope.cruise_turn_speed;
			
			scope.action_radius = 2 / scope.current_turn_speed + BUFFER_RADIUS + scope.root.radius;

			scope.units.forEach( obj => {
				
				var radius_of_obj = obj.object.position.distanceTo2dSquared( scope.object.position );

				if ( radius_of_obj > scope.BIG_radius * scope.BIG_radius ) {
				
					scope.BIG_radius = radius_of_obj;
					c = obj.object.root_class.radius;

				}

			} );

			if ( scope.BIG_radius === 0 )
				scope.BIG_radius = scope.action_radius;
			else
				scope.BIG_radius = Math.sqrt( scope.BIG_radius ) + c + scope.action_radius;

			scope.grouped = true;
			scope.reached = false;
			scope.update = update3;
			return;

		}

	}

	var update3 = function () {	// big ship motion

		this.dist_from_dest_sq = this.pos.distanceTo2dSquared( this.dest );

		big_check_if_avoiding.call( this );

		if ( this.object_avoiding )
			avoid_object.call( this );
		else 
			turn_towards.call( this );
		
		if ( accelerate_towards.call( this ) ) {

			console.log( "BIG SHIP STOPP'E" );
			this.update = null;
			this.dest = undefined;
			this.center_ship = undefined;
			return;

		}

	}

	var update4 = function () {	// when small ships are waiting for others

		if ( this.center_ship.grouped == true ) {

			this.current_accel = this.cruise_accel;
			this.current_speed_cap = this.cruise_speed;
			this.current_turn_speed = this.cruise_turn_speed;

			this.action_radius = 2 / this.current_turn_speed + BUFFER_RADIUS + this.root.radius;

			this.update = update5;
			return;

		}

	}

	var update5 = function () {	// flock motion for small ships

		this.object.rotation.y = this.center_ship.object.rotation.y;	// just a direct assignment

		if ( accelerate_with_ship.call( this ) ) {

			console.log( "LITTLE SHIP STOPP'E" );
			this.update = null;
			this.center_ship = undefined;
			return;

		}

	}

	var update6 = function () {	// so ships _completely_ stop before moving forward

		big_check_if_avoiding.call( this );

		if ( this.object_avoiding )
			avoid_object.call( this );

		if ( accelerate.call( this, true ) ) {	// always deaccelerating

			this.BIG_radius = 0;

			this.current_accel = this.acceleration;
			this.current_speed_cap = this.speed;
			this.current_turn_speed = this.turn_speed;

			this.action_radius = 2 / this.current_turn_speed + BUFFER_RADIUS + this.root.radius;

			if ( this.center_ship === this )
				this.update = update2;
			else
				this.update = update1;
			
		}

	}

	Unit_Motion.prototype.set_dest = function ( _dest, _cruise_ship, _units, c_spd, c_acc, c_t_s ) {
	
		this.center_ship = _cruise_ship;

		this.grouped = false;
		this.reached = false;
		this.little_ship_deacc = false;
		this.object_avoiding = undefined;

		this.current_accel = this.current_accel ? this.current_accel : this.acceleration;
		this.current_speed_cap = this.current_speed_cap ? this.current_speed_cap : this.speed;
		this.current_turn_speed = this.current_turn_speed ? this.current_turn_speed : this.turn_speed;

		this.BIG_radius = 2 / this.current_turn_speed + BUFFER_RADIUS + this.root.radius;;

		this.cruise_speed = c_spd;
		this.cruise_accel = c_acc;
		this.cruise_turn_speed = c_t_s;

		if ( _cruise_ship === this ) {

			this.dest = _dest;
			this.units = _units;

		} else {

			this.dest = _cruise_ship.object.position;

		}

		this.update = update6;

	}

	// we assume the ships are already grouped if they are in the same group as before
	Unit_Motion.prototype.set_dest_without_grouping = ( _dest ) => { this.dest = _dest; }

	Unit_Motion.prototype.set_stats = function () {

		this.turn_speed = this.root.turn_speed;
		this.acceleration = this.root.acceleration;
		this.speed = this.root.speed;

	}

	return Unit_Motion;

} )();
