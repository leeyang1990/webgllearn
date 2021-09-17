import * as engine from "./../engine";
var vs = `
attribute vec4 a_Position;
    void main() {
      gl_Position = a_Position;
      gl_PointSize = 10.0;
    }
`
var fs = `
void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
`
function exec(gl){
    console.log('square')
    const shaderProgram = engine.createProgram(gl, vs, fs)
    engine.clearCanvas(gl,[0,0,0,1]);
    gl.useProgram(shaderProgram);
    gl.drawArrays(gl.POINTS, 0, 1);
}

export {
    exec
}
