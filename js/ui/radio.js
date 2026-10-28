import { emit, on } from "../core/eventBus.js";
import { t } from "../i18n/i18n.js";
import { createLifecycle } from "./lifecycle.js";

const RADIO_SITE = "https://radioparadise.com/";
const NOW_PLAYING_API = "https://api.radioparadise.com/api/now_playing";

const RADIO_CHANNELS = [
  {
    id: 0,
    key: "radio.channel.main",
    stream: "https://stream.radioparadise.com/aac-320"
  },
  {
    id: 1,
    key: "radio.channel.mellow",
    stream: "https://stream.radioparadise.com/mellow-320"
  },
  {
    id: 2,
    key: "radio.channel.rock",
    stream: "https://stream.radioparadise.com/rock-320"
  },
  {
    id: 3,
    key: "radio.channel.global",
    stream: "https://stream.radioparadise.com/global-320"
  },
  {
    id: 4,
    key: "radio.channel.beyond",
    stream: "https://stream.radioparadise.com/beyond-320"
  }
];

export function createRadio() {
  const lifecycle = createLifecycle();

  let root = null;
  let audio = null;

  let stationLink = null;
  let statusDot = null;
  let playButton = null;
  let channelsButton = null;
  let channelsModal = null;
  let channelList = null;
  let volume = null;

  let currentChannel = RADIO_CHANNELS[0];
  let desiredPlaying = false;
  let connecting = false;
  let request = 0;
  let metadataTimer = null;
  let connectTimer = null;

  function feedback(key) {
    emit("feedback:show", {
      message: t(key)
    });
  }

  function build() {
    root.innerHTML = "";

    stationLink = document.createElement("a");
    stationLink.className = "radio-station";
    stationLink.href = RADIO_SITE;
    stationLink.target = "_blank";
    stationLink.rel = "noopener noreferrer";

    const stationName = document.createElement("span");
    stationName.className = "radio-station-name";
    stationName.textContent = "Radio Paradise";

    statusDot = document.createElement("span");
    statusDot.className = "radio-status-dot";
    statusDot.setAttribute("aria-hidden", "true");

    stationLink.append(stationName, statusDot);

    channelsButton = document.createElement("button");
    channelsButton.className = "radio-icon-button";
    channelsButton.type = "button";
    channelsButton.textContent = "≡";
    channelsButton.title = t("radio.channels");
    channelsButton.setAttribute("aria-label", t("radio.channels"));
    channelsButton.setAttribute("aria-haspopup", "dialog");
    channelsButton.setAttribute("aria-expanded", "false");

    playButton = document.createElement("button");
    playButton.className = "radio-icon-button radio-play-button";
    playButton.type = "button";
    playButton.textContent = "▶";

    channelsModal = document.createElement("div");
    channelsModal.className = "radio-modal";
    channelsModal.hidden = true;

    const card = document.createElement("div");
    card.className = "radio-modal__card";

    const title = document.createElement("div");
    title.className = "radio-modal__title";
    title.textContent = t("radio.channels");

    channelList = document.createElement("div");
    channelList.className = "radio-modal__list";

    RADIO_CHANNELS.forEach(channel => {
      const button = document.createElement("button");
      button.className = "radio-modal__item";
      button.type = "button";
      button.dataset.channel = String(channel.id);
      button.textContent = t(channel.key);

      lifecycle.listen(button, "click", () => {
        selectChannel(channel.id).catch(console.error);
        closeChannels();
      });

      channelList.append(button);
    });

    const volumeBlock = document.createElement("div");
volumeBlock.className = "radio-modal__volume";

const volumeIcon = document.createElement("span");
volumeIcon.className = "radio-modal__volume-icon";
volumeIcon.textContent = "🔊";
volumeIcon.setAttribute("aria-hidden", "true");

volume = document.createElement("input");
volume.className = "radio-modal__volume-input";
volume.type = "range";
volume.min = "0";
volume.max = "1";
volume.step = "0.01";
volume.value = "0.8";
volume.setAttribute("aria-label", t("radio.volume"));

volumeBlock.append(volumeIcon, volume);

card.append(title, channelList, volumeBlock);
channelsModal.append(card);

root.append(stationLink, playButton, channelsButton, channelsModal);

    lifecycle.listen(playButton, "click", () => {
      toggle().catch(console.error);
    });

    lifecycle.listen(channelsButton, "click", event => {
      event.stopPropagation();
      toggleChannels();
    });

    lifecycle.listen(volume, "input", () => {
      if (audio) {
        audio.volume = Number(volume.value);
      }
    });

    lifecycle.listen(document, "click", event => {
      if (
        !channelsModal.hidden &&
        !channelsModal.contains(event.target) &&
        !channelsButton.contains(event.target)
      ) {
        closeChannels();
      }
    });

    lifecycle.listen(document, "keydown", event => {
      if (event.key === "Escape" && !channelsModal.hidden) {
        closeChannels();
      }
    });

    update();
  }

  function openChannels() {
    channelsModal.hidden = false;
    channelsButton.setAttribute("aria-expanded", "true");
    update();
  }

  function closeChannels() {
    channelsModal.hidden = true;
    channelsButton.setAttribute("aria-expanded", "false");
  }

  function toggleChannels() {
    if (channelsModal.hidden) {
      openChannels();
    } else {
      closeChannels();
    }
  }

  function update() {
    if (!playButton || !statusDot) {
      return;
    }

    const playing = Boolean(
      audio &&
      !audio.paused &&
      !audio.ended &&
      audio.readyState >= 3
    );

    const state = connecting
      ? "loading"
      : playing
        ? "playing"
        : "paused";

    root.dataset.state = state;

    playButton.textContent = desiredPlaying ? "❚❚" : "▶";

    const label = t(desiredPlaying ? "radio.pause" : "radio.play");

    playButton.title = label;
    playButton.setAttribute("aria-label", label);
    playButton.setAttribute("aria-pressed", String(desiredPlaying));
    playButton.setAttribute("aria-busy", String(connecting));

    stationLink.title = t(state);

    channelList?.querySelectorAll(".radio-modal__item").forEach(button => {
      const selected =
        Number(button.dataset.channel) === currentChannel.id;

      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-current", selected ? "true" : "false");
    });
  }

  async function loadNowPlaying() {
    const currentRequest = request;

    try {
      const url = `${NOW_PLAYING_API}?chan=${currentChannel.id}`;
      const response = await fetch(url, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (lifecycle.destroyed || currentRequest !== request) {
        return;
      }

      const artist = data?.artist?.trim() || "";
      const title = data?.title?.trim() || "";

      if (artist && title) {
        stationLink.title = `${artist} — ${title}`;
      }

      const seconds = Number(data?.time);

      if (Number.isFinite(seconds) && seconds > 0) {
        scheduleMetadataRefresh(seconds);
      }
    } catch (error) {
      console.warn("Radio metadata unavailable:", error);
    }
  }

  function scheduleMetadataRefresh(seconds) {
    clearTimeout(metadataTimer);

    const delay = Math.min(Math.max(seconds, 5), 60) * 1000;

    metadataTimer = setTimeout(() => {
      if (!lifecycle.destroyed && desiredPlaying) {
        loadNowPlaying();
      }
    }, delay);
  }

  function fail() {
    const shouldReport = desiredPlaying;

    request++;
    desiredPlaying = false;
    connecting = false;

    clearTimeout(connectTimer);
    clearTimeout(metadataTimer);

    if (audio) {
      audio.pause();
    }

    update();

    if (shouldReport) {
      feedback("radio.retry");
    }
  }

  function ensureAudio() {
    if (audio) {
      return audio;
    }

    audio = new Audio();
    audio.preload = "none";
    audio.volume = Number(volume?.value ?? 0.8);
    audio.src = currentChannel.stream;

    lifecycle.listen(audio, "playing", () => {
      connecting = false;
      clearTimeout(connectTimer);
      update();
      loadNowPlaying();
    });

    lifecycle.listen(audio, "pause", () => {
      connecting = false;
      clearTimeout(connectTimer);
      update();
    });

    lifecycle.listen(audio, "ended", () => {
      fail();
    });

    lifecycle.listen(audio, "error", () => {
      fail();
    });

    return audio;
  }

  function stop() {
    request++;
    desiredPlaying = false;
    connecting = false;

    clearTimeout(connectTimer);
    clearTimeout(metadataTimer);

    audio?.pause();
    update();
  }

  async function play() {
    const player = ensureAudio();
    const currentRequest = ++request;

    if (player.src !== currentChannel.stream) {
      player.src = currentChannel.stream;
      player.load();
    }

    connecting = true;
    update();

    clearTimeout(connectTimer);
    connectTimer = setTimeout(() => {
      if (connecting) {
        fail();
      }
    }, 10000);

    try {
      await player.play();

      if (lifecycle.destroyed || currentRequest !== request) {
        return;
      }

      connecting = false;
      update();
      loadNowPlaying();
      feedback("radio.enabled");
    } catch (error) {
      if (lifecycle.destroyed || currentRequest !== request) {
        return;
      }

      console.warn("Radio playback failed:", error);
      fail();
    }
  }

  async function toggle() {
    if (lifecycle.destroyed) {
      return;
    }

    desiredPlaying = !desiredPlaying;

    if (!desiredPlaying) {
      stop();
      feedback("radio.disabled");
      return;
    }

    await play();
  }

  async function selectChannel(id) {
    const channel = RADIO_CHANNELS.find(item => item.id === id);

    if (!channel || channel.id === currentChannel.id) {
      return;
    }

    currentChannel = channel;

    if (audio) {
      audio.src = channel.stream;
      audio.load();
    }

    if (desiredPlaying) {
      await play();
    } else {
      update();
    }
  }

  function refreshTexts() {
    if (!root) {
      return;
    }

    channelsButton.title = t("radio.channels");
    channelsButton.setAttribute("aria-label", t("radio.channels"));
    volume.setAttribute("aria-label", t("radio.volume"));

    channelsModal.querySelector(".radio-modal__title").textContent =
      t("radio.channels");

    channelList.querySelectorAll(".radio-modal__item").forEach(button => {
      const channel = RADIO_CHANNELS.find(
        item => item.id === Number(button.dataset.channel)
      );

      if (channel) {
        button.textContent = t(channel.key);
      }
    });

    update();
  }

  function mount(target) {
    if (!target || lifecycle.destroyed) {
      return;
    }

    root = target;
    build();

    lifecycle.add(
      on("language:changed", refreshTexts)
    );
  }

  function destroy() {
    if (lifecycle.destroyed) {
      return;
    }

    request++;
    desiredPlaying = false;
    connecting = false;

    clearTimeout(connectTimer);
    clearTimeout(metadataTimer);
    lifecycle.destroy();

    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio = null;
    }

    if (root) {
      root.innerHTML = "";
      root = null;
    }
  }

  return {
    mount,
    destroy,
    toggle
  };
}