/* ══════════════════════════════════════════════
   Academia Dashboard - app.js
   ══════════════════════════════════════════════ */

const API_BASE = 'http://localhost:5000';
let TOKEN = '';
let USER_DATA = null;
let currentStudentPage = 1;
let currentStudentSearch = '';
let currentSortBy = 'name';
let currentSortOrder = 'ASC';

// ── DOM Helpers ──
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ── Toast Notifications ──
function showToast(message, type = 'info') {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ── API Fetch Wrapper ──
async function apiFetch(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    if (err.message.includes('Failed to fetch')) throw new Error('Tidak bisa terhubung ke API. Pastikan server berjalan di port 5000.');
    throw err;
  }
}

// ══════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════
// Tab switching
$$('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    $$('.auth-form').forEach(f => f.classList.remove('active'));
    $(`#${btn.dataset.tab}-form`).classList.add('active');
    $('#login-error').textContent = '';
    $('#register-error').textContent = '';
    $('#register-success').textContent = '';
  });
});

// Login
$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;
  $('#login-error').textContent = '';
  $('#login-submit-btn').disabled = true;
  try {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password })
    });
    TOKEN = data.token;
    USER_DATA = data.data;
    enterDashboard();
  } catch (err) {
    $('#login-error').textContent = err.message;
  } finally {
    $('#login-submit-btn').disabled = false;
  }
});

// Register
$('#register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    username: $('#register-username').value.trim(),
    email: $('#register-email').value.trim(),
    password: $('#register-password').value,
    role: $('#register-role').value
  };
  $('#register-error').textContent = '';
  $('#register-success').textContent = '';
  $('#register-submit-btn').disabled = true;
  try {
    await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(body) });
    $('#register-success').textContent = '✅ Berhasil daftar! Silakan masuk.';
    $('#register-form').reset();
  } catch (err) {
    $('#register-error').textContent = err.message;
  } finally {
    $('#register-submit-btn').disabled = false;
  }
});

// ── Enter Dashboard ──
function enterDashboard() {
  $('#login-screen').classList.remove('active');
  $('#dashboard-screen').classList.add('active');
  $('#user-name').textContent = USER_DATA.username;
  $('#user-role').textContent = USER_DATA.role;
  $('#user-avatar').textContent = USER_DATA.username.charAt(0).toUpperCase();

  // Show admin-only buttons
  if (USER_DATA.role === 'admin') {
    $('#add-student-btn').style.display = '';
    $('#add-course-btn').style.display = '';
    $('#add-enrollment-btn').style.display = '';
    $('#student-actions-header').style.display = '';
    $('#course-actions-header').style.display = '';
  }

  loadOverviewData();
}

// ── Logout ──
$('#logout-btn').addEventListener('click', () => {
  TOKEN = '';
  USER_DATA = null;
  $('#dashboard-screen').classList.remove('active');
  $('#login-screen').classList.add('active');
  $('#login-form').reset();
  showToast('Berhasil keluar', 'info');
});

// ══════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════
function navigateTo(page) {
  $$('.nav-item').forEach(n => n.classList.remove('active'));
  $(`.nav-item[data-page="${page}"]`).classList.add('active');
  $$('.page').forEach(p => p.classList.remove('active'));
  $(`#page-${page}`).classList.add('active');
  const titles = { overview: 'Overview', students: 'Mahasiswa', courses: 'Mata Kuliah', enrollments: 'Enrollment' };
  $('#page-title').textContent = titles[page] || page;
  // Load data
  if (page === 'students') loadStudents();
  if (page === 'courses') loadCourses();
  if (page === 'enrollments') loadEnrollmentOptions();
  // Close mobile sidebar
  $('#sidebar').classList.remove('open');
}
window.navigateTo = navigateTo;

$$('.nav-item').forEach(n => n.addEventListener('click', () => navigateTo(n.dataset.page)));

