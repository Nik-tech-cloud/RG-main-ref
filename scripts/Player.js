import { vec3 } from './lib/gl-matrix-module.js';
import { SoundFX } from './SoundFX.js';

export class Player{
    constructor(node,bullet,scene) {
        this.node = node;
        this.scene = scene;
        this.node.addCollider(4.5,1,3.5)
        this.collider = this.node.collider;
        this.bullet = bullet;
        this.startPos = vec3.fromValues(0,-1.7,-4.6);
        this.bulletSpeed = vec3.fromValues(0,0,-10);
        this.bullets = new Array();

        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};

        this.velocity = vec3.fromValues(0,0,0);
        this.maxSpeed = 2;
        this.friction = 0.2;
        this.acceleration = 5;
        this.angleX = 0;
        this.angleZ = 0;
        this.isArmed = true;

        this.startPosition();

        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }
    getGlobalPosition(){
       return this.node.getGlobalPosition();
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

    startPosition(){
        this.velocity = vec3.fromValues(0,0,0);
        this.node.setPosition(this.startPos);
        this.node.updateMatrix();
        this.node.updateTransform();
    }

    angleCheck() {
        if (this.angleZ > 20) {
            this.angleZ = 20;
        }
        else if (this.angleZ < -20) {
            this.angleZ = -20;
        }
        if (this.angleX > 5) {
            this.angleX = 5;
        }
        else if (this.angleX < -5) {
            this.angleX = -5;
        }
    }

    /*moveOnRail(camera) {
        vec3.add(camera.getGlobalPosition(), camera.getGlobalPosition(), vec3.set(vec3.create(), 0, 0, -0.5));
        vec3.add(this.node.getGlobalPosition(), this.node.getGlobalPosition(), vec3.set(vec3.create(), 0, 0, -0.5));
    }*/

    outOfBoundsCheck(camera) {
        if (this.node.translation[0] > 4) {
            this.node.translation[0] = 4;
            this.velocity[0] = 0;
        }
        if (this.node.translation[0] < -4) {
            this.node.translation[0] = -4;
            this.velocity[0] = 0;
        }
        if (this.node.translation[1] > 3) {
            this.node.translation[1] = 3;
            this.velocity[1] = 0;
        }
        if (this.node.translation[1] < -3) {
            this.node.translation[1] = -3;
            this.velocity[1] = 0;
        }
    }

    shootProjectile() {
        SoundFX.play_laser_shot();
        this.isArmed = false;
        const bullet = this.bullet.clone();
        bullet.setPosition(vec3.clone(this.node.translation));
        vec3.add(bullet.translation, bullet.translation, vec3.set(vec3.create(), 0, -0.25, -1.7));
        this.scene.addNew(bullet);
        this.bullets.push(bullet);
    }

    checkInput(acc,dt) {
        // IGNORE THIS
        /*if (this.keys['KeyW'] && this.keys['KeyA'] && !this.keys['KeyS'] && !this.keys['KeyD']) {
            if (this.velocity[1] > 0 && this.velocity[0] < 0) {
                vec3.scale(this.velocity, this.velocity, 0.8);
            }
            vec3.add(acc, acc, vec3.set(vec3.create(), 0, 0.1, 0));
            vec3.sub(acc, acc, vec3.set(vec3.create(), 0.1, 0, 0));
            this.angleX += 0.5;
            this.angleZ += 1;
        }
        if (this.keys['KeyW'] && this.keys['KeyD'] && !this.keys['KeyA'] && !this.keys['KeyS']) {
            if (this.velocity[1] > 0 && this.velocity[0] > 0) {
                vec3.scale(this.velocity, this.velocity, 0.8);
            }
            vec3.add(acc, acc, vec3.set(vec3.create(), 0, 0.1, 0));
            vec3.add(acc, acc, vec3.set(vec3.create(), 0.1, 0, 0));
            this.angleX += 0.5;
            this.angleZ -= 1;
        }
        if (this.keys['KeyS'] && this.keys['KeyA'] && !this.keys['KeyW'] && !this.keys['KeyD']) {
            if (this.velocity[1] < 0 && this.velocity[0] < 0) {
                vec3.scale(this.velocity, this.velocity, 0.8);
            }
            vec3.sub(acc, acc, vec3.set(vec3.create(), 0, 0.1, 0));
            vec3.sub(acc, acc, vec3.set(vec3.create(), 0.1, 0, 0));
            this.angleX -= 0.5;
            this.angleZ += 1;
        }
        if (this.keys['KeyS'] && this.keys['KeyD'] && !this.keys['KeyW'] && !this.keys['KeyA']) {
            if (this.velocity[1] < 0 && this.velocity[0] > 0) {
                vec3.scale(this.velocity, this.velocity, 0.8);
            }
            vec3.sub(acc, acc, vec3.set(vec3.create(), 0, 0.1, 0));
            vec3.add(acc, acc, vec3.set(vec3.create(), 0.1, 0, 0));
            this.angleX -= 0.5;
            this.angleZ -= 1;
        }
        if (this.keys['KeyW'] && !this.keys['KeyS'] && !this.keys['KeyA'] && !this.keys['KeyD']) {
            if (this.velocity[1] < 0) {
                vec3.scale(this.velocity, this.velocity, 0.8);
            }
            vec3.add(acc, acc, vec3.set(vec3.create(), 0, 0.1, 0));
            this.angleX += 0.5;
        }
        else if (!this.keys['KeyW'] && !this.keys['KeyS'] && !this.keys['KeyA'] && !this.keys['KeyD'] && this.angleX > 0) {
            this.angleX -= 0.5;
        }
        if (this.keys['KeyS'] && !this.keys['KeyW'] && !this.keys['KeyA'] && !this.keys['KeyD']) {
            if (this.velocity[1] > 0) {
                vec3.scale(this.velocity, this.velocity, 0.8);
            }
            vec3.sub(acc, acc, vec3.set(vec3.create(), 0, 0.1, 0));
            this.angleX -= 0.5;
        }
        else if (!this.keys['KeyW'] && !this.keys['KeyS'] && !this.keys['KeyA'] && !this.keys['KeyD'] && this.angleX < 0) {
            this.angleX += 0.5;
        }
        if (this.keys['KeyD'] && !this.keys['KeyA'] && !this.keys['KeyW'] && !this.keys['KeyS']) {
            if (this.velocity[0] < 0) {
                vec3.scale(this.velocity, this.velocity, 0.8);
            }
            vec3.add(acc, acc, vec3.set(vec3.create(), 0.1, 0, 0));
            this.angleZ -= 1;
        }
        else if (!this.keys['KeyW'] && !this.keys['KeyS'] && !this.keys['KeyA'] && !this.keys['KeyD'] && this.angleZ < 0) {
            this.angleZ += 1;
        }
        if (this.keys['KeyA'] && !this.keys['KeyD'] && !this.keys['KeyW'] && !this.keys['KeyS']) {
            if (this.velocity[0] > 0) {
                vec3.scale(this.velocity, this.velocity, 0.8);
            }
            vec3.sub(acc, acc, vec3.set(vec3.create(), 0.1, 0, 0));
            this.angleZ += 1;
        }
        else if (!this.keys['KeyW'] && !this.keys['KeyS'] && !this.keys['KeyA'] && !this.keys['KeyD'] && this.angleZ > 0) {
            this.angleZ -= 1;
        }

        if (this.keys['Space'] && this.isArmed) {
            this.shootProjectile();
        }*/
        // IGNORE THIS

        if (this.keys['KeyW'] && !this.keys['KeyS']) {
            if (this.velocity[1] < 0) {
                vec3.scale(this.velocity, this.velocity, 0.9);
            }
            vec3.add(acc, acc, vec3.set(vec3.create(), 0, 0.1, 0));
            this.angleX += 0.5;
        }
        else if (this.angleX > 0) {
            this.angleX -= 0.5;
        }
        if (this.keys['KeyS'] && !this.keys['KeyW']) {
            if (this.velocity[1] > 0) {
                vec3.scale(this.velocity, this.velocity, 0.9);
            }
            vec3.sub(acc, acc, vec3.set(vec3.create(), 0, 0.1, 0));
            this.angleX -= 0.5;
        }
        else if (this.angleX < 0) {
            this.angleX += 0.5;
        }
        if (this.keys['KeyD'] && !this.keys['KeyA']) {
            if (this.velocity[0] < 0) {
                vec3.scale(this.velocity, this.velocity, 0.9);
            }
            vec3.add(acc, acc, vec3.set(vec3.create(), 0.1, 0, 0));
            this.angleZ -= 1;
        }
        else if (this.angleZ < 0) {
            this.angleZ += 1;
        }
        if (this.keys['KeyA'] && !this.keys['KeyD']) {
            if (this.velocity[0] > 0) {
                vec3.scale(this.velocity, this.velocity, 0.9);
            }
            vec3.sub(acc, acc, vec3.set(vec3.create(), 0.1, 0, 0));
            this.angleZ += 1;
        }
        else if (this.angleZ > 0) {
            this.angleZ -= 1;
        }

        if (this.keys['Space'] && this.isArmed) {
            this.shootProjectile();
        }
    }

    updatePlayer(dt, camera) {
        let acc = vec3.set(vec3.create(), 0, 0, 0);

        // update camera
        /*this.moveOnRail(camera);*/

        // check input
        this.checkInput(acc);

        // update velocity
        vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);
        // Check incline/decline and lean limit
        this.angleCheck();

        // if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            vec3.scale(this.velocity, this.velocity, 1 - this.friction);
        }

        // rearm
        if (!this.keys['Space'] && !this.isArmed) {
            this.isArmed = true;
        }

        // limit speed
        const len = vec3.len(this.velocity);
        if (len > this.maxSpeed) {
            vec3.scale(this.velocity, this.velocity, this.maxSpeed / len);
        }

        // apply movement
        this.node.move(this.velocity);
        //vec3.add(this.node.translation, this.node.translation, this.velocity);

        // check
        this.outOfBoundsCheck(camera);

        // apply angle
        this.node.rotate(this.angleX, 0, this.angleZ);
        //quat.fromEuler(this.node.rotation, this.angleX, 0, this.angleZ);

        // apply changes
        this.node.updateMatrix();
        this.node.updateTransform();
        camera.updateMatrix();
        camera.updateTransform();

        for(const bullet of this.bullets){
            bullet.move( vec3.scale(vec3.create(), this.bulletSpeed, dt ));
            bullet.updateMatrix();
            bullet.updateTransform();
        }


    }

    checkCollision(){
        for(const other of this.scene.nodes.values()){
            if(this.node != other && other.collider && this.node.collide(other)){
                this.scene.remove(other);
                switch(other.name){
                    case "shield":
                        SoundFX.play_shield_hit();
                        return [1,0];
                    case "crystal":
                        SoundFX.play_diamond_hit();
                        return [0,1000];
                    default:
                        SoundFX.play_ship_hit();
                        return [-1,0];
                }
            }

        }
        return [0,0];
    }



}
