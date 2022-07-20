import { quat, vec3 } from './lib/gl-matrix-module.js';
import { SoundFX } from './SoundFX.js';

export class Enemy{
    /**
     * 
     * @param {Object} options
     * @param {Node} options.node
     * @param {Node} options.bullet
     * @param {Scene} options.scene
     * @param {number} options.ttlwait;
     * @param {number} options.ttlstart
     * @param {number} options.ttlexit
     * @param {number} options.ttl 
     */
    constructor(options) {
        this.node = options.node;
        this.bullet = options.bullet;
        this.scene = options.scene;
        this.ttlwait = options.ttlwait || 0;
        this.ttlstart = options.ttlstart || 1000;
        this.ttlexit = options.ttlexit || 100;
        this.ttlreset = options.ttl || 0;
        this.ttl = options.ttl || 0;
        if(!this.node.collider){ // Comments are examples. Set right models and colliders based on comments. Differet types = different attributes
            switch(this.node.name){
                case "plane": // Suicide 
                    this.node.addCollider(4.5,1,3.6);
                    this.value = 3000;
                    this.maxSpeed = 2; // Maximum speed
                    this.friction = 0.12; // Friction. Higher = more friction, Lower = less friction;
                    this.acceleration = 5; // Acceleration
                    this.type = 0; // ?
                    this.addVelocityX = vec3.set(vec3.create(), 0.03, 0, 0); // Vector added to Velocity vector on the X axis (movement speed)
                    this.addVelocityY = vec3.set(vec3.create(), 0, 0.015, 0); // Vector added to Velocity vector on the Y axis (movement speed)
                    this.addVelocityZ = vec3.set(vec3.create(), 0, 0, 0.03); // Vector added to Velocity vector on the Z axis (movement speed)
                    this.addAngleX = 0.5; // Angle added on the X axis (leaning speed)
                    this.addAngleZ = 0.8; // Angle added on the Z axis (leaning speed)
                    this.maxAngleX = 5; // Maximum angle on the X axis (limit turning)
                    this.maxAngleZ = 16; // Maximum angle on the Z axis (limit turning)
                    this.modifier = 0.09; 
                    // Entrance animation: when we want to animate an offscreen object moving into the camera frame
                    // Normal animation: when we want to animate an onscreen object moving inside the camera frame
                    // Exit animation: when we want to animate an onscreen object moving outside the camera frame
                    this.entranceAnimationStateTimeEnd = 39;  // How long until object peaks in velocity (units are normal integers, not time)
                    this.entranceAnimationFullTimeEnd = 90;    /*How long until object stops (units are normal integers, not time) 
                                                                (Since we don't when an objects velocity hits 0, we decrease it for a while, until it stops.
                                                                Set this value to 3 * entranceAnimationStateTimeEnd or more to be safe (experiment). Setting it to
                                                                low can cause an object to have a permanent velocity, therby moving it out of the frame. 
                                                                Don't set it to high because this timer needs to run out before we can call another animation)
                                                                */
                    this.normalAnimationStateTimeEnd = 9; // Same as above
                    this.normalAnimationFullTimeEnd = 45; // Same as above
                    this.exitAnimationStateTimeEnd = 20;
                    this.exitAnimationFullTimeEnd = 200; // Same as above
                    this.pattern = ["left","left","left","down","down","down","right","right"]
                    break;
                case "plane3": // Normal 
                    this.node.addCollider(3.1,0.7,2.8);  
                    this.value = 5000;
                    this.maxSpeed = 3;
                    this.friction = 0.2;
                    this.acceleration = 8;
                    this.type = 1;
                    this.addVelocityX = vec3.set(vec3.create(), 0.1, 0, 0);
                    this.addVelocityY = vec3.set(vec3.create(), 0, 0.1, 0);
                    this.addVelocityZ = vec3.set(vec3.create(), 0, 0, 0.1);
                    this.addAngleX = 0.5;
                    this.addAngleZ = 1;
                    this.maxAngleX = 5;
                    this.maxAngleZ = 20;
                    this.modifier = 0.1;
                    this.entranceAnimationStateTimeEnd = 14.1;
                    this.entranceAnimationFullTimeEnd = 90;
                    this.normalAnimationStateTimeEnd = 4;
                    this.normalAnimationFullTimeEnd = 32;
                    this.exitAnimationStateTimeEnd = 20;
                    this.exitAnimationFullTimeEnd = 200;
                    this.pattern = ["right","right","left","left","left","left","right","right","up","down","down"]
                    break;
            }
        }
        this.paternIndex = 0;
        this.rotate(0,180,0)
        this.updateMatrix();
        this.updateTransform();
        this.velocity = vec3.fromValues(0,0,0);
        this.angleX = 0;
        this.angleZ = 0;
        this.isArmed = true;
        this.bulletSpeed = vec3.fromValues(0,0,10);
        this.bullets = new Array();

        this.entranceAnimation = false;  // Is true when entrance animation starts and turns false when it ends
        this.entranceAnimationStateComplete = false; // Is false when entrance animation starts and turns true when it peaks in acceleration
        this.entranceAnimationFullComplete = false; // Is false when entrance animation starts and acceleration peaks. It turns true when the full animation is complete
        this.entranceAnimationTimeBegin = 0; // Timer/counter

        this.normalAnimation = false;
        this.normalAnimationStateComplete = false;
        this.normalAnimationFullComplete = false;
        this.normalAnimationTimeBegin = 0;

        this.exitAnimation = false;
        this.exitAnimationStateComplete = false;
        this.exitAnimationFullComplete = false;
        this.exitAnimationTimeBegin = 0;

        this.shootingAnimationTimeBegin = 0;

        this.animationInProgress = false; // Used as a safety net so animation calls don't overlap

        this.animationCode = ""; // Animation code: up, down, left, right, bottom/suicide (moves towards the player on the Z axis). Based on player/camera perspective.
    }

