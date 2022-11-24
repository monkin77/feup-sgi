#version 300 es
precision highp float;

in vec4 vFinalColor;
in vec2 vTextureCoord;

out vec4 fragColor;

uniform sampler2D uSampler;

uniform bool uUseTexture;

uniform float timeFactor;   // Time factor is a value between [0, 1.0]
uniform vec4 highlightColor;

void main() {
	// Branching should be reduced to a minimal. 
	// When based on a non-changing uniform, it is usually optimized.
    vec4 color;
	if (uUseTexture)
	{
		vec4 textureColor = texture(uSampler, vTextureCoord);
		color = textureColor * vFinalColor;
	}
	else
		color = vFinalColor;

    fragColor = mix(color, highlightColor, timeFactor);

}