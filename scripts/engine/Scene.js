import { Node } from './Node.js';

export class Scene {

    /**
     * 
     * @param {Object} options 
     * @param {Map} options.map assign a map
     * @param {Node[]} options.nodes converts array of nodes to map, if map is not defined
     */
    constructor(options = {}) {
        this.nodes = options.map || new Map((options.nodes || []).map(x => [x.name, x]))
    }

    /**
     * Adds existing node to the scene
     * @param {Node} node 
     */
    add(node){
        if(!this.nodes.has(node.name)) this.nodes.set(node.name,node);
    }

     /**
     * Renames node if it's name exists in the scene and adds it to it
     * @param {Node} node 
     */
    addNew(node) {
        let counter = 0;
        let name = node.name;
        while(this.nodes.has(name)){
            name = node.name+counter;
            counter++;
        }
        node.name = name;
        this.nodes.set(name,node);
    }

    /**
     * Removes a node
     * @param {Node} node 
     */
    remove(node){
        if(this.nodes.has(node.name))
            this.nodes.delete(node.name)
    }

    clone() {
        return new Scene({
            ...this,
            map: new Map([...this.nodes].map(node => [node[0],node[1].clone()])),
        });
    }
}
