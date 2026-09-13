# Pronoun Master PWA

Interactive English Grammar Learning PWA for **Chapter XI — Pronouns**  
With Bengali explanations, 120+ questions, offline support, and gamification.

## Live site

https://pbwsantu-collab.github.io/pronoun-master/

## Features

- 20 structured lessons (Art. 102–160)
- English rules + natural Bengali explanations
- 120 practice/quiz questions (MCQ + fill)
- Topic filters & variable quiz length
- Progress, XP, badges
- Glossary of grammar terms
- Search across lessons
- Language toggle: English / বাংলা / Mixed
- Text-to-speech (browser SpeechSynthesis)
- Installable PWA (works offline after first load)
- Mobile-first responsive design

## Project structure

```
pronouns-pwa/
├── index.html
├── style.css
├── app.js
├── manifest.json
├── service-worker.js
├── data/
│   ├── lessons.json
│   ├── questions.json
│   └── glossary.json
├── python/          (optional generators)
├── assets/
└── README.md
```

## Deploy to GitHub Pages

1. Create repo (or use existing) `pronoun-master`
2. Upload **all** files and folders (especially `app.js` and `data/`)
3. Settings → Pages → Deploy from branch → `main` → `/ (root)` → Save
4. Site: `https://YOUR_USERNAME.github.io/pronoun-master/`

## Update content later

Edit `data/lessons.json` or `data/questions.json`, commit and push.  
No backend or Python runtime is required for students.

## Local preview

Open `index.html` in a browser, or use any static server:

```bash
npx serve .
# or
python -m http.server 8080
```

## Validation report

- Lessons: 20
- Questions: 120
- Glossary terms: 16
- PWA files: present
- Status: READY
