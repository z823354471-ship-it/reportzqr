(() => {
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobilePreference = window.matchMedia("(max-width: 768px)");

  function initHeroAvatar() {
    const card = document.querySelector("#interactive-avatar");
    const video = document.querySelector("#hero-avatar-video");
    if (!card || !video) return;

    let targetTime = 0.08;
    let frameRequest = 0;
    let isTracking = false;

    const settleFrame = () => {
      if (video.readyState >= 2) {
        const difference = targetTime - video.currentTime;
        if (Math.abs(difference) > 0.025) {
          video.currentTime += difference * 0.16;
        }
      }
      if (isTracking || Math.abs(targetTime - video.currentTime) > 0.03) {
        frameRequest = window.requestAnimationFrame(settleFrame);
      }
    };

    const startSettling = () => {
      window.cancelAnimationFrame(frameRequest);
      frameRequest = window.requestAnimationFrame(settleFrame);
    };

    const pointerTargetTime = (x, y) => {
      const radius = Math.hypot(x, y);
      if (radius < 0.24) return 0.08;

      if (y < -0.34) {
        if (x < -0.3) return 2.7;
        if (x > 0.3) return 5.0;
        return 4.0;
      }

      if (y > 0.34) {
        if (x < -0.3) return 8.5;
        if (x > 0.3) return 6.8;
        return 7.6;
      }

      return x < 0 ? 1.5 : 5.8;
    };

    const onPointerMove = (event) => {
      if (motionPreference.matches || mobilePreference.matches) return;
      const bounds = card.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      targetTime = pointerTargetTime(x, y);
      card.style.setProperty("--tilt-x", `${(-y * 3.2).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 4.2).toFixed(2)}deg`);
      isTracking = true;
      startSettling();
    };

    const onPointerLeave = () => {
      if (motionPreference.matches || mobilePreference.matches) return;
      targetTime = 0.08;
      isTracking = false;
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      startSettling();
    };

    const configureMode = () => {
      window.cancelAnimationFrame(frameRequest);
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");

      if (motionPreference.matches) {
        video.pause();
        video.currentTime = 0.08;
        video.loop = false;
        return;
      }

      if (mobilePreference.matches) {
        video.loop = true;
        video.play().catch(() => {});
        return;
      }

      video.pause();
      video.loop = false;
      targetTime = 0.08;
      video.currentTime = targetTime;
    };

    card.addEventListener("pointermove", onPointerMove);
    card.addEventListener("pointerleave", onPointerLeave);
    video.addEventListener("loadedmetadata", configureMode, { once: true });
    motionPreference.addEventListener("change", configureMode);
    mobilePreference.addEventListener("change", configureMode);
  }

  let activeTrigger = null;

  function openMediaDialog(trigger) {
    const dialog = document.querySelector("#media-dialog");
    const video = document.querySelector("#portfolio-player");
    const title = document.querySelector("#media-dialog-title");
    if (!dialog || !video || !title) return;

    activeTrigger = trigger;
    title.textContent = trigger.dataset.videoTitle || "影像作品";
    video.src = trigger.dataset.videoSrc;
    dialog.showModal();
    video.play().catch(() => {});
  }

  function closeMediaDialog() {
    const dialog = document.querySelector("#media-dialog");
    const video = document.querySelector("#portfolio-player");
    if (!dialog || !video) return;

    video.pause();
    video.removeAttribute("src");
    video.load();
    if (dialog.open) dialog.close();
    if (activeTrigger) activeTrigger.focus();
  }

  function initMediaDialog() {
    const dialog = document.querySelector("#media-dialog");
    const closeButton = document.querySelector(".dialog-close");
    if (!dialog || !closeButton) return;

    document.querySelectorAll(".media-open").forEach((trigger) => {
      trigger.addEventListener("click", () => openMediaDialog(trigger));
    });
    closeButton.addEventListener("click", closeMediaDialog);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeMediaDialog();
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMediaDialog();
      }
    });
  }

  function initRevealObserver() {
    if (motionPreference.matches || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".glass-card").forEach((element) => observer.observe(element));
  }

  initHeroAvatar();
  initMediaDialog();
  initRevealObserver();
})();
