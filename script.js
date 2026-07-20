const activityRules = {
    Scholarship: { cgpa: 8.5, attendance: 75, text: ["CGPA must be ≥ 8.5", "Attendance must be ≥ 75%", "Open for all Branches"] },
    Sports: { cgpa: 6.0, attendance: 65, text: ["CGPA must be ≥ 6.0", "Attendance must be ≥ 65%", "Requires Fitness Clearance"] },
    CodingClub: { cgpa: 7.0, attendance: 70, text: ["CGPA must be ≥ 7.0", "Attendance must be ≥ 70%", "Branch MUST be CSE, IT, AI, DS, AIML, CSBS, EEE, CIVIL"] },
    Hackathon: { cgpa: 7.5, attendance: 75, text: ["CGPA must be ≥ 7.5", "Attendance must be ≥ 75%"] }
};


let historyData = [];
try {
    historyData = JSON.parse(localStorage.getItem('studentHistoryData')) || [];
} catch (err) {
    console.error('Stored history data was corrupted and could not be loaded:', err);
    historyData = [];
}
let myPieChart = null;

let currentPage = 1;
const rowsPerPage = 5;


let isEditMode = false;
let currentEditRoll = null;


let deleteTargetRollId = null;


document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    updateRulesPanel();

    
    saveAndRefreshDOM();

    
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.addEventListener('input', () => {
            currentPage = 1;
            filterHistory();
        });
    }

    
    const historyTableBody = document.getElementById('historyTableBody');
    if (historyTableBody) {
        historyTableBody.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-action]');
            if (!button) return;
            const roll = button.dataset.roll;
            if (button.dataset.action === 'edit') editRecord(roll);
            else if (button.dataset.action === 'delete') deleteRecord(roll);
        });
    }
});


function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeToggleUI(savedTheme === "dark");
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const targetTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", targetTheme);
    localStorage.setItem("theme", targetTheme);
    updateThemeToggleUI(targetTheme === "dark");

    if (document.getElementById('analyticsChart')) updateChartAnalytics();
}

function updateThemeToggleUI(isDark) {
    const icon = document.getElementById("theme-icon");
    const text = document.getElementById("theme-text");
    if (!icon || !text) return;

    if (isDark) {
        icon.className = "fas fa-sun";
        text.innerText = "Light Mode";
    } else {
        icon.className = "fas fa-moon";
        text.innerText = "Dark Mode";
    }
}


function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


function updateRulesPanel() {
    const selectedActivity = document.getElementById('activity').value;
    const rulesList = document.getElementById('rulesList');

    if (!activityRules[selectedActivity]) return;

    
    rulesList.innerHTML = activityRules[selectedActivity].text.map(rule =>
        `<li><i class="fas fa-circle-nodes" style="color:var(--primary); margin-right:6px;"></i> ${rule}</li>`
    ).join("");
}


function checkEligibility(event) {
    event.preventDefault();

    const name = document.getElementById('studentName').value.trim();
    const roll = document.getElementById('rollNo').value.trim();
    const branch = document.getElementById('branch').value;
    const cgpa = parseFloat(document.getElementById('cgpa').value);
    const attendance = parseInt(document.getElementById('attendance').value, 10);
    const activity = document.getElementById('activity').value;

    
    if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
        showToast("Error: Name must contain letters only!", "error");
        return;
    }
    if (cgpa < 0 || cgpa > 10 || attendance < 0 || attendance > 100 || isNaN(cgpa) || isNaN(attendance)) {
        showToast("Error: Out of range metrics entry detected!", "error");
        return;
    }

    if (!isEditMode) {
        const isDuplicate = historyData.some(student => student.roll.toLowerCase() === roll.toLowerCase());
        if (isDuplicate) {
            showToast(`Conflict: Roll #${roll} already evaluated!`, "error");
            return;
        }
    }

    const submitBtn = document.getElementById('submitBtn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Evaluating...`;

    
    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        const currentRule = activityRules[activity];
        let isEligible = (cgpa >= currentRule.cgpa && attendance >= currentRule.attendance);

    
        const codingBranches = ["CSE", "IT", "AI", "DS", "AIML", "CSBS", "EEE", "CIVIL"];
        if (activity === "CodingClub" && !codingBranches.includes(branch)) {
            isEligible = false;
        }

        const overallScore = Math.round(((cgpa / 10) * 50) + ((attendance / 100) * 50));
        const currentTimestamp = new Date().toLocaleString('en-US', { hour12: false });

        
        updateActiveResultUI(name, roll, branch, isEligible, overallScore);

        const compiledData = {
            roll, name, branch, activity, score: overallScore,
            status: isEligible ? 'Eligible' : 'Rejected',
            cgpa, attendance, timestamp: currentTimestamp
        };

        if (isEditMode) {
            const recordIndex = historyData.findIndex(s => s.roll === currentEditRoll);
            if (recordIndex !== -1) {
                compiledData.timestamp = historyData[recordIndex].timestamp || currentTimestamp;
                historyData[recordIndex] = compiledData;
            }
            showToast(`Record updated successfully for ${name}!`, "success");
            resetEditState();
        } else {
            historyData.unshift(compiledData); // Add to front of reactive array
            showToast(`Assessment compiled successfully for ${name}!`, "success");
        }

        saveAndRefreshDOM();
        document.getElementById('eligibilityForm').reset();
        updateRulesPanel();
    }, 1200);
}

