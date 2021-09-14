'use strict';

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
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(vec4[0], vec4[0], vec4[2], vec4[3]);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
var engine = {
    loadShaderObject: loadShaderObject,
    createProgram: createProgram,
    clearCanvas: clearCanvas
};

var vs = "\nattribute vec4 a_Position;\n    void main() {\n      gl_Position = a_Position;\n      gl_PointSize = 10.0;\n    }\n";
var fs = "\nvoid main() {\n    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n  }\n";
function exec(gl) {
    console.log('square');
    var shaderProgram = engine.createProgram(gl, vs, fs);
    engine.clearCanvas(gl, [0, 0, 0, 1]);
    gl.useProgram(shaderProgram);
    gl.drawArrays(gl.POINTS, 0, 1);
}

console.log('webgl test');
var canvas = document.querySelector("#c");
var gl = canvas.getContext("webgl");
console.log(gl);
exec(gl);
