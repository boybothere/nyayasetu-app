# NyayaSetu

**Bridging the gap between Court Directives and Government Action.**

NyayaSetu is a sequential, multi-agent AI platform designed to ingest dense, multi-page court judgments and instantly generate structured, deadline-driven compliance plans for government departments.

## Features

* **Sequential Multi-Agent Pipeline:** Utilizes a 4-agent architecture (Legal Analyst, Compliance Planner, Implementation Officer, Precedent Checker) to break down complex judgments into granular, actionable sub-directives.
* **Verifiable Source-Tracing:** 100% hallucination-free UI. Clicking any AI-generated directive instantly scrolls and highlights the exact source quote inside the embedded PDF viewer using a custom Regex-matching engine.
* **Automated Delegation:** Intelligently maps tasks to specific state departments and calculates urgency and compliance deadlines.
* **Human-in-the-Loop Review:** Built-in workflow for officers to approve or reject AI extractions before publishing the final implementation plan.

## Architecture Stack

* **Frontend:** Next.js, React, Tailwind CSS, `@react-pdf-viewer`
* **Backend:** Node.js, Express, `pdftotext` integration
* **AI Engine:** Gemini AI API (Multi-Agent sequential prompting)

## Local Setup & Installation

### Prerequisites

* Node.js v18 or higher
* `poppler-utils` installed on your machine (required for `pdftotext` execution)


### Installing `poppler-utils`

NyayaSetu relies on the `pdftotext` system binary to extract text from PDFs.
This is **not installed via npm** and must be installed separately.

---

### Terminal Compatibility (Important)

NyayaSetu uses the `pdftotext` system utility, so your environment must support it.

#### Recommended Setup (Windows Users)

* Use **WSL (Windows Subsystem for Linux)**
* Install `poppler-utils` inside WSL
* Run both backend and frontend using WSL terminal

---

#### Alternative: PowerShell / CMD (Windows)

* Works **only if** Poppler is installed manually on Windows
* You must:

  * Download Poppler for Windows
  * Add it to your system `PATH`
* Otherwise, `pdftotext` will fail

---

#### macOS / Linux

* Works out of the box after installing Poppler
* You can use any terminal (Terminal, iTerm, etc.)

---

### Recommendation

For the smoothest setup and zero path issues:
 Use **WSL on Windows** or a **native Linux/macOS environment**

---



#### Ubuntu / WSL

```bash
sudo apt update
sudo apt install poppler-utils
```

#### macOS (Homebrew)

```bash
brew install poppler
```

---

### Verify Installation

```bash
pdftotext -v
```


### 1. Booting the Backend

```bash
cd backend
npm install

# Create a .env file with:
GEMINI_API_KEY=your_api_key
PORT=3001
CASES_DIR=./data/cases

# Run server
npx tsx server.js
```

*Backend will run on [http://localhost:3001](http://localhost:3001)*

---

### 2. Booting the Frontend

```bash
cd frontend
npm install

# Create a .env.local file with:
NEXT_PUBLIC_API_URL=http://localhost:3001/

# Run frontend
npm run dev
```

*Frontend will run on [http://localhost:3000](http://localhost:3000)*

---

## How to Use

1. Launch the application and upload a valid PDF court judgment.
2. The Multi-Agent pipeline will boot up, extract directives, and save the intermediate JSON states.
3. You will be redirected to the Verification Dashboard.
4. Click on any extracted directive on the left to highlight the exact source text in the PDF on the right.
5. Approve or Reject directives to compile the final compliance roadmap.

---
