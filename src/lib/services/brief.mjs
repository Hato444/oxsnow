export const BRIEF_FIELDS = {
  commercial: [
    { key: "projectType", label: "Project type", placeholder: "Brand film, campaign, documentary…" },
    { key: "concept", label: "Concept & scripting", placeholder: "Tell us what you need" },
    { key: "filming", label: "Filming", placeholder: "Locations, shoot days or approach" },
    { key: "editing", label: "Editing", placeholder: "Editing requirements" },
    { key: "colour", label: "Colour grading", placeholder: "Colour requirements" },
    { key: "sound", label: "Sound", placeholder: "Recording, sound design or mix" },
  ],
  broadcast: [
    { key: "content", label: "Film or content requested" },
    { key: "platform", label: "Distribution platform" },
    { key: "territory", label: "Territory" },
    { key: "usage", label: "Intended usage", multiline: true },
    { key: "duration", label: "Licensing duration" },
  ],
  education: [
    { key: "institution", label: "Institution name" },
    { key: "audience", label: "Audience size", type: "number" },
    { key: "screening", label: "Screening requirements" },
    { key: "content", label: "Educational content", multiline: true },
    { key: "workshop", label: "Workshop enquiries", multiline: true },
  ],
  studio: [
    { key: "equipment", label: "Equipment requirements", multiline: true },
    { key: "crew", label: "Production crew" },
    { key: "post", label: "Post-production" },
    { key: "facilities", label: "Facilities & logistics", multiline: true },
  ],
  general: [],
};

export function validateBrief(body) {
  if (!body || typeof body !== "object" || !Object.hasOwn(BRIEF_FIELDS, body.service)) return { ok: false, error: "Choose a valid service." };
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const budget = typeof body.budget === "string" ? body.budget.trim() : "";
  const timeline = typeof body.timeline === "string" ? body.timeline.trim() : "";
  if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return { ok: false, error: "Enter your name and a valid email address." };
  if (phone.length > 40 || timeline.length > 160 || (budget && !/^\d{1,10}(\.\d{1,2})?$/.test(budget))) return { ok: false, error: "Check your phone, timeline and estimated budget." };
  if (!body.details || typeof body.details !== "object" || Array.isArray(body.details)) return { ok: false, error: "Tell us about your project." };
  const idea = typeof body.details.idea === "string" ? body.details.idea.trim() : "";
  if (!idea || idea.length > 1500) return { ok: false, error: "Please tell us a little about what you need (up to 1,500 characters)." };
  const recommend = body.details.recommend;
  if (recommend !== undefined && !["yes", "no"].includes(recommend)) return { ok: false, error: "Invalid recommendation choice." };
  const details = { idea, recommend: recommend === "yes" ? "yes" : "no" };
  for (const field of BRIEF_FIELDS[body.service]) {
    const value = body.details[field.key];
    if (value !== undefined && typeof value !== "string") return { ok: false, error: "Invalid project detail." };
    const trimmed = (value || "").trim();
    if (trimmed.length > 1500 || (field.type === "number" && trimmed && !/^\d{1,8}$/.test(trimmed))) return { ok: false, error: `Check ${field.label.toLowerCase()}.` };
    if (trimmed) details[field.key] = trimmed;
  }
  return { ok: true, value: { service: body.service, name, email, phone, budget, timeline, details } };
}
