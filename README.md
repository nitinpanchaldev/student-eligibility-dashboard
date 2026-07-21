# 🎓 Student Eligibility Dashboard

A modern and responsive Student Eligibility Dashboard built using HTML, CSS, and JavaScript.
This application helps evaluate student eligibility for different academic and extracurricular activities based on predefined rules such as CGPA, attendance, and department requirements.

---

## 🚀 Features

### Student Eligibility Assessment
- Evaluate students based on:
  - CGPA
  - Attendance
  - Department/Branch
  - Activity Selection

### Dynamic Rules Engine
Supports multiple activity pathways:
- Scholarship Program
- Sports Athletics
- Coding Club
- Inter-College Hackathon

Each activity has its own eligibility criteria, shown live in a rules panel as the activity is selected.

### Smart Analytics Dashboard
- Total Checks
- Eligible Students
- Rejected Students
- Average Score
- Top Scorer / Best Department / Most Active Pathway insights

### Interactive Result System
- Eligibility Status
- Score Calculation
- Circular Progress Indicator
- Performance Badge System
  - 🥇 Gold
  - 🥈 Silver
  - 🥉 Bronze
  - ❌ Needs Improvement

### Student History Management
- Add Records
- Edit Records
- Delete Records (with confirmation modal — closable via button, backdrop click, or Escape key)
- Search Records
- Filter by Status / Branch / Activity
- Sortable Columns
- Pagination Support

### Data Visualization
- Chart.js Doughnut Analytics
- Eligible vs Rejected Distribution
- Color-coded legend with live counts

### Export Features
- CSV Report Export
- PDF Report Export (via jsPDF + html2canvas)

### User Experience Features
- Dark Mode / Light Mode
- Responsive Design
- Toast Notifications
- Dynamic Rules Panel
- Keyboard-accessible focus states
- Respects `prefers-reduced-motion`

### Local Storage Persistence
All records are stored in the browser using LocalStorage, allowing data to remain available after page refresh. Corrupted/invalid stored data is handled gracefully without crashing the app.

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6)

### Libraries
- Chart.js
- Font Awesome
- jsPDF
- html2canvas

### Storage
- Browser LocalStorage

---

## 📁 Project Structure

```text
student-eligibility-dashboard/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

---

## 💻 Getting Started

### Clone Repository
```bash
git clone https://github.com/nitinpanchaldev/student-eligibility-dashboard.git
```

### Open Project
Simply open:
```text
index.html
```
in any modern web browser.

You can also use:
- VS Code Live Server
- GitHub Pages

---

## ⚙️ Eligibility Logic

### Scholarship Program
- CGPA ≥ 8.5
- Attendance ≥ 75%
- Open for all branches

### Sports Athletics
- CGPA ≥ 6.0
- Attendance ≥ 65%
- Requires fitness clearance

### Coding Club
- CGPA ≥ 7.0
- Attendance ≥ 70%
- Branch must be: CSE, IT, AI, DS, AIML, CSBS, EEE, or CIVIL

### Hackathon
- CGPA ≥ 7.5
- Attendance ≥ 75%

---

## 📊 Current Version

### Version: v1.1

Features Included:
✅ Student Assessment System
✅ Dynamic Rules Engine
✅ Dashboard Analytics
✅ Chart.js Integration + Legend
✅ Search, Filter & Sort
✅ Pagination
✅ Edit & Delete Records
✅ CSV Export
✅ PDF Export
✅ Dark Mode
✅ Local Storage Persistence
✅ Accessibility Improvements (keyboard focus, ARIA modal, reduced motion)

---

## 🔧 Changelog

### v1.1
- Fixed unescaped user input (roll no / name) in the table and edit view that could break page markup
- Added CSV formula-injection protection (fields starting with `=`, `+`, `-`, `@` are now safely escaped on export)
- Fixed a crash risk in the chart renderer when the canvas element was missing
- Removed a duplicate search event listener causing double filtering
- Added chart legend, modal ARIA attributes, keyboard focus states, and reduced-motion support
- Minor color-token and responsive spacing fixes

### v1.0
- Initial release with core eligibility engine, CRUD, analytics, and CSV export

---

## 🗺️ Future Roadmap

### v2.0 — React Version
Planned Improvements:
- React Components
- React Hooks
- State Management
- Better UI Architecture
- Enhanced Analytics
- Improved Performance

### v3.0 — Full Stack Version
Planned Features:
- React Frontend
- Node.js Backend
- Express API
- MongoDB Database
- User Authentication
- Multi-User Support
- Admin Dashboard
- Cloud Deployment

---

## 📸 Preview

Live Demo:
https://nitinpanchaldev.github.io/student-eligibility-dashboard/

---

## 👨‍💻 Author

Nitin Panchal
GitHub:
https://github.com/nitinpanchaldev

---

## ⭐ Project Status

Active Development
Current Release: v1.1
Next Milestone: React Migration (v2.0)
