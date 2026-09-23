// pairPics — 3つのギャラリー（森・コンクリートの美術館・海のガラス美術館）を three.js で動かす。
// 画面に近づいた情景から作り、見えている情景だけ描く。
// WebGL が使えない、または「視差効果を減らす」が有効な場合は、挿絵（静止画）のまま表示する。
import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const builders = { forest: buildForest, museum: buildMuseum, sea: buildSea };

if (!reduceMotion) {
  for (const stage of document.querySelectorAll("[data-g3d]")) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        start(stage);
      }
    }, { rootMargin: "300px 0px" });
    observer.observe(stage);
  }
}

async function start(stage) {
  const canvas = document.createElement("canvas");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch {
    return; // WebGL が使えなければ挿絵のまま
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  stage.appendChild(canvas);

  const camera = new THREE.PerspectiveCamera(50, 0.8, 0.05, 300);
  const ctx = { renderer, camera, stage, root: stage.dataset.root || "", loader: new THREE.TextureLoader() };
  let view;
  try {
    view = await builders[stage.dataset.g3d](ctx);
  } catch (error) {
    console.warn("pairPics gallery:", error);
    canvas.remove();
    renderer.dispose();
    return;
  }

  // 指・マウスでわずかに見回す（ページのスクロールは妨げない）
  const input = { x: 0, y: 0, sx: 0, sy: 0 };
  stage.addEventListener("pointermove", (ev) => {
    const r = stage.getBoundingClientRect();
    input.x = ((ev.clientX - r.left) / r.width - 0.5) * 2;
    input.y = ((ev.clientY - r.top) / r.height - 0.5) * 2;
  });
  stage.addEventListener("pointerleave", () => { input.x = 0; input.y = 0; });

  // 情景が画面を通り過ぎる割合（0 → 1）。スクロールで奥へ進む
  const progress = () => {
    const r = stage.getBoundingClientRect();
    return THREE.MathUtils.clamp((window.innerHeight - r.top) / (window.innerHeight + r.height), 0, 1);
  };

  function resize() {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  let visible = true, running = false, time = 0, last = 0, scroll = progress(), shown = false;
  function frame(now) {
    if (!visible) { running = false; return; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;
    input.sx += (input.x - input.sx) * 0.04;
    input.sy += (input.y - input.sy) * 0.04;
    scroll += (progress() - scroll) * 0.06;
    view.update({ time, dt, scroll, pointer: { x: input.sx, y: input.sy } });
    renderer.render(view.scene, camera);
    if (!shown) { shown = true; stage.classList.add("is-3d"); }
    requestAnimationFrame(frame);
  }
  function kick() {
    if (running || !visible) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }
  new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    kick();
  }).observe(stage);
  kick();
}

/* ───────────── 森の美術館 ───────────── */

async function buildForest(ctx) {
  const { camera } = ctx;
  const scene = new THREE.Scene();
  const [pano, bark, ground] = await Promise.all([
    loadTex(ctx, "forest_pano.jpg"),
    loadTex(ctx, "bark.jpg", [1.5, 7]),
    loadTex(ctx, "ground.jpg", [36, 36]),
  ]);
  pano.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = pano;
  scene.environment = pano;
  scene.backgroundIntensity = 0.9;
  scene.environmentIntensity = 0.55;
  scene.fog = new THREE.FogExp2(0x9fa996, 0.036);
  ctx.renderer.toneMappingExposure = 1.05;
  camera.fov = 50;

  scene.add(new THREE.HemisphereLight(0xe6efd6, 0x3d3528, 0.9));
  const sun = new THREE.DirectionalLight(0xffe1ad, 2.4);
  sun.position.set(5, 14, -22);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xdce6f5, 0.7);
  fill.position.set(0, 4, 10);
  scene.add(fill);

  // 林床
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120),
    new THREE.MeshStandardMaterial({ map: ground, color: 0xc2b8a2, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // 幹（根もとを軸にゆっくりしなる）。歩く道筋と額のまわりは空ける
  const rand = seeded(7);
  const trunkGeo = new THREE.CylinderGeometry(0.72, 1, 1, 14, 1, true).translate(0, 0.5, 0);
  const trunkMat = new THREE.MeshStandardMaterial({ map: bark, color: 0xb9ab98, roughness: 0.95 });
  const trees = [];
  for (let i = 0; i < 90 && trees.length < 70; i++) {
    const x = (rand() - 0.5) * 30, z = 6 - rand() * 50;
    if (Math.abs(x) < 1.4 + (z < -22 ? 0 : 1.6)) continue;
    const r = 0.14 + rand() * 0.3;
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.scale.set(r, 20 + rand() * 6, r);
    trunk.position.set(x, 0, z);
    trunk.rotation.y = rand() * Math.PI * 2;
    scene.add(trunk);
    trees.push({ mesh: trunk, phase: rand() * 10, amount: 0.004 + rand() * 0.006 });
  }

  // 葉のかたまり（逆光で透ける緑）
  const leafTex = canvasTex(256, 256, drawLeaves);
  const leaves = [];
  for (let i = 0; i < 46; i++) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: leafTex, color: new THREE.Color().setHSL(0.24 + rand() * 0.06, 0.35, 0.34 + rand() * 0.18),
      transparent: true, depthWrite: false,
    }));
    const s = 3 + rand() * 4;
    sprite.scale.set(s, s * 0.7, 1);
    sprite.position.set((rand() - 0.5) * 26, 7 + rand() * 7, 4 - rand() * 44);
    scene.add(sprite);
    leaves.push({ sprite, base: sprite.position.clone(), phase: rand() * 10 });
  }

  // 光の柱と光だまり（加算。霧の影響は受けない）
  const shaftTex = canvasTex(128, 512, drawShaft);
  const shafts = [];
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4 + rand() * 1.6, 17), new THREE.MeshBasicMaterial({
      map: shaftTex, color: 0xffeecb, transparent: true, opacity: 0, fog: false,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    }));
    const x = (rand() - 0.5) * 12, z = -2 - rand() * 26;
    m.position.set(x, 7.2, z);
    m.rotation.set(0, (rand() - 0.5) * 0.8, -0.32);
    scene.add(m);
    shafts.push({ mesh: m, base: 0.1 + rand() * 0.12, phase: rand() * 10 });
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), new THREE.MeshBasicMaterial({
      map: glowTex(), color: 0xffe6b0, transparent: true, opacity: 0.22, fog: false,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(x + 2.6, 0.02, z);
    scene.add(pool);
  }

  // 舞う光の粒
  const moteCount = 520;
  const motePos = new Float32Array(moteCount * 3);
  const moteSeed = [];
  for (let i = 0; i < moteCount; i++) {
    moteSeed.push({ x: (rand() - 0.5) * 14, y: rand() * 6, z: 5 - rand() * 32, s: 0.1 + rand() * 0.25, p: rand() * 10 });
  }
  const motesGeo = new THREE.BufferGeometry();
  motesGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
  const motes = new THREE.Points(motesGeo, new THREE.PointsMaterial({
    map: glowTex(), color: 0xfff1c8, size: 0.07, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  }));
  scene.add(motes);

  // 木漏れ日がレンズに入る「きらり」
  const glint = new THREE.Sprite(new THREE.SpriteMaterial({
    map: canvasTex(256, 256, drawStar), color: 0xfff4d6, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  }));
  glint.position.set(4.5, 11, -30);
  glint.scale.set(9, 9, 1);
  scene.add(glint);

  // 浮かぶ額（道の左右に振り分ける）
  const arts = [
    ["sunset", 0.9, 1.12], ["hills", 1.2, 0.84], ["vase", 0.9, 0.9], ["mountains", 1.2, 0.84], ["trees", 0.9, 1.12],
  ];
  const frames = arts.map(([name, w, h], i) => {
    const f = makeFrame(ART[name], w, h, { frame: 0x5b3b26, mat: 0.13 });
    const side = i % 2 ? 1 : -1;
    f.group.position.set(side * 1.75, 1.7, -2.5 - i * 4.2);
    f.group.rotation.y = -side * 0.5;
    scene.add(f.group);
    return { ...f, y: 1.7, phase: i * 1.7 };
  });

  const look = new THREE.Vector3();
  return {
    scene,
    update({ time, scroll, pointer }) {
      const walk = THREE.MathUtils.smoothstep(scroll, 0.12, 0.95);
      const z = 3.2 - 15 * walk - Math.sin(time * 0.12) * 0.8;
      const x = Math.sin(z * 0.22) * 0.35;
      camera.position.set(x, 1.62 + Math.sin(time * 1.3) * 0.012, z);
      look.set(x + pointer.x * 1.8 + Math.sin(time * 0.2) * 0.3, 1.7 - pointer.y * 0.7, z - 6);
      camera.lookAt(look);

      for (const t of trees) {
        t.mesh.rotation.z = Math.sin(time * 0.55 + t.phase) * t.amount;
        t.mesh.rotation.x = Math.cos(time * 0.4 + t.phase) * t.amount * 0.6;
      }
      for (const l of leaves) {
        l.sprite.position.x = l.base.x + Math.sin(time * 0.5 + l.phase) * 0.25;
        l.sprite.position.y = l.base.y + Math.cos(time * 0.4 + l.phase) * 0.1;
      }
      for (const s of shafts) s.mesh.material.opacity = s.base * (0.75 + 0.25 * Math.sin(time * 0.35 + s.phase));
      moteSeed.forEach((m, i) => {
        motePos[i * 3] = m.x + Math.sin(time * 0.3 + m.p) * 0.4;
        motePos[i * 3 + 1] = (m.y + time * m.s * 0.25) % 6;
        motePos[i * 3 + 2] = m.z + Math.cos(time * 0.25 + m.p) * 0.3;
      });
      motesGeo.attributes.position.needsUpdate = true;

      const flash = Math.pow(Math.max(0, Math.sin(time * 0.45)), 14);
      glint.material.opacity = 0.25 + 0.75 * flash;
      glint.material.rotation = time * 0.05;

      for (const f of frames) {
        f.group.position.y = f.y + Math.sin(time * 0.8 + f.phase) * 0.035;
        f.sheen.offset.x = 0.6 - (camera.position.x - f.group.position.x) * 0.25 - (camera.position.z - f.group.position.z) * 0.04;
      }
    },
  };
}

