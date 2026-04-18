// Module Registry - Only modules that have folders
import jobRecruitmentModule from './job-recruitment';
import linkedinModule from './linkedin';
import socialMediaModule from './social-media';
import scamWebsiteModule from './scam-website';
import cryptoWalletModule from './crypto-wallet';

// Placeholders for modules that don't have folders yet
const emailLeakModule = {
  AddModal: () => null,
  EditModal: () => null,
  config: { name: 'Email Leak Check' },
  api: {},
  moduleId: 'email-leak',
  name: 'Email Leak Check'
};

const scamEmailModule = {
  AddModal: () => null,
  EditModal: () => null,
  config: { name: 'Scam Email Analysis' },
  api: {},
  moduleId: 'scam-email',
  name: 'Scam Email Analysis'
};

const phoneNumberModule = {
  AddModal: () => null,
  EditModal: () => null,
  config: { name: 'Phone Number OSINT' },
  api: {},
  moduleId: 'phone-number',
  name: 'Phone Number OSINT'
};

export const moduleRegistry = {
  'job-recruitment': jobRecruitmentModule,
  'linkedin': linkedinModule,
  'social-media': socialMediaModule,
  'scam-website': scamWebsiteModule,
  'crypto-wallet': cryptoWalletModule,
  'email-leak': emailLeakModule,
  'scam-email': scamEmailModule,
  'phone-number': phoneNumberModule
};

export const getModuleAddModal = (moduleType) => {
  return moduleRegistry[moduleType]?.AddModal || null;
};

export const getModuleEditModal = (moduleType) => {
  return moduleRegistry[moduleType]?.EditModal || null;
};

export const getModuleConfig = (moduleType) => {
  return moduleRegistry[moduleType]?.config || null;
};

export const getModuleApi = (moduleType) => {
  return moduleRegistry[moduleType]?.api || null;
};

export const getModuleName = (moduleType) => {
  return moduleRegistry[moduleType]?.name || null;
};