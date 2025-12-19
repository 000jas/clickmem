// Alternative Supabase insert code if using JSONB column
// Replace the existing Supabase insert block with this

// Save to Supabase - JSONB approach (clean JSON object, not stringified)
const { data, error } = await supabase
  .from("content_documents_jsonb")
  .insert([
    {
      metadata: {
        title: structured.title || null,
        summary: structured.summary || null,
        keywords: structured.keywords || [],
        emotions: structured.emotions || [],
        sentiment_score: structured.sentiment_score || null,
        source_url: structured.source_url || null,
        media_urls: structured.media_urls || [],
        timestamp: structured.timestamp || todaysTimestamp,
        nlp_processed: structured.nlp_processed || false,
        raw_content: rawText.substring(0, 5000)
      },
      embedding: structured.embedding || null
    },
  ])
  .select();

// Key points:
// 1. We pass a JavaScript object directly to metadata field
// 2. Supabase automatically stores it as JSONB (not stringified)
// 3. No JSON.stringify() needed!
// 4. PostgreSQL JSONB type handles the clean JSON storage