function updateActiveResultUI(name, roll, branch, isEligible, overallScore) {
    const statusColor = isEligible ? 'var(--success)' : 'var(--destructive)';

    const circleElement = document.getElementById('circleProgress');
    if (circleElement) {
        circleElement.style.background = `conic-gradient(${statusColor} ${overallScore * 3.6}deg, var(--border-color) 0deg)`;
    }

    document.getElementById('circleValue').innerText = `${overallScore}%`;

    const initials = name.split(" ").filter(n => n).map(n => n[0]).join("").toUpperCase().substring(0, 2);
    const resAvatar = document.getElementById('resAvatar');
    if (resAvatar) {
        resAvatar.innerText = initials;
        resAvatar.style.backgroundColor = statusColor;
    }

    document.getElementById('resName').innerText = name;
    document.getElementById('resRoll').innerText = roll;
    document.getElementById('resBranch').innerText = branch;

    const statusTextElement = document.getElementById('eligibilityStatus');
    statusTextElement.innerText = isEligible ? "ELIGIBLE / APPROVED" : "CRITERIA NOT MET";
    statusTextElement.style.color = statusColor;

    
    let badgeText = "";
    if (!isEligible) badgeText = "Needs Improvement ❌";
    else if (overallScore >= 90) badgeText = "Gold 🥇";
    else if (overallScore >= 75) badgeText = "Silver 🥈";
    else badgeText = "Bronze 🥉";

    const badgeElement = document.getElementById('rankBadge');
    if (badgeElement) {
        badgeElement.innerText = badgeText;
        badgeElement.style.borderColor = statusColor;
        badgeElement.style.color = statusColor;
    }

    document.getElementById('placeholderText').style.display = 'none';
    document.getElementById('resultBlock').style.display = 'flex';
}

function editRecord(roll) {
    const student = historyData.find(s => s.roll === roll.toString());
    if (!student) return;

    document.getElementById('studentName').value = student.name;
    document.getElementById('rollNo').value = student.roll;
    document.getElementById('rollNo').disabled = true; // Protect key database index integrity
    document.getElementById('branch').value = student.branch;
    document.getElementById('cgpa').value = student.cgpa;
    document.getElementById('attendance').value = student.attendance;
    document.getElementById('activity').value = student.activity;

    isEditMode = true;
    currentEditRoll = student.roll;

    document.getElementById('formHeading').innerHTML = `<i class="fas fa-pen-to-square"></i> Modify Record: #${escapeHTML(student.roll)}`;
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerText = "Update Records Matrix";

    document.getElementById('formHeading').scrollIntoView({ behavior: 'smooth' });
    updateRulesPanel();
}

function resetEditState() {
    isEditMode = false;
    currentEditRoll = null;
    document.getElementById('rollNo').disabled = false;
    document.getElementById('formHeading').innerHTML = `<i class="fas fa-sliders"></i> Eligibility Parameters`;
    document.getElementById('submitBtn').innerText = "Process Matrix Pipeline";
}

function deleteRecord(roll) {
    deleteTargetRollId = roll;
    document.getElementById('customConfirmModal').style.display = 'flex';
}


document.getElementById('modalCancelBtn').addEventListener('click', () => {
    document.getElementById('customConfirmModal').style.display = 'none';
    deleteTargetRollId = null;
});

document.getElementById('modalConfirmBtn').addEventListener('click', () => {
    if (deleteTargetRollId) {
        const rollString = deleteTargetRollId.toString();
        historyData = historyData.filter(s => s.roll !== rollString);
        if (isEditMode && currentEditRoll === rollString) {
            resetEditState();
            document.getElementById('eligibilityForm').reset();
        }
        saveAndRefreshDOM();
        showToast("Record successfully expunged from matrix.", "error");
    }
    document.getElementById('customConfirmModal').style.display = 'none';
    deleteTargetRollId = null;
});


document.getElementById('customConfirmModal').addEventListener('click', (event) => {
    if (event.target.id === 'customConfirmModal') {
        document.getElementById('customConfirmModal').style.display = 'none';
        deleteTargetRollId = null;
    }
});


document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.getElementById('customConfirmModal').style.display === 'flex') {
        document.getElementById('customConfirmModal').style.display = 'none';
        deleteTargetRollId = null;
    }
});

