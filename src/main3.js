var shuffle = function(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

var randint = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

var intersects = function(objs, item) {
    for (var i=0;i<objs.length;i++) {

        if (objs[i].intersects(item)) {
            return true;
        }
    }
    return false;
};

var objs = [];


var protoHexagon = function(center) {
    var sides = 6;
    var hex = new Path.RegularPolygon(center, sides, radius);
    hex._type = 'hexagon';
    hex._center = center;
    hex._rotation = 0;
    hex.applyMatrix = false;
    return hex;
}

var protoTriangle = function(center, radius) {
  var _radius = 1/(Math.sqrt(3)/2)*radius;
  var sides = 3;
  var triangle = Path.RegularPolygon(center, 3, _radius);
  triangle.rotate(30, center)
  triangle._type = 'triangle';
  triangle._center = center;
  triangle._rotation = 0;
  triangle.applyMatrix = false;
  return triangle;
};

var protoChevron = function(center, radius) {
    var sides = 6;
    var shape = new Path.RegularPolygon(center, sides, radius);
    shape.removeSegment(4);
    shape.insertSegment(4, center)
    shape._type = 'chevron';
    shape._center = center;
    triangle._rotation = 0;
    shape.applyMatrix = false;
    return shape;
};

var calcTriangleAngle = function(center, spacing, radius) {
    var hexagon = Path.RegularPolygon(center, 6, radius);
    var fp = hexagon.segments[4].point;
    var sp = hexagon.segments[3].point;
    var hypDist = Math.abs(spacing/Math.cos(60));
    var vec = sp - fp;
    vec.length = vec.length*2 + hypDist;
    var secondPoint = fp + vec;
    //var line = Path.Line(fp, secondPoint);
    //line.strokeColor='black'
    var rightAngleVector = new Point(0, Math.sqrt(3)/2*radius*2/3);
    rightAngleVector.angle = 240;
    var circleMidPoint = secondPoint+rightAngleVector;
    var fl = circleMidPoint - center;
    //var line = Path.Line(secondPoint, secondPoint+rightAngleVector);
    //line.strokeColor='black'
    hexagon.remove();
    return fl;
}

var getPositions = function(center, radius, spacing, rotation, fromType, toType, magicVector) {
    var magicDistance = magicVector.length;
    var magicAngle = magicVector.angle;
    var magicVector = new Point(magicDistance)*0.71;
    var incircleRadius = Math.sqrt(3)/2*radius;
    var incircleVector = new Point(incircleRadius*2 + spacing, 0);
    var outcircleVector = new Point(radius + spacing, 0);
    var triangleVector = new Point(incircleRadius*1.77 + spacing, 0);
    var triangleCloseVector = new Point(outcircleVector*1.12 + spacing, 0);
    var mappings;
    var fns = {
        'chevron': protoChevron,
        'triangle': protoTriangle,
        'hexagon': protoHexagon
    };

    if (toType == 'chevron') {
        // from chevron
        if (fromType == 'chevron') {
            mappings = [
                [0, [0, 180], incircleVector],
                [60, [180, 240], incircleVector],
                [120, [180, 240, 300], incircleVector],
                [180, [180, 240, 300, 360], incircleVector],
                [240, [240, 300, 360], incircleVector],
                [300, [300, 0], incircleVector],
                // vector is radius + spacing
                [0, [90], outcircleVector],
                [60, [90], outcircleVector],
                [120, [90], outcircleVector],
                [240, [90], outcircleVector],
                [300, [90], outcircleVector],
                [180, [32, 148], outcircleVector]
            ]
        } else if (fromType == 'hexagon') {
            mappings = [
                [0, [0, 60, 120, 180], incircleVector],
                [60, [60, 120, 180, 240], incircleVector],
                [120, [120, 180, 240, 300], incircleVector],
                [180, [180, 240, 300, 360], incircleVector],
                [240, [240, 300, 360, 60], incircleVector],
                [300, [300, 0, 60, 120], incircleVector],
                [0, [270], outcircleVector],
                [60, [330], outcircleVector],
                [120, [30], outcircleVector],
                [180, [90], outcircleVector],
                [240, [150], outcircleVector],
                [300, [210], outcircleVector],
            ];
        } else if (fromType == 'triangle') {
            mappings = [
                //
                [0, [magicAngle, -magicAngle], magicVector],
                //
                [300, [120+magicAngle, 120-magicAngle], magicVector],
                [300, [magicAngle, -magicAngle], magicVector],
                [240, [magicAngle, -magicAngle, 240-magicAngle, 240+magicAngle], magicVector],
                [180, [magicAngle, -magicAngle, 240-magicAngle, 240+magicAngle], magicVector],
                [120, [240-magicAngle, 240+magicAngle], magicVector],
                [300, [180],  triangleCloseVector],
                [240, [180],  triangleCloseVector],
                [0, [-60],  triangleCloseVector],
                [180, [60],  triangleCloseVector],
                [120, [60],  triangleCloseVector],
                [60, [-60],  triangleCloseVector],
            ];
        }
    } else if (toType == 'triangle') {
        if (fromType == 'chevron') {
            mappings = [
                [60, [20,-20,220, 260], triangleVector],
                [60, [80+magicAngle], magicVector*0.77],
                [120, [280, 320], triangleVector],
                [120, [100+Math.abs(magicAngle)], magicVector*0.77],
                [120, [180+magicAngle, 180-magicAngle], magicVector]
            ];
        } else if (fromType == 'hexagon') {
            mappings = [
                [60, [20,-20,100, 140, 220, 260], triangleVector],
                [120, [40,80, 280, 320, 160, 200], triangleVector],
            ]
        } else if (fromType == 'triangle') {
            mappings = [
                [60, [0, 240, 120], triangleCloseVector],
            ];
        }
    } else if (toType == 'hexagon') {
        if (fromType == 'chevron') {
            mappings = [
                [0, [0, 180, 240, 300], incircleVector],
                [0, [90], outcircleVector],
            ]
        } else if (fromType == 'hexagon') {
            mappings = [
                [0, [0, 60, 120, 180, 240, 300], incircleVector]
            ]
        } else if (fromType == 'triangle') {
            mappings = [
                [0, [20, -20, 100, 140, 220, 260], triangleVector]

            ]
        }

    }
    var results = [];
    mappings.forEach(function(mapping) {
        var innerRotation = mapping[0];
        var angles = mapping[1];
        var vector = mapping[2];

        angles.forEach(function(angle) {
            vector.angle = angle + rotation;
            var shape = fns[toType](center + vector, radius);
            shape.rotate(rotation + innerRotation, center + vector);
            shape._rotation = rotation + innerRotation;
            //shape.fillColor = 'lightblue'
            //var line = Path.Line(center, center + vector);
            //line.strokeColor = 'black';
            //var text = new PointText(center + vector);
            //text.content = angle;
            results.push(shape);
        })
    });
    return results;
}

var objs = [];
var options = ['hexagon', 'triangle', 'chevron'];
var center = new Point(500,500);
var incircleRadius = Math.sqrt(3)/2*radius;
var radius = 20;
var spacing = 1;
var incircleRadius = Math.sqrt(3)/2*radius;
var rightCenter = new Point(incircleRadius*2+spacing, 0);
var rotation = 0;
var angleOffset = calcTriangleAngle(center, spacing, radius);
hexagon.fillColor = 'pink'
objs.push(hexagon);

var findCandidate = function(objs, nextShapeType, initCenter) {
    var target = objs[randint(0,objs.length)]
    var center = target ? target._center : initCenter;
    var type = target ? target._type : 'hexagon';
    var newShapes = getPositions(center, radius, spacing, rotation, type, nextShapeType, angleOffset);
    newShapes = newShapes.filter(function(shape) {
        return !intersects(objs, shape);
    });
    if (newShapes.length) {
        shuffle(newShapes);
        return newShapes[0];
    } else {
        return findCandidate(objs, nextShapeType);
    }
}


var getShapes = function(shapes, centeredAt, container) {
    container = container || [];
    for (var i=0;i<shapes.length;i++) {
        var nextShapeType = options[randint(0,3)];
        var nextShapeType = shapes[i];
        var nextShape = findCandidate(container, nextShapeType, centeredAt);
        container.push(nextShape);
    };
    return container;
}

var render = function(shapes) {
    shapes.forEach(function(shape) {
        shape.fillColor = {
            hexagon:'#ff7077',
            chevron: '#ffd851',
            triangle: '#a5ecfe'
        }[shape._type]
    })
}

var shapes = ['hexagon','hexagon','chevron','chevron','chevron', 'triangle', 'triangle','triangle'];

var curr = getShapes(shapes, center);
var next = getShapes(shapes, new Point(300,300));
render(curr)

var adjust = function(curr, next) {
    var dropCurr = _.clone(curr);
    var newCurr = [];
    for (var i=0;i<next.length;i++) {
        var idx = indexOf(dropCurr[i]);
        var item = dropCurr.splice(idx,1);
        if (item) {
            newCurr.push(item);
        }
    }
    console.log(newCurr);
}


function onFrame(event) {
    for (var i=0;i<curr.length;i++) {
        var s1 = curr[i];
        var s2 = next[i];
        var vec = s2.position - s1.position;
        var rotationDelta = Math.round(s2.rotation - s1.rotation);
        s1.position += vec / 15;
        s1.rotate(rotationDelta / 15);
    }
}

var chevronBtn = document.getElementById('chevron');

chevronBtn.addEventListener('click', function() {
    shapes = ['hexagon', 'chevron'];
    var shapes = ['hexagon','hexagon','chevron','chevron','chevron', 'triangle', 'triangle','triangle'];
    // remove the bad items from shape1

    // add the good items to shape1
    // make shapes2 that looks like shape1
    next = getShapes(shapes, new Point(300,300));
});
