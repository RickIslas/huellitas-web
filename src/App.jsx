import React, { useState, useEffect } from "react";
import {
  PawPrint, Heart, ShieldAlert, Users, DollarSign, Plus, Trash2, Edit3,
  CheckCircle2, MapPin, Calendar, Search, Menu, X, ExternalLink,
  MessageCircle, Star, Sparkles, BarChart3, Lock, LogOut,
  Database, HandHeart, Building2, Upload, UserCheck, Settings, ShieldCheck,
  PhoneCall, Navigation
} from "lucide-react";
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, serverTimestamp
} from "firebase/firestore";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup,
  signOut, onAuthStateChanged
} from "firebase/auth";
import { db, auth, googleProvider, isFirebaseConfigured } from "./firebase";

// ==========================================
// ÍCONOS SVG PERSONALIZADOS
// ==========================================
const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z" />
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z" />
    <path fill="#FBBC05" d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z" />
    <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 21.4 7.4 24 12 24z" />
  </svg>
);

// ==========================================
// COMPRESOR DE IMÁGENES EN CLIENTE (CANVAS)
// ==========================================
const compressImageFile = (file, maxWidth = 700, quality = 0.78) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No se seleccionó ningún archivo"));
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });

// Formateador de número telefónico para enlaces de WhatsApp (Código 52 México)
const formatWhatsAppNumber = (rawPhone = "") => {
  const digits = String(rawPhone).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `52${digits}`;
  return digits;
};

// ==========================================
// DATOS SEMILLA INICIALES
// ==========================================
const INITIAL_PETS = [
  {
    id: "pet-1",
    name: "Botas",
    species: "Perro",
    age: "2 años",
    size: "Mediano",
    location: "Nezahualcóyotl, Edo. Méx.",
    shelterName: "Fundación Patitas Neza",
    status: "disponible",
    vaccinated: true,
    sterilized: true,
    description: "Perrito muy juguetón, noble y leal. Ideal para convivir con niños y espacios abiertos.",
    needs: "Paseos diarios y vacunación anual al día.",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=700&q=80",
    adopterProfile: null
  },
  {
    id: "pet-2",
    name: "Canelo",
    species: "Perro",
    age: "3 años",
    size: "Grande",
    location: "Nezahualcóyotl, Edo. Méx.",
    shelterName: "Refugio Segunda Oportunidad",
    status: "disponible",
    vaccinated: true,
    sterilized: true,
    description: "Tranquilo, protector y sumamente cariñoso. Rescatado y rehabilitado con éxito.",
    needs: "Patio mediano o grande, cepillado regular.",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=700&q=80",
    adopterProfile: null
  },
  {
    id: "pet-3",
    name: "Chocolata",
    species: "Perro",
    age: "1 año",
    size: "Pequeño",
    location: "Col. Benito Juárez, Neza",
    shelterName: "Fundación Patitas Neza",
    status: "disponible",
    vaccinated: true,
    sterilized: true,
    description: "Perrita muy linda, sociable y cariñosa con un excelente estado de salud.",
    needs: "Hogar cálido, se adapta bien a departamentos.",
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=700&q=80",
    adopterProfile: {
      applicantName: "Karely Gómez",
      email: "Kare223v@gmail.com",
      phone: "5523431219",
      reason: "Quiero una compañera de vida para mi familia.",
      hasOtherPets: "Sí",
      space: "Patio techado y seguro",
      carePlan: "Alimentación premium y 2 paseos al día"
    }
  },
  {
    id: "pet-4",
    name: "Lya",
    species: "Perro",
    age: "8 meses",
    size: "Pequeño",
    location: "Chimalhuacán, Edo. Méx.",
    shelterName: "Hogar Canino Esperanza",
    status: "adoptado",
    vaccinated: true,
    sterilized: true,
    description: "Perrita muy linda y cariñosa con un buen estado de salud, esterilizada y vacunada.",
    needs: "Seguimiento de refuerzo anual.",
    image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=700&q=80",
    adopterProfile: {
      applicantName: "Mónica Estrada",
      email: "Mon231@gmail.com",
      phone: "5569565745",
      reason: "Darle un hogar lleno de amor.",
      hasOtherPets: "No",
      space: "Departamento amplio con terraza",
      carePlan: "Atención veterinaria mensual y paseos en parque"
    }
  }
];

const INITIAL_REPORTS = [
  {
    id: "rep-1",
    animalName: "Rocky",
    species: "Perro",
    reportType: "Perdido",
    description: "Perro, Mestizo, Mediano, Color Café con mancha blanca en el pecho.",
    location: "Parque Central de la Colonia Roma",
    lat: 19.4194,
    lng: -99.1626,
    date: "2025-09-25",
    reporterName: "Ana López",
    reporterPhone: "5544332211",
    status: "Activo",
    image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "rep-2",
    animalName: "Michi",
    species: "Gato",
    reportType: "Perdido",
    description: "Gato Gris, Pequeño, Ojos Verdes, collar azul.",
    location: "Afuera de la tienda OXXO, Av. Juárez",
    lat: 19.4326,
    lng: -99.1432,
    date: "2025-09-28",
    reporterName: "Carlos Méndez",
    reporterPhone: "5512349876",
    status: "Activo",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "rep-3",
    animalName: "Perrito en Col. La Perla",
    species: "Perro",
    reportType: "Avistado / Encontrado",
    description: "Me encontré a este perrito que parece perdido en Col. La Perla, si alguien lo reconoce dejo ubicación GPS.",
    location: "Col. La Perla, Av. Pantitlán, Nezahualcóyotl",
    lat: 19.3907,
    lng: -99.0036,
    date: "2025-10-02",
    reporterName: "Brayan Treviño",
    reporterPhone: "2637180219",
    status: "En resguardo",
    image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=600&q=80"
  }
];

const INITIAL_SHELTERS = [
  {
    id: "sh-1",
    name: "Fundación Patitas Neza",
    badges: ["Verificado", "Esterilización", "Rescate Activo"],
    rating: 4.9,
    location: "Ciudad Nezahualcóyotl, Edo. Méx.",
    description: "Más de 8 años rescatando, rehabilitando y esterilizando perritos en situación de calle en la zona oriente.",
    web: "https://patitasneza.org",
    instagram: "@patitasneza",
    whatsapp: "525512345678",
    logo: ""
  },
  {
    id: "sh-2",
    name: "Refugio Segunda Oportunidad",
    badges: ["Verificado", "Clínica Aliada", "Adopción Responsable"],
    rating: 4.8,
    location: "Chimalhuacán / Oriente CDMX",
    description: "Albergue temporal y centro de vacunación a bajo costo enfocado en erradicar el abandono animal.",
    web: "https://segundaoportunidad.mx",
    instagram: "@refugio2oportunidad",
    whatsapp: "525587654321",
    logo: ""
  },
  {
    id: "sh-3",
    name: "Hogar Canino Esperanza",
    badges: ["Verificado", "Voluntariado Abierto"],
    rating: 5.0,
    location: "Col. Roma / Centro CDMX",
    description: "Red de hogares temporales, campañas de concientización y ferias de adopción cada fin de semana.",
    web: "https://hogaresperanza.org",
    instagram: "@hogaresperanzamx",
    whatsapp: "525599887766",
    logo: ""
  }
];

const INITIAL_USERS = [
  {
    id: "01",
    name: "Brayan Treviño",
    phone: "2637180219",
    municipality: "Chimalhuacán",
    email: "BrayanCeronTrev@gmail.com",
    role: "Usuario",
    housingType: "Casa con patio",
    hasOtherPets: "No",
    preferredSize: "Mediano",
    preferredSpecies: "Perro",
    favorites: []
  },
  {
    id: "02",
    name: "Karely Gómez",
    phone: "5523431219",
    municipality: "Nezahualcóyotl",
    email: "Kare223v@gmail.com",
    role: "Usuario",
    housingType: "Casa con jardín",
    hasOtherPets: "Sí",
    preferredSize: "Pequeño",
    preferredSpecies: "Perro",
    favorites: []
  },
  {
    id: "03",
    name: "Mónica Estrada",
    phone: "5569565745",
    municipality: "La Roma",
    email: "Mon231@gmail.com",
    role: "Usuario",
    housingType: "Departamento amplio",
    hasOtherPets: "No",
    preferredSize: "Pequeño",
    preferredSpecies: "Ambos",
    favorites: []
  }
];

const INITIAL_DONATIONS = [
  { id: "don-1", folio: "HUE-9012", donor: "Ana María Vega", donorEmail: "ana@mail.com", shelter: "Fundación Patitas Neza", amount: 500, impact: "Esterilización", method: "Mercado Pago", date: "2025-09-28" },
  { id: "don-2", folio: "HUE-9013", donor: "Donante Anónimo", donorEmail: "-", shelter: "Refugio Segunda Oportunidad", amount: 1000, impact: "Rescate + kit inicial", method: "PayPal", date: "2025-09-30" },
  { id: "don-3", folio: "HUE-9014", donor: "Roberto Castrejón", donorEmail: "roberto@mail.com", shelter: "Hogar Canino Esperanza", amount: 300, impact: "Vacuna y desparasitación", method: "Mercado Pago", date: "2025-10-01" },
  { id: "don-4", folio: "HUE-9015", donor: "Lucía Fernández", donorEmail: "lucia@mail.com", shelter: "Fundación Patitas Neza", amount: 150, impact: "3 días de alimento", method: "PayPal", date: "2025-10-03" }
];

const INITIAL_ADOPTIONS = [
  {
    id: "adp-1",
    petId: "pet-3",
    petName: "Chocolata",
    applicantName: "Karely Gómez",
    email: "Kare223v@gmail.com",
    phone: "5523431219",
    municipality: "Nezahualcóyotl",
    reason: "Quiero una compañera de vida para mi familia.",
    hasOtherPets: "Sí",
    space: "Patio techado y seguro",
    carePlan: "Alimentación premium y 2 paseos al día",
    status: "Pendiente",
    date: "2025-10-04"
  }
];

