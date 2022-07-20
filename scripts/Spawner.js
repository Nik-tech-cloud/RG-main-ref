import { Animator } from './Animator.js';
import { Enemy } from './Enemy.js';
import { vec3 } from './lib/gl-matrix-module.js';

export class Spawner{
    /**
     * Creates animator class for constant node rotation and/or movement.
     * 
     * @param {Scene} scene - rendered scene
     * @param {Enemy[]} enemy - array of Enemies
     * @param {Node[]} rocks - array of rocks
     * @param {Node} shield - shield
     * @param {Node} crystal - crystal
     *
     */
    constructor(scene, enemy, rocks, shield, crystal){
        this.scene = scene;
        this.enemyList = enemy;

        this.lastActive = -1;
        this.activeEnemyIndex = 0

        this.rocks = rocks;
        this.rocks[0].addCollider(3.5, 5, 4.5)
        this.rocks[1].addCollider(2, 1.7, 1)
        this.rocks[2].addCollider(0.9, 1.3, 1.1)
        this.addRock(rocks[1])
        this.addRock(rocks[2])
        this.addRock(rocks[2])

        this.shield = shield;
        this.shield.addCollider(0.9, 1, 0.09);

        this.crystal = crystal;
        this.crystal.addCollider(0.9, 1, 0.9);

        for(const e of this.enemyList){
            this.scene.remove(e.node);
        }

        for(const e of this.rocks){
            this.scene.remove(e);
        }

        this.animators = [
            new Animator({ node: this.shield,   speed:  0.02, move: [0,0,-1], rotate: [0,4.5,0], scene: this.scene, random: true, respawn: -1000 }),
            new Animator({ node: this.crystal,  speed:  0.01, move: [0,0,-1], rotate: [0,  9,0], scene: this.scene, random: true, respawn: -350  }),
            new Animator({ node: this.rocks[0], speed:  0.01, move: [0,0,-1], rotate: [2,  9,4], scene: this.scene, random: true, feedback: true }),
            new Animator({ node: this.rocks[1], speed:  0.02, move: [0,0,-1], rotate: [3,4.5,1], scene: this.scene, random: true }),
            new Animator({ node: this.rocks[2], speed:  0.03, move: [0,0,-1], rotate: [5,  2,3], scene: this.scene, random: true }),
            new Animator({ node: this.rocks[3], speed:  0.025, move: [0,0,-1], rotate: [5,  2,3], scene: this.scene, random: true }),
            new Animator({ node: this.rocks[4], speed:  0.09, move: [0,0,-1], rotate: [5,  2,3], scene: this.scene, random: true }),
            new Animator({ node: this.rocks[5], speed:  0.06, move: [0,0,-1], rotate: [5,  2,3], scene: this.scene, random: true }),
        ]
        this.activeAnimators = [];
        this.reset()

    }

    /**
     * 
     * @param {boolean} p - pauses or unpauses currently animated objects
     */
    pause(p){
        for(let animator of this.animators) {
            animator.pause(p);
        }
    }

    reset(){
        for(let animator of this.activeAnimators){
            animator.reset();
            animator = null;
        }
        this.activeAnimators = [...this.animators];
        for(let enemy of this.enemyList) {
            enemy.reset()
        }
        this.enemies = false;
        this.stage = 0;
    }

    /**
     * 
     * @param {Node} obj 
     * @param {Node} bullet 
     */
    addEnemy(obj,bullet){
        let clone = obj.clone();
        this.scene.addNew(clone)
        this.enemyList.push(new Enemy(clone,bullet,this.scene));
    }

    /**
     * 
     * @param {Node} obj 
     */
    addRock(obj){
        let clone = obj.clone();
        this.scene.addNew(clone);
        this.rocks.push(clone);
    }

    checkCollision(){
        if(this.stage < 2){
            let temp = this.enemyList[this.activeEnemyIndex].checkCollision();
            if(temp>0) {
                this.lastActive = this.activeEnemyIndex;
                this.stage++;
                this.activeEnemyIndex = (this.activeEnemyIndex+1)%this.enemyList.length;
                this.enemyList[this.activeEnemyIndex].ttl = this.enemyList[this.activeEnemyIndex].ttlstart+50;
            }
            return temp;
        }
        return 0;
    }
    

    updateSpawner(){
        if(this.stage==2){
            if(this.enemies){
                this.enemies = false;
                for(let enemy of this.enemyList) {
                    enemy.reset()
                }
                this.stage = 0;
            }
            else{
                this.enemies = true;
                for(let animator of this.animators) {
                    animator.reset();
                }
                this.activeAnimators = [...this.animators];
                this.stage++;
            }
        }
        if(this.stage==3 || this.stage == 4){
            for(let animator of this.activeAnimators) {
                this.stage+=animator.animationUpdateAll() || 0;
            }
            for(let e of this.scene.nodes.values()){
                if (e.name.includes("bullet")){
                    for (let animator of this.animators) {
                        if (animator.node.collide(e)) {
                            this.scene.remove(e);
                        }
                    } 
                }
            }
        }else if(this.stage==5){
            for(let i = 0; i<this.activeAnimators.length;i++) {
                if(this.activeAnimators[i].isVisible()) this.activeAnimators[i].animationUpdateAll();
                else {
                    this.activeAnimators[i].reset()
                    this.activeAnimators.splice(i,1)
                }
            }
            if(this.activeAnimators == 0) this.stage = 2;
            for(let e of this.scene.nodes.values()){
                if (e.name.includes("bullet")){
                    for (let animator of this.animators) {
                        if (animator.node.collide(e)) {
                            this.scene.remove(e);
                        }
                    } 
                }
            }
        }
        else{
            let enemy =  this.enemyList[this.activeEnemyIndex]
            if(enemy.ttl == enemy.ttlstart) {
                this.scene.add(enemy.node)
                switch(enemy.getPatern()){
                    case "left":
                        enemy.setPosition(vec3.fromValues(15,0,-30));
                        enemy.updateMatrix();
                        enemy.updateTransform();
                        enemy.initiateEntranceAnimation("left");
                        break;
                    default:
                        enemy.setPosition(vec3.fromValues(-15,0,-30));
                        enemy.updateMatrix();
                        enemy.updateTransform();
                        enemy.initiateEntranceAnimation("right");
                        break;
                }

            }
            else if(enemy.ttl == enemy.ttlexit){
                enemy.initiateExitAnimation(enemy.getPatern());
                this.stage++;
                this.lastActive = this.activeEnemyIndex;
                this.activeEnemyIndex = (this.activeEnemyIndex+1)%this.enemyList.length;
            }else if(enemy.ttl%100==0){  
                enemy.initiateNormalAnimation(enemy.getPatern());
            }
            this.enemyList[this.activeEnemyIndex].updateEnemy()
            
        }
        if(this.lastActive != -1) this.lastActive = this.enemyList[this.lastActive].updateEnemy() || this.lastActive
        for(let e of this.scene.nodes.values()){
            if (e.name.includes("bullet") && e.translation[2] < -50) this.scene.remove(e);
        }
        
    }
}