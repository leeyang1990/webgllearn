export class Util {
    public static addSlider(target: any, name: string, options: any) {
        let root = document.createElement('div');
        root.id = name;
        target.appendChild(root);
        webglLessonsUI.setupSlider("#"+name, options);
    }
    public static  radToDeg(r) {
        return r * 180 / Math.PI;
    }

    public static  degToRad(d) {
        return d * Math.PI / 180;
    }
}