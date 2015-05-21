
var display = false;

$(document).ready(function(){

 	$(".menu-btn").click(function(){
 		if(display){
 			$(".tools").hide();
 			display = false;
 		}else{
 			$(".tools").show();
 			display = true;
 		}
 	})


});