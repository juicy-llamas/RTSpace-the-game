

var Idle_Rotation = ( () => {

	var move_update = function () {

		var rot = this.object.rotation.toVector3().addScaledVector( direction, speed );
		this.object.rotation.setFromVector3( rot );

	}

	function Idle_Rotation( _object, _speed, _direction ) {

		this.object = _object;
		this.speed = _speed * 0.005;
		this.direction = _direction.normalize();
		this.update = move_update;

	}

	return Idle_Rotation;

} )();
