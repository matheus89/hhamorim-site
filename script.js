const config = window.HH_AMORIM_CONFIG || {};
const form = document.querySelector("#leadForm");
const formError = document.querySelector("#formError");
const submitButton = document.querySelector("#submitLead");
const thankYou = document.querySelector("#thankYou");
const leadStatus = document.querySelector("#leadStatus");
const calendarLink = document.querySelector("#calendarLink");
const clientTrack = document.querySelector("#clientTrack");
const clientPrev = document.querySelector("#clientPrev");
const clientNext = document.querySelector("#clientNext");
const clientDots = document.querySelector("#clientDots");
const formSteps = [...document.querySelectorAll(".form-step")];
const stepNextButtons = [...document.querySelectorAll(".step-next")];
const stepPrevButtons = [...document.querySelectorAll(".step-prev")];
const stepCurrent = document.querySelector("#stepCurrent");
const stepKicker = document.querySelector("#stepKicker");
const stepMeterItems = [...document.querySelectorAll(".step-meter span")];
let activeStep = 0;

window.dataLayer = window.dataLayer || [];

function track(eventName, payload = {}) {
  window.dataLayer.push({ event: eventName, ...payload });
}

function formDataToObject() {
  const data = new FormData(form);
  return Object.fromEntries(data.entries());
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function scoreLead(lead) {
  let score = 0;
  if (lead.marca && lead.marca.length > 1) score += 45;
  if (normalizePhone(lead.whatsapp).length >= 10) score += 45;
  if (lead.consentimento === "Sim") score += 10;
  return score;
}

function validateLead(lead) {
  if (!lead.marca || lead.marca.trim().length < 2) {
    return {
      message: "Informe o nome da marca que você quer verificar.",
      field: form.elements.marca
    };
  }

  if (!lead.segmento || lead.segmento.trim().length < 2) {
    return {
      message: "Informe o segmento da marca para continuar o teste.",
      field: form.elements.segmento
    };
  }

  if (!lead.uso) {
    return {
      message: "Escolha como a marca está sendo usada hoje.",
      field: form.elements.uso[0]
    };
  }

  if (!lead.nome || lead.nome.trim().length < 2) {
    return {
      message: "Informe seu nome para receber a resposta.",
      field: form.elements.nome
    };
  }

  if (!lead.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return {
      message: "Informe um e-mail válido para receber o diagnóstico.",
      field: form.elements.email
    };
  }

  if (normalizePhone(lead.whatsapp).length < 10) {
    return {
      message: "Informe um WhatsApp com DDD para a equipe retornar.",
      field: form.elements.whatsapp
    };
  }

  if (lead.consentimento !== "Sim") {
    return {
      message: "Confirme a autorização de contato para receber o diagnóstico.",
      field: form.elements.consentimento
    };
  }

  return null;
}

function setStep(index) {
  activeStep = Math.max(0, Math.min(index, formSteps.length - 1));

  formSteps.forEach((step, stepIndex) => {
    const isActive = stepIndex === activeStep;
    step.hidden = !isActive;
    step.classList.toggle("active", isActive);
  });

  stepMeterItems.forEach((item, itemIndex) => {
    item.classList.toggle("active", itemIndex <= activeStep);
  });

  if (stepCurrent) stepCurrent.textContent = String(activeStep + 1);
  if (stepKicker) {
    stepKicker.textContent = activeStep === formSteps.length - 1 ? "Resultado inicial" : "Teste gratuito";
  }

  formError.textContent = "";
}

function validateStep(index) {
  const lead = formDataToObject();

  if (index === 0) {
    if (!lead.marca || lead.marca.trim().length < 2) {
      return { message: "Informe o nome da marca que você quer verificar.", field: form.elements.marca };
    }

    if (!lead.segmento || lead.segmento.trim().length < 2) {
      return { message: "Informe o segmento da marca para continuar.", field: form.elements.segmento };
    }
  }

  if (index === 1 && !lead.uso) {
    return { message: "Escolha uma opção para continuar o teste.", field: form.elements.uso[0] };
  }

  return null;
}

function buildEmailLink(lead) {
  const email = config.contactEmail || "contato@hhamorim.com.br";
  const subject = encodeURIComponent(`Análise de Registro de Marca - ${lead.marca || ""}`);
  const body = encodeURIComponent(
    `Olá, gostaria de agendar uma análise inicial da marca ${lead.marca || ""}.\n\nSegmento: ${lead.segmento || ""}\nUso atual: ${lead.uso || ""}\nE-mail: ${lead.email || ""}\nWhatsApp: ${lead.whatsapp || ""}`
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

function buildWhatsAppLink(lead) {
  if (!config.whatsappNumber) return "";
  const text = encodeURIComponent(
    `Olá, preenchi o formulário da HH Amorim e quero agendar a análise da marca ${lead.marca || ""}.`
  );
  return `https://wa.me/${config.whatsappNumber}?text=${text}`;
}

function getScheduleLink(lead) {
  if (config.calendarUrl) return config.calendarUrl;
  return buildWhatsAppLink(lead) || buildEmailLink(lead);
}

async function submitLead(lead) {
  const endpoint = config.leadEndpoint || "/api/leads";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Não foi possível registrar a solicitação.");
  }

  return response.json();
}

function showThankYou(lead, result, savedOnline) {
  calendarLink.href = getScheduleLink(lead);
  calendarLink.textContent = config.calendarUrl ? "Escolher horário" : "Agendar análise";

  thankYou.classList.toggle("success", savedOnline);
  thankYou.classList.toggle("warning", !savedOnline);
  leadStatus.textContent = savedOnline
    ? "Sua solicitação foi registrada. O próximo passo é escolher um horário para atendimento."
    : "Sua solicitação ficou salva neste dispositivo. Use o botão abaixo para chamar a equipe e finalizar o agendamento.";

  form.hidden = true;
  thankYou.hidden = false;
  thankYou.scrollIntoView({ behavior: "smooth", block: "center" });

  track("Lead", {
    id: result && result.id,
    marca: lead.marca,
    score: lead.score,
    qualified: lead.qualified
  });

  if (lead.qualified) {
    track("QualifiedLead", { id: result && result.id, marca: lead.marca, score: lead.score });
  }
}

stepNextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const validation = validateStep(activeStep);

    if (validation) {
      formError.textContent = validation.message;
      validation.field.focus();
      return;
    }

    setStep(activeStep + 1);
    const activeFieldset = formSteps[activeStep];
    activeFieldset.querySelector("input, button")?.focus();
  });
});

stepPrevButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setStep(activeStep - 1);
    const activeFieldset = formSteps[activeStep];
    activeFieldset.querySelector("input, button")?.focus();
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const lead = formDataToObject();
  const validation = validateLead(lead);

  if (validation) {
    formError.textContent = validation.message;
    validation.field.focus();
    return;
  }

  lead.score = scoreLead(lead);
  lead.qualified = lead.score >= 80;
  lead.createdAt = new Date().toISOString();
  lead.source = "site-hh-amorim";

  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
  formError.textContent = "";

  try {
    const result = await submitLead(lead);
    localStorage.setItem("hhAmorimLead", JSON.stringify({ ...lead, id: result.id }));
    showThankYou(lead, result, true);
  } catch (error) {
    localStorage.setItem("hhAmorimLead", JSON.stringify(lead));
    showThankYou(lead, null, false);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Receber diagnóstico";
  }
});

setStep(0);

document.querySelectorAll("[data-event]").forEach((element) => {
  element.addEventListener("click", () => track(element.dataset.event));
});

function setupClientCarousel() {
  if (!clientTrack || !clientPrev || !clientNext || !clientDots) return;

  const cards = [...clientTrack.querySelectorAll(".client-logo-card")];
  const dots = cards.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Ir para cliente ${index + 1}`);
    dot.addEventListener("click", () => {
      cards[index].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
    clientDots.appendChild(dot);
    return dot;
  });

  function updateDots() {
    const trackCenter = clientTrack.scrollLeft + clientTrack.clientWidth / 2;
    let activeIndex = 0;
    let activeDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - trackCenter);
      if (distance < activeDistance) {
        activeDistance = distance;
        activeIndex = index;
      }
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === activeIndex);
      dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    });
  }

  function scrollByCard(direction) {
    const cardWidth = cards[0].offsetWidth + 14;
    clientTrack.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
  }

  clientPrev.addEventListener("click", () => scrollByCard(-1));
  clientNext.addEventListener("click", () => scrollByCard(1));
  clientTrack.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByCard(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByCard(1);
    }
  });
  clientTrack.addEventListener("scroll", () => window.requestAnimationFrame(updateDots));
  updateDots();
}

setupClientCarousel();
