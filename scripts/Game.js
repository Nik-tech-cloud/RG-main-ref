import { Application } from './engine/Application.js';
import { GLTFLoader } from './engine/GLTFLoader.js';
import { Renderer } from './engine/Renderer.js';
import { UI } from './UI.js';
import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Spawner } from './Spawner.js';
import { Animator } from './Animator.js';
//import { vec3 } from './lib/gl-matrix-module.js';


class App extends Application {
    async start() {
        this.highscore = localStorage.getItem('highscore') || 0;
        this.score = 0;
        this.startShields = 5;
        this.shields = 0;
        this.paused = true;

        this.loader = new GLTFLoader();
        await this.loader.load('./models/scene.gltf');

        this.scene = await this.loader.loadScene(this.loader.defaultScene);

        this.camera = await this.loader.loadNode('camera_Orientation');

        if (!this.scene || !this.camera) {
            throw new Error('Scene or Camera not present in glTF');
        }

        if (!this.camera.camera) {
            throw new Error('Camera node does not contain a camera reference');
        }

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);

        this.bg = await this.loader.loadNode('BG');
        this.scene.remove(this.bg);
        
        this.bullet = await this.loader.loadNode('bullet');
        this.bullet.addCollider(0.05,0.05,0.14);

        this.plane = await this.loader.loadNode('plane2');
        this.player = new Player(this.plane,this.bullet,this.scene);
       
        this.spawner = new Spawner(this.scene, 
            //ttl < ttlexit < ttlstard
            [new Enemy({node: await this.loader.loadNode('plane'),bullet: this.bullet,scene: this.scene, ttl:50, ttlexit: 1050, ttlstart: 2000}),
            new Enemy({node: await this.loader.loadNode('plane3'),bullet: this.bullet,scene: this.scene, ttl:100, ttlexit: 1000, ttlstart: 2000})],
            await this.loader.loadNodes('rock1', 'rock2', 'rock3'),
            await this.loader.loadNode('shield'),
            await this.loader.loadNode('crystal')
        );

        // USED FOR ENEMY MOVEMENT TESTING
        /*   
        this.spawner.enemyList[0].node.translation = vec3.fromValues(0,-1.7,-20);
        this.spawner.enemyList[0].node.updateMatrix();
        this.spawner.enemyList[0].node.updateTransform();
        this.scene.add(this.spawner.enemyList[0].node);
        */

        this.ring = new Animator({ node: await this.loader.loadNode('ring'), speed: 0.0005, rotate: [0, -1, 0]});
        this.path1 = new Animator({ node: await this.loader.loadNode('path1'), speed: 0.01, move: [0, 0, -1], respawn: -220});
        this.path2 = new Animator({ node: await this.loader.loadNode('path2'), speed: 0.01, move: [0, 0, -1], respawn: -220});
        this.path3 = new Animator({ node: await this.loader.loadNode('path3'), speed: 0.01, move: [0, 0, -1], respawn: -220});
        this.path4 = new Animator({ node: await this.loader.loadNode('path4'), speed: 0.01, move: [0, 0, -1], respawn: -220});
        this.path5 = new Animator({ node: await this.loader.loadNode('path5'), speed: 0.01, move: [0, 0, -1], respawn: -220});
        this.path6 = new Animator({ node: await this.loader.loadNode('path6'), speed: 0.01, move: [0, 0, -1], respawn: -220});
        this.path7 = new Animator({ node: await this.loader.loadNode('path7'), speed: 0.01, move: [0, 0, -1], respawn: -220});

        this.sun = new Animator({ node: await this.loader.loadNode('sun'), speed:  0.0007, rotate: [1,-1,1]})

        this.light = await this.loader.loadNode('sunlight_Orientation');

        this.time = Date.now();
        this.startTime = this.time;

        this.resize();
        document.getElementById("loadingContainer").classList.add("hidden")
        this.loaded = true;
    }

    /**
     * 
     * @param {boolean} arg 
     */
    setPause(arg) {
        this.startTime = Date.now();
        this.paused = arg;
        this.spawner.pause(arg);
    }

    /**
     * 
     * @param {function setShields(number){}}
     * @param {function setScore(number){}} 
     * @param {function setHighscore(number){}} 
     * @param {function youDied(){}} 
     */
    setUIFunctions(setShields, setScore, setHighscore, youDied) {
        this.setShields = setShields;
        this.setScore = setScore;
        this.setHighscore = setHighscore;
        this.youDied = youDied;
    }

    newGame() {
        this.startTime = Date.now();
        this.spawner.reset()
        this.player.startPosition();
        this.score = 0;
        this.shields = this.startShields;
        this.setShields(this.startShields)
        this.setScore(0);
        this.setHighscore(this.highscore)
        this.paused = false;
    }

    update() {
        
        if (!this.paused) {
            this.time = Date.now();
            const dt = (this.time - this.startTime) * 0.001;
            this.startTime = this.time;
            this.player.updatePlayer(dt, this.camera.parent);
            const temp = this.player.checkCollision();
            this.shields += temp[0]; 
            this.score += temp[1];
            this.setShields(this.shields);
            this.score += this.spawner.checkCollision();
            this.setScore(this.score);
            if (this.shields == -1) {
                if (this.highscore < this.score) {
                    this.highscore = this.score;
                    localStorage.setItem('highscore', this.score)
                    this.setHighscore(this.highscore);
                }
                this.youDied();
                this.paused = true;
            }

            this.spawner.updateSpawner();

            // USED FOR ENEMY MOVEMENT TESTING
            /*
            this.spawner.enemyList[0].initiateEntranceAnimation("left"); // Entrance animation call
            this.spawner.enemyList[0].initiateNormalAnimation("right"); // Normal animation call. This doesn't overlap with the above line because entrance animation can be called only once and animations can't overlap.

            this.spawner.enemyList[0].updateEnemy();
            this.spawner.enemyList[0].node.updateMatrix();
            this.spawner.enemyList[0].node.updateTransform();
            this.spawner.enemyList[0].updateEnemy(); */

            
        }
        if(this.loaded){
            this.ring.animationRotate();
            this.path1.animationMove();
            this.path2.animationMove();
            this.path3.animationMove();
            this.path4.animationMove();
            this.path5.animationMove();
            this.path6.animationMove();
            this.path7.animationMove();
            this.sun.animationRotate();
        }
        
    }

    render() {
        if (this.renderer) {
            this.renderer.render(this.scene, this.camera, this.light, this.bg);
        }
    }


    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        const aspectRatio = w / h;

        if (this.camera) {
            this.camera.camera.aspect = aspectRatio;
            this.camera.camera.updateMatrix();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById("canvas");
    const app = new App(canvas);
    const ui = new UI(app);

    console.log(app)

});
