# ClickMem 📸

> Capture your digital moments - A Chrome extension that automatically or manually saves web pages to your personal library.

## 🌟 Features

- **Auto-Capture**: Automatically capture and save pages as you browse
- **Manual Capture**: On-demand page capture with a single click
- **Smart Storage**: Content is processed with NLP and stored in Supabase
- **Web Library**: View and search your captured pages in a beautiful web interface
- **AI-Powered**: Uses Gemini AI for intelligent content analysis

## 🏗️ Project Structure

```
genathon/
├── extension/          # Chrome Extension
│   ├── manifest.json
│   ├── popup.html/js/css
│   ├── background.js
│   └── content.js
├── gena-code/         # Frontend Web App (React + Vite)
│   ├── client/
│   └── server/
├── server/            # Backend API (Node.js + Python)
│   ├── server.js      # Main API server
│   ├── nlp_service.py # NLP processing service
│   └── .env.example   # Environment variables template
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Python 3.x
- Chrome browser
- Gemini API key
- Supabase account

### 1. Clone the Repository

```bash
git clone https://github.com/ojasdhapse/clickmem.git
cd clickmem
```

### 2. Set Up Environment Variables

#### Backend Server
```bash
cd server
cp .env.example .env
# Edit .env with your actual API keys
```

#### Frontend App
```bash
cd gena-code
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Install Dependencies & Run

#### Terminal 1 - Frontend
```bash
cd gena-code
npm install
npm run dev
```

#### Terminal 2 - Backend API
```bash
cd server
npm install
node server.js
```

#### Terminal 3 - NLP Service
```bash
cd server
pip install -r requirements.txt
python3 nlp_service.py
```

### 4. Install Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The ClickMem icon should appear in your extensions

## 🔧 Configuration

### Getting API Keys

1. **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Supabase**: Create project at [Supabase](https://supabase.com) and get URL + keys from Settings > API

### Environment Variables

See `.env.example` files in `server/` and `gena-code/` directories for required variables.

## 📖 Usage

### Auto-Capture Mode
1. Toggle "Auto-Capture" ON in the extension popup
2. Browse normally - pages are automatically captured after loading
3. View captured pages in your library at `http://localhost:8080`

### Manual Capture Mode
1. Click the ClickMem extension icon
2. Press the "Capture Current Page" button
3. Page is instantly saved to your library

## 🛠️ Tech Stack

- **Extension**: Vanilla JS, Chrome Extension API
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **NLP**: Python, spaCy
- **AI**: Google Gemini API
- **Database**: Supabase (PostgreSQL)

## 🔐 Security

- ⚠️ **Never commit `.env` files**
- All sensitive data is excluded via `.gitignore`
- API keys should be kept secure and rotated regularly
- Use `.env.example` as template only

## 📝 Development

```bash
# Run tests (if available)
npm test

# Build for production
cd gena-code
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Author

**Ojas Dhapse**
- GitHub: [@ojasdhapse](https://github.com/ojasdhapse)

---

## 🎉 All set to go!

Enjoy capturing your digital moments! 📸

*Built with ❤️ by Ojas*

