
// The active tool instance.
var tool;
var tool_default = 'pencil';
var tools;
var drawings;
var comm;
var precision;

var maxSize = 200; //mm.

$(document).ready(function () {
   
   var canvas = new Canvas();
   canvas.setSize();
   canvas.initTools();
   //window.onresize = canvas.reSize;
   window.onresize = canvas.reSize;
   canvas.setSize();
   //window.setInterval( function() {canvas.reSize()}, 200);
});

function Canvas(){
   //DOM element.
   var canvas_element = document.getElementById('imageView');
   //The canvas context is an object with properties and 
   //methods that you can use to render graphics inside the canvas element.
   var canvas_context = canvas_element.getContext('2d');

   //Aux canvas element for displaying
   var ce_aux = document.createElement('canvas');
   //Aux canvas context
   var cc_aux = ce_aux.getContext('2d');

   //Object with the implementation of each drawing tool.
   var tools = loadTools(cc_aux, ce_aux, canvas_context, canvas_element);

   canvas_element.parentNode.appendChild(ce_aux);
   ce_aux.id = 'imageTemp';

   //list of drawings for repainting.
   drawings = new List();

   //Object for doing the socket communication
   comm = new Communication( drawings, this, maxSize, canvas_context, canvas_element);
   comm.start();

   precision = new Precision( maxSize);

   this.setSize = setSize;
   
   function setSize(){
      var w = $(window).width();
      var h = $(window).height() * 0.8;
      if( w < h){
         h = w;
      }
      else{
         w = h;
      }
      canvas_element.width  = w;
      canvas_element.height = h;
      ce_aux.width  = w;
      ce_aux.height = h;
      $(".canvas-container").height(h);
      $("#content").height(h);
      $(".canvas-container").width(w);
      $(".tools").width(w);
   }
   this.reSize = function(){
      setSize();
      for(var i = 1; i <= drawings.size(); i++){
         drawings.get(i).draw();
      }
   }

   this.initTools = function(){
      // Get the tool select input.
      //var tool_select = $('#dtool')[0];
      //tool_select.addEventListener('change', ev_tool_change, false);

      tool = new tools[tool_default]();

      $("#pencil").click(function(){
         tool = new tools['pencil']();
         $(".precision").show();
      });
      $("#line").click(function(){
         tool = new tools['line']();
         $(".precision").hide();
      });
      $("#rect").click(function(){
         tool = new tools['rect']();
         $(".precision").hide();
      });

      // Attach the mousedown, mousemove and mouseup event listeners.
      ce_aux.addEventListener('mousedown', ev_canvas, false);
      ce_aux.addEventListener('mousemove', ev_canvas, false);
      ce_aux.addEventListener('mouseup',   ev_canvas, false);
   
      ce_aux.addEventListener("touchstart", touchHandler, true);
      ce_aux.addEventListener("touchmove", touchHandler, true);
      ce_aux.addEventListener("touchend", touchHandler, true);
   }

   // The general-purpose event handler. This function just determines the mouse 
   // position relative to the canvas element.
   function ev_canvas (ev) {

      if (ev.layerX || ev.layerX == 0) { // Firefox
         ev._x = ev.layerX;
         ev._y = ev.layerY;
      } else{
         if (ev.offsetX || ev.offsetX == 0) { // Opera
            ev._x = ev.offsetX;
            ev._y = ev.offsetY;
         }
      }

      // Call the event handler of the tool.
      var func = tool[ev.type];
      if (func) {
         func(ev);
      }
   }
   
}

