// Shared hospital WhatsApp destination (international format, digits only).
const HOSPITAL_WHATSAPP = "917407722918";
// Separate Google Apps Script Web App URLs for the two different spreadsheets.
const APPOINTMENT_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwrRenOUFV5tC8c7ylDSzgSE89t0DndJ4pISmkSpBr_J6W3WP-N8hPpKzdU04dShQNj/exec";
const CONTACT_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzzWGJhxc8BRBuWvOVZkwKmi_T7-0Mi4IV8vd8YOxn2fBIBVpHssggwRqmcG_9_0a6E9w/exec";

function openWhatsAppDraft(message) {
  const url = `https://wa.me/${HOSPITAL_WHATSAPP}?text=${encodeURIComponent(message)}`;
  const chat = window.open(url, "_blank");
  if (chat) {
    chat.opener = null;
  } else {
    window.location.assign(url);
  }
}

function setSubmissionStatus(element, state, message) {
  element.textContent = message;
  element.classList.remove("is-loading", "is-success", "is-error", "is-info");
  element.classList.add("is-visible", `is-${state}`);
}

// Mobile navigation
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const menuIsOpen = navigation.classList.toggle("open");

    menuButton.setAttribute("aria-expanded", String(menuIsOpen));
    menuButton.setAttribute(
      "aria-label",
      menuIsOpen ? "Close menu" : "Open menu"
    );
    menuButton.textContent = menuIsOpen ? "×" : "☰";
  });

  navigation.querySelectorAll("a, button[data-close-mobile-nav]").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open menu");
      menuButton.textContent = "☰";
    });
  });
}


// Hero background photo carousel
const backgroundSlides = document.querySelector(".hero-bg-slides");
const backgroundDots = document.querySelectorAll(".hero-bg-dot");
const heroSection = document.querySelector(".hero-section");

if (backgroundSlides && backgroundDots.length > 0) {
  let currentSlide = 0;
  let slideTimer;

  function showBackgroundSlide(index) {
    currentSlide = index;

    backgroundSlides.style.transform =
      `translateX(-${currentSlide * 100}%)`;

    backgroundDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentSlide;

      dot.classList.toggle("active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function startBackgroundSlide() {
    clearInterval(slideTimer);

    slideTimer = setInterval(() => {
      const nextSlide = (currentSlide + 1) % backgroundDots.length;
      showBackgroundSlide(nextSlide);
    }, 5000);
  }

  backgroundDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showBackgroundSlide(index);
      startBackgroundSlide();
    });
  });

  if (heroSection) {
    heroSection.addEventListener("mouseenter", () => {
      clearInterval(slideTimer);
    });

    heroSection.addEventListener("mouseleave", startBackgroundSlide);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(slideTimer);
    } else {
      startBackgroundSlide();
    }
  });

  startBackgroundSlide();
}


// Demo department and doctor information
const departmentInfo = {
  "general-medicine": {
    name: "General Medicine",
    description: "Everyday health consultations and ongoing care for adults.",
    services: [
      "General health consultations",
      "Common illness assessment",
      "Blood pressure and diabetes follow-up",
      "Preventive health guidance"
    ],
    doctors: [
      "Dr. Ayesha Rahman",
      "Dr. Rohan Chatterjee",
      "Dr. Farzana Islam",
      "Dr. Ananya Sen",
      "Dr. Mahmud Hasan"
    ]
  },

  cardiology: {
    name: "Cardiology",
    description: "Consultations for heart health and circulation concerns.",
    services: [
      "Heart health consultations",
      "Cardiac risk assessment",
      "Blood pressure follow-up",
      "Heart test consultations"
    ],
    doctors: [
      "Dr. Arif Chowdhury",
      "Dr. Debashis Roy",
      "Dr. Nusrat Karim",
      "Dr. Subarna Das",
      "Dr. Tanvir Hossain"
    ]
  },

  paediatrics: {
    name: "Paediatrics",
    description: "Healthcare consultations for infants, children, and teenagers.",
    services: [
      "Child health consultations",
      "Growth and development reviews",
      "Common childhood illness assessment",
      "Parent health guidance"
    ],
    doctors: [
      "Dr. Samira Khan",
      "Dr. Sayan Mukherjee",
      "Dr. Mousumi Saha",
      "Dr. Imran Ali",
      "Dr. Rituparna Bose"
    ]
  },

  "gynaecology-obstetrics": {
    name: "Gynaecology & Obstetrics",
    description: "Women's health, pregnancy, and maternity consultations.",
    services: [
      "Women's health consultations",
      "Pregnancy care consultations",
      "Menstrual health guidance",
      "Family planning consultations"
    ],
    doctors: [
      "Dr. Sadia Karim",
      "Dr. Anindita Roy",
      "Dr. Farhana Yasmin",
      "Dr. Payel Dutta",
      "Dr. Ishrat Jahan"
    ]
  },

  orthopaedics: {
    name: "Orthopaedics",
    description: "Consultations for bone, joint, and movement concerns.",
    services: [
      "Bone and joint consultations",
      "Fracture and injury assessment",
      "Arthritis consultations",
      "Mobility and rehabilitation guidance"
    ],
    doctors: [
      "Dr. Saif Ahmed",
      "Dr. Arindam Ghosh",
      "Dr. Mehedi Hasan",
      "Dr. Souvik Basu",
      "Dr. Rukhsar Akter"
    ]
  },

  neurology: {
    name: "Neurology",
    description: "Consultations for conditions affecting the brain and nerves.",
    services: [
      "Neurological consultations",
      "Headache and migraine assessment",
      "Nerve-related symptom assessment",
      "Follow-up care consultations"
    ],
    doctors: [
      "Dr. Nabil Hossain",
      "Dr. Soumya Banerjee",
      "Dr. Zahir Uddin",
      "Dr. Nandita Chakraborty",
      "Dr. Sohana Rahman"
    ]
  },

  "general-surgery": {
    name: "General Surgery",
    description: "Surgical consultations and guidance before and after procedures.",
    services: [
      "Surgical consultations",
      "Pre-operative assessment",
      "Post-operative follow-up",
      "Wound care consultations"
    ],
    doctors: [
      "Dr. Asif Mahmud",
      "Dr. Riya Sen",
      "Dr. Faisal Karim",
      "Dr. Soumen Das",
      "Dr. Ishrat Jahan"
    ]
  },

  emergency: {
    name: "Emergency Care",
    description: "For patients who need urgent medical assessment and assistance.",
    services: [
      "Urgent medical assessment",
      "Emergency first response",
      "Emergency contact information",
      "Directions to the emergency department"
    ],
    emergency: true
  },

  dermatology: {
    name: "Dermatology",
    description: "Consultations for skin, hair, and nail concerns.",
    services: [
      "Skin health consultations",
      "Rash and allergy assessment",
      "Hair and scalp consultations",
      "Nail condition assessment"
    ],
    doctors: [
      "Dr. Meera Das",
      "Dr. Farhan Ahmed",
      "Dr. Shreya Banerjee",
      "Dr. Nabila Sultana",
      "Dr. Kunal Roy"
    ]
  },

  ophthalmology: {
    name: "Ophthalmology",
    description: "Eye health consultations and vision care.",
    services: [
      "Eye health consultations",
      "Vision assessment",
      "Eye irritation and infection assessment",
      "Follow-up eye care"
    ],
    doctors: [
      "Dr. Priya Sen",
      "Dr. Saad Rahman",
      "Dr. Sushmita Roy",
      "Dr. Adnan Kabir",
      "Dr. Moumita Dey"
    ]
  },

  ent: {
    name: "ENT (Ear, Nose & Throat)",
    description: "Consultations for ear, nose, throat, and related concerns.",
    services: [
      "Ear health consultations",
      "Sinus and nasal assessments",
      "Throat and voice consultations",
      "Hearing concern assessment"
    ],
    doctors: [
      "Dr. Sayan Das",
      "Dr. Tasnim Akter",
      "Dr. Arnab Ghosh",
      "Dr. Rezaul Karim",
      "Dr. Sohini Bose"
    ]
  },

  gastroenterology: {
    name: "Gastroenterology & Hepatology",
    description: "Consultations for digestive and liver health concerns.",
    services: [
      "Digestive health consultations",
      "Stomach and bowel symptom assessment",
      "Liver health consultations",
      "Follow-up care"
    ],
    doctors: [
      "Dr. Imran Chowdhury",
      "Dr. Ritu Sen",
      "Dr. Fahmida Islam",
      "Dr. Abhishek Dutta",
      "Dr. Saima Rahman"
    ]
  },

  nephrology: {
    name: "Nephrology",
    description: "Consultations for kidney health and related conditions.",
    services: [
      "Kidney health consultations",
      "Kidney function follow-up",
      "Blood pressure and kidney care",
      "Fluid and lifestyle guidance"
    ],
    doctors: [
      "Dr. Anirban Roy",
      "Dr. Safa Karim",
      "Dr. Sharmila Das",
      "Dr. Faisal Ahmed",
      "Dr. Rakesh Sen"
    ]
  },

  pulmonology: {
    name: "Pulmonology",
    description: "Consultations for lung and breathing-related concerns.",
    services: [
      "Breathing and lung health consultations",
      "Asthma care consultations",
      "Persistent cough assessment",
      "Follow-up respiratory care"
    ],
    doctors: [
      "Dr. Rohan Sen",
      "Dr. Nafisa Khan",
      "Dr. Soumya Roy",
      "Dr. Arif Hossain",
      "Dr. Nandini Das"
    ]
  },

  psychiatry: {
    name: "Psychiatry & Behavioral Health",
    description: "Support for mental health and emotional well-being.",
    services: [
      "Mental health consultations",
      "Stress and sleep concerns",
      "Emotional well-being support",
      "Follow-up consultations"
    ],
    doctors: [
      "Dr. Sreemoyee Ghosh",
      "Dr. Fahim Rahman",
      "Dr. Ananya Bose",
      "Dr. Zarin Ahmed",
      "Dr. Koushik Sen"
    ]
  },

  urology: {
    name: "Urology",
    description: "Consultations for urinary tract and related concerns.",
    services: [
      "Urinary health consultations",
      "Bladder concern assessment",
      "Kidney stone consultations",
      "Follow-up urology care"
    ],
    doctors: [
      "Dr. Debjit Das",
      "Dr. Samia Haque",
      "Dr. Rajdeep Roy",
      "Dr. Imtiaz Ahmed",
      "Dr. Piu Chatterjee"
    ]
  },

  "blood-bank": {
    name: "Blood Bank & Transfusion Services",
    description: "Contact the blood bank team to ask about blood availability and donation services.",
    services: [
      "Blood availability enquiries",
      "Blood donation information",
      "Transfusion service enquiries",
      "Contact the blood bank team"
    ],
    bloodBank: true
  },

  oncology: {
    name: "Oncology / Cancer Care",
    description: "Consultations and coordinated support for patients affected by cancer.",
    services: [
      "Oncology consultations",
      "Cancer diagnosis and care guidance",
      "Treatment planning consultations",
      "Follow-up and supportive care"
    ],
    doctors: [
      "Dr. Ananya Mukherjee",
      "Dr. Samiul Haque",
      "Dr. Riddhi Sen",
      "Dr. Farzana Kabir",
      "Dr. Abir Chatterjee"
    ]
  }
};


