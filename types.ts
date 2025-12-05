export enum Tone {
  FUNNY = 'Drôle & Décalé',
  HEARTFELT = 'Touchant & Sincère',
  FORMAL = 'Formel & Professionnel',
  POETIC = 'Poétique & Inspiré',
  SHORT = 'Court & Efficace',
  ENTHUSIASTIC = 'Enthousiaste & Dynamique',
  LATE = 'En retard (Oups !)',
  SARCASTIC = 'Ironique & Piquant',
  INSPIRATIONAL = 'Inspirant & Sage'
}

export enum Relationship {
  FRIEND = 'Ami(e) proche',
  FAMILY = 'Membre de la famille',
  PARTNER = 'Conjoint / Partenaire',
  COLLEAGUE = 'Collègue',
  BOSS = 'Supérieur hiérarchique',
  ACQUAINTANCE = 'Connaissance',
  CLIENT = 'Client / Relation Pro'
}

export interface BirthdayFormData {
  recipientName: string;
  recipientEmail?: string;
  relationship: Relationship;
  tone: Tone;
  details: string; // Specific memories, hobbies, or wishes
  age?: number;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
}

export interface HistoryItem extends GeneratedEmail {
  id: string;
  timestamp: number;
  formData: BirthdayFormData;
}