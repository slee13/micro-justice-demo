window.shuffle = function(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

window.randint = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

window.intersects = function(objs, item) {
    for (var i=0;i<objs.length;i++) {
        if (objs[i].intersects(item)) {
            return true;
        } else if (objs[i]._target &&
                   objs[i]._target.intersects(item)) {
            return true;
        }
    }
    return false;
};

window.protoHexagon = function(center, radius) {
    var sides = 6;
    var hex = new Path.RegularPolygon(center, sides, radius);
    hex._type = 'hexagon';
    hex._center = center;
    hex._rotation = 0;
    hex.applyMatrix = false;
    return hex;
}

window.protoTriangle = function(center, radius) {
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

window.protoChevron = function(center, radius) {
    var sides = 6;
    var shape = new Path.RegularPolygon(center, sides, radius);
    shape.removeSegment(4);
    shape.insertSegment(4, center)
    shape._type = 'chevron';
    shape._center = center;
    shape._rotation = 0;
    shape.applyMatrix = false;
    return shape;
};

window.calcTriangleAngle = function(center, spacing, radius) {
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

window.getPositions = function(center, radius, spacing, fromType, toType, rotation) {
    var rotation = rotation || 0;
    var triangleVector = calcTriangleAngle(center, spacing, radius);
    var magicDistance = triangleVector.length;
    var magicAngle = triangleVector.angle;
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
            shape._debug = {angle: angle, fromType: fromType, toType: toType, innerRotation: innerRotation}
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
