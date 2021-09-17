import { Util } from '../util';
import * as engine from './../engine'
import { UniformType } from './../engine';
export function exec(gl: WebGLRenderingContext) {


    //准备变量
    var translation = [45, 150, 0];
    var rotation = [Util.degToRad(40), Util.degToRad(25), Util.degToRad(325)];
    var scale = [1, 1, 1];
    var color = [Math.random(), Math.random(), Math.random(), 1];
    //准备ui

    let ui = document.querySelector('#ui')
    Util.addSlider(ui, 'x', { value: translation[0], slide: updatePosition(0), max: gl.canvas.width })
    Util.addSlider(ui, 'y', { value: translation[1], slide: updatePosition(1), max: gl.canvas.height })
    Util.addSlider(ui, 'z', { value: translation[2], slide: updatePosition(2), max: gl.canvas.height })
    Util.addSlider(ui, 'angleX', { value: Util.radToDeg(rotation[0]), slide: updateRotation(0), max: 360 })
    Util.addSlider(ui, 'angleY', { value: Util.radToDeg(rotation[1]), slide: updateRotation(1), max: 360 })
    Util.addSlider(ui, 'angleZ', { value: Util.radToDeg(rotation[2]), slide: updateRotation(2), max: 360 })
    Util.addSlider(ui, 'scaleX', { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2 });
    Util.addSlider(ui, 'scaleY', { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2 });
    Util.addSlider(ui, 'scaleZ', { value: scale[2], slide: updateScale(2), min: -5, max: 5, step: 0.01, precision: 2 });

    //准备着色器
    gl.enable(gl.DEPTH_TEST);

    engine.clearCanvas(gl)
    let program = engine.createProgram(gl, vs, fs);
    let renderer = new engine.WebGLRenderer(gl);
    renderer.useProgram(program);

    let positionBuffer = renderer.createBuffer(fPoint);
    let colorBuffer = renderer.createBuffer(cPoint);


    drawScene()
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
        })

        renderer.bindBuffer(colorBuffer);
        renderer.vertexAttribPointer('a_color',{
            size: 3,
            type: gl.UNSIGNED_BYTE,
            normalize: true,
            stride: 0,
            offset: 0
        })

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
var vs = `
attribute vec4 a_position;

uniform mat4 u_matrix;
attribute vec4 a_color;
varying vec4 v_color;
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;
  v_color = a_color;
}`
var fs = `
precision mediump float;

varying vec4 v_color;
void main() {
   gl_FragColor = v_color;
}`

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
    0, 150, 0]);
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
    160, 160, 220])