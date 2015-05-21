var fs = require( "fs" );
eval(fs.readFileSync('./backend/ops_handler/LinkedList.js')+'');


//list of string
var ops = new List();

//where arduino is reading coords
//because arduino might ready slowler than how clients writes.
var gettingIndex = 1;

module.exports = {
    add:function(newCoord){
        ops.add(newCoord);
    },

    getNext:function(){
        var toR = ops.get(gettingIndex);
        gettingIndex++;
        return toR;
    },

    hasNext:function(){
        return gettingIndex <= ops.size();
    },

    lastCoord:function(){
        return (gettingIndex == ops.size());
    },

    toString:function(){
        var toR = "";
        var second = false;
        for(var i = 0; i < ops.size(); i++){
            var temp = ops.get( i + 1);
            
            if( second){
                toR += ";" + temp;
                second = false;
            } else{
                toR += "-" + temp;
                second = true;
            }
            if((temp == 'A')||(temp == 'Z'))
                second = false;
        }
        return toR;
    }
}
