const express = require("express");
const cors = require("cors");
require("dotenv").config();

let GoogleGenAI = null;

try {
  const genaiPkg = require("@google/genai");
  GoogleGenAI = genaiPkg.GoogleGenAI;
} catch (error) {
  console.warn("⚠️ @google/genai package could not be loaded.");
}

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin: "*",
  })
);

// Allow large base64 images
app.use(
  express.json({
    limit: "25mb",
  })
);

// ============================================================
// GEMINI CONFIGURATION
// ============================================================

let aiClient = null;

if (process.env.GEMINI_API_KEY && GoogleGenAI) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    console.log("✅ Gemini AI client initialized");
  } catch (error) {
    console.error(
      "❌ Gemini initialization failed:",
      error?.message || error
    );
  }
} else {
  console.warn(
    "⚠️ GEMINI_API_KEY missing. AI image validation will not work."
  );
}

const GEMINI_MODELS = [
  "gemini-3.8-flash"
];

// ============================================================
// BASIC HELPERS
// ============================================================

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeCategory(category = "") {
  const value = String(category).trim().toLowerCase();

  if (
    value.includes("pothole") ||
    value.includes("road damage") ||
    value.includes("road")
  ) {
    return "Pothole";
  }

  if (
    value.includes("garbage") ||
    value.includes("waste") ||
    value.includes("dump")
  ) {
    return "Garbage";
  }

  if (
    value.includes("streetlight") ||
    value.includes("street light") ||
    value.includes("street lamp") ||
    value.includes("light")
  ) {
    return "Broken streetlight";
  }

  if (
    value.includes("drain") ||
    value.includes("drainage") ||
    value.includes("sewage")
  ) {
    return "Drainage";
  }

  if (
    value.includes("water") ||
    value.includes("leak") ||
    value.includes("pipe")
  ) {
    return "Water supply";
  }

  if (value.includes("traffic")) {
    return "Traffic";
  }

  return category || "Other";
}

function categoryMatches(selectedCategory, detectedCategory) {
  const selected = normalizeCategory(selectedCategory);
  const detected = normalizeCategory(detectedCategory);

  if (selected === "Other") {
    return true;
  }

  if (selected === detected) {
    return true;
  }

  if (
    selected === "Pothole" &&
    detected === "Pothole"
  ) {
    return true;
  }

  if (
    selected === "Garbage" &&
    detected === "Garbage"
  ) {
    return true;
  }

  if (
    selected === "Drainage" &&
    detected === "Drainage"
  ) {
    return true;
  }

  if (
    selected === "Water supply" &&
    detected === "Water supply"
  ) {
    return true;
  }

  return false;
}

// ============================================================
// PRIORITY
// ============================================================

function determinePriority(
  category = "",
  description = "",
  isEmergency = false
) {
  const text = `${category} ${description}`.toLowerCase();

  if (isEmergency) {
    return {
      priority: "Critical",
      severity: "Critical Hazardous",
      urgency: "Emergency SLA: 4 hours",
      reason:
        "Citizen marked this complaint as an emergency requiring immediate attention.",
    };
  }

  if (
    text.includes("accident") ||
    text.includes("injury") ||
    text.includes("hospital") ||
    text.includes("live wire") ||
    text.includes("electric shock") ||
    text.includes("open manhole") ||
    text.includes("sinkhole") ||
    text.includes("flooded house")
  ) {
    return {
      priority: "Critical",
      severity: "Critical Hazardous",
      urgency: "Emergency SLA: 4 hours",
      reason:
        "The complaint description indicates a potentially serious public-safety hazard.",
    };
  }

  if (
    text.includes("huge") ||
    text.includes("massive") ||
    text.includes("deep") ||
    text.includes("main road") ||
    text.includes("school") ||
    text.includes("college") ||
    text.includes("hospital") ||
    text.includes("heavy traffic") ||
    text.includes("overflowing")
  ) {
    return {
      priority: "High",
      severity: "Severe",
      urgency: "Standard SLA: 24 hours",
      reason:
        "The reported issue may have significant public impact or safety implications.",
    };
  }

  if (
    text.includes("minor") ||
    text.includes("small") ||
    text.includes("cosmetic") ||
    text.includes("faded")
  ) {
    return {
      priority: "Low",
      severity: "Minor",
      urgency: "Maintenance SLA: 5-7 days",
      reason:
        "The reported issue appears suitable for routine municipal maintenance.",
    };
  }

  return {
    priority: "Medium",
    severity: "Moderate",
    urgency: "Standard SLA: 48-72 hours",
    reason:
      "The complaint represents a standard municipal issue requiring scheduled attention.",
  };
}

// ============================================================
// DEPARTMENT
// ============================================================