export default function App() {
  // Navegación
  const [activeTab, setActiveTab] = useState("inicio");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertSubTab, setAlertSubTab] = useState("ver");
  const [adminSubTab, setAdminSubTab] = useState("general");

  // Colecciones en Tiempo Real
  const [pets, setPets] = useState(INITIAL_PETS);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [shelters, setShelters] = useState(INITIAL_SHELTERS);
  const [usersList, setUsersList] = useState(INITIAL_USERS);
  const [donations, setDonations] = useState(INITIAL_DONATIONS);
  const [adoptions, setAdoptions] = useState(INITIAL_ADOPTIONS);

  // Filtros de Catálogo
  const [searchQuery, setSearchQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [onlyMatches, setOnlyMatches] = useState(false);

  // Autenticación y Perfil Persistente
  const [currentUser, setCurrentUser] = useState(null);
  const [authPortal, setAuthPortal] = useState("user"); // "user" | "admin"
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    municipality: "Nezahualcóyotl"
  });

  // Estado del Formulario "Mi Perfil y Preferencias"
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    municipality: "Nezahualcóyotl",
    address: "",
    bio: "",
    housingType: "Casa con patio",
    hasOtherPets: "No",
    experienceLevel: "Intermedia",
    preferredSpecies: "Ambos",
    preferredSize: "Todos",
    notifications: true,
    avatar: ""
  });

  // Notificación Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4200);
  };

  // Estado Modal Pre-Adopción
  const [selectedPetForAdoption, setSelectedPetForAdoption] = useState(null);
  const [adoptionForm, setAdoptionForm] = useState({
    applicantName: "",
    email: "",
    phone: "",
    municipality: "Nezahualcóyotl",
    reason: "Quiero brindarle un hogar lleno de amor y cuidados.",
    hasOtherPets: "No",
    space: "Casa con patio bardeado",
    carePlan: "Alimentación balanceada, paseos diarios y visitas veterinarias.",
    acceptTerms: true
  });

  // Estado Modal CRUD Mascota (Solo Admin)
  const [petModalOpen, setPetModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [petForm, setPetForm] = useState({
    name: "",
    species: "Perro",
    age: "",
    size: "Pequeño",
    location: "Nezahualcóyotl, Edo. Méx.",
    shelterName: "Fundación Patitas Neza",
    vaccinated: true,
    sterilized: true,
    description: "",
    needs: "",
    image: ""
  });
  const [petToDelete, setPetToDelete] = useState(null);
  const [adopterProfileModal, setAdopterProfileModal] = useState(null);

  // Estado Modal CRUD Refugios (Solo Admin)
  const [shelterModalOpen, setShelterModalOpen] = useState(false);
  const [editingShelter, setEditingShelter] = useState(null);
  const [shelterForm, setShelterForm] = useState({
    name: "",
    location: "",
    description: "",
    badgesText: "Verificado, Esterilización, Rescate Activo",
    rating: "5.0",
    web: "https://",
    instagram: "@",
    whatsapp: "5255",
    logo: ""
  });

  // Estado Formulario Reportar Mascota Perdida (Con GPS y Teléfono/WhatsApp)
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [reportForm, setReportForm] = useState({
    animalName: "",
    species: "Perro",
    reportType: "Perdido",
    description: "",
    location: "",
    lat: null,
    lng: null,
    date: "",
    reporterName: "",
    reporterPhone: "",
    image: ""
  });

  // Estado Donaciones
  const [selectedAmount, setSelectedAmount] = useState(300);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Mercado Pago");
  const [selectedShelterForDonation, setSelectedShelterForDonation] = useState("Fundación Patitas Neza");
  const [donorName, setDonorName] = useState("");

  // Rol verificado estrictamente desde Firestore
  const isAdmin = currentUser?.role === "Administrador";

  // ==========================================
  // 1. ESCUCHA EN TIEMPO REAL DE FIRESTORE
  // ==========================================
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const unsubPets = onSnapshot(collection(db, "pets"), (snapshot) => {
      if (!snapshot.empty) {
        setPets(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    });

    const unsubReports = onSnapshot(collection(db, "reports"), (snapshot) => {
      if (!snapshot.empty) {
        setReports(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    });

    const unsubShelters = onSnapshot(collection(db, "shelters"), (snapshot) => {
      if (!snapshot.empty) {
        setShelters(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      if (!snapshot.empty) {
        setUsersList(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    });

    const unsubDonations = onSnapshot(collection(db, "donations"), (snapshot) => {
      if (!snapshot.empty) {
        setDonations(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    });

    const unsubAdoptions = onSnapshot(collection(db, "adoptions"), (snapshot) => {
      if (!snapshot.empty) {
        setAdoptions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    });

    return () => {
      unsubPets();
      unsubReports();
      unsubShelters();
      unsubUsers();
      unsubDonations();
      unsubAdoptions();
    };
  }, []);

  // ==========================================
  // 2. PERSISTENCIA DE SESIÓN Y ESCUCHA DEL ROL EN VIVO
  // ==========================================
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    let unsubUserDoc = null;

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (unsubUserDoc) {
        unsubUserDoc();
        unsubUserDoc = null;
      }

      if (!fbUser) {
        setCurrentUser(null);
        return;
      }

      const userRef = doc(db, "users", fbUser.uid);

      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          const newProfile = {
            name: fbUser.displayName || fbUser.email?.split("@")[0] || "Usuario Huellitas",
            email: fbUser.email,
            phone: fbUser.phoneNumber || "",
            municipality: "Nezahualcóyotl",
            address: "",
            bio: "Integrante de la comunidad Huellitas.",
            role: "Usuario",
            housingType: "Casa con patio",
            hasOtherPets: "No",
            experienceLevel: "Intermedia",
            preferredSpecies: "Ambos",
            preferredSize: "Todos",
            notifications: true,
            favorites: [],
            avatar: fbUser.photoURL || "",
            createdAt: serverTimestamp()
          };
          await setDoc(userRef, newProfile);
        }

        // Escuchar en tiempo real el documento del usuario por si se le asigna "Administrador" en Firebase Console
        unsubUserDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCurrentUser({ id: fbUser.uid, ...data });
            setProfileForm({
              name: data.name || fbUser.displayName || "",
              phone: data.phone || "",
              municipality: data.municipality || "Nezahualcóyotl",
              address: data.address || "",
              bio: data.bio || "",
              housingType: data.housingType || "Casa con patio",
              hasOtherPets: data.hasOtherPets || "No",
              experienceLevel: data.experienceLevel || "Intermedia",
              preferredSpecies: data.preferredSpecies || "Ambos",
              preferredSize: data.preferredSize || "Todos",
              notifications: data.notifications ?? true,
              avatar: data.avatar || fbUser.photoURL || ""
            });
          }
        });
      } catch (err) {
        console.error("Error sincronizando perfil:", err);
      }
    });

    return () => {
      unsubAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

  // Auto-llenar formularios con los datos guardados del perfil activo
  useEffect(() => {
    if (currentUser) {
      setAdoptionForm((prev) => ({
        ...prev,
        applicantName: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        municipality: currentUser.municipality || "Nezahualcóyotl",
        hasOtherPets: currentUser.hasOtherPets || "No",
        space: currentUser.housingType || "Casa con patio"
      }));
      setDonorName(currentUser.name || "");
      setReportForm((prev) => ({
        ...prev,
        reporterName: currentUser.name || "",
        reporterPhone: currentUser.phone || ""
      }));
    }
  }, [currentUser]);

  // ==========================================
  // 3. OBTENER UBICACIÓN EXACTA POR GPS (MÓVIL / NAVEGADOR)
  // ==========================================
  const handleGetGpsLocation = () => {
    if (!("geolocation" in navigator)) {
      showToast("Tu navegador o dispositivo no soporta geolocalización GPS.", "error");
      return;
    }

    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let resolvedAddress = `Coordenadas GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.display_name) {
              const parts = data.display_name.split(",").slice(0, 4).join(",");
              resolvedAddress = parts;
            }
          }
        } catch {
          // Si no hay respuesta de geocodificación inversa, se conservan las coordenadas exactas
        }

        setReportForm((prev) => ({
          ...prev,
          location: resolvedAddress,
          lat: Number(latitude.toFixed(6)),
          lng: Number(longitude.toFixed(6))
        }));
        setIsGettingGps(false);
        showToast("📍 Ubicación GPS obtenida con éxito desde tu dispositivo.");
      },
      (error) => {
        setIsGettingGps(false);
        showToast(
          "No se pudo obtener el GPS (" + error.message + "). Verifica dar permiso de ubicación en tu celular/navegador.",
          "error"
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // ==========================================
  // 4. SUBIDA DE FOTOS DESDE DISPOSITIVO
  // ==========================================
  const handleImageUpload = async (e, targetType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedBase64 = await compressImageFile(file, 700, 0.8);
      if (targetType === "pet") {
        setPetForm((prev) => ({ ...prev, image: compressedBase64 }));
      } else if (targetType === "report") {
        setReportForm((prev) => ({ ...prev, image: compressedBase64 }));
      } else if (targetType === "shelter") {
        setShelterForm((prev) => ({ ...prev, logo: compressedBase64 }));
      } else if (targetType === "avatar") {
        setProfileForm((prev) => ({ ...prev, avatar: compressedBase64 }));
      }
      showToast("Fotografía procesada y lista para guardar.");
    } catch (err) {
      showToast("No se pudo procesar la imagen: " + err.message, "error");
    }
  };

  // ==========================================
  // 5. AUTENTICACIÓN SEGURA (FIREBASE AUTH + FIRESTORE ROLES)
  // ==========================================
  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      showToast("Configura Firebase para usar Google Sign-In.", "error");
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const userRef = doc(db, "users", fbUser.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        const newProfile = {
          name: fbUser.displayName || "Usuario Google",
          email: fbUser.email,
          phone: fbUser.phoneNumber || "",
          municipality: "Nezahualcóyotl",
          address: "",
          bio: "Cuenta verificada con Google.",
          role: "Usuario",
          housingType: "Casa con patio",
          hasOtherPets: "No",
          experienceLevel: "Intermedia",
          preferredSpecies: "Ambos",
          preferredSize: "Todos",
          notifications: true,
          favorites: [],
          avatar: fbUser.photoURL || "",
          createdAt: serverTimestamp()
        };
        await setDoc(userRef, newProfile);
      }
      showToast(`¡Bienvenido(a) ${fbUser.displayName || fbUser.email}!`);
      setActiveTab("adopciones");
    } catch (error) {
      showToast("Acceso con Google: " + error.message, "error");
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authMode === "register") {
        const cred = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        const newProfile = {
          name: authForm.name,
          email: authForm.email,
          phone: authForm.phone || "",
          municipality: authForm.municipality || "Nezahualcóyotl",
          address: "",
          bio: "Adoptante registrado en Huellitas",
          role: "Usuario", // Seguridad estricta: el rol Admin solo se otorga en Firebase Firestore
          housingType: "Casa con patio",
          hasOtherPets: "No",
          experienceLevel: "Intermedia",
          preferredSpecies: "Ambos",
          preferredSize: "Todos",
          notifications: true,
          favorites: [],
          avatar: "",
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, "users", cred.user.uid), newProfile);
        showToast(`¡Cuenta creada con éxito! Bienvenido(a), ${authForm.name}.`);
        setActiveTab("perfil");
      } else {
        const cred = await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
        const userRef = doc(db, "users", cred.user.uid);
        const snap = await getDoc(userRef);
        const role = snap.exists() ? snap.data().role : "Usuario";

        if (authPortal === "admin" && role !== "Administrador") {
          await signOut(auth);
          showToast(
            "Acceso denegado: Tu cuenta no tiene el rol 'Administrador' asignado en Firebase Firestore.",
            "error"
          );
          return;
        }

        showToast(`Sesión iniciada correctamente (${role}).`);
        setActiveTab(role === "Administrador" ? "admin" : "inicio");
      }
    } catch (error) {
      showToast("Autenticación: " + error.message, "error");
    }
  };

  const handleLogout = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
      setCurrentUser(null);
      setActiveTab("inicio");
      showToast("Sesión cerrada de forma segura.");
    } catch (error) {
      showToast("Error al salir: " + error.message, "error");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const updatedData = {
        ...profileForm,
        updatedAt: serverTimestamp()
      };
      if (isFirebaseConfigured && !currentUser.id.startsWith("0")) {
        await setDoc(doc(db, "users", currentUser.id), updatedData, { merge: true });
      }
      setCurrentUser({ ...currentUser, ...profileForm });
      showToast("¡Tus datos y preferencias se guardaron en Firebase!");
    } catch (err) {
      showToast("Error al guardar perfil: " + err.message, "error");
    }
  };

  const toggleFavoritePet = async (petId) => {
    if (!currentUser) {
      showToast("Inicia sesión para guardar mascotas en tus favoritos.", "info");
      setActiveTab("auth");
      return;
    }
    const currentFavs = currentUser.favorites || [];
    const exists = currentFavs.includes(petId);
    const updatedFavs = exists
      ? currentFavs.filter((id) => id !== petId)
      : [...currentFavs, petId];

    try {
      if (isFirebaseConfigured && !currentUser.id.startsWith("0")) {
        await setDoc(doc(db, "users", currentUser.id), { favorites: updatedFavs }, { merge: true });
      }
      setCurrentUser({ ...currentUser, favorites: updatedFavs });
      showToast(exists ? "Eliminado de tus favoritos." : "❤️ Guardado en tus favoritos.");
    } catch (err) {
      showToast("Error actualizando favoritos: " + err.message, "error");
    }
  };

  // ==========================================
  // 6. OPERACIONES DE NEGOCIO Y ADMIN CRUD
  // ==========================================
  const seedFirebaseDatabase = async () => {
    if (!isFirebaseConfigured || !isAdmin) return;
    try {
      await Promise.all([
        ...INITIAL_PETS.map(({ id, ...data }) =>
          addDoc(collection(db, "pets"), { ...data, createdAt: serverTimestamp() })
        ),
        ...INITIAL_SHELTERS.map(({ id, ...data }) =>
          addDoc(collection(db, "shelters"), { ...data, createdAt: serverTimestamp() })
        ),
        ...INITIAL_REPORTS.map(({ id, ...data }) =>
          addDoc(collection(db, "reports"), { ...data, createdAt: serverTimestamp() })
        ),
        ...INITIAL_DONATIONS.map(({ id, ...data }) =>
          addDoc(collection(db, "donations"), { ...data, createdAt: serverTimestamp() })
        )
      ]);
      showToast("¡Base de datos inicializada con éxito en Firebase Firestore!");
    } catch (err) {
      showToast("Error al inicializar colecciones: " + err.message, "error");
    }
  };

  const handleAdoptionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPetForAdoption) return;

    const newApplication = {
      petId: selectedPetForAdoption.id,
      petName: selectedPetForAdoption.name,
      userId: currentUser?.id || "anon",
      ...adoptionForm,
      status: "Pendiente",
      date: new Date().toISOString().split("T")[0]
    };

    try {
      let newId = "adp-" + Date.now();
      if (isFirebaseConfigured) {
        const docRef = await addDoc(collection(db, "adoptions"), {
          ...newApplication,
          createdAt: serverTimestamp()
        });
        newId = docRef.id;
        if (!selectedPetForAdoption.id.startsWith("pet-")) {
          await updateDoc(doc(db, "pets", selectedPetForAdoption.id), {
            adopterProfile: newApplication
          });
        }
      }
      setAdoptions([{ id: newId, ...newApplication }, ...adoptions]);
      setPets(
        pets.map((p) =>
          p.id === selectedPetForAdoption.id ? { ...p, adopterProfile: newApplication } : p
        )
      );
      setSelectedPetForAdoption(null);
      showToast("¡Solicitud enviada! Puedes seguir su estado en 'Mi Perfil'.");
    } catch (error) {
      showToast("Error al enviar solicitud: " + error.message, "error");
    }
  };

  const handleAdoptionDecision = async (application, decision) => {
    if (!isAdmin) return;
    try {
      if (isFirebaseConfigured && !application.id.startsWith("adp-")) {
        await updateDoc(doc(db, "adoptions", application.id), { status: decision });
      }
      setAdoptions(
        adoptions.map((a) => (a.id === application.id ? { ...a, status: decision } : a))
      );

      if (decision === "Aprobada") {
        const targetPet = pets.find(
          (p) => p.id === application.petId || p.name === application.petName
        );
        if (targetPet) {
          if (isFirebaseConfigured && !targetPet.id.startsWith("pet-")) {
            await updateDoc(doc(db, "pets", targetPet.id), {
              status: "adoptado",
              adopterProfile: application
            });
          }
          setPets(
            pets.map((p) =>
              p.id === targetPet.id
                ? { ...p, status: "adoptado", adopterProfile: application }
                : p
            )
          );
        }
      }
      showToast(`Solicitud de ${application.applicantName} marcada como ${decision.toUpperCase()}.`);
    } catch (err) {
      showToast("Error al actualizar dictamen: " + err.message, "error");
    }
  };

  const handleSavePet = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast("Acción exclusiva para Administradores.", "error");
      return;
    }
    const fallbackImg = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=700&q=80";
    const payload = {
      ...petForm,
      image: petForm.image || fallbackImg,
      status: editingPet ? editingPet.status : "disponible",
      adopterProfile: editingPet ? editingPet.adopterProfile : null
    };

    try {
      if (editingPet) {
        if (isFirebaseConfigured && !editingPet.id.startsWith("pet-")) {
          await updateDoc(doc(db, "pets", editingPet.id), payload);
        }
        setPets(pets.map((p) => (p.id === editingPet.id ? { ...payload, id: editingPet.id } : p)));
        showToast(`Expediente de ${payload.name} actualizado.`);
      } else {
        let newId = "pet-" + Date.now();
        if (isFirebaseConfigured) {
          const docRef = await addDoc(collection(db, "pets"), {
            ...payload,
            createdAt: serverTimestamp()
          });
          newId = docRef.id;
        }
        setPets([{ id: newId, ...payload }, ...pets]);
        showToast(`¡${payload.name} dado de alta con éxito!`);
      }
      setPetModalOpen(false);
      setEditingPet(null);
    } catch (error) {
      showToast("Error guardando mascota: " + error.message, "error");
    }
  };

  const confirmDeletePet = async () => {
    if (!petToDelete || !isAdmin) return;
    try {
      if (isFirebaseConfigured && !petToDelete.id.startsWith("pet-")) {
        await deleteDoc(doc(db, "pets", petToDelete.id));
      }
      setPets(pets.filter((p) => p.id !== petToDelete.id));
      showToast(`Registro de ${petToDelete.name} eliminado.`);
      setPetToDelete(null);
    } catch (error) {
      showToast("Error al eliminar: " + error.message, "error");
    }
  };

  const togglePetStatus = async (pet) => {
    if (!isAdmin) return;
    const newStatus = pet.status === "disponible" ? "adoptado" : "disponible";
    try {
      if (isFirebaseConfigured && !pet.id.startsWith("pet-")) {
        await updateDoc(doc(db, "pets", pet.id), { status: newStatus });
      }
      setPets(pets.map((p) => (p.id === pet.id ? { ...p, status: newStatus } : p)));
      showToast(`Estado de ${pet.name} actualizado a ${newStatus.toUpperCase()}.`);
    } catch (error) {
      showToast("Error al cambiar estado: " + error.message, "error");
    }
  };

  const handleSaveShelter = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    const badgesArray = shelterForm.badgesText
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);

    const payload = {
      name: shelterForm.name,
      location: shelterForm.location,
      description: shelterForm.description,
      badges: badgesArray.length ? badgesArray : ["Verificado"],
      rating: Number(shelterForm.rating) || 5.0,
      web: shelterForm.web,
      instagram: shelterForm.instagram,
      whatsapp: shelterForm.whatsapp,
      logo: shelterForm.logo || ""
    };

    try {
      if (editingShelter) {
        if (isFirebaseConfigured && !editingShelter.id.startsWith("sh-")) {
          await updateDoc(doc(db, "shelters", editingShelter.id), payload);
        }
        setShelters(
          shelters.map((s) => (s.id === editingShelter.id ? { ...payload, id: s.id } : s))
        );
        showToast(`Refugio "${payload.name}" actualizado.`);
      } else {
        let newId = "sh-" + Date.now();
        if (isFirebaseConfigured) {
          const docRef = await addDoc(collection(db, "shelters"), {
            ...payload,
            createdAt: serverTimestamp()
          });
          newId = docRef.id;
        }
        setShelters([{ id: newId, ...payload }, ...shelters]);
        showToast(`¡Refugio "${payload.name}" dado de alta exitosamente!`);
      }
      setShelterModalOpen(false);
      setEditingShelter(null);
    } catch (err) {
      showToast("Error guardando refugio: " + err.message, "error");
    }
  };

  const handleDeleteShelter = async (shelter) => {
    if (!isAdmin) return;
    try {
      if (isFirebaseConfigured && !shelter.id.startsWith("sh-")) {
        await deleteDoc(doc(db, "shelters", shelter.id));
      }
      setShelters(shelters.filter((s) => s.id !== shelter.id));
      showToast(`Refugio ${shelter.name} eliminado.`);
    } catch (err) {
      showToast("Error eliminando refugio: " + err.message, "error");
    }
  };

  // Publicar Reporte de Mascota Perdida con Teléfono/WhatsApp y GPS
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    const defaultImg = "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80";
    const newReport = {
      ...reportForm,
      userId: currentUser?.id || "anon",
      image: reportForm.image || defaultImg,
      status: "Activo"
    };

    try {
      let newId = "rep-" + Date.now();
      if (isFirebaseConfigured) {
        const docRef = await addDoc(collection(db, "reports"), {
          ...newReport,
          createdAt: serverTimestamp()
        });
        newId = docRef.id;
      }
      setReports([{ id: newId, ...newReport }, ...reports]);
      setReportForm({
        animalName: "",
        species: "Perro",
        reportType: "Perdido",
        description: "",
        location: "",
        lat: null,
        lng: null,
        date: "",
        reporterName: currentUser?.name || "",
        reporterPhone: currentUser?.phone || "",
        image: ""
      });
      setAlertSubTab("ver");
      showToast("¡Alerta publicada con atajo de WhatsApp y ubicación GPS!");
    } catch (error) {
      showToast("Error al publicar reporte: " + error.message, "error");
    }
  };

  const handleToggleReportStatus = async (rep) => {
    if (!isAdmin) return;
    const order = ["Activo", "En resguardo", "Reintegrado"];
    const nextStatus = order[(order.indexOf(rep.status) + 1) % order.length];
    try {
      if (isFirebaseConfigured && !rep.id.startsWith("rep-")) {
        await updateDoc(doc(db, "reports", rep.id), { status: nextStatus });
      }
      setReports(reports.map((r) => (r.id === rep.id ? { ...r, status: nextStatus } : r)));
      showToast(`Reporte de ${rep.animalName} cambiado a ${nextStatus}.`);
    } catch (err) {
      showToast("Error actualizando reporte: " + err.message, "error");
    }
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    const finalAmount = customAmount ? Number(customAmount) : selectedAmount;
    if (!finalAmount || finalAmount <= 0) {
      showToast("Ingresa un monto válido.", "error");
      return;
    }

    const impactMap = {
      150: "3 días de alimento",
      300: "Vacuna y desparasitación",
      500: "Esterilización",
      1000: "Rescate + kit inicial"
    };
    const impactLabel = impactMap[finalAmount] || "Fondo médico y bienestar animal";
    const folioCode = "HUE-" + Math.floor(1000 + Math.random() * 9000);

    const newDonation = {
      folio: folioCode,
      donor: donorName.trim() || "Donante Solidario",
      donorEmail: currentUser?.email || "-",
      userId: currentUser?.id || "anon",
      shelter: selectedShelterForDonation,
      amount: finalAmount,
      impact: impactLabel,
      method: paymentMethod,
      date: new Date().toISOString().split("T")[0]
    };

    try {
      let newId = "don-" + Date.now();
      if (isFirebaseConfigured) {
        const docRef = await addDoc(collection(db, "donations"), {
          ...newDonation,
          createdAt: serverTimestamp()
        });
        newId = docRef.id;
      }
      setDonations([{ id: newId, ...newDonation }, ...donations]);
      setCustomAmount("");
      showToast(`¡Donación exitosa! Folio ${folioCode} por $${finalAmount} MXN para ${selectedShelterForDonation}.`);
    } catch (error) {
      showToast("Error registrando donación: " + error.message, "error");
    }
  };

  const isPetRecommendedForUser = (pet) => {
    if (!currentUser) return false;
    const sizeOk =
      !currentUser.preferredSize ||
      currentUser.preferredSize === "Todos" ||
      currentUser.preferredSize === pet.size;
    const speciesOk =
      !currentUser.preferredSpecies ||
      currentUser.preferredSpecies === "Ambos" ||
      currentUser.preferredSpecies === (pet.species || "Perro");
    return sizeOk && speciesOk;
  };

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSize = sizeFilter === "Todos" || pet.size === sizeFilter;
    const matchesStatus = statusFilter === "Todos" || pet.status === statusFilter;
    const matchesPreference = !onlyMatches || isPetRecommendedForUser(pet);
    return matchesSearch && matchesSize && matchesStatus && matchesPreference;
  });

  const totalDonationsAmount = donations.reduce((acc, item) => acc + Number(item.amount || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-sky-100 via-cyan-50 to-blue-100 text-slate-800 relative overflow-x-hidden">
      <div className="pointer-events-none fixed top-16 left-6 w-44 h-44 rounded-full bg-white/50 blur-xl -z-10" />
      <div className="pointer-events-none fixed top-1/3 right-10 w-64 h-64 rounded-full bg-sky-300/30 blur-2xl -z-10" />
      <div className="pointer-events-none fixed bottom-16 left-1/4 w-52 h-52 rounded-full bg-cyan-200/40 blur-xl -z-10" />

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-sky-400/30 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {/* ==========================================
          BARRA DE NAVEGACIÓN FLOTANTE
      ========================================== */}
      <header className="sticky top-4 z-40 px-4 sm:px-8">
        <nav className="max-w-6xl mx-auto bg-white/85 backdrop-blur-md border border-white/90 shadow-lg shadow-sky-900/5 rounded-full px-5 py-3 flex items-center justify-between transition-all">
          <button
            type="button"
            onClick={() => setActiveTab("inicio")}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
              <PawPrint className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-sky-900 block leading-none">
                HUELLITAS
              </span>
              <span className="text-[11px] text-sky-600 font-semibold">
                Adopción & Bienestar
              </span>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-1">
            {[
              { id: "inicio", label: "Inicio", show: true },
              { id: "nosotros", label: "Sobre Nosotros", show: true },
              { id: "adopciones", label: "Adopciones", show: true },
              { id: "alertas", label: "Alertas GPS", show: true },
              { id: "refugios", label: "Refugios", show: true },
              { id: "donaciones", label: "Donaciones", show: true },
              { id: "perfil", label: "Mi Perfil", show: Boolean(currentUser) },
              { id: "admin", label: "Panel Admin", show: isAdmin }
            ]
              .filter((i) => i.show)
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-2 rounded-full text-xs xl:text-sm font-semibold transition cursor-pointer ${
                    activeTab === item.id
                      ? "bg-sky-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-sky-100/80 hover:text-sky-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 pl-2 pr-3 py-1 rounded-full">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-sky-300"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center">
                    {currentUser.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab("perfil")}
                  className="text-left cursor-pointer"
                >
                  <span className="text-xs font-bold text-sky-950 block leading-none">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-semibold text-sky-600">
                    {currentUser.role}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab("auth")}
                className="px-5 py-2 rounded-full text-sm font-bold bg-linear-to-r from-sky-500 to-cyan-500 text-white shadow-md hover:from-sky-600 hover:to-cyan-600 transition cursor-pointer"
              >
                Iniciar Sesión
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full bg-sky-100 text-sky-800 hover:bg-sky-200"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 max-w-6xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl p-4 shadow-xl border border-sky-100 flex flex-col gap-1.5">
            {[
              { id: "inicio", label: "Inicio", show: true },
              { id: "nosotros", label: "Sobre Nosotros", show: true },
              { id: "adopciones", label: "Adopciones", show: true },
              { id: "alertas", label: "Alertas GPS (Perdidos)", show: true },
              { id: "refugios", label: "Refugios Aliados", show: true },
              { id: "donaciones", label: "Donaciones", show: true },
              { id: "perfil", label: "Mi Perfil y Preferencias", show: Boolean(currentUser) },
              { id: "admin", label: "Panel de Administración", show: isAdmin },
              { id: "auth", label: currentUser ? "Cambiar Cuenta" : "Iniciar Sesión / Registro", show: true }
            ]
              .filter((i) => i.show)
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-2xl text-sm font-semibold transition ${
                    activeTab === item.id
                      ? "bg-sky-600 text-white"
                      : "text-slate-700 hover:bg-sky-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8">
        {/* ==========================================
            1. VISTA: INICIO
        ========================================== */}
        {activeTab === "inicio" && (
          <div className="space-y-10">
            <section className="bg-white/65 backdrop-blur-md border border-white/80 rounded-3xl p-6 sm:p-10 shadow-xl shadow-sky-900/5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-white aspect-4/3">
                  <img
                    src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80"
                    alt="Bienvenidos a Huellitas"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-sky-800 flex items-center gap-1.5 shadow">
                    <PawPrint className="w-3.5 h-3.5 text-sky-600" /> Plataforma Verificada
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  <Sparkles className="w-3.5 h-3.5" /> Red Digital de Adopción, Rescate GPS y Bienestar Animal
                </span>
                <h1 className="text-3xl sm:text-5xl font-black text-sky-950 tracking-tight leading-tight">
                  Bienvenidos a <span className="text-sky-600">Huellitas</span>
                </h1>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                  Conectamos refugios, clínicas veterinarias y ciudadanos para erradicar el abandono animal mediante expedientes digitales, alertas geolocalizadas por GPS y adopción responsable.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("adopciones")}
                    className="px-6 py-3 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-lg shadow-sky-600/25 transition cursor-pointer flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" /> Explorar Mascotas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("alertas");
                      setAlertSubTab("reportar");
                    }}
                    className="px-6 py-3 rounded-full bg-white hover:bg-sky-50 text-sky-900 font-bold text-sm border border-sky-200 shadow-sm transition cursor-pointer flex items-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-500" /> Reportar Mascota con GPS
                  </button>
                </div>
              </div>
            </section>

            <section className="bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-extrabold text-sky-950 mb-6 flex items-center gap-2">
                <PawPrint className="w-6 h-6 text-sky-600" /> ¿Por qué Adoptar en Huellitas?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 p-5 rounded-2xl border border-sky-100 shadow-sm">
                  <span className="text-2xl">🐾</span>
                  <h3 className="font-bold text-sky-900 mt-2">Salvas una vida</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Brindas una segunda oportunidad a un animal rescatado y liberas espacio en el refugio para recibir a otro.
                  </p>
                </div>
                <div className="bg-white/80 p-5 rounded-2xl border border-sky-100 shadow-sm">
                  <span className="text-2xl">📍</span>
                  <h3 className="font-bold text-sky-900 mt-2">Alertas GPS y WhatsApp Directo</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Si una mascota se extravía, comparte su ubicación exacta por GPS desde el celular y recibe mensajes al instante en WhatsApp.
                  </p>
                </div>
                <div className="bg-white/80 p-5 rounded-2xl border border-sky-100 shadow-sm">
                  <span className="text-2xl">🌎</span>
                  <h3 className="font-bold text-sky-900 mt-2">Adopción segura y verificada</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Todas las mascotas cuentan con expediente de salud, control de vacunación y validación de refugios aliados.
                  </p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/70 backdrop-blur-md border border-white/90 rounded-3xl p-6 shadow-lg flex flex-col justify-between hover:-translate-y-1 transition">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-sky-950">Refugios Aliados</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Directorio oficial de albergues verificados por la administración con contacto directo vía WhatsApp e Instagram.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("refugios")}
                  className="mt-6 w-full py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs transition cursor-pointer"
                >
                  Ver Directorio ({shelters.length}) →
                </button>
              </div>

              <div className="bg-white/70 backdrop-blur-md border border-white/90 rounded-3xl p-6 shadow-lg flex flex-col justify-between hover:-translate-y-1 transition">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-4">
                    <PawPrint className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-sky-950">Adopción en Línea</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Postúlate desde tu cuenta y da seguimiento en tiempo real al dictamen de tu solicitud de pre-adopción.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("adopciones")}
                  className="mt-6 w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Ir al Catálogo →
                </button>
              </div>

              <div className="bg-white/70 backdrop-blur-md border border-white/90 rounded-3xl p-6 shadow-lg flex flex-col justify-between hover:-translate-y-1 transition">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                    <HandHeart className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-sky-950">Donaciones Transparentes</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Elige el refugio que deseas apoyar y genera un folio único de trazabilidad para alimento, vacunas o esterilizaciones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("donaciones")}
                  className="mt-6 w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer"
                >
                  Donar Ahora →
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ==========================================
            2. VISTA: SOBRE NOSOTROS
        ========================================== */}
        {activeTab === "nosotros" && (
          <div className="space-y-8">
            <div className="bg-white/75 backdrop-blur-md border border-white rounded-3xl p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                  División de Informática y Computación • UTN
                </span>
                <h2 className="text-3xl font-black text-sky-950">Nosotros</h2>
                <p className="text-slate-700 leading-relaxed">
                  Somos un equipo que cree que todos los perritos y gatitos merecen una segunda oportunidad. Compartimos información verificada de fundaciones, promovemos la adopción responsable, gestionamos el control de esterilizaciones y fomentamos el amor y respeto hacia los animales.
                </p>
              </div>
              <div className="lg:col-span-5">
                <img
                  src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=700&q=80"
                  alt="Cachorro Golden"
                  className="rounded-2xl shadow-md border-4 border-white w-full h-60 object-cover"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/75 backdrop-blur-md border border-white rounded-3xl p-6 shadow-lg">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600">01 • Nuestro Propósito</span>
                <h3 className="text-xl font-black text-sky-950 mt-1 mb-3">Objetivo</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Promover la adopción responsable y difundir el trabajo de las fundaciones que luchan por darle a cada perrito una vida digna y un hogar lleno de amor.
                </p>
              </div>

              <div className="bg-white/75 backdrop-blur-md border border-white rounded-3xl p-6 shadow-lg">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600">02 • Labor Diaria</span>
                <h3 className="text-xl font-black text-sky-950 mt-1 mb-3">Misión</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Brindar una plataforma que dé visibilidad a las fundaciones dedicadas al rescate y cuidado de perritos, facilitando la conexión entre ellas y las personas interesadas en apoyar o adoptar.
                </p>
              </div>

              <div className="bg-white/75 backdrop-blur-md border border-white rounded-3xl p-6 shadow-lg">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600">03 • Proyección</span>
                <h3 className="text-xl font-black text-sky-950 mt-1 mb-3">Visión</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Ser el principal punto de encuentro digital en el que cada fundación pueda compartir su labor, logrando que más animales encuentren un hogar amoroso.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            3. VISTA: ADOPCIONES
        ========================================== */}
        {activeTab === "adopciones" && (
          <div className="space-y-8">
            <div className="bg-white/75 backdrop-blur-md border border-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-sky-950">
                  Catálogo de Adopción Responsable
                </h2>
                <p className="text-sm text-slate-600">
                  {currentUser
                    ? `Preferencias activas de ${currentUser.name}: Especie (${currentUser.preferredSpecies || "Ambos"}) • Tamaño (${currentUser.preferredSize || "Todos"})`
                    : "Inicia sesión para recibir recomendaciones personalizadas según tu hogar."}
                </p>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPet(null);
                    setPetForm({
                      name: "",
                      species: "Perro",
                      age: "",
                      size: "Pequeño",
                      location: "Nezahualcóyotl, Edo. Méx.",
                      shelterName: shelters[0]?.name || "Fundación Patitas Neza",
                      vaccinated: true,
                      sterilized: true,
                      description: "",
                      needs: "",
                      image: ""
                    });
                    setPetModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow flex items-center gap-2 self-start md:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Dar de Alta Mascota (Admin)
                </button>
              )}
            </div>

            <div className="bg-white/75 backdrop-blur-md border border-white rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="search-pets"
                  type="text"
                  aria-label="Buscar mascotas"
                  placeholder="Buscar por nombre, zona..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-sky-200 text-sm"
                />
              </div>

              <select
                id="filter-size"
                aria-label="Filtrar por tamaño"
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white border border-sky-200 text-sm"
              >
                <option value="Todos">Todos los tamaños</option>
                <option value="Pequeño">Tamaño: Pequeño</option>
                <option value="Mediano">Tamaño: Mediano</option>
                <option value="Grande">Tamaño: Grande</option>
              </select>

              <select
                id="filter-status"
                aria-label="Filtrar por estado"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white border border-sky-200 text-sm"
              >
                <option value="Todos">Todos los estados</option>
                <option value="disponible">Disponibles</option>
                <option value="adoptado">Adoptados</option>
              </select>

              <button
                type="button"
                onClick={() => setOnlyMatches(!onlyMatches)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  onlyMatches
                    ? "bg-amber-500 text-white border-amber-500 shadow"
                    : "bg-white text-sky-900 border-sky-200 hover:bg-sky-50"
                }`}
              >
                <Sparkles className="w-4 h-4" /> Solo mi Match Ideal
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPets.map((pet) => {
                const isFav = currentUser?.favorites?.includes(pet.id);
                const isMatch = isPetRecommendedForUser(pet);
                return (
                  <div
                    key={pet.id}
                    className="bg-sky-200/55 backdrop-blur-md border-2 border-white rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between hover:shadow-xl transition"
                  >
                    <div>
                      <div className="relative h-56 overflow-hidden p-3 pb-0">
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="w-full h-full object-cover rounded-2xl shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => toggleFavoritePet(pet.id)}
                          aria-label="Guardar en favoritos"
                          className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow cursor-pointer hover:scale-110 transition"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFav ? "fill-rose-500 text-rose-500" : "text-slate-600"
                            }`}
                          />
                        </button>

                        <span
                          className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-extrabold uppercase shadow ${
                            pet.status === "disponible"
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-700 text-white"
                          }`}
                        >
                          {pet.status}
                        </span>

                        {isMatch && pet.status === "disponible" && (
                          <span className="absolute bottom-3 left-6 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-400 text-slate-950 shadow flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Match Ideal para ti
                          </span>
                        )}
                      </div>

                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-black text-sky-950">{pet.name}</h3>
                          <span className="text-xs font-bold text-sky-800 bg-white/80 px-2.5 py-1 rounded-full">
                            {pet.age}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-sky-900">
                          {pet.species || "Perro"} • Tamaño: <span className="font-normal">{pet.size}</span> •{" "}
                          <span className="font-normal">{pet.location}</span>
                        </p>

                        {pet.shelterName && (
                          <p className="text-[11px] font-bold text-sky-700">
                            Refugio: {pet.shelterName}
                          </p>
                        )}

                        <p className="text-sm text-slate-700 leading-relaxed">
                          {pet.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {pet.vaccinated && (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                              ✓ Vacunado
                            </span>
                          )}
                          {pet.sterilized && (
                            <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-800 text-[11px] font-bold">
                              ✓ Esterilizado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 space-y-2">
                      {pet.status === "disponible" && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentUser) {
                              showToast("Inicia sesión con Google o tu correo para postularte a la adopción.", "info");
                              setActiveTab("auth");
                              return;
                            }
                            setSelectedPetForAdoption(pet);
                          }}
                          className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs uppercase tracking-wider shadow transition cursor-pointer"
                        >
                          SOLICITAR ADOPCIÓN DE {pet.name}
                        </button>
                      )}

                      {isAdmin && (
                        <div className="pt-2 border-t border-white/60 space-y-1.5">
                          <div className="text-[10px] font-extrabold uppercase text-sky-900 tracking-wider">
                            Controles de Administrador
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPet(pet);
                                setPetForm({
                                  name: pet.name,
                                  species: pet.species || "Perro",
                                  age: pet.age,
                                  size: pet.size,
                                  location: pet.location,
                                  shelterName: pet.shelterName || "Fundación Patitas Neza",
                                  vaccinated: pet.vaccinated ?? true,
                                  sterilized: pet.sterilized ?? true,
                                  description: pet.description,
                                  needs: pet.needs || "",
                                  image: pet.image
                                });
                                setPetModalOpen(true);
                              }}
                              className="py-1.5 px-3 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => setPetToDelete(pet)}
                              className="py-1.5 px-3 rounded-xl bg-white/80 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Eliminar
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setAdopterProfileModal(
                                pet.adopterProfile || {
                                  applicantName: "Sin postulantes aún",
                                  email: "-",
                                  phone: "-",
                                  reason: "Aún no se ha registrado solicitud para esta mascota.",
                                  hasOtherPets: "-",
                                  space: "-",
                                  carePlan: "-"
                                }
                              )
                            }
                            className="w-full py-1.5 rounded-xl bg-white/75 hover:bg-white text-sky-900 text-xs font-semibold shadow-sm cursor-pointer"
                          >
                            Ver perfil del adoptante
                          </button>

                          <button
                            type="button"
                            onClick={() => togglePetStatus(pet)}
                            className="w-full py-1.5 rounded-xl bg-sky-900/15 hover:bg-sky-900/25 text-sky-950 text-xs font-bold cursor-pointer"
                          >
                            {pet.status === "disponible"
                              ? "Marcar como Adoptado"
                              : "Marcar como Disponible"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==========================================
            4. VISTA: ALERTAS CON GPS Y ATAJO DE WHATSAPP / TELÉFONO
        ========================================== */}
        {activeTab === "alertas" && (
          <div className="space-y-8">
            <div className="bg-white/75 backdrop-blur-md border border-white rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-sky-950">
                  Alertas de Mascotas Perdidas con GPS y WhatsApp
                </h2>
                <p className="text-sm text-slate-600">
                  Contacta al dueño en un clic por WhatsApp o llamada y consulta la ubicación exacta en el mapa.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAlertSubTab("ver")}
                  className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
                    alertSubTab === "ver"
                      ? "bg-sky-600 text-white shadow"
                      : "bg-white text-slate-700 border border-sky-200"
                  }`}
                >
                  Ver Reportes ({reports.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAlertSubTab("reportar")}
                  className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
                    alertSubTab === "reportar"
                      ? "bg-amber-500 text-white shadow"
                      : "bg-white text-slate-700 border border-sky-200"
                  }`}
                >
                  + Publicar Mascota Perdida
                </button>
              </div>
            </div>

            {alertSubTab === "ver" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((rep) => {
                  const rawPhone = rep.reporterPhone || rep.reporterContact || "";
                  const cleanWa = formatWhatsAppNumber(rawPhone);
                  const cleanTel = String(rawPhone).replace(/\D/g, "");
                  const waMessage = encodeURIComponent(
                    `Hola ${rep.reporterName}, vi tu alerta publicada en Huellitas sobre "${rep.animalName}" (${rep.location}). Me comunico para darte información:`
                  );
                  const googleMapsUrl =
                    rep.lat && rep.lng
                      ? `https://www.google.com/maps?q=${rep.lat},${rep.lng}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rep.location || "")}`;

                  return (
                    <div
                      key={rep.id}
                      className="bg-white/85 backdrop-blur-md border border-white rounded-3xl p-5 shadow-lg flex flex-col justify-between gap-4"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <img
                          src={rep.image}
                          alt={rep.animalName}
                          className="w-full sm:w-40 h-44 object-cover rounded-2xl shrink-0 border-2 border-sky-100"
                        />
                        <div className="space-y-2 text-sm w-full">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                rep.status === "Reintegrado"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {rep.species} • {rep.reportType || "Perdido"} ({rep.status})
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> {rep.date}
                            </span>
                          </div>

                          <h3 className="text-lg font-black text-sky-950">
                            {rep.animalName}
                          </h3>

                          <p className="text-slate-600 text-xs leading-relaxed">
                            <strong>Descripción:</strong> {rep.description}
                          </p>

                          <p className="text-slate-700 text-xs flex items-start gap-1">
                            <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <span>
                              <strong>Ubicación:</strong> {rep.location}
                              {rep.lat && rep.lng && (
                                <span className="block text-[11px] text-emerald-700 font-semibold">
                                  📍 Coordenadas GPS: {rep.lat}, {rep.lng}
                                </span>
                              )}
                            </span>
                          </p>

                          <div className="text-xs text-sky-950 font-bold pt-1">
                            Dueño / Reportante: {rep.reporterName} • Tel: {rawPhone}
                          </div>
                        </div>
                      </div>

                      {/* ATAJOS DIRECTOS: WHATSAPP, LLAMADA Y MAPA GPS */}
                      <div className="pt-3 border-t border-sky-100 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {cleanWa && (
                          <a
                            href={`https://wa.me/${cleanWa}?text=${waMessage}`}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition"
                          >
                            <MessageCircle className="w-4 h-4" /> WhatsApp Dueño
                          </a>
                        )}

                        {cleanTel && (
                          <a
                            href={`tel:${cleanTel}`}
                            className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition"
                          >
                            <PhoneCall className="w-4 h-4" /> Llamar Ahora
                          </a>
                        )}

                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                        >
                          <Navigation className="w-4 h-4 text-sky-700" /> Ver en Mapa GPS
                        </a>
                      </div>

                      {isAdmin && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleToggleReportStatus(rep)}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                          >
                            Admin: Cambiar Estado ({rep.status})
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <form
                onSubmit={handleReportSubmit}
                className="bg-white/85 backdrop-blur-md border border-white rounded-3xl p-6 sm:p-8 shadow-xl max-w-3xl mx-auto space-y-5"
              >
                <div>
                  <h3 className="text-xl font-black text-sky-950">
                    Publicar Alerta de Mascota Perdida o Encontrada
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Al publicar, se creará automáticamente un botón directo a tu WhatsApp, llamada telefónica y el pin de ubicación GPS en Google Maps.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="rep-animal-name" className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre del animal *
                    </label>
                    <input
                      id="rep-animal-name"
                      type="text"
                      required
                      placeholder="Ej. Rocky, Michi..."
                      value={reportForm.animalName}
                      onChange={(e) => setReportForm({ ...reportForm, animalName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="rep-species" className="block text-xs font-bold text-slate-700 mb-1">
                      Especie *
                    </label>
                    <select
                      id="rep-species"
                      value={reportForm.species}
                      onChange={(e) => setReportForm({ ...reportForm, species: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm"
                    >
                      <option value="Perro">Perro</option>
                      <option value="Gato">Gato</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="rep-type" className="block text-xs font-bold text-slate-700 mb-1">
                      Tipo de Reporte *
                    </label>
                    <select
                      id="rep-type"
                      value={reportForm.reportType}
                      onChange={(e) => setReportForm({ ...reportForm, reportType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm"
                    >
                      <option value="Perdido">Perdí a mi mascota</option>
                      <option value="Avistado / Encontrado">Encontré / Vi una mascota perdida</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="rep-description" className="block text-xs font-bold text-slate-700 mb-1">
                    Describe al animal (raza, tamaño, color, collar o señas particulares) *
                  </label>
                  <textarea
                    id="rep-description"
                    rows={3}
                    required
                    placeholder="Ej. Perro mestizo mediano, color café con mancha blanca en el pecho..."
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm"
                  />
                </div>

                {/* UBICACIÓN CON BOTÓN DE GPS EN TIEMPO REAL DESDE EL CELULAR */}
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label htmlFor="rep-location" className="block text-xs font-extrabold text-sky-950">
                      Ubicación donde se perdió o se encuentra actualmente *
                    </label>
                    <button
                      type="button"
                      onClick={handleGetGpsLocation}
                      disabled={isGettingGps}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow cursor-pointer transition"
                    >
                      <Navigation className="w-4 h-4" />
                      {isGettingGps
                        ? "Obteniendo coordenadas GPS..."
                        : "📍 Usar mi ubicación actual por GPS"}
                    </button>
                  </div>

                  <input
                    id="rep-location"
                    type="text"
                    required
                    placeholder="Toque el botón GPS o escriba calle, colonia y municipio"
                    value={reportForm.location}
                    onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-300 text-sm"
                  />

                  {reportForm.lat && reportForm.lng && (
                    <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                      <span className="font-bold">
                        ✓ Coordenadas GPS capturadas: Lat {reportForm.lat}, Lng {reportForm.lng}
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${reportForm.lat},${reportForm.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-extrabold"
                      >
                        Probar Mapa
                      </a>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="rep-date" className="block text-xs font-bold text-slate-700 mb-1">
                      Fecha del extravío o hallazgo *
                    </label>
                    <input
                      id="rep-date"
                      type="date"
                      required
                      value={reportForm.date}
                      onChange={(e) => setReportForm({ ...reportForm, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="rep-file-upload" className="block text-xs font-bold text-slate-700 mb-1">
                      Fotografía desde tu celular o PC *
                    </label>
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="rep-file-upload"
                        className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0"
                      >
                        <Upload className="w-4 h-4" /> Subir Foto
                        <input
                          id="rep-file-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "report")}
                          className="hidden"
                        />
                      </label>
                      {reportForm.image && (
                        <img
                          src={reportForm.image}
                          alt="Vista previa"
                          className="w-10 h-10 rounded-xl object-cover border border-sky-300"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* DATOS DE CONTACTO DIRECTO (WHATSAPP Y TELÉFONO) */}
                <div className="pt-3 border-t border-sky-100 space-y-3">
                  <h4 className="text-sm font-extrabold text-sky-950">
                    Datos del Dueño / Reportante (Para crear el atajo directo de WhatsApp y Llamada)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="rep-reporter-name" className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre de contacto *
                      </label>
                      <input
                        id="rep-reporter-name"
                        type="text"
                        required
                        placeholder="Ej. Ana López"
                        value={reportForm.reporterName}
                        onChange={(e) => setReportForm({ ...reportForm, reporterName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="rep-reporter-phone" className="block text-xs font-bold text-slate-700 mb-1">
                        Número de WhatsApp / Teléfono (10 dígitos) *
                      </label>
                      <input
                        id="rep-reporter-phone"
                        type="tel"
                        required
                        placeholder="Ej. 5544332211"
                        value={reportForm.reporterPhone}
                        onChange={(e) => setReportForm({ ...reportForm, reporterPhone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-lg transition cursor-pointer"
                >
                  Publicar Alerta con Atajo de WhatsApp y Ubicación GPS
                </button>
              </form>
            )}
          </div>
        )}

        {/* ==========================================
            5. VISTA: REFUGIOS ALIADOS
        ========================================== */}
        {activeTab === "refugios" && (
          <div className="space-y-8">
            <div className="bg-white/75 backdrop-blur-md border border-white rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-sky-950">
                  Refugios y Fundaciones Aliadas
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Directorio oficial de albergues verificados para rescate, clínica veterinaria y adopción.
                </p>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingShelter(null);
                    setShelterForm({
                      name: "",
                      location: "",
                      description: "",
                      badgesText: "Verificado, Esterilización, Rescate Activo",
                      rating: "5.0",
                      web: "https://",
                      instagram: "@",
                      whatsapp: "5255",
                      logo: ""
                    });
                    setShelterModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Dar de Alta Refugio (Admin)
                </button>
              )}
            </div>

            <div className="space-y-4">
              {shelters.map((sh) => (
                <div
                  key={sh.id}
                  className="bg-white/80 backdrop-blur-md border border-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    {sh.logo ? (
                      <img
                        src={sh.logo}
                        alt={sh.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-200 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-sky-500 to-cyan-400 text-white flex items-center justify-center shrink-0 shadow-md">
                        <PawPrint className="w-8 h-8" />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-sky-950">{sh.name}</h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {sh.rating}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-sky-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {sh.location}
                      </p>
                      <p className="text-sm text-slate-600 max-w-2xl">{sh.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(sh.badges || []).map((badge) => (
                          <span
                            key={badge}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800"
                          >
                            ✓ {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                    <a
                      href={sh.web}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 text-xs font-bold flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Web
                    </a>
                    <a
                      href={`https://instagram.com/${(sh.instagram || "").replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold flex items-center gap-1.5"
                    >
                      <InstagramIcon className="w-3.5 h-3.5" /> {sh.instagram}
                    </a>
                    <a
                      href={`https://wa.me/${formatWhatsAppNumber(sh.whatsapp)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteShelter(sh)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                        title="Eliminar Refugio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            6. VISTA: DONACIONES
        ========================================== */}
        {activeTab === "donaciones" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white/80 backdrop-blur-md border border-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                  Trazabilidad Financiera con Folio Único
                </span>
                <h2 className="text-3xl font-black text-sky-950">
                  Dona y cambia una vida
                </h2>
                <p className="text-sm text-slate-600">
                  Selecciona el monto y el refugio destinatario. Tu aportación queda registrada en tiempo real en el libro de finanzas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { amount: 150, desc: "3 días de alimento", icon: "🥣" },
                  { amount: 300, desc: "Vacuna y desparasitación", icon: "💉" },
                  { amount: 500, desc: "Esterilización", icon: "🩺" },
                  { amount: 1000, desc: "Rescate + kit inicial", icon: "🚑" }
                ].map((tier) => (
                  <button
                    key={tier.amount}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(tier.amount);
                      setCustomAmount("");
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer ${
                      selectedAmount === tier.amount && !customAmount
                        ? "border-sky-600 bg-sky-50/90 shadow-md"
                        : "border-sky-100 bg-white hover:border-sky-300"
                    }`}
                  >
                    <span className="text-2xl">{tier.icon}</span>
                    <div className="text-xl font-black text-sky-950 mt-2">
                      ${tier.amount} <span className="text-xs font-semibold">MXN</span>
                    </div>
                    <p className="text-xs font-semibold text-sky-700 mt-1">
                      “{tier.desc}”
                    </p>
                  </button>
                ))}
              </div>

              <form onSubmit={handleDonationSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="don-donor-name" className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre del Donante
                    </label>
                    <input
                      id="don-donor-name"
                      type="text"
                      placeholder="Tu nombre o Anónimo"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="don-shelter-select" className="block text-xs font-bold text-slate-700 mb-1">
                      Refugio Destinatario
                    </label>
                    <select
                      id="don-shelter-select"
                      value={selectedShelterForDonation}
                      onChange={(e) => setSelectedShelterForDonation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm font-semibold"
                    >
                      {shelters.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="don-custom-amount" className="block text-xs font-bold text-slate-700 mb-1">
                      Monto Libre (Opcional en MXN)
                    </label>
                    <input
                      id="don-custom-amount"
                      type="number"
                      min="10"
                      placeholder="Otro monto ($ MXN)"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="don-payment-method" className="block text-xs font-bold text-slate-700 mb-1">
                      Método de Pago
                    </label>
                    <select
                      id="don-payment-method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm font-semibold"
                    >
                      <option value="Mercado Pago">Mercado Pago</option>
                      <option value="PayPal">PayPal</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-linear-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-extrabold text-sm shadow-lg transition cursor-pointer"
                >
                  Confirmar Donación de ${customAmount || selectedAmount} MXN a {selectedShelterForDonation}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==========================================
            7. VISTA: MI PERFIL Y PREFERENCIAS DE USUARIO (SIN BOTÓN DE CAMBIO DE ROL)
        ========================================== */}
        {activeTab === "perfil" && currentUser && (
          <div className="space-y-8">
            <div className="bg-white/85 backdrop-blur-md border border-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {profileForm.avatar ? (
                    <img
                      src={profileForm.avatar}
                      alt={profileForm.name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-400 shadow"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-sky-600 text-white text-2xl font-black flex items-center justify-center shadow">
                      {profileForm.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <label
                    htmlFor="profile-avatar-upload"
                    className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-sky-900 text-white cursor-pointer shadow hover:bg-sky-700"
                    title="Cambiar foto de perfil"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <input
                      id="profile-avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "avatar")}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-sky-100 text-sky-800">
                    Cuenta Verificada • Rol: {currentUser.role}
                  </span>
                  <h2 className="text-2xl font-black text-sky-950 mt-1">{currentUser.name}</h2>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <form
                onSubmit={handleSaveProfile}
                className="lg:col-span-7 bg-white/85 backdrop-blur-md border border-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-5"
              >
                <div className="flex items-center gap-2 border-b border-sky-100 pb-3">
                  <Settings className="w-5 h-5 text-sky-600" />
                  <h3 className="text-lg font-black text-sky-950">
                    Mis Datos Personales y Preferencias de Adopción
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prof-name" className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      id="prof-name"
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white border border-sky-200 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="prof-phone" className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono / WhatsApp (10 dígitos)
                    </label>
                    <input
                      id="prof-phone"
                      type="tel"
                      required
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white border border-sky-200 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prof-municipality" className="block text-xs font-bold text-slate-700 mb-1">
                      Alcaldía o Municipio
                    </label>
                    <input
                      id="prof-municipality"
                      type="text"
                      value={profileForm.municipality}
                      onChange={(e) => setProfileForm({ ...profileForm, municipality: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white border border-sky-200 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="prof-housing" className="block text-xs font-bold text-slate-700 mb-1">
                      Tipo de Vivienda
                    </label>
                    <select
                      id="prof-housing"
                      value={profileForm.housingType}
                      onChange={(e) => setProfileForm({ ...profileForm, housingType: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white border border-sky-200 text-sm"
                    >
                      <option value="Casa con patio">Casa con patio bardeado</option>
                      <option value="Casa con jardín">Casa con jardín amplio</option>
                      <option value="Departamento amplio">Departamento amplio</option>
                      <option value="Departamento pequeño">Departamento pequeño</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-sky-100">
                  <div>
                    <label htmlFor="prof-other-pets" className="block text-xs font-bold text-slate-700 mb-1">
                      ¿Tienes otros animales?
                    </label>
                    <select
                      id="prof-other-pets"
                      value={profileForm.hasOtherPets}
                      onChange={(e) => setProfileForm({ ...profileForm, hasOtherPets: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-sm"
                    >
                      <option value="No">No</option>
                      <option value="Sí">Sí</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="prof-pref-species" className="block text-xs font-bold text-slate-700 mb-1">
                      Especie Preferida
                    </label>
                    <select
                      id="prof-pref-species"
                      value={profileForm.preferredSpecies}
                      onChange={(e) => setProfileForm({ ...profileForm, preferredSpecies: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-sm"
                    >
                      <option value="Ambos">Perros y Gatos</option>
                      <option value="Perro">Perros</option>
                      <option value="Gato">Gatos</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="prof-pref-size" className="block text-xs font-bold text-slate-700 mb-1">
                      Tamaño Preferido
                    </label>
                    <select
                      id="prof-pref-size"
                      value={profileForm.preferredSize}
                      onChange={(e) => setProfileForm({ ...profileForm, preferredSize: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-sm"
                    >
                      <option value="Todos">Cualquier tamaño</option>
                      <option value="Pequeño">Pequeño</option>
                      <option value="Mediano">Mediano</option>
                      <option value="Grande">Grande</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="prof-bio" className="block text-xs font-bold text-slate-700 mb-1">
                    Sobre mí y mi experiencia cuidando mascotas
                  </label>
                  <textarea
                    id="prof-bio"
                    rows={2}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white border border-sky-200 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow transition cursor-pointer"
                >
                  Guardar Perfil y Preferencias en Firebase
                </button>
              </form>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white/85 backdrop-blur-md border border-white rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-black text-sky-950">
                    Mis Solicitudes de Adopción
                  </h3>
                  {adoptions.filter((a) => a.email === currentUser.email || a.userId === currentUser.id).length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Aún no has enviado solicitudes de adopción.
                    </p>
                  ) : (
                    adoptions
                      .filter((a) => a.email === currentUser.email || a.userId === currentUser.id)
                      .map((app) => (
                        <div
                          key={app.id}
                          className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-black text-sky-950 block">
                              Mascota: {app.petName}
                            </span>
                            <span className="text-slate-500">Fecha: {app.date}</span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full font-extrabold ${
                              app.status === "Aprobada"
                                ? "bg-emerald-100 text-emerald-800"
                                : app.status === "Rechazada"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {app.status || "Pendiente"}
                          </span>
                        </div>
                      ))
                  )}
                </div>

                <div className="bg-white/85 backdrop-blur-md border border-white rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-black text-sky-950">
                    Mis Mascotas Favoritas ({(currentUser.favorites || []).length})
                  </h3>
                  <div className="space-y-2">
                    {pets
                      .filter((p) => (currentUser.favorites || []).includes(p.id))
                      .map((favPet) => (
                        <div
                          key={favPet.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 border border-sky-100 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={favPet.image}
                              alt={favPet.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <span className="font-bold text-sky-950 block">{favPet.name}</span>
                              <span className="text-slate-500">{favPet.size} • {favPet.status}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab("adopciones")}
                            className="px-3 py-1 rounded-lg bg-sky-600 text-white font-bold cursor-pointer"
                          >
                            Ver
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            8. VISTA: AUTENTICACIÓN (USUARIOS Y PORTAL ADMIN VERIFICADO EN FIREBASE)
        ========================================== */}
        {activeTab === "auth" && (
          <div className="max-w-md mx-auto bg-white/90 backdrop-blur-md border border-white rounded-3xl p-8 shadow-xl space-y-6">
            <div className="grid grid-cols-2 bg-sky-100 p-1 rounded-2xl text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setAuthPortal("user")}
                className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authPortal === "user" ? "bg-white text-sky-950 shadow" : "text-sky-700"
                }`}
              >
                <UserCheck className="w-4 h-4" /> Acceso Usuarios
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthPortal("admin");
                  setAuthMode("login");
                }}
                className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authPortal === "admin" ? "bg-sky-950 text-white shadow" : "text-sky-700"
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Portal Admin
              </button>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-sky-950">
                {authPortal === "admin"
                  ? "Acceso Exclusivo Administrador"
                  : authMode === "login"
                  ? "Iniciar Sesión"
                  : "Crear Cuenta de Adoptante"}
              </h2>
              <p className="text-xs text-slate-500">
                {authPortal === "admin"
                  ? "Ingresa con tu correo y contraseña. El sistema validará en Firebase Firestore que tu cuenta tenga el rol 'Administrador'."
                  : "Inicia sesión con Google o tu correo para guardar preferencias, adoptar y publicar alertas GPS."}
              </p>
            </div>

            {authPortal === "user" && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm flex items-center justify-center gap-3 transition cursor-pointer"
                >
                  <GoogleIcon className="w-5 h-5" /> Continuar con Google
                </button>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="h-px bg-slate-200 flex-1" />
                  <span>o con tu correo</span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authPortal === "user" && authMode === "register" && (
                <>
                  <div>
                    <label htmlFor="auth-name" className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre completo *
                    </label>
                    <input
                      id="auth-name"
                      type="text"
                      required
                      placeholder="Nombre y apellidos"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="auth-phone" className="block text-xs font-bold text-slate-700 mb-1">
                        WhatsApp / Teléfono *
                      </label>
                      <input
                        id="auth-phone"
                        type="tel"
                        required
                        placeholder="55..."
                        value={authForm.phone}
                        onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="auth-municipality" className="block text-xs font-bold text-slate-700 mb-1">
                        Municipio / Alcaldía *
                      </label>
                      <input
                        id="auth-municipality"
                        type="text"
                        required
                        placeholder="Nezahualcóyotl"
                        value={authForm.municipality}
                        onChange={(e) => setAuthForm({ ...authForm, municipality: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-xs font-bold text-slate-700 mb-1">
                  Correo electrónico *
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="correo@ejemplo.com"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm"
                />
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña *
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sm"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow transition cursor-pointer ${
                  authPortal === "admin"
                    ? "bg-sky-950 hover:bg-slate-800"
                    : "bg-sky-600 hover:bg-sky-700"
                }`}
              >
                {authPortal === "admin"
                  ? "Ingresar como Administrador"
                  : authMode === "login"
                  ? "Iniciar Sesión"
                  : "Completar Registro"}
              </button>
            </form>

            {authPortal === "user" && (
              <div className="text-center pt-2 border-t border-sky-100">
                {authMode === "login" ? (
                  <p className="text-xs text-slate-600">
                    ¿No tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("register")}
                      className="font-extrabold text-sky-700 underline cursor-pointer"
                    >
                      REGÍSTRATE AQUÍ
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-600">
                    ¿Ya tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="font-extrabold text-sky-700 underline cursor-pointer"
                    >
                      INICIAR SESIÓN
                    </button>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            9. VISTA: PANEL DE ADMINISTRACIÓN (PROTECCIÓN ESTRICTA)
        ========================================== */}
        {activeTab === "admin" && (
          !isAdmin ? (
            <div className="max-w-lg mx-auto bg-white/90 rounded-3xl p-8 text-center shadow-xl space-y-4">
              <Lock className="w-12 h-12 text-rose-500 mx-auto" />
              <h2 className="text-2xl font-black text-sky-950">Acceso Restringido</h2>
              <p className="text-sm text-slate-600">
                Esta sección requiere permisos de <strong>Administrador</strong> asignados directamente en la colección <code>users</code> de Firebase Firestore.
              </p>
              <button
                type="button"
                onClick={() => {
                  setAuthPortal("admin");
                  setActiveTab("auth");
                }}
                className="px-5 py-2.5 rounded-xl bg-sky-950 text-white text-xs font-bold cursor-pointer"
              >
                Ir a Login de Administrador
              </button>
            </div>
          ) : (
            <div className="bg-white/85 backdrop-blur-md border border-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-155">
              <aside className="lg:col-span-3 bg-sky-950 text-white p-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-sky-800">
                    <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center font-black">
                      AD
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-sky-300 font-bold">
                        Administrador Verificado
                      </div>
                      <div className="text-sm font-extrabold">
                        {currentUser?.name || "Admin TechNova"}
                      </div>
                    </div>
                  </div>

                  <nav className="space-y-1.5">
                    {[
                      { id: "general", label: "Vista General", icon: BarChart3 },
                      { id: "solicitudes", label: `Adopciones (${adoptions.length})`, icon: Heart },
                      { id: "animales", label: `Mascotas (${pets.length})`, icon: PawPrint },
                      { id: "refugios", label: `Refugios (${shelters.length})`, icon: Building2 },
                      { id: "reportes", label: `Reportes GPS (${reports.length})`, icon: MapPin },
                      { id: "usuarios", label: `Usuarios (${usersList.length})`, icon: Users },
                      { id: "finanzas", label: "Finanzas y Donaciones", icon: DollarSign }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAdminSubTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                            adminSubTab === item.id
                              ? "bg-sky-500 text-white shadow"
                              : "text-sky-200 hover:bg-sky-900"
                          }`}
                        >
                          <Icon className="w-4 h-4" /> {item.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-6 border-t border-sky-800 space-y-2">
                  <div className="text-[11px] text-sky-300 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    Firestore: <span className="font-bold text-emerald-400">Sincronizado</span>
                  </div>
                  <button
                    type="button"
                    onClick={seedFirebaseDatabase}
                    className="w-full py-2 px-3 rounded-xl bg-sky-800 hover:bg-sky-700 text-sky-100 text-xs font-bold transition cursor-pointer"
                  >
                    Sembrar Datos Semilla en Nube
                  </button>
                </div>
              </aside>

              <section className="lg:col-span-9 p-6 sm:p-8 space-y-6 overflow-y-auto">
                {adminSubTab === "general" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-sky-950">
                        Panel de Control Ejecutivo — Huellitas
                      </h2>
                      <p className="text-xs text-slate-500">
                        Monitoreo en tiempo real de adopciones, refugios aliados, reportes GPS y recursos financieros.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl">
                        <span className="text-xs text-slate-500 font-bold">Mascotas Registradas</span>
                        <div className="text-2xl font-black text-sky-950 mt-1">{pets.length}</div>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                        <span className="text-xs text-slate-500 font-bold">Refugios Aliados</span>
                        <div className="text-2xl font-black text-emerald-700 mt-1">{shelters.length}</div>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                        <span className="text-xs text-slate-500 font-bold">Solicitudes Adopción</span>
                        <div className="text-2xl font-black text-amber-700 mt-1">{adoptions.length}</div>
                      </div>
                      <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                        <span className="text-xs text-slate-500 font-bold">Fondo Recaudado</span>
                        <div className="text-2xl font-black text-rose-700 mt-1">
                          ${totalDonationsAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm">
                      <h3 className="text-sm font-extrabold text-sky-950 mb-4">
                        Evolución de la Media de Vida y Bienestar de Perros y Gatos Rescatados (Años)
                      </h3>
                      <div className="grid grid-cols-6 gap-3 items-end h-44 pt-6 px-2 border-b border-slate-200">
                        {[
                          { year: "2021", dogs: 65, cats: 72, label: "13.2a" },
                          { year: "2022", dogs: 70, cats: 78, label: "13.5a" },
                          { year: "2023", dogs: 76, cats: 82, label: "13.8a" },
                          { year: "2024", dogs: 82, cats: 88, label: "14.0a" },
                          { year: "2025", dogs: 88, cats: 94, label: "14.3a" },
                          { year: "2026", dogs: 95, cats: 100, label: "14.6a" }
                        ].map((bar) => (
                          <div key={bar.year} className="flex flex-col items-center gap-1 h-full justify-end">
                            <span className="text-[10px] font-bold text-slate-500">{bar.label}</span>
                            <div className="w-full flex gap-1 items-end justify-center h-full">
                              <div style={{ height: `${bar.dogs}%` }} className="w-3 sm:w-4 bg-emerald-500 rounded-t-md" />
                              <div style={{ height: `${bar.cats}%` }} className="w-3 sm:w-4 bg-amber-500 rounded-t-md" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-600">{bar.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {adminSubTab === "solicitudes" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black text-sky-950">
                      Validación de Solicitudes de Pre-Adopción
                    </h2>
                    <div className="space-y-4">
                      {adoptions.map((app) => (
                        <div
                          key={app.id}
                          className="p-5 rounded-2xl bg-sky-50/80 border border-sky-100 flex flex-col md:flex-row justify-between gap-4 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-sky-950">
                                Mascota: {app.petName}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-bold ${
                                  app.status === "Aprobada"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : app.status === "Rechazada"
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {app.status || "Pendiente"}
                              </span>
                            </div>
                            <p><strong>Postulante:</strong> {app.applicantName} ({app.email} • {app.phone})</p>
                            <p><strong>Vivienda / Espacio:</strong> {app.space} • <strong>¿Otros animales?:</strong> {app.hasOtherPets}</p>
                            <p><strong>Motivo y Plan de Cuidado:</strong> {app.reason} — {app.carePlan}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleAdoptionDecision(app, "Aprobada")}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                            >
                              Aprobar Adopción
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdoptionDecision(app, "Rechazada")}
                              className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold cursor-pointer"
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminSubTab === "animales" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black text-sky-950">
                        Catálogo de Animales (CRUD)
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPet(null);
                          setPetForm({
                            name: "",
                            species: "Perro",
                            age: "",
                            size: "Pequeño",
                            location: "Nezahualcóyotl, Edo. Méx.",
                            shelterName: shelters[0]?.name || "Fundación Patitas Neza",
                            vaccinated: true,
                            sterilized: true,
                            description: "",
                            needs: "",
                            image: ""
                          });
                          setPetModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Subir Nueva Mascota
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-sky-100 text-sky-950">
                            <th className="p-3 rounded-l-xl">Foto / Nombre</th>
                            <th className="p-3">Refugio</th>
                            <th className="p-3">Tamaño</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3 rounded-r-xl text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sky-100">
                          {pets.map((p) => (
                            <tr key={p.id} className="hover:bg-sky-50/60">
                              <td className="p-3 font-bold text-sky-950 flex items-center gap-2.5">
                                <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover" />
                                <span>{p.name} ({p.age})</span>
                              </td>
                              <td className="p-3">{p.shelterName || "Fundación Patitas Neza"}</td>
                              <td className="p-3">{p.size}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold ${
                                    p.status === "disponible"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </td>
                              <td className="p-3 text-right space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => togglePetStatus(p)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold cursor-pointer"
                                >
                                  Estado
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPetToDelete(p)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 font-bold cursor-pointer"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminSubTab === "refugios" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-black text-sky-950">
                          Gestión de Refugios Aliados
                        </h2>
                        <p className="text-xs text-slate-500">
                          Da de alta nuevas fundaciones, clínicas o albergues verificados.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingShelter(null);
                          setShelterForm({
                            name: "",
                            location: "",
                            description: "",
                            badgesText: "Verificado, Esterilización, Rescate Activo",
                            rating: "5.0",
                            web: "https://",
                            instagram: "@",
                            whatsapp: "5255",
                            logo: ""
                          });
                          setShelterModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Dar de Alta Refugio
                      </button>
                    </div>

                    <div className="space-y-3">
                      {shelters.map((s) => (
                        <div
                          key={s.id}
                          className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between gap-4 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            {s.logo ? (
                              <img src={s.logo} alt={s.name} className="w-12 h-12 rounded-xl object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                                RF
                              </div>
                            )}
                            <div>
                              <span className="text-sm font-black text-sky-950 block">{s.name}</span>
                              <span className="text-slate-500">{s.location} • WhatsApp: {s.whatsapp}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingShelter(s);
                                setShelterForm({
                                  name: s.name,
                                  location: s.location,
                                  description: s.description,
                                  badgesText: (s.badges || []).join(", "),
                                  rating: String(s.rating || "5.0"),
                                  web: s.web || "",
                                  instagram: s.instagram || "",
                                  whatsapp: s.whatsapp || "",
                                  logo: s.logo || ""
                                });
                                setShelterModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-sky-100 text-sky-900 font-bold cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteShelter(s)}
                              className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-700 font-bold cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminSubTab === "reportes" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black text-sky-950">
                      Gestión de Reportes GPS de Mascotas Perdidas
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reports.map((rep) => (
                        <div key={rep.id} className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 flex gap-3.5 items-center">
                          <img src={rep.image} alt={rep.animalName} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                          <div className="space-y-1 text-xs w-full">
                            <div className="flex justify-between">
                              <span className="font-black text-sky-950">{rep.animalName}</span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                                {rep.status}
                              </span>
                            </div>
                            <p className="text-slate-600">{rep.description}</p>
                            <p className="text-sky-800 font-bold">{rep.location}</p>
                            <button
                              type="button"
                              onClick={() => handleToggleReportStatus(rep)}
                              className="mt-1 px-3 py-1 rounded-lg bg-sky-600 text-white font-bold cursor-pointer"
                            >
                              Rotar Estado (Activo / Resguardo / Reintegrado)
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminSubTab === "usuarios" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black text-sky-950">
                      Usuarios Registrados y Preferencias de Perfil
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-sky-100 text-sky-950 font-extrabold">
                            <th className="p-3 rounded-l-xl">Nombre</th>
                            <th className="p-3">Contacto</th>
                            <th className="p-3">Municipio / Vivienda</th>
                            <th className="p-3">Preferencia</th>
                            <th className="p-3 rounded-r-xl">Rol en Firebase</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sky-100">
                          {usersList.map((u) => (
                            <tr key={u.email} className="hover:bg-sky-50/70">
                              <td className="p-3 font-bold text-slate-900">{u.name}</td>
                              <td className="p-3 text-slate-600">{u.email}<br />{u.phone}</td>
                              <td className="p-3 text-slate-600">{u.municipality}<br />{u.housingType || "Casa"}</td>
                              <td className="p-3 text-sky-800 font-semibold">
                                {u.preferredSpecies || "Ambos"} • {u.preferredSize || "Todos"}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full font-bold ${
                                    u.role === "Administrador"
                                      ? "bg-sky-900 text-white"
                                      : "bg-sky-100 text-sky-800"
                                  }`}
                                >
                                  {u.role || "Usuario"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminSubTab === "finanzas" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black text-sky-950">
                      Libro Mayor de Donaciones y Trazabilidad
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-800">Recaudación Bruta</span>
                        <div className="text-2xl font-black text-emerald-700 mt-1">
                          ${totalDonationsAmount.toLocaleString()} MXN
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
                        <span className="text-xs font-bold text-sky-800">Fondo Esterilización y Clínica (65%)</span>
                        <div className="text-2xl font-black text-sky-900 mt-1">
                          ${Math.round(totalDonationsAmount * 0.65).toLocaleString()} MXN
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                        <span className="text-xs font-bold text-amber-800">Fondo Alimento e Insumos (35%)</span>
                        <div className="text-2xl font-black text-amber-800 mt-1">
                          ${Math.round(totalDonationsAmount * 0.35).toLocaleString()} MXN
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-sky-100 text-sky-950">
                            <th className="p-3 rounded-l-xl">Folio</th>
                            <th className="p-3">Donante</th>
                            <th className="p-3">Refugio Destino</th>
                            <th className="p-3">Monto / Impacto</th>
                            <th className="p-3 rounded-r-xl">Pasarela / Fecha</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sky-100">
                          {donations.map((d) => (
                            <tr key={d.id}>
                              <td className="p-3 font-mono font-bold text-sky-800">{d.folio || "HUE-1024"}</td>
                              <td className="p-3 font-bold">{d.donor}</td>
                              <td className="p-3 text-sky-900 font-semibold">{d.shelter || "Fundación Patitas Neza"}</td>
                              <td className="p-3">
                                <span className="font-extrabold text-emerald-700">${d.amount} MXN</span>
                                <span className="block text-[11px] text-slate-500">{d.impact}</span>
                              </td>
                              <td className="p-3 text-slate-500">{d.method} • {d.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )
        )}
      </main>

      {/* ==========================================
          MODALES DEL SISTEMA
      ========================================== */}
      {selectedPetForAdoption && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-sky-200/95 border-2 border-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-sky-950">
                  Solicitud de Pre-Adopción
                </h3>
                <p className="text-xs font-bold text-sky-800">
                  Mascota seleccionada: {selectedPetForAdoption.name} ({selectedPetForAdoption.shelterName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPetForAdoption(null)}
                className="p-2 rounded-full bg-white/70 hover:bg-white text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdoptionSubmit} className="space-y-3 text-sm">
              <input
                id="adopt-applicant-name"
                aria-label="Nombre completo"
                type="text"
                required
                placeholder="Nombre completo *"
                value={adoptionForm.applicantName}
                onChange={(e) => setAdoptionForm({ ...adoptionForm, applicantName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-300"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  id="adopt-email"
                  aria-label="Correo electrónico"
                  type="email"
                  required
                  placeholder="Correo electrónico *"
                  value={adoptionForm.email}
                  onChange={(e) => setAdoptionForm({ ...adoptionForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-300"
                />
                <input
                  id="adopt-phone"
                  aria-label="Teléfono"
                  type="tel"
                  required
                  placeholder="Teléfono *"
                  value={adoptionForm.phone}
                  onChange={(e) => setAdoptionForm({ ...adoptionForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-300"
                />
              </div>

              <div>
                <label htmlFor="adopt-reason" className="block text-xs font-bold text-sky-950 mb-1">
                  ¿Por qué deseas adoptar a {selectedPetForAdoption.name}?
                </label>
                <textarea
                  id="adopt-reason"
                  rows={2}
                  required
                  value={adoptionForm.reason}
                  onChange={(e) => setAdoptionForm({ ...adoptionForm, reason: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-sky-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="adopt-other-pets" className="block text-xs font-bold text-sky-950 mb-1">
                    ¿Tienes otros animales?
                  </label>
                  <select
                    id="adopt-other-pets"
                    value={adoptionForm.hasOtherPets}
                    onChange={(e) => setAdoptionForm({ ...adoptionForm, hasOtherPets: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white border border-sky-300"
                  >
                    <option value="No">No</option>
                    <option value="Sí">Sí</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="adopt-space" className="block text-xs font-bold text-sky-950 mb-1">
                    Espacio disponible en tu hogar
                  </label>
                  <input
                    id="adopt-space"
                    type="text"
                    required
                    value={adoptionForm.space}
                    onChange={(e) => setAdoptionForm({ ...adoptionForm, space: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white border border-sky-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="adopt-care-plan" className="block text-xs font-bold text-sky-950 mb-1">
                  Plan de alimentación, paseos y atención veterinaria:
                </label>
                <input
                  id="adopt-care-plan"
                  type="text"
                  required
                  value={adoptionForm.carePlan}
                  onChange={(e) => setAdoptionForm({ ...adoptionForm, carePlan: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-sky-300"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-sky-950 pt-1">
                <input
                  id="adopt-terms"
                  type="checkbox"
                  required
                  checked={adoptionForm.acceptTerms}
                  onChange={(e) => setAdoptionForm({ ...adoptionForm, acceptTerms: e.target.checked })}
                  className="rounded text-sky-600"
                />
                <label htmlFor="adopt-terms">
                  Acepto seguimiento post-adopción y carta de tenencia responsable.
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold uppercase tracking-wider text-xs shadow-lg cursor-pointer"
              >
                ENVIAR SOLICITUD AL REFUGIO
              </button>
            </form>
          </div>
        </div>
      )}

      {petModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800/95 border border-sky-400/40 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-white my-8">
            <div className="bg-cyan-600 px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base">
                {editingPet ? "Editar Expediente de Mascota" : "Agregar Nueva Mascota"}
              </h3>
              <button type="button" onClick={() => setPetModalOpen(false)} className="cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePet} className="p-6 space-y-3 text-slate-900 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <input
                  id="pet-name"
                  aria-label="Nombre de la mascota"
                  type="text"
                  required
                  placeholder="Nombre (ej. Lya)"
                  value={petForm.name}
                  onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white"
                />
                <input
                  id="pet-age"
                  aria-label="Edad"
                  type="text"
                  required
                  placeholder="Edad (ej. 1 año)"
                  value={petForm.age}
                  onChange={(e) => setPetForm({ ...petForm, age: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  id="pet-species"
                  aria-label="Especie"
                  value={petForm.species}
                  onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white"
                >
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                </select>
                <select
                  id="pet-size"
                  aria-label="Tamaño"
                  value={petForm.size}
                  onChange={(e) => setPetForm({ ...petForm, size: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white"
                >
                  <option value="Pequeño">Pequeño</option>
                  <option value="Mediano">Mediano</option>
                  <option value="Grande">Grande</option>
                </select>
              </div>

              <select
                id="pet-shelter"
                aria-label="Refugio responsable"
                value={petForm.shelterName}
                onChange={(e) => setPetForm({ ...petForm, shelterName: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white"
              >
                {shelters.map((s) => (
                  <option key={s.id} value={s.name}>
                    Refugio: {s.name}
                  </option>
                ))}
              </select>

              <input
                id="pet-location"
                aria-label="Dirección o municipio"
                type="text"
                required
                placeholder="Ubicación (ej. Nezahualcóyotl)"
                value={petForm.location}
                onChange={(e) => setPetForm({ ...petForm, location: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white"
              />

              <textarea
                id="pet-description"
                aria-label="Descripción"
                rows={2}
                required
                placeholder="Descripción de personalidad y salud"
                value={petForm.description}
                onChange={(e) => setPetForm({ ...petForm, description: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white"
              />

              <div className="p-3 rounded-2xl bg-slate-700/70 border border-cyan-400/40 text-white space-y-2">
                <label htmlFor="pet-file-input" className="block text-xs font-bold text-cyan-200">
                  Fotografía de la mascota (Subir desde tu dispositivo)
                </label>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="pet-file-input"
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Upload className="w-4 h-4" /> Elegir Archivo
                    <input
                      id="pet-file-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "pet")}
                      className="hidden"
                    />
                  </label>
                  {petForm.image && (
                    <img
                      src={petForm.image}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-white"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPetModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-slate-500/80 hover:bg-slate-500 text-white text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold shadow cursor-pointer"
                >
                  {editingPet ? "Guardar Cambios" : "Registrar Mascota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {shelterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800/95 border border-sky-400/40 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-white my-8">
            <div className="bg-cyan-600 px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base">
                {editingShelter ? "Editar Refugio Aliado" : "Dar de Alta Nuevo Refugio"}
              </h3>
              <button type="button" onClick={() => setShelterModalOpen(false)} className="cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShelter} className="p-6 space-y-3 text-slate-900 text-sm">
              <input
                id="sh-name"
                aria-label="Nombre del refugio"
                type="text"
                required
                placeholder="Nombre del Refugio o Fundación *"
                value={shelterForm.name}
                onChange={(e) => setShelterForm({ ...shelterForm, name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white"
              />
              <input
                id="sh-location"
                aria-label="Ubicación del refugio"
                type="text"
                required
                placeholder="Ubicación (ej. Nezahualcóyotl, Edo. Méx.) *"
                value={shelterForm.location}
                onChange={(e) => setShelterForm({ ...shelterForm, location: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white"
              />
              <textarea
                id="sh-description"
                aria-label="Descripción del refugio"
                rows={2}
                required
                placeholder="Descripción de su labor *"
                value={shelterForm.description}
                onChange={(e) => setShelterForm({ ...shelterForm, description: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white"
              />
              <input
                id="sh-badges"
                aria-label="Insignias separadas por coma"
                type="text"
                placeholder="Insignias separadas por coma (Verificado, Clínica)"
                value={shelterForm.badgesText}
                onChange={(e) => setShelterForm({ ...shelterForm, badgesText: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  id="sh-whatsapp"
                  aria-label="WhatsApp"
                  type="text"
                  required
                  placeholder="WhatsApp (5255...)"
                  value={shelterForm.whatsapp}
                  onChange={(e) => setShelterForm({ ...shelterForm, whatsapp: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white"
                />
                <input
                  id="sh-instagram"
                  aria-label="Instagram"
                  type="text"
                  placeholder="Instagram (@refugio)"
                  value={shelterForm.instagram}
                  onChange={(e) => setShelterForm({ ...shelterForm, instagram: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white"
                />
              </div>
              <input
                id="sh-web"
                aria-label="Sitio web"
                type="url"
                placeholder="Sitio Web (https://...)"
                value={shelterForm.web}
                onChange={(e) => setShelterForm({ ...shelterForm, web: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white"
              />

              <div className="p-3 rounded-2xl bg-slate-700/70 border border-cyan-400/40 text-white space-y-2">
                <label htmlFor="sh-logo-input" className="block text-xs font-bold text-cyan-200">
                  Logotipo del Refugio (Subir desde tu dispositivo)
                </label>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="sh-logo-input"
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" /> Subir Logo
                    <input
                      id="sh-logo-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "shelter")}
                      className="hidden"
                    />
                  </label>
                  {shelterForm.logo && (
                    <img src={shelterForm.logo} alt="Logo preview" className="w-11 h-11 rounded-xl object-cover" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setShelterModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-slate-500 text-white text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-cyan-500 text-slate-950 text-xs font-extrabold cursor-pointer"
                >
                  Guardar Refugio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {petToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800/95 border border-sky-400/40 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-white">
            <div className="bg-cyan-600 px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base">Eliminar Registro</h3>
              <button type="button" onClick={() => setPetToDelete(null)} className="cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-slate-200">
                ¿Estás seguro de eliminar a <strong>{petToDelete.name}</strong> del catálogo?
              </p>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPetToDelete(null)}
                  className="px-6 py-2.5 rounded-full bg-slate-500/80 hover:bg-slate-500 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDeletePet}
                  className="px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-xs font-bold shadow cursor-pointer"
                >
                  Eliminar Definitivamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {adopterProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="text-lg font-black text-sky-950">
                Expediente del Adoptante
              </h3>
              <button type="button" onClick={() => setAdopterProfileModal(null)} className="cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              <p><strong>Nombre:</strong> {adopterProfileModal.applicantName}</p>
              <p><strong>Correo:</strong> {adopterProfileModal.email}</p>
              <p><strong>Teléfono:</strong> {adopterProfileModal.phone}</p>
              <p><strong>Motivo:</strong> {adopterProfileModal.reason}</p>
              <p><strong>¿Otros animales?:</strong> {adopterProfileModal.hasOtherPets}</p>
              <p><strong>Espacio disponible:</strong> {adopterProfileModal.space}</p>
              <p><strong>Plan de cuidado:</strong> {adopterProfileModal.carePlan}</p>
            </div>
            <button
              type="button"
              onClick={() => setAdopterProfileModal(null)}
              className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs cursor-pointer"
            >
              Cerrar Expediente
            </button>
          </div>
        </div>
      )}

      <footer className="mt-12 px-4 sm:px-8 pb-6">
        <div className="max-w-6xl mx-auto bg-white/75 backdrop-blur-md border border-white rounded-3xl px-6 py-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-bold text-sky-950">
            <PawPrint className="w-4 h-4 text-sky-600" />
            <span>© 2025–2026 Huellitas. Todos los derechos reservados.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 font-semibold text-sky-800">
            <button type="button" onClick={() => setActiveTab("nosotros")} className="hover:underline cursor-pointer">
              Sobre Nosotros
            </button>
            <button type="button" onClick={() => setActiveTab("adopciones")} className="hover:underline cursor-pointer">
              Adopciones
            </button>
            <button type="button" onClick={() => setActiveTab("refugios")} className="hover:underline cursor-pointer">
              Refugios
            </button>
            <button type="button" onClick={() => setActiveTab("donaciones")} className="hover:underline cursor-pointer">
              Donaciones
            </button>
          </div>
         <div className="text-[11px] text-slate-500 text-center sm:text-right">
  Desarrollado por <strong>Cody Go</strong> y <strong>TechNova</strong>
</div>
        </div>
      </footer>
    </div>
  );
}