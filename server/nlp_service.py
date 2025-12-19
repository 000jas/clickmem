from transformers import pipeline
from flask import Flask, request, jsonify
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer
from PIL import Image
import io
import base64
import traceback

app = Flask(__name__)

print("Loading models... This may take a moment on first run.")

# 1) Sentiment Model
sentiment_pipe = pipeline(
    "text-classification",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

# 2) Summarization model
summarizer = pipeline(
    "summarization",
    model="sshleifer/distilbart-cnn-12-6"
)

# 3) Keyword extraction
kw_model = KeyBERT()

# 4) Text embeddings
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

print("All models loaded successfully!")

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        body = request.get_json()
        text = body.get("text", "")
        
        if not text or len(text.strip()) < 10:
            return jsonify({"error": "Text too short or empty"}), 400

        # Truncate text for models that have token limits
        max_length = 1000  # characters
        text_truncated = text[:max_length] if len(text) > max_length else text

        # 1) Sentiment Analysis
        try:
            sentiment = sentiment_pipe(text_truncated[:512])[0]  # Most models max at 512 tokens
        except Exception as e:
            print(f"Sentiment error: {e}")
            sentiment = {"label": "UNKNOWN", "score": 0.0}

        # 2) Summarization (only if text is long enough)
        summary = None
        if len(text_truncated.split()) > 50:  # Need at least 50 words
            try:
                summary_result = summarizer(
                    text_truncated, 
                    max_length=120, 
                    min_length=30, 
                    do_sample=False
                )
                summary = summary_result[0]["summary_text"]
            except Exception as e:
                print(f"Summary error: {e}")
                summary = text_truncated[:200] + "..."
        else:
            summary = text_truncated

        # 3) Keyword Extraction
        try:
            keywords_raw = kw_model.extract_keywords(
                text_truncated,
                keyphrase_ngram_range=(1, 2),
                stop_words="english",
                top_n=5
            )
            keywords = [kw[0] for kw in keywords_raw]  # Extract just the keywords
        except Exception as e:
            print(f"Keyword error: {e}")
            keywords = []

        # 4) Text Embedding
        try:
            embedding = embed_model.encode(text_truncated[:512]).tolist()
        except Exception as e:
            print(f"Embedding error: {e}")
            embedding = []

        return jsonify({
            "sentiment": sentiment,
            "summary": summary,
            "keywords": keywords,
            "embedding": embedding,
            "text_length": len(text),
            "processed_length": len(text_truncated)
        })

    except Exception as e:
        print(f"Error in /analyze: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "NLP service is running"})


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5002))
    app.run(host="0.0.0.0", port=port, debug=False)