// Demo availability schedules
const doctorSchedules = [
  { days: "Sunday, Tuesday", time: "9:00 AM – 1:00 PM" },
  { days: "Monday, Wednesday", time: "2:00 PM – 6:00 PM" },
  { days: "Saturday, Monday", time: "10:00 AM – 2:00 PM" },
  { days: "Tuesday, Thursday", time: "3:00 PM – 7:00 PM" },
  { days: "Sunday, Thursday", time: "4:00 PM – 8:00 PM" }
];


// Department details dialog
const departmentDialog = document.querySelector("#department-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogDescription = document.querySelector("#dialog-description");
const dialogServiceList = document.querySelector("#dialog-service-list");
const doctorPanel = document.querySelector("#dialog-doctors");
const doctorGrid = document.querySelector("#doctor-profile-grid");
const emergencyActions = document.querySelector("#emergency-dialog-actions");
const bloodBankActions = document.querySelector("#blood-bank-dialog-actions");
const bookingNote = document.querySelector("#booking-note");
const dialogCloseButton = document.querySelector(".dialog-close");

function openDepartmentDialog(department) {
  if (
    !departmentDialog ||
    !dialogTitle ||
    !dialogDescription ||
    !dialogServiceList
  ) {
    return;
  }

  dialogTitle.textContent = department.name;
  dialogDescription.textContent = department.description;

  dialogServiceList.replaceChildren();

  department.services.forEach((service) => {
    const listItem = document.createElement("li");
    listItem.textContent = service;
    dialogServiceList.appendChild(listItem);
  });

  if (bookingNote) {
    bookingNote.textContent = "";
  }

  const isEmergency = Boolean(department.emergency);
  const isBloodBank = Boolean(department.bloodBank);
  const showDoctors = !isEmergency && !isBloodBank;

  if (doctorPanel) {
    doctorPanel.hidden = !showDoctors;
  }

  if (emergencyActions) {
    emergencyActions.hidden = !isEmergency;
  }

  if (bloodBankActions) {
    bloodBankActions.hidden = !isBloodBank;
  }

  if (showDoctors && doctorGrid) {
    doctorGrid.replaceChildren();

    department.doctors.forEach((doctor, index) => {
      const schedule = doctorSchedules[index];

      const card = document.createElement("article");
      card.className = "doctor-profile";

      card.innerHTML = `
        <div class="doctor-profile-top">
          <img class="doctor-avatar doctor-avatar-photo" src="${getDoctorPhotoPath(doctor)}" alt="${doctor}">
          <div>
            <h4></h4>
            <p class="doctor-specialty"></p>
          </div>
        </div>

        <p class="doctor-qualification"><strong>Sample qualification (verify):</strong> ${getDoctorQualification(resolveAppointmentDepartmentKey(department.name))}</p>
        <p class="doctor-availability">
          <strong>Available:</strong> ${schedule.days}<br>
          <strong>Time:</strong> ${schedule.time}
        </p>

        <button class="doctor-book-button" type="button">
          Book Appointment
        </button>
        <button class="doctor-follow-button" type="button" aria-pressed="false">Follow</button>
      `;

      card.querySelector("h4").textContent = doctor;
      card.querySelector(".doctor-specialty").textContent =
        `${department.name} Specialist`;
      const profilePhoto = card.querySelector(".doctor-avatar-photo");
      profilePhoto.addEventListener("error", () => {
        profilePhoto.remove();
      }, { once: true });

      const bookButton = card.querySelector(".doctor-book-button");
      bookButton.dataset.doctor = doctor;
      bookButton.dataset.department = department.name;
      const followButton = card.querySelector(".doctor-follow-button");
      const doctorEntry = doctorDirectory.find((entry) => entry.name === doctor && entry.departmentKey === resolveAppointmentDepartmentKey(department.name));
      if (followButton) {
        followButton.dataset.doctor = doctor;
        followButton.dataset.department = department.name;
        followButton.dataset.departmentKey = resolveAppointmentDepartmentKey(department.name);
        followButton.dataset.days = schedule.days;
        followButton.dataset.time = schedule.time;
        followButton.dataset.photo = doctorEntry?.photo || getDoctorPhotoPath(doctor);
        syncDoctorFollowButtons(card);
      }

      doctorGrid.appendChild(card);
    });
  }

  if (typeof departmentDialog.showModal === "function") {
    departmentDialog.showModal();
  } else {
    departmentDialog.setAttribute("open", "");
  }
}


// Department search uses a native datalist, matching the Find Care search.
const departmentSearchForm = document.querySelector("#department-search-form");
const departmentSearchInput = document.querySelector("#department-search-input");
const departmentSearchList = document.querySelector("#department-search-suggestions");
const departmentSearchStatus = document.querySelector("#department-search-status");

if (departmentSearchForm && departmentSearchInput && departmentSearchList) {
  const departmentSearchTerms = {
    "general-medicine": ["general", "fever", "diabetes", "blood pressure", "common illness"],
    cardiology: ["heart", "cardiac", "chest", "circulation"],
    paediatrics: ["child", "children", "baby", "infant", "pediatric"],
    "gynaecology-obstetrics": ["women", "pregnancy", "maternity", "gynecology"],
    orthopaedics: ["bone", "joint", "fracture", "muscle", "orthopedics"],
    neurology: ["brain", "nerve", "headache", "migraine"],
    "general-surgery": ["surgery", "surgeon", "operation", "wound"],
    emergency: ["urgent", "accident", "immediate help"],
    dermatology: ["skin", "hair", "nail", "rash"],
    ophthalmology: ["eye", "eyes", "vision", "sight"],
    ent: ["ear", "nose", "throat", "hearing", "sinus"],
    gastroenterology: ["stomach", "digestive", "digestion", "liver", "bowel"],
    nephrology: ["kidney", "renal"],
    pulmonology: ["lung", "breathing", "respiratory", "asthma", "cough"],
    psychiatry: ["mental health", "stress", "sleep", "behavioral", "emotional"],
    urology: ["urinary", "bladder", "kidney stone"],
    "blood-bank": ["blood", "donation", "transfusion"],
    oncology: ["cancer", "tumor", "tumour", "chemotherapy"]
  };

  const suggestionDepartmentKeys = new Map();

  Object.entries(departmentInfo).forEach(([key, department]) => {
    const suggestionValues = [
      department.name,
      ...(departmentSearchTerms[key] || [])
        .filter((term) => !department.name.toLowerCase().includes(term))
        .map((term) => `${term} — ${department.name}`)
    ];

    suggestionValues.forEach((value) => {
      if (suggestionDepartmentKeys.has(value)) return;

      suggestionDepartmentKeys.set(value, key);
      const option = document.createElement("option");
      option.value = value;
      departmentSearchList.appendChild(option);
    });
  });

  function findDepartmentKey(searchText) {
    const query = searchText.trim().toLowerCase();
    if (!query) return "";

    const exactSuggestion = suggestionDepartmentKeys.get(searchText.trim());
    if (exactSuggestion) return exactSuggestion;

    const nameMatch = Object.entries(departmentInfo).find(([, department]) =>
      department.name.toLowerCase().includes(query)
    );
    if (nameMatch) return nameMatch[0];

    return Object.entries(departmentInfo).find(([key, department]) => {
      const searchableText = [
        department.description,
        ...department.services,
        ...(departmentSearchTerms[key] || [])
      ].join(" ").toLowerCase();

      return searchableText.includes(query);
    })?.[0] || "";
  }

  function openDepartmentSearchResult(searchText) {
    const departmentKey = findDepartmentKey(searchText);

    if (!departmentKey) {
      if (departmentSearchStatus) {
        departmentSearchStatus.textContent = "No matching department found. Try another word.";
      }
      return;
    }

    const department = departmentInfo[departmentKey];
    departmentSearchInput.value = department.name;
    if (departmentSearchStatus) {
      departmentSearchStatus.textContent = `Showing ${department.name} details.`;
    }
    openDepartmentDialog(department);
  }

  departmentSearchInput.addEventListener("change", () => {
    if (suggestionDepartmentKeys.has(departmentSearchInput.value.trim())) {
      openDepartmentSearchResult(departmentSearchInput.value);
    }
  });

  departmentSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    openDepartmentSearchResult(departmentSearchInput.value);
  });
}


