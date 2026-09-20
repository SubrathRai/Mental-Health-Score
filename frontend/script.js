// Frontend for the FastAPI student mental health model.
// Endpoint contract taken from app.py and schemas/user_input.py:
//   POST /predict  ->  StudentData  ->  { "Mental_Health_Score": float }

const API_BASE = " https://mental-health-score-34jn.onrender.com";
const PREDICT_URL = `${API_BASE}/predict`;

// name -> how the value must be sent and validated
const FIELDS = {
  Age:                     { type: "int",    min: 0 },
  Gender:                  { type: "string" },
  Country:                 { type: "string" },
  Academic_Level:          { type: "string" },
  Most_Used_Platform:      { type: "string" },
  Purpose_Of_Use:          { type: "string" },
  Avg_Daily_Usage_Hours:   { type: "float",  min: 0, max: 24 },
  Daily_Unlocks:           { type: "int",    min: 0 },
  Study_Hours:             { type: "float",  min: 0, max: 24 },
  Physical_Activity_Hours: { type: "float",  min: 0, max: 24 },
  Sleep_Hours_Per_Night:   { type: "float",  min: 0, max: 24 },
  Stress_Level:            { type: "string" },
};

const form = document.getElementById("predict-form");
const predictBtn = document.getElementById("predict-btn");
const resetBtn = document.getElementById("reset-btn");
const payloadPreview = document.getElementById("payload-preview");

const states = {
  empty: document.getElementById("state-empty"),
  loading: document.getElementById("state-loading"),
  error: document.getElementById("state-error"),
  result: document.getElementById("state-result"),
};

function showState(name) {
  Object.entries(states).forEach(([key, el]) => { el.hidden = key !== name; });
}

function clearErrors() {
  document.querySelectorAll(".error").forEach((el) => {
    el.textContent = "";
    el.classList.remove("show");
  });
  document.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
}

function setFieldError(name, message) {
  const slot = document.querySelector(`[data-error-for="${name}"]`);
  const input = document.getElementById(name);
  if (slot) {
    slot.textContent = message;
    slot.classList.add("show");
  }
  if (input) input.classList.add("invalid");
}

function showError(title, message) {
  document.getElementById("error-title").textContent = title;
  document.getElementById("error-message").textContent = message;
  showState("error");
}

// Reads the form and returns { payload } or { errors }
function buildPayload() {
  const payload = {};
  const errors = {};

  for (const [name, rule] of Object.entries(FIELDS)) {
    const raw = (document.getElementById(name).value ?? "").trim();

    if (raw === "") {
      errors[name] = "This field is required.";
      continue;
    }

    if (rule.type === "string") {
      payload[name] = raw;
      continue;
    }

    const num = Number(raw);
    if (!Number.isFinite(num)) {
      errors[name] = "Enter a valid number.";
      continue;
    }
    if (rule.type === "int" && !Number.isInteger(num)) {
      errors[name] = "Enter a whole number.";
      continue;
    }
    if (rule.min !== undefined && num < rule.min) {
      errors[name] = `Must be ${rule.min} or more.`;
      continue;
    }
    if (rule.max !== undefined && num > rule.max) {
      errors[name] = `Must be ${rule.max} or less.`;
      continue;
    }
    payload[name] = num;
  }

  return Object.keys(errors).length ? { errors } : { payload };
}

// Turns a FastAPI 422 body into readable text and highlights the fields
function reportValidationErrors(body) {
  const detail = body && body.detail;
  if (!Array.isArray(detail)) {
    return typeof detail === "string" ? detail : "The server rejected the submitted values.";
  }
  const lines = detail.map((item) => {
    const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : "input";
    const message = item.msg || "is not valid";
    if (FIELDS[field]) setFieldError(field, message);
    return `${field}: ${message}`;
  });
  return lines.join("\n");
}

function renderResult(score) {
  document.getElementById("score-value").textContent = score.toFixed(2);
  const pct = Math.max(0, Math.min(100, (score / 10) * 100));
  document.getElementById("meter-fill").style.width = `${pct}%`;
  document.getElementById("score-note").textContent =
    "Returned by the model as Mental_Health_Score. Higher values indicate better predicted mental health.";
  showState("result");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const { payload, errors } = buildPayload();
  if (errors) {
    Object.entries(errors).forEach(([name, message]) => setFieldError(name, message));
    showError("Check the form", "Some fields need attention. See the messages next to them.");
    document.getElementById(Object.keys(errors)[0]).focus();
    return;
  }

  payloadPreview.textContent = JSON.stringify(payload, null, 2);
  predictBtn.disabled = true;
  showState("loading");

  let response;
  try {
    response = await fetch(PREDICT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    predictBtn.disabled = false;
    showError(
      "Cannot reach the API",
      `No response from ${API_BASE}. Start the FastAPI server with "uvicorn app:app --reload" and try again.`
    );
    return;
  }

  try {
    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (response.status === 422) {
      showError("The server rejected the input", reportValidationErrors(body));
      return;
    }

    if (!response.ok) {
      const serverMsg = body && body.detail ? JSON.stringify(body.detail) : "";
      showError(
        `Server error (${response.status})`,
        serverMsg || "The prediction endpoint returned an error. Check the FastAPI terminal output."
      );
      return;
    }

    const score = body ? body.Mental_Health_Score : undefined;
    if (typeof score !== "number" || !Number.isFinite(score)) {
      showError(
        "Unexpected response",
        "The API replied without a numeric Mental_Health_Score field. The response was:\n" + JSON.stringify(body)
      );
      return;
    }

    renderResult(score);
  } finally {
    predictBtn.disabled = false;
  }
});

resetBtn.addEventListener("click", () => {
  form.reset();
  clearErrors();
  payloadPreview.textContent = "No request sent yet.";
  showState("empty");
});
