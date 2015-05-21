function Point2D( x, y){
	this.getX = function(){
		return x;
	}
	this.getY = function(){
		return y;
	}
	this.toString = function(){
		return ("x: "+x+" y: "+y);
	}
}

function Drawing( cc, ce){

	this.coords = new List();

	this.canvas_context = cc;
	this.canvas_element = ce;

	//this properties are for saving the size of
	//the canvas element when it was created.
	this.originalH = ce.height;
	this.originalW = ce.width;

	this.already_sended = 1;

}

Drawing.prototype.allSended = function(){
	this.already_sended = coords.size();
}

//This scales are for applying the transformation when
//resizeing
Drawing.prototype.scaleW = function(){
	return (this.canvas_element.width / this.originalW);
}
Drawing.prototype.scaleH = function(){
	return (this.canvas_element.height / this.originalH);
}

Drawing.prototype.incrementSended = function(){
	this.already_sended++;
}

Drawing.prototype.reset = function(){
	this.already_sended = 1;
	this.coords = new List();
}

Drawing.prototype.canIncrementSended = function(){
	return (this.already_sended < this.coords.size());
}

Drawing.prototype.toString = function(){
	var str = "";
	for( var i = 1; i <= this.coords.size(); i++){
		str += this.coords.get(i).toString();
	}
	return str;
};

Drawing.prototype.add = function( x, y){
	this.coords.add( new Point2D( x, y));
};

function PencilDrawing( cc, ce){

	Drawing.call( this, cc, ce);
};

PencilDrawing.prototype = Object.create(Drawing.prototype);

PencilDrawing.prototype.constructor = PencilDrawing;

PencilDrawing.prototype.draw = function(){
	var sw = this.scaleW();
	var sh = this.scaleH();
	if(!this.coords.isEmpty()){
		this.canvas_context.beginPath();
		this.canvas_context.moveTo( this.coords.get(1).getX()*sw, this.coords.get(1).getY()*sh);
		
		for(var j = 2; j <= this.already_sended; j++){
			this.canvas_context.lineTo( this.coords.get(j).getX()*sw, this.coords.get(j).getY()*sh);
			this.canvas_context.strokeStyle = '#ff0000';
			this.canvas_context.stroke();
		}

		this.canvas_context.closePath();
		this.canvas_context.beginPath();
		this.canvas_context.moveTo( this.coords.get(this.already_sended).getX()*sw, this.coords.get(this.already_sended).getY()*sh);
		for(var i = this.already_sended; i <= this.coords.size(); i++){
			
			this.canvas_context.lineTo( this.coords.get(i).getX()*sw, this.coords.get(i).getY()*sh);
			this.canvas_context.strokeStyle = '#000000';
			this.canvas_context.stroke();
		}

		this.canvas_context.closePath();
		this.canvas_context.drawImage( this.canvas_element, 0, 0);
		
	}
};
/*
function LineDrawing( cc, ce){

	Drawing.call( this, cc, ce);
};

LineDrawing.prototype = Object.create(Drawing.prototype);

LineDrawing.prototype.constructor = LineDrawing;

LineDrawing.prototype.draw = function(){
	var sw = this.scaleW();
	var sh = this.scaleH();
	if(!this.coords.isEmpty()){
		this.canvas_context.beginPath();
		this.canvas_context.moveTo( this.coords.get(1).getX()*sw, this.coords.get(1).getY()*sh);
		this.canvas_context.lineTo( this.coords.get(2).getX()*sw, this.coords.get(2).getY()*sh);
		if(this.already_sended == 2){
			this.canvas_context.strokeStyle = '#ff0000';
		}else{
			this.canvas_context.strokeStyle = '#000000';
		}
		this.canvas_context.stroke();
		this.canvas_context.closePath();
		this.canvas_context.drawImage( this.canvas_element, 0, 0);
	 }

};*/