// Hamburger
$('#hamburger-btn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));

// ══════════════════════════════════════════════
// OVERVIEW
// ══════════════════════════════════════════════
async function loadOverviewData() {
  try {
    const [studentsData, coursesData] = await Promise.all([
      apiFetch('/api/students?limit=5&sortBy=created_at&sortOrder=DESC'),
      apiFetch('/api/courses')
    ]);

    $('#stat-students-count').textContent = studentsData.metadata.totalCount;
    $('#stat-courses-count').textContent = coursesData.data.courses.length;
    $('#stat-role').textContent = USER_DATA.role === 'admin' ? 'Admin' : 'Staff';

    // Recent Students
    const sList = $('#recent-students-list');
    sList.innerHTML = '';
    if (studentsData.data.students.length === 0) {
      sList.innerHTML = '<p style="color:var(--text-muted);padding:12px 0;">Belum ada data mahasiswa.</p>';
    } else {
      studentsData.data.students.forEach(s => {
        sList.innerHTML += `
          <div class="data-list-item">
            <div class="list-avatar">${s.name.charAt(0)}</div>
            <div class="list-info">
              <div class="name">${s.name}</div>
              <div class="sub">${s.nim} · ${s.major}</div>
            </div>
          </div>`;
      });
    }

    // Courses
    const cList = $('#recent-courses-list');
    cList.innerHTML = '';
    if (coursesData.data.courses.length === 0) {
      cList.innerHTML = '<p style="color:var(--text-muted);padding:12px 0;">Belum ada data mata kuliah.</p>';
    } else {
      coursesData.data.courses.slice(0, 5).forEach(c => {
        cList.innerHTML += `
          <div class="data-list-item">
            <div class="list-avatar" style="background:linear-gradient(135deg,#4ECDC4,#2db5ad);font-size:0.7rem;">${c.code.substring(0,2)}</div>
            <div class="list-info">
              <div class="name">${c.name}</div>
              <div class="sub">${c.code} · ${c.credits} SKS</div>
            </div>
          </div>`;
      });
    }

    $('#api-status').querySelector('span:last-child').textContent = 'API Connected';
    $('.status-dot').style.background = 'var(--accent-teal)';
  } catch (err) {
    showToast(err.message, 'error');
    $('#api-status').querySelector('span:last-child').textContent = 'API Error';
    $('.status-dot').style.background = 'var(--accent-red)';
  }
}

// ══════════════════════════════════════════════
// STUDENTS
// ══════════════════════════════════════════════
let searchTimeout;
$('#student-search').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentStudentSearch = e.target.value.trim();
    currentStudentPage = 1;
    loadStudents();
  }, 400);
});

$$('.sortable').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.dataset.sort;
    if (currentSortBy === field) {
      currentSortOrder = currentSortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      currentSortBy = field;
      currentSortOrder = 'ASC';
    }
    loadStudents();
  });
});

async function loadStudents() {
  const tbody = $('#students-tbody');
  tbody.innerHTML = `<tr><td colspan="6" class="loading-cell"><div class="spinner"></div> Memuat data...</td></tr>`;
  try {
    const params = new URLSearchParams({
      page: currentStudentPage, limit: 10,
      sortBy: currentSortBy, sortOrder: currentSortOrder
    });
    if (currentStudentSearch) params.set('search', currentStudentSearch);
    const data = await apiFetch(`/api/students?${params}`);
    const students = data.data.students;
    const isAdmin = USER_DATA.role === 'admin';

    if (students.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="loading-cell">Tidak ada data ditemukan.</td></tr>`;
    } else {
      tbody.innerHTML = students.map(s => `
        <tr>
          <td><strong>${s.nim}</strong></td>
          <td>${s.name}</td>
          <td style="color:var(--text-secondary)">${s.email}</td>
          <td style="color:var(--text-secondary)">${s.phone || '-'}</td>
          <td><span style="background:rgba(108,99,255,0.1);color:var(--accent-purple);padding:4px 10px;border-radius:20px;font-size:0.8rem;">${s.major}</span></td>
          ${isAdmin ? `<td>
            <button class="btn-icon" title="Edit" onclick="openEditStudentModal(${s.id})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button class="btn-icon danger" title="Hapus" onclick="deleteStudent(${s.id},'${s.name}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
          </td>` : ''}
        </tr>`).join('');
    }

    renderPagination(data.metadata);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="loading-cell" style="color:var(--accent-red);">Error: ${err.message}</td></tr>`;
  }
}

function renderPagination(meta) {
  const container = $('#students-pagination');
  if (meta.totalPages <= 1) { container.innerHTML = ''; return; }
  let html = `<button ${meta.page <= 1 ? 'disabled' : ''} onclick="goToStudentPage(${meta.page - 1})">← Prev</button>`;
  for (let i = 1; i <= meta.totalPages; i++) {
    html += `<button class="${i === meta.page ? 'active' : ''}" onclick="goToStudentPage(${i})">${i}</button>`;
  }
  html += `<button ${meta.page >= meta.totalPages ? 'disabled' : ''} onclick="goToStudentPage(${meta.page + 1})">Next →</button>`;
  container.innerHTML = html;
}
window.goToStudentPage = (p) => { currentStudentPage = p; loadStudents(); };

// ── Add Student Modal ──
$('#add-student-btn').addEventListener('click', () => openStudentModal());

function openStudentModal(student = null) {
  const isEdit = !!student;
  $('#modal-title').textContent = isEdit ? 'Edit Mahasiswa' : 'Tambah Mahasiswa';
  $('#modal-body').innerHTML = `
    <form id="student-modal-form">
      <div class="form-group"><label>NIM</label><input type="text" id="m-nim" value="${student?.nim || ''}" required></div>
      <div class="form-group"><label>Nama</label><input type="text" id="m-name" value="${student?.name || ''}" required></div>
      <div class="form-group"><label>Email</label><input type="email" id="m-email" value="${student?.email || ''}" required></div>
      <div class="form-group"><label>Telepon</label><input type="text" id="m-phone" value="${student?.phone || ''}"></div>
      <div class="form-group"><label>Jurusan</label><input type="text" id="m-major" value="${student?.major || ''}" required></div>
      <div class="form-error" id="student-modal-error"></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Simpan' : 'Tambah'}</button>
      </div>
    </form>`;
  openModal();
  $('#student-modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      nim: $('#m-nim').value.trim(), name: $('#m-name').value.trim(),
      email: $('#m-email').value.trim(), phone: $('#m-phone').value.trim(),
      major: $('#m-major').value.trim()
    };
    try {
      if (isEdit) {
        await apiFetch(`/api/students/${student.id}`, { method: 'PUT', body: JSON.stringify(body) });
        showToast('Mahasiswa berhasil diperbarui!', 'success');
      } else {
        await apiFetch('/api/students', { method: 'POST', body: JSON.stringify(body) });
        showToast('Mahasiswa berhasil ditambahkan!', 'success');
      }
      closeModal(); loadStudents(); loadOverviewData();
    } catch (err) {
      $('#student-modal-error').textContent = err.message;
    }
  });
}

