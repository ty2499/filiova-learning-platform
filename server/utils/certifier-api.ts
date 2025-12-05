import axios from 'axios';

const CERTIFIER_API_BASE = 'https://api.certifier.io/v1';
const CERTIFIER_API_KEY = process.env.CERTIFIER_API_KEY;
const CERTIFIER_VERSION = '2022-10-26';

interface CertifierRecipient {
  name: string;
  email: string;
}

interface CertifierCredentialData {
  groupId: string;
  recipient: CertifierRecipient;
  customAttributes?: Record<string, any>;
  issueDate?: string;
  expiryDate?: string;
}

interface CertifierCredentialResponse {
  id: string;
  publicId?: string;
  status: string;
  certificateUrl?: string;
  verificationUrl?: string;
  recipient: CertifierRecipient;
  customAttributes?: Record<string, any>;
}

export class CertifierAPI {
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(apiKey: string = CERTIFIER_API_KEY || '') {
    if (!apiKey) {
      throw new Error('Certifier API key is required. Please set CERTIFIER_API_KEY in your environment variables.');
    }
    
    this.apiKey = apiKey;
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Certifier-Version': CERTIFIER_VERSION,
      'Content-Type': 'application/json',
    };
  }

  async createIssueAndSendCredential(data: CertifierCredentialData): Promise<CertifierCredentialResponse> {
    try {
      const response = await axios.post(
        `${CERTIFIER_API_BASE}/credentials/create-issue-send`,
        data,
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Certifier API Error:', error.response?.data || error.message);
      throw new Error(`Failed to create certificate: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createCredential(data: CertifierCredentialData): Promise<CertifierCredentialResponse> {
    try {
      const response = await axios.post(
        `${CERTIFIER_API_BASE}/credentials`,
        data,
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Certifier API Error:', error.response?.data || error.message);
      throw new Error(`Failed to create credential: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async issueCredential(credentialId: string): Promise<CertifierCredentialResponse> {
    try {
      const response = await axios.post(
        `${CERTIFIER_API_BASE}/credentials/${credentialId}/issue`,
        {},
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Certifier API Error:', error.response?.data || error.message);
      throw new Error(`Failed to issue credential: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async sendCredential(credentialId: string): Promise<CertifierCredentialResponse> {
    try {
      const response = await axios.post(
        `${CERTIFIER_API_BASE}/credentials/${credentialId}/send`,
        {},
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Certifier API Error:', error.response?.data || error.message);
      throw new Error(`Failed to send credential: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getCredential(credentialId: string): Promise<CertifierCredentialResponse> {
    try {
      const response = await axios.get(
        `${CERTIFIER_API_BASE}/credentials/${credentialId}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Certifier API Error:', error.response?.data || error.message);
      throw new Error(`Failed to get credential: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async listDesigns(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${CERTIFIER_API_BASE}/designs`,
        { headers: this.headers }
      );
      return response.data.designs || [];
    } catch (error: any) {
      console.error('Certifier API Error:', error.response?.data || error.message);
      throw new Error(`Failed to list designs: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getWorkspace(): Promise<any> {
    try {
      const response = await axios.get(
        `${CERTIFIER_API_BASE}/workspace`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Certifier API Error:', error.response?.data || error.message);
      throw new Error(`Failed to get workspace: ${error.response?.data?.error?.message || error.message}`);
    }
  }


  getDigitalWalletUrl(publicId: string): string {
    return `https://verify.certifier.me/verify/${publicId}`;
  }
}

export const certifierAPI = new CertifierAPI();
