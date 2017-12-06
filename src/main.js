var RADIUS = 20;
var SPACING = 1;
var COLORS = {
    hexagon:'#ff7077',
    chevron: '#ffd851',
    triangle: '#a5ecfe'
}

// objs: global object holding all visible shapes that have
// been appended to the map.
window.objs = [];

/**
 * Given all currently placed items, find valid positions for a new item.
 * `objs` is an array of currently placed objects.
 * `nextShapeType` is a string, one of ['hexagon', 'triangle', 'chevron']
 * `initCenter` a default center, if objs is empty.
 *
 * Returns an array of valid (invisible) shape objects.
 */
var findCandidate = function(objs, nextShapeType, defaultCenter) {

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
var addShape = function(objs, type, defaultCenter) {
    // get valid new positions
    var newShape = findCandidate(objs, type, defaultCenter);
    // assign a target to the object to animate toward.
    // superhack: lib.intersects checks for the _target to 'reserve'
    // the position, even if an animated object isn't there yet.
    newShape._target = newShape.clone();
    newShape.fillColor = COLORS[newShape._type];
    newShape.opacity = 0.1;
    newShape.position = new Point(randint(0, view.viewSize.width), randint(0, view.viewSize.height));
    objs.push(newShape);
};

// simple addition of shapes to the page
document.getElementById('chevron').addEventListener('click', function() {
    addShape(objs, 'chevron', view.center);
});

document.getElementById('hexagon').addEventListener('click', function() {
    addShape(objs, 'hexagon', view.center);
});

document.getElementById('triangle').addEventListener('click', function() {
    addShape(objs, 'triangle', view.center)
});

document.getElementById('auto').addEventListener('click', function() {
    for (var i=0;i<200;i++) {
        window.setTimeout(function() {
            var shapes = ['hexagon', 'chevron', 'triangle'];
            var randomShape = shapes[randint(0, shapes.length)];
            addShape(objs, randomShape, view.center);
        }, 50*i);
    }
});


/**
 * Controls animation. Called automatically every 1/60th of a second.
 * Each frame iterates over all of the visible objects and moves
 * properties toward _target (if it exists);
 */
function onFrame(event) {
    var freq = 10;
    for (var i=0;i<objs.length;i++) {
        var obj = objs[i];
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
    }
}



var main = function() {
    // add an initial object
    // default center (paperjs provides `view`)
    var center = view.center;
    var shapes = ['hexagon', 'chevron', 'triangle'];
    var randomShape = shapes[randint(0, shapes.length)];
    addShape(objs, randomShape, center);
}

main();