window.openEditStudentModal = async (id) => {
  try {
    const data = await apiFetch(`/api/students/${id}`);
    openStudentModal(data.data.student);
  } catch (err) { showToast(err.message, 'error'); }
};

window.deleteStudent = async (id, name) => {
  if (!confirm(`Yakin ingin menghapus mahasiswa "${name}"?`)) return;
  try {
    await apiFetch(`/api/students/${id}`, { method: 'DELETE' });
    showToast('Mahasiswa berhasil dihapus', 'success');
    loadStudents(); loadOverviewData();
  } catch (err) { showToast(err.message, 'error'); }
};

// ══════════════════════════════════════════════
// COURSES
// ══════════════════════════════════════════════
async function loadCourses() {
  const tbody = $('#courses-tbody');
  tbody.innerHTML = `<tr><td colspan="4" class="loading-cell"><div class="spinner"></div> Memuat data...</td></tr>`;
  try {
    const data = await apiFetch('/api/courses');
    const courses = data.data.courses;
    const isAdmin = USER_DATA.role === 'admin';
    if (courses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="loading-cell">Belum ada mata kuliah.</td></tr>`;
    } else {
      tbody.innerHTML = courses.map(c => `
        <tr>
          <td><strong>${c.code}</strong></td>
          <td>${c.name}</td>
          <td><span style="background:rgba(78,205,196,0.1);color:var(--accent-teal);padding:4px 10px;border-radius:20px;font-size:0.85rem;">${c.credits} SKS</span></td>
          ${isAdmin ? `<td>
            <button class="btn-icon" title="Edit" onclick="openEditCourseModal(${c.id})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button class="btn-icon danger" title="Hapus" onclick="deleteCourse(${c.id},'${c.name}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
          </td>` : ''}
        </tr>`).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="loading-cell" style="color:var(--accent-red);">Error: ${err.message}</td></tr>`;
  }
}

$('#add-course-btn').addEventListener('click', () => openCourseModal());

function openCourseModal(course = null) {
  const isEdit = !!course;
  $('#modal-title').textContent = isEdit ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah';
  $('#modal-body').innerHTML = `
    <form id="course-modal-form">
      <div class="form-group"><label>Kode MK</label><input type="text" id="m-code" value="${course?.code || ''}" required></div>
      <div class="form-group"><label>Nama MK</label><input type="text" id="m-cname" value="${course?.name || ''}" required></div>
      <div class="form-group"><label>SKS (Credits)</label><input type="number" id="m-credits" value="${course?.credits || ''}" min="1" max="6" required></div>
      <div class="form-error" id="course-modal-error"></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Simpan' : 'Tambah'}</button>
      </div>
    </form>`;
  openModal();
  $('#course-modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = { code: $('#m-code').value.trim(), name: $('#m-cname').value.trim(), credits: parseInt($('#m-credits').value) };
    try {
      if (isEdit) {
        await apiFetch(`/api/courses/${course.id}`, { method: 'PUT', body: JSON.stringify(body) });
        showToast('Mata kuliah berhasil diperbarui!', 'success');
      } else {
        await apiFetch('/api/courses', { method: 'POST', body: JSON.stringify(body) });
        showToast('Mata kuliah berhasil ditambahkan!', 'success');
      }
      closeModal(); loadCourses(); loadOverviewData();
    } catch (err) { $('#course-modal-error').textContent = err.message; }
  });
}

