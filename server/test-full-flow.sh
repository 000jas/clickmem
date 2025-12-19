#!/bin/bash

echo "🧪 Testing Extension → Node Server → Python NLP → Supabase Flow"
echo ""
echo "📤 Sending test capture data..."

curl -X POST http://localhost:3001/receive_data \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Title: Amazing AI Product Review\nURL: https://example.com/product\nCaptured: 2025-11-29T10:00:00.000Z\n\nThis is an incredible artificial intelligence product that has completely transformed my workflow. The natural language processing capabilities are outstanding and the machine learning models are highly accurate. I love how it integrates seamlessly with my existing tools and makes complex tasks simple. The customer support team was very responsive and helpful throughout the onboarding process. Overall, I highly recommend this product to anyone looking to enhance their productivity with AI technology."
  }'

echo ""
echo ""
echo "✅ Check the server logs above to see:"
echo "   1. Python NLP analysis (sentiment, keywords, summary, embedding)"
echo "   2. Data saved to Supabase"
echo ""
echo "🔍 You can also check your Supabase dashboard to see the saved data!"
