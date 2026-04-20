// Inline SVG data URIs used as placeholder images
const catPhoto = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130">
  <rect width="130" height="130" fill="#f5a89a"/>
  <ellipse cx="65" cy="95" rx="42" ry="35" fill="#e89070"/>
  <ellipse cx="65" cy="70" rx="30" ry="28" fill="#f5b59e"/>
  <polygon points="42,50 48,30 55,52" fill="#f5b59e"/>
  <polygon points="88,50 82,30 75,52" fill="#f5b59e"/>
  <polygon points="44,48 48,36 53,50" fill="#f8c9b5"/>
  <polygon points="86,48 82,36 77,50" fill="#f8c9b5"/>
  <circle cx="55" cy="70" r="4" fill="#1a1a1a"/>
  <circle cx="75" cy="70" r="4" fill="#1a1a1a"/>
  <circle cx="56" cy="69" r="1.5" fill="#fff"/>
  <circle cx="76" cy="69" r="1.5" fill="#fff"/>
  <path d="M 65 78 Q 63 82 60 82" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>
  <path d="M 65 78 Q 67 82 70 82" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>
  <polygon points="62,76 65,80 68,76" fill="#d07070"/>
  <line x1="40" y1="73" x2="52" y2="73" stroke="#fff" stroke-width="0.8"/>
  <line x1="40" y1="76" x2="52" y2="75" stroke="#fff" stroke-width="0.8"/>
  <line x1="78" y1="73" x2="90" y2="73" stroke="#fff" stroke-width="0.8"/>
  <line x1="78" y1="75" x2="90" y2="76" stroke="#fff" stroke-width="0.8"/>
</svg>
`);

const signatureImg = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60">
  <path d="M 20 35 Q 30 15, 40 30 Q 48 42, 55 30 Q 62 18, 72 32 Q 78 40, 85 28 L 90 40"
        stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M 50 42 Q 55 48, 60 44" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>
</svg>
`);

// Mock employee data
const employees = [
    {
        id: 'UPSE005',
        fullName: 'Max Fernando',
        contactNumber: '098098098',
        idNumber: 'UPSE005',
        position: 'Data Entry Specialist',
        email: 'odjdsg@gmail.com',
        birthdate: '09/04/2005',
        status: 'Active',
        address: 'Tetuan, Zamboanga City',
        emergencyContact: '0987656879',
        emergencyNumber: '0990989089',
        photo: catPhoto,
        signature: signatureImg
    },
    {
        id: 'UPSE006',
        fullName: 'Anna Reyes',
        contactNumber: '0912345678',
        idNumber: 'UPSE006',
        position: 'HR Coordinator',
        email: 'anna.reyes@gmail.com',
        birthdate: '05/15/1998',
        status: 'Active',
        address: 'Guiwan, Zamboanga City',
        emergencyContact: '0911223344',
        emergencyNumber: '0933445566',
        photo: catPhoto,
        signature: signatureImg
    },
    {
        id: 'UPSE007',
        fullName: 'John Dela Cruz',
        contactNumber: '0923456789',
        idNumber: 'UPSE007',
        position: 'Software Developer',
        email: 'john.dc@gmail.com',
        birthdate: '12/22/1995',
        status: 'On Leave',
        address: 'Tumaga, Zamboanga City',
        emergencyContact: '0922334455',
        emergencyNumber: '0944556677',
        photo: catPhoto,
        signature: signatureImg
    },
    {
        id: 'UPSE008',
        fullName: 'Maria Santos',
        contactNumber: '0934567890',
        idNumber: 'UPSE008',
        position: 'Accountant',
        email: 'maria.s@gmail.com',
        birthdate: '03/10/1990',
        status: 'Active',
        address: 'Putik, Zamboanga City',
        emergencyContact: '0933445566',
        emergencyNumber: '0955667788',
        photo: catPhoto,
        signature: signatureImg
    }
];

// State
let currentEmployee = null;
let originalData = null;
let isEditMode = false;

