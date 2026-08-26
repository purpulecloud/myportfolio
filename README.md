# Personal Portfolio — Karthik (based on lynnandtonic)


Short overview

This repo is a customized personal portfolio site built from the lynnandtonic template. It includes Home, About, Work, Certifications, Education pages and a client-side chatbot ("karthik") that answers questions from the site content.


Contents



- public/ — built site (ready to deploy)

- _pug/ — source templates (edit here)

- _assets/ — images, js (chatbot at _assets/js/karthik-chat.js)

- Gruntfile.js, package.json — build tooling

- C:\Users\Karth\Desktop\portfolio-submission.zip — prepared submission ZIP



Build & preview (local)



1. From repo root:

npm install

npm run build

2. Preview the built site:

cd public

python -m http.server 9000

Open [http://localhost:9000](http://localhost:9000)



Deploy (GitHub Pages)

A) docs/ (Recommended)



- Copy public/* → docs/

- git add docs && git commit -m "Add site (docs)"

- git push origin main

- GitHub: Settings → Pages → Source: main / docs



B) gh-pages branch



- (Optional) Use a deployment tool (gh-pages) or create an orphan gh-pages branch and commit public/* as site root. Enable Pages on gh-pages branch.



Quick web upload



- Create a GitHub repo → Upload public/ contents via the web UI (drag & drop) → Enable Pages.



Submission guidance (capstone)



- Provide the GitHub repo URL (Pages link is enough).

- Include portfolio-submission.zip on your Desktop if a ZIP is required.

- Add a short PDF describing features, how to run, and decisions (optional).



Editing notes



- Edit templates in _pug/ and rebuild (npm run build) to regenerate public/.

- Chatbot source: _assets/js/karthik-chat.js — it indexes site pages client-side; adjust parsers if you change markup.



Known issues & notes



- archive/ and placeholder pages were left; safe to remove if unused.

- If native Node modules fail during npm install on Windows, install the Visual Studio Build Tools / node-gyp prerequisites.



Credits & license



- Template: lynnandtonic (retain original license). Custom code by Karthik.



Contact
karthikeya.rangala@gmail.com 



