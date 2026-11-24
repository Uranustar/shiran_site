// "From chaos to calm" — an interactive WebGL particle field.
// Thousands of particles swirl like a storm; press & hold and they gather
// into a softly beating 3D heart. The cursor/finger pushes particles away.
// three.js is loaded lazily on the client only (SSR-safe, own chunk).
import { useEffect, useRef, useState } from "react";

export type HeartStatus = "idle" | "holding" | "calm" | "locked";
type Status = HeartStatus;

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform vec3 uMouse;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute vec3 aHeart;
  attribute vec4 aRand;
  varying vec3 vColor;
  varying float vAlpha;
  uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4;

  mat2 rot(float a){ float s=sin(a), c=cos(a); return mat2(c,-s,s,c); }

  void main() {
    // --- chaos: swirling storm ---
    vec3 p = position;
    float speed = 0.15 + aRand.x * 0.35;
    p.xz = rot(uTime * speed + aRand.y * 6.2831) * p.xz;
    p.y += sin(uTime * (0.6 + aRand.z) + aRand.w * 10.0) * 0.35;
    p.xy = rot(sin(uTime * 0.2 + aRand.x * 3.0) * 0.4) * p.xy;

    // --- calm: beating heart ---
    float beat = pow(abs(sin(uTime * 2.2)), 12.0) * 0.07 + pow(abs(sin(uTime * 2.2 + 0.35)), 16.0) * 0.04;
    vec3 h = aHeart * (1.0 + beat);
    h += 0.015 * vec3(sin(uTime * 3.0 + aRand.x * 20.0), cos(uTime * 2.0 + aRand.y * 20.0), 0.0);

    // per-particle staggered morph for an organic gather
    float m = smoothstep(aRand.w * 0.45, aRand.w * 0.45 + 0.55, uMorph);
    vec3 pos = mix(p, h, m);

    // --- cursor repulsion (in model space XY) ---
    vec2 d = pos.xy - uMouse.xy;
    float dist = length(d);
    float push = smoothstep(0.9, 0.0, dist) * uMouse.z;
    pos.xy += normalize(d + 1e-4) * push * 0.55 * (1.0 - 0.85 * m);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + aRand.z) * uPixelRatio * (1.0 / -mv.z);

    vec3 col = aRand.x < 0.45 ? uC1 : aRand.x < 0.7 ? uC2 : aRand.x < 0.88 ? uC3 : uC4;
    vColor = mix(col, uC4, push * 0.6);
    vAlpha = mix(0.55, 0.95, m);
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

export function heartLabel(status: HeartStatus) {
  return status === "locked"
    ? "הלב נשאר איתך 💛 · לחיצה משחררת"
    : status === "calm"
      ? "הנה. רגוע יותר. 💛"
      : status === "holding"
        ? "נושמים יחד…"
        : "לחצו והחזיקו";
}

/** Rejection-sample a volumetric 3D heart (implicit surface), biased to the shell. */
function sampleHeart(n: number) {
  const out = new Float32Array(n * 3);
  let i = 0;
  let guard = 0;
  while (i < n && guard < n * 200) {
    guard++;
    const x = (Math.random() * 2 - 1) * 1.3;
    const y = (Math.random() * 2 - 1) * 1.0; // depth
    const z = (Math.random() * 2 - 1) * 1.3; // vertical
    const a = x * x + (9 / 4) * y * y + z * z - 1;
    const f = a * a * a - x * x * z * z * z - (9 / 80) * y * y * z * z * z;
    if (f > 0) continue;
    // keep most points near the surface for a crisp silhouette
    if (f < -0.02 && Math.random() > 0.18) continue;
    out[i * 3] = x * 1.55;
    out[i * 3 + 1] = z * 1.55 + 0.15;
    out[i * 3 + 2] = y * 1.55;
    i++;
  }
  return out;
}

function sampleChaos(n: number) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    // flattened galaxy-ish disc with some volume
    const r = 1.2 + Math.pow(Math.random(), 0.6) * 3.2;
    const t = Math.random() * Math.PI * 2;
    out[i * 3] = Math.cos(t) * r;
    out[i * 3 + 1] = (Math.random() - 0.5) * 2.6;
    out[i * 3 + 2] = Math.sin(t) * r * 0.8;
  }
  return out;
}

