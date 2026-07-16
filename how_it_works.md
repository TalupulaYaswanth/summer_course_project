# CodeExplain - User Interactive Workflow Guide

This document explains step-by-step how a user interacts with the **CodeExplain** application, from first landing on the website to analyzing code, taking quizzes, and managing their saved history.

---

## 🚀 Step 1: Landing Page & Onboarding
1. **Welcome Screen**: The user arrives at the modern landing page showcasing the key features: line-by-line walk-throughs, Big O complexity analysis, security scanner, auto-generated quizzes, and interview prep.
2. **Access Control**: The user clicks **Get Started** or **Login** in the top navbar.
3. **Secure Signup**: 
   * A new user creates an account by entering an email and password.
   * If already registered, they log in using their credentials.
   * *Note: The system hashes their password and issues a secure authorization key (JWT token) so they stay securely signed in.*

---

## 💻 Step 2: The Code Sandbox Workspace
After logging in, the user is redirected to the main dashboard workspace:
1. **Select Language**: The user selects the programming language rules from the dropdown list (supporting Python, JavaScript, TypeScript, C++, Java, Go, HTML, CSS, SQL, and plain text).
2. **Choose AI Model**: The user chooses the Gemini reasoning model (e.g., `gemini-2.5-flash` for high speed, or `gemini-2.5-pro` for complex logic).
3. **Inputting Code**:
   * They can type or paste code directly into the premium **Monaco Editor** (which provides syntax highlights).
   * They can click the **Upload** folder icon to load a local script file directly.
   * They can click the **Reset** button to wipe the workspace clean.
4. **Trigger Analysis**: They click the **Explain Code Snippet** button. A loader animation appears while the AI processes the logic.

---

## 📊 Step 3: Interactive Results & Learning Tabs
Once compiled, the analysis is displayed across five specialized learning tabs:

### 1. 📖 Explanations Tab
* **Audience Level**: Tells the user if the code is suited for Beginners, Intermediates, or Experts.
* **Plain English Explanation**: A layperson walkthrough explaining what the script accomplishes without confusing jargon.
* **Line-by-Line Commentary**: An interactive table that highlights specific sections of code alongside a description of what that line does.

### 2. ⚡ Code Metrics Tab
* **Big O Analysis**: Displays the worst-case, average-case, and best-case Time Complexity and Space Complexity.
* **Dry Run Simulator**: A step-by-step execution table showing how the program runs line-by-line and how the values of variables change at each step.
* **Variables Map**: A list showing all declared variables, their data types, and their exact role in the code.

### 3. 💡 Refactors & Security Tab
* **Security Scanner**: Highlights potential code smells or vulnerabilities (such as SQL injections, division by zero, or unsafe inputs) with remediation fixes.
* **Comparative Code Diff**: Shows a side-by-side block comparing their original code against an optimized, refactored clean code version.

### 4. 🎯 Exercises & Quiz Tab
* **MCQ Quiz**: 10 multiple-choice questions based on the logic of their code. Users can click "Reveal Answer" to see the correct option and explanation.
* **True/False**: 5 custom questions targeting logic paths.
* **Fill in the Blanks**: 5 code-completion sentences.
* **Interactive Coding Tasks**: 3 hands-on programming exercises with starting templates and model solutions.

### 5. 💬 Interview Prep Tab
* **Mock Technical Q&A**: Lists conceptual questions a tech interviewer might ask based on this code, categorized by Easy, Medium, and Hard, with sample model answers.
* **Practice Problems**: Links to related coding challenges.
* **Related Concepts**: Next-step topics suggested for study.

---

## 📁 Step 4: History Management & Exporting
1. **Copying / Downloading**:
   * The user can click **Copy JSON** to copy raw structural results.
   * They can click **Download MD** to download a formatted Markdown document of the AI explanation to study offline.
2. **Sidebar History**:
   * All analyzed code runs are saved on the left sidebar.
   * Users can **Search** previous explanations or **Filter** them by language.
   * They can click the **Star** icon to mark an item as a favorite.
   * They can click the **Trash** icon to delete old snippets from their history.
3. **New Sandbox**: Clicking the **+ New Sandbox** button clears the screen to start explaining a new snippet.
