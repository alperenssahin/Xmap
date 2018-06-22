//canvasın basılacağı container elementini parametre alır.
//img içerisinde fotografın gerçek boyutları yada yeniden boyutlanmıs boyu belirtilmelidir
//canvas boyutları on tanımlı verilmeli

//click fonsyonu kullanııcı tarafından çağırılıcak

var config = {
    container: {
        height: null,
        width: null
    },
    image: {
        id: null,
        height: null,
        width: null
    },
    map: {
        cx: null,
        cy: null
    },
    scale: 1,
    mobile: false,
    point: {
        radius: 5,
        title: false,
        option: {
            x: null,
            y: null,
            font: "Georgia",
            color: "#dd0518",
            font_size: "10px"
        }
    },
    clickCallback: null
};

var object_list = new Array(); //bölgeler ve altında bulunan noktalar
var points = new Array();   //bütün noktlar
var clickable = new Array(); // harita üstündeki noktalar
/*
init fonsyonu haritayı çalıstırır, todo: bulunduğu kabın şeklini alır,
fotografın idsini ve objelerin listesini parmetre alır.
 */

var setupXmap = function (width,height,callback) {
    // $('#container.Xmap').css('position','absolute');
     $('#container.Xmap').innerWidth(width);
     $('#container.Xmap').innerHeight(height);
        config.container.width = width;
        config.container.height = height;
        callback();
};
function init(ImageId, objects, callback) {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        config.mobile = true;
    }
    object_list = objects;
    var img = config.image;
    img.id = ImageId;
    img.width = $('#' + img.id).innerWidth();
    img.height = $('#' + img.id).innerHeight();
    if (img.width < config.container.width) {
        alert('Image size is not correct for your container: Image Width is smaller than containers');
        return;
    }
    if (img.height < config.container.height) {
        alert('Image size is not correct for your container: Image Height is smaller than containers');
        return;
    }
    drawPointInit();
    var canvas = document.getElementById('Map');
    var ctx = canvas.getContext("2d");
    canvas.height = config.container.height;
    canvas.width = config.container.width;
    // $('#Map.Xmap').innerHeight(config.height);
    // $('#Map.Xmap').innerWidth(config.width);
    // $('#Map.Xmap').css('width', cont.width + 'px');
    // $('#debug.Xmap').text(JSON.stringify(config));
    callback();
};
/*
@fulldrawMap ilk çağırımda haritanın merkezini canvasa basar
 */
var fulldrawMap = function () {
    var canvas = document.getElementById('Map');
    var ctx = canvas.getContext("2d");
    var img = document.getElementById('ex-image');
    var fix_y = config.image.height / 2 - config.container.height / 2;
    var fix_x = config.image.width / 2 - config.container.width / 2;
    config.map.cx = fix_x;
    config.map.cy = fix_y;
    ctx.drawImage(img, config.map.cx, config.map.cy, config.container.width / config.scale, config.container.height / config.scale, 0, 0, config.container.width, config.container.height);
    drawArea();
    // onClickable();
};
/*
@drawMap haritanın mevcut posizyonunu ekrana basar
 */
var drawMap = function (e, d) {
    var canvas = document.getElementById('Map');
    var ctx = canvas.getContext("2d");
    var img = document.getElementById('ex-image');
    var dfx = getDifferential(d.dx, 'x');
    var dfy = getDifferential(d.dy, 'y');
    // $('#point.Xmap').text('dx:' + dfx);
    // $('#point.Xmap').text(JSON.stringify(config));
    var Kd = 40;
    if (config.mobile) {
        Kd = 1;
    }
    if (dfx > 0) {
        config.map.cx -=  dfx * Kd;
    }
    if (dfx < 0) {
        config.map.cx -=   dfx * Kd;
    }

    if (dfy > 0) {
        config.map.cy -=  dfy * Kd;
    }
    if (dfy < 0) {
        config.map.cy -=  dfy * Kd;
    }

    var right =  (config.image.width - config.container.width)*config.scale;
    var bottom =(config.image.height - config.container.height)*config.scale;
    if (config.map.cx < 0) config.map.cx = 0;
    if (config.map.cy < 0) config.map.cy = 0;
    if (config.map.cx > right) config.map.cx = right;
    if (config.map.cy > bottom) config.map.cy = bottom;
    ctx.drawImage(img, config.map.cx, config.map.cy, config.container.width / config.scale, config.container.height / config.scale, 0, 0, config.container.width, config.container.height);
};
/*
get position fonksiyonları anlık mouse konumunu döndürür
 */
