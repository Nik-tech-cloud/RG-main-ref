import { vec3, mat4, quat } from '../lib/gl-matrix-module.js';

export class Node {

    constructor(options = {}) {

        this.name = options.name;
        this.translation = options.translation
            ? vec3.clone(options.translation)
            : vec3.fromValues(0, 0, 0);
        this.rotation = options.rotation
            ? quat.clone(options.rotation)
            : quat.fromValues(0, 0, 0, 1);
        this.scale = options.scale
            ? vec3.clone(options.scale)
            : vec3.fromValues(1, 1, 1);
        this.matrix = options.matrix
            ? mat4.clone(options.matrix)
            : mat4.create();

        if (options.matrix) {
            this.updateTransform();
        } else if (options.translation || options.rotation || options.scale) {
            this.updateMatrix();
        }
        
        this.light = options.light || null;
        this.camera = options.camera || null;
        this.mesh = options.mesh || null;
        this.collider = (options.collider) ? {
            min: vec3.clone(options.collider.min),
            max: vec3.clone(options.collider.max)
        } : null,

        this.children = options.map || new Map((options.children || []).map(x => [x.name, x]));
        for (const child of this.children.values()) {
            child.parent = this;
        }
        this.parent = null;
    }

    getGlobalPosition(){
        if (!this.parent) {
            return vec3.clone(this.translation);
        }else{
            let translation = this.parent.getGlobalPosition();
            return vec3.add(translation,translation,this.translation);
        }
    }

    getGlobalTransform() {
        if (!this.parent) {
            return mat4.clone(this.matrix);
        } else {
            let transform = this.parent.getGlobalTransform();
            return mat4.mul(transform, transform, this.matrix);
        }
    }

    updateTransform() {
        mat4.getRotation(this.rotation, this.matrix);
        mat4.getTranslation(this.translation, this.matrix);
        mat4.getScaling(this.scale, this.matrix);
    }

    updateMatrix() {
        mat4.fromRotationTranslationScale(
            this.matrix,
            this.rotation,
            this.translation,
            this.scale);
    }

    add(node) {
        let counter = 0;
        let name = node.name;
        while(this.children.has(name)){
            name = node.name+counter;
            counter++;
        }
        node.name = name;
        this.children.set(name,node);
    }

    remove(node){
        if(this.children.has(node.name))
            this.children.delete(node.name)
    }

    clone() {
        return new Node({
            ...this,
            map: new Map([...this.children].map(node => [node[0],node[1].clone()])),
        });
    }

    getChildByIndex(index){
        return this.children[index];
    }

    getChildByName(name){
        return this.children.get(name);
    }

    setPosition(vector){
        this.translation = vector;
    }

    setScale(vector){
        this.scale=vector;
    }

    move(vector){
        vec3.add(this.translation, this.translation, vector);
    }

    rotate(x,y,z){
        quat.fromEuler(this.rotation, x, y, z);
    }

    addCollider(x,y,z){
        let maxi = vec3.fromValues(x,y,z);
        vec3.scale(maxi,maxi,0.5);
        let mini = vec3.create()
        vec3.negate(mini,maxi)
        this.collider = {
            min: mini,
            max:  maxi
        }
    }

    collide(other) {
        const otherGlobal = other.getGlobalPosition();
        const otherMax = vec3.add(vec3.create(),otherGlobal,other.collider.max);
        const otherMin = vec3.add(vec3.create(),otherGlobal,other.collider.min);
        const thisGlobal = this.getGlobalPosition();
        const thisMax = vec3.add(vec3.create(),thisGlobal,this.collider.max);
        const thisMin = vec3.add(vec3.create(),thisGlobal,this.collider.min);

        return ((thisMin[0] <= otherMax[0] && thisMax[0] >= otherMin[0]) &&
               (thisMin[1] <= otherMax[1] && thisMax[1] >= otherMin[1]) &&
               (thisMin[2] <= otherMax[2] && thisMax[2] >= otherMin[2]));
    }

}