    getPatern(){
        if(this.pattern.length<this.paternIndex) this.paternIndex = 0;
        return this.pattern[this.paternIndex++];
    }

    reset(){
        this.ttl = this.ttlreset;
        this.move(vec3.fromValues(0,0,50))
        this.updateMatrix();
        this.updateTransform();
        this.exitAnimation = false;
        this.exitAnimationStateComplete = false;
        this.exitAnimationFullComplete = false;
        this.exitAnimationTimeBegin = 0;
        this.normalAnimation = false;
        this.normalAnimationStateComplete = false;
        this.normalAnimationFullComplete = false;
        this.normalAnimationTimeBegin = 0;
        this.entranceAnimation = false; 
        this.entranceAnimationStateComplete = false; 
        this.entranceAnimationFullComplete = false; 
        this.entranceAnimationTimeBegin = 0; 
        this.animationInProgress = false;
    }

    /**
     * 
     * @param {Node} other 
     * @returns {boolean}
     */
    collide(other){
        return this.node.collide(other);
    }
    /**
     * 
     * @param {vec3} vector 
     */
    move(vector){
        this.node.move(vector);
    }
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    rotate(x,y,z){
        this.node.rotate(x,y,z);
    }
    updateMatrix(){
        this.node.updateMatrix();
    }
    updateTransform(){
        this.node.updateTransform();
    }   
    /**
     * 
     * @param {vec3} vector 
     */
    setPosition(vector){
        this.node.setPosition(vector);
    }

    moveUp(acc) {
        /*if (this.velocity[1] < 0) {
            vec3.scale(this.velocity, this.velocity, 0.9);
        }*/
        vec3.add(acc, acc, this.addVelocityY);
        this.angleX += this.addAngleX;
        if (this.angleX > this.maxAngleX) { // Maximum angle check so the object doesn't spin
            this.angleX = this.maxAngleX;
        }
    }

    moveDown(acc) {
        /*if (this.velocity[1] > 0) {
            vec3.scale(this.velocity, this.velocity, 0.9);
        }*/
        vec3.sub(acc, acc, this.addVelocityY);
        this.angleX -= this.addAngleX;
        if (this.angleX < -this.maxAngleX) {
            this.angleX = -this.maxAngleX;
        }
    }

    moveLeft(acc) {
        /*if (this.velocity[0] > 0) {
            vec3.scale(this.velocity, this.velocity, 0.9);
        }*/
        vec3.sub(acc, acc, this.addVelocityX);
        this.angleZ += this.addAngleZ;
        if (this.angleZ > this.maxAngleZ) {
            this.angleZ = this.maxAngleZ;
        }
    }

    moveRight(acc) {
        /*if (this.velocity[0] < 0) {
            vec3.scale(this.velocity, this.velocity, 0.9);
        }*/
        vec3.add(acc, acc, this.addVelocityX);
        this.angleZ -= this.addAngleZ;
        if (this.angleZ < -this.maxAngleZ) {
            this.angleZ = -this.maxAngleZ;
        }
    }

    moveBack(acc) {

    }

    initiateEntranceAnimation(animationCode) { // CALL THIS TO INITIATE ENTRANCE ANIMATION (CAN BE CALLED ONLY ONCE)
        if (!this.entranceAnimation && !this.entranceAnimationStateComplete && !this.entranceAnimationFullComplete && !this.animationInProgress) {
            this.entranceAnimation = true;
            this.animationCode = animationCode;
            this.entranceAnimationTimeBegin = 0;
            this.animationInProgress = true;
            this.shootingAnimationTimeBegin = 0;
        }
        
    }

