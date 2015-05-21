var socket = io.connect('192.168.1.3:80');

function Communication( drawings, canvas, maxSize, c, e){

	var cc = c;
	var ce = e;
	var can = canvas;

	var interval = null;

	var refreshing = false;

	var d = drawings;

	//indicates which drawing is printing.
	var index_drawing = 0;

	var penDown = false;

	this.maxSize = maxSize;

	//response than has finished doing the last action.
	socket.on('response', function (data) {
		incrementIndex();
	  	if(data.toString() == 'ready'){
	  		stopInterval();
	  		can.reSize();
		}
	});

	socket.on('start-data', function (data) {
		var d_aux = new PencilDrawing( cc, ce);
		var s_aux = data.split('-');
		for(var i = 1; i < s_aux.length; i++){
			if(s_aux[i] == 'A'){
				drawings.add(d_aux);
				index_drawing++;
				d_aux = new PencilDrawing( cc, ce);
			}else{
				if(s_aux[i] != 'Z'){
					var temp = s_aux[i].split(';');
					//convert mm to px.
					var x = (temp[0] * $('.canvas-container').width()) / maxSize;
					var y = (temp[1] * $('.canvas-container').height()) / maxSize;
					d_aux.add( x, y);
					if(d_aux.canIncrementSended())
						d_aux.incrementSended();
				}
			}
		}
		can.reSize();
	});

	socket.on('users', function(data){
		$('#user').html("Welcome, "+data);
	});
	socket.on('cant-users', function(data){
		$('#cant-users').html(data+" users on");
	});

	function incrementIndex(){
		if(index_drawing > 0){//for saving first drawing.
		  	if(drawings.get(index_drawing).canIncrementSended()){
		  		drawings.get(index_drawing).incrementSended();
		  	}else{
		  		if(index_drawing < drawings.size()){
		  			index_drawing++;
		  		}
		  	}
		}else{
			index_drawing++;
		}
	}

	function startInterval (){
		if(interval === null){
			interval = setInterval( function(){can.reSize()}, 200);
			refreshing = true;
		}
	}

	function stopInterval(){
		if(interval !== null){
			clearInterval(interval);
			interval = null;
			refreshing = false;
		}
	}

	this.incrementIndex = incrementIndex;

	this.start = function(){
		socket.emit('start', 'yes');
	}

	this.send = function( msj, data_x, data_y){
		//if msj a coord then convert to milimeters.
		var data = "";
		if( msj.toString() == "coord"){
	        var x = data_x;
	        var y = data_y;
	        x = (x * this.maxSize) / $('.canvas-container').width();
	        y = (y * this.maxSize) / $('.canvas-container').height();
	        x = Math.floor(x);
	        y = Math.floor(y);
	        data = x+";"+y;
		}
		socket.emit( msj, data);
		if(!refreshing){
			startInterval();
		}
	}

}