function saveAndRefreshDOM() {
    localStorage.setItem('studentHistoryData', JSON.stringify(historyData));
    filterHistory();
    updateDashboardStats();
    updateChartAnalytics();
}


function filterHistory() {
    const searchQuery = document.getElementById('searchBox').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const branchFilter = document.getElementById('filterBranch').value;
    const activityFilter = document.getElementById('filterActivity').value;
    const sortValue = document.getElementById('sortControl').value;

    let processedRecords = historyData.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(searchQuery) || item.roll.toLowerCase().includes(searchQuery);
        const matchStatus = (statusFilter === "All" || item.status === statusFilter);
        const matchBranch = (branchFilter === "All" || item.branch === branchFilter);
        const matchActivity = (activityFilter === "All" || item.activity === activityFilter);

        return matchSearch && matchStatus && matchBranch && matchActivity;
    });

    
    if (sortValue === "nameAZ") processedRecords.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortValue === "nameZA") processedRecords.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortValue === "scoreHigh") processedRecords.sort((a, b) => b.score - a.score);
    else if (sortValue === "scoreLow") processedRecords.sort((a, b) => a.score - b.score);

    updateHistoryTable(processedRecords);
}

function updateHistoryTable(dataArray) {
    const tableBody = document.getElementById('historyTableBody');
    const tableElement = document.getElementById('auditLogTable');
    const emptyStateView = document.getElementById('emptyState');

    if (dataArray.length === 0) {
        tableBody.innerHTML = "";
        tableElement.style.display = 'none';
        emptyStateView.style.display = 'block';
        renderPaginationControls(0);
        return;
    }

    tableElement.style.display = 'table';
    emptyStateView.style.display = 'none';

    const totalPages = Math.ceil(dataArray.length / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedSlice = dataArray.slice(start, end);

    
    tableBody.innerHTML = paginatedSlice.map(item => {
        const colorTag = item.status === 'Eligible' ? 'var(--success)' : 'var(--destructive)';
        return `
            <tr>
                <td class="font-numeric" style="font-weight:600;">#${escapeHTML(item.roll)}</td>
                <td style="font-weight:500;">${escapeHTML(item.name)}</td>
                <td><span class="badge-pill">${escapeHTML(item.branch)}</span></td>
                <td>${escapeHTML(item.activity)}</td>
                <td class="font-numeric" style="font-weight:600;">${item.score}%</td>
                <td>
                    <span style="display:inline-flex; align-items:center; gap:6px; font-weight:600; color:${colorTag}">
                        <i class="fas fa-circle" style="font-size:0.5rem;"></i> ${item.status}
                    </span>
                </td>
                <td class="font-numeric" style="font-size: 0.82rem; color:var(--text-muted);">${item.timestamp || 'N/A'}</td>
                <td style="text-align:right;">
                    <button class="edit-btn" data-action="edit" data-roll="${escapeHTML(item.roll)}" title="Modify Logs"><i class="fas fa-pen-to-square"></i></button>
                    <button class="delete-btn" data-action="delete" data-roll="${escapeHTML(item.roll)}" title="Purge Log"><i class="fas fa-trash-can"></i></button>
                </td>
            </tr>
        `;
    }).join("");

    renderPaginationControls(dataArray.length);
}

function renderPaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;

    const pageNumbersContainer = document.getElementById('pageNumbers');
    pageNumbersContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.className = `page-num ${i === currentPage ? 'active' : ''}`;
        button.onclick = () => { currentPage = i; filterHistory(); };
        pageNumbersContainer.appendChild(button);
    }
}

function changePage(direction) {
    currentPage += direction;
    filterHistory();
}