// Open a department when its Explore Care button is clicked
document.querySelectorAll(".explore-button").forEach((button) => {
  button.addEventListener("click", () => {
    const department = departmentInfo[button.dataset.department];

    if (department) {
      openDepartmentDialog(department);
    }
  });
});


// Close the department dialog
if (dialogCloseButton && departmentDialog) {
  dialogCloseButton.addEventListener("click", () => {
    departmentDialog.close();
  });
}

if (departmentDialog) {
  departmentDialog.addEventListener("click", (event) => {
    if (event.target === departmentDialog) {
      departmentDialog.close();
    }
  });
}


// Save the selected doctor and department for the future Appointment section
if (doctorGrid) {
  doctorGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".doctor-book-button");

    if (!button) {
      return;
    }

    const selection = {
      department: button.dataset.department,
      doctor: button.dataset.doctor
    };

    window.hospitalAppointmentSelection = selection;

    try {
      sessionStorage.setItem(
        "hospitalAppointmentSelection",
        JSON.stringify(selection)
      );
    } catch (error) {
      // The selection remains available in this page session.
    }

    if (bookingNote) {
      bookingNote.textContent =
        `${selection.doctor} selected. The appointment form will be connected later.`;
    }

    window.dispatchEvent(
      new CustomEvent("hospital:appointment-selected", {
        detail: selection
      })
    );
  });
  
}
// Show 8 departments first; View More reveals the rest
const departmentCards = Array.from(
  document.querySelectorAll(".department-card")
);
const viewMoreButton = document.querySelector("#department-view-more");
const visibleDepartmentCount = 8;

if (departmentCards.length > visibleDepartmentCount && viewMoreButton) {
  departmentCards.forEach((card, index) => {
    card.hidden = index >= visibleDepartmentCount;
  });

  viewMoreButton.addEventListener("click", () => {
    const isShowingAll =
      viewMoreButton.getAttribute("aria-expanded") === "true";

    departmentCards.forEach((card, index) => {
      // Show More click: reveal all. Show Less click: return to first 8.
      card.hidden = isShowingAll && index >= visibleDepartmentCount;
    });

    viewMoreButton.setAttribute("aria-expanded", String(!isShowingAll));
    viewMoreButton.textContent = isShowingAll
      ? "View More Departments"
      : "Show Less";
  });
} else if (viewMoreButton) {
  viewMoreButton.hidden = true;
}
// Extra 5 demo doctors for the Our Doctors directory
const extraDoctorsByDepartment = {
  "general-medicine": [
    "Dr. Kavita Mukherjee",
    "Dr. Omar Siddiqui",
    "Dr. Sneha Bose",
    "Dr. Rahul Das",
    "Dr. Nadia Karim"
  ],

  cardiology: [
    "Dr. Ishaan Dutta",
    "Dr. Mariam Chowdhury",
    "Dr. Pritam Sen",
    "Dr. Lubna Haque",
    "Dr. Karan Banerjee"
  ],

  paediatrics: [
    "Dr. Aditi Ghosh",
    "Dr. Yusuf Rahman",
    "Dr. Roshni Paul",
    "Dr. Kabir Saha",
    "Dr. Tania Ahmed"
  ],

  "gynaecology-obstetrics": [
    "Dr. Shreya Chatterjee",
    "Dr. Adiba Noor",
    "Dr. Mitali Dey",
    "Dr. Samir Bose",
    "Dr. Laila Sultana"
  ],

  orthopaedics: [
    "Dr. Nikhil Roy",
    "Dr. Rafia Islam",
    "Dr. Supriya Ghosh",
    "Dr. Azhar Khan",
    "Dr. Devika Sen"
  ],

  neurology: [
    "Dr. Partha Basu",
    "Dr. Hiba Rahman",
    "Dr. Monalisa Dutta",
    "Dr. Faisal Noor",
    "Dr. Koyel Roy"
  ],

  "general-surgery": [
    "Dr. Siddharth Sen",
    "Dr. Mahira Islam",
    "Dr. Soumita Ghosh",
    "Dr. Rehan Ali",
    "Dr. Abir Das"
  ],

  dermatology: [
    "Dr. Nandita Paul",
    "Dr. Aftab Karim",
    "Dr. Kankana Roy",
    "Dr. Vikram Dey",
    "Dr. Saira Ahmed"
  ],

  ophthalmology: [
    "Dr. Rakesh Mukherjee",
    "Dr. Nusaira Khan",
    "Dr. Tanushree Das",
    "Dr. Arman Saha",
    "Dr. Sreya Banerjee"
  ],

  ent: [
    "Dr. Niloy Chatterjee",
    "Dr. Fariha Islam",
    "Dr. Suman Roy",
    "Dr. Ankita Bose",
    "Dr. Zubair Hasan"
  ],

  gastroenterology: [
    "Dr. Aniket Sen",
    "Dr. Marium Akter",
    "Dr. Debolina Ghosh",
    "Dr. Sarfaraz Alam",
    "Dr. Parnika Dutta"
  ],

  nephrology: [
    "Dr. Shantanu Roy",
    "Dr. Amina Rahman",
    "Dr. Soham Das",
    "Dr. Ishita Banerjee",
    "Dr. Nayeem Kabir"
  ],

  pulmonology: [
    "Dr. Sagnik Bose",
    "Dr. Rukaiya Noor",
    "Dr. Arpita Sen",
    "Dr. Samiha Karim",
    "Dr. Pranab Dey"
  ],

  psychiatry: [
    "Dr. Oindrila Roy",
    "Dr. Muntasir Ahmed",
    "Dr. Sushovan Das",
    "Dr. Rima Chatterjee",
    "Dr. Taufiq Hasan"
  ],

  urology: [
    "Dr. Anupam Ghosh",
    "Dr. Shabnam Akter",
    "Dr. Sudeep Roy",
    "Dr. Farid Hossain",
    "Dr. Riya Mukherjee"
  ],

  oncology: [
    "Dr. Kaushiki Sen",
    "Dr. Mahir Chowdhury",
    "Dr. Sanchari Das",
    "Dr. Zayan Ahmed",
    "Dr. Pritika Roy"
  ]
};


