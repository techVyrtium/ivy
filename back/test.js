/**
 * This is a node in n8n for creating a MongoDB query using AI agent output
 *
 * @param {object} items - The items from the previous node
 * @returns {object} - The processed items
 */
async function executeWorkflow(items) {
  // This is how n8n expects the code to be structured
  const returnItems = [];

  // Process each item from the previous node
  for (const item of items) {
    try {
      // Get the AI agent output - check if it's nested in 'output' property
      const aiAgentOutput = item.json.output || item.json;

      console.log(
        "Processing AI Agent Output:",
        JSON.stringify(aiAgentOutput, null, 2)
      );

      // Extract the keywords for searching
      let keywords = [];

      if (
        aiAgentOutput.combined_key_words &&
        Array.isArray(aiAgentOutput.combined_key_words)
      ) {
        keywords = aiAgentOutput.combined_key_words;
      } else if (
        aiAgentOutput.english_key_words &&
        Array.isArray(aiAgentOutput.english_key_words)
      ) {
        keywords = aiAgentOutput.english_key_words;
      } else if (
        aiAgentOutput.spanish_key_words &&
        Array.isArray(aiAgentOutput.spanish_key_words)
      ) {
        keywords = aiAgentOutput.spanish_key_words;
      }

      // Extract budget information directly from the input format
      let budgetMin = null;
      let budgetMax = null;

      if (aiAgentOutput.budgetMin) {
        budgetMin = parseFloat(aiAgentOutput.budgetMin);
      }

      if (aiAgentOutput.budgetMax) {
        budgetMax = parseFloat(aiAgentOutput.budgetMax);
      }

      if (!keywords || keywords.length === 0) {
        // If no keywords, pass through the original item with an error message
        returnItems.push({
          json: {
            error: "No keywords available for search",
            debug_info: {
              received_structure: JSON.stringify(item.json),
              has_output_property: Boolean(item.json.output),
              output_type: typeof aiAgentOutput,
            },
            query: null,
            results: [],
          },
        });
        continue;
      }

      // IMPORTANT: Create query objects but do NOT stringify them
      // The MongoDB node will handle the stringification

      // 1. EXACT MATCH QUERY - Primary search in type, product, description with exact budget
      const exactMatchQuery = {
        $and: [
          {
            $or: keywords.map((keyword) => ({
              $or: [
                { type: { $regex: keyword, $options: "i" } },
                { product: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
              ],
            })),
          },
        ],
      };

      // Add budget constraint to exact match query if available
      if (budgetMin !== null && budgetMax !== null) {
        exactMatchQuery.$and.push({
          usd: { $gte: budgetMin, $lte: budgetMax },
        });
      } else if (budgetMax !== null) {
        exactMatchQuery.$and.push({ usd: { $lte: budgetMax } });
      } else if (budgetMin !== null) {
        exactMatchQuery.$and.push({ usd: { $gte: budgetMin } });
      }

      // 2. ALTERNATIVE MATCH QUERY - Secondary search in service and category fields
      const alternativeMatchQuery = {
        $and: [
          {
            $or: keywords.map((keyword) => ({
              $or: [
                { service: { $regex: keyword, $options: "i" } },
                { category: { $regex: keyword, $options: "i" } },
              ],
            })),
          },
        ],
      };

      // Add the same budget constraint to alternative match query
      if (budgetMin !== null && budgetMax !== null) {
        alternativeMatchQuery.$and.push({
          usd: { $gte: budgetMin, $lte: budgetMax },
        });
      } else if (budgetMax !== null) {
        alternativeMatchQuery.$and.push({ usd: { $lte: budgetMax } });
      } else if (budgetMin !== null) {
        alternativeMatchQuery.$and.push({ usd: { $gte: budgetMin } });
      }

      // 3. HIGHER BUDGET QUERY - Search for exact matches with higher budget
      const higherBudgetQuery = {
        $and: [
          {
            $or: keywords.map((keyword) => ({
              $or: [
                { type: { $regex: keyword, $options: "i" } },
                { product: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
              ],
            })),
          },
        ],
      };

      // Only add if budget is provided, and search for items above the budget
      if (budgetMax !== null) {
        higherBudgetQuery.$and.push({ usd: { $gt: budgetMax } });
      }

      // 4. SIMILAR PRODUCT QUERY - Find related products in the same price range
      const similarProductQuery = {
        $and: [
          // This will match products in the same category/service but not necessarily matching all keywords
          {
            $or: [
              ...keywords.map((keyword) => ({
                category: { $regex: keyword, $options: "i" },
              })),
              ...keywords.map((keyword) => ({
                service: { $regex: keyword, $options: "i" },
              })),
            ],
          },
        ],
      };

      // Add the original budget constraint
      if (budgetMin !== null && budgetMax !== null) {
        similarProductQuery.$and.push({
          usd: { $gte: budgetMin, $lte: budgetMax },
        });
      } else if (budgetMax !== null) {
        similarProductQuery.$and.push({ usd: { $lte: budgetMax } });
      } else if (budgetMin !== null) {
        similarProductQuery.$and.push({ usd: { $gte: budgetMin } });
      }

      // Return all query strategies for use in MongoDB nodes
      returnItems.push({
        json: {
          is_database_required: aiAgentOutput.is_database_required,
          query_category: aiAgentOutput.query_category,
          original_query: aiAgentOutput.original_query,
          language: aiAgentOutput.users_language,

          // Raw query objects - DO NOT stringify these
          exact_match_query: exactMatchQuery,
          alternative_match_query: alternativeMatchQuery,
          higher_budget_query: higherBudgetQuery,
          similar_product_query: similarProductQuery,

          // Original search parameters for context
          keywords_used: keywords,
          budget_min: budgetMin,
          budget_max: budgetMax,
        },
      });
    } catch (error) {
      // Handle errors properly for n8n
      returnItems.push({
        json: {
          error: error.message,
          original_item: item.json,
        },
      });
    }
  }

  return returnItems;
}

// This is required for n8n
return await executeWorkflow($input.all());
