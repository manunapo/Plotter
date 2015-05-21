function Node( data) {
    var data = data;
    var next = null;

    this.setNext = function( newNext){
        next = newNext;
    }

    this.getData = function(){
        return data;
    }

    this.getNext = function(){
        return next;
    }
};

function List(){
    var first = null;
    var last = null;
    var cant = 0;

    this.isEmpty = function(){
        return (cant == 0);
    }

    //adds de data to the end of the list
    this.add = function( data){
        var newNode = new Node( data);
        if(this.isEmpty()){
            first = newNode;
            last = newNode;
        }else{
            last.setNext(newNode);
            last = newNode;
        }
       cant++;
    }

    //require index from 1 to n
    this.get = function( index){
        var toR = getNode( index);
        return toR.getData();
    }

    this.size = function(){
        return cant;
    }

    //private method for getting the node at index
    function getNode( index){
        var toR = null;
        if((index > 0) && (index <= cant)){
            toR = first;
            for(var i = 1; i < index; i++){
                toR = toR.getNext();
            } 
        }
        return toR;
    }
};