// Availability patterns for the directory cards
const directoryScheduleTemplates = [
  { days: "Sunday, Tuesday", time: "9:00 AM – 1:00 PM" },
  { days: "Monday, Wednesday", time: "2:00 PM – 6:00 PM" },
  { days: "Saturday, Monday", time: "10:00 AM – 2:00 PM" },
  { days: "Tuesday, Thursday", time: "3:00 PM – 7:00 PM" },
  { days: "Sunday, Thursday", time: "4:00 PM – 8:00 PM" },
  { days: "Monday, Friday", time: "9:30 AM – 1:30 PM" },
  { days: "Tuesday, Saturday", time: "11:00 AM – 3:00 PM" },
  { days: "Wednesday, Friday", time: "2:30 PM – 6:30 PM" },
  { days: "Sunday, Wednesday", time: "10:00 AM – 2:00 PM" },
  { days: "Thursday, Saturday", time: "3:00 PM – 7:00 PM" }
];


// These are sample specialty-matched credentials only. Replace them with each
// doctor's verified qualifications before publishing the hospital site.
const sampleQualifications = {
  "general-medicine": "MBBS, MD (General Medicine)",
  cardiology: "MBBS, MD (General Medicine), DM (Cardiology)",
  paediatrics: "MBBS, MD (Paediatrics)",
  "gynaecology-obstetrics": "MBBS, MS (Obstetrics & Gynaecology)",
  orthopaedics: "MBBS, MS (Orthopaedics)",
  neurology: "MBBS, MD (General Medicine), DM (Neurology)",
  "general-surgery": "MBBS, MS (General Surgery)",
  dermatology: "MBBS, MD (Dermatology)",
  ophthalmology: "MBBS, MS (Ophthalmology)",
  ent: "MBBS, MS (Otorhinolaryngology)",
  gastroenterology: "MBBS, MD (General Medicine), DM (Gastroenterology)",
  nephrology: "MBBS, MD (General Medicine), DM (Nephrology)",
  pulmonology: "MBBS, MD (General Medicine), DM (Pulmonary Medicine)",
  psychiatry: "MBBS, MD (Psychiatry)",
  urology: "MBBS, MS (General Surgery), MCh (Urology)",
  oncology: "MBBS, MD (Medical Oncology)"
};

function getDoctorQualification(departmentKey) {
  return sampleQualifications[departmentKey] || "Add verified qualification";
}

// Build the directory from existing department doctors plus 5 extra per department
const doctorDirectory = [];

Object.entries(departmentInfo).forEach(([departmentKey, department]) => {
  // Emergency Care and Blood Bank have no doctor profiles
  if (!Array.isArray(department.doctors)) {
    return;
  }

  const names = [
    ...department.doctors,
    ...(extraDoctorsByDepartment[departmentKey] || [])
  ];

  names.forEach((name, index) => {
    doctorDirectory.push({
      name,
      department: department.name,
      departmentKey,
      // Add an image path later, for example:
      // Photo files are kept beside index.html, like logo.jpg.
      photo: "",
      // Save each portrait as Dr. Full Name.jpg beside index.html.
      // The same filename is used in department and doctor directory cards.
      photo: getDoctorPhotoPath(name),
      qualification: getDoctorQualification(departmentKey),
      days: directoryScheduleTemplates[index].days,
      time: directoryScheduleTemplates[index].time
    });
  });
});


// Doctor photos are matched by the exact displayed name. For example:
// Dr. Ayesha Rahman.jpg
function getDoctorPhotoPath(name) {
  return `${encodeURIComponent(name)}.jpg`;
}

// Doctors directory: search, 8 cards per page, and pagination
const doctorSearchInput = document.querySelector("#doctor-search");
const directoryGrid = document.querySelector("#doctors-directory-grid");
const directoryPagination = document.querySelector("#doctor-pagination");
const resultsMessage = document.querySelector("#doctor-results-message");
const emptyState = document.querySelector("#doctor-empty-state");

const doctorsPerPage = 8;
let currentDoctorPage = 1;
let matchingDoctors = [...doctorDirectory];

function getDoctorInitials(name) {
  return name
    .replace("Dr. ", "")
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function createDoctorCard(doctor) {
  const card = document.createElement("article");
  card.className = "directory-doctor-card";

  const imageContent = doctor.photo
    ? `<img class="directory-doctor-photo" src="${doctor.photo}" alt="${doctor.name}">`
    : `<span class="directory-doctor-initials" aria-hidden="true">${getDoctorInitials(doctor.name)}</span>`;

  card.innerHTML = `
    <div class="directory-card-inner">
      <div class="directory-card-front">
        ${imageContent}
        <h3 class="directory-doctor-name"></h3>
        <p class="directory-doctor-department"></p>

        <div class="directory-card-actions">
          <button class="directory-view-button" type="button">
            View Details
          </button>
          <button class="directory-book-button" type="button">
            Book Appointment
          </button>
          <button class="doctor-follow-button" type="button" aria-pressed="false">Follow</button>
        </div>
      </div>

      <div class="directory-card-back">
        <h3 class="directory-doctor-name"></h3>
        <p class="directory-doctor-department"></p>

        <p class="directory-qualification"><strong>Sample qualification (verify):</strong> <span class="directory-qualification-value"></span></p>

        <div class="directory-availability">
          <p>
            <strong>Available days</strong>
            <span class="directory-availability-days"></span>
          </p>
          <p>
            <strong>Available time</strong>
            <span class="directory-availability-time"></span>
          </p>
        </div>

        <div class="directory-card-actions">
          <button class="directory-back-button" type="button">
            Back
          </button>
          <button class="directory-book-button" type="button">
            Book Appointment
          </button>
          <button class="doctor-follow-button" type="button" aria-pressed="false">Follow</button>
        </div>
      </div>
    </div>
  `;

  card.querySelectorAll(".directory-doctor-name").forEach((element) => {
    element.textContent = doctor.name;
  });

  card.querySelectorAll(".directory-doctor-department").forEach((element) => {
    element.textContent = doctor.department;
  });

  card.querySelector(".directory-qualification-value").textContent = doctor.qualification;

  const directoryPhoto = card.querySelector(".directory-doctor-photo");
  if (directoryPhoto) {
    directoryPhoto.addEventListener("error", () => {
      const fallback = document.createElement("span");
      fallback.className = "directory-doctor-initials";
      fallback.setAttribute("aria-hidden", "true");
      fallback.textContent = getDoctorInitials(doctor.name);
      directoryPhoto.replaceWith(fallback);
    }, { once: true });
  }

  card.querySelector(".directory-availability-days").textContent = doctor.days;
  card.querySelector(".directory-availability-time").textContent = doctor.time;

  card.dataset.doctor = doctor.name;
  card.dataset.department = doctor.department;
  card.dataset.departmentKey = doctor.departmentKey;
  card.querySelectorAll(".doctor-follow-button").forEach((button) => {
    button.dataset.doctor = doctor.name;
    button.dataset.department = doctor.department;
    button.dataset.departmentKey = doctor.departmentKey;
    button.dataset.days = doctor.days;
    button.dataset.time = doctor.time;
    button.dataset.photo = doctor.photo || "";
  });
  syncDoctorFollowButtons(card);
  return card;
}

function syncDoctorFollowButtons(root = document) {
  const followed = window.hospitalAuth?.followedDoctors || [];
  root.querySelectorAll(".doctor-follow-button").forEach((button) => {
    const key = `${button.dataset.departmentKey}:${button.dataset.doctor}`;
    const isFollowing = followed.some((doctor) => doctor.doctor_key === key);
    button.textContent = isFollowing ? "Following" : "Follow";
    button.classList.toggle("is-following", isFollowing);
    button.setAttribute("aria-pressed", String(isFollowing));
  });
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest(".doctor-follow-button");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  if (!window.hospitalAuth?.toggleDoctorFollow) return;
  button.disabled = true;
  button.classList.add("is-loading");
  button.setAttribute("aria-busy", "true");
  try {
    await window.hospitalAuth.toggleDoctorFollow({
      doctorKey: `${button.dataset.departmentKey}:${button.dataset.doctor}`,
      doctorName: button.dataset.doctor,
      department: button.dataset.department,
      departmentKey: button.dataset.departmentKey,
      days: button.dataset.days,
      time: button.dataset.time,
      photo: button.dataset.photo
    });
  } finally {
    button.disabled = false;
    button.classList.remove("is-loading");
    button.removeAttribute("aria-busy");
    syncDoctorFollowButtons();
  }
});

