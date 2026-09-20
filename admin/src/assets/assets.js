import appointment_img from "./appointment_img.png";
import header_img from "./header_img.png";
import group_profiles from "./group_profiles.png";
import profile_pic from "./profile_pic.png";
import contact_image from "./contact_image.png";
import about_image from "./about_image.png";
import logo from "./logo.png";
import dropdown_icon from "./dropdown_icon.svg";
import menu_icon from "./menu_icon.svg";
import cross_icon from "./cross_icon.png";
import chats_icon from "./chats_icon.svg";
import verified_icon from "./verified_icon.svg";
import arrow_icon from "./arrow_icon.svg";
import info_icon from "./info_icon.svg";
import upload_icon from "./upload_icon.png";
import stripe_logo from "./stripe_logo.png";
import razorpay_logo from "./razorpay_logo.png";
import doc1 from "./doc1.png";
import doc2 from "./doc2.png";
import doc3 from "./doc3.png";
import doc4 from "./doc4.png";
import doc5 from "./doc5.png";
import doc6 from "./doc6.png";
import doc7 from "./doc7.png";
import doc8 from "./doc8.png";
import doc9 from "./doc9.png";
import doc10 from "./doc10.png";
import doc11 from "./doc11.png";
import doc12 from "./doc12.png";
import doc13 from "./doc13.png";
import doc14 from "./doc14.png";
import doc15 from "./doc15.png";

import add_icon from "./add_icon.svg";
import admin_logo from "./admin_logo.png";
import appointment_icon from "./appointment_icon.svg";
import cancel_icon from "./cancel_icon.svg";
import doctor_icon from "./doctor_icon.svg";
import home_icon from "./home_icon.svg";
import people_icon from "./people_icon.svg";
import upload_area from "./upload_area.svg";
import list_icon from "./list_icon.svg";
import tick_icon from "./tick_icon.svg";
import appointments_icon from "./appointments_icon.svg";
import earning_icon from "./earning_icon.svg";
import patients_icon from "./patients_icon.svg";
import Neuro from "./Neuro.png";
import Addiction from "./Addiction.png";
import Child from "./Child.png";
import Clinical from "./Clinical.png";
import Forensic from "./Forensic.png";

export const assets = {
  appointment_img,
  header_img,
  group_profiles,
  logo,
  chats_icon,
  verified_icon,
  info_icon,
  profile_pic,
  arrow_icon,
  contact_image,
  about_image,
  menu_icon,
  cross_icon,
  dropdown_icon,
  upload_icon,
  stripe_logo,
  razorpay_logo,
  add_icon,
  admin_logo,
  appointment_icon,
  cancel_icon,
  doctor_icon,
  upload_area,
  home_icon,
  patients_icon,
  people_icon,
  list_icon,
  tick_icon,
  appointments_icon,
  earning_icon,
};

export const specialityData = [
  {
    speciality: "Neuro Psychiatrist",
    image: Neuro,
  },
  {
    speciality: "Addiction Psychiatrist",
    image: Addiction,
  },
  {
    speciality: "Children Psychiatrist",
    image: Child,
  },
  {
    speciality: "Clinical Psychiatrist",
    image: Clinical,
  },
];