export function ParticleHeart({
  className = "",
  offsetY = 0,
  showHint = true,
  onStatus,
}: {
  className?: string;
  /** shift the particle field vertically (world units, negative = down) */
  offsetY?: number;
  showHint?: boolean;
  onStatus?: (s: HeartStatus) => void;
}) {
  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;
  const hostRef = useRef<HTMLDivElement>(null);
  const holdRef = useRef(false);
  const [status, setStatus] = useState<Status>("idle");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const small = window.innerWidth < 768;
      const N = small ? 3500 : 7000;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        });
      } catch {
        setFailed(true);
        return;
      }
      const dpr = Math.min(window.devicePixelRatio, 2);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);
      host.appendChild(renderer.domElement);
      renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:pan-y";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0, 8.5);

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(sampleChaos(N), 3));
      geo.setAttribute("aHeart", new THREE.BufferAttribute(sampleHeart(N), 3));
      const rand = new Float32Array(N * 4);
      for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
      geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 4));

      const css = getComputedStyle(document.documentElement);
      const color = (v: string, fb: string) => {
        const c = new THREE.Color();
        try {
          // Resolve any CSS color (incl. oklch) through a canvas.
          const cv = document.createElement("canvas").getContext("2d")!;
          cv.fillStyle = fb;
          cv.fillStyle = css.getPropertyValue(v).trim() || fb;
          cv.fillRect(0, 0, 1, 1);
          const [r, g, b] = cv.getImageData(0, 0, 1, 1).data;
          c.setRGB(r! / 255, g! / 255, b! / 255, THREE.SRGBColorSpace);
        } catch {
          c.set(fb);
        }
        return c;
      };

      const uniforms = {
        uTime: { value: 0 },
        uMorph: { value: reduced ? 1 : 0 },
        uMouse: { value: new THREE.Vector3(99, 99, 0) },
        uPixelRatio: { value: dpr },
        uSize: { value: small ? 70 : 90 },
        uC1: { value: color("--primary", "#4fc3c9") },
        uC2: { value: color("--blossom", "#f2a7b8") },
        uC3: { value: color("--sun", "#f7d774") },
        uC4: { value: new THREE.Color("#fffaf0") },
      };
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geo, mat);
      points.position.y = offsetY;
      scene.add(points);

      const resize = () => {
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const narrow = w / h < 0.9;
        camera.position.z = narrow ? 13.5 : 8.5;
        points.position.y = narrow ? offsetY * 0.3 : offsetY;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      // pointer → model-space XY on z=0 plane
      const ndc = new THREE.Vector2();
      const ray = new THREE.Raycaster();
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const hit = new THREE.Vector3();
      let mouseTarget = 0;
      let tiltX = 0,
        tiltY = 0;
      const onMove = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        ndc.set(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          -((e.clientY - r.top) / r.height) * 2 + 1,
        );
        ray.setFromCamera(ndc, camera);
        if (ray.ray.intersectPlane(plane, hit)) {
          uniforms.uMouse.value.x = hit.x;
          uniforms.uMouse.value.y = hit.y - points.position.y;
        }
        mouseTarget = 1;
        tiltX = ndc.x;
        tiltY = ndc.y;
      };
      // Once the heart has fully formed it "locks" and stays after release.
      // A short click on a locked heart lets it go again.
      let locked = false;
      let calmFor = 0;
      let downAt = 0;
      let downWhileLocked = false;
      const onLeave = () => {
        mouseTarget = 0;
        tiltX = tiltY = 0;
        holdRef.current = false;
      };
      const onDown = (e: PointerEvent) => {
        onMove(e);
        holdRef.current = true;
        downAt = performance.now();
        downWhileLocked = locked;
      };
      const onUp = () => {
        if (holdRef.current && downWhileLocked && performance.now() - downAt < 350) {
          locked = false;
          calmFor = 0;
        }
        holdRef.current = false;
      };
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointerleave", onLeave);
      host.addEventListener("pointercancel", onLeave);
      window.addEventListener("pointerup", onUp);

      // Pause when off-screen.
      let visible = true;
      const io = new IntersectionObserver(([e]) => {
        visible = !!e?.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(loop);
      });
      io.observe(host);

      // A short intro demo so visitors discover the interaction.
      const t0 = performance.now();
      let lastStatus: Status = "idle";
      const clock = new THREE.Clock();
      let raf = 0;
      let morph = uniforms.uMorph.value;

      function loop() {
        raf = 0;
        if (disposed || !visible) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        uniforms.uTime.value += dt;
        const since = (performance.now() - t0) / 1000;
        const demo = since > 1.2 && since < 4.2;
        const holding = holdRef.current;
        if (holding && morph > 0.92) {
          calmFor += dt;
          if (calmFor > 0.5) locked = true;
        } else if (!holding) {
          calmFor = 0;
        }
        const want = reduced || holding || locked || demo ? 1 : 0;
        // gather slowly (like a breath), release a little faster
        morph += (want - morph) * (want > morph ? 1.6 : 2.4) * dt;
        uniforms.uMorph.value = morph;
        uniforms.uMouse.value.z += (mouseTarget - uniforms.uMouse.value.z) * 4 * dt;

        // a locked heart slowly sways to show off its depth
        const sway = locked && !holding ? Math.sin(uniforms.uTime.value * 0.6) * 0.45 : 0;
        points.rotation.y += (tiltX * 0.5 + sway - points.rotation.y) * 2 * dt;
        points.rotation.x += (-tiltY * 0.25 - points.rotation.x) * 2 * dt;
        if (morph < 0.5) points.rotation.z += dt * 0.03;
        else points.rotation.z += (0 - points.rotation.z) * 2 * dt;

        const s: Status = holding
          ? morph > 0.92
            ? "calm"
            : "holding"
          : locked
            ? "locked"
            : "idle";
        if (s !== lastStatus) {
          lastStatus = s;
          setStatus(s);
          onStatusRef.current?.(s);
        }
        renderer.render(scene, camera);
        if (!reduced) raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerdown", onDown);
        host.removeEventListener("pointerleave", onLeave);
        host.removeEventListener("pointercancel", onLeave);
        window.removeEventListener("pointerup", onUp);
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })().catch(() => setFailed(true));

    return () => {
      disposed = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = heartLabel(status);

  return (
    <div className={`${className || "relative"} select-none`}>
      <div
        ref={hostRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        role="img"
        aria-label="ענן חלקיקים אינטראקטיבי שמתאסף לצורת לב כשלוחצים ומחזיקים, ונשאר לב אחרי ששחררו"
        onContextMenu={(e) => e.preventDefault()}
      />
      {failed && (
        <div className="absolute inset-0 grid place-items-center text-[10rem] text-blossom">♥</div>
      )}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-5 flex justify-center ${showHint ? "" : "hidden"}`}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">
          <span
            className={`h-2 w-2 rounded-full transition-colors ${status === "idle" ? "bg-sun animate-pulse" : "bg-primary"}`}
          />
          {label}
        </span>
      </div>
    </div>
  );
}
