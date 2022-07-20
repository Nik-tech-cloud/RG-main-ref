import { mat4 } from '../lib/gl-matrix-module.js';

export class Camera {

    constructor(options = {}) {
        this.node = options.node || null;
        this.projection = mat4.create(),
        this.matrix = options.matrix
            ? mat4.clone(options.matrix)
            : mat4.create();
    }

}