    initiateNormalAnimation(animationCode) { // CALL THIS TO INITIATE NORMAL ANIMATION (CAN BE CALLED MULTIPLE TIMES; WAIT UNTIL PREVIOUS ANIMATION ENDS UNTIL NEXT CALL)
        if (!this.normalAnimation && this.entranceAnimationFullComplete && !this.normalAnimationStateComplete && !this.normalAnimationFullComplete && !this.animationInProgress) {
            this.normalAnimation = true;
            this.animationCode = animationCode;
            this.normalAnimationTimeBegin = 0;
            this.animationInProgress = true;
        }
    }

    initiateExitAnimation(animationCode) { // CALL THIS TO INITIATE EXIT ANIMATION (CAN BE CALLED ONLY ONCE)
        if (!this.exitAnimation && this.entranceAnimationFullComplete && !this.animationInProgress) {
            this.exitAnimation = true;
            this.animationCode = animationCode;
            this.exitAnimationTimeBegin = 0;
            this.animationInProgress = true;
            this.shootingAnimationTimeBegin = -1;
        }
    }

    animateEntrance(acc) {
        if (this.entranceAnimation && !this.entranceAnimationStateComplete && !this.entranceAnimationFullComplete && this.entranceAnimationTimeBegin < this.entranceAnimationStateTimeEnd) {
            switch (this.animationCode) {
                case "up":
                    this.moveUp(acc);
                    break;
                case "down":
                    this.moveDown(acc);
                    break;
                case "left":
                    this.moveLeft(acc);
                    break;
                case "right":
                    this.moveRight(acc);
                    break;
            }
            vec3.scaleAndAdd(this.velocity, this.velocity, acc, this.modifier * this.acceleration); // Velocity magic. Don't know how it works. dt (datetime) (see Player.updatePlayer()) replaced with this.modifier, due to inconsistent values
            const len = vec3.len(this.velocity);
            if (len > this.maxSpeed) {
                vec3.scale(this.velocity, this.velocity, this.maxSpeed / len);
            }
            this.entranceAnimationTimeBegin++; // Counter increase
            
        }
        else if (this.entranceAnimation && !this.entranceAnimationStateComplete && !this.entranceAnimationFullComplete && this.entranceAnimationTimeBegin >= this.entranceAnimationStateTimeEnd){
            this.entranceAnimationStateComplete = true; // When velocity peaks, we begin applying friction
        }
        else if (this.entranceAnimation && this.entranceAnimationStateComplete && !this.entranceAnimationFullComplete && this.entranceAnimationTimeBegin < this.entranceAnimationFullTimeEnd){
            vec3.scale(this.velocity, this.velocity, 1 - this.friction); // Apply friction
            if (this.angleX < 0) { // Decrase all angles to 0
                this.angleX += this.addAngleX;
            }
            else if (this.angleX > 0) {
                this.angleX -= this.addAngleX;     
            }
            if (this.angleZ < 0) {
                this.angleZ += this.addAngleZ;
            }
            else if (this.angleZ > 0) {
                this.angleZ -= this.addAngleZ;     
            }
            this.entranceAnimationTimeBegin++;
        }
        else if (this.entranceAnimationTimeBegin == this.entranceAnimationFullTimeEnd){ // When timer ends, end entrance animation
            this.entranceAnimation = false;
            this.entranceAnimationFullComplete = true;
            this.entranceAnimationTimeBegin = 0;
            this.animationInProgress = false;
        }
    }