/* ───────────── コンクリートの美術館 ───────────── */

async function buildMuseum(ctx) {
  const { camera, renderer } = ctx;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2c3238);
  renderer.toneMappingExposure = 0.95;
  camera.fov = 55;

  const [wallImg, floorTex] = await Promise.all([
    loadTex(ctx, "concrete_wall.jpg"),
    loadTex(ctx, "concrete_floor.jpg", [6, 8]),
  ]);
  const concrete = formworkTexture(wallImg.image);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const W = 22, H = 20, Z0 = 7, Z1 = -26;
  const D = Z0 - Z1;
  const wallMat = (w, h) => {
    const t = concrete.clone();
    t.needsUpdate = true;
    t.repeat.set(w / 3.6, h / 3.6);
    return new THREE.MeshStandardMaterial({ map: t, color: 0xaeb0ac, roughness: 0.95 });
  };
  const plane = (w, h, mat, pos, rotY = 0, rotX = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.copy(pos);
    m.rotation.set(rotX, rotY, 0, "YXZ");
    scene.add(m);
    return m;
  };
  plane(W, H, wallMat(W, H), new THREE.Vector3(0, H / 2, Z1));
  plane(D, H, wallMat(D, H), new THREE.Vector3(-W / 2, H / 2, (Z0 + Z1) / 2), Math.PI / 2);
  plane(D, H, wallMat(D, H), new THREE.Vector3(W / 2, H / 2, (Z0 + Z1) / 2), -Math.PI / 2);
  plane(W, H, wallMat(W, H), new THREE.Vector3(0, H / 2, Z0), Math.PI);
  plane(W, D, new THREE.MeshStandardMaterial({ color: 0x5d6166, roughness: 1 }), new THREE.Vector3(0, H, (Z0 + Z1) / 2), 0, Math.PI / 2);

  // 磨いたコンクリートの床（うっすら映り込む）
  const mirror = new Reflector(new THREE.PlaneGeometry(W, D), {
    textureWidth: 1024, textureHeight: 1024, color: 0x8a9096, clipBias: 0.003,
  });
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.set(0, 0, (Z0 + Z1) / 2);
  scene.add(mirror);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({
    map: floorTex, color: 0xa4a6a4, roughness: 0.55, transparent: true, opacity: 0.84,
  }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.002, (Z0 + Z1) / 2);
  scene.add(floor);

  // 天井の細いスリットと、そこから落ちる光
  const slit = new THREE.Mesh(new THREE.PlaneGeometry(0.5, D - 4), new THREE.MeshBasicMaterial({ color: 0xf6f3ea }));
  slit.rotation.x = Math.PI / 2;
  slit.position.set(-4, H - 0.01, (Z0 + Z1) / 2);
  scene.add(slit);
  const shaftTex = canvasTex(128, 512, drawShaft);
  const skyShafts = [];
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, H * 1.05), new THREE.MeshBasicMaterial({
      map: shaftTex, color: 0xfff3dc, transparent: true, opacity: 0.08,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    }));
    m.position.set(-2.4, H / 2, 2 - i * 6.2);
    m.rotation.set(0, 0.2, -0.17);
    scene.add(m);
    skyShafts.push({ mesh: m, phase: i * 1.3 });
  }

  scene.add(new THREE.AmbientLight(0x9aa4ae, 0.28));
  scene.add(new THREE.HemisphereLight(0xe0e6ec, 0x3a3f45, 0.35));
  const sky = new THREE.DirectionalLight(0xfff2dc, 0.9);
  sky.position.set(-6, 20, 2);
  scene.add(sky);

  // 展示室の大きな一枚（額もマットもないアクリルパネル）
  const bigW = 7.2, bigH = 10.4, bigY = 1.4 + bigH / 2;
  const big = new THREE.Group();
  const shadowPanel = new THREE.Mesh(new THREE.PlaneGeometry(bigW, bigH), new THREE.MeshBasicMaterial({ color: 0x1d2227, transparent: true, opacity: 0.45 }));
  shadowPanel.position.set(0.08, -0.1, -0.02);
  big.add(shadowPanel);
  big.add(new THREE.Mesh(new THREE.BoxGeometry(bigW, bigH, 0.04), new THREE.MeshStandardMaterial({ color: 0xdfe4e8, roughness: 0.2 })));
  const bigArt = new THREE.Mesh(new THREE.PlaneGeometry(bigW, bigH), new THREE.MeshStandardMaterial({
    map: canvasTex(900, 1300, ART.alps), roughness: 0.3,
  }));
  bigArt.position.z = 0.021;
  big.add(bigArt);
  const bigSheen = sheenMesh(bigW, bigH);
  bigSheen.mesh.position.z = 0.03;
  big.add(bigSheen.mesh);
  big.position.set(0, bigY, Z1 + 0.04);
  scene.add(big);

  // 左の壁の額と、右の壁の案内書き
  const side = [["hills", 1.3, 0.9, -3], ["vase", 1.0, 1.0, -9]].map(([name, w, h, z]) => {
    const f = makeFrame(ART[name], w, h, { frame: 0x6a4a31, mat: 0.16 });
    f.group.position.set(-W / 2 + 0.05, 1.8, z);
    f.group.rotation.y = Math.PI / 2;
    scene.add(f.group);
    return f;
  });
  const caption = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshStandardMaterial({
    map: canvasTex(960, 480, drawCaption), roughness: 0.9,
  }));
  caption.position.set(W / 2 - 0.02, 2.1, -4);
  caption.rotation.y = -Math.PI / 2;
  scene.add(caption);

  // スポットの光（光の円錐も見せる）
  const spot = (from, to, angle, intensity, cone) => {
    const s = new THREE.SpotLight(0xfff0d6, intensity, 0, angle, 0.55, 0);
    s.position.copy(from);
    s.target.position.copy(to);
    scene.add(s, s.target);
    if (cone) scene.add(lightCone(from, to, angle, cone));
  };
  spot(new THREE.Vector3(-2.2, H - 0.3, Z1 + 9), new THREE.Vector3(-0.8, bigY - 2.6, Z1), 0.2, 5, 0.06);
  spot(new THREE.Vector3(2.2, H - 0.3, Z1 + 9), new THREE.Vector3(0.8, bigY - 2.6, Z1), 0.2, 5, 0.06);
  spot(new THREE.Vector3(-1.6, H - 0.3, Z1 + 6), new THREE.Vector3(-0.6, bigY + 2.4, Z1), 0.18, 4, 0.05);
  spot(new THREE.Vector3(1.6, H - 0.3, Z1 + 6), new THREE.Vector3(0.6, bigY + 2.4, Z1), 0.18, 4, 0.05);
  for (const f of side) spot(new THREE.Vector3(-W / 2 + 3.5, 8, f.group.position.z), f.group.position, 0.15, 4, 0.05);

  // 金色の球体（大きさ違い）
  const gold = new THREE.MeshStandardMaterial({ color: 0xdcb45c, metalness: 1, roughness: 0.16, envMap, envMapIntensity: 1.1 });
  for (const [r, x, z] of [[2.5, -6.2, -15], [1.3, 6.2, -10.5], [0.7, 4.2, -18]]) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 48), gold);
    ball.position.set(x, r, z);
    scene.add(ball);
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(r * 3.2, r * 3.2), new THREE.MeshBasicMaterial({
      map: glowTex(), color: 0x14191e, transparent: true, opacity: 0.55, depthWrite: false,
    }));
    contact.rotation.x = -Math.PI / 2;
    contact.position.set(x, 0.01, z);
    scene.add(contact);
  }

  // 半透明の人影（巨大な写真の大きさを伝える）
  const figTex = canvasTex(160, 480, drawFigure);
  const figures = [[-2.8, -21.5, 1], [2.3, -20.5, 0.96], [3.6, -23, 1.04], [-7.6, -7, 0.98], [7.8, -15.5, 1], [-1.9, -13.2, 0.95]].map(([x, z, s], i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62 * s, 1.75 * s).translate(0, 0.875 * s, 0), new THREE.MeshBasicMaterial({
      map: figTex, color: 0x6d757d, transparent: true, opacity: 0.62, depthWrite: false,
    }));
    m.position.set(x, 0, z);
    scene.add(m);
    return { mesh: m, x, walk: i === 3 };
  });

  const look = new THREE.Vector3();
  return {
    scene,
    update({ time, scroll, pointer }) {
      const walk = THREE.MathUtils.smoothstep(scroll, 0.1, 0.95);
      const z = 5 - 16 * walk - Math.sin(time * 0.1) * 0.6;
      camera.position.set(Math.sin(time * 0.08) * 0.5 + pointer.x * 0.4, 1.6, z);
      look.set(pointer.x * 3, THREE.MathUtils.lerp(4.2, 7.6, walk) - pointer.y * 1.2, Z1);
      camera.lookAt(look);

      for (const f of figures) {
        if (f.walk) f.mesh.position.x = f.x + Math.sin(time * 0.06) * 2.2;
        f.mesh.rotation.y = Math.atan2(camera.position.x - f.mesh.position.x, camera.position.z - f.mesh.position.z);
      }
      for (const s of skyShafts) s.mesh.material.opacity = 0.065 + 0.025 * Math.sin(time * 0.3 + s.phase);
      bigSheen.tex.offset.x = 0.55 - camera.position.x * 0.08 - (camera.position.z - Z1) * 0.03;
      for (const f of side) f.sheen.offset.x = 0.5 - (camera.position.z - f.group.position.z) * 0.08;
    },
  };
}

