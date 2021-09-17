// import { exec} from './demo/square'
// import { exec} from './demo/webgl-2d-triangle-with-position-for-color'
// import { exec } from './demo/webgl-2d-image-3x3-convolution'
import { exec } from './demo/webgl-3d-orthographic'
// import { exec } from './demo/test'
console.log('webgl test')

var canvas: HTMLCanvasElement = document.querySelector("#c");
var gl = canvas.getContext("webgl");
console.log(gl)
exec(gl)


