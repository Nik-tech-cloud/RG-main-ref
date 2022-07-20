import { mat4, mat3 } from '../lib/gl-matrix-module.js';

import { WebGL } from '../engine/WebGL.js';

import { shaders } from './shaders.js';

// This class prepares all assets for use with WebGL
// and takes care of rendering.

export class Renderer {

    constructor(gl) {
        this.gl = gl;
        this.glObjects = new Map();
        this.programs = WebGL.buildPrograms(gl, shaders);

    

        gl.clearColor(1, 1, 1, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
    }

    prepareBufferView(bufferView) {
        if (this.glObjects.has(bufferView)) {
            return this.glObjects.get(bufferView);
        }

        const buffer = new DataView(
            bufferView.buffer,
            bufferView.byteOffset,
            bufferView.byteLength);
        const glBuffer = WebGL.createBuffer(this.gl, {
            target : bufferView.target,
            data   : buffer
        });
        this.glObjects.set(bufferView, glBuffer);
        return glBuffer;
    }

    prepareSampler(sampler) {
        if (this.glObjects.has(sampler)) {
            return this.glObjects.get(sampler);
        }

        const glSampler = WebGL.createSampler(this.gl, sampler);
        this.glObjects.set(sampler, glSampler);
        return glSampler;
    }

    prepareImage(image) {
        if (this.glObjects.has(image)) {
            return this.glObjects.get(image);
        }

        const glTexture = WebGL.createTexture(this.gl, { image });
        this.glObjects.set(image, glTexture);
        return glTexture;
    }

    prepareTexture(texture) {
        const gl = this.gl;

        this.prepareSampler(texture.sampler);
        const glTexture = this.prepareImage(texture.image);

        const mipmapModes = [
            gl.NEAREST_MIPMAP_NEAREST,
            gl.NEAREST_MIPMAP_LINEAR,
            gl.LINEAR_MIPMAP_NEAREST,
            gl.LINEAR_MIPMAP_LINEAR,
        ];

        if (!texture.hasMipmaps && mipmapModes.includes(texture.sampler.min)) {
            gl.bindTexture(gl.TEXTURE_2D, glTexture);
            gl.generateMipmap(gl.TEXTURE_2D);
            texture.hasMipmaps = true;
        }
    }

    prepareMaterial(material) {
        if (material.baseColorTexture) {
            this.prepareTexture(material.baseColorTexture);
        }
        if (material.metallicRoughnessTexture) {
            this.prepareTexture(material.metallicRoughnessTexture);
        }
        if (material.normalTexture) {
            this.prepareTexture(material.normalTexture);
        }
        if (material.occlusionTexture) {
            this.prepareTexture(material.occlusionTexture);
        }
        if (material.emissiveTexture) {
            this.prepareTexture(material.emissiveTexture);
        }
    }

    preparePrimitive(primitive) {
        if (this.glObjects.has(primitive)) {
            return this.glObjects.get(primitive);
        }

        this.prepareMaterial(primitive.material);

        const gl = this.gl;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        if (primitive.indices) {
            const bufferView = primitive.indices.bufferView;
            bufferView.target = gl.ELEMENT_ARRAY_BUFFER;
            const buffer = this.prepareBufferView(bufferView);
            gl.bindBuffer(bufferView.target, buffer);
        }

        // this is an application-scoped convention, matching the shader
        const attributeNameToIndexMap = {
            POSITION   : 0,
            TEXCOORD_0 : 1,
            NORMAL     : 2
        };

        for (const name in primitive.attributes) {
            const accessor = primitive.attributes[name];
            const bufferView = accessor.bufferView;
            const attributeIndex = attributeNameToIndexMap[name];

            if (attributeIndex !== undefined) {
                bufferView.target = gl.ARRAY_BUFFER;
                const buffer = this.prepareBufferView(bufferView);
                gl.bindBuffer(bufferView.target, buffer);
                gl.enableVertexAttribArray(attributeIndex);
                gl.vertexAttribPointer(
                    attributeIndex,
                    accessor.numComponents,
                    accessor.componentType,
                    accessor.normalized,
                    bufferView.byteStride,
                    accessor.byteOffset);
            }
        }

        this.glObjects.set(primitive, vao);
        return vao;
    }

    prepareMesh(mesh) {
        for (const primitive of mesh.primitives) {
            this.preparePrimitive(primitive);
        }
    }

    prepareNode(node) {
        if (node.mesh) {
            this.prepareMesh(node.mesh);
        }
        for (const child of node.children.values()) {
            this.prepareNode(child);
        }
    }

    prepareScene(scene) {
        for (const node of scene.nodes.values()) {
            this.prepareNode(node);
        }
    }

    getViewProjectionMatrix(camera) {
        const mvpMatrix = mat4.clone(camera.matrix);
        let parent = camera.parent;
        while (parent) {
            mat4.mul(mvpMatrix, parent.matrix, mvpMatrix);
            parent = parent.parent;
        }
        mat4.invert(mvpMatrix, mvpMatrix);
        mat4.mul(mvpMatrix, camera.camera.matrix, mvpMatrix);
        return mvpMatrix;
    }

    render(scene, camera, light, bg) {
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const mVMatrix = mat4.invert(mat4.create(), camera.getGlobalTransform())
        const mPMatrix = mat4.clone(camera.camera.matrix)

        gl.disable(gl.DEPTH_TEST);
        const skyprogram = this.programs.skybox;
        gl.useProgram(skyprogram.program);
        gl.uniform1i(skyprogram.uniforms.uTexture, 0);
        this.renderNode(bg, mVMatrix,mPMatrix,skyprogram);
        
        gl.enable(gl.DEPTH_TEST);

        const program = this.programs.simple;
        gl.useProgram(program.program);
        gl.uniform1i(program.uniforms.uTexture, 0);
        gl.uniform1i(program.uniforms.uRM, 1);
        gl.uniform3fv(program.uniforms.uLightPosition, light.getGlobalPosition());
        gl.uniform3fv(program.uniforms.uLightColor, light.light.color);
        gl.uniform3fv(program.uniforms.uLightIntensity, light.light.intensity);
        gl.uniform1f(program.uniforms.uAmbientColor, light.light.ambient);


        for (const node of scene.nodes.values()) {
            
            this.renderNode(node, mVMatrix,mPMatrix, program);
        }

        
        
    }


    renderNode(node, mVMatrix,mPMatrix, program) {
        const gl = this.gl;

        if (node.mesh) {
            gl.uniformMatrix4fv(program.uniforms.uVMatrix, false, mVMatrix);
            gl.uniformMatrix4fv(program.uniforms.uPMatrix, false, mPMatrix);
            gl.uniformMatrix4fv(program.uniforms.uMMatrix, false, node.getGlobalTransform());
            for (const primitive of node.mesh.primitives) {
                this.renderPrimitive(primitive, program);
            }
        }

        for (const child of node.children.values()) {
            this.renderNode(child, mVMatrix,mPMatrix, program);
        }
    }

    renderPrimitive(primitive, program) {

        const gl = this.gl;
        const vao = this.glObjects.get(primitive);
        const material = primitive.material;
        
        const texture = material.baseColorTexture;
        const glTexture = this.glObjects.get(texture.image);
        const glSampler = this.glObjects.get(texture.sampler);

        
      
        gl.bindVertexArray(vao);
        gl.activeTexture(gl.TEXTURE0+0);
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.bindSampler(0, glSampler);

        if(material.metallicRoughnessTexture){
            const textureMR = material.metallicRoughnessTexture;
            const glTextureMR = this.glObjects.get(textureMR.image);
            const glSamplerMR = this.glObjects.get(textureMR.sampler);
            gl.activeTexture(gl.TEXTURE0+1);
            gl.bindTexture(gl.TEXTURE_2D, glTextureMR);
            gl.bindSampler(1, glSamplerMR);
            gl.uniform1i(program.uniforms.uIsRM, 1);
        }else{
            gl.uniform1i(program.uniforms.uIsRM, 0);
        }
        
        if (primitive.indices) {
            const mode = primitive.mode;
            const count = primitive.indices.count;
            const type = primitive.indices.componentType;
            gl.drawElements(mode, count, type, 0);
        } else {
            const mode = primitive.mode;
            const count = primitive.attributes.POSITION.count;
            gl.drawArrays(mode, 0, count);
        }
    }

}
