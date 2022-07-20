export class Light {
    constructor(options = {}) {
        this.color = options.color || [1,1,1];
        this.intensity = [0.1, 0.02, 0.0002]
        this.ambientColor = options.ambientColor || [1,1,1]
        this.diffuseColor = options.diffuseColor || [1,1,1]
    } 

    setColor(type,color){
        if(color instanceof Array && color.length==3 && ["color","ambientColor","diffuseColor","specularColor"].includes(type))
        this[type] = color;
    }

}