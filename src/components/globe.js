// ============================================
// AeroStat — Globe Component (Three.js)
// ============================================

const Globe = (() => {
  let scene, camera, renderer, globeMesh, atmosphere;
  let isDragging = false, prevMouse = { x: 0, y: 0 };
  let rotVel = { x: 0, y: 0 };
  let autoRot = true;
  let targetRot = null;
  let zoom = 2.6;
  let raycaster, mouse;
  let hoveredCountry = null;
  let heatMeshes = [];
  let heatActive = false;
  let onCountryClick = null;

  function ll3(lat, lng, r = 1) {
    return Helpers.ll3(lat, lng, r, THREE);
  }

  function init(container, onClickCallback) {
    onCountryClick = onClickCallback;
    const W = container.clientWidth, H = container.clientHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = zoom;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050505, 1);
    container.appendChild(renderer.domElement);

    _buildGlobe();
    _buildAtmosphere();
    _buildGrid();
    _buildLights();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    _setupEvents(container);
    _animate();

    window.addEventListener('resize', () => {
      const W = container.clientWidth, H = container.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
  }

  function _buildGlobe() {
    const geo = new THREE.SphereGeometry(1, 72, 72);
    const cvs = document.createElement('canvas');
    cvs.width = 2048; cvs.height = 1024;
    const ctx = cvs.getContext('2d');

    // Ocean gradient
    const grad = ctx.createLinearGradient(0, 0, 2048, 1024);
    grad.addColorStop(0, '#05111e');
    grad.addColorStop(0.5, '#071828');
    grad.addColorStop(1, '#04101a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Subtle sparkle dots
    ctx.fillStyle = 'rgba(125,211,252,0.015)';
    for (let i = 0; i < 2000; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 2048, Math.random() * 1024, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const mat = new THREE.MeshPhongMaterial({
      map: new THREE.CanvasTexture(cvs),
      specular: new THREE.Color(0x112233),
      shininess: 12,
    });
    globeMesh = new THREE.Mesh(geo, mat);
    scene.add(globeMesh);
  }

  function _buildAtmosphere() {
    const ag = new THREE.SphereGeometry(1.022, 64, 64);
    const am = new THREE.MeshPhongMaterial({ color: 0x3399cc, transparent: true, opacity: 0.055, side: THREE.FrontSide });
    atmosphere = new THREE.Mesh(ag, am);
    scene.add(atmosphere);

    const gg = new THREE.SphereGeometry(1.09, 64, 64);
    scene.add(new THREE.Mesh(gg, new THREE.MeshPhongMaterial({ color: 0x113355, transparent: true, opacity: 0.025, side: THREE.FrontSide })));
  }

  function _buildGrid() {
    const lm = new THREE.LineBasicMaterial({ color: 0x142030, transparent: true, opacity: 0.45 });
    for (let lat = -75; lat <= 75; lat += 15) {
      const pts = [];
      for (let ln = 0; ln <= 360; ln += 2) pts.push(ll3(lat, ln - 180, 1.001));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lm));
    }
    for (let ln = -180; ln < 180; ln += 30) {
      const pts = [];
      for (let lat = -90; lat <= 90; lat += 2) pts.push(ll3(lat, ln, 1.001));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lm));
    }
  }

  function _buildLights() {
    scene.add(new THREE.AmbientLight(0x1a2a40, 0.9));
    const sun = new THREE.DirectionalLight(0xeef4ff, 1.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x334466, 0.25);
    fill.position.set(-5, -2, -3);
    scene.add(fill);
  }

  function _setupEvents(container) {
    const cvs = renderer.domElement;
    cvs.style.cursor = 'grab';

    cvs.addEventListener('mousedown', e => {
      isDragging = false;
      prevMouse = { x: e.clientX, y: e.clientY };
      autoRot = false;
      cvs._ds = { x: e.clientX, y: e.clientY };
      cvs.style.cursor = 'grabbing';
    });

    cvs.addEventListener('mousemove', e => {
      const dx = e.clientX - prevMouse.x, dy = e.clientY - prevMouse.y;
      if (cvs._ds && (Math.abs(e.clientX - cvs._ds.x) > 3 || Math.abs(e.clientY - cvs._ds.y) > 3)) {
        isDragging = true;
      }
      if (isDragging) {
        rotVel.y = dx * 0.005; rotVel.x = dy * 0.005;
        globeMesh.rotation.y += dx * 0.005;
        globeMesh.rotation.x += dy * 0.005;
        globeMesh.rotation.x = Math.max(-1.3, Math.min(1.3, globeMesh.rotation.x));
        atmosphere.rotation.copy(globeMesh.rotation);
      } else {
        _updateTooltip(e, container);
      }
      prevMouse = { x: e.clientX, y: e.clientY };
    });

    cvs.addEventListener('mouseup', e => {
      cvs.style.cursor = 'grab';
      if (!isDragging && hoveredCountry) onCountryClick(hoveredCountry);
      isDragging = false;
      cvs._ds = null;
      setTimeout(() => { if (!isDragging) autoRot = true; }, 3500);
    });

    cvs.addEventListener('mouseleave', () => {
      document.getElementById('tooltip').style.display = 'none';
      hoveredCountry = null;
    });

    cvs.addEventListener('wheel', e => {
      e.preventDefault();
      zoom += e.deltaY * 0.001;
      zoom = Math.max(1.5, Math.min(4.2, zoom));
      camera.position.z = zoom;
    }, { passive: false });
  }

  function _updateTooltip(e, container) {
    const countries = window.AeroStat?.countries || [];
    if (!countries.length) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObject(globeMesh);
    const tt = document.getElementById('tooltip');

    if (hit.length) {
      const pt = hit[0].point.clone().normalize();
      const lat = Math.asin(pt.y) * 180 / Math.PI;
      const lng = Math.atan2(pt.z, -pt.x) * 180 / Math.PI;
      document.getElementById('coord-display').textContent = `${lat.toFixed(1)}°  ${lng.toFixed(1)}°`;

      const c = Helpers.nearestCountry(lat, lng, countries);
      if (c) {
        hoveredCountry = c;
        tt.style.cssText = `display:block;left:${e.clientX + 12}px;top:${e.clientY - 8}px`;
        tt.innerHTML = `${c.flags?.emoji || '🌐'} <strong>${c.name?.common}</strong> <span style="color:var(--dim);font-size:11px;margin-left:4px">${c.capital?.[0] || ''}</span>`;
      } else {
        tt.style.display = 'none';
        hoveredCountry = null;
      }
    } else {
      tt.style.display = 'none';
      hoveredCountry = null;
    }
  }

  function _animate() {
    requestAnimationFrame(_animate);
    if (targetRot) {
      const dx = targetRot.x - globeMesh.rotation.x;
      const dy = targetRot.y - globeMesh.rotation.y;
      globeMesh.rotation.x += dx * 0.065;
      globeMesh.rotation.y += dy * 0.065;
      atmosphere.rotation.copy(globeMesh.rotation);
      if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) targetRot = null;
    } else if (autoRot) {
      globeMesh.rotation.y += 0.0007;
      atmosphere.rotation.y += 0.0007;
    } else {
      globeMesh.rotation.y += rotVel.y * 0.95;
      globeMesh.rotation.x += rotVel.x * 0.95;
      rotVel.x *= 0.92; rotVel.y *= 0.92;
      atmosphere.rotation.copy(globeMesh.rotation);
    }
    renderer.render(scene, camera);
  }

  function spinTo(lat, lng) {
    autoRot = false;
    targetRot = {
      x: -lat * Math.PI / 180 * 0.5,
      y: -(lng + 180) * Math.PI / 180 + Math.PI,
    };
  }

  function toggleHeatmap(countries) {
    heatActive = !heatActive;
    heatMeshes.forEach(m => scene.remove(m));
    heatMeshes = [];

    if (heatActive && countries.length) {
      const mx = Math.max(...countries.filter(c => c.population).map(c => c.population));
      countries.forEach(c => {
        if (!c.latlng || !c.population) return;
        const r = c.population / mx;
        const sz = 0.04 + r * 0.22;
        const col = new THREE.Color(`hsl(${200 - r * 200},80%,${30 + r * 30}%)`);
        const m = new THREE.Mesh(
          new THREE.SphereGeometry(sz, 8, 8),
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6 })
        );
        m.position.copy(ll3(c.latlng[0], c.latlng[1], 1.015));
        scene.add(m);
        heatMeshes.push(m);
      });
    }
    return heatActive;
  }

  return { init, spinTo, toggleHeatmap };
})();