function loadTools( cc_aux, ce_aux, canvas_context, canvas_element){
   // This object holds the implementation of each drawing tool.
   var tools = {};
   var drawing;

   // The drawinging pencil.
   tools.pencil = function () {
      var tool = this;
      this.started = false;

      // This is called when you start holding down the mouse button.
      // This starts the pencil drawing.
      this.mousedown = function (ev) {
         drawing = new PencilDrawing( canvas_context, canvas_element);
         drawings.add( drawing);
         cc_aux.beginPath();
         cc_aux.moveTo(ev._x, ev._y);
         comm.send('coord', ev._x, ev._y);
         precision.setLastPoint(ev._x, ev._y);
         comm.send('pendown');
         drawing.add( ev._x, ev._y);
         tool.started = true;
      };

      // This function is called every time you move the mouse. Obviously, it only 
      // drawings if the tool.started state is set to true (when you are holding down 
      // the mouse button).
      this.mousemove = function (ev) {
         if (tool.started) {
            cc_aux.lineTo(ev._x, ev._y);
            cc_aux.stroke();
            if(precision.isOutside(ev._x, ev._y)){
               comm.send('coord', ev._x, ev._y);
               precision.setLastPoint(ev._x, ev._y);
               drawing.add( ev._x, ev._y);
            }
         }
      };

      // This is called when you release the mouse button.
      this.mouseup = function (ev) {
         if (tool.started) {
            tool.mousemove(ev);
            comm.send('penup');
            tool.started = false;
            img_update();
         }
      };
   };

   // The rectangle tool.
   tools.rect = function () {
      var tool = this;
      this.started = false;

      var temp_x1;
      var temp_y1

      this.mousedown = function (ev) {
         tool.started = true;
         tool.x0 = ev._x;
         tool.y0 = ev._y;
      };

      this.mousemove = function (ev) {
         if (!tool.started) {
            return;
         }

         var x = Math.min(ev._x, tool.x0),
         y = Math.min(ev._y, tool.y0),
         w = Math.abs(ev._x - tool.x0),
         h = Math.abs(ev._y - tool.y0);

         cc_aux.clearRect(0, 0, ce_aux.width, ce_aux.height);

         if (!w || !h) {
            return;
         }

         cc_aux.strokeRect(x, y, w, h);
         temp_x1 = ev._x;
         temp_y1 = ev._y;
      };

      this.mouseup = function (ev) {
         if (tool.started) {
            tool.mousemove(ev);
            drawing = new PencilDrawing( canvas_context, canvas_element);
            comm.send('coord',  tool.x0, tool.y0);
            comm.send('pendown');
            drawing.add( tool.x0, tool.y0);
            comm.send('coord',  temp_x1, tool.y0);
            drawing.add( temp_x1, tool.y0);
            comm.send('coord',  temp_x1, temp_y1);
            drawing.add( temp_x1, temp_y1);
            comm.send('coord',  tool.x0, temp_y1);
            drawing.add( tool.x0, temp_y1);
            comm.send('coord',  tool.x0, tool.y0);
            drawing.add( tool.x0, tool.y0);
            comm.send('penup');
            drawings.add( drawing);
            tool.started = false;
            img_update();
         }
      };
   };

   // The line tool.
   tools.line = function () {
      var tool = this;
      this.started = false;

      //this vars for getting the last point of the line,
      //so in the coord list im going to have only 2 coords
      //for a line
      var temp_x;
      var temp_y;

      this.mousedown = function (ev) {
         tool.started = true;
         tool.x0 = ev._x;
         tool.y0 = ev._y;
      };

      this.mousemove = function (ev) {
         if (!tool.started) {
            return;
         }
         cc_aux.clearRect(0, 0, ce_aux.width, ce_aux.height);
         cc_aux.beginPath();
         cc_aux.moveTo(tool.x0, tool.y0);
         cc_aux.lineTo(ev._x,   ev._y);
         temp_x = ev._x;
         temp_y = ev._y;
         cc_aux.stroke();
         cc_aux.closePath();
      };

      this.mouseup = function (ev) {
         if (tool.started) {
            drawing = new PencilDrawing( canvas_context, canvas_element);
            drawings.add( drawing);
            tool.mousemove(ev);
            tool.started = false;
            comm.send('coord',  tool.x0, tool.y0);
            drawing.add( tool.x0, tool.y0);
            comm.send('pendown');
            comm.send('coord',  temp_x, temp_y);
            drawing.add( temp_x, temp_y);
            comm.send('penup');
            img_update();
         }
      };
   };

   // This function drawings the #imageTemp canvas on top of #imageView, after which 
   // #imageTemp is cleared. This function is called each time when the user 
   // completes a drawing operation.
   function img_update () {
      canvas_context.drawImage( ce_aux, 0, 0);
      cc_aux.clearRect( 0, 0, ce_aux.width, ce_aux.height);
   }
   
   return tools;
}

function touchHandler(event)
{
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
         switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type = "mousemove"; break;        
        case "touchend":   type = "mouseup"; break;
        default: return;
    }

             //initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //           screenX, screenY, clientX, clientY, ctrlKey, 
    //           altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                              first.screenX, first.screenY, 
                              first.clientX, first.clientY, false, 
                              false, false, false, 0/*left*/, null);

                                                                                 first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}