/* ───────────── 海のガラス美術館 ───────────── */

async function buildSea(ctx) {
  const { camera, renderer, stage } = ctx;
  const scene = new THREE.Scene();
  renderer.toneMapping = THREE.NoToneMapping;
  camera.fov = 45;

  const [day, dusk] = await Promise.all([loadTex(ctx, "sea.jpg"), loadTex(ctx, "sea_dusk.jpg")]);
  // 時間帯：写真・水平線（写真の下からの割合）・下を切る量・色味
  const LIGHTS = {
    morning: { tex: day, horizon: 0.32, crop: 0, tint: [1.06, 0.97, 0.92], sat: 0.9, sparkle: 0.8, sky: 0xd9dfe6, floor: 0xe3dfda },
    noon: { tex: day, horizon: 0.32, crop: 0, tint: [1, 1, 1], sat: 1, sparkle: 1, sky: 0xbcd8ea, floor: 0xdfe4e8 },
    dusk: { tex: dusk, horizon: 0.39, crop: 0.3, tint: [1, 1, 1], sat: 1, sparkle: 1.2, sky: 0x44506c, floor: 0x7d7f8c },
    cloudy: { tex: day, horizon: 0.32, crop: 0, tint: [0.9, 0.93, 0.96], sat: 0.3, sparkle: 0.25, sky: 0xc9ced3, floor: 0xd4d8db },
  };

  // 海（写真に、うねりときらめきを足す）
  const seaMat = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: day }, uTime: { value: 0 }, uHorizon: { value: 0.32 }, uCrop: { value: 0 },
      uTint: { value: new THREE.Vector3(1, 1, 1) }, uSat: { value: 1 }, uSparkle: { value: 1 },
    },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `
      uniform sampler2D map; uniform float uTime, uHorizon, uCrop, uSat, uSparkle; uniform vec3 uTint;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){
        vec2 uv = vec2(vUv.x, mix(uCrop, 1.0, vUv.y));
        float below = uHorizon - uv.y;
        float d = clamp(below / uHorizon, 0.0, 1.0);
        if (below > 0.0) uv.x += sin(uv.y * 520.0 / (0.15 + d) - uTime * 1.2) * 0.0007 * d;
        vec3 col = texture2D(map, uv).rgb;
        if (below > 0.0) {
          vec2 cell = vec2(uv.x * (420.0 - d * 300.0), uv.y * (1800.0 - d * 1400.0));
          vec2 id = floor(cell + vec2(uTime * 0.35, 0.0));
          float r = hash(id);
          float blink = pow(max(0.0, sin(uTime * (1.5 + r * 2.5) + r * 40.0)), 18.0);
          float s = step(0.86, r) * blink * smoothstep(0.0, 0.01, below);
          col += vec3(1.0, 0.97, 0.9) * s * 0.9 * uSparkle;
        }
        float g = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(vec3(g), col, uSat) * uTint;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), seaMat);
  scene.add(sea);
  const EYE = 1.25, SEA_Z = -42, SEA_W = 130;
  function setLight(key) {
    const L = LIGHTS[key];
    const img = L.tex.image;
    const h = SEA_W * (img.height / img.width) * (1 - L.crop);
    const horizonInPlane = (L.horizon - L.crop) / (1 - L.crop);
    sea.scale.set(SEA_W, h, 1);
    sea.position.set(0, EYE + (0.5 - horizonInPlane) * h, SEA_Z);
    seaMat.uniforms.map.value = L.tex;
    seaMat.uniforms.uHorizon.value = L.horizon;
    seaMat.uniforms.uCrop.value = L.crop;
    seaMat.uniforms.uTint.value.set(...L.tint);
    seaMat.uniforms.uSat.value = L.sat;
    seaMat.uniforms.uSparkle.value = L.sparkle;
    scene.background = new THREE.Color(L.sky);
    floorTint.color.set(L.floor);
    const dark = key === "dusk";
    hemi.intensity = dark ? 1.3 : 2.6;
    hemi.color.set(dark ? 0xffd2b0 : 0xffffff);
    for (const b of stage.querySelectorAll("[data-light]")) b.setAttribute("aria-pressed", String(b.dataset.light === key));
  }

  const hemi = new THREE.HemisphereLight(0xffffff, 0xcdd6dc, 2.6);
  scene.add(hemi);

  // カーテンウォール（方立・上の横材・床のサッシ）とガラス
  const metal = new THREE.MeshStandardMaterial({ color: 0x2d3843, roughness: 0.45, metalness: 0.5 });
  for (let x = -13; x <= 13; x += 2.6) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.09, 7, 0.22), metal);
    m.position.set(x + 1.3, 3.5, 0);
    scene.add(m);
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.3), metal);
    clip.position.set(x + 1.3, 2.4, 0);
    scene.add(clip);
  }
  const transom = new THREE.Mesh(new THREE.BoxGeometry(30, 0.16, 0.26), metal);
  transom.position.set(0, 6.9, 0);
  scene.add(transom);
  const sash = new THREE.Mesh(new THREE.BoxGeometry(30, 0.08, 0.26), metal);
  sash.position.set(0, 0.04, 0);
  scene.add(sash);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), new THREE.MeshStandardMaterial({ color: 0xe8eaeb, roughness: 1 }));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 7, 7);
  scene.add(ceiling);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(30, 7), new THREE.MeshBasicMaterial({ color: 0xd4e6ef, transparent: true, opacity: 0.07, depthWrite: false }));
  glass.position.set(0, 3.5, -0.02);
  scene.add(glass);
  const glassSheen = sheenMesh(30, 7, 0.5);
  glassSheen.tex.repeat.set(4, 1);
  glassSheen.mesh.position.set(0, 3.5, -0.01);
  scene.add(glassSheen.mesh);

  // 磨かれた床（空と額が映る）
  const mirror = new Reflector(new THREE.PlaneGeometry(30, 14), {
    textureWidth: 1024, textureHeight: 1024, color: 0xa7b0b8, clipBias: 0.003,
  });
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.set(0, 0, 7);
  scene.add(mirror);
  const floorTint = new THREE.MeshBasicMaterial({ map: canvasTex(512, 512, drawTiles), color: 0xdfe4e8, transparent: true, opacity: 0.5, depthWrite: false });
  floorTint.map.wrapS = floorTint.map.wrapT = THREE.RepeatWrapping;
  floorTint.map.repeat.set(10, 5);
  const floorOverlay = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), floorTint);
  floorOverlay.rotation.x = -Math.PI / 2;
  floorOverlay.position.set(0, 0.003, 7);
  scene.add(floorOverlay);

  // ガラス面に掛けた組み写真（上の横材から吊る）
  const hang = [["sunset", 1.0, 1.3, -0.85, 1.9], ["hills", 0.9, 0.6, 0.65, 2.28], ["vase", 0.5, 0.5, 0.45, 1.32]];
  const frames = hang.map(([name, w, h, x, y]) => {
    const f = makeFrame(ART[name], w, h, { frame: 0x2e3945, mat: 0.12, border: 0.045, lit: false });
    f.group.position.set(x, y, 0.35);
    scene.add(f.group);
    const top = y + h / 2 + 0.17;
    for (const dx of [-w / 2 + 0.05, w / 2 - 0.05]) {
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 6.9 - top), metal);
      wire.position.set(x + dx, (6.9 + top) / 2, 0.35);
      scene.add(wire);
    }
    return f;
  });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.16), new THREE.MeshBasicMaterial({ map: canvasTex(300, 160, drawCard) }));
  card.position.set(1.28, 1.3, 0.36);
  scene.add(card);

  // 遠くを渡る鳥
  const birdMat = new THREE.LineBasicMaterial({ color: 0x566270, transparent: true, opacity: 0.8 });
  const birds = [0, 1, 2].map((i) => {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.35, 0.12, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.35, 0.12, 0)]);
    const line = new THREE.Line(geo, birdMat);
    line.position.set(-20 + i * 3, 8 + i * 0.7, -30 - i * 2);
    scene.add(line);
    return { line, speed: 0.9 + i * 0.25, phase: i * 2 };
  });

  for (const b of stage.querySelectorAll("[data-light]")) {
    b.addEventListener("click", (ev) => { ev.stopPropagation(); setLight(b.dataset.light); });
  }
  setLight("noon");

  const look = new THREE.Vector3();
  return {
    scene,
    update({ time, scroll, pointer }) {
      seaMat.uniforms.uTime.value = time;
      const near = THREE.MathUtils.smoothstep(scroll, 0.1, 0.9);
      camera.position.set(Math.sin(time * 0.1) * 0.35 + pointer.x * 0.7, 1.6 + Math.sin(time * 0.13) * 0.05, 5.6 - 2 * near);
      look.set(pointer.x * 0.3, 1.8 - pointer.y * 0.35, 0);
      camera.lookAt(look);
      glassSheen.tex.offset.x = camera.position.x * 0.05 + time * 0.004;
      for (const f of frames) f.sheen.offset.x = 0.5 - (camera.position.x - f.group.position.x) * 0.35;
      for (const b of birds) {
        const x = ((time * b.speed + b.phase * 10) % 44) - 22;
        b.line.position.x = x;
        b.line.scale.y = 0.5 + Math.abs(Math.sin(time * 4 + b.phase));
      }
    },
  };
}

/* ───────────── 共通の部品 ───────────── */

async function loadTex(ctx, name, repeat) {
  const t = await ctx.loader.loadAsync(`${ctx.root}assets/tex/${name}`);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = ctx.renderer.capabilities.getMaxAnisotropy();
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  return t;
}

function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

let glow;
function glowTex() {
  glow ??= canvasTex(128, 128, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(0.35, "rgba(255,255,255,0.45)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, w, h);
  });
  return glow;
}

/// 額縁・マット・写真・ガラスの映り込み。lit=false なら写真は照明の影響を受けない
function makeFrame(art, w, h, { frame = 0x5b3b26, mat = 0.12, border = 0.06, depth = 0.05, lit = true } = {}) {
  const group = new THREE.Group();
  const ow = w + 2 * (mat + border), oh = h + 2 * (mat + border);
  const Mat = lit ? THREE.MeshStandardMaterial : THREE.MeshBasicMaterial;
  group.add(new THREE.Mesh(new THREE.BoxGeometry(ow, oh, depth), new THREE.MeshStandardMaterial({ color: frame, roughness: 0.55 })));
  const matMesh = new THREE.Mesh(new THREE.PlaneGeometry(w + 2 * mat, h + 2 * mat), new Mat({ color: 0xf1ece2, ...(lit ? { roughness: 0.95 } : {}) }));
  matMesh.position.z = depth / 2 + 0.001;
  group.add(matMesh);
  const artMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new Mat({ map: canvasTex(Math.round(512 * w / Math.max(w, h)), Math.round(512 * h / Math.max(w, h)), art), ...(lit ? { roughness: 0.6 } : {}) }));
  artMesh.position.z = depth / 2 + 0.002;
  group.add(artMesh);
  const sheen = sheenMesh(w + 2 * mat, h + 2 * mat);
  sheen.mesh.position.z = depth / 2 + 0.004;
  group.add(sheen.mesh);
  return { group, sheen: sheen.tex };
}

/// 額のガラスに映る斜めの光の帯
function sheenMesh(w, h, opacity = 0.55) {
  const tex = canvasTex(512, 512, (g) => {
    g.translate(256, 256);
    g.rotate(-Math.PI / 6);
    const grad = g.createLinearGradient(-90, 0, 90, 0);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.45, "rgba(255,255,255,0.28)");
    grad.addColorStop(0.55, "rgba(255,255,255,0.08)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(-90, -512, 180, 1024);
  });
  tex.wrapS = THREE.RepeatWrapping;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({
    map: tex, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  }));
  return { mesh, tex };
}

/// スポットの光の円錐（根もとが明るく、先へ行くほど、縁ほど薄い）
function lightCone(from, to, angle, opacity) {
  const length = from.distanceTo(to) * 1.05;
  const geo = new THREE.ConeGeometry(Math.tan(angle) * length, length, 40, 1, true).translate(0, -length / 2, 0);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uLength: { value: length }, uOpacity: { value: opacity }, uColor: { value: new THREE.Color(0xfff0d6) } },
    vertexShader: `uniform float uLength; varying float vT; varying vec3 vN; varying vec3 vView;
      void main(){ vT = -position.y / uLength; vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vView = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying float vT; varying vec3 vN; varying vec3 vView;
      void main(){ float edge = pow(abs(dot(normalize(vN), normalize(vView))), 2.0);
        float a = uOpacity * edge * (1.0 - vT) * smoothstep(0.0, 0.06, vT); gl_FragColor = vec4(uColor, a); }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
  const cone = new THREE.Mesh(geo, mat);
  cone.position.copy(from);
  cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), to.clone().sub(from).normalize());
  return cone;
}

