'use strict';

var Util = /** @class */ (function () {
    function Util() {
    }
    Util.addSlider = function (target, name, options) {
        var root = document.createElement('div');
        root.id = name;
        target.appendChild(root);
        webglLessonsUI.setupSlider("#" + name, options);
    };
    Util.radToDeg = function (r) {
        return r * 180 / Math.PI;
    };
    Util.degToRad = function (d) {
        return d * Math.PI / 180;
    };
    return Util;
}());

//创建着色器对象
function loadShaderObject(gl, type, source) {
    var shader = gl.createShader(type); // 创建着色器对象
    gl.shaderSource(shader, source); // 提供数据源
    gl.compileShader(shader); // 编译 -> 生成着色器
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
function createProgram(gl, vsSource, fsSource) {
    var vertexShader = loadShaderObject(gl, gl.VERTEX_SHADER, vsSource); //创建顶点着色器对象
    var fragmentShader = loadShaderObject(gl, gl.FRAGMENT_SHADER, fsSource); //创建片元着色器对象
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
function clearCanvas(gl, vec4) {
    if (vec4 === void 0) { vec4 = [0.0, 0.0, 0.0, 0.0]; }
    resizeCanvasToDisplaySize(gl.canvas, 1);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(vec4[0], vec4[0], vec4[2], vec4[3]);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
function resizeCanvasToDisplaySize(canvas, multiplier) {
    multiplier = multiplier || 1;
    var width = canvas.clientWidth * multiplier | 0;
    var height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}
var WebGLRenderer = /** @class */ (function () {
    function WebGLRenderer(gl) {
        this.programCache = [];
        this.glRender = gl;
    }
    WebGLRenderer.prototype.useProgram = function (program) {
        this.program = program;
        this.glRender.useProgram(this.program);
        this.programCache.push(program);
    };
    WebGLRenderer.prototype.createBuffer = function (bs) {
        if (bs === void 0) { bs = undefined; }
        var gl = this.glRender;
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        if (bs !== undefined) {
            gl.bufferData(gl.ARRAY_BUFFER, bs, gl.STATIC_DRAW);
        }
        return buffer;
    };
    WebGLRenderer.prototype.bindBuffer = function (buffer, target) {
        if (target === void 0) { target = this.glRender.ARRAY_BUFFER; }
        var gl = this.glRender;
        gl.bindBuffer(target, buffer);
    };
    WebGLRenderer.prototype.vertexAttribPointer = function (name, config) {
        var gl = this.glRender;
        var program = this.program;
        var positionAttributeLocation = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, config.size, config.type, config.normalize, config.stride, config.offset);
    };
    WebGLRenderer.prototype.setUniform = function (name, type, data) {
        var gl = this.glRender;
        var location = gl.getUniformLocation(this.program, name);
        switch (type) {
            case UniformType.F2:
                gl.uniform2f(location, data[0], data[1]);
                break;
            case UniformType.FV1:
                gl.uniform1fv(location, data);
                break;
            case UniformType.F1:
                gl.uniform1f(location, data);
                break;
            case UniformType.FV4:
                gl.uniform4fv(location, data);
                break;
            case UniformType.MFV4:
                gl.uniformMatrix4fv(location, false, data);
                break;
        }
    };
    WebGLRenderer.prototype.render = function () {
    };
    WebGLRenderer.prototype.drawTriangles = function (count, offset) {
        if (count === void 0) { count = 0; }
        if (offset === void 0) { offset = 0; }
        this.glRender.drawArrays(this.glRender.TRIANGLES, offset, count);
    };
    return WebGLRenderer;
}());
var UniformType;
(function (UniformType) {
    UniformType[UniformType["F2"] = 0] = "F2";
    UniformType[UniformType["FV1"] = 1] = "FV1";
    UniformType[UniformType["F1"] = 2] = "F1";
    UniformType[UniformType["FV4"] = 3] = "FV4";
    UniformType[UniformType["MFV4"] = 4] = "MFV4";
})(UniformType || (UniformType = {}));

function exec(gl) {
    //准备变量
    var translation = [45, 150, 0];
    var rotation = [Util.degToRad(40), Util.degToRad(25), Util.degToRad(325)];
    var scale = [1, 1, 1];
    //准备ui
    var ui = document.querySelector('#ui');
    Util.addSlider(ui, 'x', { value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
    Util.addSlider(ui, 'y', { value: translation[1], slide: updatePosition(1), max: gl.canvas.height });
    Util.addSlider(ui, 'z', { value: translation[2], slide: updatePosition(2), max: gl.canvas.height });
    Util.addSlider(ui, 'angleX', { value: Util.radToDeg(rotation[0]), slide: updateRotation(0), max: 360 });
    Util.addSlider(ui, 'angleY', { value: Util.radToDeg(rotation[1]), slide: updateRotation(1), max: 360 });
    Util.addSlider(ui, 'angleZ', { value: Util.radToDeg(rotation[2]), slide: updateRotation(2), max: 360 });
    Util.addSlider(ui, 'scaleX', { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2 });
    Util.addSlider(ui, 'scaleY', { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2 });
    Util.addSlider(ui, 'scaleZ', { value: scale[2], slide: updateScale(2), min: -5, max: 5, step: 0.01, precision: 2 });
    //准备着色器
    gl.enable(gl.DEPTH_TEST);
    clearCanvas(gl);
    var program = createProgram(gl, vs, fs);
    var renderer = new WebGLRenderer(gl);
    renderer.useProgram(program);
    var positionBuffer = renderer.createBuffer(fPoint);
    var colorBuffer = renderer.createBuffer(cPoint);
    drawScene();
    function updatePosition(index) {
        return function (event, ui) {
            translation[index] = ui.value;
            drawScene();
        };
    }
    function updateRotation(index) {
        return function (event, ui) {
            var angleInDegrees = ui.value;
            var angleInRadians = angleInDegrees * Math.PI / 180;
            rotation[index] = angleInRadians;
            drawScene();
        };
    }
    function updateScale(index) {
        return function (event, ui) {
            scale[index] = ui.value;
            drawScene();
        };
    }
    function drawScene() {
        renderer.bindBuffer(positionBuffer);
        renderer.vertexAttribPointer('a_position', {
            size: 3,
            type: gl.FLOAT,
            normalize: false,
            stride: 0,
            offset: 0
        });
        renderer.bindBuffer(colorBuffer);
        renderer.vertexAttribPointer('a_color', {
            size: 3,
            type: gl.UNSIGNED_BYTE,
            normalize: true,
            stride: 0,
            offset: 0
        });
        // Compute the matrices
        var matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
        matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
        matrix = m4.xRotate(matrix, rotation[0]);
        matrix = m4.yRotate(matrix, rotation[1]);
        matrix = m4.zRotate(matrix, rotation[2]);
        matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);
        renderer.setUniform('u_matrix', UniformType.MFV4, matrix);
        renderer.drawTriangles(16 * 6);
    }
}
var vs = "\nattribute vec4 a_position;\n\nuniform mat4 u_matrix;\nattribute vec4 a_color;\nvarying vec4 v_color;\nvoid main() {\n  // Multiply the position by the matrix.\n  gl_Position = u_matrix * a_position;\n  v_color = a_color;\n}";
var fs = "\nprecision mediump float;\n\nvarying vec4 v_color;\nvoid main() {\n   gl_FragColor = v_color;\n}";
var fPoint = new Float32Array([
    // left column front
    0, 0, 0,
    30, 0, 0,
    0, 150, 0,
    0, 150, 0,
    30, 0, 0,
    30, 150, 0,
    // top rung front
    30, 0, 0,
    100, 0, 0,
    30, 30, 0,
    30, 30, 0,
    100, 0, 0,
    100, 30, 0,
    // middle rung front
    30, 60, 0,
    67, 60, 0,
    30, 90, 0,
    30, 90, 0,
    67, 60, 0,
    67, 90, 0,
    // left column back
    0, 0, 30,
    30, 0, 30,
    0, 150, 30,
    0, 150, 30,
    30, 0, 30,
    30, 150, 30,
    // top rung back
    30, 0, 30,
    100, 0, 30,
    30, 30, 30,
    30, 30, 30,
    100, 0, 30,
    100, 30, 30,
    // middle rung back
    30, 60, 30,
    67, 60, 30,
    30, 90, 30,
    30, 90, 30,
    67, 60, 30,
    67, 90, 30,
    // top
    0, 0, 0,
    100, 0, 0,
    100, 0, 30,
    0, 0, 0,
    100, 0, 30,
    0, 0, 30,
    // top rung right
    100, 0, 0,
    100, 30, 0,
    100, 30, 30,
    100, 0, 0,
    100, 30, 30,
    100, 0, 30,
    // under top rung
    30, 30, 0,
    30, 30, 30,
    100, 30, 30,
    30, 30, 0,
    100, 30, 30,
    100, 30, 0,
    // between top rung and middle
    30, 30, 0,
    30, 30, 30,
    30, 60, 30,
    30, 30, 0,
    30, 60, 30,
    30, 60, 0,
    // top of middle rung
    30, 60, 0,
    30, 60, 30,
    67, 60, 30,
    30, 60, 0,
    67, 60, 30,
    67, 60, 0,
    // right of middle rung
    67, 60, 0,
    67, 60, 30,
    67, 90, 30,
    67, 60, 0,
    67, 90, 30,
    67, 90, 0,
    // bottom of middle rung.
    30, 90, 0,
    30, 90, 30,
    67, 90, 30,
    30, 90, 0,
    67, 90, 30,
    67, 90, 0,
    // right of bottom
    30, 90, 0,
    30, 90, 30,
    30, 150, 30,
    30, 90, 0,
    30, 150, 30,
    30, 150, 0,
    // bottom
    0, 150, 0,
    0, 150, 30,
    30, 150, 30,
    0, 150, 0,
    30, 150, 30,
    30, 150, 0,
    // left side
    0, 0, 0,
    0, 0, 30,
    0, 150, 30,
    0, 0, 0,
    0, 150, 30,
    0, 150, 0
]);
var cPoint = new Uint8Array([
    // left column front
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    // top rung front
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    // middle rung front
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    // left column back
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    // top rung back
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    // middle rung back
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    // top
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    // top rung right
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    // under top rung
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    // between top rung and middle
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    // top of middle rung
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    // right of middle rung
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    // bottom of middle rung.
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    // right of bottom
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    // bottom
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    // left side
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220
]);

// import { exec} from './demo/square'
// import { exec } from './demo/test'
console.log('webgl test');
var canvas = document.querySelector("#c");
var gl = canvas.getContext("webgl");
console.log(gl);
exec(gl);