window.addEventListener("hospital:doctor-follows-updated", () => syncDoctorFollowButtons());
function renderDoctorPagination(totalPages) {
  if (!directoryPagination) {
    return;
  }

  directoryPagination.replaceChildren();

  if (totalPages <= 1) {
    directoryPagination.hidden = true;
    return;
  }

  directoryPagination.hidden = false;

  const previousButton = document.createElement("button");
  previousButton.type = "button";
  previousButton.className = "doctor-page-button doctor-page-prev";
  previousButton.textContent = "← Previous";
  previousButton.disabled = currentDoctorPage === 1;
  previousButton.addEventListener("click", () => {
    if (currentDoctorPage > 1) {
      currentDoctorPage--;
      renderDoctorDirectory();
    }
  });
  directoryPagination.appendChild(previousButton);

  const firstVisiblePage = Math.max(
    1,
    Math.min(currentDoctorPage - 1, totalPages - 2)
  );
  const lastVisiblePage = Math.min(totalPages, firstVisiblePage + 2);

  for (let page = firstVisiblePage; page <= lastVisiblePage; page++) {
    const pageButton = document.createElement("button");
    pageButton.type = "button";
    pageButton.className = "doctor-page-button";
    pageButton.textContent = String(page);
    pageButton.setAttribute("aria-label", `Page ${page}`);

    if (page === currentDoctorPage) {
      pageButton.classList.add("active");
      pageButton.setAttribute("aria-current", "page");
    }

    pageButton.addEventListener("click", () => {
      currentDoctorPage = page;
      renderDoctorDirectory();
    });

    directoryPagination.appendChild(pageButton);
  }

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "doctor-page-button doctor-page-next";
  nextButton.textContent = "Next →";
  nextButton.disabled = currentDoctorPage === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentDoctorPage < totalPages) {
      currentDoctorPage++;
      renderDoctorDirectory();
    }
  });
  directoryPagination.appendChild(nextButton);
}

function renderDoctorDirectory() {
  if (!directoryGrid) {
    return;
  }

  const totalPages = Math.ceil(matchingDoctors.length / doctorsPerPage);

  if (totalPages > 0 && currentDoctorPage > totalPages) {
    currentDoctorPage = totalPages;
  }

  const startIndex = (currentDoctorPage - 1) * doctorsPerPage;
  const visibleDoctors = matchingDoctors.slice(
    startIndex,
    startIndex + doctorsPerPage
  );

  directoryGrid.replaceChildren();

  visibleDoctors.forEach((doctor) => {
    directoryGrid.appendChild(createDoctorCard(doctor));
  });

  const hasResults = matchingDoctors.length > 0;

  directoryGrid.hidden = !hasResults;

  if (emptyState) {
    emptyState.hidden = hasResults;
  }

  if (resultsMessage) {
    if (hasResults) {
      const firstResult = startIndex + 1;
      const lastResult = Math.min(
        startIndex + doctorsPerPage,
        matchingDoctors.length
      );

      resultsMessage.textContent =
        `Showing ${firstResult}–${lastResult} of ${matchingDoctors.length} doctors`;
    } else {
      resultsMessage.textContent = "No doctors found";
    }
  }

  renderDoctorPagination(totalPages);
}

if (doctorSearchInput) {
  doctorSearchInput.addEventListener("input", () => {
    const query = doctorSearchInput.value.trim().toLowerCase();

    matchingDoctors = doctorDirectory.filter((doctor) =>
      `${doctor.name} ${doctor.department}`.toLowerCase().includes(query)
    );

    currentDoctorPage = 1;
    renderDoctorDirectory();
  });
}


// Flip cards and use the same appointment-selection event as department profiles
if (directoryGrid) {
  directoryGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".directory-doctor-card");

    if (!card) {
      return;
    }

    if (event.target.closest(".directory-view-button")) {
      card.classList.add("is-flipped");
      return;
    }

    if (event.target.closest(".directory-back-button")) {
      card.classList.remove("is-flipped");
      return;
    }

    if (event.target.closest(".directory-book-button")) {
      const selection = {
        department: card.dataset.department,
        doctor: card.dataset.doctor
      };

      window.hospitalAppointmentSelection = selection;

      try {
        sessionStorage.setItem(
          "hospitalAppointmentSelection",
          JSON.stringify(selection)
        );
      } catch (error) {
        // The selection remains available in this page session.
      }

      window.dispatchEvent(
        new CustomEvent("hospital:appointment-selected", {
          detail: selection
        })
      );

      const appointmentSection = document.querySelector("#appointment");

      if (appointmentSection) {
        appointmentSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }
  });
}


// Render the first page when the page loads
renderDoctorDirectory();
// Appointment form behavior
const appointmentForm = document.querySelector("#appointment-form");
const appointmentDepartment = document.querySelector("#appointment-department");
const appointmentDoctor = document.querySelector("#appointment-doctor");
const appointmentDate = document.querySelector("#appointment-date");
const appointmentTime = document.querySelector("#appointment-time");
const appointmentReason = document.querySelector("#appointment-reason");
const appointmentMessage = document.querySelector("#appointment-form-message");
const appointmentAvailabilityNote = document.querySelector(
  "#appointment-availability-note"
);

function resolveAppointmentDepartmentKey(value) {
  if (!value) {
    return "";
  }

  if (departmentInfo[value]) {
    return value;
  }

  const matchingDepartment = Object.entries(departmentInfo).find(
    ([, department]) =>
      department.name.toLowerCase() === value.toLowerCase()
  );

  return matchingDepartment ? matchingDepartment[0] : "";
}

function getDoctorsForAppointment(departmentKey) {
  const department = departmentInfo[departmentKey];

  if (!department || !Array.isArray(department.doctors)) {
    return [];
  }

  return [
    ...department.doctors,
    ...(extraDoctorsByDepartment[departmentKey] || [])
  ];
}

function getAppointmentDoctorProfile(departmentKey, doctorName) {
  return doctorDirectory.find(
    (doctor) =>
      doctor.departmentKey === departmentKey &&
      doctor.name === doctorName
  );
}

function updateAppointmentTimeOptions() {
  if (!appointmentDoctor || !appointmentTime) {
    return;
  }

  const departmentKey = appointmentDepartment.value;
  const doctorName = appointmentDoctor.value;

  appointmentTime.replaceChildren();

  if (!departmentKey || !doctorName) {
    appointmentTime.disabled = true;
    appointmentTime.required = true;

    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Select a doctor first";
    appointmentTime.appendChild(option);

    if (appointmentAvailabilityNote) {
      appointmentAvailabilityNote.textContent = "";
    }
    updateAppointmentDateMinimum();

    return;
  }

  const profile = getAppointmentDoctorProfile(departmentKey, doctorName);

  appointmentTime.disabled = false;

  const option = document.createElement("option");
  option.value = profile ? profile.time : "";
  option.textContent = profile
    ? profile.time
    : "Contact the hospital to confirm availability";

  appointmentTime.appendChild(option);

  if (appointmentAvailabilityNote && profile) {
    appointmentAvailabilityNote.textContent =
      `Available days: ${profile.days}`;
  }

  validateAppointmentDate();
}

function populateAppointmentDoctors(departmentKey, preferredDoctor = "") {
  if (!appointmentDoctor) {
    return;
  }

  appointmentDoctor.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = departmentKey
    ? "Select a doctor"
    : "Select a department first";
  appointmentDoctor.appendChild(placeholder);

  const doctorNames = getDoctorsForAppointment(departmentKey);

  doctorNames.forEach((doctorName) => {
    const option = document.createElement("option");
    option.value = doctorName;
    option.textContent = doctorName;
    appointmentDoctor.appendChild(option);
  });

  appointmentDoctor.disabled = doctorNames.length === 0;

  if (preferredDoctor && doctorNames.includes(preferredDoctor)) {
    appointmentDoctor.value = preferredDoctor;
  }

  updateAppointmentTimeOptions();
}

