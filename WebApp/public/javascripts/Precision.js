function Precision( maxSize){

	this.maxSize = maxSize;

	//all in mm.
	var last_x = 0;

	var last_y = 0;

	var radius = 0;

	this.setPrecision = function( value){
		radius = value;
	}

	this.getPrecision = function(){
		return radius;
	}

	//x and y in px.
	this.setLastPoint = function( x, y){
		//convert from px to mm.
        x = (x * this.maxSize) / $('.canvas-container').width();
        y = (y * this.maxSize) / $('.canvas-container').height();
        x = Math.floor(x);
        y = Math.floor(y);
		last_x = x;
		last_y = y;
	}

	this.isOutside = function( x, y){

		//convert from px to mm.
		x = (x * this.maxSize) / $('.canvas-container').width();
        y = (y * this.maxSize) / $('.canvas-container').height();
        x = Math.floor(x);
        y = Math.floor(y);
		//applying pitagoras for knowing if x y is outside de circle with center in last_x last_y
		//and radius radius. 
		var distance = Math.sqrt(Math.pow(last_x - x, 2) + Math.pow(last_y - y, 2));
		radius = $('#pencil-precision').val();
		return (distance > radius);
	}

}