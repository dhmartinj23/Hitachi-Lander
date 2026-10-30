(() => {
  const images = [
    document.getElementById("storyboard-image-a"),
    document.getElementById("storyboard-image-b")
  ];
  const log = document.getElementById("mission-log");
  const currentAction = document.getElementById("console-current");
  const clock = document.getElementById("console-clock");
  const signalReading = document.getElementById("signal-reading");
  const connectionStrength = document.getElementById("connection-strength");
  const footerLogToggle = document.getElementById("footer-log-toggle");
  const missionConsole = document.getElementById("mission-console");
  const footerLatest = document.getElementById("footer-log-latest");
  const profileWindow = document.getElementById("profile-window");
  const zoomOutButton = document.getElementById("zoom-out");
  const zoomInButton = document.getElementById("zoom-in");
  const signalChartLine = document.getElementById("signal-chart-line");
  const signalChartFill = document.getElementById("signal-chart-fill");
  const liveDomainBars = [...document.querySelectorAll("#domain-live-bars rect")];
  const dashboardSignalValue = document.getElementById("dashboard-signal-value");
  const dashboardPacketValue = document.getElementById("dashboard-packet-value");
  const fuelGauge = document.getElementById("fuel-gauge");
  const loadChannels = ["sys", "eng", "nav", "com"].map((channel, index) => ({
    bar: document.getElementById(`load-${channel}`),
    value: document.getElementById(`load-${channel}-value`),
    base: [94, 96, 89, 91][index]
  }));
  const defaultProfileZoom = .9;
  let profileZoom = defaultProfileZoom;
  let logCloseTimer;
  let pendingCrewName = "";
  let profileHudVisible = false;
  let profileTypingStarted = false;
  const signalSamples = Array.from({ length: 36 }, () => 28 + Math.random() * 88);
  let nextSignalSampleAt = performance.now() + 650;
  let signalSampleDirection = 1;
  const actions = [
    "LANDER BEACON ONLINE",
    "UPLINK FIRED · WARP ENGAGED",
    "ASTEROID FIELD CLEARED",
    "MOTHERSHIP ARRAY LOCKED",
    "RESPONSE BEAM TRANSMITTED",
    "RETURN SIGNAL IN TRANSIT",
    "LANDER RESPONSE CONFIRMED",
    "MISSION LINK ESTABLISHED"
  ];
  const signalLevels = [24, 42, 58, 76, 91, 68, 96, 100];
  const sceneSources = Array.from({ length: 8 }, (_, index) => `Scene ${index + 1}.jpg`);
  const timers = [];
  let currentScene = 0;
  let loggedScene = -1;

  const clockFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });

  function updateClock() {
    clock.textContent = clockFormatter.format(new Date());
  }

  updateClock();
  window.setInterval(updateClock, 1000);

  function startProfileTyping() {
    if (!profileHudVisible || !pendingCrewName || profileTypingStarted) return;
    profileTypingStarted = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fields = ["profile-name", "profile-title", "profile-summary", "profile-location", "profile-email", "profile-phone", "profile-linkedin"];
    const typingQueue = [];
    fields.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;
      const value = id === "profile-name" ? pendingCrewName : element.textContent;
      if (!value) {
        element.textContent = value;
        return;
      }
      // Reserve the complete value's space so typing never shifts the card layout.
      const wrapper = document.createElement("span");
      wrapper.className = "typewriter-value";
      if (id === "profile-name") wrapper.classList.add("is-typing");
      wrapper.setAttribute("aria-hidden", "true");
      const reserve = document.createElement("span");
      reserve.className = "typewriter-reserve";
      reserve.textContent = value;
      const typed = document.createElement("span");
      typed.className = "typewriter-text";
      wrapper.append(reserve, typed);
      if (!element.hasAttribute("aria-label")) element.setAttribute("aria-label", value);
      element.replaceChildren(wrapper);

      const characters = [...value];
      const delay = id === "profile-name" ? 130 : Math.min(65, 2400 / characters.length);
      typingQueue.push(() => new Promise((resolve) => {
        if (reducedMotion) {
          typed.textContent = value;
          wrapper.classList.remove("is-typing");
          resolve();
          return;
        }
        wrapper.classList.add("is-typing");
        let startedAt;
        const typeNext = (now) => {
          if (startedAt === undefined) startedAt = now;
          const count = Math.min(characters.length, Math.floor((now - startedAt) / delay) + 1);
          typed.textContent = characters.slice(0, count).join("");
          if (count < characters.length) requestAnimationFrame(typeNext);
          else {
            wrapper.classList.remove("is-typing");
            resolve();
          }
        };
        requestAnimationFrame(typeNext);
      }));
    });
    window.setTimeout(async () => {
      for (const typeField of typingQueue) await typeField();
    }, 5000);
  }

  function updateDashboardCharts() {
    if (!signalChartLine || !signalChartFill) return;
    const phase = performance.now() / 620;
    const now = performance.now();
    if (now >= nextSignalSampleAt) {
      const previous = signalSamples[signalSamples.length - 1];
      signalSampleDirection = Math.random() < .32 ? -signalSampleDirection : signalSampleDirection;
      const spike = Math.random() < .14 ? (Math.random() - .5) * 76 : 0;
      const next = Math.max(16, Math.min(132, previous + signalSampleDirection * (5 + Math.random() * 17) + (Math.random() - .5) * 22 + spike));
      signalSamples.shift();
      signalSamples.push(next);
      nextSignalSampleAt = now + 520 + Math.random() * 430;
    }
    const points = signalSamples.map((value, index) => {
      const x = 12 + index * (296 / 35);
      const drift = Math.sin(index * .72 + phase) * 2.1 + Math.sin(index * 1.81 - phase * .61) * 1.1;
      return `${x.toFixed(1)},${Math.max(12, Math.min(136, value + drift)).toFixed(1)}`;
    });
    signalChartLine.setAttribute("points", points.join(" "));
    signalChartFill.setAttribute("d", `M${points[0]} L${points.slice(1).join(" L")} L308 136 L12 136 Z`);
    liveDomainBars.forEach((bar, index) => {
      const height = 18 + (Math.sin(phase * 1.4 + index * .82) + 1) * 25 + (Math.cos(phase * .7 + index * .3) + 1) * 9;
      bar.setAttribute("height", height.toFixed(1));
      bar.setAttribute("y", (88 - height).toFixed(1));
    });
    const fuel = 91 + Math.round((Math.sin(phase * .25) + 1) * 2);
    if (fuelGauge) fuelGauge.style.strokeDashoffset = `${232.5 * (1 - fuel / 100)}`;
    setText("fuel-gauge-value", fuel);
    loadChannels.forEach(({ bar, value, base }, index) => {
      const reading = Math.max(72, Math.min(99, Math.round(base + Math.sin(phase * .5 + index) * 3)));
      if (bar) bar.style.width = `${reading}%`;
      if (value) value.textContent = reading;
    });
    if (dashboardSignalValue) dashboardSignalValue.textContent = `${(98.2 + (Math.sin(phase * .4) + 1) * .35).toFixed(1)}%`;
    if (dashboardPacketValue) dashboardPacketValue.textContent = (1.2 + (Math.sin(phase * .27) + 1) * .24).toFixed(2);
  }

  updateDashboardCharts();
  window.setInterval(updateDashboardCharts, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 900 : 120);

  function closeMissionLog() {
    window.clearTimeout(logCloseTimer);
    footerLogToggle.setAttribute("aria-expanded", "false");
    missionConsole.classList.remove("is-opening");
    missionConsole.classList.add("is-closing");
    logCloseTimer = window.setTimeout(() => {
      missionConsole.hidden = true;
      missionConsole.classList.remove("is-closing");
    }, 360);
  }

  function openMissionLog() {
    window.clearTimeout(logCloseTimer);
    missionConsole.hidden = false;
    missionConsole.classList.remove("is-closing");
    footerLogToggle.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => missionConsole.classList.add("is-opening"));
  }

  footerLogToggle.addEventListener("click", () => {
    const isOpen = footerLogToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) closeMissionLog();
    else openMissionLog();
  });


  function setProfileZoom(nextZoom) {
    profileZoom = Math.min(1.3, Math.max(.8, Math.round(nextZoom * 10) / 10));
    profileWindow.style.setProperty("--profile-zoom", profileZoom);
    zoomOutButton.disabled = profileZoom <= .8;
    zoomInButton.disabled = profileZoom >= 1.3;
  }

  zoomOutButton.addEventListener("click", () => setProfileZoom(profileZoom - .1));
  zoomInButton.addEventListener("click", () => setProfileZoom(profileZoom + .1));
  setProfileZoom(defaultProfileZoom);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && footerLogToggle.getAttribute("aria-expanded") === "true") {
      closeMissionLog();
      footerLogToggle.focus();
    }
  });

  function applyProfileInfo(profileInfo) {
    const profile = profileInfo?.profile || {};
    const currentPosition = profileInfo.currentPosition || {};
    const expertise = profileInfo.expertise || profileInfo.Skills || {};
    const location = profile.location || "Location not provided";
    const company = profile.currentCompany || "Company not provided";
    const allSkills = [...new Set([
      ...(expertise.aiAndAgentic || []),
      ...(expertise.powerPlatform || []),
      ...(expertise.architecture || []),
      ...(expertise.cloudAndData || [])
    ])];
    const nameElement = document.getElementById("profile-name");
    const crewName = profile.name || "Name not provided";
    pendingCrewName = crewName;
    nameElement.textContent = "";
    nameElement.setAttribute("aria-label", crewName);
    profileTypingStarted = false;

    const values = {
      "profile-title": profile.title || "Role not provided",
      "profile-summary": profileInfo.professionalBrand?.headline || "",
      "portrait-company": company.toUpperCase(),
      "mission-company": company.toUpperCase(),
      "mission-header-location": `EARTH STATION · ${location.toUpperCase()}`,
      "footer-location": `${location.toUpperCase()} · MISSION CONTROL`,
      "career-direction": currentPosition.careerObjective || "Career direction not provided",
      "profile-strengths": (profileInfo.keyStrengths || []).join(" · ")
    };
    for (const [id, text] of Object.entries(values)) {
      const element = document.getElementById(id);
      if (element) element.textContent = text;
    }
    document.title = `${profile.name || "Crew Profile"} · ${company} Mission Control`;

    const photo = document.getElementById("profile-photo");
    if (photo && profile.photo) {
      photo.src = profile.photo;
      photo.alt = `Portrait of ${profile.name || "crew member"}`;
    }
    const skills = document.getElementById("profile-skills");
    skills.replaceChildren(...allSkills.map((skill) => {
      const chip = document.createElement("span");
      chip.textContent = skill.toUpperCase();
      return chip;
    }));
    const domains = document.getElementById("profile-domains");
    if (domains) {
      domains.replaceChildren(...(profileInfo.domains || []).map((item) => {
        const chip = document.createElement("span");
        const experience = item.experience ? ` · ${item.experience.toUpperCase()}` : "";
        chip.textContent = `${item.domain.toUpperCase()}${experience}`;
        return chip;
      }));
    }

    const energy = (profileInfo.domains || []).find((item) => /energy|power/i.test(item.domain));
    const automotive = (profileInfo.domains || []).find((item) => /automotive/i.test(item.domain));
    setText("experience-total", profile.experience?.totalYears || "—");
    setText("experience-energy", energy?.experience?.replace(/\s*years?/i, "") || "—");
    setText("experience-auto", automotive?.experience?.replace(/\s*years?/i, "") || "—");

    const email = profile.email || "";
    const phone = profile.mobile || "";
    const linkedin = profile.linkedin || "";
    setContactValue("profile-email", email, email ? `mailto:${email}` : "");
    setContactValue("profile-phone", phone, phone ? `tel:${phone.replace(/[^+\d]/g, "")}` : "");
    setContactValue("profile-linkedin", linkedin, linkedin);
    const coords = profile.locationCoordinates;
    const mapLink = document.getElementById("profile-location");
    const configuredMapsUrl = coords?.googleMapsUrl || coords?.["Google Maps URL"];
    const fallbackQuery = coords && Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude)
      ? `${coords.latitude},${coords.longitude}`
      : location;
    const googleMapsUrl = isSafeMapsUrl(configuredMapsUrl)
      ? configuredMapsUrl
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackQuery)}`;
    if (mapLink) {
      mapLink.textContent = location;
      if (mapLink instanceof HTMLAnchorElement) {
        mapLink.href = "#location-map-card";
        mapLink.setAttribute("aria-label", `View ${location} in the Location / Map card`);
      }
    }
    const dashboardMapLink = document.getElementById("dashboard-map-link");
    const dashboardMapFrame = document.getElementById("dashboard-map-frame");
    if (dashboardMapLink) {
      dashboardMapLink.href = googleMapsUrl;
      dashboardMapLink.setAttribute("aria-label", `Open ${coords?.label || location} in Google Maps`);
    }
    if (dashboardMapFrame) {
      dashboardMapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&z=11&output=embed`;
    }
    setText("dashboard-map-location", location.toUpperCase());
    if (profileHudVisible) startProfileTyping();
  }

  function setText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  }

  function isSafeMapsUrl(value) {
    if (!value) return false;
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === "https:" && /(^|\.)google\.[a-z.]+$/i.test(url.hostname);
    } catch {
      return false;
    }
  }

  function setContactValue(id, value, href) {
    const element = document.getElementById(id);
    if (!element) return;
    if (!value) {
      element.textContent = "Not provided";
      return;
    }
    const link = document.createElement("a");
    link.href = href;
    link.className = "contact-data-link";
    link.textContent = value;
    if (id === "profile-linkedin") {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    element.replaceWith(link);
    link.id = id;
  }

  fetch("Profile_Info.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`Profile_Info.json returned ${response.status}`);
      return response.json();
    })
    .then(applyProfileInfo)
    .catch((error) => {
      console.error("Unable to load the profile. Serve the project over HTTP(S) and check Profile_Info.json.", error);
      document.getElementById("profile-name").textContent = "Profile data unavailable";
      document.getElementById("profile-summary").textContent = "Could not load Profile_Info.json. Open this page through a local or hosted web server.";
      document.getElementById("profile-location").textContent = "Profile data unavailable";
    });

  sceneSources.forEach((src) => {
    const preload = new Image();
    preload.src = src;
  });

  function logAction(index) {
    if (loggedScene === index) return;
    loggedScene = index;
    currentAction.textContent = actions[index];
    const signal = signalLevels[index];
    if (signalReading) signalReading.textContent = `${signal}%`;
    if (connectionStrength) {
      connectionStrength.style.setProperty("--signal-strength", `${signal}%`);
      connectionStrength.style.setProperty("--signal-speed", `${Math.round(2400 - signal * 16)}ms`);
      connectionStrength.querySelectorAll(".signal-wave").forEach((wave) => {
        wave.style.strokeDasharray = `${(signal * .62).toFixed(1)} 62`;
      });
      connectionStrength.setAttribute("aria-label", `Connection strength: ${signal} percent`);
    }
    footerLatest.textContent = actions[index];

    if (index === 0 && log.children.length === 1) {
      log.firstElementChild.querySelector("time").textContent = clockFormatter.format(new Date());
      log.firstElementChild.querySelector("span").textContent = actions[index];
      return;
    }

    const entry = document.createElement("li");
    const time = document.createElement("time");
    const text = document.createElement("span");
    time.textContent = clockFormatter.format(new Date());
    text.textContent = actions[index];
    entry.append(time, text);
    log.append(entry);
  }

  function showScene(index) {
    logAction(index);
    if (index === currentScene) return;

    currentScene = index;
    const incoming = images[index % images.length];
    const outgoing = images[(index + 1) % images.length];
    incoming.src = sceneSources[index];
    incoming.classList.remove("scene-motion");

    requestAnimationFrame(() => {
      incoming.classList.add("is-visible", "scene-motion");
      outgoing.classList.remove("is-visible");
    });
  }

  function alignProfileHud() {
    const frame = document.getElementById("profile-corners");
    const leader = document.getElementById("profile-name-link");
    const trace = document.getElementById("frame-trace");
    const motion = document.getElementById("profile-node-motion");
    const content = document.querySelector(".profile-copy");
    const kicker = document.querySelector(".profile-kicker");
    if (!frame || !leader || !content || !kicker) return;

    const scaleX = 1600 / window.innerWidth;
    const scaleY = 900 / window.innerHeight;
    const box = content.getBoundingClientRect();
    const heading = kicker.getBoundingClientRect();
    const pad = 15;
    const arm = 34;
    const left = Math.max(28, box.left * scaleX - pad);
    const right = Math.min(1572, box.right * scaleX + pad);
    const top = Math.max(74, box.top * scaleY - pad);
    const bottom = Math.min(826, box.bottom * scaleY + pad);
    const corners = [
      `M${left + arm} ${top}H${left}V${top + arm}`,
      `M${right - arm} ${top}H${right}V${top + arm}`,
      `M${left + arm} ${bottom}H${left}V${bottom - arm}`,
      `M${right - arm} ${bottom}H${right}V${bottom - arm}`
    ].join(" ");
    const targetX = Math.max(left + 10, heading.left * scaleX - 11);
    const targetY = heading.top * scaleY + heading.height * scaleY * .5;
    const connector = `M${left} ${top + arm}V${targetY}H${targetX}`;

    frame.setAttribute("d", corners);
    leader.setAttribute("d", connector);
    if (trace) trace.setAttribute("d", `M${left + arm} ${top}H${left}V${top + arm}M${right - arm} ${top}H${right}V${top + arm}`);
    if (motion) motion.setAttribute("path", `${corners} Z`);
    frame.style.strokeDasharray = "none";
    frame.style.strokeDashoffset = "0";
    leader.style.strokeDasharray = "none";
    leader.style.strokeDashoffset = "0";
  }

  sceneSources.forEach((_, index) => {
    timers.push(window.setTimeout(() => showScene(index), index * 1250));
  });

  timers.push(window.setTimeout(() => {
    logAction(7);
    currentAction.textContent = "MISSION LINK ESTABLISHED";
    closeMissionLog();
    images[0].classList.remove("is-visible", "scene-motion", "final-zoom");
    images[1].src = sceneSources[7];
    images[1].classList.remove("scene-motion", "final-zoom");
    images[1].classList.add("is-visible");
    document.querySelector(".cinema").classList.add("final-contact", "profile-only");
    profileHudVisible = true;
    requestAnimationFrame(startProfileTyping);
    window.setTimeout(alignProfileHud, 1050);
    document.getElementById("profile-window").addEventListener("transitionend", alignProfileHud, { once: true });
  }, 8750));

  window.addEventListener("resize", () => {
    if (document.querySelector(".cinema").classList.contains("profile-only")) alignProfileHud();
  }, { passive: true });
})();