var getMousePosition = function (e) {
    var Mouse = {
        x: e.clientX - $('#container.Xmap').offset().left,
        y: e.clientY - $('#container.Xmap').offset().top
    }
    // $('#point.Xmap').text('x:'+Mouse.x+' y:'+Mouse.y);
    return Mouse;
};
var getTouchPosition = function (e) {
    var Mouse = {
        x: e.targetTouches.item(0).clientX - $('#container.Xmap').offset().left,
        y: e.targetTouches.item(0).clientY - $('#container.Xmap').offset().top
    }
    // $('#point.Xmap').text('x:'+Mouse.x+' y:'+Mouse.y);
    return Mouse;
};
/*
reposition functionları, haritanın mevcut positionunun değiştirir
 */
var rePosition = function () {
    var trig = false;
    var c1, c2, d;
    onClickable();
    $('#Map.Xmap').mousedown(function (e) {
        trig = true;
        c1 = getMousePosition(e);
    });
    $('#Map.Xmap').mousemove(function (e) {
        if (trig) {
            $('#Map.Xmap').css('cursor','all-scroll');
            c2 = getMousePosition(e);
            d = {
                dx: c2.x - c1.x,
                dy: c2.y - c1.y
            };
            drawMap(e, d);
            drawArea();

            // $('#point.Xmap').text('dx:' + (c2.x - c1.x) + ' dy:' + (c2.y - c1.y));
            // $('#point.Xmap').text('dx:' + df);
        }
    });
    $('body').mouseup(function (e) {
        trig = false;
        $('#Map.Xmap').css('cursor','default');
    });

};
var rePositionMobile = function (e) {
    onClickable();
    var trig = false;
    var c1, c2, d;
    document.getElementById("Map").addEventListener("touchstart", function (e) {
        if (!e.targetTouches.length === 1) return;
        trig = true;
        c1 = getTouchPosition(e);
    });
    document.getElementById("Map").addEventListener("touchmove", function (e) {
        if (trig) {
            c2 = getTouchPosition(e);
            d = {
                dx: c2.x - c1.x,
                dy: c2.y - c1.y
            };

            drawMap(e, d);
            drawArea();


            // $('#point.Xmap').text('dx:' + (c2.x - c1.x) + ' dy:' + (c2.y - c1.y));
            // $('#point.Xmap').text('dx:' + df);
        }
    });
    document.getElementById("Map").addEventListener("touchend", function (e) {
        trig = false;
    });

};
/*input kontrıol mekanızması, konum değişimin türevini alır yön belilirer*/
var diff = {
    x: {
        val: null,
        time: null,
        process: true
    },
    y: {
        val: null,
        time: null,
        process: true
    }
};

var getDifferential = function (v, axe) {
    var dat = new Date();
    var d;
    switch (axe) {
        case 'x':
            if (diff.x.process) {
                diff.x.time = dat.getTime();
                diff.x.val = v;
                diff.x.process = false;
            }
            d = dat.getTime() - diff.x.time;

            if (d > 5) {
                var a = v - diff.x.val;
                var r = a / d;
                diff.x.process = true;
                return r;
            } else return 0;
            break;

        case 'y':
            if (diff.y.process) {
                diff.y.time = dat.getTime();
                diff.y.val = v;
                diff.y.process = false;
            }
            d = dat.getTime() - diff.y.time;
            if (d > 5) {
                var a = v - diff.y.val;
                var r = a / d;
                diff.y.process = true;
                return r;
            } else return 0;

            break;
    }


};

var ZoomMap = function () {
    $('#Zoom.Xmap').mousemove(function () {
        config.scale = $(this).val();
        resizedrawMap();
        drawArea();
    });
};

var resizedrawMap = function () {
    var canvas = document.getElementById('Map');
    var ctx = canvas.getContext("2d");
    var img = document.getElementById('ex-image');
    // config.map.cx += config.scale*1;
    // config.map.cy += config.scale*1;
    ctx.drawImage(img, config.map.cx, config.map.cy, config.container.width / config.scale, config.container.height / config.scale, 0, 0, config.container.width, config.container.height);
};

/*
pozisyon çerçevenin içindeyse true döndürür
 */
