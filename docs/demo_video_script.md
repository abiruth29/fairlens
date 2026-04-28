# FairLens — Demo Video Script & Recording Workflow

**Target Duration**: 3 minutes (180 seconds)
**Format**: Screen recording + voiceover (OBS Studio recommended)
**Tone**: Confident, clear, impactful — like a TED talk opener

---

## Pre-Recording Setup

**Screen Setup:**
- Browser: Chrome at 1920x1080, 100% zoom
- App: FairLens running locally (http://localhost:5173)
- Background: Close all tabs except the app
- Hide bookmarks bar for a clean look

**Audio:**
- Quiet room, USB microphone if available
- Record voiceover separately and sync in post (DaVinci Resolve free / CapCut)

**Recording Tool:**
- OBS Studio (free) — Record browser + mic simultaneously
- Resolution: 1920x1080 @ 30fps
- Bitrate: 4000 kbps for sharp text

---

## Script (180 seconds)

### [0:00–0:15] Hook — The Problem  
*Screen: FairLens hero page landing*

> "In 2016, ProPublica investigated an AI tool called COMPAS that US courts used to predict recidivism. The algorithm was twice as likely to falsely flag Black defendants as high-risk compared to White defendants. This wasn't a one-off — Amazon's hiring AI penalized women. Optum's healthcare algorithm gave Black patients lower risk scores. AI bias is silent, systemic, and already harming millions of people."

*[Pause 1 second for impact]*

---

### [0:15–0:30] Solution Intro  
*Screen: Scroll down to feature cards*

> "FairLens is an AI bias auditor that detects, explains, and fixes hidden discrimination in automated decision systems — in under 5 seconds. It uses Google Gemini to make complex fairness math accessible to any organization, not just ML researchers."

---

### [0:30–1:00] Live Demo — Upload  
*Screen: Navigate to Audit page, click "Sample Datasets"*

> "Let me show you how it works. I'll click on the COMPAS recidivism dataset — the same one at the center of ProPublica's investigation."

*[Click COMPAS card, show loading state]*

> "FairLens is now training a logistic regression model on this data and computing 7 fairness metrics across racial groups."

*[Report appears]*

> "In under 5 seconds — we have a full bias report. And right at the top: CRITICAL severity. The demographic parity difference is 0.53 — meaning Black defendants receive high-risk predictions at a rate 53 percentage points higher than White defendants."

---

### [1:00–1:30] Dashboard Tour  
*Screen: Scroll through the report*

> "Here's the bias fingerprint — a radar chart showing where the model fails most. You can see equalized odds is the most asymmetric metric, meaning the model's true positive rate is drastically different across groups."

*[Scroll to group comparison bar chart]*

> "This bar chart compares outcomes by race directly. African-American defendants have a 66% positive rate versus 13% for Caucasian defendants — for the same level of actual reoffending."

---

### [1:30–2:00] Gemini Explainer  
*Screen: Scroll to Gemini AI section*

> "Now here's what makes FairLens different. Google Gemini 1.5 has analyzed this report and is explaining it in plain English."

*[Read from screen]*

> "It identified the critical issue, estimated the real-world impact, and gave us 3 specific recommendations. And I can ask it anything."

*[Type: "Which group is most affected and why?"]*

> "Watch — I can have a conversation with my bias report."

*[Show the response appearing]*

---

### [2:00–2:30] Mitigation  
*Screen: Show before/after comparison chart*

> "FairLens doesn't just flag problems — it fixes them. I clicked 'Show Mitigation' and it applied reweighting — a technique that adjusts training sample weights to balance group representation."

*[Point to the bar chart]*

> "The demographic parity difference dropped from 0.53 to 0.32, and accuracy only fell by a few percent. That's the accuracy-fairness tradeoff made visible and manageable."

---

### [2:30–2:55] Impact & Close  
*Screen: Return to hero page*

> "FairLens is designed for the organizations that build and deploy AI systems — HR departments, banks, healthcare providers — who need a fast, credible way to audit their models before they cause harm."

> "It's open source, runs in any browser, deploys to Google Cloud Run in minutes, and is built directly on Google Gemini for AI-powered explanations."

*[Hold on FairLens logo]*

> "Because fair AI isn't optional. It's the foundation of trustworthy technology."

### [2:55–3:00] End Card
*Screen: Show GitHub link + Team name*

> "FairLens — built for the GDG Solutions Challenge 2026."

---

## Post-Production Checklist

- [ ] Trim dead air at the start/end
- [ ] Add light background music (lo-fi, low volume ~10%)
- [ ] Add text overlays for key stats (e.g., "0.26 → Demographic Parity Difference")
- [ ] Add team name + "GDG Solutions Challenge 2026" lower-third
- [ ] Export as MP4, H.264, 1920x1080
- [ ] Verify audio sync
- [ ] Total length: check it's under 3 minutes
- [ ] Upload unlisted to YouTube and copy the link for submission

---

## Screen Recording Sequence (Cheat Sheet)

| Time | Action |
|------|--------|
| 0:00 | Hero page — scroll gently |
| 0:30 | Click "Run Audit" in navbar |
| 0:35 | Click "Sample Datasets" tab |
| 0:40 | Click "COMPAS Recidivism" |
| 0:50 | Audit result appears — pause |
| 1:00 | Scroll through severity banner |
| 1:10 | Highlight radar chart |
| 1:20 | Highlight bar chart |
| 1:30 | Scroll to Gemini section, expand |
| 1:50 | Type question + send |
| 2:00 | Click "Show chart" in mitigation |
| 2:15 | Scroll through metrics table |
| 2:30 | Navigate back to Home |
| 2:50 | Hold on logo + tagline |

---

## Tips for a Winning Demo Video

1. **Don't narrate UI actions** ("I am now clicking the button...") — narrate *impact* instead
2. **Lead with the problem** — judges need to care before they see the solution
3. **Show numbers on screen** — text overlays of key metrics during voiceover are powerful
4. **Keep transitions fast** — use 0.5s zoom + fade between sections
5. **End with a clear ask** — "Fair AI isn't optional" is a closing statement that sticks
