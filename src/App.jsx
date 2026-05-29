import React, { useState, useEffect, useRef } from 'react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- FIREBASE CONFIGURATION ---
const providedConfig = {
  apiKey: "AIzaSyCvcqO7y1htSWGokmJJblNKVmCGvG1PmvI",
  authDomain: "proker-manajemen.firebaseapp.com",
  projectId: "proker-manajemen",
  storageBucket: "proker-manajemen.firebasestorage.app",
  messagingSenderId: "997892726056",
  appId: "1:997892726056:web:1136c9f1e61b1104a7041d"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : providedConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'proker-manajemen-app';

// Data awal akun/user untuk dikelola oleh Kepala Sekolah
const INITIAL_USERS = [
  { id: 'usr-1', username: 'kesiswaan', password: 'password', name: 'Tim Kesiswaan', role: 'Kesiswaan', status: 'Aktif' },
  { id: 'usr-2', username: 'kurikulum', password: 'password', name: 'Tim Kurikulum', role: 'Kurikulum', status: 'Aktif' },
  { id: 'usr-3', username: 'hubin', password: 'password', name: 'Tim Hubin', role: 'Hubin', status: 'Aktif' },
  { id: 'usr-4', username: 'kaprog_tkj', password: 'password', name: 'Kaprog TKJ', role: 'Kaprog TKJ', status: 'Aktif' },
  { id: 'usr-5', username: 'kaprog_tkr', password: 'password', name: 'Kaprog TKR', role: 'Kaprog TKR', status: 'Aktif' },
  { id: 'usr-6', username: 'kaprog_mp', password: 'password', name: 'Kaprog MP', role: 'Kaprog MP', status: 'Aktif' },
  { id: 'usr-7', username: 'kepsek', password: 'admin', name: 'Kepala Sekolah', role: 'Kepala Sekolah', status: 'Aktif' },
  { id: 'usr-8', username: 'yayasan', password: 'password', name: 'Yayasan', role: 'Yayasan', status: 'Aktif' }
];

// Data awal program (Dikosongkan untuk rilis produksi)
const INITIAL_PROGRAMS = [];

// --- DYNAMIC ROLE THEMES ---
const ROLE_THEMES = {
  'Kesiswaan': {
    mesh: ['bg-indigo-300/30', 'bg-purple-200/30', 'bg-pink-100/30', 'bg-blue-100/40'],
    primary: 'from-indigo-500 to-purple-600',
    accent: 'bg-indigo-50 text-indigo-700',
    icon: 'text-indigo-600',
    ring: 'shadow-[0_0_12px_rgba(99,102,241,0.4)]',
    pulse: 'bg-indigo-500',
    focus: 'focus:border-indigo-500/50'
  },
  'Kurikulum': {
    mesh: ['bg-emerald-300/30', 'bg-teal-200/30', 'bg-green-100/40', 'bg-cyan-100/40'],
    primary: 'from-emerald-500 to-teal-500',
    accent: 'bg-emerald-50 text-emerald-700',
    icon: 'text-emerald-600',
    ring: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    pulse: 'bg-emerald-500',
    focus: 'focus:border-emerald-500/50'
  },
  'Hubin': {
    mesh: ['bg-blue-300/30', 'bg-cyan-200/30', 'bg-sky-100/40', 'bg-indigo-100/40'],
    primary: 'from-blue-500 to-cyan-500',
    accent: 'bg-blue-50 text-blue-700',
    icon: 'text-blue-600',
    ring: 'shadow-[0_0_12px_rgba(59,130,246,0.4)]',
    pulse: 'bg-blue-500',
    focus: 'focus:border-blue-500/50'
  },
  'Kaprog TKJ': {
    mesh: ['bg-cyan-300/30', 'bg-indigo-200/30', 'bg-blue-100/40', 'bg-slate-100/40'],
    primary: 'from-cyan-500 to-indigo-600',
    accent: 'bg-cyan-50 text-cyan-700',
    icon: 'text-cyan-600',
    ring: 'shadow-[0_0_12px_rgba(6,182,212,0.4)]',
    pulse: 'bg-cyan-500',
    focus: 'focus:border-cyan-500/50'
  },
  'Kaprog TKR': {
    mesh: ['bg-orange-300/30', 'bg-amber-200/30', 'bg-red-100/40', 'bg-yellow-100/40'],
    primary: 'from-orange-500 to-amber-600',
    accent: 'bg-orange-50 text-orange-700',
    icon: 'text-orange-600',
    ring: 'shadow-[0_0_12px_rgba(249,115,22,0.4)]',
    pulse: 'bg-orange-500',
    focus: 'focus:border-orange-500/50'
  },
  'Kaprog MP': {
    mesh: ['bg-pink-300/30', 'bg-rose-200/30', 'bg-purple-100/40', 'bg-fuchsia-100/40'],
    primary: 'from-pink-500 to-fuchsia-600',
    accent: 'bg-pink-50 text-pink-700',
    icon: 'text-pink-600',
    ring: 'shadow-[0_0_12px_rgba(236,72,153,0.4)]',
    pulse: 'bg-pink-500',
    focus: 'focus:border-pink-500/50'
  },
  'Kepala Sekolah': {
    mesh: ['bg-amber-300/40', 'bg-yellow-200/50', 'bg-orange-100/50', 'bg-red-100/40'],
    primary: 'from-amber-500 to-orange-500',
    accent: 'bg-amber-50 text-amber-700',
    icon: 'text-amber-600',
    ring: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    pulse: 'bg-amber-500',
    focus: 'focus:border-amber-500/50'
  },
  'Yayasan': {
    mesh: ['bg-slate-300/40', 'bg-gray-300/40', 'bg-zinc-200/40', 'bg-neutral-200/40'],
    primary: 'from-slate-600 to-gray-700',
    accent: 'bg-slate-100 text-slate-800',
    icon: 'text-slate-700',
    ring: 'shadow-[0_0_12px_rgba(100,116,139,0.4)]',
    pulse: 'bg-slate-500',
    focus: 'focus:border-slate-500/50'
  },
  'default': {
    mesh: ['bg-indigo-300/30', 'bg-purple-200/30', 'bg-pink-100/30', 'bg-blue-100/40'],
    primary: 'from-indigo-500 to-purple-600',
    accent: 'bg-indigo-50 text-indigo-700',
    icon: 'text-indigo-600',
    ring: 'shadow-[0_0_12px_rgba(99,102,241,0.4)]',
    pulse: 'bg-indigo-500',
    focus: 'focus:border-indigo-500/50'
  }
};

const getClayStyles = (theme) => ({
  card: "bg-white/80 backdrop-blur-md border border-white rounded-[24px] shadow-[6px_10px_30px_rgba(148,163,184,0.08),inset_-4px_-4px_8px_rgba(148,163,184,0.03),inset_4px_4px_8px_rgba(255,255,255,0.9)]",
  cardSmall: "bg-white/80 backdrop-blur-md border border-white rounded-[20px] shadow-[4px_8px_20px_rgba(148,163,184,0.08),inset_-3px_-3px_6px_rgba(148,163,184,0.03),inset_3px_3px_6px_rgba(255,255,255,0.9)]",
  input: `w-full px-5 py-4 bg-slate-100/50 border border-slate-200/30 rounded-[18px] text-[14px] font-medium text-slate-800 outline-none shadow-[inset_2px_2px_4px_rgba(148,163,184,0.08)] ${theme.focus} focus:bg-white transition-all placeholder:text-slate-400`,
  btnPrimary: `px-6 py-3.5 bg-gradient-to-r ${theme.primary} text-white font-bold rounded-[18px] shadow-[0_4px_12px_rgba(99,102,241,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2`,
  btnSecondary: "px-6 py-3.5 bg-white border border-slate-200/80 text-slate-600 font-bold rounded-[18px] shadow-sm hover:bg-slate-50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 text-[13px]",
  btnSuccess: "px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-[18px] shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2",
  btnDanger: "px-6 py-3.5 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold rounded-[18px] shadow-[0_4px_12px_rgba(225,29,72,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2",
  navItemActive: `${theme.accent} shadow-sm border border-indigo-100/30`,
  navItemInactive: "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 transition-all"
});

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRole, setCurrentRole] = useState('');
  const [users, setUsers] = useState([]);
  const [programs, setPrograms] = useState([]);

  // Login Form & Role Modal
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Form & UI States
  const [newTitle, setNewTitle] = useState('');
  const [newProgramType, setNewProgramType] = useState('Bulanan');
  const [newWeeklySchedule, setNewWeeklySchedule] = useState('Seminggu Sekali');
  const [newDate, setNewDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [reportingProgramId, setReportingProgramId] = useState(null);
  const [reportDesc, setReportDesc] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [reportPhoto, setReportPhoto] = useState('');
  const [viewingReportId, setViewingReportId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);

  // Mode Print (PDF Export)
  const [isPrintMode, setIsPrintMode] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedFilterDivisi, setSelectedFilterDivisi] = useState('Semua');

  // Live Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  // States untuk Manajemen Akun Kepsek
  const [manageName, setManageName] = useState('');
  const [manageUsername, setManageUsername] = useState('');
  const [manageRole, setManageRole] = useState('Kaprog TKJ');
  const [managePassword, setManagePassword] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);

  // State Khusus Untuk Pengaturan Identitas Sekolah
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [schoolName, setSchoolName] = useState('SMK Bina Siswa Mandiri Limbangan');
  const [headmasterName, setHeadmasterName] = useState('Dr. Ahmad Fauzi, M.Pd.');
  const [headmasterNIP, setHeadmasterNIP] = useState('19800101 200501 1 001');

  const theme = ROLE_THEMES[currentRole] || ROLE_THEMES['default'];
  const clay = getClayStyles(theme);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const ClayBadge = ({ children, color, className = "" }) => {
    const styles = {
      gray: 'bg-slate-200/50 text-slate-700 border border-slate-300/30',
      blue: 'bg-blue-100/50 text-blue-700 border border-blue-200/30',
      green: 'bg-emerald-100/50 text-emerald-700 border border-emerald-200/30',
      yellow: 'bg-amber-100/50 text-amber-700 border border-amber-200/30',
      indigo: 'bg-indigo-100/50 text-indigo-700 border border-indigo-200/30',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-sm ${styles[color]} ${className}`}>
        {children}
      </span>
    );
  };

  // --- FIREBASE LISTENERS ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase Auth Error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;

    const programsRef = collection(db, 'artifacts', appId, 'public', 'data', 'programs');
    const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'school_info');

    const unsubscribePrograms = onSnapshot(programsRef, (snapshot) => {
      if (snapshot.empty) {
        INITIAL_PROGRAMS.forEach(prog => {
          setDoc(doc(programsRef, prog.id), prog).catch(err => console.error(err));
        });
      } else {
        const loadedPrograms = snapshot.docs.map(doc => doc.data());
        setPrograms(loadedPrograms.sort((a,b) => b.id.localeCompare(a.id)));
      }
    });

    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      if (snapshot.empty) {
        INITIAL_USERS.forEach(user => {
          setDoc(doc(usersRef, user.id), user).catch(err => console.error(err));
        });
      } else {
        const loadedUsers = snapshot.docs.map(doc => doc.data());
        setUsers(loadedUsers);
      }
    });

    const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.logoUrl) setSchoolLogo(data.logoUrl);
        if (data.schoolName) setSchoolName(data.schoolName);
        if (data.headmasterName) setHeadmasterName(data.headmasterName);
        if (data.headmasterNIP) setHeadmasterNIP(data.headmasterNIP);
      }
    });

    return () => {
      unsubscribePrograms();
      unsubscribeUsers();
      unsubscribeSettings();
    };
  }, [firebaseUser]);

  // --- KAMERA INTERAKTIF ---
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error: ", err);
      showNotification("Gagal mengakses Kamera. Pastikan izin kamera diaktifkan.", "error");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      let quality = 0.7;
      let base64 = canvas.toDataURL('image/jpeg', quality);

      while (base64.length > 400000 && quality > 0.1) {
        quality -= 0.1;
        base64 = canvas.toDataURL('image/jpeg', quality);
      }

      setReportPhoto(base64);
      stopCamera();
      showNotification("Foto berhasil ditangkap!");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // --- AUTHENTICATION HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    const targetUser = users.find(u => u.username.toLowerCase().trim() === loginUsername.toLowerCase().trim());
    
    if (targetUser && targetUser.status === 'Nonaktif') {
      setLoginError('Akun Anda dinonaktifkan oleh Kepala Sekolah.');
      return;
    }

    if (targetUser && loginPassword === targetUser.password) {
      setCurrentRole(targetUser.role);
      setIsAuthenticated(true);
      setLoginError('');
      setActiveTab('dashboard');
      showNotification(`Selamat datang, ${targetUser.name}!`);
      setLoginUsername(''); setLoginPassword('');
    } else {
      setLoginError('Username atau kata sandi salah.');
    }
  };

  const handleSelectRoleFromModal = (roleName) => {
    const matchedUser = users.find(u => u.role === roleName);
    if (matchedUser) {
      if (matchedUser.status === 'Nonaktif') {
        showNotification('Peran ini dinonaktifkan oleh Kepala Sekolah.', 'error');
        return;
      }
      setLoginUsername(matchedUser.username);
      setLoginPassword('');
      setIsRoleModalOpen(false);
      showNotification(`Akun ${roleName} dipilih. Silakan ketik kata sandi Anda.`);
    } else {
      showNotification(`Belum ada akun terdaftar untuk peran ${roleName}.`, 'error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentRole('');
    setIsSidebarCollapsed(false);
    setSelectedFilterDivisi('Semua');
  };

  const getProgramRef = (id) => doc(db, 'artifacts', appId, 'public', 'data', 'programs', id);
  const getUserRef = (id) => doc(db, 'artifacts', appId, 'public', 'data', 'users', id);

  // --- CRUD FUNCTIONS ---
  const handleCreateProgram = (e) => {
    e.preventDefault();
    
    let finalDate = newDate;
    if (newProgramType === 'Harian') finalDate = 'Setiap Hari';
    if (newProgramType === 'Mingguan') finalDate = newWeeklySchedule;

    if (!newTitle || !finalDate || !newDescription) {
      showNotification('Mohon lengkapi seluruh field pengajuan!', 'error'); return;
    }
    const newProgramId = `prog-${Date.now()}`;
    const newProgram = {
      id: newProgramId, title: newTitle, proposer: currentRole, proposedDate: finalDate, programType: newProgramType,
      description: newDescription, budget: Number(newBudget) || 0, status: 'pending_approval',
      approvals: { kepsek: false }, report: null
    };
    
    setDoc(getProgramRef(newProgramId), newProgram)
      .then(() => {
        showNotification('Pengajuan berhasil dikirim.');
        setNewTitle(''); setNewDate(''); setNewDescription(''); setNewBudget(''); setNewProgramType('Bulanan'); setNewWeeklySchedule('Seminggu Sekali');
        setActiveTab('antrean_pengajuan');
      })
      .catch(err => showNotification('Gagal mengirim pengajuan.', 'error'));
  };

  const handleApproveProposal = (id) => {
    const progToApprove = programs.find(p => p.id === id);
    if (progToApprove) {
      setDoc(getProgramRef(id), { ...progToApprove, approvals: { kepsek: true }, status: 'approved_pelaksanaan' })
        .then(() => showNotification('Proposal disetujui.'))
        .catch(err => showNotification('Gagal menyetujui proposal.', 'error'));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 300 * 1024) {
        showNotification('Ukuran foto terlalu besar! Maksimal 300KB.', 'error');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!manageName || !manageUsername || !managePassword) {
      showNotification('Lengkapi seluruh formulir kelola akun.', 'error');
      return;
    }

    if (editingUserId) {
      const userToEdit = users.find(u => u.id === editingUserId);
      if (userToEdit) {
        setDoc(getUserRef(editingUserId), {
          ...userToEdit,
          name: manageName,
          username: manageUsername.toLowerCase().trim(),
          role: manageRole,
          password: managePassword
        })
        .then(() => {
          showNotification(`Akun ${manageName} berhasil diperbarui.`);
          setEditingUserId(null);
          setManageName(''); setManageUsername(''); setManagePassword(''); setManageRole('Kaprog TKJ');
        })
        .catch(err => showNotification('Gagal memperbarui akun.', 'error'));
      }
    } else {
      const isUsernameExists = users.some(u => u.username.toLowerCase() === manageUsername.toLowerCase().trim());
      if (isUsernameExists) {
        showNotification('Username sudah digunakan.', 'error');
        return;
      }
      
      const newUserId = `usr-${Date.now()}`;
      const newUser = {
        id: newUserId,
        username: manageUsername.toLowerCase().trim(),
        password: managePassword,
        name: manageName,
        role: manageRole,
        status: 'Aktif'
      };
      
      setDoc(getUserRef(newUserId), newUser)
        .then(() => {
          showNotification(`Akun baru ${manageName} berhasil dibuat.`);
          setManageName(''); setManageUsername(''); setManagePassword(''); setManageRole('Kaprog TKJ');
        })
        .catch(err => showNotification('Gagal membuat akun.', 'error'));
    }
  };

  const handleEditUserClick = (user) => {
    setEditingUserId(user.id);
    setManageName(user.name);
    setManageUsername(user.username);
    setManagePassword(user.password);
    setManageRole(user.role);
  };

  const toggleUserStatus = (id) => {
    const userToToggle = users.find(u => u.id === id);
    if (userToToggle) {
      const nextStatus = userToToggle.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
      setDoc(getUserRef(id), { ...userToToggle, status: nextStatus })
        .then(() => showNotification(`Status akun ${userToToggle.name} diubah menjadi ${nextStatus}.`))
        .catch(err => showNotification('Gagal mengubah status akun.', 'error'));
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) {
        showNotification('Ukuran logo maksimal 500KB.', 'error');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'school_info'), { logoUrl: base64 }, { merge: true })
          .then(() => showNotification('Logo sekolah berhasil diperbarui.'))
          .catch(err => showNotification('Gagal memperbarui logo.', 'error'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSchoolInfo = (e) => {
    e.preventDefault();
    setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'school_info'), {
      schoolName, headmasterName, headmasterNIP
    }, { merge: true })
    .then(() => showNotification('Identitas sekolah berhasil diperbarui.'))
    .catch(err => showNotification('Gagal memperbarui identitas.', 'error'));
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!reportDesc || !reportDate) {
      showNotification('Lengkapi deskripsi dan tanggal pelaksanaan.', 'error'); return;
    }
    const progToReport = programs.find(p => p.id === reportingProgramId);
    if (progToReport) {
      setDoc(getProgramRef(reportingProgramId), {
        ...progToReport, 
        status: 'reported', 
        report: { 
          description: reportDesc, 
          reportDate: reportDate, 
          photoUrl: reportPhoto || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80', 
          approvedByKepsek: false 
        }
      })
      .then(() => {
        showNotification('Laporan terkirim.');
        setReportingProgramId(null); setReportDesc(''); setReportDate(''); setReportPhoto('');
      })
      .catch(err => showNotification('Gagal mengirim laporan.', 'error'));
    }
  };

  const handleApproveReport = (id) => {
    const progToApprove = programs.find(p => p.id === id);
    if (progToApprove) {
      setDoc(getProgramRef(id), { 
        ...progToApprove, 
        status: 'completed', 
        report: { ...progToApprove.report, approvedByKepsek: true } 
      })
      .then(() => {
        showNotification('Laporan diverifikasi.');
        setViewingReportId(null);
      })
      .catch(err => showNotification('Gagal memverifikasi laporan.', 'error'));
    }
  };

  const handleRejectReport = (id) => {
    const progToReject = programs.find(p => p.id === id);
    if (progToReject) {
      setDoc(getProgramRef(id), { ...progToReject, status: 'approved_pelaksanaan', report: null })
        .then(() => {
          showNotification('Laporan dikembalikan untuk direvisi.', 'error');
          setViewingReportId(null);
        })
        .catch(err => showNotification('Gagal menolak laporan.', 'error'));
    }
  };

  const filterByStatus = (statusList) => {
    let filtered = programs.filter(prog => statusList.includes(prog.status));
    if (['Kesiswaan', 'Kurikulum', 'Hubin', 'Kaprog TKJ', 'Kaprog TKR', 'Kaprog MP'].includes(currentRole)) {
      filtered = filtered.filter(prog => prog.proposer === currentRole);
    } 
    else if (['Kepala Sekolah', 'Yayasan'].includes(currentRole) && selectedFilterDivisi !== 'Semua') {
      filtered = filtered.filter(prog => prog.proposer === selectedFilterDivisi);
    }
    return filtered;
  };

  const isProposerRole = ['Kesiswaan', 'Kurikulum', 'Hubin', 'Kaprog TKJ', 'Kaprog TKR', 'Kaprog MP'].includes(currentRole);
  const isManagement = ['Kepala Sekolah', 'Yayasan'].includes(currentRole);

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const rows = event.target.result.split('\n');
      let importCount = 0;
      
      rows.forEach((row, index) => {
        if (index === 0) return;
        const columns = row.trim().split(','); 
        if (columns.length >= 4) {
          const newId = `prog-import-${Date.now()}-${index}`;
          const importedProg = {
            id: newId,
            title: columns[0].trim(), proposedDate: columns[1].trim(), budget: Number(columns[2].trim()) || 0,
            description: columns[3].trim(), proposer: currentRole, status: 'pending_approval', approvals: { kepsek: false }, report: null
          };
          setDoc(getProgramRef(newId), importedProg).catch(err => console.error(err));
          importCount++;
        }
      });
      
      if (importCount > 0) {
        showNotification(`${importCount} program diimpor ke database.`);
        setActiveTab('antrean_pengajuan');
      }
    };
    reader.readAsText(file); e.target.value = '';
  };

  const downloadTemplate = () => {
    const headers = "Nama Program,Tanggal (YYYY-MM-DD),Anggaran,Deskripsi\n";
    const sample = "Pentas Seni Terpadu,2026-10-20,15000000,Kegiatan pentas seni akhir tahun ajaran\n";
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Template_Pengajuan.csv'; a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setViewingReportId(null);
    setReportingProgramId(null);
    setIsMobileMenuOpen(false);
  };

  // --- RENDERING VIEWS ---

  // 1. View Laporan Print Out (Tampil Jika Tombol Ekspor Ditekan)
  if (isPrintMode) {
    const completedPrograms = filterByStatus(['completed']);
    const pendingPrograms = programs.filter(p => p.status !== 'completed' && (selectedFilterDivisi === 'Semua' || p.proposer === selectedFilterDivisi));

    return (
      <div className="bg-slate-200 min-h-screen pb-10 w-full overflow-y-auto print:bg-white print:p-0">
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body, html { background-color: white !important; margin: 0; padding: 0; }
            @page { size: A4 portrait; margin: 15mm; }
            .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
          }
        `}</style>
        
        <div className="no-print max-w-[210mm] mx-auto bg-white p-4 rounded-xl shadow-md my-6 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-4 z-50 border border-slate-300">
          <div className="flex items-center gap-4 w-full sm:w-auto">
             <p className="text-sm font-bold text-slate-700 hidden sm:block">Pratinjau Laporan</p>
             <select
                value={selectedFilterDivisi}
                onChange={(e) => setSelectedFilterDivisi(e.target.value)}
                className="bg-slate-100 border border-slate-300 text-indigo-700 text-[13px] font-bold rounded-lg px-3 py-2 outline-none w-full sm:w-auto cursor-pointer"
              >
                <option value="Semua">Semua Divisi</option>
                <option value="Kesiswaan">Kesiswaan</option>
                <option value="Kurikulum">Kurikulum</option>
                <option value="Hubin">Hubin</option>
                <option value="Kaprog TKJ">Kaprog TKJ</option>
                <option value="Kaprog TKR">Kaprog TKR</option>
                <option value="Kaprog MP">Kaprog MP</option>
              </select>
          </div>
          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <button onClick={() => setIsPrintMode(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-200 transition-all">Kembali</button>
            <button onClick={() => window.print()} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Download PDF
            </button>
          </div>
        </div>

        <div className="max-w-[210mm] mx-auto bg-white text-black font-serif shadow-2xl print:shadow-none p-10 md:p-12 min-h-[297mm] border border-slate-300 print:border-none">
          <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-5 mb-8">
            <div className="w-24 h-24 shrink-0 overflow-hidden flex items-center justify-center">
               {schoolLogo ? <img src={schoolLogo} className="w-full h-full object-contain" alt="Logo" /> : <div className="w-20 h-20 bg-slate-200 rounded-full"></div>}
            </div>
            <div className="text-center flex-1 px-4">
              <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">{schoolName}</h1>
              <p className="text-[13px] font-medium text-slate-700 mt-1 uppercase">Sistem Manajemen Program Kerja Digital (BSM SmartPro)</p>
              <p className="text-[11px] font-bold text-slate-500 mt-1 italic">#BeraniBeda #SantunTerampilUnggul</p>
            </div>
          </div>
          
          <h2 className="text-center font-bold text-lg mb-8 underline underline-offset-4 uppercase">
            Laporan Evaluasi & Pelaksanaan Program Kerja <br/>
            <span className="text-[14px] font-medium text-slate-600">({selectedFilterDivisi === 'Semua' ? 'Keseluruhan Divisi' : `Divisi: ${selectedFilterDivisi}`})</span>
          </h2>
          
          <div className="space-y-10">
            <section>
              <h3 className="font-bold text-md mb-4 bg-slate-100 p-2.5 border-l-4 border-slate-800 uppercase tracking-wide">A. Rincian Program Terlaksana</h3>
              {completedPrograms.length === 0 ? (
                <p className="text-sm text-slate-500 italic px-4">Belum ada program yang selesai terlaksana.</p>
              ) : (
                <div className="space-y-6">
                  {completedPrograms.map((prog, idx) => (
                    <div key={prog.id} className="flex flex-col sm:flex-row gap-6 border-b border-slate-300 pb-6 print-break-inside-avoid px-2">
                       <div className="flex-1">
                         <h4 className="font-bold text-[15px] uppercase">{idx+1}. {prog.title}</h4>
                         <table className="mt-2 text-[13px] text-slate-800 w-full mb-3">
                           <tbody>
                             <tr><td className="w-28 font-semibold py-1 align-top">Divisi Pengusul</td><td className="w-4 align-top">:</td><td className="py-1 align-top">{prog.proposer}</td></tr>
                             <tr><td className="font-semibold py-1 align-top">Jenis Program</td><td className="align-top">:</td><td className="py-1 align-top">{prog.programType || 'Bulanan'}</td></tr>
                             <tr><td className="font-semibold py-1 align-top">Waktu Laporan</td><td className="align-top">:</td><td className="py-1 align-top">{prog.report?.reportDate}</td></tr>
                           </tbody>
                         </table>
                         <div className="text-[13px] bg-slate-50 p-3 border border-slate-200 rounded">
                           <p className="font-bold mb-1 underline">Evaluasi Kegiatan:</p>
                           <p className="whitespace-pre-line text-justify leading-relaxed">{prog.report?.description}</p>
                         </div>
                       </div>
                       
                       {prog.report?.photoUrl && (
                         <div className="sm:w-56 shrink-0 flex flex-col items-center justify-start mt-2 sm:mt-0">
                            <div className="border-4 border-slate-200 p-1 w-full bg-white shadow-sm">
                              <img src={prog.report.photoUrl} className="w-full h-auto object-cover aspect-video" alt="Dokumentasi Kegiatan"/>
                            </div>
                            <p className="text-[10px] text-center mt-2 text-slate-600 font-bold italic">Lampiran: Bukti Dokumentasi Kegiatan</p>
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              )}
            </section>
            
            <section className="print-break-inside-avoid">
              <h3 className="font-bold text-md mb-4 bg-slate-100 p-2.5 border-l-4 border-slate-800 uppercase tracking-wide">B. Daftar Program Belum Terlaksana / Berjalan</h3>
              {pendingPrograms.length === 0 ? (
                 <p className="text-sm text-slate-500 italic px-4">Semua program telah diselesaikan.</p>
              ) : (
                <table className="w-full text-[12px] border-collapse border border-slate-400">
                  <thead className="bg-slate-200 text-slate-900 font-bold uppercase">
                    <tr>
                      <th className="border border-slate-400 p-2.5 w-10 text-center">No</th>
                      <th className="border border-slate-400 p-2.5 text-left">Nama Program</th>
                      <th className="border border-slate-400 p-2.5 text-left w-28">Divisi</th>
                      <th className="border border-slate-400 p-2.5 text-left w-24">Jenis</th>
                      <th className="border border-slate-400 p-2.5 text-left w-32">Status Terkini</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPrograms.map((prog, idx) => (
                      <tr key={prog.id} className="text-slate-800">
                        <td className="border border-slate-400 p-2.5 text-center">{idx+1}</td>
                        <td className="border border-slate-400 p-2.5 font-bold">{prog.title}</td>
                        <td className="border border-slate-400 p-2.5">{prog.proposer}</td>
                        <td className="border border-slate-400 p-2.5">{prog.programType || '-'}</td>
                        <td className="border border-slate-400 p-2.5 font-medium italic">
                          {prog.status === 'pending_approval' ? 'Menunggu Izin Kepsek' : prog.status === 'approved_pelaksanaan' ? 'Masa Pelaksanaan' : 'Menunggu Review Kepsek'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
          
          <div className="mt-20 flex justify-end print-break-inside-avoid">
            <div className="text-center w-72">
                <p className="text-[14px]">Ditandatangani pada: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="font-bold mt-1 text-[14px]">Kepala Sekolah,</p>
                <div className="h-24"></div> 
                <p className="font-bold text-[15px] underline underline-offset-4">{headmasterName}</p>
                <p className="text-[13px] mt-0.5">NIP. {headmasterNIP}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. View Halaman Login
  if (!isAuthenticated) {
    const defaultTheme = ROLE_THEMES['default'];
    return (
      <div className="min-h-screen bg-[#F6F8FC] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-200 selection:text-indigo-900 z-0 w-full">
        <div className={`absolute top-[-10%] left-[-5%] w-[45%] h-[45%] ${defaultTheme.mesh[0]} rounded-full blur-[110px] -z-10 mix-blend-multiply pointer-events-none`}></div>
        <div className={`absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] ${defaultTheme.mesh[1]} rounded-full blur-[100px] -z-10 mix-blend-multiply pointer-events-none`}></div>
        
        <style>{`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
          .animate-fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-scale-in { animation: scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          .animate-float { animation: float 3s ease-in-out infinite; }
        `}</style>

        {notification && (
          <div className="absolute top-4 right-4 z-50 animate-fade-in-up">
            <div className={`${clay.cardSmall} !bg-white/95 !backdrop-blur-xl px-5 py-4 flex items-center gap-4`}>
              <div className={`p-2 rounded-xl border ${notification.type === 'error' ? 'bg-red-50 text-red-500 border-red-200/50' : 'bg-emerald-50 text-emerald-500 border-emerald-200/50'}`}>
                {notification.type === 'error' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                )}
              </div>
              <p className="text-[14px] font-bold text-slate-800">{notification.message}</p>
            </div>
          </div>
        )}

        {isRoleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/25 backdrop-blur-md">
            <div className={`${clay.card} p-8 max-w-3xl w-full text-center relative overflow-hidden animate-scale-in`}>
              <button type="button" onClick={() => setIsRoleModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-2">Pilih Peran Workspace</h3>
              <p className="text-sm font-medium text-slate-500 mb-8">Pilih peran di bawah untuk mengisi username secara otomatis. Anda tetap memerlukan kata sandi unik.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 justify-center items-center">
                {[
                  { name: 'Kesiswaan', theme: ROLE_THEMES['Kesiswaan'], color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
                  { name: 'Kurikulum', theme: ROLE_THEMES['Kurikulum'], color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
                  { name: 'Hubin', theme: ROLE_THEMES['Hubin'], color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
                  { name: 'Kaprog TKJ', theme: ROLE_THEMES['Kaprog TKJ'], color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
                  { name: 'Kaprog TKR', theme: ROLE_THEMES['Kaprog TKR'], color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
                  { name: 'Kaprog MP', theme: ROLE_THEMES['Kaprog MP'], color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200' },
                  { name: 'Kepala Sekolah', theme: ROLE_THEMES['Kepala Sekolah'], color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
                  { name: 'Yayasan', theme: ROLE_THEMES['Yayasan'], color: 'text-slate-700', bg: 'bg-slate-100 border-slate-300' }
                ].map((roleItem, index) => (
                  <button key={index} type="button" onClick={() => handleSelectRoleFromModal(roleItem.name)} className="flex flex-col items-center justify-center p-3 rounded-full w-24 h-24 sm:w-28 sm:h-28 mx-auto hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/60 shadow-md group animate-float" style={{ backgroundColor: roleItem.bg.split(' ')[0], animationDelay: `${index * 0.05}s` }}>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-md mb-1.5 ${roleItem.color} group-hover:scale-115 transition-transform`}>
                       <span className="font-extrabold text-xs sm:text-base">{roleItem.name.charAt(0)}</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-700 tracking-tight leading-none text-center truncate w-full">{roleItem.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={`${clay.card} p-8 md:p-12 w-full max-w-md animate-fade-in-up`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md mb-5 overflow-hidden">
              {schoolLogo ? (
                <img src={schoolLogo} alt="Logo Sekolah" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-snug">BSM SmartPro</h1>
            <p className="text-sm font-bold text-indigo-600 mt-1">Sistem Manajemen Program Kerja Digital</p>
            <p className="text-[11px] font-semibold text-slate-500 mt-2 tracking-wide">#BeraniBeda #SantunTerampilUnggul</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[12px] font-bold text-center shadow-inner animate-fade-in-up">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-2 uppercase tracking-wide">Username Akun / Divisi</label>
              <input type="text" placeholder="Masukkan username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} required className={clay.input} />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-2 uppercase tracking-wide">Kata Sandi</label>
              <input type="password" placeholder="••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className={clay.input} />
            </div>
            
            <div className="flex flex-col gap-3 pt-2">
              <button type="submit" className={`w-full ${clay.btnPrimary}`}>
                Masuk ke Sistem
              </button>
              
              <button 
                type="button" 
                onClick={() => setIsRoleModalOpen(true)}
                className="w-full py-3 bg-white border border-slate-200 text-indigo-600 font-bold rounded-[20px] shadow-sm hover:scale-[1.01] hover:bg-slate-50 active:scale-95 text-center text-[13px] flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                Pilih Peran Workspace
              </button>
            </div>
          </form>

          <div className="mt-8 pt-5 border-t border-slate-200/50 text-center">
             <p className="text-[10px] text-slate-400 font-medium">&copy; {new Date().getFullYear()} {schoolName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  // Menghitung statistik untuk Dashboard
  const pendingCount = filterByStatus(['pending_approval']).length;
  const pelaksanaanCount = filterByStatus(['approved_pelaksanaan', 'reported']).length;
  const completedCount = filterByStatus(['completed']).length;
  const totalProgramsCount = pendingCount + pelaksanaanCount + completedCount;

  // --- MAIN VIEW PORTAL ---
  return (
    <div className="flex h-screen bg-[#F6F8FC] p-2 md:p-4 gap-4 font-sans antialiased selection:bg-indigo-200 selection:text-indigo-900 overflow-hidden relative z-0 w-full">
      
      {/* BACKGROUND MESH GRADIENT */}
      <div className={`absolute top-[-10%] left-[-5%] w-[45%] h-[45%] ${theme.mesh[0]} rounded-full blur-[110px] -z-10 mix-blend-multiply pointer-events-none transition-colors duration-[1.5s] ease-in-out`}></div>
      <div className={`absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] ${theme.mesh[1]} rounded-full blur-[100px] -z-10 mix-blend-multiply pointer-events-none transition-colors duration-[1.5s] ease-in-out`}></div>
      <div className={`absolute top-[25%] left-[35%] w-[35%] h-[35%] ${theme.mesh[2]} rounded-full blur-[120px] -z-10 mix-blend-multiply pointer-events-none transition-colors duration-[1.5s] ease-in-out`}></div>
      <div className={`absolute top-[65%] left-[-5%] w-[30%] h-[30%] ${theme.mesh[3]} rounded-full blur-[90px] -z-10 mix-blend-multiply pointer-events-none transition-colors duration-[1.5s] ease-in-out`}></div>

      {/* GLOBAL KEYFRAME ANIMASI INTERNET */}
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .stagger-1 { animation-delay: 0.04s; opacity: 0; }
        .stagger-2 { animation-delay: 0.08s; opacity: 0; }
        .stagger-3 { animation-delay: 0.12s; opacity: 0; }
        .stagger-4 { animation-delay: 0.16s; opacity: 0; }
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.15); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* SIDEBAR DENGAN TRANSISI SANGAT RINGAN BERBASIS GPU */}
      <aside 
        className={`fixed lg:relative top-2 md:top-0 bottom-2 md:bottom-0 left-2 md:left-0 z-40 transition-all duration-200 ease-out flex flex-col overflow-hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'
        } ${
          isSidebarCollapsed ? 'lg:w-0 lg:opacity-0 lg:-ml-2 lg:pointer-events-none' : 'lg:w-[280px] lg:opacity-100'
        }`}
      >
        <div className={`w-[280px] min-w-[280px] h-full flex flex-col overflow-hidden ${clay.card}`}>
          {/* Logo & Profil */}
          <div className="p-6 border-b border-slate-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${theme.primary} flex items-center justify-center shadow-md shrink-0 overflow-hidden`}>
                {schoolLogo ? (
                  <img src={schoolLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-extrabold text-slate-800 tracking-tight text-[16px] leading-tight truncate">BSM SmartPro</span>
                <span className="font-bold text-indigo-600 text-[10px] truncate">#BeraniBeda</span>
              </div>
              <button className="ml-auto lg:hidden text-slate-500 p-1" onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="bg-white/60 p-4 rounded-[20px] shadow-[inset_2px_2px_4px_rgba(148,163,184,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] border border-white/50 flex items-center gap-3">
               <div className={`w-10 h-10 rounded-[14px] bg-white flex items-center justify-center ${theme.icon} font-extrabold text-lg shadow-sm border border-slate-100`}>
                  {currentRole.charAt(0)}
               </div>
               <div className="overflow-hidden">
                  <p className="text-[14px] font-extrabold text-slate-800 leading-tight truncate">{currentRole}</p>
                  <p className={`text-[11px] font-bold ${theme.icon} flex items-center gap-1 mt-0.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${theme.pulse} ${theme.ring} animate-pulse`}></span> Terhubung
                  </p>
               </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2.5 overflow-y-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z' },
              ...(isProposerRole ? [{ id: 'buat_pengajuan', label: 'Ajukan Program', icon: 'M12 4v16m8-8H4' }] : []),
              { id: 'antrean_pengajuan', label: 'Persetujuan', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', count: filterByStatus(['pending_approval']).length },
              { id: 'pelaksanaan', label: 'Pelaksanaan', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', count: filterByStatus(['approved_pelaksanaan', 'reported']).length },
              { id: 'selesai', label: 'Arsip Selesai', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
              ...(currentRole === 'Kepala Sekolah' ? [
                { id: 'pengaturan_sekolah', label: 'Identitas Sekolah', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
                { id: 'kelola_akun', label: 'Kelola Akun', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
              ] : [])
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[20px] text-[13px] font-bold transition-all ${
                  activeTab === item.id ? clay.navItemActive : clay.navItemInactive
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} /></svg>
                  {item.label}
                </div>
                {item.count > 0 && (
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7),inset_-1px_-1px_2px_rgba(0,0,0,0.05)] ${
                    activeTab === item.id ? `${theme.accent}` : 'bg-slate-200 text-slate-500'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Tombol Logout */}
          <div className="p-4 border-t border-slate-200/50 mt-auto">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-[20px] transition-all shadow-inner border border-rose-100 hover:scale-[1.02] active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Keluar Sesi
            </button>
            <div className="mt-4 text-center">
              <p className="text-[9px] text-slate-400 font-medium">&copy; {new Date().getFullYear()} {schoolName}.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative h-full gap-4 md:gap-5 overflow-hidden transition-all duration-200 ease-out">
        
        {/* Top Header - Glass Card */}
        <header className={`${clay.cardSmall} h-20 px-6 md:px-8 flex justify-between items-center z-10 flex-shrink-0 w-full transition-all duration-200 ease-out`}>
          <div className="flex items-center gap-4">
            
            {/* BUTTON HAMBURGER DESKTOP & MOBILE */}
            <button 
              className="hidden lg:flex text-slate-600 p-2.5 bg-slate-100/50 hover:bg-slate-200/70 rounded-[14px] transition-all active:scale-95 shadow-inner border border-slate-200/50"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Tampilkan Menu" : "Sembunyikan Menu"}
            >
              <svg className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {isSidebarCollapsed ? <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />}
              </svg>
            </button>

            <button className="lg:hidden text-slate-600 p-2 bg-slate-100 hover:bg-slate-200 rounded-[14px] transition-colors shadow-sm" onClick={() => setIsMobileMenuOpen(true)}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            <h2 className="font-extrabold text-[16px] md:text-[18px] text-slate-800 tracking-tight ml-2">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'buat_pengajuan' && 'Ajukan Program Baru'}
              {activeTab === 'antrean_pengajuan' && 'Antrean Persetujuan'}
              {activeTab === 'pelaksanaan' && 'Manajemen Pelaksanaan'}
              {activeTab === 'selesai' && 'Arsip Dokumen Selesai'}
              {activeTab === 'kelola_akun' && 'Manajemen Hak Akses Akun'}
              {activeTab === 'pengaturan_sekolah' && 'Pengaturan Identitas Sistem'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
             <div className={`px-4 py-2 ${theme.accent} border border-white/40 rounded-xl shadow-sm font-bold text-[12px] hidden sm:block transition-colors duration-1000`}>
               Mode: {currentRole}
             </div>
             {/* TOMBOL CETAK LAPORAN - HANYA UNTUK KEPALA SEKOLAH */}
             {currentRole === 'Kepala Sekolah' && (
               <button onClick={() => setIsPrintMode(true)} className="hidden sm:flex ml-2 px-4 py-2 bg-slate-800 text-white font-bold rounded-xl shadow-md hover:bg-slate-700 active:scale-95 transition-all text-[12px] items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  Cetak PDF
               </button>
             )}
          </div>
        </header>

        {/* Scrollable Container */}
        <main className="flex-1 overflow-y-auto pb-10 px-1 md:px-0 scroll-smooth">
          <div className="max-w-[1100px] mx-auto space-y-6 transition-all duration-300">

            {/* FILTER DIVISI (KHUSUS KEPALA SEKOLAH/YAYASAN) */}
            {isManagement && activeTab !== 'kelola_akun' && activeTab !== 'pengaturan_sekolah' && !reportingProgramId && (
              <div className={`${clay.cardSmall} p-4 flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-in-up border border-indigo-200/50`}>
                <span className="text-[13px] font-bold text-slate-600 flex items-center gap-2 shrink-0 px-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  Filter Tinjauan Divisi:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full scrollbar-hide">
                  {['Semua', 'Kesiswaan', 'Kurikulum', 'Hubin', 'Kaprog TKJ', 'Kaprog TKR', 'Kaprog MP'].map(divisi => (
                    <button
                      key={divisi}
                      onClick={() => setSelectedFilterDivisi(divisi)}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all duration-300 ${
                        selectedFilterDivisi === divisi
                          ? 'bg-indigo-600 text-white shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3),inset_-2px_-2px_4px_rgba(0,0,0,0.2)]'
                          : 'bg-white/60 text-slate-500 hover:bg-white hover:text-indigo-600 shadow-sm border border-slate-200/50'
                      }`}
                    >
                      {divisi === 'Semua' ? 'Semua Divisi' : divisi}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- DASHBOARD --- */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* TOMBOL CETAK PDF KHUSUS MOBILE TAMPIL DI SINI */}
                {currentRole === 'Kepala Sekolah' && (
                  <div className="sm:hidden mb-2 animate-fade-in-up">
                    <button onClick={() => setIsPrintMode(true)} className="w-full py-3 bg-slate-800 text-white font-bold rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:scale-95 transition-all text-[13px] flex items-center justify-center gap-2">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                       Cetak / Eksport Laporan Akhir (PDF)
                    </button>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {[
                    { label: 'Total Program', value: totalProgramsCount, icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4', color: theme.icon, bg: theme.accent },
                    { label: 'Persetujuan', value: pendingCount, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-amber-600', bg: 'bg-amber-50 border border-amber-100' },
                    { label: 'Pelaksanaan', value: pelaksanaanCount, icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'text-blue-600', bg: 'bg-blue-50 border border-blue-100' },
                    { label: 'Terlaksana', value: completedCount, icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', color: 'text-emerald-600', bg: 'bg-emerald-50 border border-emerald-100' }
                  ].map((stat, i) => (
                    <div key={i} className={`${clay.cardSmall} p-6 flex flex-col items-center text-center justify-center animate-fade-in-up stagger-${i+1}`}>
                      <div className={`p-4 rounded-[20px] shadow-sm ${stat.bg} ${stat.color} mb-4 transition-colors duration-1000`}>
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} /></svg>
                      </div>
                      <p className="text-4xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm">{stat.value}</p>
                      <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress Bar Container */}
                <div className={`${clay.card} p-6 md:p-8 animate-fade-in-up stagger-3`}>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-2">
                    <div>
                      <h3 className="text-[18px] font-bold text-slate-800 tracking-tight">Status Progres Aktual</h3>
                      <p className="text-[13px] font-medium text-slate-500 mt-1">Distribusi program kerja berjalan saat ini.</p>
                    </div>
                  </div>
                  
                  {/* Glass Progress Bar */}
                  <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-[inset_2px_2px_6px_rgba(148,163,184,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.8)] p-1 border border-slate-200/50">
                    <div style={{ width: `${(pendingCount / (totalProgramsCount || 1)) * 100}%` }} className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full shadow-[inset_0px_-2px_4px_rgba(0,0,0,0.1),inset_0px_2px_4px_rgba(255,255,255,0.3)] transition-all duration-1000"></div>
                    <div style={{ width: `${(pelaksanaanCount / (totalProgramsCount || 1)) * 100}%` }} className={`h-full bg-gradient-to-r ${theme.primary} rounded-full shadow-[inset_0px_-2px_4px_rgba(0,0,0,0.1),inset_0px_2px_4px_rgba(255,255,255,0.3)] mx-1 transition-all duration-1000`}></div>
                    <div style={{ width: `${(completedCount / (totalProgramsCount || 1)) * 100}%` }} className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[inset_0px_-2px_4px_rgba(0,0,0,0.1),inset_0px_2px_4px_rgba(255,255,255,0.3)] transition-all duration-1000"></div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 md:gap-8 mt-6 text-[13px] font-bold text-slate-600">
                    <span className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]"></div> Antrean</span>
                    <span className="flex items-center gap-2"><div className={`w-3.5 h-3.5 rounded-full ${theme.pulse} ${theme.ring}`}></div> Pelaksanaan</span>
                    <span className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div> Selesai</span>
                  </div>
                </div>

                {/* Management Panels */}
                {isManagement && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Panel 1 */}
                    <div className={`${clay.card} flex flex-col animate-fade-in-up stagger-4`}>
                      <div className="px-6 md:px-8 py-6 flex justify-between items-center border-b border-slate-100">
                        <div>
                          <h3 className="text-[16px] font-bold text-slate-800">Menunggu Tindakan</h3>
                          <p className="text-[12px] font-medium text-slate-500 mt-0.5">Program belum dieksekusi</p>
                        </div>
                        <ClayBadge color="yellow">Pending</ClayBadge>
                      </div>
                      <div className="flex-1 overflow-y-auto max-h-[350px] px-4 md:px-6 py-6 space-y-3">
                        {filterByStatus(['pending_approval', 'approved_pelaksanaan']).length === 0 ? (
                           <div className="p-4 text-center text-[13px] font-medium text-slate-400">Semua telah ditindaklanjuti.</div>
                        ) : (
                          filterByStatus(['pending_approval', 'approved_pelaksanaan']).map(prog => (
                            <div key={prog.id} className="bg-white/80 border border-slate-150 rounded-[20px] p-4 flex justify-between items-center shadow-[4px_6px_12px_rgba(148,163,184,0.06)]">
                              <div>
                                <p className="font-bold text-[13px] text-slate-800">{prog.title}</p>
                                <p className="text-[11px] font-semibold text-slate-500 mt-1">{prog.proposer}</p>
                              </div>
                              <span className="text-[11px] font-bold text-slate-500 ml-3 whitespace-nowrap bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50">
                                {prog.status === 'pending_approval' ? 'Butuh ACC' : 'Belum Lapor'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    {/* Panel 2 */}
                    <div className={`${clay.card} flex flex-col animate-fade-in-up stagger-4`}>
                      <div className="px-6 md:px-8 py-6 flex justify-between items-center border-b border-slate-100">
                        <div>
                          <h3 className="text-[16px] font-bold text-slate-800">Antrean Verifikasi</h3>
                          <p className="text-[12px] font-medium text-slate-500 mt-0.5">Laporan butuh pengecekan</p>
                        </div>
                        <ClayBadge color="blue">Review</ClayBadge>
                      </div>
                      <div className="flex-1 overflow-y-auto max-h-[350px] px-4 md:px-6 py-6 space-y-3">
                        {filterByStatus(['reported']).length === 0 ? (
                           <div className="p-4 text-center text-[13px] font-medium text-slate-400">Tidak ada laporan masuk.</div>
                        ) : (
                          filterByStatus(['reported']).map(prog => (
                            <div key={prog.id} className="bg-white/80 border border-slate-150 rounded-[20px] p-4 flex justify-between items-center shadow-[4px_6px_12px_rgba(148,163,184,0.06)]">
                              <div>
                                <p className="font-bold text-[13px] text-slate-800">{prog.title}</p>
                                <p className="text-[11px] font-semibold text-slate-400 mt-1">{prog.proposer}</p>
                              </div>
                              {currentRole === 'Kepala Sekolah' && (
                                <button onClick={() => handleTabChange('pelaksanaan')} className="text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all active:scale-95 shadow-md ml-3 whitespace-nowrap">
                                  Buka Laporan
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- BUAT PENGAJUAN --- */}
            {activeTab === 'buat_pengajuan' && isProposerRole && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className={`${clay.card} p-6 md:p-10 animate-fade-in-up stagger-1`}>
                  <div className="mb-8">
                    <h3 className="text-[20px] font-extrabold text-slate-800 tracking-tight">Formulir Pengajuan Baru</h3>
                    <p className="text-[14px] font-medium text-slate-500 mt-1">Isi rincian dengan lengkap untuk mengajukan program kerja.</p>
                  </div>
                  
                  <form onSubmit={handleCreateProgram} className="space-y-6">
                    <div>
                      <label className="block text-[13px] font-bold text-slate-600 mb-2">Nama Program</label>
                      <input type="text" placeholder="Contoh: Rapat Kerja" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required className={clay.input} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[13px] font-bold text-slate-600 mb-2">Jenis Program</label>
                        <select value={newProgramType} onChange={(e) => setNewProgramType(e.target.value)} className={`${clay.input} appearance-none py-3.5`}>
                          <option value="Harian">Harian</option>
                          <option value="Mingguan">Mingguan</option>
                          <option value="Bulanan">Bulanan</option>
                          <option value="Tahunan">Tahunan</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-slate-600 mb-2">Estimasi Anggaran (Rp)</label>
                        <input type="number" placeholder="0" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} className={clay.input} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {newProgramType === 'Harian' && (
                        <div className="px-5 py-4 bg-indigo-50/50 rounded-[20px] border border-indigo-100/50 shadow-inner">
                           <p className="text-[13px] font-bold text-indigo-600 flex items-center gap-2">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             Program ini akan dicatat untuk dilaksanakan Setiap Hari.
                           </p>
                        </div>
                      )}
                      {newProgramType === 'Mingguan' && (
                        <div>
                          <label className="block text-[13px] font-bold text-slate-600 mb-2">Jadwal Mingguan</label>
                          <select value={newWeeklySchedule} onChange={(e) => setNewWeeklySchedule(e.target.value)} className={`${clay.input} appearance-none py-3.5`}>
                            <option value="Seminggu Sekali">Seminggu Sekali</option>
                            <option value="Dua Minggu Sekali">Dua Minggu Sekali</option>
                            <option value="Minggu Pertama">Minggu Pertama</option>
                            <option value="Minggu Kedua">Minggu Kedua</option>
                          </select>
                        </div>
                      )}
                      {(newProgramType === 'Bulanan' || newProgramType === 'Tahunan') && (
                        <div>
                          <label className="block text-[13px] font-bold text-slate-600 mb-2">Rencana Pelaksanaan (Tanggal)</label>
                          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required className={clay.input} />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-slate-600 mb-2">Deskripsi Singkat</label>
                      <textarea rows="4" placeholder="Jelaskan tujuan kegiatan ini..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} required className={`${clay.input} resize-none`}></textarea>
                    </div>

                    <div className="pt-4">
                      <button type="submit" className={`w-full ${clay.btnPrimary}`}>
                        Kirim Pengajuan
                      </button>
                    </div>
                  </form>
                </div>

                {/* Import Box */}
                <div className={`${clay.cardSmall} p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 animate-fade-in-up stagger-2`}>
                  <div className="text-center sm:text-left">
                    <h4 className="text-[15px] font-bold text-slate-800">Import Data Massal</h4>
                    <p className="text-[13px] font-medium text-slate-500 mt-1">Gunakan file CSV untuk mengunggah sekaligus.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                     <button onClick={downloadTemplate} className={`${clay.btnSecondary} w-full sm:w-auto`}>
                        Unduh Template
                     </button>
                     <label className={`${clay.btnPrimary} cursor-pointer w-full sm:w-auto`}>
                        Upload CSV
                        <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                     </label>
                  </div>
                </div>
              </div>
            )}

            {/* --- ANTREAN PERSETUJUAN --- */}
            {activeTab === 'antrean_pengajuan' && (
              <div className={`${clay.card} overflow-hidden animate-fade-in-up stagger-1`}>
                <div className="px-6 md:px-8 py-6 flex justify-between items-center border-b border-slate-100 bg-white/40">
                  <div>
                    <h3 className="text-[18px] font-bold text-slate-800">Antrean Persetujuan</h3>
                    <p className="text-[13px] font-medium text-slate-500 mt-1 hidden md:block">Program yang menunggu izin Kepala Sekolah.</p>
                  </div>
                  <ClayBadge color="yellow">Tahap 1</ClayBadge>
                </div>
                
                <div className="p-4 md:p-6 space-y-6">
                  {filterByStatus(['pending_approval']).length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-[#0F172A]/10 rounded-3xl shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center mb-6">
                        <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-[16px] font-bold text-slate-800">Tidak ada antrean</p>
                      <p className="text-[14px] font-medium text-slate-400 mt-1">Semua pengajuan telah ditindaklanjuti.</p>
                    </div>
                  ) : (
                    filterByStatus(['pending_approval']).map((prog, i) => (
                      <div key={prog.id} className={`${clay.cardSmall} p-5 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 animate-fade-in-up stagger-${(i%4)+1}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4 flex-wrap">
                             <ClayBadge color="gray">{prog.proposer}</ClayBadge>
                             <ClayBadge color="indigo">{prog.programType || 'Bulanan'}</ClayBadge>
                             <span className="text-[13px] font-bold text-slate-500 flex items-center gap-1.5">
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                               {prog.proposedDate}
                             </span>
                          </div>
                          <h4 className="font-extrabold text-slate-800 text-[16px] md:text-[18px] mb-3">{prog.title}</h4>
                          <p className="text-[14px] font-medium text-slate-500 leading-relaxed max-w-3xl">{prog.description}</p>
                          
                          {prog.budget > 0 && (
                            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-[16px] bg-slate-100/60 border border-slate-200/50 text-slate-700 text-[13px] font-bold shadow-inner">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Rp {prog.budget.toLocaleString('id-ID')}
                            </div>
                          )}
                        </div>
                        
                        <div className="md:w-56 shrink-0 flex flex-col justify-center gap-4 border-t md:border-t-0 md:border-l border-slate-200/50 pt-6 md:pt-0 md:pl-8">
                          {currentRole === 'Kepala Sekolah' ? (
                            <button onClick={() => handleApproveProposal(prog.id)} className={clay.btnSuccess}>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                              Setujui (ACC)
                            </button>
                          ) : (
                            <div className="text-center bg-slate-100/60 border border-slate-200/50 rounded-[16px] p-4 shadow-inner">
                              <p className="text-[12px] font-extrabold text-slate-500">Menunggu ACC Kepala Sekolah</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* --- PELAKSANAAN --- */}
            {activeTab === 'pelaksanaan' && (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Form Laporan Inline Penuh (Fokus Layar) */}
                {reportingProgramId ? (
                  <div className={`${clay.card} p-6 md:p-10 border border-indigo-200`}>
                    <div className="flex flex-col md:flex-row justify-between md:items-start mb-8 gap-4 border-b border-slate-200/50 pb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <ClayBadge color="indigo">Formulir Laporan Selesai</ClayBadge>
                        </div>
                        <h3 className="font-extrabold text-[22px] md:text-[28px] text-slate-800 tracking-tight leading-tight">
                          {programs.find(p => p.id === reportingProgramId)?.title}
                        </h3>
                        <p className="text-[14px] font-medium text-slate-500 mt-2">
                          Unggah foto kegiatan dan evaluasi akhir sebelum diserahkan ke Kepala Sekolah.
                        </p>
                      </div>
                      <button onClick={() => { stopCamera(); setReportingProgramId(null); }} className={`${clay.btnSecondary} w-full md:w-auto`}>Batal</button>
                    </div>

                    <form onSubmit={handleSubmitReport} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[13px] font-bold text-slate-600 mb-2">Tanggal Pelaksanaan Riil</label>
                          <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} required className={clay.input} />
                        </div>
                        <div>
                          <label className="block text-[13px] font-bold text-slate-600 mb-2">Hasil & Evaluasi Kegiatan</label>
                          <textarea rows="5" placeholder="Tuliskan evaluasi kegiatan secara ringkas..." value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} required className={`${clay.input} resize-none`}></textarea>
                        </div>
                      </div>
                      
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <label className="block text-[13px] font-bold text-slate-600 mb-2">Dokumentasi Foto (Maks. 300KB)</label>
                          
                          {/* JENDELA BIDIK KAMERA LANGSUNG */}
                          {isCameraActive && (
                            <div className="relative rounded-[24px] overflow-hidden border border-slate-300 bg-black aspect-video mb-4 shadow-inner">
                              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                                <button type="button" onClick={capturePhoto} className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition-all">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  Tangkap Foto
                                </button>
                                <button type="button" onClick={stopCamera} className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all">Batal</button>
                              </div>
                            </div>
                          )}

                          {/* CANVAS TERSEMBUNYI */}
                          <canvas ref={canvasRef} className="hidden"></canvas>

                          {reportPhoto ? (
                            <div className="w-full rounded-[24px] overflow-hidden shadow-[inset_3px_3px_6px_rgba(148,163,184,0.15)] relative bg-slate-100 h-44 border border-slate-200 p-2">
                               <img src={reportPhoto} alt="preview" className="w-full h-full object-cover rounded-[16px]" />
                               <button type="button" onClick={() => setReportPhoto('')} className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-red-500 rounded-full p-2.5 shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1">
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                 <span className="text-[11px] font-bold">Hapus</span>
                               </button>
                            </div>
                          ) : (
                            !isCameraActive && (
                              <div className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-[24px] bg-white/50 p-5 min-h-[180px] animate-scale-in">
                                <p className="text-[12px] font-bold text-slate-500 mb-4 text-center">Pilih metode dokumentasi (Maks. 300KB)</p>
                                <div className="flex flex-col sm:flex-row w-full gap-3 h-full">
                                  <label className="flex-1 flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-[16px] cursor-pointer hover:bg-slate-50 transition-all shadow-sm animate-fade-in-up">
                                    <svg className="w-6 h-6 mb-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    <span className="text-[11px] font-bold text-slate-600 text-center">Pilih dari Galeri</span>
                                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                  </label>
                                  <label className="flex-1 flex flex-col items-center justify-center p-4 bg-indigo-50 border border-indigo-200 rounded-[16px] cursor-pointer hover:bg-indigo-100 transition-all shadow-sm animate-fade-in-up">
                                    <svg className="w-6 h-6 mb-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="text-[11px] font-bold text-indigo-700 text-center">Buka Kamera</span>
                                    <button type="button" onClick={startCamera} className="hidden"></button>
                                  </label>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                        <button type="submit" className={`w-full mt-6 ${clay.btnPrimary}`}>
                          Kirim ke Kepala Sekolah
                        </button>
                      </div>
                    </form>
                  </div>
                ) : viewingReportId ? (
                  /* Detail View Verifikasi Laporan */
                  <div className={`${clay.card} p-6 md:p-10 animate-fade-in-up`}>
                    {programs.filter(p => p.id === viewingReportId).map(prog => (
                      <div key={prog.id}>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 md:mb-10 gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <ClayBadge color="gray">{prog.proposer}</ClayBadge>
                              <ClayBadge color="blue">Verifikasi Pending</ClayBadge>
                            </div>
                            <h3 className="text-[20px] md:text-[24px] font-extrabold text-slate-800 tracking-tight">{prog.title}</h3>
                          </div>
                          <button onClick={() => setViewingReportId(null)} className={`${clay.btnSecondary} w-full md:w-auto`}>
                            Kembali
                          </button>
                        </div>
                        
                        {prog.report && (
                          <div className="flex flex-col lg:flex-row gap-8 md:gap-10">
                            <div className="lg:w-1/3 shrink-0">
                               <p className="text-[12px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 pl-2">Foto Dokumentasi</p>
                               <div className="rounded-[28px] overflow-hidden shadow-[8px_12px_24px_rgba(148,163,184,0.1),inset_-3px_-3px_6px_rgba(0,0,0,0.05),inset_3px_3px_6px_rgba(255,255,255,0.9)] p-2 bg-slate-50">
                                 <img src={prog.report.photoUrl} alt="Bukti" className="w-full aspect-square object-cover rounded-[20px]" />
                               </div>
                            </div>
                            <div className="flex-1 space-y-8">
                               <div>
                                 <p className="text-[12px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 pl-2">Waktu Pelaksanaan</p>
                                 <div className="inline-flex items-center text-[14px] md:text-[15px] font-bold text-slate-700 bg-slate-100/60 px-5 py-3.5 rounded-[18px] border border-slate-200/50 shadow-inner">
                                   <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                   {prog.report.reportDate}
                                 </div>
                               </div>
                               <div>
                                 <p className="text-[12px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 pl-2">Catatan Evaluasi</p>
                                 <div className="text-[13px] md:text-[14px] font-medium text-slate-600 leading-relaxed bg-slate-100/60 p-6 rounded-[24px] border border-slate-200/50 shadow-inner">
                                   {prog.report.description}
                                 </div>
                               </div>
                            </div>
                          </div>
                        )}

                        {currentRole === 'Kepala Sekolah' && (
                          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4">
                            <button onClick={() => handleRejectReport(prog.id)} className={clay.btnDanger}>
                              Tolak & Kembalikan
                            </button>
                            <button onClick={() => handleApproveReport(prog.id)} className={clay.btnSuccess}>
                              Verifikasi & Selesai
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Daftar List Program Berjalan - TAMPIL HANYA JIKA TIDAK SEDANG MELAPOR */
                  <div className={`${clay.card} overflow-hidden animate-fade-in-up`}>
                    <div className="px-6 md:px-8 py-6 flex justify-between items-center bg-white/40 border-b border-slate-100">
                      <div>
                        <h3 className="text-[16px] md:text-[18px] font-bold text-slate-800">Program Berjalan</h3>
                        <p className="text-[12px] md:text-[13px] font-medium text-slate-500 mt-1">Status dan kelola tahap pelaksanaan.</p>
                      </div>
                      <ClayBadge color="blue">Tahap 2</ClayBadge>
                    </div>
                    
                    <div className="p-4 md:p-6 space-y-5">
                      {filterByStatus(['approved_pelaksanaan', 'reported']).length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-3xl shadow-[inset_2px_2px_4px_rgba(148,163,184,0.15),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] border border-slate-200/40 flex items-center justify-center mb-6">
                            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                          </div>
                          <p className="text-[16px] font-bold text-slate-800">Kosong</p>
                          <p className="text-[14px] font-medium text-slate-500 mt-1">Belum ada program di tahap ini.</p>
                        </div>
                      ) : (
                        filterByStatus(['approved_pelaksanaan', 'reported']).map((prog, i) => (
                          <div key={prog.id} className={`${clay.cardSmall} p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 md:gap-6 animate-fade-in-up stagger-${(i%4)+1}`}>
                            <div className="flex-1">
                               <div className="flex items-center flex-wrap gap-2 md:gap-3 mb-3">
                                 <ClayBadge color="gray">{prog.proposer}</ClayBadge>
                                 <ClayBadge color="indigo">{prog.programType || 'Bulanan'}</ClayBadge>
                                 {prog.status === 'reported' ? <ClayBadge color="indigo">Menunggu Review</ClayBadge> : <ClayBadge color="gray">Masa Eksekusi</ClayBadge>}
                               </div>
                               <h4 className="font-extrabold text-slate-800 text-[15px] md:text-[16px]">{prog.title}</h4>
                            </div>
                            <div className="shrink-0 w-full lg:w-auto">
                               {prog.status === 'approved_pelaksanaan' && currentRole === prog.proposer && (
                                  <button onClick={() => { setReportingProgramId(prog.id); setReportDate(prog.proposedDate); }} className={`${clay.btnPrimary} w-full lg:w-auto`}>
                                    Buat Laporan Selesai
                                  </button>
                               )}
                               {prog.status === 'reported' && (
                                  <button onClick={() => setViewingReportId(prog.id)} className={`${clay.btnSecondary} w-full lg:w-auto`}>
                                    Buka Detail
                                  </button>
                               )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- RIWAYAT SELESAI --- */}
            {activeTab === 'selesai' && (
              <div className={`${clay.card} overflow-hidden animate-fade-in-up stagger-1`}>
                <div className="px-6 md:px-8 py-6 flex justify-between items-center bg-white/40 border-b border-slate-100">
                  <div>
                    <h3 className="text-[16px] md:text-[18px] font-bold text-slate-800">Arsip Program Terlaksana</h3>
                    <p className="text-[12px] md:text-[13px] font-medium text-slate-500 mt-1 hidden sm:block">Daftar semua program yang sudah di-ACC final.</p>
                  </div>
                  <ClayBadge color="green">Selesai</ClayBadge>
                </div>
                
                <div className="p-4 md:p-6 space-y-6">
                  {filterByStatus(['completed']).length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-3xl shadow-inner flex items-center justify-center mb-6 border border-slate-200/50">
                        <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                      </div>
                      <p className="text-[16px] font-bold text-slate-800">Belum ada riwayat</p>
                      <p className="text-[14px] font-medium text-slate-500 mt-1">Program yang selesai akan tampil di sini.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {filterByStatus(['completed']).map((prog, i) => (
                        <div key={prog.id} className={`${clay.cardSmall} p-5 md:p-6 flex flex-col sm:flex-row gap-5 md:gap-6 animate-fade-in-up stagger-${(i%4)+1}`}>
                          {prog.report && (
                             <div className="w-full sm:w-36 aspect-video sm:aspect-square rounded-[20px] overflow-hidden shadow-[inset_2px_2px_4px_rgba(148,163,184,0.15),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] p-1.5 bg-slate-100/60 shrink-0 border border-slate-200/40">
                               <img src={prog.report.photoUrl} alt="Dokumentasi" className="w-full h-full object-cover rounded-[14px]" />
                             </div>
                          )}
                          <div className="flex-1 flex flex-col justify-center">
                             <div className="flex items-center gap-3 mb-3 flex-wrap">
                               <ClayBadge color="gray">{prog.proposer}</ClayBadge>
                               <ClayBadge color="indigo">{prog.programType || 'Bulanan'}</ClayBadge>
                               <span className="text-[11px] md:text-[12px] font-bold text-slate-400">Tgl: {prog.report?.reportDate}</span>
                             </div>
                             <h4 className="font-extrabold text-slate-800 text-[15px] md:text-[16px] mb-2">{prog.title}</h4>
                             <p className="text-[12px] md:text-[13px] font-medium text-slate-400 line-clamp-2 leading-relaxed">{prog.report?.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- PENGATURAN SEKOLAH (HANYA KEPALA SEKOLAH) --- */}
            {activeTab === 'pengaturan_sekolah' && currentRole === 'Kepala Sekolah' && (
              <div className="max-w-4xl mx-auto animate-fade-in-up space-y-6">
                <div className={`${clay.card} p-6 md:p-10`}>
                  <div className="mb-8 border-b border-slate-200/50 pb-6">
                    <h3 className="text-[20px] font-extrabold text-slate-800 tracking-tight">Identitas Sekolah & Laporan</h3>
                    <p className="text-[14px] font-medium text-slate-500 mt-1">Sesuaikan logo, nama sekolah, dan penanda tangan laporan PDF.</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-10">
                    {/* Bagian Kiri: Logo */}
                    <div className="flex flex-col items-center gap-4 md:w-1/3 shrink-0">
                      <p className="text-[13px] font-bold text-slate-600 w-full text-center">Logo Sistem & Kop Surat</p>
                      <div className="w-40 h-40 rounded-[32px] bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shadow-[inset_2px_2px_4px_rgba(148,163,184,0.2)] relative group transition-all hover:border-indigo-400">
                        {schoolLogo ? (
                           <img src={schoolLogo} alt="Logo Sekolah" className="w-full h-full object-cover" />
                        ) : (
                           <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        )}
                        <label className="absolute inset-0 bg-slate-900/50 hidden group-hover:flex flex-col items-center justify-center transition-all cursor-pointer backdrop-blur-[2px]">
                           <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                           <svg className="w-8 h-8 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                           <span className="text-[11px] font-bold text-white text-center px-2 tracking-wide">Ubah Logo</span>
                        </label>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 text-center px-4">Format 1:1 disarankan. Maks 500KB.</p>
                    </div>

                    {/* Bagian Kanan: Formulir Teks */}
                    <div className="flex-1">
                      <form onSubmit={handleSaveSchoolInfo} className="space-y-6">
                        <div>
                          <label className="block text-[13px] font-bold text-slate-600 mb-2">Nama Sekolah</label>
                          <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required className={clay.input} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[13px] font-bold text-slate-600 mb-2">Nama Kepala Sekolah</label>
                            <input type="text" value={headmasterName} onChange={(e) => setHeadmasterName(e.target.value)} required className={clay.input} />
                          </div>
                          <div>
                            <label className="block text-[13px] font-bold text-slate-600 mb-2">NIP Kepala Sekolah</label>
                            <input type="text" value={headmasterNIP} onChange={(e) => setHeadmasterNIP(e.target.value)} required className={clay.input} />
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-200/50">
                          <button type="submit" className={`${clay.btnPrimary} w-full md:w-auto px-8`}>
                            Simpan Perubahan
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- KELOLA AKUN (HANYA KEPALA SEKOLAH) --- */}
            {activeTab === 'kelola_akun' && currentRole === 'Kepala Sekolah' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
                
                {/* Kiri: Form Akun */}
                <div className={`${clay.card} p-6 h-fit`}>
                  <h3 className="text-lg font-extrabold text-slate-800 mb-2 tracking-tight">
                    {editingUserId ? 'Edit Akun Pengguna' : 'Tambah Akun Baru'}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200/50 pb-3">Formulir Hak Akses</p>
                  
                  <form onSubmit={handleSaveUser} className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Nama Akun/Divisi</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Tim Kurikulum Baru" 
                        value={manageName} 
                        onChange={(e) => setManageName(e.target.value)} 
                        required 
                        className={clay.input} 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Username Login</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: kaprog_tkj" 
                        value={manageUsername} 
                        onChange={(e) => setManageUsername(e.target.value)} 
                        required 
                        disabled={editingUserId !== null}
                        className={`${clay.input} disabled:opacity-50`} 
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Pilih Peran (Role)</label>
                      <select
                        value={manageRole}
                        onChange={(e) => setManageRole(e.target.value)}
                        className={`${clay.input} appearance-none py-3.5`}
                      >
                        <option value="Kesiswaan">Kesiswaan</option>
                        <option value="Kurikulum">Kurikulum</option>
                        <option value="Hubin">Hubin</option>
                        <option value="Kaprog TKJ">Kaprog TKJ</option>
                        <option value="Kaprog TKR">Kaprog TKR</option>
                        <option value="Kaprog MP">Kaprog MP</option>
                        <option value="Yayasan">Yayasan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Tetapkan Kata Sandi</label>
                      <input 
                        type="text" 
                        placeholder="Masukkan kata sandi baru"
                        value={managePassword} 
                        onChange={(e) => setManagePassword(e.target.value)}
                        required
                        className={clay.input} 
                      />
                    </div>

                    <div className="pt-2 flex gap-3">
                      {editingUserId && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingUserId(null); setManageName(''); setManageUsername(''); setManagePassword(''); setManageRole('Kaprog TKJ');
                          }} 
                          className={`${clay.btnSecondary} py-2 px-4 text-xs font-bold w-auto`}
                        >
                          Batal
                        </button>
                      )}
                      <button type="submit" className={`${clay.btnPrimary} py-2 px-5 text-xs font-bold flex-1`}>
                        {editingUserId ? 'Simpan Perubahan' : 'Buat Akun'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Panel Daftar Pengguna */}
                <div className={`${clay.card} p-6 lg:col-span-2 flex flex-col`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Daftar Akun Terdaftar</h3>
                    <ClayBadge color="indigo">{users.length} Akun</ClayBadge>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6 border-b pb-3">Hak Akses Sistem</p>
                  
                  <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
                    {users.map(user => (
                      <div 
                        key={user.id} 
                        className={`${clay.cardSmall} p-4 !rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-shadow`}
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[14px] text-slate-800">{user.name}</span>
                            <ClayBadge color={user.role.startsWith('Kaprog') ? 'blue' : user.role === 'Kepala Sekolah' ? 'yellow' : 'gray'}>
                              {user.role}
                            </ClayBadge>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <p className="text-xs text-slate-400 font-medium">U: <span className="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded shadow-inner">{user.username}</span></p>
                            <p className="text-xs text-slate-400 font-medium">P: <span className="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded shadow-inner">{user.password}</span></p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {user.role !== 'Kepala Sekolah' ? (
                            <>
                              <button 
                                onClick={() => handleEditUserClick(user)} 
                                className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => toggleUserStatus(user.id)} 
                                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 ${
                                  user.status === 'Aktif' 
                                    ? 'bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100' 
                                    : 'bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                                }`}
                              >
                                {user.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-400 italic">Akun Sistem Utama</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}