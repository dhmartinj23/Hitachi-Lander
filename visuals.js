(() => {
  const THREE = window.THREE;
  if (!THREE) return;

  const cinema = document.querySelector(".cinema");
  const ambienceCanvas = document.getElementById("three-ambience");
  const headerCanvas = document.getElementById("three-header-cube");
  const footerCubeCanvas = document.getElementById("three-footer-cube");

  let ambienceRenderer;
  let ambienceScene;
  let ambienceCamera;
  let ambiencePoints;
  let headerRenderer;
  let headerScene;
  let headerCamera;
  let headerCube;
  let footerCubeRenderer;
  let footerCubeScene;
  let footerCubeCamera;
  let footerCube;
  let active = false;

  const headerMotion = createMotionState();
  const footerCubeMotion = createMotionState();

  function createMotionState() {
    return { dragging: false, pointerId: null, lastX: 0, lastY: 0, rotationX: 0, rotationY: 0, hoverX: 0, hoverY: 0 };
  }

  function makeRenderer(canvas) {
    if (!canvas) return null;
    try {
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setClearColor(0x000000, 0);
      return renderer;
    } catch {
      return null;
    }
  }

  function bindPointer(canvas, motion, hoverAmount) {
    if (!canvas) return;
    canvas.addEventListener("pointerenter", (event) => {
      canvas.classList.add("is-hovered");
      motion.lastX = event.clientX;
      motion.lastY = event.clientY;
    });
    canvas.addEventListener("pointermove", (event) => {
      if (motion.dragging && event.pointerId === motion.pointerId) {
        const dx = event.clientX - motion.lastX;
        const dy = event.clientY - motion.lastY;
        motion.rotationY += dx * .012;
        motion.rotationX = THREE.MathUtils.clamp(motion.rotationX + dy * .012, -1.2, 1.2);
        motion.lastX = event.clientX;
        motion.lastY = event.clientY;
        return;
      }
      if (event.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      motion.hoverY = ((event.clientX - rect.left) / rect.width - .5) * hoverAmount;
      motion.hoverX = ((event.clientY - rect.top) / rect.height - .5) * hoverAmount;
    });
    canvas.addEventListener("pointerdown", (event) => {
      motion.dragging = true;
      motion.pointerId = event.pointerId;
      motion.lastX = event.clientX;
      motion.lastY = event.clientY;
      canvas.classList.add("is-dragging");
      canvas.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    const release = (event) => {
      if (!motion.dragging || event.pointerId !== motion.pointerId) return;
      motion.dragging = false;
      motion.pointerId = null;
      canvas.classList.remove("is-dragging");
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
    canvas.addEventListener("pointerleave", () => {
      if (!motion.dragging) {
        canvas.classList.remove("is-hovered");
        motion.hoverX = 0;
        motion.hoverY = 0;
      }
    });
    canvas.addEventListener("keydown", (event) => {
      const step = .16;
      if (event.key === "ArrowLeft") motion.rotationY -= step;
      else if (event.key === "ArrowRight") motion.rotationY += step;
      else if (event.key === "ArrowUp") motion.rotationX -= step;
      else if (event.key === "ArrowDown") motion.rotationX += step;
      else return;
      motion.rotationX = THREE.MathUtils.clamp(motion.rotationX, -1.2, 1.2);
      event.preventDefault();
    });
  }

  function initAmbience() {
    ambienceRenderer = makeRenderer(ambienceCanvas);
    if (!ambienceRenderer) return false;
    ambienceScene = new THREE.Scene();
    ambienceCamera = new THREE.OrthographicCamera(-8, 8, 4.5, -4.5, .1, 50);
    ambienceCamera.position.z = 12;
    const positions = [];
    let seed = 1709;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 150; i += 1) {
      positions.push((rand() - .5) * 15.4, (rand() - .5) * 8.7, -4 - rand() * 4);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    ambiencePoints = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x75dcf5, size: 1.25, transparent: true, opacity: .32, sizeAttenuation: false, depthWrite: false }));
    ambienceScene.add(ambiencePoints);
    return true;
  }

  function initHeaderCube() {
    headerRenderer = makeRenderer(headerCanvas);
    if (!headerRenderer) return false;
    headerScene = new THREE.Scene();
    headerCamera = new THREE.PerspectiveCamera(34, 1, .1, 20);
    headerCamera.position.set(2.8, 2.4, 4.2);
    headerCamera.lookAt(0, 0, 0);
    headerCube = new THREE.Group();
    const geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    headerCube.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x27c9ee, transparent: true, opacity: .1, side: THREE.DoubleSide })));
    headerCube.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0xa4f6ff, transparent: true, opacity: .96 })));
    headerCube.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.92, .92, .92)), new THREE.LineBasicMaterial({ color: 0x53dfff, transparent: true, opacity: .6 })));
    headerScene.add(headerCube);
    bindPointer(headerCanvas, headerMotion, .42);
    return true;
  }

  function initFooterCube() {
    footerCubeRenderer = makeRenderer(footerCubeCanvas);
    if (!footerCubeRenderer) return false;
    footerCubeScene = new THREE.Scene();
    footerCubeCamera = new THREE.PerspectiveCamera(35, 1, .1, 30);
    footerCubeCamera.position.set(2.8, 2.3, 4.4);
    footerCubeCamera.lookAt(0, 0, 0);

    footerCube = new THREE.Group();
    const geometry = new THREE.BoxGeometry(1.65, 1.65, 1.65);
    footerCube.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x16bde2, transparent: true, opacity: .12, side: THREE.DoubleSide })));
    footerCube.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x9af5ff, transparent: true, opacity: .96 })));
    footerCube.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.86, .86, .86)), new THREE.LineBasicMaterial({ color: 0x42caff, transparent: true, opacity: .48 })));
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.42, .012, 4, 96), new THREE.MeshBasicMaterial({ color: 0x51dfff, transparent: true, opacity: .62 }));
    orbit.rotation.x = Math.PI / 2.8;
    footerCube.add(orbit);
    footerCubeScene.add(footerCube);
    bindPointer(footerCubeCanvas, footerCubeMotion, .28);
    return true;
  }

  function resize() {
    const viewportWidth = Math.max(1, window.innerWidth);
    const viewportHeight = Math.max(1, window.innerHeight);
    if (ambienceRenderer) {
      ambienceRenderer.setSize(viewportWidth, viewportHeight, false);
      ambienceCamera.left = -8 * viewportWidth / viewportHeight;
      ambienceCamera.right = 8 * viewportWidth / viewportHeight;
      ambienceCamera.top = 4.5;
      ambienceCamera.bottom = -4.5;
      ambienceCamera.updateProjectionMatrix();
    }
    for (const [canvas, renderer, camera] of [[headerCanvas, headerRenderer, headerCamera], [footerCubeCanvas, footerCubeRenderer, footerCubeCamera]]) {
      if (!renderer || !camera) continue;
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  }

  function animate(time) {
    window.requestAnimationFrame(animate);
    if (document.hidden) return;
    const t = time * .001;
    if (headerCube) {
      headerCube.rotation.x = Math.sin(t * .55) * .16 + headerMotion.rotationX + headerMotion.hoverX;
      headerCube.rotation.y = t * 1.05 + headerMotion.rotationY + headerMotion.hoverY;
      headerCube.rotation.z = Math.sin(t * .32) * .08;
      headerRenderer.render(headerScene, headerCamera);
    }
    if (ambiencePoints && active) {
      ambiencePoints.rotation.z = Math.sin(t * .11) * .018;
      ambiencePoints.material.opacity = .25 + (Math.sin(t * .7) + 1) * .055;
      ambienceRenderer.render(ambienceScene, ambienceCamera);
    }
    if (footerCube && active) {
      footerCube.rotation.x = .42 + Math.sin(t * .55) * .12 + footerCubeMotion.rotationX + footerCubeMotion.hoverX;
      footerCube.rotation.y = t * .3 + footerCubeMotion.rotationY + footerCubeMotion.hoverY;
      footerCubeRenderer.render(footerCubeScene, footerCubeCamera);
    }
  }

  const ambienceReady = initAmbience();
  const headerReady = initHeaderCube();
  const footerCubeReady = initFooterCube();
  if (!ambienceReady && !headerReady && !footerCubeReady) return;
  if (ambienceReady) cinema.classList.add("three-ambience-ready");
  if (headerReady) cinema.classList.add("three-header-ready");
  if (footerCubeReady) cinema.classList.add("three-footer-cube-ready");
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const enableFinalVisuals = () => {
    if (active) return;
    active = true;
    resize();
  };
  const observer = new MutationObserver(() => {
    if (cinema.classList.contains("profile-only")) enableFinalVisuals();
  });
  observer.observe(cinema, { attributes: true, attributeFilter: ["class"] });
  if (cinema.classList.contains("profile-only")) enableFinalVisuals();
  frameId = window.requestAnimationFrame(animate);
})();
