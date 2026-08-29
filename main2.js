// ===== Global state & helpers =====
const ambientAudio = document.getElementById("ambientAudio");
const voiceToggle  = document.getElementById("voiceToggle");
const titleEl      = document.getElementById("title");
const storyEl      = document.getElementById("storyText");
const buttonsEl    = document.getElementById("buttonsContainer");
const gameWrap     = document.getElementById("gameContainer");
const ImageEl      = document.getElementById("Image");

let soundEnabled = true;
let narrationUtterance = null;
let currentStage = "intro";

// ===== Stage data =====
const STAGES = {
  intro: {
    bg: "assets/intro.png",
    title: "The Exhibits Speak",
    text: `Ακούστε την Ιστορία τους!`,
    buttons: [
      { label: "Άνοιγμα Σαρωτή", action: () => {
          stopAmbient();
          window.open(`ar.html?from=${currentStage}`, "_blank");
      }},
	  { label: "Πίσω", action: () => {
          window.open(`index.html?from=${currentStage}`, "_blank");
      }}
    ]
  },

  story1: {
    bg: "assets/instructions.png",
    title: "Το Πιθάρι του Πατέρα",
    text: `ΙΣΤΟΡΙΑ ΜΕ ΠΙΘΑΡΙ`,
    buttons: [
      { label: "Back", action: () => goTo("intro") }
    ]
  },

  role: {
    bg: "assets/role-selection.png",
    title: "Menu",
    text: `Ancient Scanner Detector 3000`,
    buttons: [
    { label: "Lore Keeper", action: () => goTo("intro") },
    ]
  },

  // ——— Minimal edits so the end "has meaning" ———
  end: {
  bg: "assets/olympus.jpg",
  title: "Ολοκλήρωση",
  text: `Ολοκλήρωσες το ταξίδι σου.<br><br>Θέλεις να ξαναρχίσεις;`,
  buttons: [
    { label: "Ξεκίνημα ξανά", action: () => goTo("intro", true) }
  ]
}
};

// ===== Sound / Narration =====
function enableSound() {
  soundEnabled = true;
  voiceToggle.classList.add("active");
  voiceToggle.textContent = "🔊";
}

function disableSound() {
  soundEnabled = false;
  voiceToggle.classList.remove("active");
  voiceToggle.textContent = "🔇";
  cancelNarration();
  stopAmbient();
}

function playAmbient() {
  if (!soundEnabled) return;
  ambientAudio.volume = 0.4;
  ambientAudio.play().catch(() => {});
}

function stopAmbient() { ambientAudio.pause(); }

function cancelNarration() {
  try {
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
  } catch {}
}

function speak(text) {
  cancelNarration();
  if (!soundEnabled) return;
  let plainText = text.replace(/<a[^>]*>.*?<\/a>/gi, "");
  plainText = plainText.replace(/(<([^>]+)>)/gi, "");
  plainText = plainText.replace(/&[a-z]+;/gi, " ");
  plainText = plainText.replace(/\s+/g, " ").trim();
  const u = new SpeechSynthesisUtterance(plainText);
  u.lang = "en-GB";
  u.rate = 1.05;
  u.pitch = 1.0;
  narrationUtterance = u;
  speechSynthesis.speak(u);
}

voiceToggle.addEventListener("click", () => {
  if (soundEnabled) {
    disableSound();
  } else {
    enableSound();
    playAmbient();
  }
});

// ===== Navigation =====
function goTo(stage, resetAll = false) {
  // If called as Restart with resetAll=true, do a soft reset so the action έχει νόημα
  if (resetAll === true) {
    cancelNarration();
    stopAmbient();
    disableSound();               // επιστρέφει το σύστημα σε «σίγαση»
    try { history.replaceState({}, "", location.pathname); } catch {}
  }

  currentStage = stage;
  const s = STAGES[stage];
  if (!s) return;

  if (s.bg) gameWrap.style.backgroundImage = `url('${s.bg}')`;
  titleEl.textContent = s.title || "";
  storyEl.innerHTML = s.text || "";
  
  buttonsEl.innerHTML = "";
  (s.buttons || []).forEach(b => {
    const btn = document.createElement("button");
    btn.textContent = b.label;
    btn.addEventListener("click", b.action);
    buttonsEl.appendChild(btn);
  });
  
  if (s.image) {
    imageEl.src = s.image;
    imageEl.style.display = "block";
  } else {
    imageEl.style.display = "none";
    imageEl.src = "";
  }

 
}

// ===== Init =====
window.addEventListener("load", () => {
  const params = new URLSearchParams(window.location.search);
  const section = params.get("section");
  if (section && STAGES[section]) {
    goTo(section);
  } else {
    goTo("intro");
  }
  ambientAudio.volume = 0.4;
  enableSound();
  cancelNarration();
  playAmbient();
  
  
});
