// Initialize microaggression examples
var maDefinitions = {
  MA0: 'I say something at a meeting and nobody responds. A colleague says the same thing I did and everyone reacts positively.',
  MA1: 'I’m told to be more assertive if I want to succeed.  But I’m also told that I should be likeable.',
  MA2: 'When a colleague tells me to smile more.',
  MA3: 'I say something and the person responds to the person who is sitting next to me.',
  MA4: 'When a colleague explains something to me that I didn’t ask them to explain and I already know about.',
  MA5: 'Being called too aggressive when I speak and behave the same as a male colleague.',
  MA6: 'When men take over a conversation and only go back and forth between each other when I started the conversation.',
  MA7: 'When there’s a reference to an occupation and it uses ‘he’ as the placeholder (let’s say a researcher found this, he would then do that)',
  MA8: 'I’m talking with a group of people and someone asks: What are you ladies gossiping about?',
  MA9: 'When someone says: What they’re trying to say is... ',
  MA10: 'Someone looking to me and saying: You’re taking notes, right?',
  MA11: 'Being asked if it’s: that time of month',
  MA12: '',
  MA13: '',
  MA14: '',
  MA15: '',
  MA16: '',
  MA17: '',
  MA18: '',
  MA19: '',
  MA20: '',
  MA21: '',
  MA22: '',
  MA23: '',
  MA24: '',
  MA25: '',
  MA26: '',
  MA27: '',
  MA28: '',
  MA29: '',
  MA30: '',
  MA31: '',
  MA32: ''
};
// Set the configuration for your app
// Initialize Firebase
var config = {
    apiKey: "AIzaSyAEau3iDLH_VwD6bWTDh_I--3Gg5gKTPd0",
    authDomain: "microjustice-demo.firebaseapp.com",
    databaseURL: "https://microjustice-demo.firebaseio.com",
    projectId: "microjustice-demo",
    storageBucket: "microjustice-demo.appspot.com",
    messagingSenderId: "928384346458"
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
        'MA0': {init: []}
    }
}

//init firebase to get all individual logged votes
firebase.initializeApp(config);
var getVotes = firebase.database().ref('answers/');

//get all data upfront
getVotes.once('value', gotData, errData);

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
    // firebase.database().goOffline();
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
    } else {
      return;
    }
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
    newShape.direction = randint(0,180);
    newShape.strokeColor = '#231F20';
    newShape.position = new Point(randint(0, view.viewSize.width), randint(0, view.viewSize.height));
    newShape.velocity = {x:Math.random() * velocity.x, y:Math.random() * velocity.y};
    objs.push(newShape);

    // add to all shapes adds
};


/**
 * Controls animation. Called automatically every 1/60th of a second.
 * Each frame iterates over all of the visible objects and moves
 * properties toward _target (if it exists);
 */
function onFrame(event) {
  $('h2').text(maDefinitions[configs.active]);
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
                    obj.opacity = 1;
                    obj.bringToFront();
                    //obj.opacity + (opacityDiff / freq);
                }
            } else {
                if (obj.position.x > view.size.width || obj.position.x < 0) {
                  obj.velocity.x *= -1;
                }

                if ( obj.position.y > view.size.height || obj.position.y < 0) {
                  obj.velocity.y *= -1;
                }
                var opacityDiff = obj._target.opacity - obj.opacity;
                obj.position.x += Math.sin(obj.direction) * obj.velocity.x;
                obj.position.y -= Math.cos(obj.direction) * obj.velocity.y;
                obj.opacity = 0.5;
                //obj.opacity + (opacityDiff / freq);
            }
        }
    }
  } else {
    return;
  }
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
