//创建着色器对象

export function loadShaderObject(gl, type, source) {
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
export function createProgram(gl: WebGLRenderingContext, vsSource, fsSource) {
    const vertexShader = loadShaderObject(gl, gl.VERTEX_SHADER, vsSource); //创建顶点着色器对象
    const fragmentShader = loadShaderObject(gl, gl.FRAGMENT_SHADER, fsSource);//创建片元着色器对象
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
export function clearCanvas(gl: WebGLRenderingContext, vec4 = [0.0, 0.0, 0.0, 0.0]) {
    resizeCanvasToDisplaySize(gl.canvas, 1);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(vec4[0], vec4[0], vec4[2], vec4[3]);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
}
function resizeCanvasToDisplaySize(canvas, multiplier) {
    multiplier = multiplier || 1;
    const width = canvas.clientWidth * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}

export class WebGLRenderer {
    glRender: WebGLRenderingContext;
    programCache: WebGLProgram[] = []
    program: WebGLProgram;
    constructor(gl: WebGLRenderingContext) {
        this.glRender = gl;
    }
    useProgram(program: WebGLProgram) {
        this.program = program;
        this.glRender.useProgram(this.program);
        this.programCache.push(program);
    }
    createBuffer(bs: BufferSource = undefined) {
        let gl = this.glRender;
        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        if (bs !== undefined) {
            gl.bufferData(gl.ARRAY_BUFFER, bs, gl.STATIC_DRAW);
        }
        return buffer;
    }
    bindBuffer(buffer: WebGLBuffer, target: number = this.glRender.ARRAY_BUFFER) {
        let gl = this.glRender;
        gl.bindBuffer(target, buffer)
    }
    vertexAttribPointer(name: string, config: AttribConfig) {
        let gl = this.glRender;
        let program = this.program;
        let positionAttributeLocation = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, config.size, config.type, config.normalize, config.stride, config.offset);
    }
    setUniform(name: string, type: UniformType, data: any) {
        let gl = this.glRender;
        let location = gl.getUniformLocation(this.program, name);

        switch (type) {
            case UniformType.F2:
                gl.uniform2f(location, data[0], data[1])
                break;
            case UniformType.FV1:
                gl.uniform1fv(location, data)
                break;
            case UniformType.F1:
                gl.uniform1f(location, data)
                break;
            case UniformType.FV4:
                gl.uniform4fv(location, data)
                break;
            case UniformType.MFV4:
                gl.uniformMatrix4fv(location, false, data)
                break;
            default:
                break;
        }
    }
    render() {

    }
    drawTriangles(count:number=0,offset:number=0){
        this.glRender.drawArrays(this.glRender.TRIANGLES,offset,count)
    }


}
export enum UniformType {
    F2,
    FV1,
    F1,
    FV4,
    MFV4

}
interface AttribConfig {
    size: number,
    type: number,
    normalize: boolean,
    stride: number,
    offset: number
}