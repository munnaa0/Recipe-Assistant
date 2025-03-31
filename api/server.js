const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Load recipes from recipe.json at startup
let recipes = [];
try {
  const recipePath = path.join(__dirname, "..", "data", "recipe.json");
  console.log("Looking for recipe.json at:", recipePath); // 👈 Add this line

  const data = fs.readFileSync(recipePath, "utf8");
  const jsonData = JSON.parse(data);
  recipes = jsonData.recipes || [];
  console.log(`✅ Loaded ${recipes.length} recipes.`);
} catch (err) {
  console.error("❌ Error loading recipe data:", err.message);
  process.exit(1);
}

// Helper function to normalize names and queries
const normalizeString = (str) => {
  return str
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]/gu, "") // Allow all Unicode letters and numbers
    .replace(/s$/, ""); // Optionally remove trailing 's'
};

// --- API Endpoint ---
app.post("/api/chat", (req, res) => {
  const query = req.body.message?.trim().toLowerCase();
  if (!query || query.length < 1) {
    return res.status(400).json({
      answer: "Please ask for a recipe by name (at least 1 character).",
      source: "input-error",
    });
  }

  console.log(`\n🔍 Recipe query: "${query}"`);

  // Check if the query is asking for a specific recipe category
  if (
    query.includes("bengali recipies") ||
    query.includes("bengali recipe") ||
    query.includes("bengali recipes")
  ) {
    // Take first 102 entries
    const limitedRecipes = recipes.slice(0, 102);
    let responseText =
      "------------------------------<b>Bengali Recipes</b>-----------------------<br><br>";
    limitedRecipes.forEach((recipe, index) => {
      responseText += `${index + 1}. ${recipe.name}<br>`;
    });
    return res.json({
      answer: responseText,
      source: "Recipe Database",
      confidence: 1.0,
    });
  }

  if (
    query.includes("japanese recipies") ||
    query.includes("japanese recipe") ||
    query.includes("japanese recipes") ||
    query.includes("japanese recipie")
  ) {
    const limitedRecipes = recipes.slice(102, 190);
    let responseText =
      "------------------------------<b>Japanese Recipes</b>-----------------------<br><br>";
    limitedRecipes.forEach((recipe, index) => {
      responseText += `${index + 1}. ${recipe.name}<br>`;
    });
    return res.json({
      answer: responseText,
      source: "Recipe Database",
      confidence: 1.0,
    });
  }

  if (
    query.includes("italian recipies") ||
    query.includes("italian recipe") ||
    query.includes("italian recipes") ||
    query.includes("italian recipie")
  ) {
    const limitedRecipes = recipes.slice(190, 286);
    let responseText =
      "------------------------------<b>Italian Recipes</b>-----------------------<br><br>";
    limitedRecipes.forEach((recipe, index) => {
      responseText += `${index + 1}. ${recipe.name}<br>`;
    });
    return res.json({
      answer: responseText,
      source: "Recipe Database",
      confidence: 1.0,
    });
  }

  if (
    query.includes("chinese recipies") ||
    query.includes("chinese recipe") ||
    query.includes("chinese recipes") ||
    query.includes("chinese recipie")
  ) {
    const limitedRecipes = recipes.slice(286, 386);
    let responseText =
      "------------------------------<b>Chinese Recipes</b>-----------------------<br><br>";
    limitedRecipes.forEach((recipe, index) => {
      responseText += `${index + 1}. ${recipe.name}<br>`;
    });
    return res.json({
      answer: responseText,
      source: "Recipe Database",
      confidence: 1.0,
    });
  }

  if (
    query.includes("american recipies") ||
    query.includes("american recipe") ||
    query.includes("american recipes") ||
    query.includes("american recipie")
  ) {
    const limitedRecipes = recipes.slice(386, 436);
    let responseText =
      "------------------------------<b>American Recipes</b>-----------------------<br><br>";
    limitedRecipes.forEach((recipe, index) => {
      responseText += `${index + 1}. ${recipe.name}<br>`;
    });
    return res.json({
      answer: responseText,
      source: "Recipe Database",
      confidence: 1.0,
    });
  }

  // Check if the query asks for all recipes
  if (
    query.includes("all recipe") ||
    query.includes("all recipes") ||
    query.includes("list of recipes") ||
    query.includes("available recipes") ||
    query.includes("recipe list") ||
    query.includes("recipe names") ||
    query.includes("all recipie") ||
    query.includes("all recipies")
  ) {
    let responseText =
      "------------------------------<b>Bengali Recipes</b>-----------------------<br><br>";
    recipes.forEach((recipe, index) => {
      // Insert category headers at specific indexes
      if (index === 102) {
        responseText +=
          "<br>------------------------------<b>Japanese Recipes</b>----------------------<br><br>";
      }
      if (index === 190) {
        responseText +=
          "<br>------------------------------<b>Italian Recipes</b>----------------------<br><br>";
      }
      if (index === 286) {
        responseText +=
          "<br>------------------------------<b>Chinese Recipes</b>----------------------<br><br>";
      }
      if (index === 386) {
        responseText +=
          "<br>------------------------------<b>American Recipes</b>----------------------<br><br>";
      }
      responseText += `${index + 1}. ${recipe.name}<br>`;
    });
    return res.json({
      answer: responseText,
      source: "Recipe Database",
      confidence: 1.0,
    });
  }

  // Improved matching with aliases support and partial matching
  const queryTokens = query.split(" ").map((token) => normalizeString(token));

  const matchedRecipes = recipes
    .map((recipe) => {
      const allNames = [recipe.name, ...(recipe.aliases || [])];
      const normalizedNames = allNames.map(normalizeString);
      const bestMatchMetrics = normalizedNames.reduce(
        (acc, n) => {
          let count = 0;
          let total = 0;
          queryTokens.forEach((token) => {
            if (n.includes(token)) {
              count++;
              total += token.length;
            }
          });
          if (count > acc.count || (count === acc.count && total > acc.total)) {
            return { count, total };
          }
          return acc;
        },
        { count: 0, total: 0 }
      );
      return {
        ...recipe,
        normalizedNames,
        matchStrength: bestMatchMetrics.count,
        matchTotal: bestMatchMetrics.total,
      };
    })
    .filter((recipe) => recipe.matchStrength > 0)
    .sort((a, b) => {
      if (b.matchStrength !== a.matchStrength) {
        return b.matchStrength - a.matchStrength;
      }
      return b.matchTotal - a.matchTotal;
    });

  const bestMatch = matchedRecipes[0];

  if (bestMatch) {
    let responseText = `Recipe for ${bestMatch.name.toUpperCase()}`;
    if (bestMatch.aliases) {
      responseText += ` (also known as: ${bestMatch.aliases.join(", ")})`;
    }
    responseText += `:<br><br>Ingredients:<br>`;
    bestMatch.ingredients.forEach((ingredient) => {
      responseText += `- ${ingredient}<br>`;
    });
    responseText += `<br>Instructions:<br>`;
    bestMatch.instructions.forEach((step, index) => {
      responseText += `${index + 1}. ${step}<br>`;
    });
    return res.json({
      answer: responseText,
      source: "Recipe Database",
      confidence: 1.0,
    });
  } else {
    return res.json({
      answer:
        "Sorry, I couldn't find a recipe for that dish. Please try another dish name.",
      source: "no-match",
    });
  }
});

// --- Start Server (Only for local development) ---
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

// --- Start Server ---

module.exports = app; // Required for Vercel serverless functions