function getDepartment(category) {
  switch (normalizeCategory(category)) {
    case "Pothole":
      return "Roads & Infrastructure Department";

    case "Garbage":
      return "Sanitation & Solid Waste Management";

    case "Broken streetlight":
      return "Electrical & Street Lighting Department";

    case "Drainage":
      return "Drainage & Sewage Management Department";

    case "Water supply":
      return "Water Supply Department";

    case "Traffic":
      return "Traffic Management Department";

    default:
      return "Citizen Grievance Verification Cell";
  }
}

// ============================================================
// IMAGE PARSER
// ============================================================

function parseImage(image) {
  if (!image || typeof image !== "string") {
    return null;
  }

  let value = image.trim();

  // Handle JSON/string escaping if it somehow reaches the backend
  value = value.replace(/\\"/g, '"');

  // Expected:
  // data:image/jpeg;base64,/9j/4AAQ...
  // data:image/png;base64,iVBOR...
  // data:image/webp;base64,UklGR...

  const match = value.match(
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s
  );

  if (!match) {
    console.error("❌ Invalid image data URI");
    console.error("Image prefix:", value.slice(0, 100));

    return null;
  }

  const mimeType = match[1].toLowerCase();

  let base64 = match[2].trim();

  // Remove accidental whitespace/newlines
  base64 = base64.replace(/\s+/g, "");

  // Remove accidental surrounding quotes
  base64 = base64.replace(/^["']|["']$/g, "");

  // Convert URL-safe Base64 to normal Base64
  base64 = base64
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  // Remove any characters that cannot exist in standard Base64
  base64 = base64.replace(/[^A-Za-z0-9+/=]/g, "");

  // Validate Base64 length
  if (base64.length === 0) {
    console.error("❌ Empty Base64 image data");
    return null;
  }

  // Add missing padding if necessary
  const remainder = base64.length % 4;

  if (remainder === 2) {
    base64 += "==";
  } else if (remainder === 3) {
    base64 += "=";
  } else if (remainder === 1) {
    console.error("❌ Invalid Base64 length:", base64.length);
    return null;
  }

  // IMPORTANT:
  // Decode and re-encode using Node's Buffer.
  // This gives Gemini a canonical Base64 string.
  try {
    const buffer = Buffer.from(base64, "base64");

    if (!buffer || buffer.length === 0) {
      console.error("❌ Base64 decoded to empty buffer");
      return null;
    }

    // Verify JPEG/PNG/WEBP signatures when possible
    const hex = buffer
      .subarray(0, 12)
      .toString("hex")
      .toLowerCase();

    const isJpeg = hex.startsWith("ffd8ff");
    const isPng = hex.startsWith("89504e47");
    const isWebp = hex.startsWith("52494646") && hex.includes("57454250");

    console.log("🖼️ Image validation:");
    console.log("   MIME:", mimeType);
    console.log("   Bytes:", buffer.length);
    console.log("   JPEG:", isJpeg);
    console.log("   PNG:", isPng);
    console.log("   WEBP:", isWebp);

    if (!isJpeg && !isPng && !isWebp) {
      console.warn(
        "⚠️ Image signature was not recognized. Continuing anyway."
      );
    }

    // Re-encode to guaranteed valid Base64
    const normalizedBase64 = buffer.toString("base64");

    return {
      mimeType,
      data: normalizedBase64,
    };
  } catch (error) {
    console.error(
      "❌ Base64 decoding failed:",
      error?.message || error
    );

    return null;
  }
}

// ============================================================
// GEMINI VISION VALIDATION
// ============================================================

async function analyzeImageWithGemini({
  image,
  description,
  category,
  location,
}) {
  if (!aiClient) {
    throw new Error(
      "Gemini AI is not configured. Please set GEMINI_API_KEY in .env."
    );
  }

  const imageData = parseImage(image);
  if (imageData) {
  console.log("✅ Image successfully parsed");
  console.log("   MIME:", imageData.mimeType);
  console.log("   Base64 length:", imageData.data.length);
}

  if (!imageData) {
    throw new Error(
      "Invalid image format. Please upload a valid JPEG, PNG, WEBP or GIF image."
    );
  }
  

  const prompt = `
You are CivicPulse Vision Validator.

Your job is to inspect the uploaded citizen photograph and determine whether it actually contains a valid civic/public infrastructure issue.

IMPORTANT RULES:

1. ACTUALLY INSPECT THE IMAGE.
2. Do NOT trust the selected category.
3. Do NOT trust the complaint description as proof.
4. Do NOT assume an image is a pothole just because the user selected "Pothole".
5. Do NOT invent objects that are not visible.
6. Do NOT invent bounding boxes.
7. Do NOT invent confidence values.
8. Reject unrelated images.
9. Reject screenshots, logos, posters, random objects, people, animals, food, rooms, computer screens and unrelated photographs.
10. A valid complaint requires visible evidence of a civic issue.

SELECTED CATEGORY:

${selectedCategory}

COMPLAINT DESCRIPTION:

${description || "Not provided"}

LOCATION:

${location || "Not provided"}

SUPPORTED CIVIC CATEGORIES:

- Pothole
- Garbage
- Broken streetlight
- Drainage
- Water supply
- Traffic
- Other

CATEGORY VALIDATION:

Pothole:
The image must visibly show road-surface damage such as a pothole, crater, depression, broken pavement or similar road defect.

Garbage:
The image must visibly show garbage, litter, waste, dumping, overflowing bins or accumulated refuse.

Broken streetlight:
The image must visibly show a streetlight, lighting pole or damaged public lighting infrastructure.

Drainage:
The image must visibly show a drain, blocked drain, sewage issue, drainage infrastructure problem or drainage-related waterlogging.

Water supply:
The image must visibly show a water leak, broken pipe, burst pipe, water infrastructure or another clear public water-supply issue.

Traffic:
The image must visibly show a traffic-related civic problem.

Other:
Use only when the image clearly shows a civic issue that does not fit the above categories.

IMPORTANT:

If the selected category is Pothole and the image does NOT visibly show a pothole, reject the complaint.

If the image is unrelated, reject the complaint.

If the defect cannot clearly be seen, reject the complaint.

Return ONLY valid JSON.

For a VALID complaint:

{
  "isValidCivicIssue": true,
  "isRejected": false,
  "detectedCategory": "Pothole",
  "selectedCategory": "${selectedCategory}",
  "categoryMatches": true,
  "confidence": 0.91,
  "detectedObjects": [
    "Pothole"
  ],
  "reason": "A clearly visible pothole is present on the road surface.",
  "rejectionReason": "",
  "severity": "Moderate",
  "boundingBoxes": [
    {
      "label": "Pothole",
      "confidence": 0.91,
      "ymin": 0.25,
      "xmin": 0.20,
      "ymax": 0.75,
      "xmax": 0.80,
      "isDefect": true
    }
  ]
}

For an INVALID complaint:

{
  "isValidCivicIssue": false,
  "isRejected": true,
  "detectedCategory": "Other",
  "selectedCategory": "${selectedCategory}",
  "categoryMatches": false,
  "confidence": 0.95,
  "detectedObjects": [
    "Unrelated image"
  ],
  "reason": "The uploaded image does not visibly show a valid civic issue.",
  "rejectionReason": "The uploaded image does not contain a valid ${selectedCategory} civic issue.",
  "severity": "None",
  "boundingBoxes": []
}
`;

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      console.log(
        `🤖 Gemini Vision using model: ${model}`
      );
      console.log(
  `📤 Sending ${imageData.mimeType} image to Gemini`
);

console.log(
  `📦 Base64 length: ${imageData.data.length}`
);

  const selectedCategory =
    normalizeCategory(category);

      const response =
        await aiClient.models.generateContent({
          model,

          contents: [
            {
              role: "user",

              parts: [
                {
                  text: prompt,
                },

                {
                  inlineData: {
                    mimeType:
                      imageData.mimeType,

                    data:
                      imageData.data,
                  },
                },
              ],
            },
          ],

          config: {
            responseMimeType:
              "application/json",
          },
        });

      const text =
        response?.text;

      console.log(
        "🤖 Gemini raw response:"
      );

      console.log(text);

      if (
        !text ||
        typeof text !== "string"
      ) {
        throw new Error(
          "Gemini returned an empty response."
        );
      }

      let cleanText =
        text.trim();

      if (
        cleanText.startsWith("```")
      ) {
        cleanText =
          cleanText
            .replace(
              /^```json\s*/i,
              ""
            )
            .replace(
              /^```\s*/i,
              ""
            )
            .replace(
              /\s*```$/i,
              ""
            )
            .trim();
      }

      const result =
        JSON.parse(cleanText);

      /*
       * Normalize result.
       */

      result.isValidCivicIssue =
        result.isValidCivicIssue === true;

      result.isRejected =
        !result.isValidCivicIssue;

      result.detectedCategory =
        normalizeCategory(
          result.detectedCategory ||
            "Other"
        );

      result.selectedCategory =
        selectedCategory;

      result.categoryMatches =
        categoryMatches(
          selectedCategory,
          result.detectedCategory
        );

      result.confidence =
        Math.max(
          0,
          Math.min(
            1,
            Number(
              result.confidence
            ) || 0
          )
        );

      result.detectedObjects =
        Array.isArray(
          result.detectedObjects
        )
          ? result.detectedObjects
          : [];

      result.boundingBoxes =
        Array.isArray(
          result.boundingBoxes
        )
          ? result.boundingBoxes
              .filter(
                (box) =>
                  box &&
                  typeof box ===
                    "object"
              )
              .map((box) => ({
                label: String(
                  box.label ||
                    result.detectedCategory
                ),

                confidence:
                  Math.max(
                    0,
                    Math.min(
                      1,
                      Number(
                        box.confidence
                      ) ||
                        result.confidence
                    )
                  ),

                ymin: Math.max(
                  0,
                  Math.min(
                    1,
                    Number(
                      box.ymin
                    ) || 0
                  )
                ),

                xmin: Math.max(
                  0,
                  Math.min(
                    1,
                    Number(
                      box.xmin
                    ) || 0
                  )
                ),

                ymax: Math.max(
                  0,
                  Math.min(
                    1,
                    Number(
                      box.ymax
                    ) || 1
                  )
                ),

                xmax: Math.max(
                  0,
                  Math.min(
                    1,
                    Number(
                      box.xmax
                    ) || 1
                  )
                ),

                isDefect:
                  box.isDefect !==
                  false,
              }))
          : [];

      /*
       * Very important:
       * Never allow boxes for rejected images.
       */

      if (
        result.isRejected
      ) {
        result.boundingBoxes =
          [];
      }

      /*
       * If category does not match,
       * reject the complaint.
       */

      if (
        result.isValidCivicIssue &&
        !result.categoryMatches
      ) {
        result.isValidCivicIssue =
          false;

        result.isRejected =
          true;

        result.boundingBoxes =
          [];

        result.rejectionReason =
          `The image appears to show ${result.detectedCategory}, not ${selectedCategory}.`;
      }

      console.log(
        "✅ Gemini Vision parsed result:"
      );

      console.log(
        JSON.stringify(
          result,
          null,
          2
        )
      );

      return result;

    } catch (error) {
      lastError = error;

      console.error(
        `❌ Gemini Vision failed with ${model}:`
      );

      console.error(
        error?.message ||
          error
      );

      /*
       * Try the next model.
       */

      await sleep(1000);
    }
  }

  throw (
    lastError ||
    new Error(
      "Gemini Vision analysis failed."
    )
  );
}

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    service:
      "CivicPulse AI Vision Backend Service",
    status: "Operational",
    version: "5.0.0",
    geminiConfigured:
      !!aiClient,
    visionValidation:
      "Gemini Vision",
  });
});

// ============================================================
// AI COMPLAINT ANALYSIS
// ============================================================

app.post(
  "/api/ai/analyze",
  async (req, res) => {
    try {
      console.log(
        "\n========================================"
      );

      console.log(
        "📥 AI ANALYSIS REQUEST"
      );

      console.log(
        "========================================"
      );

      const {
        description,
        category,
        location,
        image,
        isEmergency = false,
      } = req.body;

      /*
       * Validate description.
       */

      if (
        !description ||
        !String(description).trim()
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Complaint description is required.",
        });
      }

      /*
       * Validate image.
       */

      if (!image) {
        return res.status(400).json({
          success: false,
          error:
            "Complaint image is required.",
        });
      }

      const selectedCategory =
        normalizeCategory(
          category
        );

      console.log(
        "📂 Selected category:",
        selectedCategory
      );

      console.log(
        "📍 Location:",
        location ||
          "Not provided"
      );

      console.log(
        "📝 Description:",
        description
      );

      /*
       * Run Gemini Vision.
       */

      const visionResult =
        await analyzeImageWithGemini({
          image,
          description,
          category:
            selectedCategory,
          location,
        });

      /*
       * REJECT INVALID IMAGE
       */

      if (
        !visionResult.isValidCivicIssue ||
        visionResult.isRejected ||
        !visionResult.categoryMatches
      ) {
        console.log(
          "❌ COMPLAINT REJECTED"
        );

        return res.status(422).json({
          success: false,

          accepted: false,

          rejected: true,

          error:
            visionResult.rejectionReason ||
            "The uploaded image does not match the selected civic complaint category.",

          message:
            visionResult.rejectionReason ||
            "Please upload a clear image showing the reported civic issue.",

          analysis: {
            ...visionResult,

            priority:
              "Rejected",

            department:
              "Citizen Grievance Verification Cell",
          },
        });
      }

      /*
       * Calculate priority.
       */

      const priorityData =
        determinePriority(
          selectedCategory,
          description,
          isEmergency
        );

      /*
       * Department.
       */

      const department =
        getDepartment(
          visionResult.detectedCategory
        );

      /*
       * Final accepted analysis.
       */

      const finalAnalysis = {
        ...visionResult,

        category:
          visionResult.detectedCategory,

        priority:
          priorityData.priority,

        severity:
          priorityData.severity,

        urgency:
          priorityData.urgency,

        reason:
          priorityData.reason,

        department,

        summary:
          description.length >
          180
            ? `${description.substring(
                0,
                177
              )}...`
            : description,

        location:
          location ||
          "Not provided",

        aiValidated: true,

        validationSource:
          "Gemini Vision",

        validatedAt:
          new Date().toISOString(),
      };

      console.log(
        "✅ COMPLAINT ACCEPTED"
      );

      return res.json({
        success: true,

        accepted: true,

        rejected: false,

        analysis:
          finalAnalysis,
      });

    } catch (error) {
  console.error(
    "❌ AI analysis failed:",
    error?.message || error
  );

  const message = error?.message || String(error);

  // Quota / rate limit
  if (
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.toLowerCase().includes("quota")
  ) {
    return res.status(429).json({
      success: false,
      error:
        "Gemini API quota or rate limit reached. Please try again later.",
      retryable: true,
      errorType: "QUOTA_EXCEEDED",
    });
  }

  // Invalid API key
  if (
    message.includes("API_KEY") ||
    message.toLowerCase().includes("api key") ||
    message.includes("UNAUTHENTICATED")
  ) {
    return res.status(401).json({
      success: false,
      error:
        "Gemini API key is invalid or missing. Check GEMINI_API_KEY in .env.",
      retryable: false,
      errorType: "INVALID_API_KEY",
    });
  }

  // Invalid request / Base64 / malformed image
  if (
    message.includes("INVALID_ARGUMENT") ||
    message.includes("Base64 decoding failed") ||
    message.includes("inline_data.data") ||
    message.includes("Invalid value")
  ) {
    return res.status(400).json({
      success: false,
      error:
        "Gemini rejected the image data. The uploaded Base64 image is invalid or malformed.",
      details: message,
      retryable: false,
      errorType: "INVALID_IMAGE_DATA",
    });
  }

  // Model not available
  if (
    message.includes("NOT_FOUND") ||
    message.includes("not found") ||
    message.includes("not available")
  ) {
    return res.status(404).json({
      success: false,
      error:
        "The configured Gemini model is unavailable for this API project.",
      details: message,
      retryable: false,
      errorType: "MODEL_NOT_AVAILABLE",
    });
  }

  // Gemini temporarily unavailable
  if (
    message.includes("503") ||
    message.includes("UNAVAILABLE")
  ) {
    return res.status(503).json({
      success: false,
      error:
        "Gemini is temporarily unavailable. Please try again.",
      retryable: true,
      errorType: "GEMINI_UNAVAILABLE",
    });
  }

  return res.status(500).json({
    success: false,
    error:
      message || "AI image validation failed.",
    retryable: true,
    errorType: "UNKNOWN_GEMINI_ERROR",
  });
}
  }
);

// ============================================================
// /analyze COMPATIBILITY ROUTE
// ============================================================

app.post(
  "/analyze",
  async (req, res) => {
    /*
     * Some older frontend versions may call /analyze.
     *
     * Forward the same request internally by duplicating
     * the request URL.
     */

    req.url =
      "/api/ai/analyze";

    app.handle(
      req,
      res
    );
  }
);

// ============================================================
// DUPLICATE COMPLAINT CHECK
// ============================================================

app.post(
  "/api/ai/duplicate-check",
  async (req, res) => {
    try {
      const {
        description,
        category,
        location,
        existingComplaints = [],
      } = req.body;

      if (
        !description ||
        !String(description).trim()
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Complaint description is required.",
        });
      }

      /*
       * First perform local similarity checks.
       */

      const newText =
        `${description} ${location || ""}`
          .toLowerCase()
          .replace(
            /[^a-z0-9\s]/g,
            " "
          )
          .replace(
            /\s+/g,
            " "
          )
          .trim();

      const newWords =
        new Set(
          newText
            .split(" ")
            .filter(
              (word) =>
                word.length > 2
            )
        );

      const candidates =
        Array.isArray(
          existingComplaints
        )
          ? existingComplaints
          : [];

      let bestMatch =
        null;

      let bestScore = 0;

      for (
        const complaint of candidates
      ) {
        const oldText =
          `${complaint.description || ""} ${
            complaint.location || ""
          }`
            .toLowerCase()
            .replace(
              /[^a-z0-9\s]/g,
              " "
            )
            .replace(
              /\s+/g,
              " "
            )
            .trim();

        const oldWords =
          new Set(
            oldText
              .split(" ")
              .filter(
                (word) =>
                  word.length > 2
              )
          );

        if (
          !newWords.size ||
          !oldWords.size
        ) {
          continue;
        }

        let common = 0;

        for (
          const word of newWords
        ) {
          if (
            oldWords.has(word)
          ) {
            common++;
          }
        }

        const union =
          new Set([
            ...newWords,
            ...oldWords,
          ]).size;

        const score =
          union > 0
            ? common / union
            : 0;

        if (
          score > bestScore
        ) {
          bestScore =
            score;

          bestMatch =
            complaint;
        }
      }

      const isDuplicate =
        bestScore >= 0.55;

      return res.json({
        success: true,

        isDuplicate,

        duplicate:
          isDuplicate,

        confidence:
          Number(
            bestScore.toFixed(
              3
            )
          ),

        match:
          isDuplicate
            ? bestMatch
            : null,

        message:
          isDuplicate
            ? "A similar complaint already exists."
            : "No strong duplicate complaint was found.",
      });

    } catch (error) {
      console.error(
        "❌ Duplicate check failed:",
        error?.message ||
          error
      );

      return res.status(500).json({
        success: false,

        error:
          error?.message ||
          "Duplicate complaint check failed.",
      });
    }
  }
);

// ============================================================
// YOLO / VISION DETECTION COMPATIBILITY ENDPOINT
// ============================================================

app.post(
  "/api/ai/yolo-detect",
  async (req, res) => {
    try {
      const {
        image,
        category,
        description,
        location,
      } = req.body;

      if (!image) {
        return res.status(400).json({
          success: false,
          error:
            "Image is required.",
        });
      }

      const result =
        await analyzeImageWithGemini({
          image,
          description,
          category,
          location,
        });

      return res.json({
        success: true,

        detected:
          result.isValidCivicIssue,

        isValidCivicIssue:
          result.isValidCivicIssue,

        category:
          result.detectedCategory,

        confidence:
          result.confidence,

        objects:
          result.detectedObjects,

        boundingBoxes:
          result.boundingBoxes,

        analysis:
          result,
      });

    } catch (error) {
      console.error(
        "❌ Vision detection failed:",
        error?.message ||
          error
      );

      return res.status(500).json({
        success: false,

        error:
          error?.message ||
          "Vision detection failed.",
      });
    }
  }
);

// ============================================================
// WORK VERIFICATION
// ============================================================

app.post(
  "/api/ai/verify-work",
  async (req, res) => {
    try {
      const {
        beforeImage,
        afterImage,
        category,
        description,
      } = req.body;

      if (
        !beforeImage ||
        !afterImage
      ) {
        return res.status(400).json({
          success: false,

          error:
            "Before and after images are required.",
        });
      }

      /*
       * Validate the after image.
       */

      const afterResult =
        await analyzeImageWithGemini({
          image: afterImage,
          description:
            description ||
            "Verify completion of municipal work.",
          category:
            category || "Other",
          location:
            "Not provided",
        });

      /*
       * For demonstration purposes,
       * compare whether the after image still
       * visibly contains the reported defect.
       */

      const workCompleted =
        !afterResult.isValidCivicIssue;

      return res.json({
        success: true,

        verified:
          workCompleted,

        workCompleted,

        confidence:
          workCompleted
            ? 0.85
            : 0.35,

        message:
          workCompleted
            ? "AI verification indicates that the reported issue may have been resolved."
            : "The reported issue may still be visible in the after image.",

        afterAnalysis:
          afterResult,
      });

    } catch (error) {
      console.error(
        "❌ Work verification failed:",
        error?.message ||
          error
      );

      return res.status(500).json({
        success: false,

        error:
          error?.message ||
          "Work verification failed.",
      });
    }
  }
);

// ============================================================
// ADMIN / REVENUE DEMO DATA
// ============================================================

let adminTransactions = [
  {
    id: "TXN-CP-100001",
    type:
      "Govt SaaS Management",
    stream: "primary",
    description:
      "Annual CivicPulse AI municipal platform management retainer",
    amount: 2500000,
    grossAmount: 2500000,
    adminCutPercent: 100,
    payer:
      "Municipal Corporation",
    payee:
      "CivicPulse AI Technologies",
    paymentMethod:
      "Government Treasury",
    transactionRef:
      "PFMS/IN/2026/100001",
    invoiceId:
      "INV-CP-2026-1001",
    date:
      new Date().toISOString(),
    status: "Settled",
  },
];

let adminContracts = [
  {
    id: "CON-CP-1001",
    municipalityName:
      "Municipal Corporation",
    contractTier:
      "Municipal Corporation",
    annualValue: 2500000,
    awardedAuthority:
      "Public Works Division",
    adminCommissionPercent: 2.5,
    startDate:
      new Date()
        .toISOString()
        .split("T")[0],
    renewalDate:
      new Date(
        new Date().getFullYear() + 1,
        new Date().getMonth(),
        new Date().getDate()
      )
        .toISOString()
        .split("T")[0],
    status: "Active",
    serviceScope: [
      "Infrastructure Upkeep",
      "AI Quality Auditing",
    ],
  },
];

const INITIAL_TRANSACTIONS =
  JSON.parse(
    JSON.stringify(
      adminTransactions
    )
  );

const INITIAL_ADMIN_CONTRACTS =
  JSON.parse(
    JSON.stringify(
      adminContracts
    )
  );

// ============================================================
// ADMIN REVENUE SUMMARY
// ============================================================

function computeAdminRevenueSummary() {
  const primarySaaS =
    adminTransactions
      .filter(
        (t) =>
          t.stream ===
            "primary" ||
          t.type ===
            "Govt SaaS Management"
      )
      .reduce(
        (sum, t) =>
          sum +
          (t.amount || 0),
        0
      );

  const secondaryFees =
    adminTransactions
      .filter(
        (t) =>
          t.stream ===
            "secondary" ||
          t.type ===
            "Worker Transaction Fee"
      )
      .reduce(
        (sum, t) =>
          sum +
          (t.amount || 0),
        0
      );

  const contractCommission =
    adminTransactions
      .filter(
        (t) =>
          t.stream ===
            "contract_cut" ||
          t.type ===
            "Contract Authority Commission"
      )
      .reduce(
        (sum, t) =>
          sum +
          (t.amount || 0),
        0
      );

  const totalRevenue =
    primarySaaS +
    secondaryFees +
    contractCommission;

  const totalGrossVolume =
    adminTransactions.reduce(
      (sum, t) =>
        sum +
        (t.grossAmount ||
          t.amount ||
          0),
      0
    );

  return {
    totalRevenue,

    primarySaaS,

    secondaryFees,

    contractCommission,

    totalGrossVolume,

    transactionCount:
      adminTransactions.length,

    activeContractCount:
      adminContracts.length,

    projectedARR: 20500000,

    streamsBreakdown: [
      {
        stream: "primary",

        name:
          "Government App Management Retainer",

        description:
          "Direct municipal subscription fee for CivicPulse AI platform management.",

        revenue:
          primarySaaS,

        percentage:
          totalRevenue > 0
            ? Number(
                (
                  (primarySaaS /
                    totalRevenue) *
                  100
                ).toFixed(1)
              )
            : 0,

        model:
          "Fixed SLA Retainer",
      },

      {
        stream: "secondary",

        name:
          "Worker Payout Facilitation Fee",

        description:
          "Platform transaction fee for verified worker payouts.",

        revenue:
          secondaryFees,

        percentage:
          totalRevenue > 0
            ? Number(
                (
                  (secondaryFees /
                    totalRevenue) *
                  100
                ).toFixed(1)
              )
            : 0,

        model:
          "Transaction Facilitation",
      },

      {
        stream:
          "contract_cut",

        name:
          "Contract Authority Commission",

        description:
          "Administrative commission associated with public works contracts.",

        revenue:
          contractCommission,

        percentage:
          totalRevenue > 0
            ? Number(
                (
                  (contractCommission /
                    totalRevenue) *
                  100
                ).toFixed(1)
              )
            : 0,

        model:
          "Contract Administration",
      },
    ],
  };
}

// ============================================================
// ADMIN REVENUE
// ============================================================

app.get(
  "/api/admin/revenue",
  (req, res) => {
    res.json({
      success: true,

      summary:
        computeAdminRevenueSummary(),

      contracts:
        adminContracts,

      recentTransactions:
        adminTransactions.slice(
          0,
          15
        ),

      serverTimestamp:
        new Date().toISOString(),
    });
  }
);

// ============================================================
// ADMIN TRANSACTIONS
// ============================================================

app.get(
  "/api/admin/transactions",
  (req, res) => {
    res.json({
      success: true,

      transactions:
        adminTransactions,

      count:
        adminTransactions.length,
    });
  }
);

// ============================================================
// ADMIN CONTRACTS
// ============================================================

app.get(
  "/api/admin/contracts",
  (req, res) => {
    res.json({
      success: true,

      contracts:
        adminContracts,

      count:
        adminContracts.length,
    });
  }
);

// ============================================================
// SIMULATE PAYMENT
// ============================================================

app.post(
  "/api/admin/simulate-payment",
  (req, res) => {
    const {
      streamType = "primary",

      grossAmount = 50000,

      payer =
        "Municipal Corporation",

      payee =
        "CivicPulse AI Technologies",

      description = "",

      paymentMethod =
        "Government Treasury",

      customPercent,

      authorityName =
        "Public Works Authority",
    } = req.body;

    const numGross =
      Math.max(
        100,
        Number(
          grossAmount
        ) || 50000
      );

    let civicPulseEarnings =
      0;

    let adminCutPercent =
      0;

    let type =
      "Govt SaaS Management";

    let stream =
      streamType;

    if (
      streamType ===
      "primary"
    ) {
      adminCutPercent =
        100;

      civicPulseEarnings =
        numGross;
    } else if (
      streamType ===
      "secondary"
    ) {
      type =
        "Worker Transaction Fee";

      adminCutPercent =
        Number(
          customPercent
        ) || 5;

      civicPulseEarnings =
        Math.round(
          numGross *
            (adminCutPercent /
              100)
        );
    } else if (
      streamType ===
      "contract_cut"
    ) {
      type =
        "Contract Authority Commission";

      adminCutPercent =
        Number(
          customPercent
        ) || 2.5;

      civicPulseEarnings =
        Math.round(
          numGross *
            (adminCutPercent /
              100)
        );
    }

    const transactionRef =
      `PFMS/IN/${new Date().getFullYear()}/${Math.floor(
        100000 +
          Math.random() *
            900000
      )}`;

    const invoiceId =
      `INV-CP-${new Date().getFullYear()}-${Math.floor(
        1000 +
          Math.random() *
            9000
      )}`;

    const id =
      `TXN-CP-${Date.now()
        .toString()
        .slice(-6)}`;

    const newTxn = {
      id,

      type,

      stream,

      description:
        description ||
        "CivicPulse payment transaction",

      amount:
        civicPulseEarnings,

      grossAmount:
        numGross,

      adminCutPercent,

      payer,

      payee,

      paymentMethod,

      authorityName,

      transactionRef,

      invoiceId,

      date:
        new Date().toISOString(),

      status:
        "Settled",
    };

    adminTransactions.unshift(
      newTxn
    );

    res.json({
      success: true,

      message:
        "Payment transaction simulated successfully.",

      transaction:
        newTxn,

      summary:
        computeAdminRevenueSummary(),
    });
  }
);

// ============================================================
// AWARD CONTRACT
// ============================================================

app.post(
  "/api/admin/award-contract",
  (req, res) => {
    const {
      municipalityName =
        "Municipal Corporation",

      contractTier =
        "Municipal Corporation",

      annualValue = 2500000,

      awardedAuthority =
        "Public Works Division",

      adminCommissionPercent = 2.5,

      serviceScope = [
        "Infrastructure Upkeep",
        "AI Quality Auditing",
      ],
    } = req.body;

    const numValue =
      Math.max(
        10000,
        Number(
          annualValue
        ) || 2500000
      );

    const numPercent =
      Number(
        adminCommissionPercent
      ) || 2.5;

    const adminCutAmount =
      Math.round(
        numValue *
          (numPercent /
            100)
      );

    const contractId =
      `CON-CP-${Math.floor(
        1000 +
          Math.random() *
            9000
      )}`;

    const now =
      new Date();

    const nextYear =
      new Date(
        now.getFullYear() + 1,
        now.getMonth(),
        now.getDate()
      );

    const newContract = {
      id: contractId,

      municipalityName,

      contractTier,

      annualValue:
        numValue,

      awardedAuthority,

      adminCommissionPercent:
        numPercent,

      startDate:
        now
          .toISOString()
          .split("T")[0],

      renewalDate:
        nextYear
          .toISOString()
          .split("T")[0],

      status:
        "Active",

      serviceScope:
        Array.isArray(
          serviceScope
        )
          ? serviceScope
          : [serviceScope],
    };

    adminContracts.unshift(
      newContract
    );

    const commissionTxn = {
      id:
        `TXN-CP-${Date.now()
          .toString()
          .slice(-6)}`,

      type:
        "Contract Authority Commission",

      stream:
        "contract_cut",

      description:
        `Contract administration commission for ${awardedAuthority}`,

      amount:
        adminCutAmount,

      grossAmount:
        numValue,

      adminCutPercent:
        numPercent,

      payer:
        municipalityName,

      payee:
        `${awardedAuthority} (Awarded Entity)`,

      paymentMethod:
        "Government Treasury / Escrow",

      transactionRef:
        `PFMS/TENDER/${new Date().getFullYear()}/${Math.floor(
          100000 +
            Math.random() *
              900000
        )}`,

      invoiceId:
        `INV-CP-${new Date().getFullYear()}-${Math.floor(
          1000 +
            Math.random() *
              9000
        )}`,

      date:
        new Date().toISOString(),

      relatedContractId:
        contractId,

      status:
        "Settled",
    };

    adminTransactions.unshift(
      commissionTxn
    );

    res.json({
      success: true,

      message:
        `Contract ${contractId} created successfully.`,

      contract:
        newContract,

      commissionTransaction:
        commissionTxn,

      summary:
        computeAdminRevenueSummary(),
    });
  }
);

// ============================================================
// RESET REVENUE
// ============================================================

app.post(
  "/api/admin/reset-revenue",
  (req, res) => {
    adminContracts = [
      ...INITIAL_ADMIN_CONTRACTS,
    ];

    adminTransactions = [
      ...INITIAL_TRANSACTIONS,
    ];

    res.json({
      success: true,

      message:
        "Admin revenue and contract ledger reset.",

      summary:
        computeAdminRevenueSummary(),
    });
  }
);

// ============================================================
// ERROR HANDLER
// ============================================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "❌ Unhandled server error:"
    );

    console.error(
      err?.message ||
        err
    );

    res.status(500).json({
      success: false,

      error:
        err?.message ||
        "Internal server error.",
    });
  }
);
// ============================================================
// GEMINI API TEST ROUTE
// ============================================================

app.get("/test-gemini", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "GEMINI_API_KEY is not configured on Render",
      });
    }

    if (!aiClient) {
      return res.status(500).json({
        success: false,
        error: "Gemini client is not initialized",
      });
    }

    console.log("🧪 Testing Gemini API...");

    const response = await aiClient.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "Reply with exactly: Gemini API is working",
      config: {
        temperature: 0,
      },
    });

    const text =
      typeof response.text === "function"
        ? response.text()
        : response.text;

    console.log("✅ Gemini test successful:", text);

    return res.json({
      success: true,
      model: "gemini-3.8-flash",
      message: text,
      status: "GEMINI_WORKING",
    });

  } catch (error) {
    console.error(
      "❌ Gemini test failed:",
      error?.message || error
    );

    return res.status(500).json({
      success: false,
      error: error?.message || String(error),
      status: "GEMINI_REQUEST_FAILED",
    });
  }
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});