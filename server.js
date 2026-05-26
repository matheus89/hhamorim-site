const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const rootDir = __dirname;
const dataDir = path.join(rootDir, "data");
const leadsFile = path.join(dataDir, "leads.jsonl");
const port = Number(process.env.PORT || 4173);
const webhookUrl = process.env.LEAD_WEBHOOK_URL || "";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Payload muito grande."));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function cleanText(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

function scoreLead(lead) {
  let score = 0;
  if (lead.marca && lead.marca.length > 1) score += 45;
  if (lead.whatsapp && lead.whatsapp.replace(/\D/g, "").length >= 10) score += 45;
  if (lead.consentimento === "Sim") score += 10;
  return score;
}

function normalizeLead(input) {
  const lead = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    source: cleanText(input.source || "site-hh-amorim", 80),
    marca: cleanText(input.marca, 160),
    uso: cleanText(input.uso, 80),
    segmento: cleanText(input.segmento, 80),
    tentou: cleanText(input.tentou, 80),
    semelhante: cleanText(input.semelhante, 80),
    urgencia: cleanText(input.urgencia, 100),
    nome: cleanText(input.nome, 160),
    whatsapp: cleanText(input.whatsapp, 60),
    email: cleanText(input.email, 180),
    site: cleanText(input.site, 220),
    cnpj: cleanText(input.cnpj, 40),
    consentimento: cleanText(input.consentimento, 20)
  };

  lead.score = scoreLead(lead);
  lead.qualified = lead.score >= 70;
  return lead;
}

function validateLead(lead) {
  const missing = [];
  ["marca", "whatsapp"].forEach((field) => {
    if (!lead[field]) missing.push(field);
  });

  if (lead.consentimento !== "Sim") missing.push("consentimento");
  if (lead.whatsapp.replace(/\D/g, "").length < 10) return "Informe um WhatsApp válido.";
  if (missing.length) return `Campos obrigatórios ausentes: ${missing.join(", ")}.`;
  return "";
}

async function forwardLead(lead) {
  if (!webhookUrl || typeof fetch !== "function") return { forwarded: false };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead)
    });
    return { forwarded: response.ok, status: response.status };
  } catch (error) {
    return { forwarded: false, error: error.message };
  }
}

async function handleLead(req, res) {
  try {
    const body = await getRequestBody(req);
    const input = JSON.parse(body || "{}");
    const lead = normalizeLead(input);
    const validationError = validateLead(lead);

    if (validationError) {
      sendJson(res, 400, { ok: false, message: validationError });
      return;
    }

    await fs.mkdir(dataDir, { recursive: true });
    await fs.appendFile(leadsFile, `${JSON.stringify(lead)}\n`, "utf8");
    const forwardResult = await forwardLead(lead);

    sendJson(res, 201, {
      ok: true,
      id: lead.id,
      qualified: lead.qualified,
      score: lead.score,
      forwarded: forwardResult.forwarded
    });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: "Erro ao registrar a solicitação." });
  }
}

async function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const decodedPath = decodeURIComponent(requestUrl.pathname);
  const safePath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(rootDir, safePath === "/" ? "index.html" : safePath);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    const finalPath = stat.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const ext = path.extname(finalPath).toLowerCase();
    const content = await fs.readFile(finalPath);

    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(content);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/leads") {
    handleLead(req, res);
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method not allowed");
});

server.listen(port, () => {
  console.log(`HH Amorim site running at http://127.0.0.1:${port}/`);
});
