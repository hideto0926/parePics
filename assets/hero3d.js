// pairPics — トップの壁を、斜めから正面へ回り込みながら寄る3D表示にする（three.js）。
// WebGL が使えない、または「視差効果を減らす」が有効な場合は、静止画のまま表示する。
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

const stage = document.querySelector("[data-hero3d]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (stage && !reduceMotion) init(stage);

async function init(stage) {
  const canvas = document.createElement("canvas");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  } catch {
    return; // WebGL が使えなければ静止画のまま
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1b1a18);
  const camera = new THREE.PerspectiveCamera(30, 0.8, 0.01, 100);

  // 壁（アプリで描いた全体像）。世界の大きさは幅 4 × 高さ 5
  const W = 4, H = 5;
  const loader = new THREE.TextureLoader();
  const [texture, frames] = await Promise.all([
    loader.loadAsync(stage.dataset.texture),
    fetch(stage.dataset.frames).then((r) => r.json()).catch(() => ({ glass: [] })),
  ]);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: texture })));

  // 額のガラスに映り込む光の帯（視点の回り込みに合わせてガラスの上を滑る）
  const sheens = frames.glass.map((g) => {
    // 額ごとに光の帯の画像を作る（複製すると中身が転送されず、壁の画像が映り込んでしまう）
    const tex = makeSheenTexture();
    const material = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(g.w * W, g.h * H), material);
    mesh.position.set((g.x + g.w / 2) * W - W / 2, H / 2 - (g.y + g.h / 2) * H, 0.002);
    scene.add(mesh);
    return { mesh, tex, center: mesh.position.x };
  });

  // 額のまとまりの中心へ寄る
  const bounds = frames.glass.reduce((b, g) => ({
    minX: Math.min(b.minX, g.x), maxX: Math.max(b.maxX, g.x + g.w),
    minY: Math.min(b.minY, g.y), maxY: Math.max(b.maxY, g.y + g.h),
  }), { minX: 0.3, maxX: 0.7, minY: 0.2, maxY: 0.6 });
  const target = new THREE.Vector3(((bounds.minX + bounds.maxX) / 2) * W - W / 2, H / 2 - ((bounds.minY + bounds.maxY) / 2) * H, 0);
  const start = { yaw: THREE.MathUtils.degToRad(32), width: W * 0.92, dx: -W * 0.08 };
  const end = { yaw: 0, width: W * 0.8, dx: 0 };

  const corners = [new THREE.Vector3(-W / 2, H / 2, 0), new THREE.Vector3(W / 2, H / 2, 0),
                   new THREE.Vector3(W / 2, -H / 2, 0), new THREE.Vector3(-W / 2, -H / 2, 0)];

  function placeCamera(yaw, width, dx) {
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const aim = target.clone().add(new THREE.Vector3(dx, 0, 0));
    let distance = (width / camera.aspect / 2) / Math.tan(vFov / 2);
    // 斜めのとき壁の外が映らないよう、必要なら近づく
    const put = (d) => {
      camera.position.set(aim.x + d * Math.sin(yaw), aim.y, d * Math.cos(yaw));
      camera.lookAt(aim);
      camera.updateMatrixWorld();
    };
    let lo = 0.2, hi = 1;
    put(distance);
    if (!covers()) {
      for (let i = 0; i < 18; i++) {
        const mid = (lo + hi) / 2;
        put(distance * mid);
        if (covers()) lo = mid; else hi = mid;
      }
      put(distance * lo);
    }
  }

  function covers() {
    const q = corners.map((c) => c.clone().project(camera));
    const screen = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    return screen.every(([x, y]) => q.every((a, i) => {
      const b = q[(i + 1) % 4];
      return (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x) <= 0;
    }));
  }

  function resize() {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  // 動き：静かに動き出し、静かに止まる。止まったあとは指やマウスでわずかに首を振る
  const duration = 5200;
  let startTime = null, pointer = 0, sway = 0;
  const ease = (t) => (1 - Math.cos(Math.PI * t)) / 2;

  function frame(now) {
    if (startTime === null) startTime = now;
    const t = Math.min(1, (now - startTime) / duration);
    const e = ease(t);
    sway += (pointer - sway) * 0.05;
    const yaw = start.yaw + (end.yaw - start.yaw) * e + THREE.MathUtils.degToRad(3) * sway * e;
    const width = start.width * Math.pow(end.width / start.width, e);
    const dx = start.dx + (end.dx - start.dx) * e;
    placeCamera(yaw, width, dx);

    const turn = Math.abs(yaw) / start.yaw;
    for (const s of sheens) {
      const parallax = (s.center - camera.position.x) / W;
      s.tex.offset.x = 0.55 - 1.1 * e + parallax * 0.4;
      s.mesh.material.opacity = 0.35 + 0.35 * turn;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  stage.addEventListener("pointermove", (ev) => {
    const r = stage.getBoundingClientRect();
    pointer = ((ev.clientX - r.left) / r.width - 0.5) * 2;
  });
  stage.addEventListener("pointerleave", () => { pointer = 0; });
  stage.addEventListener("click", () => { startTime = null; }); // もう一度再生

  // 画面に入ったら再生を始める
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      stage.classList.add("is-3d");
      requestAnimationFrame(frame);
    }
  }, { threshold: 0.3 });
  observer.observe(stage);
}

/// 斜めの光の帯（中央が明るく、両端へ柔らかく消える）。
function makeSheenTexture() {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 512;
  const g = c.getContext("2d");
  g.translate(256, 256);
  g.rotate(-Math.PI / 6);
  const grad = g.createLinearGradient(-90, 0, 90, 0);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.28)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.08)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(-90, -512, 180, 1024);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
