import { useEffect, useRef } from "react";

export default function ShaderBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    container.appendChild(canvas);
    gl.clearColor(0, 0, 0, 0);

    const vertex = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragment = `
      precision highp float;
      uniform float iTime;
      uniform vec3 iResolution;

      void main(){
        vec3 r = iResolution;
        vec3 FC = vec3(gl_FragCoord.xy, 0.0);
        float t = iTime;
        vec4 o = vec4(0.0);

        vec3 p;
        for(float i,z,f;i++<1e2;o.rgb+=(sin(p+p+z)+z)/z*f){
          p=z*normalize(FC.rgb*2.-r.xyy);for(f=1.;f++<9.;p+=sin(p.zxy*f+f-t)/f);
          z+=f=.01+.1*abs(dot(sin(p*.7),cos(p).yzx));
        }
        o=tanh(.02*o*o);

        gl_FragColor = vec4(o.rgb, 1.0);
      }
    `;

    function createShader(type: number, source: string) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertex);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragment);
    
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const timeLocation = gl.getUniformLocation(program, 'iTime');
    const resolutionLocation = gl.getUniformLocation(program, 'iResolution');

    function resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      gl.viewport(0, 0, width, height);
    }

    window.addEventListener('resize', resize);
    resize();

    let rafId = 0;
    const update = (t: number) => {
      rafId = requestAnimationFrame(update);
      
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      
      gl.uniform1f(timeLocation, t * 0.001);
      gl.uniform3f(resolutionLocation, canvas.width, canvas.height, canvas.width / canvas.height);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      container.removeChild(canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <div ref={containerRef} className="pointer-events-none fixed inset-0 z-0" />;
}