// DOM
const searchInput = document.getElementById('searchInput');
const dropdownBtn = document.getElementById('dropdownBtn');
const dropdownList = document.getElementById('dropdownList');
const emptyState = document.getElementById('emptyState');
const detailsView = document.getElementById('detailsView');
const actions = document.getElementById('actions');
const editBtn = document.getElementById('editBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const modeLabel = document.getElementById('modeLabel');
const employeePhoto = document.getElementById('employeePhoto');
const employeeSignature = document.getElementById('employeeSignature');

const fieldIds = [
    'fullName', 'contactNumber', 'idNumber', 'position', 'email',
    'birthdate', 'status', 'address', 'emergencyContact', 'emergencyNumber'
];

// Render dropdown list
function renderDropdown(filter = '') {
    const query = filter.trim().toLowerCase();
    const filtered = employees.filter(e =>
        e.fullName.toLowerCase().includes(query) ||
        e.idNumber.toLowerCase().includes(query)
    );

    dropdownList.innerHTML = '';
    if (filtered.length === 0) {
        const li = document.createElement('li');
        li.className = 'no-result';
        li.textContent = 'No employees found';
        dropdownList.appendChild(li);
        return;
    }
    filtered.forEach(emp => {
        const li = document.createElement('li');
        li.textContent = `${emp.fullName} — ${emp.idNumber}`;
        li.addEventListener('mousedown', (e) => {
            e.preventDefault();
            selectEmployee(emp);
        });
        dropdownList.appendChild(li);
    });
}

function openDropdown() {
    renderDropdown(searchInput.value);
    dropdownList.classList.add('open');
}

function closeDropdown() {
    dropdownList.classList.remove('open');
}

// Populate card with employee data
function populateFields(emp) {
    fieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = emp[id] || '';
    });
    employeePhoto.src = emp.photo;
    employeeSignature.src = emp.signature;
}

// Select employee → view mode
function selectEmployee(emp) {
    currentEmployee = emp;
    originalData = { ...emp };
    searchInput.value = emp.fullName;
    closeDropdown();

    emptyState.classList.add('hidden');
    detailsView.classList.remove('hidden');
    actions.classList.remove('hidden');

    populateFields(emp);
    setViewMode();
}

// View mode
function setViewMode() {
    isEditMode = false;
    fieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
    });
    modeLabel.textContent = 'View mode';
    editBtn.classList.remove('active');
    saveBtn.disabled = true;
    detailsView.classList.remove('edit-mode');
}

// Edit mode
function setEditMode() {
    isEditMode = true;
    fieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
    });
    modeLabel.textContent = 'Edit mode';
    editBtn.classList.add('active');
    saveBtn.disabled = false;
    detailsView.classList.add('edit-mode');
    const firstField = document.getElementById('fullName');
    if (firstField) firstField.focus();
}

// Save changes
function saveChanges() {
    if (!currentEmployee) return;
    fieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) currentEmployee[id] = el.value;
    });
    // Reflect name change in search input
    searchInput.value = currentEmployee.fullName;
    originalData = { ...currentEmployee };
    setViewMode();
}

// Cancel edit → revert to original
function cancelEdit() {
    if (isEditMode && originalData) {
        populateFields(originalData);
        currentEmployee = { ...originalData };
        setViewMode();
    } else {
        // In view mode, Cancel clears selection
        clearSelection();
    }
}

function clearSelection() {
    currentEmployee = null;
    originalData = null;
    searchInput.value = '';
    detailsView.classList.add('hidden');
    actions.classList.add('hidden');
    emptyState.classList.remove('hidden');
}

// Event listeners
searchInput.addEventListener('focus', openDropdown);
searchInput.addEventListener('input', () => {
    if (searchInput.value.trim() === '') {
        if (currentEmployee) clearSelection();
        renderDropdown('');
        dropdownList.classList.add('open');
        searchInput.focus();
        return;
    }
    renderDropdown(searchInput.value);
    if (!dropdownList.classList.contains('open')) {
        dropdownList.classList.add('open');
    }
});

dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dropdownList.classList.contains('open')) {
        closeDropdown();
    } else {
        openDropdown();
        searchInput.focus();
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
        closeDropdown();
    }
});

editBtn.addEventListener('click', () => {
    if (!currentEmployee) return;
    if (isEditMode) {
        // Toggle back to view without saving (discard)
        cancelEdit();
    } else {
        setEditMode();
    }
});

cancelBtn.addEventListener('click', cancelEdit);
saveBtn.addEventListener('click', saveChanges);

// Replace image (photo + signature) — only works in edit mode
const photoBox = document.getElementById('photoBox');
const signatureBox = document.getElementById('signatureBox');
const photoInput = document.getElementById('photoInput');
const signatureInput = document.getElementById('signatureInput');

function readImage(file, onLoad) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => onLoad(e.target.result);
    reader.readAsDataURL(file);
}

photoBox.addEventListener('click', () => {
    if (isEditMode) photoInput.click();
});

signatureBox.addEventListener('click', () => {
    if (isEditMode) signatureInput.click();
});

photoInput.addEventListener('change', (e) => {
    readImage(e.target.files[0], (dataUrl) => {
        employeePhoto.src = dataUrl;
        if (currentEmployee) currentEmployee.photo = dataUrl;
    });
    photoInput.value = '';
});

signatureInput.addEventListener('change', (e) => {
    readImage(e.target.files[0], (dataUrl) => {
        employeeSignature.src = dataUrl;
        if (currentEmployee) currentEmployee.signature = dataUrl;
    });
    signatureInput.value = '';
});