function getDoctorStartMinutes(profile) {
  const match = String(profile?.time || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  return hours * 60 + Number(match[2]);
}

function getLocalDateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function updateAppointmentDateMinimum(profile = null) {
  if (!appointmentDate) return { todayKey: "", minKey: "", cutoff: null };
  const now = new Date();
  const todayKey = getLocalDateKey(now);
  let minKey = todayKey;
  const startMinutes = getDoctorStartMinutes(profile || getAppointmentDoctorProfile(appointmentDepartment?.value, appointmentDoctor?.value));
  let cutoff = null;
  if (startMinutes !== null) {
    const slotStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    cutoff = new Date(slotStart.getTime() - 60 * 60 * 1000);
    if (now.getTime() > cutoff.getTime()) {
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      minKey = getLocalDateKey(tomorrow);
    }
  }
  appointmentDate.min = minKey;
  return { todayKey, minKey, cutoff };
}

function validateAppointmentDate() {
  if (!appointmentDate || !appointmentDepartment || !appointmentDoctor) {
    return true;
  }

  appointmentDate.setCustomValidity("");
  const departmentKey = appointmentDepartment.value;
  const doctorName = appointmentDoctor.value;
  const selectedDate = appointmentDate.value;
  const profile = getAppointmentDoctorProfile(departmentKey, doctorName);
  const { todayKey, minKey, cutoff } = updateAppointmentDateMinimum(profile);

  if (!departmentKey || !doctorName || !selectedDate) {
    return true;
  }

  if (selectedDate < minKey) {
    const message = "Same-day appointments must be booked at least 1 hour before the doctor's available time. Please choose a later date.";
    appointmentDate.setCustomValidity(message);
    if (appointmentAvailabilityNote) appointmentAvailabilityNote.textContent = message;
    return false;
  }

  if (!profile) {
    return true;
  }

  const dateParts = selectedDate.split("-").map(Number);
  const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const selectedWeekday = weekdayNames[date.getDay()];
  const availableDays = profile.days.split(",").map((day) => day.trim());

  if (!availableDays.includes(selectedWeekday)) {
    appointmentDate.setCustomValidity(`This doctor is available on ${profile.days}. Please choose one of those days.`);
    if (appointmentAvailabilityNote) appointmentAvailabilityNote.textContent = `Please choose ${profile.days} for this doctor.`;
    return false;
  }

  if (selectedDate === todayKey && cutoff && new Date().getTime() > cutoff.getTime()) {
    const message = `This doctor's same-day slot starts at ${profile.time.split(/[–-]/)[0].trim()}. Please book at least 1 hour earlier or choose another date.`;
    appointmentDate.setCustomValidity(message);
    if (appointmentAvailabilityNote) appointmentAvailabilityNote.textContent = message;
    return false;
  }

  if (appointmentAvailabilityNote) {
    appointmentAvailabilityNote.textContent = `Available on ${profile.days}, ${profile.time}. Same-day booking closes 1 hour before the slot.`;
  }
  return true;
}
function prefillAppointment(selection) {
  if (!selection || !appointmentDepartment || !appointmentDoctor) {
    return;
  }

  const departmentKey = resolveAppointmentDepartmentKey(selection.department);

  if (!departmentKey || !departmentInfo[departmentKey].doctors) {
    return;
  }

  appointmentDepartment.value = departmentKey;
  populateAppointmentDoctors(departmentKey, selection.doctor || "");

  const appointmentSection = document.querySelector("#appointment");

  if (appointmentSection) {
    appointmentSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  const departmentDialog = document.querySelector("#department-dialog");

  if (departmentDialog && departmentDialog.open) {
    departmentDialog.close();
  }
}

if (appointmentForm) {
  // Prevent choosing a date before today.
  if (appointmentDate) {
    const today = new Date();
    const localToday = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0")
    ].join("-");

    appointmentDate.min = localToday;
    appointmentDate.addEventListener("change", validateAppointmentDate);
  }

  appointmentDepartment.addEventListener("change", () => {
    populateAppointmentDoctors(appointmentDepartment.value);
  });

  appointmentDoctor.addEventListener("change", updateAppointmentTimeOptions);

  appointmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!window.hospitalAuth?.isConfigured) {
      setSubmissionStatus(
        appointmentMessage,
        "info",
        "Patient accounts need Supabase setup before an appointment can be booked."
      );
      document.querySelector("#patient-account-button")?.click();
      return;
    }

    const bookingDraft = Object.fromEntries(new FormData(appointmentForm).entries());
    if (!window.hospitalAuth.requireBookingAccess("book", bookingDraft)) {
      return;
    }

    validateAppointmentDate();

    if (!appointmentForm.reportValidity()) {
      return;
    }

    const formData = new FormData(appointmentForm);
    const departmentKey = formData.get("department");
    const departmentName = departmentInfo[departmentKey].name;
    const appointmentData = {
      patientName: formData.get("patientName").trim(),
      phone: formData.get("phone").trim(),
      email: formData.get("email").trim(),
      department: departmentName,
      doctor: formData.get("doctor"),
      visitType: formData.get("visitType"),
      preferredDate: formData.get("date"),
      preferredTime: formData.get("time"),
      reason: formData.get("reason").trim()
    };
    const appointmentDateLabel = new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(`${appointmentData.preferredDate}T00:00:00`));
    const bookingConfirmationMessage = `Thank you for your appointment request for ${appointmentDateLabel}. Please bring your appointment slip and arrive at the hospital 15 minutes early. The hospital will contact you to confirm.`;
    const appointmentText = [
      "Appointment Request — RSR Advanced Care Hospital",
      `Patient name: ${appointmentData.patientName}`,
      `Mobile: ${appointmentData.phone}`,
      `Email: ${appointmentData.email || "Not provided"}`,
      `Department: ${appointmentData.department}`,
      `Doctor: ${appointmentData.doctor}`,
      `Visit type: ${appointmentData.visitType}`,
      `Preferred date: ${appointmentData.preferredDate}`,
      `Preferred time: ${appointmentData.preferredTime}`,
      `Reason: ${appointmentData.reason || "Not provided"}`
    ].join("\n");

    setSubmissionStatus(
      appointmentMessage,
      "loading",
      "Saving your appointment request to your account..."
    );

    try {
      await window.hospitalAuth.saveAppointment(appointmentData);
    } catch (error) {
      console.error("Could not save appointment to the patient account:", error);
      setSubmissionStatus(
        appointmentMessage,
        "error",
        "Your request could not be saved to your account. Please try again."
      );
      return;
    }

    const clearAppointmentForm = () => {
      appointmentForm.reset();
      appointmentDepartment.value = "";
      populateAppointmentDoctors("");
      appointmentDoctor.value = "";
      appointmentDate.value = "";
      appointmentDate.setCustomValidity("");
      if (appointmentTime) appointmentTime.selectedIndex = 0;
      if (appointmentReason) appointmentReason.value = "";
      window.hospitalAppointmentSelection = null;
      try { sessionStorage.removeItem("hospitalAppointmentSelection"); } catch (error) { /* ignore unavailable storage */ }
      const savedProfilePhone = window.hospitalAuth?.profilePhone;
      if (savedProfilePhone) document.querySelector("#appointment-phone").value = savedProfilePhone;
      if (window.hospitalAuth?.currentUser?.email) {
        document.querySelector("#appointment-email").value = window.hospitalAuth.currentUser.email;
      }
      updateAppointmentDateMinimum();
    };

    if (!APPOINTMENT_SHEET_WEB_APP_URL || APPOINTMENT_SHEET_WEB_APP_URL === "PASTE_WEB_APP_URL_HERE") {
      setSubmissionStatus(
        appointmentMessage,
        "success",
        `${bookingConfirmationMessage} Your request is saved in My Appointments. WhatsApp is opening so you can send it to the hospital.`
      );
      openWhatsAppDraft(appointmentText);
      clearAppointmentForm();
      return;
    }

    const payload = new URLSearchParams({ payload: JSON.stringify(appointmentData) });

    try {
      await fetch(APPOINTMENT_SHEET_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: payload.toString()
      });
      setSubmissionStatus(
        appointmentMessage,
        "success",
        `${bookingConfirmationMessage} Your request is saved in My Appointments and sent to the hospital.`
      );
      clearAppointmentForm();
    } catch (error) {
      console.error("Could not send appointment to the hospital:", error);
      setSubmissionStatus(
        appointmentMessage,
        "error",
        `${bookingConfirmationMessage} Your request is saved in My Appointments, but could not be sent to the hospital. WhatsApp is opening as a backup.`
      );
      openWhatsAppDraft(appointmentText);
      clearAppointmentForm();
    }
  });

  function resumeAppointmentAfterLogin() {
    if (!window.hospitalAuth?.consumePendingBooking()) {
      return;
    }

    const draft = window.hospitalAuth.takeAppointmentDraft();
    if (!draft) {
      setSubmissionStatus(
        appointmentMessage,
        "info",
        "You are signed in. Please enter your appointment details and click Book Appointment again."
      );
      document.querySelector("#appointment")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (draft) {
      const nameField = appointmentForm.elements.namedItem("patientName");
      const phoneField = appointmentForm.elements.namedItem("phone");
      const visitField = appointmentForm.elements.namedItem("visitType");
      const dateField = appointmentForm.elements.namedItem("date");
      const reasonField = appointmentForm.elements.namedItem("reason");

      if (nameField) nameField.value = draft.patientName || "";
      if (phoneField) phoneField.value = draft.phone || "";
      const emailField = document.querySelector("#appointment-email");
      if (emailField) emailField.value = window.hospitalAuth.currentUser?.email || draft.email || "";
      if (visitField) visitField.value = draft.visitType || "";
      if (dateField) dateField.value = draft.date || "";
      if (reasonField) reasonField.value = draft.reason || "";
      if (appointmentDepartment) {
        appointmentDepartment.value = draft.department || "";
        populateAppointmentDoctors(draft.department || "", draft.doctor || "");
      }
      if (appointmentTime && draft.time) appointmentTime.value = draft.time;
    }

    appointmentForm.requestSubmit();
  }

  window.addEventListener("hospital:booking-authenticated", resumeAppointmentAfterLogin);
  if (window.hospitalAuth?.hasPendingBooking()) {
    resumeAppointmentAfterLogin();
  }

  // Fill department and doctor when a booking button is used elsewhere.
  window.addEventListener("hospital:appointment-selected", (event) => {
    prefillAppointment(event.detail);
  });

  // Restore a doctor selection saved by a department or doctor card.
  try {
    const savedSelection = sessionStorage.getItem("hospitalAppointmentSelection");
    if (savedSelection) {
      prefillAppointment(JSON.parse(savedSelection));
    }
  } catch (error) {
    // The form remains usable if session storage is unavailable.
  }
}
// RSR outlet finder — demo data, no map/API needed
(() => {
  const form = document.querySelector("#nearby-location-form");
  const input = document.querySelector("#nearby-location-input");
  const locationButton = document.querySelector("#use-current-location");
  const status = document.querySelector("#nearby-search-status");
  const resultsTitle = document.querySelector("#nearby-results-title");
  const resultsList = document.querySelector("#nearby-hospital-list");
  const emptyState = document.querySelector("#nearby-empty-state");

  if (!form || !input || !locationButton || !status ||
      !resultsTitle || !resultsList || !emptyState) {
    console.error("Outlet finder: Please check that the required HTML IDs are present.");
    return;
  }

  function setStatus(message) {
    status.textContent = message;
  }

  // Demo number. Nijer project-er number pele eta replace korbe.
  const DEMO_PHONE = "+910000000000";
  // Shared hospital ambulance line shown in the emergency section.
  const AMBULANCE_PHONE = "+911000000000";

  // Coordinates-gulo outlet area-r approximate center, exact hospital address noy.
  const outlets = [
    // West Bengal — district outlets
    { district: "Kolkata", state: "West Bengal", area: "Sector V, Salt Lake — Main Branch", lat: 22.57, lng: 88.43, aliases: ["sector v", "salt lake", "kolkata main"] },
    { district: "Alipurduar", state: "West Bengal", area: "Alipurduar town", lat: 26.49, lng: 89.52 },
    { district: "Bankura", state: "West Bengal", area: "Bankura town", lat: 23.23, lng: 87.07 },
    { district: "Birbhum", state: "West Bengal", area: "Bolpur — Shantiniketan area", lat: 23.67, lng: 87.69, aliases: ["bolpur", "shantiniketan"] },
    { district: "Cooch Behar", state: "West Bengal", area: "Cooch Behar town", lat: 26.32, lng: 89.45, aliases: ["coochbehar"] },
    { district: "Dakshin Dinajpur", state: "West Bengal", area: "Balurghat", lat: 25.22, lng: 88.76, aliases: ["south dinajpur"] },
    { district: "Darjeeling", state: "West Bengal", area: "Darjeeling town", lat: 27.04, lng: 88.26 },
    { district: "Hooghly", state: "West Bengal", area: "Chinsurah", lat: 22.90, lng: 88.39, aliases: ["hooghly district", "chuchura", "bandel"] },
    { district: "Howrah", state: "West Bengal", area: "Howrah town", lat: 22.59, lng: 88.26 },
    { district: "Jalpaiguri", state: "West Bengal", area: "Jalpaiguri town", lat: 26.52, lng: 88.73 },
    { district: "Jhargram", state: "West Bengal", area: "Jhargram town", lat: 22.45, lng: 86.98 },
    { district: "Kalimpong", state: "West Bengal", area: "Kalimpong town", lat: 27.06, lng: 88.47 },
    { district: "Malda", state: "West Bengal", area: "Malda town", lat: 25.01, lng: 88.14, aliases: ["maldah", "english bazar"] },
    { district: "Murshidabad", state: "West Bengal", area: "Berhampore", lat: 24.10, lng: 88.25, aliases: ["berhampur"] },
    { district: "Nadia", state: "West Bengal", area: "Krishnanagar", lat: 23.40, lng: 88.50 },
    { district: "North 24 Parganas", state: "West Bengal", area: "Barasat", lat: 22.72, lng: 88.48, aliases: ["north 24 parganas", "north 24"] },
    { district: "Paschim Bardhaman", state: "West Bengal", area: "Asansol", lat: 23.68, lng: 86.98, aliases: ["west bardhaman", "asansol"] },
    { district: "Paschim Medinipur", state: "West Bengal", area: "Midnapore town", lat: 22.43, lng: 87.32, aliases: ["west medinipur", "midnapore"] },
    { district: "Purba Bardhaman", state: "West Bengal", area: "Bardhaman town", lat: 23.23, lng: 87.86, aliases: ["east bardhaman", "burdwan"] },
    { district: "Purba Medinipur", state: "West Bengal", area: "Tamluk", lat: 22.30, lng: 87.92, aliases: ["east medinipur", "tamluk"] },
    { district: "Purulia", state: "West Bengal", area: "Purulia town", lat: 23.33, lng: 86.36 },
    { district: "South 24 Parganas", state: "West Bengal", area: "Diamond Harbour", lat: 22.19, lng: 88.19, aliases: ["south 24 parganas", "south 24"] },
    { district: "Uttar Dinajpur", state: "West Bengal", area: "Raiganj", lat: 25.62, lng: 88.12, aliases: ["north dinajpur"] },

    // Other Indian states — one demo outlet per state
    { district: "Andhra Pradesh", state: "Andhra Pradesh", area: "Vijayawada", lat: 16.51, lng: 80.65 },
    { district: "Arunachal Pradesh", state: "Arunachal Pradesh", area: "Itanagar", lat: 27.08, lng: 93.61 },
    { district: "Assam", state: "Assam", area: "Guwahati", lat: 26.14, lng: 91.74 },
    { district: "Bihar", state: "Bihar", area: "Patna", lat: 25.61, lng: 85.14 },
    { district: "Chhattisgarh", state: "Chhattisgarh", area: "Raipur", lat: 21.25, lng: 81.63 },
    { district: "Delhi", state: "Delhi (NCT)", area: "New Delhi", lat: 28.6139, lng: 77.2090, aliases: ["national capital territory", "nct delhi"] },
    { district: "Goa", state: "Goa", area: "Panaji", lat: 15.49, lng: 73.82 },
    { district: "Gujarat", state: "Gujarat", area: "Ahmedabad", lat: 23.02, lng: 72.57 },
    { district: "Haryana", state: "Haryana", area: "Gurugram", lat: 28.46, lng: 77.03 },
    { district: "Himachal Pradesh", state: "Himachal Pradesh", area: "Shimla", lat: 31.10, lng: 77.17 },
    { district: "Jharkhand", state: "Jharkhand", area: "Ranchi", lat: 23.34, lng: 85.31 },
    { district: "Karnataka", state: "Karnataka", area: "Bengaluru", lat: 12.97, lng: 77.59 },
    { district: "Kerala", state: "Kerala", area: "Kochi", lat: 9.93, lng: 76.27 },
    { district: "Madhya Pradesh", state: "Madhya Pradesh", area: "Bhopal", lat: 23.26, lng: 77.41 },
    { district: "Maharashtra", state: "Maharashtra", area: "Mumbai", lat: 19.08, lng: 72.88 },
    { district: "Manipur", state: "Manipur", area: "Imphal", lat: 24.82, lng: 93.94 },
    { district: "Meghalaya", state: "Meghalaya", area: "Shillong", lat: 25.58, lng: 91.89 },
    { district: "Mizoram", state: "Mizoram", area: "Aizawl", lat: 23.73, lng: 92.72 },
    { district: "Nagaland", state: "Nagaland", area: "Kohima", lat: 25.67, lng: 94.11 },
    { district: "Odisha", state: "Odisha", area: "Bhubaneswar", lat: 20.30, lng: 85.82 },
    { district: "Punjab", state: "Punjab", area: "Ludhiana", lat: 30.90, lng: 75.85 },
    { district: "Rajasthan", state: "Rajasthan", area: "Jaipur", lat: 26.91, lng: 75.79 },
    { district: "Sikkim", state: "Sikkim", area: "Gangtok", lat: 27.33, lng: 88.61 },
    { district: "Tamil Nadu", state: "Tamil Nadu", area: "Chennai", lat: 13.08, lng: 80.27 },
    { district: "Telangana", state: "Telangana", area: "Hyderabad", lat: 17.38, lng: 78.49 },
    { district: "Tripura", state: "Tripura", area: "Agartala", lat: 23.83, lng: 91.28 },
    { district: "Uttar Pradesh", state: "Uttar Pradesh", area: "Lucknow", lat: 26.85, lng: 80.95 },
    { district: "Uttarakhand", state: "Uttarakhand", area: "Dehradun", lat: 30.32, lng: 78.03 }
  ];

  // Autocomplete spellings from the outlet list as the user types.
  const suggestionList = document.querySelector("#outlet-location-suggestions");
  if (suggestionList) {
    const suggestions = new Set();

    outlets.forEach((outlet) => {
      const aliases = (outlet.aliases || []).map((alias) =>
        alias.replace(/\b\w/g, (letter) => letter.toUpperCase())
      );

      [outlet.district, outlet.state, outlet.area, ...aliases].forEach(
        (value) => {
          if (value) suggestions.add(value);
        }
      );
    });

    [...suggestions]
      .sort((first, second) => first.localeCompare(second))
      .forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        suggestionList.appendChild(option);
      });
  }

  function normalize(value) {
    return value
      .toLowerCase()
      .replace(/[.,]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function distanceKm(from, to) {
    const radians = (degrees) => (degrees * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const latDiff = radians(to.lat - from.lat);
    const lngDiff = radians(to.lng - from.lng);

    const a =
      Math.sin(latDiff / 2) ** 2 +
      Math.cos(radians(from.lat)) *
        Math.cos(radians(to.lat)) *
        Math.sin(lngDiff / 2) ** 2;

    return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function renderOutlets(matches, showDistance = false) {
    resultsList.replaceChildren();
    emptyState.hidden = matches.length > 0;

    matches.forEach((outlet) => {
      const card = document.createElement("article");
      card.className = "nearby-hospital-card";

      const top = document.createElement("div");
      top.className = "nearby-hospital-card-top";

      const name = document.createElement("h4");
      name.className = "nearby-hospital-name";
      name.textContent =
        outlet.district === "Kolkata"
          ? "RSR Advanced Care Hospital — Main Branch"
          : `RSR Advanced Care Hospital — ${outlet.district} Outlet`;

      const distance = document.createElement("span");
      distance.className = "nearby-hospital-distance";
      distance.textContent = showDistance
        ? `~${outlet.distance.toFixed(1)} km away`
        : outlet.state;

      top.append(name, distance);

      const address = document.createElement("p");
      address.className = "nearby-hospital-address";
      address.textContent = `${outlet.area}, ${outlet.district}, ${outlet.state}`;

      const actions = document.createElement("div");
      actions.className = "nearby-hospital-actions";

      const call = document.createElement("a");
      call.className = "nearby-call-button";
      call.href = `tel:${DEMO_PHONE}`;
      call.textContent = "☎ Call Outlet";

      const ambulance = document.createElement("a");
      ambulance.className = "nearby-ambulance-button";
      ambulance.href = `tel:${outlet.ambulancePhone || AMBULANCE_PHONE}`;
      ambulance.setAttribute("aria-label", `Call ambulance support for ${outlet.district} outlet`);
      ambulance.textContent = "✚ Call Ambulance";

      actions.append(call, ambulance);
      card.append(top, address, actions);
      resultsList.appendChild(card);
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const query = normalize(input.value);
    if (!query) {
      setStatus("Enter a district, state, or city to search.");
      input.focus();
      return;
    }

    const matches = outlets.filter((outlet) => {
      const searchableText = normalize([
        outlet.district,
        outlet.state,
        outlet.area,
        ...(outlet.aliases || [])
      ].join(" "));

      return searchableText.includes(query);
    });

    resultsTitle.textContent = `Outlets matching "${input.value.trim()}"`;
    renderOutlets(matches);

    setStatus(
      matches.length
        ? `${matches.length} RSR outlet${matches.length === 1 ? "" : "s"} found.`
        : "No outlet matched that name. Try a district, state, or city."
    );
  });

  let locationWatchId = null;
  const originalLocationButtonContent = locationButton.innerHTML;

  locationButton.addEventListener("click", () => {
    if (locationWatchId !== null) {
      navigator.geolocation.clearWatch(locationWatchId);
      locationWatchId = null;
      locationButton.classList.remove("is-locating");
      locationButton.innerHTML = originalLocationButtonContent;
      resultsTitle.textContent = "Location tracking stopped";
      setStatus("Location tracking has stopped.");
      return;
    }

    if (!navigator.geolocation) {
      setStatus("This browser does not support location tracking.");
      return;
    }

    if (!window.isSecureContext) {
      setStatus("Open this website over HTTPS or with VS Code Live Server to use location tracking.");
      return;
    }

    locationButton.disabled = true;
    locationButton.classList.add("is-locating");
    setStatus("Requesting permission to access your current location...");
    resultsTitle.innerHTML = 'Waiting for an accurate location <span class="location-waiting-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
    resultsList.replaceChildren();
    emptyState.hidden = true;

    locationWatchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const accuracyKm = coords.accuracy / 1000;

        locationButton.disabled = false;
        locationButton.textContent = "Stop Location Tracking";

        const userLocation = {
          lat: coords.latitude,
          lng: coords.longitude
        };

        const nearest = outlets
          .map((outlet) => ({
            ...outlet,
            distance: distanceKm(userLocation, outlet)
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 1);

        resultsTitle.textContent = "Your Nearest RSR Outlet";
        renderOutlets(nearest, true);
        setStatus(
          `Nearest outlet from your current location: ${nearest[0].area}, ${nearest[0].district}. ` +
          `Location accuracy is about ${accuracyKm.toFixed(1)} km.`
        );
      },
      (error) => {
        const messages = {
          1: "Allow location access, or search by district or state.",
          2: "Your current location could not be detected. Please try again.",
          3: "The location request timed out. Please try again."
        };

        setStatus(messages[error.code] || "Your current location could not be detected.");
        resultsTitle.textContent = "Location unavailable";
        if (locationWatchId !== null) {
          navigator.geolocation.clearWatch(locationWatchId);
          locationWatchId = null;
        }
        locationButton.classList.remove("is-locating");
        locationButton.innerHTML = originalLocationButtonContent;
        locationButton.disabled = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    );
  });
})();
// Suggest doctor names and departments in the doctor search bar
const doctorSearchSuggestions = document.querySelector(
  "#doctor-search-suggestions"
);

if (doctorSearchSuggestions) {
  const suggestions = [
    ...new Set([
      ...doctorDirectory.map((doctor) => doctor.name),
      ...doctorDirectory.map((doctor) => doctor.department)
    ])
  ];

  suggestions.forEach((suggestion) => {
    const option = document.createElement("option");
    option.value = suggestion;
    doctorSearchSuggestions.appendChild(option);
  });
}
const contactForm = document.querySelector("#contact-form");
const contactFormNote = document.querySelector("#contact-form-note");
const contactNameInput = document.querySelector("#contact-name");

if (contactForm && contactFormNote && contactNameInput) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      return;
    }

    const formData = new FormData(contactForm);
    const contactData = {
      formType: "contact",
      name: formData.get("name").trim(),
      email: formData.get("email").trim(),
      phone: formData.get("phone").trim(),
      subject: formData.get("subject").trim(),
      message: formData.get("message").trim()
    };
    const contactText = [
      "Contact Message — RSR Advanced Care Hospital",
      `Name: ${contactData.name}`,
      `Email: ${contactData.email}`,
      `Phone: ${contactData.phone || "Not provided"}`,
      `Subject: ${contactData.subject}`,
      "",
      "Message:",
      contactData.message
    ].join("\n");

    if (!CONTACT_SHEET_WEB_APP_URL || CONTACT_SHEET_WEB_APP_URL === "PASTE_CONTACT_WEB_APP_URL_HERE") {
      setSubmissionStatus(
        contactFormNote,
        "info",
        "WhatsApp chat opened. Tap Send to complete your message."
      );
      openWhatsAppDraft(contactText);
      return;
    }

    setSubmissionStatus(
      contactFormNote,
      "loading",
      "Sending your message to the hospital..."
    );
    const payload = new URLSearchParams({ payload: JSON.stringify(contactData) });

    fetch(CONTACT_SHEET_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: payload.toString()
    })
      .then(() => {
        setSubmissionStatus(
          contactFormNote,
          "success",
          "Your message was submitted. The hospital will get back to you."
        );
        contactForm.reset();
      })
      .catch(() => {
        setSubmissionStatus(
          contactFormNote,
          "error",
          "Could not save to Google Sheet. WhatsApp is opening as a backup; tap Send to submit your message."
        );
        openWhatsAppDraft(contactText);
      });
  });
}

