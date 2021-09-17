
import * as engine from './../engine'
export function exec(gl: WebGLRenderingContext) {

    var list  = [1,2,3,4,5]
    let aa = list.reduce((x,y)=>{
        return x+y;
    })
    console.log(aa)

    var image = new Image();
    image.src = "resources/leaves.jpg";  // MUST BE SAME DOMAIN!!!
    image.onload = function () {
        render(image);
    };
    var initialSelection = 'normal';

    function render(img) {
        console.log("图像处理")
        addSelection()
        let program = engine.createProgram(gl, vs, fs);

        var renderer = new engine.WebGLRenderer(gl);
        renderer.useProgram(program);

        let x = 0;
        let y = 0;
        let width = image.width;
        let height = image.height;
        var x1 = x;
        var x2 = x + width;
        var y1 = y;
        var y2 = y + height;
        //两个三角形
        let bsPos = new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ])

        let positionBuffer = renderer.createBuffer(bsPos);
        //两个三角形
        let bsTex = new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0,
        ])
        let texcoordBuffer = renderer.createBuffer(bsTex)
        // Create a texture.
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);


       
        // Set the parameters so we can render any size image.
         //对单独的一个坐标轴设置纹理环绕方式 str 对应xyz
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //设置纹理过滤 NEAREST：邻近过滤 LINEAR：线性过滤，这里分别设置放大和缩小的过滤规则
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);




        engine.clearCanvas(gl)
        drawWithKernel(initialSelection);

        function computeKernelWeight(kernel) {
            var weight = kernel.reduce(function (prev, curr) {
                return prev + curr;
            });
            return weight <= 0 ? 1 : weight;
        }

        function drawWithKernel(name) {


            renderer.bindBuffer(positionBuffer)
            renderer.vertexAttribPointer('a_position',
                {
                    size: 2,
                    type: gl.FLOAT,
                    stride: 0,
                    offset: 0,
                    normalize: false
                })

            renderer.bindBuffer(texcoordBuffer)
            renderer.vertexAttribPointer('a_texCoord',
                {
                    size: 2,
                    type: gl.FLOAT,
                    stride: 0,
                    offset: 0,
                    normalize: false
                })
            // set the resolution
            renderer.setUniform('u_resolution', engine.UniformType.F2, [gl.canvas.width, gl.canvas.height])
            renderer.setUniform('u_textureSize', engine.UniformType.F2, [image.width, image.height])
            renderer.setUniform('u_kernel[0]', engine.UniformType.FV1, kernels[name])
            renderer.setUniform('u_kernelWeight', engine.UniformType.F1, computeKernelWeight(kernels[name]))

            // Draw the rectangle.
            var primitiveType = gl.TRIANGLES;
            var offset = 0;
            var count = 6;
            gl.drawArrays(primitiveType, offset, count);
        }

        function addSelection() {
            var ui = document.querySelector("#root");
            var select = document.createElement("select");
            for (var name in kernels) {
                var option = document.createElement("option");
                option.value = name;
                if (name === initialSelection) {
                    option.selected = true;
                }
                option.appendChild(document.createTextNode(name));
                select.appendChild(option);
            }
            select.onchange = function (event) {
                drawWithKernel(select.value);
            };
            ui.appendChild(select);
        }
    }



}

var kernels = {
    normal: [
        0, 0, 0,
        0, 1, 0,
        0, 0, 0
    ],
    gaussianBlur: [
        0.045, 0.122, 0.045,
        0.122, 0.332, 0.122,
        0.045, 0.122, 0.045
    ],
    gaussianBlur2: [
        1, 2, 1,
        2, 4, 2,
        1, 2, 1
    ],
    gaussianBlur3: [
        0, 1, 0,
        1, 1, 1,
        0, 1, 0
    ],
    unsharpen: [
        -1, -1, -1,
        -1, 9, -1,
        -1, -1, -1
    ],
    sharpness: [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
    ],
    sharpen: [
        -1, -1, -1,
        -1, 16, -1,
        -1, -1, -1
    ],
    edgeDetect: [
        -0.125, -0.125, -0.125,
        -0.125, 1, -0.125,
        -0.125, -0.125, -0.125
    ],
    edgeDetect2: [
        -1, -1, -1,
        -1, 8, -1,
        -1, -1, -1
    ],
    edgeDetect3: [
        -5, 0, 0,
        0, 0, 0,
        0, 0, 5
    ],
    edgeDetect4: [
        -1, -1, -1,
        0, 0, 0,
        1, 1, 1
    ],
    edgeDetect5: [
        -1, -1, -1,
        2, 2, 2,
        -1, -1, -1
    ],
    edgeDetect6: [
        -5, -5, -5,
        -5, 39, -5,
        -5, -5, -5
    ],
    sobelHorizontal: [
        1, 2, 1,
        0, 0, 0,
        -1, -2, -1
    ],
    sobelVertical: [
        1, 0, -1,
        2, 0, -2,
        1, 0, -1
    ],
    previtHorizontal: [
        1, 1, 1,
        0, 0, 0,
        -1, -1, -1
    ],
    previtVertical: [
        1, 0, -1,
        1, 0, -1,
        1, 0, -1
    ],
    boxBlur: [
        0.111, 0.111, 0.111,
        0.111, 0.111, 0.111,
        0.111, 0.111, 0.111
    ],
    triangleBlur: [
        0.0625, 0.125, 0.0625,
        0.125, 0.25, 0.125,
        0.0625, 0.125, 0.0625
    ],
    emboss: [
        -2, -1, 0,
        -1, 1, 1,
        0, 1, 2
    ]
};

var vs = `
attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;

varying vec2 v_texCoord;

void main() {
   // convert the rectangle from pixels to 0.0 to 1.0
   vec2 zeroToOne = a_position / u_resolution;

   // convert from 0->1 to 0->2
   vec2 zeroToTwo = zeroToOne * 2.0;

   // convert from 0->2 to -1->+1 (clipspace)
   vec2 clipSpace = zeroToTwo - 1.0;

   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

   // pass the texCoord to the fragment shader
   // The GPU will interpolate this value between points.
   v_texCoord = a_texCoord;
}`
var fs = `
precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_textureSize;
uniform float u_kernel[9];
uniform float u_kernelWeight;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
   vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
   vec4 colorSum =
       texture2D(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 0, -1)) * u_kernel[1] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 1, -1)) * u_kernel[2] +
       texture2D(u_image, v_texCoord + onePixel * vec2(-1,  0)) * u_kernel[3] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 0,  0)) * u_kernel[4] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 1,  0)) * u_kernel[5] +
       texture2D(u_image, v_texCoord + onePixel * vec2(-1,  1)) * u_kernel[6] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 0,  1)) * u_kernel[7] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 1,  1)) * u_kernel[8] ;

   gl_FragColor = vec4((colorSum / u_kernelWeight).rgb, 1);
}`