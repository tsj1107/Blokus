var pieceData = {
  'a': [1],
  'b': [1, 1],
  'c': [
    [1, 1],
    [0, 1]
  ],
  'd': [1, 1, 1],
  'e': [
    [1, 1],
    [1, 1]
  ],
  'f': [
    [0, 1, 0],
    [1, 1, 1]
  ]
};
var boardMatrix = [];

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

var stage = new Kinetic.Stage({
  container: 'container',
  width: 800,
  height: 800
});

var num = 0;
function piece(id, item) {
  var group = new Kinetic.Group({
    x: num * 100,
    y: 0,
    width: item.length * BLOKUS.pixSize,
    height: item[0].length ? (item[0].length * BLOKUS.pixSize) : BLOKUS.pixSize,
    draggable: true
  });

  for (var i = 0; i < item.length; i++) {//纵向
    if (item[0].length) {
      for (var j = 0; j < item[0].length; j++) {//横向
        if (item[i][j] != 0) {
          group.add(new Kinetic.Rect({
            x: BLOKUS.pixSize * j,
            y: BLOKUS.pixSize * i,
            width: BLOKUS.pixSize,
            height: BLOKUS.pixSize,
            fill: '#00D2FF',
            stroke: 'black',
            strokeWidth: 1
          }))
        }
      }
    } else {
      if (item[i] != 0) {
        group.add(new Kinetic.Rect({
          x: BLOKUS.pixSize * i,
          y: 0,
          width: BLOKUS.pixSize,
          height: BLOKUS.pixSize,
          fill: '#00D2FF',
          stroke: 'black',
          strokeWidth: 1
        }))
      }
    }
  }

  this.id = id;
  this.metrix = item;
  this.shape = group;
  this.color = 1;
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

  var tempArr;
  for (var j = 0; j < BLOKUS.boardSize; j++) {
    tempArr = [];
    for (var i = 0; i < BLOKUS.boardSize; i++) {
      tempArr.push(0)
    }
    boardMatrix.push(tempArr)
  }

  boardLayer.add(board());
  for (item in pieceData) {
    (function () {
      var obj = new piece(item, pieceData[item]),
        shape = obj.shape;

//  TODO group cache 报错
//      shape.cache()
//      shape.filter([
//        Kinetic.Filters.Blur,
//        Kinetic.Filters.Brighten
//      ])

      shape.on('dragstart', function () {
        this.moveToTop();
        pieceLayer.draw();
        var gridPos = {
          x: Math.round(shape.getX() / BLOKUS.pixSize),
          y: Math.round(shape.getY() / BLOKUS.pixSize)
        }
        if(shape.isStick){
          revokeFlag(obj, gridPos);
          shape.isStick = false;
        }
      })

      shape.on('dragmove', function () {
        document.body.style.cursor = 'pointer';
      })

      shape.on('dragend', function () {
        shape.isStick = false;
        var gridPos = {
          x: Math.round(shape.getX() / BLOKUS.pixSize),
          y: Math.round(shape.getY() / BLOKUS.pixSize)
        }
        if(isValidate(obj.metrix, gridPos)){
          var pos = {
            x: gridPos.x * BLOKUS.pixSize,
            y: gridPos.y * BLOKUS.pixSize
          };
          shape.setPosition(pos);
          shape.isStick = true;
          markFlag(obj, gridPos);
        }
        pieceLayer.draw();
      })

      shape.on('mouseover', function () {
        shape.blurRadius(2);
        shape.brightness(0.5);
        pieceLayer.draw();
        document.body.style.cursor = 'pointer';
      })

      shape.on('mouseout', function () {
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

function isValidate(metrix, gridPos){
  if(typeof metrix[0] === 'number'){
    for(var i=0; i<metrix.length; i++){
      if(metrix[i]&&boardMatrix[gridPos.x+i][gridPos.y]){
        return false;
      }
    }
  }else{
    var tempArr;
    for(var i=0; i<metrix.length; i++){
      tempArr = metrix[i];
      for(var j=0; j<tempArr.length; j++){
        if(metrix[i][j]&&boardMatrix[gridPos.x+j][gridPos.y+i]){
          return false;
        }
      }
    }
  }
  return true;
}

function revokeFlag(piece, gridPos){
  var metrix = piece.metrix;
  if(typeof metrix[0] === 'number'){
    for(var i=0; i<metrix.length; i++){
      if(metrix[i]){
        boardMatrix[gridPos.x+i][gridPos.y] = 0;
      }
    }
  }else{
    var tempArr;
    for(var i=0; i<metrix.length; i++){
      tempArr = metrix[i];
      for(var j=0; j<tempArr.length; j++){
        if(metrix[i][j]){
          boardMatrix[gridPos.x+j][gridPos.y+i] = 0;
        }
      }
    }
  }
  print()
}

function markFlag(piece, gridPos){
  var metrix = piece.metrix;
  if(typeof metrix[0] === 'number'){
    for(var i=0; i<metrix.length; i++){
      if(metrix[i]) {
        boardMatrix[gridPos.x + i][gridPos.y] = piece.color;
      }
    }
  }else{
    var tempArr;
    for(var i=0; i<metrix.length; i++){
      tempArr = metrix[i];
      for(var j=0; j<tempArr.length; j++){
        if(metrix[i][j]){
          boardMatrix[gridPos.x+j][gridPos.y+i] = piece.color;
        }
      }
    }
  }
  print()
}

function print(){
  var elm = document.getElementById('console'), html = '';
  elm.innerHTML = html;
  for(var i=0; i<boardMatrix.length; i++){
    for(var j=0; j<boardMatrix[i].length; j++){
      html += boardMatrix[j][i]+' ';
    }
    html += '<br>'
  }
  elm.innerHTML = html;
}

function matrixRotate(arr){
  var dist = new Array(arr.length);
  if(arr[0].length){
    if(arr[0].length>1){
      for(var i=0; i<arr[0].length; i++){
        dist[i] = new Array(arr[0].length)
      }
      for(var v=0; v<dist.length; v++){
        for(var h=0; h<dist[0].length; h++){
          dist[v][h] = arr[dist[0].length-1-h][v]
        }
      }
    }else{
      for(var i=0; i<dist.length; i++){
        dist[i] = arr[i][0]
      }
    }
  }else{
    for(var i=0; i<dist.length; i++){
      dist[i] = [arr[i]]
    }
  }
  console.log(dist)
  return dist;
}
//matrixRotate([1,2,3,4])

init()