    animateNormal(acc) {
        if (this.normalAnimation &&  this.entranceAnimationFullComplete && !this.normalAnimationStateComplete && !this.normalAnimationFullComplete && this.normalAnimationTimeBegin < this.normalAnimationStateTimeEnd) {
            switch (this.animationCode) {
                case "up":
                    this.moveUp(acc);
                    break;
                case "down":
                    this.moveDown(acc);
                    break;
                case "left":
                    this.moveLeft(acc);
                    break;
                case "right":
                    this.moveRight(acc);
                    break;
            }
            vec3.scaleAndAdd(this.velocity, this.velocity, acc, this.modifier * this.acceleration);
            const len = vec3.len(this.velocity);
            if (len > this.maxSpeed) {
                vec3.scale(this.velocity, this.velocity, this.maxSpeed / len);
            }
            this.normalAnimationTimeBegin++;
        }
        else if (this.normalAnimation &&  this.entranceAnimationFullComplete && !this.normalAnimationStateComplete && !this.normalAnimationFullComplete && this.normalAnimationTimeBegin >= this.normalAnimationStateTimeEnd){
            this.normalAnimationStateComplete = true;
        }
        else if (this.normalAnimation && this.entranceAnimationFullComplete && this.normalAnimationStateComplete && !this.normalAnimationFullComplete && this.normalAnimationTimeBegin < this.normalAnimationFullTimeEnd){
            vec3.scale(this.velocity, this.velocity, 1 - this.friction);
            if (this.angleX < 0) {
                this.angleX += this.addAngleX;
            }
            else if (this.angleX > 0) {
                this.angleX -= this.addAngleX;     
            }
            if (this.angleZ < 0) {
                this.angleZ += this.addAngleZ;
            }
            else if (this.angleZ > 0) {
                this.angleZ -= this.addAngleZ;     
            }
            this.normalAnimationTimeBegin++;
        }
        else if (this.normalAnimationTimeBegin == this.normalAnimationFullTimeEnd){
            this.normalAnimation = false;
            this.normalAnimationFullComplete = false;
            this.normalAnimationTimeBegin = 0;
            this.animationInProgress = false;
            this.normalAnimationStateComplete = false;
        }
    }

    animateExit(acc) {
        if (this.exitAnimation &&  this.entranceAnimationFullComplete && this.exitAnimationTimeBegin < this.exitAnimationFullTimeEnd) {
            switch (this.animationCode) {
                case "up":
                    this.moveUp(acc);
                    break;
                case "down":
                    this.moveDown(acc);
                    break;
                case "left":
                    this.moveLeft(acc);
                    break;
                case "right":
                    this.moveRight(acc);
                    break;
            }
            vec3.scaleAndAdd(this.velocity, this.velocity, acc, this.modifier * this.acceleration);
            const len = vec3.len(this.velocity);
            if (len > this.maxSpeed) {
                vec3.scale(this.velocity, this.velocity, this.maxSpeed / len);
            }
            this.exitAnimationTimeBegin++;
        }
        else if (this.exitAnimation &&  this.entranceAnimationFullComplete && this.exitAnimationTimeBegin >= this.exitAnimationFullTimeEnd){
            this.velocity = vec3.fromValues(0,0,0);
            this.entranceAnimationFullComplete = false;
            this.entranceAnimationStateComplete = false;
            this.angleX = 0;
            this.angleZ = 0;
            this.exitAnimation = false;
            this.animationInProgress = false;
            this.scene.remove(this.node); // Removes object from scene
        }
    }

    shootProjectile() {
        if (this.animationInProgress && this.shootingAnimationTimeBegin != -1) {
            this.shootingAnimationTimeBegin = 0;
        }
        else if (!this.animationInProgress && this.shootingAnimationTimeBegin != -1){
            this.shootingAnimationTimeBegin++;
        }
        if (!this.animationInProgress && this.entranceAnimationFullComplete && this.shootingAnimationTimeBegin != - 1 && this.shootingAnimationTimeBegin == 50) {
            SoundFX.play_laser_shot();
            this.isArmed = false;
            const bullet = this.bullet.clone();
            bullet.setPosition(vec3.clone(this.node.translation));
            vec3.add(bullet.translation, bullet.translation, vec3.set(vec3.create(), 0, -0.25, 1.7));
            this.scene.addNew(bullet);
            this.bullets.push(bullet);
            this.shootingAnimationTimeBegin = 0;
        }
    }

    updateEnemy() {
        let acc = vec3.set(vec3.create(), 0, 0, 0);
        this.ttl -=1;
        if(this.ttl<=0 && !this.animationInProgress) {
            this.paternIndex = 0;
            this.ttl = this.ttlstart+this.ttlwait;
            return -1;
        }
        // Entrance animation
        this.animateEntrance(acc);

        // Normal animation
        this.animateNormal(acc);

        // Exit animation
        this.animateExit(acc);

        this.shootProjectile();

        // Update matrix
        this.rotate(this.angleX, 180, this.angleZ);
        this.move(this.velocity);
        this.updateMatrix();
        this.updateTransform();

        for(const bullet of this.bullets){
            bullet.move( vec3.scale(vec3.create(), this.bulletSpeed, this.modifier));
            bullet.updateMatrix();
            bullet.updateTransform();
        }
    }

    checkCollision(){
        for(const other of this.scene.nodes.values()){
            if(other.name.includes("bullet") && this.node.collide(other)){
                SoundFX.play_boom();
                this.shootingAnimationTimeBegin = -1;
                this.scene.remove(other);
                this.scene.remove(this.node);
                this.setPosition(vec3.fromValues(0,0,50))
                return this.value;
            }

        }
        return 0;
    }
}