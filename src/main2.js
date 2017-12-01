
var radius = 25;

var shuffle = function(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

var intersects = function(objs, item) {
    for (var i=0;i<objs.length;i++) {

        if (objs[i].intersects(item)) {
            return true;
        }
    }
    return false;
};

var protoHexagon = function(center) {
    var sides = 6;
    var hex = new Path.RegularPolygon(center, sides, radius);
    hex._type = 'hexagon';
    return hex;
}

var protoChevron = function(center) {
    var hexagon = protoHexagon(center);
    var segment = hexagon.removeSegment(5);
    hexagon.insertSegment(5, {x: segment.point.x+(86 * radius/100), y: segment.point.y-(51 * radius/100)})
    hexagon._type = 'chevron';
    return hexagon;
};

var protoTriangle = function(center) {
  var _radius = 1/(Math.sqrt(3)/2)*radius;
  var sides = 3;
  var triangle = Path.RegularPolygon(center, 3, _radius);
  triangle._type = 'triangle';
  return triangle;
};

var intersects = function(objs, item) {
    for (var i=0;i<objs.length;i++) {
        if (objs[i].intersects(item)) {
            return true;
        }
    }
    return false;
};

var getCenter = function(item) {
    if (item._type == 'triangle') {
        var f = item.segments[0].point,
            s = item.segments[1].point,
            t = item.segments[2].point;
        return new Point((f.x + s.x + t.x)/3, (f.y + s.y + t.y)/3);
    }
    var f = item.segments[0].point;
    var l = item.segments[3].point;
    return new Point((f.x + l.x)/2, (f.y + l.y)/2);
}


var addChevron = function(hexagon) {
    if (hexagon._type == 'triangle') {
        return [];
    }
    var candidates = [];
    var configs =[
        [0, [60, 120, 180, 240], 1],
        [0, [330], 0.606],
        [60, [120, 180, 240, 300], 1],
        [60, [30], 0.606],
        [120, [180, 240, 300, 360], 1],
        [120, [90], 0.606],
        [180, [0, 60, 240, 300], 1],
        [180, [150], 0.606],
        [240, [0, 60, 120, 300], 1],
        [240, [210], 0.606],
        [300, [0, 60, 120, 180], 1],
        [300, [270], 0.606],
        ];
    var circleRadius = Math.sqrt(3)*radius/2;
    var vector = new Point(circleRadius*1.48);
    var hexCenter = getCenter(hexagon);
    configs.forEach(function(config) {
        var rotation = config[0];
        var angles = config[1];
        var multiplier = config[2];
        angles.forEach(function(angle) {
            vector.angle = angle;
            var chevron = protoChevron(hexCenter + vector*multiplier);
            chevron.rotate(rotation);
            chevron._rotation = rotation;
            chevron._type='chevron';
            candidates.push(chevron);

        })
    });
    return candidates;
}

var addTriangle = function(shape) {
    if (shape._type == 'triangle') {
        var candidates = [];
        return candidates;
    } else {
        var configs = [
            [290, [30, 90, 150, 210, 270, 330]],
            [250, [30, 90, 150, 210, 270, 330]]];
        var hexCenter = getCenter(shape);
        var circleRadius = Math.sqrt(3)*radius/2;
        var vector = new Point(circleRadius*1.32);
        var candidates = [];
        configs.forEach(function(config) {
            var rotations = config[1];
            var angle = config[0];
            rotations.forEach(function(rotation) {
                vector.angle = angle;
                var triangle = protoTriangle(hexCenter + vector);
                triangle.rotate(rotation, hexCenter);
                triangle._rotation = rotation;
                triangle._type='triangle';
                candidates.push(triangle);
            })
        });
        return candidates;
    }
}

var addHexagon = function(shape) {
    if (shape._type == 'hexagon') {
        var candidates = [];
        var angles = [0, 60, 120, 180, 240, 300];
        var circleRadius = Math.sqrt(3)*radius/2;
        var vector = new Point(circleRadius*1.48);
        angles.forEach(function(angle) {
            vector.angle = angle;
            var hexagon2 = protoHexagon(getCenter(shape) + vector);
            hexagon2._type='hexagon';
            candidates.push(hexagon2);
        });
        return candidates;
    }
    if (shape._type == 'chevron') {
        var candidates = [];
        var configs = [
            [[0, 60, 240, 300], 1.48],
            [[150], 0.9]
            ];
        var circleRadius = Math.sqrt(3)*radius/2;
        var chevronRotation = shape._rotation;
        configs.forEach(function(config) {
            var angles = config[0];
            var multiplier = config[1];
            var vector = new Point(circleRadius*multiplier);
            angles.forEach(function(angle) {
            vector.angle = angle + chevronRotation;
            var hexagon = protoHexagon(getCenter(shape) + vector);
            if (!hexagon.intersects(shape)) {
                hexagon._type='hexagon';
                candidates.push(hexagon)
            }
        })
        })
        return candidates;
    }
    if (shape._type == 'triangle') {
        var candidates = [];
        var configs = [
            [0, [20, 100, 140, 220, 260, 340]],
            [60, [20, 100, 140, 220, 260, 340]],
            ];
        var circleRadius = Math.sqrt(3)*radius/2;
        var vector = new Point(circleRadius*1.32);
        configs.forEach(function(config) {
            var rotation = config[0];
            var angles = config[1];
            angles.forEach(function(angle) {
                vector.angle = angle + rotation;
                var hexagon = protoHexagon(getCenter(shape) + vector);
                if (!hexagon.intersects(shape)) {
                    candidates.push(hexagon);
                }
            })
        });
        return candidates;
    }
}

var config = {
    hexagon: 70,
    chevron: 100,
    triangle: 50
};

var fns = {
    hexagon: addHexagon,
    chevron: addChevron,
    triangle: addTriangle
}

var list = [];
for (k in config) {
    for (var i=0;i<config[k];i++) {
        list.push(k);
    }
}

var color = {
    hexagon:'#ff7077',
    chevron: '#ffd851',
    triangle: '#a5ecfe'
}

shuffle(list);

var objs = [];
var next = [];

var other = function() {

    var center = new Point(900, 500);
    var hexagon = protoHexagon(center);
    hexagon.fillColor = '#ff7077';
    objs.push(hexagon);
    var candidates = [];

    for (var i=0;i<list.length;i++) {
        var viable = [];
        var addFn = fns[list[i]];
        for (var j=0;j<objs.length;j++) {
            var c = addFn(objs[j]);
            c.forEach(function(candidate) {
                if (!intersects(objs, candidate)) {
                    viable.push(candidate);
                }
            })
        }
        shuffle(viable);
        var item = viable[0];
        item.fillColor = color[list[i]]
        objs.push(item)
        shuffle(viable);
        viable[0];
        item._newPosition = viable[0].position;
        item._newRotation = viable[0]._rotation;
    }



}
other();

/*
function onFrame(event) {
    // Run through the active layer's children list and change
    // the position of the placed symbols:
    for (var i = 0; i < objs.length; i++) {
        var item = objs[i];
        var vector = item._newPosition - item.position;
        item.rotate((item._newRotation || 0) / 40)
        // Move the item 1/20th of its width to the right. This way
        // larger circles move faster than smaller circles:
        item.position += vector/40
    }
}
*/





var randint = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
