(() => {
  const screen = document.getElementById("launch-screen");
  const button = document.getElementById("launch-button");
  const label = document.getElementById("launch-button-label");
  const status = document.getElementById("launch-status");
  const cinema = document.getElementById("home");
  let starting = false;

  function loadScript(source) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = source;
      script.onload = resolve;
      script.onerror = () => {
        script.remove();
        reject(new Error(`Unable to load ${source}`));
      };
      document.head.append(script);
    });
  }

  button.addEventListener("click", async () => {
    if (starting) return;
    starting = true;
    button.disabled = true;
    label.textContent = "ESTABLISHING UPLINK…";
    status.textContent = "Authorization confirmed. Preparing the lander transmission…";
    screen.setAttribute("aria-busy", "true");

    try {
      // No scenes, profile requests, mission timers or WebGL run before confirmation.
      await loadScript("mission.js");
      cinema.querySelectorAll("img[data-src]").forEach((image) => {
        image.src = image.dataset.src;
        image.removeAttribute("data-src");
      });
      document.getElementById("storyboard-image-a").classList.add("scene-motion");
      screen.hidden = true;
      screen.removeAttribute("aria-busy");
      cinema.hidden = false;
      cinema.focus({ preventScroll: true });

      // Optional 3D effects must never block the mission if the CDN is unavailable.
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js")
        .then(() => loadScript("visuals.js"))
        .catch(() => {});
    } catch {
      starting = false;
      button.disabled = false;
      label.textContent = "RETRY TRANSMISSION";
      screen.removeAttribute("aria-busy");
      status.textContent = "Uplink unavailable. Please check your connection and try again.";
    }
  });
})();