/// コンクリートの写真に、型枠の目地とセパ穴を描き足す（1枚で 3.6m 四方）
function formworkTexture(img) {
  const t = canvasTex(1024, 1024, (g, w, h) => {
    g.drawImage(img, 0, 0, w, h);
    g.strokeStyle = "rgba(58,62,66,0.32)";
    g.lineWidth = 2;
    for (let y = 1; y < h; y += h / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (let x = 1; x < w; x += w / 2) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let px = 0; px < 2; px++) for (let py = 0; py < 4; py++) for (const fx of [1 / 6, 1 / 2, 5 / 6]) for (const fy of [1 / 4, 3 / 4]) {
      const cx = (px + fx) * w / 2, cy = (py + fy) * h / 4;
      g.fillStyle = "rgba(196,198,196,0.5)";
      g.beginPath(); g.arc(cx, cy, 9, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(62,66,70,0.6)";
      g.beginPath(); g.arc(cx, cy, 6, 0, Math.PI * 2); g.fill();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function seeded(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ───────────── 絵（額の中の見本と、小物） ───────────── */

const ART = {
  sunset(g, w, h) {
    vgrad(g, 0, h * 0.6, w, ["#e8c5b5", "#cda7ac"]);
    vgrad(g, h * 0.6, h, w, ["#6b7391", "#3f4863"]);
    g.fillStyle = "#f3e3bf";
    g.beginPath(); g.arc(w / 2, h * 0.57, w * 0.08, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(243,227,191,0.35)";
    for (let i = 0; i < 9; i++) { const lw = w * (0.14 - i * 0.012); g.fillRect(w / 2 - lw / 2, h * (0.64 + i * 0.035), lw, 2); }
  },
  hills(g, w, h) {
    vgrad(g, 0, h, w, ["#e9e7dc", "#dcdccc"]);
    g.fillStyle = "#a3b18c";
    g.beginPath(); g.moveTo(0, h * 0.62); g.quadraticCurveTo(w * 0.35, h * 0.45, w, h * 0.6); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    g.fillStyle = "#71876a";
    g.beginPath(); g.moveTo(0, h * 0.8); g.quadraticCurveTo(w * 0.6, h * 0.6, w, h * 0.78); g.lineTo(w, h); g.lineTo(0, h); g.fill();
  },
  mountains(g, w, h) {
    vgrad(g, 0, h, w, ["#c3cfdb", "#e3e6ea"]);
    poly(g, w, h, "#95a1b4", [[0, 0.62], [0.24, 0.4], [0.44, 0.57], [0.7, 0.36], [1, 0.6], [1, 1], [0, 1]]);
    poly(g, w, h, "#5f6c82", [[0, 0.76], [0.3, 0.58], [0.55, 0.72], [0.8, 0.57], [1, 0.7], [1, 1], [0, 1]]);
  },
  vase(g, w, h) {
    g.fillStyle = "#efe4d2"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#d9c6a4"; g.fillRect(0, h * 0.7, w, h * 0.3);
    g.fillStyle = "#6f8f96";
    g.beginPath(); g.ellipse(w * 0.45, h * 0.58, w * 0.13, h * 0.14, 0, 0, Math.PI * 2); g.fill();
    g.fillRect(w * 0.42, h * 0.34, w * 0.06, h * 0.16);
    g.fillRect(w * 0.33, h * 0.66, w * 0.24, h * 0.05);
    g.fillStyle = "#d98a5c";
    g.beginPath(); g.arc(w * 0.68, h * 0.66, w * 0.05, 0, Math.PI * 2); g.fill();
  },
  trees(g, w, h) {
    g.fillStyle = "#dcd9c9"; g.fillRect(0, 0, w, h);
    const rand = seeded(3);
    for (let i = 0; i < 16; i++) {
      g.fillStyle = ["#5d6b53", "#6f7d63", "#4f5c48"][i % 3];
      const top = h * (0.1 + rand() * 0.35);
      g.fillRect(w * (0.06 + i * 0.056), top, w * (0.02 + rand() * 0.02), h * 0.82 - top);
    }
    g.fillStyle = "#8b8a67"; g.fillRect(0, h * 0.82, w, h * 0.18);
  },
  alps(g, w, h) {
    vgrad(g, 0, h * 0.7, w, ["#4f7bb5", "#9fc0e3", "#d3e2f1"]);
    const rand = seeded(11);
    const ridge = [[0, 0.72]];
    for (let x = 0.04; x <= 1.001; x += 0.04) {
      const peak = 0.3 + 0.18 * Math.abs(x - 0.52) * 2.2;
      ridge.push([x, Math.min(0.75, peak + (rand() - 0.5) * 0.06)]);
    }
    poly(g, w, h, "#eef2f7", [...ridge, [1, 1], [0, 1]]);
    // 陰の面と岩の筋
    g.fillStyle = "rgba(110,130,160,0.55)";
    for (let i = 1; i < ridge.length - 1; i += 2) {
      const [x, y] = ridge[i];
      g.beginPath(); g.moveTo(x * w, y * h); g.lineTo((x + 0.1) * w, (y + 0.35) * h); g.lineTo((x + 0.02) * w, (y + 0.4) * h); g.fill();
    }
    g.strokeStyle = "rgba(70,84,104,0.55)";
    for (let i = 0; i < 60; i++) {
      const x = rand() * w, y = h * (0.45 + rand() * 0.45);
      g.lineWidth = 1 + rand() * 3;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rand() - 0.5) * 40, y + 30 + rand() * 60); g.stroke();
    }
    vgrad(g, h * 0.86, h, w, ["rgba(90,106,128,0)", "rgba(90,106,128,0.8)"]);
  },
};

function vgrad(g, y0, y1, w, stops) {
  const grad = g.createLinearGradient(0, y0, 0, y1);
  stops.forEach((c, i) => grad.addColorStop(i / (stops.length - 1), c));
  g.fillStyle = grad;
  g.fillRect(0, y0, w, y1 - y0);
}

function poly(g, w, h, color, pts) {
  g.fillStyle = color;
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h)));
  g.closePath();
  g.fill();
}

function drawLeaves(g, w, h) {
  const rand = seeded(5);
  for (let i = 0; i < 260; i++) {
    const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * w * 0.42;
    const x = w / 2 + Math.cos(a) * r, y = h / 2 + Math.sin(a) * r * 0.75;
    g.fillStyle = `rgba(255,255,255,${0.25 + rand() * 0.5})`;
    g.beginPath(); g.ellipse(x, y, 3 + rand() * 5, 2 + rand() * 3, rand() * Math.PI, 0, Math.PI * 2); g.fill();
  }
}

function drawShaft(g, w, h) {
  const across = g.createLinearGradient(0, 0, w, 0);
  across.addColorStop(0, "rgba(255,255,255,0)");
  across.addColorStop(0.5, "rgba(255,255,255,1)");
  across.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = across;
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = "destination-in";
  const down = g.createLinearGradient(0, 0, 0, h);
  down.addColorStop(0, "rgba(0,0,0,1)");
  down.addColorStop(0.7, "rgba(0,0,0,0.5)");
  down.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = down;
  g.fillRect(0, 0, w, h);
}

function drawStar(g, w, h) {
  const c = w / 2;
  const core = g.createRadialGradient(c, c, 0, c, c, c);
  core.addColorStop(0, "rgba(255,255,255,1)");
  core.addColorStop(0.08, "rgba(255,255,255,0.8)");
  core.addColorStop(0.3, "rgba(255,255,255,0.12)");
  core.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = core;
  g.fillRect(0, 0, w, h);
  g.translate(c, c);
  for (let i = 0; i < 6; i++) {
    g.rotate(Math.PI / 3);
    const ray = g.createLinearGradient(0, 0, c, 0);
    ray.addColorStop(0, "rgba(255,255,255,0.7)");
    ray.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = ray;
    g.beginPath(); g.moveTo(0, -2); g.lineTo(c, 0); g.lineTo(0, 2); g.fill();
  }
}

function drawFigure(g, w, h) {
  g.filter = "blur(1.5px)";
  g.fillStyle = "#fff";
  g.beginPath(); g.ellipse(w / 2, h * 0.075, w * 0.12, h * 0.052, 0, 0, Math.PI * 2); g.fill();
  g.beginPath();
  g.moveTo(w * 0.4, h * 0.135); g.lineTo(w * 0.6, h * 0.135);
  g.quadraticCurveTo(w * 0.82, h * 0.15, w * 0.8, h * 0.25);
  g.lineTo(w * 0.76, h * 0.5); g.lineTo(w * 0.66, h * 0.52);
  g.lineTo(w * 0.63, h * 0.99); g.lineTo(w * 0.52, h * 0.99); g.lineTo(w * 0.5, h * 0.6);
  g.lineTo(w * 0.48, h * 0.99); g.lineTo(w * 0.37, h * 0.99); g.lineTo(w * 0.34, h * 0.52);
  g.lineTo(w * 0.24, h * 0.5); g.lineTo(w * 0.2, h * 0.25);
  g.quadraticCurveTo(w * 0.18, h * 0.15, w * 0.4, h * 0.135);
  g.fill();
}

function drawCaption(g, w, h) {
  g.fillStyle = "#e9e7e1"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#2f3d4c";
  g.font = "italic 88px Georgia, serif";
  g.fillText("pairPics", 70, 190);
  g.fillStyle = "#6a7580";
  g.font = "34px Georgia, serif";
  g.fillText("Photographs in sets", 74, 262);
  g.fillText("Hall I  —  Corridor  —  Hall II", 74, 330);
  g.fillStyle = "#b0573a";
  g.fillRect(74, 380, 90, 4);
}

function drawCard(g, w, h) {
  g.fillStyle = "#f7f6f2"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#2f3d4c"; g.fillRect(24, 34, 120, 12);
  g.fillStyle = "#8a939b";
  for (let i = 0; i < 3; i++) g.fillRect(24, 70 + i * 24, 220 - i * 50, 7);
}

function drawTiles(g, w, h) {
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(120,132,142,0.35)";
  g.lineWidth = 3;
  g.strokeRect(0, 0, w, h);
}
