// DO NOT USE THIS!!!!!!
// use 'ship_objects'

var Ship = ( function () {

	function Ship( _player, _mesh, _radius ) {

		this.player = _player;
		this.object = _mesh;
		this.radius = _radius;

		this.statistics = [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ];
		this.peripherals = {};

	}

	/*

	  NOTE: The word 'max' means at the PEAK of the ship's functioning capacity, aka NO DAMAGE AT ALL.
			In reality, the max stat is multiplied by a set of fractions, each weighted in particular 
			to the item being used. Stats factored into this include the total overall integrity percent, 
			the ship durability precent, durability/integrity percents of peripherals affected ( perphs
			can also have a 'functionality' float, which can be reduced if the enemy has a perph that
			intends to reduce the functionality. Example could be a signal clouder that can reduce or 
			disable various sensors, or a hacking mechanism ), and other factors, such as your
			environment.

	  +~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~STATS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~+
	  | index 0 is max total hull integrity	points.						|
	  |	index 1 is max hull durability, like how much each hit hurts	|
	  |	index 2 is integrity fraction. 									|
	  |	index 3 is durability fraction.									|
	  +----------------------------MOVEMENT-----------------------------+
	  | index 4 is max speed. Pretty simple.							|
	  | index 5 is max acceleration.									|
	  | index 6 is max turn speed.										|
	  | index 7 is max fuel efficiency. Yes, ships use fucking fuel.	|
	  +-----------------------------SENSOR------------------------------+
	  | index 8 is max detection radius. This IS intrinsic to ships.	|
	  +---------------------------ELECTRONICS---------------------------+
	  | index 9 is max electric power. This affects electronic perphs.	|
	  | index 10 is max electric conductivity. Again affects electronics|
	  |																	|
	  +~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~+

	 */

	Ship.prototype.reset_stats = new_stats => { this.statistics = new_stats; }
	Ship.prototype.attach = object => { this.peripherals[ object.keAY ] = object; }
	Ship.prototype.detach = object => { this.peripherals[ object.keAY ] = undefined; }

	Ship.prototype.update = function () {

		if ( this.motion_mech.update ) this.motion_mech.update.call( this.motion_mech );

	}

	Ship.prototype.destroy = function () {	// note: this removes the OBJECT INSTANTLY

		

	}

	return Ship;

} )();
