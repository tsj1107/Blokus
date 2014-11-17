var pieceData = {
  'a': {
    coords: [
      [0, 0]
    ],
    size: [1, 1]
  },
  'b': {
    coords: [
      [0, 0],
      [0, 1]
    ],
    size: [1, 2]
  },
  'c': {
    coords: [
      [0, 0],
      [0, 1],
      [1, 1]
    ],
    size: [2, 2]
  }
};
var BLOKUS = {
  pixSize: 20,
  boardSize: 14
};

var pieceLayer = new Kinetic.Layer({
    x: 1,
    y: 1
  }),
  boardLayer = new Kinetic.Layer({
    x: 1,
    y: 1
  });
var num = 0;
function piece(id, item) {
  var group = new Kinetic.Group({
    x: num * 100,
    y: 0,
    width: item.size[0] * BLOKUS.pixSize,
    height: item.size[1] * BLOKUS.pixSize,
    draggable: true
  });
  for (var i = 0; i < item.coords.length; i++) {
    group.add(new Kinetic.Rect({
      x: BLOKUS.pixSize * item.coords[i][0],
      y: BLOKUS.pixSize * item.coords[i][1],
      width: BLOKUS.pixSize,
      height: BLOKUS.pixSize,
      fill: '#00D2FF',
      stroke: 'black',
      strokeWidth: 1
    }))
  }

  this.id = id;
  this.coords = item.coords;
  this.shape = group;
  num++;
}

function board() {
  var group = new Kinetic.Group({
    x: 0,
    y: 0,
    width: BLOKUS.boardSize * BLOKUS.pixSize,
    height: BLOKUS.boardSize * BLOKUS.pixSize
  });

  group.add(new Kinetic.Rect({
    x: 0,
    y: 0,
    width: BLOKUS.boardSize * BLOKUS.pixSize,
    height: BLOKUS.boardSize * BLOKUS.pixSize,
    fill: '#f9f9f9'
  }))

  for (var h = 0; h < BLOKUS.boardSize + 1; h++) {
    group.add(new Kinetic.Line({
      x: 0,
      y: h * BLOKUS.pixSize,
      points: [0, 0, BLOKUS.boardSize * BLOKUS.pixSize, 0],
      stroke: '#cccccc'
    }))
    group.add(new Kinetic.Line({
      x: h * BLOKUS.pixSize,
      y: 0,
      points: [0, 0, 0, BLOKUS.boardSize * BLOKUS.pixSize],
      stroke: '#cccccc'
    }))
  }

  return group;
}

function init() {
  var stage = new Kinetic.Stage({
    container: 'container',
    width: 800,
    height: 800
  });

  boardLayer.add(board());
  for (item in pieceData) {
    (function(){
      var obj = new piece(item, pieceData[item]),
        shape = obj.shape;

//      shape.cache()
//      shape.filter([
//        Kinetic.Filters.Blur,
//        Kinetic.Filters.Brighten
//      ])

      shape.on('dragstart', function(){
        this.moveToTop();
        pieceLayer.draw();
      })

      shape.on('dragmove', function(){
        document.body.style.cursor = 'pointer';
      })

      shape.on('dragend', function(){
        var pos = {
          x: Math.round(shape.getX()/BLOKUS.pixSize)*BLOKUS.pixSize,
          y: Math.round(shape.getY()/BLOKUS.pixSize)*BLOKUS.pixSize
        };
        shape.setPosition(pos);
        pieceLayer.draw();
      })

      shape.on('mouseover', function(){
        shape.blurRadius(2);
        shape.brightness(0.5);
        pieceLayer.draw();
        document.body.style.cursor = 'pointer';
      })

      shape.on('mouseout', function(){
        shape.blurRadius(0);
        shape.brightness(0);
        pieceLayer.draw();
        document.body.style.cursor = 'default';
      })

      pieceLayer.add(shape)
    })()
  }

  stage.add(boardLayer);
  stage.add(pieceLayer);
}

function DataBinder( object_id ) {
  // Create a simple PubSub object
  var pubSub = {
      callbacks: {},

      on: function( msg, callback ) {
        this.callbacks[ msg ] = this.callbacks[ msg ] || [];
        this.callbacks[ msg ].push( callback );
      },

      publish: function( msg ) {
        this.callbacks[ msg ] = this.callbacks[ msg ] || []
        for ( var i = 0, len = this.callbacks[ msg ].length; i < len; i++ ) {
          this.callbacks[ msg ][ i ].apply( this, arguments );
        }
      }
    },

    data_attr = "data-bind-" + object_id,
    message = object_id + ":change",

    changeHandler = function( evt ) {
      var target = evt.target || evt.srcElement, // IE8 compatibility
        prop_name = target.getAttribute( data_attr );

      if ( prop_name && prop_name !== "" ) {
        pubSub.publish( message, prop_name, target.value );
      }
    };

  // Listen to change events and proxy to PubSub
  if ( document.addEventListener ) {
    document.addEventListener( "change", changeHandler, false );
  } else {
    // IE8 uses attachEvent instead of addEventListener
    document.attachEvent( "onchange", changeHandler );
  }

  // PubSub propagates changes to all bound elements
  pubSub.on( message, function( evt, prop_name, new_val ) {
    var elements = document.querySelectorAll("[" + data_attr + "=" + prop_name + "]"),
      tag_name;

    for ( var i = 0, len = elements.length; i < len; i++ ) {
      tag_name = elements[ i ].tagName.toLowerCase();

      if ( tag_name === "input" || tag_name === "textarea" || tag_name === "select" ) {
        elements[ i ].value = new_val;
      } else {
        elements[ i ].innerHTML = new_val;
      }
    }
  });

  return pubSub;
}

init()