var inScope = function (x, y) {
    var scope = {
        p1: {
            x: config.map.cx,
            y: config.map.cy
        },
        p2: {
            x: config.map.cx + config.container.width / config.scale,
            y: config.map.cy
        },
        p3: {
            x: config.map.cx,
            y: config.map.cy + config.container.height / config.scale,
        },
        p4: {
            x: config.map.cx + config.container.width / config.scale,
            y: config.map.cy + config.container.height / config.scale
        }
    };
    if (x > scope.p1.x && x < scope.p2.x && y > scope.p1.y && y < scope.p3.y) {
        return true;
    } else {
        return false;
    }

};
/*
bölgeleri çizer
 */
var drawArea = function () {
    //bukısımda objenin türüne göre harita değiılımı seçilebilir, default dairesel
    for (var i = 0; i < points.length; i++) {
        if (inScope(points[i].x, points[i].y)) {
            var canvas = document.getElementById('Map');
            var ctx = canvas.getContext("2d");
            var x = (points[i].x - config.map.cx) * config.scale;
            var y = (points[i].y - config.map.cy) * config.scale;
            points[i].canvas.x = x;
            points[i].canvas.y = y;
            if (!clickable.includes(points[i])) {
                clickable.push(points[i]);
            }

            // ctx.fillRect(x, y, 10, 10);
            ctx.beginPath();
            ctx.fillStyle = points[i].color;
            ctx.arc(x, y, points[i].r, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
            // ctx.font = "20px Georgia";
            // ctx.fillText(''+points[i].titre, points[i].x - config.map.cx, points[i].y - config.map +15);
            if (config.point.title) {
                ctx.font = config.point.option.font_size+" "+config.point.option.font;
                ctx.fillStyle = config.point.option.color;
                ctx.fillText(points[i].titre, x + config.point.option.x, y + config.point.option.y);
            }
            // $('#debug.Xmap').text(JSON.stringify(clickable));

        } else {
            if (clickable.includes(points[i])) {
                var index = clickable.indexOf(points[i]);
                clickable.splice(index, 1);
            }
        }
    }
};


var drawPointInit = function () {
    for (var i = 0; i < object_list.length; i++) {
        var count = object_list[i].items.count;
        var deg = 360 / count;
        var init = 0;
        for (var y = 0; y < count; y++) {
            if (count === 1 || y == 0) {
                var point = {
                    x: object_list[i].x / 1,
                    y: object_list[i].y / 1,
                    titre: object_list[i].items.id[y],
                    r: config.point.radius,
                    canvas: {x: null, y: null},
                    color: object_list[i].color
                };
            } else {
                var point = {
                    x: object_list[i].x / 1 + object_list[i].r * Math.cos(init),
                    y: object_list[i].y / 1 + object_list[i].r * Math.sin(init),
                    titre: object_list[i].items.id[y],
                    r: config.point.radius,
                    canvas: {x: null, y: null},
                    color: object_list[i].color
                };
                init += deg;
            }
            points.push(point);

        }
    }
};

var onClickable = function () {
    var click = false;
    var myPoint;
    $('#Map.Xmap').mousemove(function (e) {
        click = false;

        var myPosition;
        if (config.mobile) {
            myPosition = getTouchPosition(e);
        } else {

            myPosition = getMousePosition(e);
        }
        for (var i = 0; i < clickable.length; i++) {
            if (isInPoint(clickable[i], myPosition)) {
                click = true;

                myPoint = clickable[i];
            }
        }
        if (click) {
            $('#Map.Xmap').css('cursor', 'pointer');

        } else {
            $('#Map.Xmap').css('cursor', 'default');

        }
    });
    $('#Map.Xmap').click(function () {
        if(click){
            config.clickCallback(myPoint);
            click=false;
        }
    });
};

var isInPoint = function (Point, Position) {
    // $('#debug.Xmap').prepend('//**point: '+JSON.stringify(Point));

    // $('#debug.Xmap').prepend('position : '+JSON.stringify(Position));


    var distance = Math.sqrt(Math.pow((Position.x - Point.canvas.x), 2) + Math.pow((Position.y - Point.canvas.y), 2));
    // $('#debug.Xmap').prepend(JSON.stringify('distance:'+distance+'**//'));
    if (distance <= Point.r) {
        return true;
    } else {
        return false;
    }
};
//todo: dokunma inputu düzeltilecek
var setPointTitle = function (Titleoption) {
    config.point.title = true;
    config.point.title.option = Titleoption;
};
var UnsetPointTitle = function () {
    config.point.title = false;
};