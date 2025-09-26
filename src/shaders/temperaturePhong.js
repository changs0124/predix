export const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  uniform vec3 uColorCold;
  uniform vec3 uColorHot;
  uniform float uColorMixFactor;
  uniform bool uIsDataAvailable;
  uniform vec3 uLightPosition;
  uniform vec3 uCameraPosition;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uLightPosition - vPosition);
    vec3 V = normalize(uCameraPosition - vPosition);
    vec3 R = reflect(-L, N);

    float diffuse = max(dot(N, L), 0.0);
    float shininess = 100.0;
    float specular = pow(max(dot(R, V), 0.0), shininess);
    vec3 specularColor = vec3(1.0) * specular;

    vec3 base = uIsDataAvailable
      ? mix(uColorCold, uColorHot, uColorMixFactor)
      : vec3(0.5);

    vec3 color = base * diffuse + specularColor;
    gl_FragColor = vec4(color, 1.0);
  }
`;