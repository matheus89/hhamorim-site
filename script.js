const totalSteps = 7;
let currentStep = 1;

const config = window.HH_AMORIM_CONFIG || {};
const form = document.querySelector("#leadForm");
const steps = [...document.querySelectorAll(".form-step")];
const progressBar = document.querySelector("#progressBar");
const stepLabel = document.querySelector("#stepLabel");
const prevButton = document.querySelector("#prevStep");
const nextButton = document.querySelector("#nextStep");
const submitButton = document.querySelector("#submitLead");
const formError = document.querySelector("#formError");
const thankYou = document.querySelector("#thankYou");
const leadStatus = document.querySelector("#leadStatus");
const calendarLink = document.querySelector("#calendarLink");

window.dataLayer = window.dataLayer || [];

function track(eventName, payload = {}) {
  window.dataLayer.push({ event: eventName, ...payload });
}

function getCurrentFields() {
  return [...steps[currentStep - 1].querySelectorAll("input")];
}

function validateCurrentStep() {
  const fields = getCurrentFields();
  const radioGroups = new Set();
  formError.textContent = "";

  for (const field of fields) {
    if (field.type === "radio") {
      radioGroups.add(field.name);
      continue;
    }

    if (!field.checkValidity()) {
      formError.textContent = field.type === "checkbox"
        ? "Confirme a autorizacao de contato antes de enviar."
        : "Preencha o campo obrigatorio antes de continuar.";
      field.focus();
      return false;
    }
  }

  for (const group of radioGroups) {
    const selected = form.querySelector(`input[name="${group}"]:checked`);
    const required = form.querySelector(`input[name="${group}"][required]`);
    if (required && !selected) {
      formError.textContent = "Selecione uma opcao antes de continuar.";
      return false;
    }
  }

  return true;
}

function showStep(step) {
  currentStep = Math.min(Math.max(step, 1), totalSteps);

  steps.forEach((item) => {
    item.classList.toggle("active", Number(item.dataset.step) === currentStep);
  });

  const progress = (currentStep / totalSteps) * 100;
  progressBar.style.width = `${progress}%`;
  stepLabel.textContent = `Etapa ${currentStep} de ${totalSteps}`;
  prevButton.style.visibility = currentStep === 1 ? "hidden" : "visible";
  nextButton.style.display = currentStep === totalSteps ? "none" : "inline-flex";
  submitButton.style.display = currentStep === totalSteps ? "inline-flex" : "none";
  formError.textContent = "";

  track("FormStepView", { step: currentStep });
}

function formDataToObject() {
  const data = new FormData(form);
  return Object.fromEntries(data.entries());
}

function scoreLead(lead) {
  let score = 0;
  if (lead.marca && lead.marca.length > 1) score += 20;
  if (lead.uso === "Sim, ja uso no mercado" || lead.uso === "Uso ha mais de 1 ano") score += 20;
  if (lead.urgencia === "Quero registrar agora" || lead.urgencia === "Recebi alerta ou notificacao") score += 25;
  if (lead.whatsapp && lead.whatsapp.replace(/\D/g, "").length >= 10) score += 20;
  if (lead.segmento && lead.segmento !== "Outro") score += 15;
  return score;
}

function buildEmailLink(lead) {
  const email = config.contactEmail || "contato@hhamorim.com.br";
  const subject = encodeURIComponent(`Analise de Registro de Marca - ${lead.marca || ""}`);
  const body = encodeURIComponent(
    `Ola, gostaria de agendar uma analise inicial da marca ${lead.marca || ""}.\n\nNome: ${lead.nome || ""}\nWhatsApp: ${lead.whatsapp || ""}\nSegmento: ${lead.segmento || ""}\nUrgencia: ${lead.urgencia || ""}`
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

function buildWhatsAppLink(lead) {
  if (!config.whatsappNumber) return "";
  const text = encodeURIComponent(
    `Ola, preenchi o formulario da HH Amorim e quero agendar a analise da marca ${lead.marca || ""}.`
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
    throw new Error(error.message || "Nao foi possivel registrar a solicitacao.");
  }

  return response.json();
}

function showThankYou(lead, result, savedOnline) {
  calendarLink.href = getScheduleLink(lead);
  calendarLink.textContent = config.calendarUrl ? "Escolher horario" : "Agendar analise";

  thankYou.classList.toggle("success", savedOnline);
  thankYou.classList.toggle("warning", !savedOnline);
  leadStatus.textContent = savedOnline
    ? "Sua solicitacao foi registrada. O proximo passo e escolher um horario para atendimento."
    : "Sua solicitacao ficou salva neste dispositivo. Use o botao abaixo para chamar a equipe e finalizar o agendamento.";

  form.hidden = true;
  thankYou.hidden = false;
  thankYou.scrollIntoView({ behavior: "smooth", block: "center" });

  track("Lead", {
    id: result && result.id,
    marca: lead.marca,
    segmento: lead.segmento,
    score: lead.score,
    qualified: lead.qualified
  });

  if (lead.qualified) {
    track("QualifiedLead", { id: result && result.id, marca: lead.marca, score: lead.score });
  }
}

prevButton.addEventListener("click", () => showStep(currentStep - 1));

nextButton.addEventListener("click", () => {
  if (!validateCurrentStep()) return;
  showStep(currentStep + 1);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateCurrentStep()) return;

  const lead = formDataToObject();
  lead.score = scoreLead(lead);
  lead.qualified = lead.score >= 70;
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
    submitButton.textContent = "Enviar e agendar";
  }
});

document.querySelectorAll("[data-event]").forEach((element) => {
  element.addEventListener("click", () => track(element.dataset.event));
});

showStep(1);
