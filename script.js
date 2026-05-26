const config = window.HH_AMORIM_CONFIG || {};
const form = document.querySelector("#leadForm");
const formError = document.querySelector("#formError");
const submitButton = document.querySelector("#submitLead");
const thankYou = document.querySelector("#thankYou");
const leadStatus = document.querySelector("#leadStatus");
const calendarLink = document.querySelector("#calendarLink");

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

function buildEmailLink(lead) {
  const email = config.contactEmail || "contato@hhamorim.com.br";
  const subject = encodeURIComponent(`Análise de Registro de Marca - ${lead.marca || ""}`);
  const body = encodeURIComponent(
    `Olá, gostaria de agendar uma análise inicial da marca ${lead.marca || ""}.\n\nWhatsApp: ${lead.whatsapp || ""}`
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

document.querySelectorAll("[data-event]").forEach((element) => {
  element.addEventListener("click", () => track(element.dataset.event));
});
