(() => {
  const profile = window.MISSION_PROFILE || {};
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element && value) element.textContent = value;
  };

  const name = profile.name || "Your Name";
  const role = [profile.role, profile.company || "Hitachi Energy"].filter(Boolean).join(" · ");
  setText("profile-name", name);
  setText("profile-name-signoff", name);
  setText("profile-role", role);
  setText("thank-you", profile.thankYou);
  setText("profile-note", profile.note);
  const hasEmail = Boolean(profile.email && !profile.email.includes("example.com"));
  const hasPhone = Boolean(profile.phone && !profile.phone.includes("000 000"));
  const hasLinkedIn = Boolean(profile.linkedin && !profile.linkedin.includes("your-profile"));
  setText("email-label", hasEmail ? profile.email : "Add your email");
  setText("phone-label", hasPhone ? profile.phone : "Add your number");
  setText("linkedin-label", hasLinkedIn ? "View my profile" : "Add your LinkedIn");
  setText("holo-name", name);
  setText("holo-role", role);
  setText("holo-note", profile.thankYou);
  setText("holo-email-label", hasEmail ? profile.email : "EMAIL");
  setText("holo-phone-label", hasPhone ? profile.phone : "PHONE");
  setText("holo-linkedin-label", hasLinkedIn ? "LINKEDIN" : "LINKEDIN");

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
  setText("profile-initials", initials || "YN");
  setText("holo-initials", initials || "YN");

  const emailLink = document.getElementById("email-link");
  if (hasEmail) {
    emailLink.href = `mailto:${profile.email}`;
  } else {
    emailLink.addEventListener("click", (event) => {
      event.preventDefault();
      showSetupToast();
    });
  }

  const phoneLink = document.getElementById("phone-link");
  if (hasPhone) {
    phoneLink.href = `tel:${profile.phone.replace(/[^+\d]/g, "")}`;
  } else {
    phoneLink.addEventListener("click", (event) => {
      event.preventDefault();
      showSetupToast();
    });
  }

  const linkedinLink = document.getElementById("linkedin-link");
  if (hasLinkedIn) {
    linkedinLink.href = profile.linkedin;
  } else {
    linkedinLink.addEventListener("click", (event) => {
      event.preventDefault();
      showSetupToast();
    });
  }

  const holoEmail = document.getElementById("holo-email-link");
  const holoPhone = document.getElementById("holo-phone-link");
  const holoLinkedIn = document.getElementById("holo-linkedin-link");
  if (hasEmail) holoEmail.href = `mailto:${profile.email}`;
  if (hasPhone) holoPhone.href = `tel:${profile.phone.replace(/[^+\d]/g, "")}`;
  if (hasLinkedIn) holoLinkedIn.href = profile.linkedin;
  for (const link of [holoEmail, holoPhone, holoLinkedIn]) {
    if (link.getAttribute("href") === "#message") {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        document.getElementById("message").scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  const cinema = document.querySelector(".cinema");
  const hologram = document.querySelector(".hologram");
  const sequenceStatus = document.querySelector(".sequence-status");
  const skipButton = document.querySelector(".skip-sequence");
  const asteroidField = document.querySelector(".cinema-asteroids");
  let asteroidSeed = 73;
  const random = () => {
    asteroidSeed = (asteroidSeed * 9301 + 49297) % 233280;
    return asteroidSeed / 233280;
  };
  for (let index = 0; index < 34; index += 1) {
    const asteroid = document.createElement("span");
    asteroid.className = "cinema-asteroid";
    asteroid.style.setProperty("--rock-x", `${random() * 100}%`);
    asteroid.style.setProperty("--rock-y", `${random() * 100}%`);
    asteroid.style.setProperty("--rock-size", `${6 + random() * 22}px`);
    asteroid.style.setProperty("--rock-turn", `${Math.round(random() * 360)}deg`);
    asteroidField.append(asteroid);
  }
  const storyboardImages = [
    document.getElementById("storyboard-image-a"),
    document.getElementById("storyboard-image-b")
  ];
  const missionLog = document.getElementById("mission-log");
  const consoleCurrent = document.getElementById("console-current");
  const sceneFiles = Array.from({ length: 8 }, (_, index) => `Scene ${index + 1}.jpg`);
  const sceneStatuses = [
    "LANDER · SIGNAL READY",
    "OUTBOUND · WARP SPEED",
    "CROSSING THE ASTEROID BELT",
    "MOTHERSHIP · SIGNAL RECEIVED",
    "MOTHERSHIP · RESPONSE TRANSMITTED",
    "RETURNING THROUGH DEEP SPACE",
    "LANDER · RESPONSE RECEIVED",
    "CONNECTION ESTABLISHED"
  ];
  const missionActions = [
    "LANDER BEACON ONLINE",
    "UPLINK FIRED · WARP ENGAGED",
    "ASTEROID FIELD CLEARED",
    "MOTHERSHIP ARRAY LOCKED",
    "RESPONSE BEAM TRANSMITTED",
    "RETURN SIGNAL IN TRANSIT",
    "LANDER RESPONSE CONFIRMED",
    "HOLOGRAPHIC LINK ACTIVE"
  ];
  let sequenceTimers = [];
  let currentScene = 0;
  let lastLoggedScene = -1;

  sceneFiles.forEach((source) => {
    const image = new Image();
    image.src = source;
  });

  function logMissionAction(index) {
    if (index === lastLoggedScene) return;
    lastLoggedScene = index;
    const item = document.createElement("li");
    const timestamp = document.createElement("time");
    const action = document.createElement("span");
    timestamp.textContent = `00:${String(Math.round(index * 1.25)).padStart(2, "0")}`;
    action.textContent = missionActions[index];
    item.append(timestamp, action);
    missionLog.append(item);
    while (missionLog.children.length > 3) missionLog.firstElementChild.remove();
    consoleCurrent.textContent = missionActions[index];
  }

  function showScene(index) {
    logMissionAction(index);
    if (index === currentScene) {
      sequenceStatus.textContent = sceneStatuses[index];
      return;
    }
    currentScene = index;
    const incomingImage = storyboardImages[index % storyboardImages.length];
    const outgoingImage = storyboardImages[(index + 1) % storyboardImages.length];
    incomingImage.src = sceneFiles[index];
    sequenceStatus.textContent = sceneStatuses[index];
    incomingImage.classList.remove("scene-motion");
    requestAnimationFrame(() => {
      incomingImage.classList.add("is-visible", "scene-motion");
      outgoingImage.classList.remove("is-visible");
    });
  }

  function finishSequence() {
    sequenceTimers.forEach(window.clearTimeout);
    sequenceTimers = [];
    showScene(7);
    cinema.classList.remove("is-playing");
    cinema.classList.add("is-finished");
    hologram.setAttribute("aria-hidden", "false");
    sequenceStatus.textContent = "CONNECTION ESTABLISHED";
    skipButton.hidden = true;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishSequence();
  } else {
    requestAnimationFrame(() => cinema.classList.add("is-playing"));
    sceneFiles.forEach((_, index) => {
      sequenceTimers.push(window.setTimeout(() => showScene(index), index * 1250));
    });
    sequenceTimers.push(window.setTimeout(finishSequence, 10000));
  }
  skipButton.addEventListener("click", finishSequence);

  function showSetupToast() {
    const toast = document.getElementById("toast");
    toast.textContent = "Add your contact details in profile.js to activate this link.";
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  document.documentElement.classList.add("is-ready");
})();