function updateDashboardStats() {
    const totalRecords = historyData.length;
    const eligibleCount = historyData.filter(r => r.status === 'Eligible').length;
    const rejectedCount = totalRecords - eligibleCount;
    const calculatedAvg = totalRecords > 0 ? Math.round(historyData.reduce((acc, c) => acc + c.score, 0) / totalRecords) : 0;

    document.getElementById('stat-total').innerText = totalRecords;
    document.getElementById('stat-eligible').innerText = eligibleCount;
    document.getElementById('stat-rejected').innerText = rejectedCount;
    document.getElementById('stat-avg').innerText = `${calculatedAvg}%`;

    const insightTopScorer = document.getElementById('insight-top-scorer');
    const insightRate = document.getElementById('insight-rate');
    const insightBestBranch = document.getElementById('insight-best-branch');
    const insightActivePathway = document.getElementById('insight-active-pathway');

    if (totalRecords > 0) {
        const topScorerObj = [...historyData].sort((a, b) => b.score - a.score)[0];
        if (insightTopScorer) insightTopScorer.innerText = `${topScorerObj.name} (${topScorerObj.score}%)`;

        const rate = Math.round((eligibleCount / totalRecords) * 100);
        if (insightRate) insightRate.innerText = `${rate}%`;

        
        const branchScores = {}, branchCounts = {};
        historyData.forEach(s => {
            branchScores[s.branch] = (branchScores[s.branch] || 0) + s.score;
            branchCounts[s.branch] = (branchCounts[s.branch] || 0) + 1;
        });
        let bestBranch = "None", maxAvg = 0;
        for (let b in branchScores) {
            let avg = branchScores[b] / branchCounts[b];
            if (avg > maxAvg) { maxAvg = avg; bestBranch = b; }
        }
        if (insightBestBranch) insightBestBranch.innerText = `${bestBranch} (${Math.round(maxAvg)}%)`;

    
        const actMapping = {};
        historyData.forEach(s => actMapping[s.activity] = (actMapping[s.activity] || 0) + 1);
        let popularActivity = "None", maxActCount = 0;
        for (let a in actMapping) {
            if (actMapping[a] > maxActCount) { maxActCount = actMapping[a]; popularActivity = a; }
        }
        if (insightActivePathway) insightActivePathway.innerText = popularActivity;
    } else {
        if (insightTopScorer) insightTopScorer.innerText = "Await Evaluation";
        if (insightRate) insightRate.innerText = "0%";
        if (insightBestBranch) insightBestBranch.innerText = "N/A";
        if (insightActivePathway) insightActivePathway.innerText = "None Selected";
    }
}



function updateChartAnalytics() {
    const eligibleCount = historyData.filter(r => r.status === 'Eligible').length;
    const rejectedCount = historyData.length - eligibleCount;

    if (myPieChart) { myPieChart.destroy(); }

    const canvasEl = document.getElementById('analyticsChart');
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const legendEligible = document.getElementById('legendEligibleCount');
    const legendRejected = document.getElementById('legendRejectedCount');
    if (legendEligible) legendEligible.innerText = eligibleCount;
    if (legendRejected) legendRejected.innerText = rejectedCount;

    const greenToken = getComputedStyle(document.documentElement).getPropertyValue('--success').trim() || '#16a34a';
    const redToken = getComputedStyle(document.documentElement).getPropertyValue('--destructive').trim() || '#dc2626';
    const borderToken = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e2e8f0';

    if (eligibleCount === 0 && rejectedCount === 0) {
        myPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['No Records'],
                datasets: [{ data: [1], backgroundColor: [borderToken], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: "75%" }
        });
        return;
    }

    myPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Eligible', 'Rejected'],
            datasets: [{
                data: [eligibleCount, rejectedCount],
                backgroundColor: [greenToken, redToken],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            cutout: "75%"
        }
    });
}

function sanitizeForCSV(value) {
    const str = String(value ?? '');
    return /^[=+\-@]/.test(str) ? `'${str}` : str;
}

function exportToCSV() {
    if (historyData.length === 0) {
        showToast("No data inside logs matrix to extract!", "error");
        return;
    }
    let csvContent = "data:text/csv;charset=utf-8,Roll No,Name,Branch,Activity,Score,Status,Timestamp\n";
    historyData.forEach(r => {
        csvContent += `"${sanitizeForCSV(r.roll)}","${sanitizeForCSV(r.name)}","${r.branch}","${r.activity}","${r.score}%","${r.status}","${r.timestamp || 'N/A'}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Enterprise_Eligibility_Log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportToPDF() {
    if (historyData.length === 0) {
        showToast("No structured analytics records found to compile PDF!", "error");
        return;
    }
    showToast("Assembling corporate PDF report structural maps...", "success");

    const targetLogSection = document.getElementById('verificationLogSection');

    html2canvas(targetLogSection, { scale: 2, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdfDoc = new jsPDF('l', 'mm', 'a4');

        const componentWidth = 280;
        const componentHeight = (canvas.height * componentWidth) / canvas.width;

        pdfDoc.addImage(imgData, 'PNG', 8, 10, componentWidth, componentHeight);
        pdfDoc.save(`Compliance_Audit_Log_${Date.now()}.pdf`);
        showToast("Executive PDF report exported successfully!", "success");
    }).catch(err => {
        showToast("PDF Compile execution fault recorded.", "error");
    });
}

function showToast(message, type = "success") {
    const toastBox = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toastBox || !toastMessage) return;

    toastMessage.innerText = message;

    if (type === "error") {
        toastBox.style.backgroundColor = "var(--destructive)";
        toastBox.style.color = "#ffffff";
    } else {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        toastBox.style.backgroundColor = isDark ? "#ffffff" : "#0f172a";
        toastBox.style.color = isDark ? "#000000" : "#ffffff";
    }

    toastBox.classList.add('show');
    setTimeout(() => { toastBox.classList.remove('show'); }, 3000);
}