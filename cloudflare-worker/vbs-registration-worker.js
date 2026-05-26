// Cloudflare Worker / Pages Function example for Cedar Grove VBS registration.
// This keeps Microsoft credentials OFF the public website.
// Store these as Worker secrets/env vars: TENANT_ID, CLIENT_ID, CLIENT_SECRET, SITE_ID, LIST_ID, ALLOWED_ORIGIN.

const GRAPH_TOKEN_URL = (tenantId) => `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
const GRAPH_LIST_URL = (siteId, listId) => `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items`;

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "https://cedargrovechristian.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function textResponse(message, status, env) {
  return new Response(message, { status, headers: corsHeaders(env) });
}

async function getAccessToken(env) {
  const body = new URLSearchParams();
  body.set("client_id", env.CLIENT_ID);
  body.set("client_secret", env.CLIENT_SECRET);
  body.set("scope", "https://graph.microsoft.com/.default");
  body.set("grant_type", "client_credentials");

  const response = await fetch(GRAPH_TOKEN_URL(env.TENANT_ID), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`);
  }

  const json = await response.json();
  return json.access_token;
}

function toSharePointFields(data) {
  return {
    Title: data.childName,
    SubmittedAt: data.submittedAt,
    ChildName: data.childName,
    Address: data.address,
    City: data.city,
    State: data.state,
    ZipCode: data.zipCode,
    Gender: data.gender,
    DateOfBirth: data.dateOfBirth,
    AgeGroup: data.ageGroup,
    ShirtSize: data.shirtSize,
    FoodAllergies: data.foodAllergies,
    EnvironmentalAllergies: data.environmentalAllergies,
    MedicalConcerns: data.medicalConcerns,
    GuardianFirstName: data.guardianFirstName,
    GuardianLastName: data.guardianLastName,
    GuardianEmail: data.guardianEmail,
    PrimaryPhone: data.primaryPhone,
    PhotoPermission: data.photoPermission,
    LimitedPhotoRequests: data.limitedPhotoRequests,
    GuardianCertification: data.guardianCertification ? "Yes" : "No",
    EmergencyContact: data.emergencyContact,
    EmergencyPhone: data.emergencyPhone,
    HomeChurch: data.homeChurch,
    MailingPermission: data.mailingPermission,
    HeardAbout: Array.isArray(data.heardAbout) ? data.heardAbout.join(", ") : "",
    HeardAboutOther: data.heardAboutOther
  };
}

function validate(data) {
  const required = [
    "childName", "address", "city", "state", "zipCode", "gender", "dateOfBirth", "ageGroup", "shirtSize",
    "guardianFirstName", "guardianLastName", "guardianEmail", "primaryPhone", "photoPermission",
    "emergencyContact", "emergencyPhone", "homeChurch", "mailingPermission"
  ];

  for (const field of required) {
    if (!data[field]) return `${field} is required.`;
  }

  if (!data.guardianCertification) return "Guardian certification is required.";
  if (!Array.isArray(data.heardAbout) || data.heardAbout.length === 0) return "heardAbout is required.";
  if (data.photoPermission === "Limited permission" && !data.limitedPhotoRequests) return "Limited photo request details are required.";
  return null;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (request.method !== "POST") {
      return textResponse("Method not allowed", 405, env);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return textResponse("Invalid JSON", 400, env);
    }

    const validationError = validate(data);
    if (validationError) {
      return textResponse(validationError, 400, env);
    }

    try {
      const token = await getAccessToken(env);
      const response = await fetch(GRAPH_LIST_URL(env.SITE_ID, env.LIST_ID), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields: toSharePointFields(data) })
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Graph request failed: ${response.status} ${details}`);
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders(env), "Content-Type": "application/json" }
      });
    } catch (error) {
      return textResponse("Registration could not be saved.", 500, env);
    }
  }
};
