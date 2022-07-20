import { vec3 } from './lib/gl-matrix-module.js';
export class Animator{
    /**
     * Creates animator class for constant node rotation and/or movement.
     * 
     * @param {Object} options
     * @param {Node} options.node - node object
     * @param {Scene} options.scene - rendered scene
     * @param {number} options.speed - speed of movement/rotation
     * @param {number[]|undefined} options.rotate - 3 value array
     * @param {number[]|undefined} options.move - 3 value array
     * @param {number|undefined} options.despawn - at what z does node moves to respawn point
     * @param {number|undefined} options.respawn - to what z does node teleports to   
     * @param {boolean|undefined} options.random - randomize respawn x and y position 
     *
     */
    constructor(options){
        this.node = options.node;
        this.rotate = options.rotate || [0,0,0];
        this.move = (options.move) ? vec3.fromValues(...options.move) : vec3.create();
        this.speed = options.speed || 1;
        this.despawn = options.despawn || 10;
        this.respawn = options.respawn || -300;
        this.scene = options.scene || null;
        this.random = options.random || false;
        this.feedback = options.feedback || false;
        this.last = Date.now();
        this.node.updateMatrix();
        this.node.updateTransform();
    }

    pause(p){
        if(!p){
            this.last = Date.now()
        }
    }

    isVisible(){
        console.log(this.node.getGlobalPosition())
        return this.node.getGlobalPosition()[2]>-300;
    }

    /**
     * Resets the node to respawn location & adds it to the scene
     */
    reset(){
        this.last = Date.now();
        if(this.random) this.node.setPosition(vec3.fromValues(Math.random() * 8 - 3,Math.random() * 5 - 2 ,this.respawn))
        else this.node.setPosition(vec3.fromValues(pos[0],pos[1],this.respawn))
        if(this.scene) this.scene.add(this.node)
        this.node.updateMatrix();
        this.node.updateTransform();
    }

    /**
     * Rotates the node
     */
    animationRotate(){
        const speed = Date.now()*this.speed
        this.node.rotate(this.rotate[0]*speed,this.rotate[1]*speed,this.rotate[2]*speed);
        this.node.updateMatrix();
        this.node.updateTransform();
    }

    /**
     * Moves the node
     */
    animationMove(){
        const now = Date.now();
        const dt = this.last-now;
        this.last = now;
        this.node.move(vec3.scale(vec3.create(),this.move,dt*this.speed));
        const pos = this.node.getGlobalPosition();
        if(pos[2]>this.despawn) {
            if(this.random) this.node.setPosition(vec3.fromValues(Math.random() * 8 - 3,Math.random() * 5 - 2 ,this.respawn))
            else this.node.setPosition(vec3.fromValues(pos[0],pos[1],this.respawn))
            if(this.scene) this.scene.add(this.node)
            if(this.feedback) return 1;
        }
        this.node.updateMatrix();
    }

    /**
     * Moves and rotates the node
     */
    animationUpdateAll(){
        const now = Date.now();
        const dt = this.last-now;
        this.last = now;
        const speed = Date.now()*this.speed
        this.node.move(vec3.scale(vec3.create(),this.move,dt*this.speed));
        this.node.rotate(this.rotate[0]*speed,this.rotate[1]*speed,this.rotate[2]*speed);
        const pos = this.node.getGlobalPosition();
        if(pos[2]>this.despawn) {
            if(this.random) this.node.setPosition(vec3.fromValues(Math.random() * 8 - 3,Math.random() * 5 - 2 ,this.respawn))
            else this.node.setPosition(vec3.fromValues(pos[0],pos[1],this.respawn))
            if(this.scene) this.scene.add(this.node)
            if(this.feedback) return 1;
        }
        this.node.updateMatrix();
        this.node.updateTransform();
    }
}