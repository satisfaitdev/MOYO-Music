// Client API centralisé pour connecter le Frontend Next.js au Backend Express

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('moyo_auth_token');
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('moyo_auth_token', token);
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('moyo_auth_token');
    localStorage.removeItem('moyo_user');
  }
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Erreur requête (${response.status})`);
  }

  return data as T;
}

// ==========================================
// 1. SERVICES D'AUTHENTIFICATION
// ==========================================
export const authApi = {
  register: (userData: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials: { identifier: string; password: string }) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getProfile: () => apiRequest('/auth/me', { method: 'GET' }),
};

// ==========================================
// 2. SERVICES DE DISTRIBUTION & RELEASES
// ==========================================
export const releasesApi = {
  getAll: () => apiRequest('/releases', { method: 'GET' }),
  getMyReleases: () => apiRequest('/releases/my-releases', { method: 'GET' }),
  create: (releaseData: any) => apiRequest('/releases/create', { method: 'POST', body: JSON.stringify(releaseData) }),
  distribute: (releaseId: string) => apiRequest(`/releases/${releaseId}/distribute`, { method: 'POST' }),
};

// ==========================================
// 3. SERVICES 360° (YouTube OAC, TikTok, Spotify)
// ==========================================
export const servicesApi = {
  getCatalog: () => apiRequest('/services360/catalog', { method: 'GET' }),
  getMyRequests: () => apiRequest('/services360/my-requests', { method: 'GET' }),
  orderService: (data: any) => apiRequest('/services360/order', { method: 'POST', body: JSON.stringify(data) }),
};

// ==========================================
// 4. SERVICES DE BILLETTERIE & CONCERTS
// ==========================================
export const ticketingApi = {
  getVenues: () => apiRequest('/ticketing/venues', { method: 'GET' }),
  getEvents: () => apiRequest('/ticketing/events', { method: 'GET' }),
  getEventDetails: (id: string) => apiRequest(`/ticketing/events/${id}`, { method: 'GET' }),
  createEvent: (data: any) => apiRequest('/ticketing/events/create', { method: 'POST', body: JSON.stringify(data) }),
  buyTicket: (data: { event_id: string; buyer_name: string; buyer_phone: string; ticket_type: string; payment_method: string }) =>
    apiRequest('/ticketing/buy-ticket', { method: 'POST', body: JSON.stringify(data) }),
  scanTicket: (qrCodeHash: string) =>
    apiRequest('/ticketing/scan-ticket', { method: 'POST', body: JSON.stringify({ qr_code_hash: qrCodeHash }) }),
};

// ==========================================
// 5. SERVICES MARCHÉ DE L'ART (Poto-Poto)
// ==========================================
export const marketplaceApi = {
  getArtworks: (category?: string) => apiRequest(`/marketplace/artworks${category ? `?category=${category}` : ''}`, { method: 'GET' }),
  getMyArtworks: () => apiRequest('/marketplace/my-artworks', { method: 'GET' }),
  createArtwork: (data: any) => apiRequest('/marketplace/artworks/create', { method: 'POST', body: JSON.stringify(data) }),
  getArtworkDetails: (id: string) => apiRequest(`/marketplace/artworks/${id}`, { method: 'GET' }),
  verifyCertificate: (certNumber: string) => apiRequest(`/marketplace/verify-certificate/${certNumber}`, { method: 'GET' }),
};

// ==========================================
// 6. SERVICES WALLET & RETRAITS MOBILE MONEY
// ==========================================
export const walletApi = {
  getSummary: () => apiRequest('/wallet/summary', { method: 'GET' }),
  withdraw: (data: { amount_fcfa: number; phone_number: string; operator: string }) =>
    apiRequest('/wallet/withdraw', { method: 'POST', body: JSON.stringify(data) }),
};

// ==========================================
// 7. PHASE 4 : MONITORING DATA RADIOS / TV CONGO & BCDA
// ==========================================
export const monitoringApi = {
  getStations: () => apiRequest('/monitoring/stations', { method: 'GET' }),
  getLiveFeed: () => apiRequest('/monitoring/live-feed', { method: 'GET' }),
  getArtistAirplay: () => apiRequest('/monitoring/artist-airplay', { method: 'GET' }),
  simulateDetection: (payload?: any) => apiRequest('/monitoring/simulate-detection', { method: 'POST', body: JSON.stringify(payload || {}) }),
  getBcdaReport: () => apiRequest('/monitoring/bcda-report', { method: 'GET' }),
  distributeAirplayRoyalties: () => apiRequest('/monitoring/distribute-airplay-royalties', { method: 'POST' }),
};

// ==========================================
// 8. INFRASTRUCTURE NATIONALE BCDA (DROITS & LICENCES)
// ==========================================
export const bcdaApi = {
  getStats: () => apiRequest('/bcda/stats', { method: 'GET' }),
  getWorks: (search?: string) => apiRequest(`/bcda/works${search ? `?search=${encodeURIComponent(search)}` : ''}`, { method: 'GET' }),
  inspectAudio: (data: any) => apiRequest('/bcda/works/inspect-audio', { method: 'POST', body: JSON.stringify(data) }),
  registerWork: (data: any) => apiRequest('/bcda/works/register', { method: 'POST', body: JSON.stringify(data) }),
  getLicenses: (search?: string) => apiRequest(`/bcda/licenses${search ? `?search=${encodeURIComponent(search)}` : ''}`, { method: 'GET' }),
  payLicense: (data: any) => apiRequest('/bcda/licenses/pay', { method: 'POST', body: JSON.stringify(data) }),
  renewLicense: (data: any) => apiRequest('/bcda/licenses/renew', { method: 'POST', body: JSON.stringify(data) }),
  distributeRoyalties: (data: any) => apiRequest('/bcda/royalties/distribute', { method: 'POST', body: JSON.stringify(data) }),
};
