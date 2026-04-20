document.addEventListener('DOMContentLoaded', () => {
    const ROWS_PER_PAGE = 15;
    let currentPage = 1;
    let activeFilterCol = 'all';
    let sortColumn = null;
    let sortDirection = 'asc';

    // Collect all rows from the static HTML
    const tableBody = document.getElementById('employeeTableBody');
    const allRows = Array.from(tableBody.querySelectorAll('tr'));

    // Build data array from DOM rows
    let employees = allRows.map(tr => {
        const cells = tr.querySelectorAll('td');
        return {
            firstName:  cells[0].textContent.trim(),
            lastName:   cells[1].textContent.trim(),
            employeeId: cells[2].textContent.trim(),
            fbCode:     cells[3].textContent.trim(),
            status:     cells[4].querySelector('span').textContent.trim(),
            el: tr
        };
    });

    // ── Render ────────────────────────────────────────────────────────────────
    function render(data) {
        const start = (currentPage - 1) * ROWS_PER_PAGE;
        const paginated = data.slice(start, start + ROWS_PER_PAGE);

        tableBody.innerHTML = '';
        paginated.forEach(emp => {
            const statusClass = emp.status.toLowerCase() === 'active' ? 'status-active' : 'status-inactive';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${emp.firstName}</td>
                <td>${emp.lastName}</td>
                <td>${emp.employeeId}</td>
                <td>${emp.fbCode}</td>
                <td><span class="${statusClass}">${emp.status}</span></td>
                <td class="action-icon"><i class="fa-regular fa-copy copy-btn" title="Copy FB Code"></i></td>
                <td class="action-icon"><i class="fa-solid fa-rotate-right refresh-btn" title="Refresh"></i></td>
            `;

            // Copy FB code to clipboard
            tr.querySelector('.copy-btn').addEventListener('click', () => {
                navigator.clipboard.writeText(emp.fbCode).then(() => {
                    const icon = tr.querySelector('.copy-btn');
                    icon.classList.replace('fa-copy', 'fa-check');
                    setTimeout(() => icon.classList.replace('fa-check', 'fa-copy'), 1500);
                });
            });

            // Refresh — visual feedback only
            tr.querySelector('.refresh-btn').addEventListener('click', (e) => {
                const icon = e.currentTarget;
                icon.style.animation = 'spin 0.6s linear';
                setTimeout(() => icon.style.animation = '', 700);
            });

            tableBody.appendChild(tr);
        });

        updateRecordsCount(data.length, start, paginated.length);
        renderPagination(data.length);
    }

    // ── Records count ─────────────────────────────────────────────────────────
    function updateRecordsCount(total, start, shown) {
        const el = document.getElementById('recordsCount');
        if (!el) return;
        const end = start + shown;
        el.textContent = total === 0
            ? 'No records found'
            : `Showing ${start + 1}-${end} of ${total} records`;
    }

    // ── Pagination ────────────────────────────────────────────────────────────
    function renderPagination(total) {
        const totalPages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));
        const container = document.getElementById('pagination');
        if (!container) return;

        container.innerHTML = '';

        // Prev button
        const prev = btn('<i class="fa-solid fa-chevron-left"></i>', 'page-btn', () => {
            if (currentPage > 1) { currentPage--; applyFilters(); }
        });
        if (currentPage === 1) prev.disabled = true;
        container.appendChild(prev);

        // Page buttons
        for (let p = 1; p <= totalPages; p++) {
            const pb = btn(p, 'page-btn' + (p === currentPage ? ' active' : ''), () => {
                currentPage = p; applyFilters();
            });
            pb.dataset.page = p;
            container.appendChild(pb);
        }

        // Next button
        const next = btn('<i class="fa-solid fa-chevron-right"></i>', 'page-btn', () => {
            if (currentPage < totalPages) { currentPage++; applyFilters(); }
        });
        if (currentPage === totalPages) next.disabled = true;
        container.appendChild(next);
    }

    function btn(html, cls, onClick) {
        const b = document.createElement('button');
        b.className = cls;
        b.innerHTML = html;
        b.addEventListener('click', onClick);
        return b;
    }

    // ── Search & Filter ───────────────────────────────────────────────────────
    function applyFilters() {
        const term = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
        let filtered = employees;

        if (term) {
            filtered = employees.filter(emp => {
                if (activeFilterCol === 'all') {
                    return emp.firstName.toLowerCase().includes(term) ||
                           emp.lastName.toLowerCase().includes(term) ||
                           emp.employeeId.toLowerCase().includes(term) ||
                           emp.fbCode.toLowerCase().includes(term) ||
                           emp.status.toLowerCase().includes(term);
                }
                return (emp[activeFilterCol] || '').toLowerCase().includes(term);
            });
        }

        if (sortColumn) {
            filtered = [...filtered].sort((a, b) => {
                const va = (a[sortColumn] || '').toLowerCase();
                const vb = (b[sortColumn] || '').toLowerCase();
                return sortDirection === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            });
        }

        render(filtered);
    }

    // Search input
    document.getElementById('searchInput')?.addEventListener('input', () => {
        currentPage = 1;
        applyFilters();
    });

    // Search dropdown toggle
    const searchDropdownToggle = document.getElementById('searchDropdownToggle');
    const searchFilterMenu = document.getElementById('searchFilterMenu');

    searchDropdownToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        searchFilterMenu.classList.toggle('show');
    });

    document.querySelectorAll('.filter-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.filter-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            activeFilterCol = opt.dataset.col;
            searchFilterMenu.classList.remove('show');
            currentPage = 1;
            applyFilters();
        });
    });

    // ── Sorting ───────────────────────────────────────────────────────────────
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (sortColumn === col) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = col;
                sortDirection = 'asc';
            }
            document.querySelectorAll('.sortable').forEach(h => h.classList.remove('asc', 'desc'));
            th.classList.add(sortDirection);
            currentPage = 1;
            applyFilters();
        });
    });

    // ── Export ────────────────────────────────────────────────────────────────
    document.querySelector('.export-toggle')?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelector('.export-menu').classList.toggle('show');
    });

    document.querySelectorAll('.export-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.dataset.format;
            const headers = ['First Name', 'Last Name', 'Employee ID', 'FB Post Sharing Code', 'Status'];
            const rows = employees.map(e => [e.firstName, e.lastName, e.employeeId, e.fbCode, e.status]);

            if (format === 'csv') {
                const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
                download(new Blob([csv], {type: 'text/csv'}), 'employees.csv');
            } else if (format === 'excel') {
                if (window.XLSX) {
                    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
                    XLSX.writeFile(wb, 'employees.xlsx');
                } else {
                    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
                    download(new Blob([csv], {type: 'application/vnd.ms-excel'}), 'employees.xls');
                }
            } else if (format === 'pdf') {
                if (window.jspdf) {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    doc.text('Employee List', 14, 16);
                    let y = 26;
                    [headers, ...rows].forEach(row => {
                        doc.text(row.join(' | '), 14, y);
                        y += 8;
                        if (y > 280) { doc.addPage(); y = 16; }
                    });
                    doc.save('employees.pdf');
                } else {
                    alert('PDF library not loaded.');
                }
            }
            document.querySelector('.export-menu').classList.remove('show');
        });
    });

    function download(blob, filename) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
    }

    // ── Close dropdowns on outside click ─────────────────────────────────────
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.export-dropdown')) {
            document.querySelector('.export-menu')?.classList.remove('show');
        }
        if (!e.target.closest('.search-bar')) {
            searchFilterMenu?.classList.remove('show');
        }
    });

    // ── Initial render ────────────────────────────────────────────────────────
    applyFilters();
});
