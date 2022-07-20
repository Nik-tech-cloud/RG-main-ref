const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform mat4 uPMatrix;
uniform mat4 uVMatrix;
uniform mat4 uMMatrix;

uniform vec3 uLightPosition;
uniform vec3 uLightIntensity;

out vec3 vEye;
out vec3 vLight;
out vec3 vNormal;
out vec2 vTexCoord;
out float vAttenuation;


void main() {

    mat4 uViewModel = uVMatrix*uMMatrix;
    vec3 vertexPosition = (uViewModel * aPosition).xyz;
    vec3 lightPosition = (uVMatrix * vec4(uLightPosition, 1)).xyz;
    vEye = -vertexPosition;
    vLight = lightPosition - vertexPosition;
    vNormal = (uViewModel * vec4(aNormal, 0)).xyz;
    vTexCoord = aTexCoord;

    float d = distance(vertexPosition, lightPosition);
    vAttenuation = 1.0 / dot(uLightIntensity, vec3(1, d, d * d));

    gl_Position = uPMatrix * vec4(vertexPosition, 1);

}
`;

const fragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;
// r ... metallic, g ... roughness
uniform mediump sampler2D uRM;
uniform bool uIsRM;

uniform vec3 uLightColor;
uniform vec3 uAmbientColor;

in vec3 vEye;
in vec3 vLight;
in vec3 vNormal;
in vec2 vTexCoord;
in float vAttenuation;

out vec4 oColor;

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(vLight);
    vec3 E = normalize(vEye);
    vec3 R = normalize(reflect(-L, N));

    float lambert = max(0.0, dot(L, N));
    float phong = pow(max(0.0, dot(E, R)), 1.0);

    vec3 ambient = uAmbientColor;
    vec3 diffuse = uLightColor * lambert;
    vec3 specular = vec3(1,1,1) * phong;
   
   
    vec3 light = max((ambient + diffuse + specular) * vAttenuation,0.08);

    oColor = texture(uTexture, vTexCoord) * vec4(light, 1);
}
`;

const skyboxVertex = `#version 300 es
layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;


uniform mat4 uPMatrix;
uniform mat4 uVMatrix;
uniform mat4 uMMatrix;

out vec2 vTexCoord;
void main() {

    vTexCoord = aTexCoord;
    gl_Position = uPMatrix * uVMatrix *uMMatrix *aPosition;
}
`;

const skyboxFragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;

in vec2 vTexCoord;

out vec4 oColor;
void main() {
    oColor = texture(uTexture, vTexCoord);
}
`;

export const shaders = {
    simple: { "vertex":vertex, "fragment":fragment },
    skybox: { "vertex":skyboxVertex, "fragment":skyboxFragment}
};
