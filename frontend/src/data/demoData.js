// =============================================================================
// INDUSTRY-SPECIFIC DEMO DATA
// =============================================================================

export const DEMO_INDUSTRIES = {
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'Heart',
    color: 'rose',
    gradient: 'from-rose-500 to-pink-500',
    description: 'Health surveys, vaccination tracking, facility assessments',
    bannerText: 'Sample data from Community Health Survey',
    projects: [
      {
        id: 'proj-1',
        name: 'Community Health Survey 2026',
        description: 'Community health assessment across 12 regions',
        status: 'active',
        submissions: 2847,
        target: 5000,
        forms: 3,
        team: 24,
        lastActivity: '2 hours ago',
        color: 'emerald'
      },
      {
        id: 'proj-2',
        name: 'Vaccination Campaign Tracker',
        description: 'Immunization coverage monitoring',
        status: 'active',
        submissions: 1523,
        target: 3000,
        forms: 2,
        team: 15,
        lastActivity: '30 mins ago',
        color: 'amber'
      },
      {
        id: 'proj-3',
        name: 'Clinic Facility Audit',
        description: 'Healthcare facility compliance checks',
        status: 'completed',
        submissions: 892,
        target: 900,
        forms: 1,
        team: 8,
        lastActivity: '3 days ago',
        color: 'sky'
      }
    ],
    forms: [
      { id: 'form-1', name: 'Household Health Assessment', project: 'Community Health Survey 2026', questions: 45, submissions: 1847, status: 'active', lastModified: 'Today', version: '2.3' },
      { id: 'form-2', name: 'Vaccination Record', project: 'Vaccination Campaign Tracker', questions: 28, submissions: 623, status: 'active', lastModified: 'Yesterday', version: '1.5' },
      { id: 'form-3', name: 'Facility Checklist', project: 'Clinic Facility Audit', questions: 62, submissions: 377, status: 'draft', lastModified: '3 days ago', version: '3.0' },
      { id: 'form-4', name: 'Patient Satisfaction Survey', project: 'Community Health Survey 2026', questions: 35, submissions: 1102, status: 'active', lastModified: 'Today', version: '1.2' }
    ],
    submissions: [
      { id: 'sub-1', form: 'Household Health Assessment', respondent: 'HH-REG-0847', enumerator: 'Sarah Johnson', location: 'Metro District, Zone A', gps: '40.7128, -74.0060', status: 'validated', timestamp: '2026-02-10 14:23', hasMedia: true, mediaCount: 3 },
      { id: 'sub-2', form: 'Vaccination Record', respondent: 'VAC-REG-1293', enumerator: 'Michael Chen', location: 'Coastal Region, Sector B', gps: '34.0522, -118.2437', status: 'pending', timestamp: '2026-02-10 14:15', hasMedia: false, mediaCount: 0 },
      { id: 'sub-3', form: 'Patient Satisfaction Survey', respondent: 'PSS-VAL-0234', enumerator: 'Emma Rodriguez', location: 'Valley North, Area C', gps: '41.8781, -87.6298', status: 'validated', timestamp: '2026-02-10 13:58', hasMedia: true, mediaCount: 5 },
      { id: 'sub-4', form: 'Household Health Assessment', respondent: 'HH-LAK-0562', enumerator: 'David Park', location: 'Lakeside, District D', gps: '29.7604, -95.3698', status: 'flagged', timestamp: '2026-02-10 13:42', hasMedia: true, mediaCount: 2 },
      { id: 'sub-5', form: 'Facility Checklist', respondent: 'FAC-CTR-0089', enumerator: 'Lisa Anderson', location: 'Central Hub, Zone E', gps: '33.4484, -112.0740', status: 'validated', timestamp: '2026-02-10 12:30', hasMedia: true, mediaCount: 8 }
    ],
    team: [
      { id: 1, name: 'Sarah Johnson', role: 'Health Worker', status: 'online', submissions: 127, location: 'Metro District' },
      { id: 2, name: 'Michael Chen', role: 'Nurse', status: 'online', submissions: 98, location: 'Coastal Region' },
      { id: 3, name: 'Emma Rodriguez', role: 'Supervisor', status: 'online', submissions: 45, location: 'Valley North' },
      { id: 4, name: 'David Park', role: 'Health Worker', status: 'offline', submissions: 112, location: 'Lakeside' },
      { id: 5, name: 'Lisa Anderson', role: 'Inspector', status: 'online', submissions: 89, location: 'Central Hub' },
      { id: 6, name: 'James Wilson', role: 'QA Reviewer', status: 'online', submissions: 0, location: 'Metro District' }
    ],
    stats: { totalSubmissions: 5262, activeEnumerators: 47, validated: 4891, pendingReview: 371 },
    activity: [
      { text: 'Sarah Johnson synced 12 health assessments', time: '2 mins ago', color: 'emerald' },
      { text: 'Vaccination batch VAC-2847 validated', time: '15 mins ago', color: 'sky' },
      { text: 'New team member added: Dr. Lisa Anderson', time: '2 hours ago', color: 'violet' }
    ]
  },
  agriculture: {
    id: 'agriculture',
    name: 'Agriculture',
    icon: 'Wheat',
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-500',
    description: 'Crop surveys, livestock monitoring, farm assessments',
    bannerText: 'Sample data from Regional Agricultural Census',
    projects: [
      {
        id: 'proj-1',
        name: 'Regional Crop Census 2026',
        description: 'Agricultural yield assessment across farming regions',
        status: 'active',
        submissions: 3421,
        target: 6000,
        forms: 4,
        team: 32,
        lastActivity: '1 hour ago',
        color: 'emerald'
      },
      {
        id: 'proj-2',
        name: 'Livestock Health Survey',
        description: 'Animal health and welfare monitoring',
        status: 'active',
        submissions: 1876,
        target: 4000,
        forms: 2,
        team: 18,
        lastActivity: '45 mins ago',
        color: 'amber'
      },
      {
        id: 'proj-3',
        name: 'Soil Quality Assessment',
        description: 'Soil analysis and fertilizer recommendations',
        status: 'completed',
        submissions: 1245,
        target: 1300,
        forms: 1,
        team: 12,
        lastActivity: '1 day ago',
        color: 'sky'
      }
    ],
    forms: [
      { id: 'form-1', name: 'Crop Yield Assessment', project: 'Regional Crop Census 2026', questions: 52, submissions: 2134, status: 'active', lastModified: 'Today', version: '3.1' },
      { id: 'form-2', name: 'Livestock Inventory', project: 'Livestock Health Survey', questions: 38, submissions: 987, status: 'active', lastModified: 'Yesterday', version: '2.0' },
      { id: 'form-3', name: 'Soil Sample Collection', project: 'Soil Quality Assessment', questions: 25, submissions: 1245, status: 'active', lastModified: '2 days ago', version: '1.4' },
      { id: 'form-4', name: 'Farm Equipment Survey', project: 'Regional Crop Census 2026', questions: 30, submissions: 654, status: 'draft', lastModified: 'Today', version: '1.0' }
    ],
    submissions: [
      { id: 'sub-1', form: 'Crop Yield Assessment', respondent: 'FARM-NTH-0234', enumerator: 'Robert Miller', location: 'North Plains, Sector 3', gps: '41.2565, -95.9345', status: 'validated', timestamp: '2026-02-10 14:23', hasMedia: true, mediaCount: 6 },
      { id: 'sub-2', form: 'Livestock Inventory', respondent: 'LST-WST-0891', enumerator: 'Maria Garcia', location: 'West Ranch, Area 7', gps: '35.4676, -97.5164', status: 'pending', timestamp: '2026-02-10 14:15', hasMedia: true, mediaCount: 4 },
      { id: 'sub-3', form: 'Soil Sample Collection', respondent: 'SOIL-CTR-0456', enumerator: 'John Smith', location: 'Central Valley, Zone B', gps: '36.7783, -119.4179', status: 'validated', timestamp: '2026-02-10 13:58', hasMedia: true, mediaCount: 3 },
      { id: 'sub-4', form: 'Crop Yield Assessment', respondent: 'FARM-EST-0789', enumerator: 'Anna Lee', location: 'Eastern Hills, District 2', gps: '40.4406, -79.9959', status: 'flagged', timestamp: '2026-02-10 13:42', hasMedia: true, mediaCount: 5 },
      { id: 'sub-5', form: 'Farm Equipment Survey', respondent: 'EQP-STH-0123', enumerator: 'Carlos Ruiz', location: 'Southern Fields, Area 4', gps: '29.4241, -98.4936', status: 'validated', timestamp: '2026-02-10 12:30', hasMedia: true, mediaCount: 8 }
    ],
    team: [
      { id: 1, name: 'Robert Miller', role: 'Field Agent', status: 'online', submissions: 156, location: 'North Plains' },
      { id: 2, name: 'Maria Garcia', role: 'Livestock Specialist', status: 'online', submissions: 134, location: 'West Ranch' },
      { id: 3, name: 'John Smith', role: 'Supervisor', status: 'online', submissions: 67, location: 'Central Valley' },
      { id: 4, name: 'Anna Lee', role: 'Field Agent', status: 'offline', submissions: 145, location: 'Eastern Hills' },
      { id: 5, name: 'Carlos Ruiz', role: 'Equipment Inspector', status: 'online', submissions: 98, location: 'Southern Fields' },
      { id: 6, name: 'Patricia Brown', role: 'QA Reviewer', status: 'online', submissions: 0, location: 'Central Valley' }
    ],
    stats: { totalSubmissions: 6542, activeEnumerators: 62, validated: 5987, pendingReview: 555 },
    activity: [
      { text: 'Robert Miller submitted 8 crop assessments', time: '5 mins ago', color: 'emerald' },
      { text: 'Soil batch SOIL-2847 analysis complete', time: '20 mins ago', color: 'sky' },
      { text: 'New agent added: Carlos Ruiz', time: '3 hours ago', color: 'violet' }
    ]
  },
  education: {
    id: 'education',
    name: 'Education',
    icon: 'GraduationCap',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-500',
    description: 'School surveys, enrollment tracking, facility audits',
    bannerText: 'Sample data from School Enrollment Census',
    projects: [
      {
        id: 'proj-1',
        name: 'School Enrollment Census 2026',
        description: 'Student enrollment verification across districts',
        status: 'active',
        submissions: 4521,
        target: 8000,
        forms: 3,
        team: 45,
        lastActivity: '30 mins ago',
        color: 'emerald'
      },
      {
        id: 'proj-2',
        name: 'Teacher Attendance Tracker',
        description: 'Daily teacher attendance monitoring',
        status: 'active',
        submissions: 2876,
        target: 5000,
        forms: 1,
        team: 28,
        lastActivity: '1 hour ago',
        color: 'amber'
      },
      {
        id: 'proj-3',
        name: 'School Infrastructure Audit',
        description: 'Facility condition assessment',
        status: 'completed',
        submissions: 756,
        target: 800,
        forms: 2,
        team: 15,
        lastActivity: '2 days ago',
        color: 'sky'
      }
    ],
    forms: [
      { id: 'form-1', name: 'Student Enrollment Form', project: 'School Enrollment Census 2026', questions: 35, submissions: 3245, status: 'active', lastModified: 'Today', version: '2.5' },
      { id: 'form-2', name: 'Teacher Attendance Sheet', project: 'Teacher Attendance Tracker', questions: 15, submissions: 2876, status: 'active', lastModified: 'Today', version: '1.8' },
      { id: 'form-3', name: 'Classroom Inventory', project: 'School Infrastructure Audit', questions: 42, submissions: 456, status: 'active', lastModified: 'Yesterday', version: '2.0' },
      { id: 'form-4', name: 'Student Performance Survey', project: 'School Enrollment Census 2026', questions: 28, submissions: 1276, status: 'draft', lastModified: '3 days ago', version: '1.0' }
    ],
    submissions: [
      { id: 'sub-1', form: 'Student Enrollment Form', respondent: 'ENR-DST1-0847', enumerator: 'Jennifer Adams', location: 'District 1, Lincoln Elementary', gps: '42.3601, -71.0589', status: 'validated', timestamp: '2026-02-10 14:23', hasMedia: true, mediaCount: 2 },
      { id: 'sub-2', form: 'Teacher Attendance Sheet', respondent: 'ATT-DST2-1293', enumerator: 'Mark Thompson', location: 'District 2, Washington Middle', gps: '38.9072, -77.0369', status: 'pending', timestamp: '2026-02-10 14:15', hasMedia: false, mediaCount: 0 },
      { id: 'sub-3', form: 'Classroom Inventory', respondent: 'INV-DST3-0234', enumerator: 'Susan Clark', location: 'District 3, Jefferson High', gps: '39.7392, -104.9903', status: 'validated', timestamp: '2026-02-10 13:58', hasMedia: true, mediaCount: 12 },
      { id: 'sub-4', form: 'Student Enrollment Form', respondent: 'ENR-DST4-0562', enumerator: 'Kevin Wright', location: 'District 4, Roosevelt Primary', gps: '33.7490, -84.3880', status: 'flagged', timestamp: '2026-02-10 13:42', hasMedia: true, mediaCount: 1 },
      { id: 'sub-5', form: 'Student Performance Survey', respondent: 'SRV-DST5-0089', enumerator: 'Rachel Kim', location: 'District 5, Madison Academy', gps: '47.6062, -122.3321', status: 'validated', timestamp: '2026-02-10 12:30', hasMedia: false, mediaCount: 0 }
    ],
    team: [
      { id: 1, name: 'Jennifer Adams', role: 'Enumerator', status: 'online', submissions: 189, location: 'District 1' },
      { id: 2, name: 'Mark Thompson', role: 'Attendance Monitor', status: 'online', submissions: 234, location: 'District 2' },
      { id: 3, name: 'Susan Clark', role: 'Supervisor', status: 'online', submissions: 78, location: 'District 3' },
      { id: 4, name: 'Kevin Wright', role: 'Enumerator', status: 'offline', submissions: 167, location: 'District 4' },
      { id: 5, name: 'Rachel Kim', role: 'Inspector', status: 'online', submissions: 145, location: 'District 5' },
      { id: 6, name: 'Daniel Moore', role: 'QA Reviewer', status: 'online', submissions: 0, location: 'Central Office' }
    ],
    stats: { totalSubmissions: 8153, activeEnumerators: 88, validated: 7456, pendingReview: 697 },
    activity: [
      { text: 'Jennifer Adams enrolled 23 students', time: '3 mins ago', color: 'emerald' },
      { text: 'District 3 audit completed', time: '25 mins ago', color: 'sky' },
      { text: 'New monitor added: Rachel Kim', time: '1 hour ago', color: 'violet' }
    ]
  }
};

export const getIndustryData = (industryId) => DEMO_INDUSTRIES[industryId] || DEMO_INDUSTRIES.healthcare;

export const INDUSTRY_LIST = Object.values(DEMO_INDUSTRIES).map(({ id, name, icon, color, gradient, description }) => ({
  id, name, icon, color, gradient, description
}));
