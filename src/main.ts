import { exec} from './demo/square'
console.log('webgl test')

var canvas:HTMLCanvasElement = document.querySelector("#c");
var gl = canvas.getContext("webgl");
console.log(gl)
exec(gl)