window.openEditCourseModal = async (id) => {
  try {
    const data = await apiFetch(`/api/courses/${id}`);
    openCourseModal(data.data.course);
  } catch (err) { showToast(err.message, 'error'); }
};

window.deleteCourse = async (id, name) => {
  if (!confirm(`Yakin ingin menghapus mata kuliah "${name}"?`)) return;
  try {
    await apiFetch(`/api/courses/${id}`, { method: 'DELETE' });
    showToast('Mata kuliah berhasil dihapus', 'success');
    loadCourses(); loadOverviewData();
  } catch (err) { showToast(err.message, 'error'); }
};

// ══════════════════════════════════════════════
// ENROLLMENTS
// ══════════════════════════════════════════════
async function loadEnrollmentOptions() {
  try {
    const data = await apiFetch('/api/students?limit=100');
    const sel = $('#enrollment-student-select');
    sel.innerHTML = '<option value="">-- Pilih Mahasiswa --</option>';
    data.data.students.forEach(s => {
      sel.innerHTML += `<option value="${s.id}">${s.name} (${s.nim})</option>`;
    });
  } catch (err) { showToast(err.message, 'error'); }
}

$('#enrollment-lookup-btn').addEventListener('click', async () => {
  const studentId = $('#enrollment-student-select').value;
  if (!studentId) { showToast('Pilih mahasiswa terlebih dahulu', 'error'); return; }
  try {
    const data = await apiFetch(`/api/courses/student/${studentId}`);
    const student = data.data.student;
    const courses = data.data.courses;
    $('#enrollment-student-name').textContent = `Mata Kuliah: ${student.name} (${student.nim})`;
    const tbody = $('#enrollment-courses-tbody');
    if (courses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="loading-cell">Belum ada mata kuliah terdaftar.</td></tr>`;
    } else {
      tbody.innerHTML = courses.map(c => `
        <tr>
          <td><strong>${c.code}</strong></td>
          <td>${c.name}</td>
          <td>${c.credits} SKS</td>
          <td><span style="background:rgba(255,230,109,0.1);color:var(--accent-yellow);padding:4px 10px;border-radius:20px;font-size:0.8rem;">${c.semester}</span></td>
          <td style="color:var(--text-secondary)">${c.enrollment_date ? new Date(c.enrollment_date).toLocaleDateString('id-ID') : '-'}</td>
        </tr>`).join('');
    }
    $('#enrollment-results-card').style.display = '';
  } catch (err) { showToast(err.message, 'error'); }
});

$('#add-enrollment-btn').addEventListener('click', async () => {
  try {
    const [studentsData, coursesData] = await Promise.all([
      apiFetch('/api/students?limit=100'),
      apiFetch('/api/courses')
    ]);
    $('#modal-title').textContent = 'Enrollment Baru';
    $('#modal-body').innerHTML = `
      <form id="enroll-modal-form">
        <div class="form-group">
          <label>Mahasiswa</label>
          <select id="m-student-id" required>
            <option value="">-- Pilih --</option>
            ${studentsData.data.students.map(s => `<option value="${s.id}">${s.name} (${s.nim})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Mata Kuliah</label>
          <select id="m-course-id" required>
            <option value="">-- Pilih --</option>
            ${coursesData.data.courses.map(c => `<option value="${c.id}">${c.name} (${c.code})</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Tanggal Pendaftaran</label><input type="date" id="m-enroll-date" required></div>
        <div class="form-group"><label>Semester</label><input type="text" id="m-semester" placeholder="Genap 2025/2026" required></div>
        <div class="form-error" id="enroll-modal-error"></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Daftarkan</button>
        </div>
      </form>`;
    openModal();
    $('#enroll-modal-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = {
        student_id: parseInt($('#m-student-id').value),
        course_id: parseInt($('#m-course-id').value),
        enrollment_date: $('#m-enroll-date').value,
        semester: $('#m-semester').value.trim()
      };
      try {
        await apiFetch('/api/courses/enroll', { method: 'POST', body: JSON.stringify(body) });
        showToast('Enrollment berhasil!', 'success');
        closeModal();
      } catch (err) { $('#enroll-modal-error').textContent = err.message; }
    });
  } catch (err) { showToast(err.message, 'error'); }
});

// ══════════════════════════════════════════════
// MODAL HELPERS
// ══════════════════════════════════════════════
function openModal() { $('#modal-overlay').classList.add('active'); }
function closeModal() { $('#modal-overlay').classList.remove('active'); }
window.closeModal = closeModal;
$('#modal-close').addEventListener('click', closeModal);
$('#modal-overlay').addEventListener('click', (e) => { if (e.target === $('#modal-overlay')) closeModal(); });
