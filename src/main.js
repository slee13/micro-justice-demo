// Set the configuration for your app
// Initialize Firebase
var config = {
  apiKey: "AIzaSyBRCaeKgH9VUtqeDLCHSIlNZUhJ0_GaDqU",
  authDomain: "microjustice-idp.firebaseapp.com",
  databaseURL: "https://microjustice-idp.firebaseio.com",
  projectId: "microjustice-idp",
  storageBucket: "microjustice-idp.appspot.com",
  messagingSenderId: "1031959043789"
};

//heh
var ready = false;
//configurations for shapes
var RADIUS = 15;
var SPACING = 3;
var COLORS = {
    hexagon:'#F0574A',
    chevron: '#F9E600',
    triangle: '#B6FCFF'
}
var velocity = {x:5, y:5};
disturbance = .03;

//setting background color of canvas
var rect = new Path.Rectangle({
    point: [0, 0],
    size: [view.size.width, view.size.height],
    selected: true
});
rect.sendToBack();
rect.fillColor = '#EFBBB6';

// objs: global object holding all visible shapes that have
// been appended to the map.
window.objs = [];

//votes contains the arrays which hold each microaggression and their related votes
var hexCount = 0;
var chevCount = 0;
var triCount = 0;

// define initial state here
window.configs = {
    active: 'MA0',
    items: {
        // each key like 'abc-id' is some sort of "group" or "issue" id
        // init: just the initial state you should set it with
        'MA0': {init: ['hexagon', 'hexagon','hexagon', 'hexagon','hexagon', 'hexagon']},
        'MA1': {init: ['chevron', 'chevron']},
        'MA2': {init: ['triangle', 'triangle', 'triangle']}
    }
}

//init firebase to get all individual logged votes
firebase.initializeApp(config);
var getVotes = firebase.database().ref('answers/');

//get all data upfront
getVotes.on('value', gotData, errData);
//get a snapshot of the most recently added
getVotes.on('child_added', newData, errData);

function gotData(data){
  if (ready){
   return;
 } else {
  votes = data.val();
  console.log(votes);
  for (var vote in votes) {
    var v = votes[vote];
    var sh = v.optionId;
    var ma = v.questionId;
    console.log(ma);

   if(!window.configs.items[ma]){
     window.configs.items[ma] = {};
      window.configs.items[ma].init = [];
    } else {
       window.configs.items[ma].init.push(sh);
    }
    console.log(configs);
  }
  //when finished getting data, call main
  main();
}
}

//looking at the latest added shape
function newData(snapshot,prevChildKey) {

  if(ready) {
      var newPost = snapshot.val();
      var newShape = newPost.optionId;
      var questionID = newPost.questionId;
      configs.active = questionID;
      addShape(configs.items[questionID].objs, newShape)


      if (newShape == "hexagon") {
        hexCount++;
      }
      if (newShape == "chevron") {
        chevCount++;
      }
      if (newShape == "triangle") {
        triCount++;
      }
    } else {
      return;
    }
    // console.log(newPost);
    // console.log(newShape);
  // console.log(hexCount);
  // console.log(chevCount);
  // console.log(triCount);
}
function errData(err){
  console.log("Error!");
  console.log(err);
}


/**
 * Given all currently placed items, find valid positions for a new item.
 * `objs` is an array of currently placed objects.
 * `nextShapeType` is a string, one of ['hexagon', 'triangle', 'chevron']
 * `initCenter` a default center, if objs is empty.
 *
 * Returns an array of valid (invisible) shape objects.
 */
window.findCandidate = function(objs, nextShapeType, defaultCenter) {

    var target = objs[randint(0,objs.length)];
    var center = target ? target._center : defaultCenter;
    var type = target ? target._type : 'hexagon';
    var rotation = target ? target.rotation : 0;
    var newShapes = getPositions(center, RADIUS, SPACING, type, nextShapeType, rotation);
    newShapes = newShapes.filter(function(shape) {
        return !intersects(objs, shape);
    });
    if (newShapes.length) {
        var n = newShapes.splice(randint(0, newShapes.length), 1);
        newShapes.forEach(function(s) {s.remove()});
        return n[0];
    } else {
        return findCandidate(objs, nextShapeType, defaultCenter);
    }
}

