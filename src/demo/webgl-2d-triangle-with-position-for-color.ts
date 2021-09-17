import * as engine from '../engine'
var vs = `
attribute vec2 a_position;

uniform mat3 u_matrix;

varying vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

  // Convert from clipspace to colorspace.
  // Clipspace goes -1.0 to +1.0
  // Colorspace goes from 0.0 to 1.0
  v_color = gl_Position * 0.5 + 0.5;
}`
var fs = `
precision mediump float;

varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}`
function exec(gl: WebGLRenderingContext) {
    // Setup a ui.

    let program = engine.createProgram(gl, vs, fs);
    let positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    let matrixLocation = gl.getUniformLocation(program, 'u_matrix');
    //创建缓冲区
    let positionBuffer = gl.createBuffer();
    //绑定buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    //设置数据
    let positionData = new Float32Array([0, -100, 150, 125, -175, 100, 0])
    gl.bufferData(gl.ARRAY_BUFFER, positionData, gl.STATIC_DRAW);

    var translation = [200, 150];
    var angleInRadians = 0;
    var scale = [1, 1];
    webglLessonsUI.setupSlider("#x", { value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y", { value: translation[1], slide: updatePosition(1), max: gl.canvas.height });
    webglLessonsUI.setupSlider("#angle", { slide: updateAngle, max: 360 });
    webglLessonsUI.setupSlider("#scaleX", { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2 });
    webglLessonsUI.setupSlider("#scaleY", { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2 });


    drawScene()
    function handler(event, ui) {
        console.log(event)
        console.log(ui)
    }
    function drawScene() {
        //同步canvas尺寸，否则会糊
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        engine.clearCanvas(gl);
        gl.useProgram(program);

        //开启缓冲区对象
        gl.enableVertexAttribArray(positionAttributeLocation);
        //告诉着色器如何取值
        let size = 2;//每次取两个数
        let type = gl.FLOAT;//32位浮点
        let normalize = false;//不归一化
        let stride = 0;//间隔0个取一次
        let offset = 0;//从第0个开始取

        //这个命令告诉WebGL从 ARRAY_BUFFER 绑定点当前绑定的缓冲获取数据。 每个顶点有几个单位的数据(1 - 4)，单位数据类型是什么(BYTE, FLOAT, INT, UNSIGNED_SHORT, 等等...)， stride 是从一个数据到下一个数据要跳过多少位，最后是数据在缓冲的什么位置。
        //单位个数永远是 1 到 4 之间。
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        //构建矩阵
        let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight)
        matrix = m3.translate(matrix, translation[0], translation[1]);
        matrix = m3.rotate(matrix, angleInRadians);
        matrix = m3.scale(matrix, scale[0], scale[1]);

        gl.uniformMatrix3fv(matrixLocation, false, matrix);

        let primitiveType = gl.TRIANGLES;
        let _offset = 0;
        let count = 3;
        gl.drawArrays(primitiveType, _offset, count);
    }

    function updatePosition(index) {
        return function (event, ui) {
            translation[index] = ui.value;
            drawScene();
        };
    }
    function updateAngle(event, ui) {
        var angleInDegrees = 360 - ui.value;
        angleInRadians = angleInDegrees * Math.PI / 180;
        drawScene();
    }

    function updateScale(index) {
        return function (event, ui) {
            scale[index] = ui.value;
            drawScene();
        };
    }

}

export {
    exec
}