export const doctors = [
  {
    _id: "doc1",
    name: "Dr. Ahmed Khan",
    image: doc1,
    speciality: "Clinical Psychiatrist",
    degree: "MBBS, FCPS (Psychiatry)",
    experience: "8 Years",
    about:
      "Dr. Ahmed provides comprehensive mental health assessments, therapy, and medication management for anxiety and depression.",
    fees: 1800,
    address: {
      line1: "Gulberg III",
      line2: "Lahore, Pakistan",
    },
  },
  {
    _id: "doc2",
    name: "Dr. Ayesha Malik",
    image: doc2,
    speciality: "Child Psychiatrist",
    degree: "MBBS, FCPS (Child Psychiatry)",
    experience: "6 Years",
    about:
      "Dr. Ayesha specializes in diagnosing and treating behavioral, emotional, and developmental disorders in children and adolescents.",
    fees: 2200,
    address: {
      line1: "Clifton Block 5",
      line2: "Karachi, Pakistan",
    },
  },
  {
    _id: "doc3",
    name: "Dr. Fahad Shah",
    image: doc3,
    speciality: "Addiction Psychiatrist",
    degree: "MBBS, MCPS (Psychiatry)",
    experience: "4 Years",
    about:
      "Dr. Sarah focuses on treating substance use disorders and providing rehabilitation programs for long-term recovery.",
    fees: 1600,
    address: {
      line1: "F-7 Markaz",
      line2: "Islamabad, Pakistan",
    },
  },
  {
    _id: "doc4",
    name: "Dr. Hassan Ali",
    image: doc4,
    speciality: "Child Psychiatrist",
    degree: "MBBS, FCPS (Child Psychiatry)",
    experience: "7 Years",
    about:
      "Dr. Hassan works with children and families to manage ADHD, autism spectrum disorders, and emotional challenges.",
    fees: 1900,
    address: {
      line1: "University Town",
      line2: "Peshawar, Pakistan",
    },
  },
  {
    _id: "doc5",
    name: "Dr. Maria Zafar",
    image: doc5,
    speciality: "Neuropsychiatrist",
    degree: "MBBS, FCPS (Neuropsychiatry)",
    experience: "9 Years",
    about:
      "Dr. Maria treats patients with complex neurological and psychiatric conditions such as dementia, epilepsy, and bipolar disorder.",
    fees: 2500,
    address: {
      line1: "Satellite Town",
      line2: "Rawalpindi, Pakistan",
    },
  },
  {
    _id: "doc6",
    name: "Dr. Bilal Siddiqui",
    image: doc6,
    speciality: "Neuropsychiatrist",
    degree: "MBBS, MD (Neuropsychiatry)",
    experience: "10 Years",
    about:
      "Dr. Bilal is skilled in managing brain-related mental disorders, focusing on neurocognitive and mood disorders.",
    fees: 2600,
    address: {
      line1: "Saddar",
      line2: "Karachi, Pakistan",
    },
  },
  {
    _id: "doc7",
    name: "Dr. Imran Qureshi",
    image: doc7,
    speciality: "Clinical Psychiatrist",
    degree: "MBBS, FCPS (Psychiatry)",
    experience: "5 Years",
    about:
      "Dr. Imran provides psychotherapy and pharmacological treatment for patients struggling with anxiety and stress disorders.",
    fees: 1500,
    address: {
      line1: "Shahrah-e-Faisal",
      line2: "Karachi, Pakistan",
    },
  },
  {
    _id: "doc8",
    name: "Dr. Fatima Noor",
    image: doc8,
    speciality: "Addiction Psychiatrist",
    degree: "MBBS, FCPS (Addiction Medicine)",
    experience: "6 Years",
    about:
      "Dr. Fatima helps individuals recover from drug and alcohol addiction through integrated therapy and detox programs.",
    fees: 2300,
    address: {
      line1: "Model Town",
      line2: "Lahore, Pakistan",
    },
  },
  {
    _id: "doc9",
    name: "Dr. Hina Bashir",
    image: doc9,
    speciality: "Clinical Psychiatrist",
    degree: "MBBS, MCPS (Psychiatry)",
    experience: "3 Years",
    about:
      "Dr. Hina specializes in treating mood disorders, depression, and personality disorders with evidence-based approaches.",
    fees: 1400,
    address: {
      line1: "Jinnah Road",
      line2: "Quetta, Pakistan",
    },
  },
  {
    _id: "doc10",
    name: "Dr. Salman Akhtar",
    image: doc10,
    speciality: "Child Psychiatrist",
    degree: "MBBS, FCPS (Child Psychiatry)",
    experience: "6 Years",
    about:
      "Dr. Salman is dedicated to helping children manage behavioral problems and emotional instability through therapy.",
    fees: 1800,
    address: {
      line1: "Cantt Area",
      line2: "Multan, Pakistan",
    },
  },
  {
    _id: "doc11",
    name: "Dr. Sana Javed",
    image: doc11,
    speciality: "Neuropsychiatrist",
    degree: "MBBS, FCPS (Neuropsychiatry)",
    experience: "8 Years",
    about:
      "Dr. Sana focuses on neurological conditions linked with psychiatric symptoms, such as Parkinson’s and anxiety disorders.",
    fees: 2500,
    address: {
      line1: "Bahria Town",
      line2: "Rawalpindi, Pakistan",
    },
  },
  {
    _id: "doc12",
    name: "Dr. Kamran Mehmood",
    image: doc12,
    speciality: "Neuropsychiatrist",
    degree: "MBBS, MD (Neuropsychiatry)",
    experience: "11 Years",
    about:
      "Dr. Kamran treats brain and mental health disorders with both psychological and neurodiagnostic approaches.",
    fees: 2700,
    address: {
      line1: "G-10 Sector",
      line2: "Islamabad, Pakistan",
    },
  },
  {
    _id: "doc13",
    name: "Dr. Rabia Hussain",
    image: doc13,
    speciality: "Clinical Psychiatrist",
    degree: "MBBS, FCPS (Psychiatry)",
    experience: "4 Years",
    about:
      "Dr. Rabia provides therapy for depression, trauma recovery, and emotional well-being using holistic methods.",
    fees: 1600,
    address: {
      line1: "Saddar Bazar",
      line2: "Lahore, Pakistan",
    },
  },
  {
    _id: "doc14",
    name: "Dr. Usman Rauf",
    image: doc14,
    speciality: "Addiction Psychiatrist",
    degree: "MBBS, FCPS (Addiction Medicine)",
    experience: "7 Years",
    about:
      "Dr. Usman specializes in substance abuse therapy, relapse prevention, and long-term addiction management.",
    fees: 2200,
    address: {
      line1: "Hayatabad Phase 3",
      line2: "Peshawar, Pakistan",
    },
  },
  {
    _id: "doc15",
    name: "Dr. Mahnoor Saleem",
    image: doc15,
    speciality: "Child Psychiatrist",
    degree: "MBBS, FCPS (Child Psychiatry)",
    experience: "5 Years",
    about:
      "Dr. Mahnoor focuses on adolescent mental health, early intervention, and school-based therapy programs.",
    fees: 1900,
    address: {
      line1: "DHA Phase 5",
      line2: "Karachi, Pakistan",
    },
  },
];