/**
 * Add an object to the array of visible objects.
 * Mutates objs.
 * `objs` is an array of currently placed objects. most likely the global `objs`
 * `type` is a string, one of ['hexagon', 'triangle', 'chevron']
 */
// var addShapeToClumpArray = function(objs, type, defaultCenter) {
//     // get valid new positions
//     var newShape = findCandidate(objs, type, defaultCenter);
//     // assign a target to the object to animate toward.
//     // superhack: lib.intersects checks for the _target to 'reserve'
//     // the position, even if an animated object isn't there yet.
//     newShape._target = newShape.clone();
//     // newShape.fillColor = COLORS[newShape._type];
//     // newShape.opacity = 0.1;
//     // newShape.position = new Point(randint(0, view.viewSize.width), randint(0, view.viewSize.height));
//     objs.push(newShape);
// };

window.addShape = function(objs, type, defaultCenter) {

    // get valid new positions
    var newShape = findCandidate(objs, type, defaultCenter);
    // assign a target to the object to animate toward.
    // superhack: lib.intersects checks for the _target to 'reserve'
    // the position, even if an animated object isn't there yet.
    console.log(newShape);
    newShape._target = newShape.clone();
    newShape.fillColor = COLORS[newShape._type];
    newShape.opacity = 0.1;
    newShape.strokeWidth = 2;
    newShape.strokeColor = '#231F20';
    newShape.position = new Point(randint(0, view.viewSize.width), randint(0, view.viewSize.height));
    newShape.velocity = {x:Math.random() * velocity.x, y:Math.random() * velocity.y};
    objs.push(newShape);

    // add to all shapes adds
};



// simple addition of shapes to the page
document.getElementById('chevron').addEventListener('click', function() {
    configs.active = 'MA0';
});

document.getElementById('hexagon').addEventListener('click', function() {
    configs.active = 'MA1';
});

document.getElementById('triangle').addEventListener('click', function() {
    configs.active = 'MA2';
});

document.getElementById('auto').addEventListener('click', function() {
    for (var i=0;i<hexCount;i++) {
        window.setTimeout(function() {
            addShape(objs, 'hexagon', view.center);
        }, 50*i);
    }
    for (var i=0;i<chevCount;i++) {
        window.setTimeout(function() {
            addShape(objs2, 'chevron', view.center);
        }, 50*i);
    }
});


/**
 * Controls animation. Called automatically every 1/60th of a second.
 * Each frame iterates over all of the visible objects and moves
 * properties toward _target (if it exists);
 */
function onFrame(event) {

  // don't start drawing until main() has been called
  if (ready){
    var freq = 10;

    var activeKey = configs.active;
    for (var key in configs.items) {
        var o = configs.items[key];
        for (var i=0;i<o.objs.length;i++) {
            var obj = o.objs[i];
            if (key == activeKey) {
                if (obj._target) {
                    var vec = obj._target.position - obj.position;
                    var rotationDelta = Math.round(obj._target._rotation - obj.rotation);
                    var opacityDiff = obj._target.opacity - obj.opacity;
                    obj.position += vec / freq;
                    // super hack!
                    if (rotationDelta < 0.000001) {
                        obj.rotate(rotationDelta / freq);
                    }
                    obj.opacity = obj.opacity + (opacityDiff / freq);
                }
            } else {
                if (obj.position.x > view.size.width || obj.position.x < 0) {
                  obj.velocity.x *= -1;
                }

                if ( obj.position.y > view.size.height || obj.position.y < 0) {
                  obj.velocity.y *= -1;
                }
                var opacityDiff = obj._target.opacity - obj.opacity;
                obj.position.x += Math.sin(obj.rotation) * obj.velocity.x;
                obj.position.y -= Math.cos(obj.rotation) * obj.velocity.y;
                obj.opacity = obj.opacity + (opacityDiff / freq);
            }
        }
    }
  } else {
    return;
  }
    // animating
    // if clumping, don't animate
}



var main = function() {
    // add an initial object
    // default center (paperjs provides `view`)
    var center = view.center;
    for (var key in configs.items) {
        var o = configs.items[key];
        o.objs = [];
        _.each(o.init, function(shapeType) {
            addShape(o.objs, shapeType, center);
        });
    }
    ready = true;
    console.log('now populating shape');
}

//main();
