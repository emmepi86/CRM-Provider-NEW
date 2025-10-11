/**
 * API client for Landing Pages (Public - No Auth Required)
 */
import axios from 'axios';
import type { LandingPage, SubmissionData, SubmissionResponse, LandingPageStats } from '../types/landing';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Axios instance WITHOUT auth interceptors (public endpoints)
const publicClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const landingPageAPI = {
  /**
   * Get landing page by slug (public, no auth)
   */
  getBySlug: async (slug: string): Promise<LandingPage> => {
    const { data } = await publicClient.get(`/public/landing/${slug}`);
    return data;
  },

  /**
   * Submit form to landing page (public, no auth)
   */
  submitForm: async (slug: string, submissionData: SubmissionData): Promise<SubmissionResponse> => {
    // Auto-detect IP and User-Agent if not provided
    const payload: SubmissionData = {
      ...submissionData,
      user_agent: submissionData.user_agent || navigator.userAgent,
      // IP address will be captured server-side from request headers
    };

    const { data } = await publicClient.post(`/public/landing/${slug}/submit`, payload);
    return data;
  },

  /**
   * Get landing page stats (public, no auth)
   */
  getStats: async (slug: string): Promise<LandingPageStats> => {
    const { data } = await publicClient.get(`/public/landing/${slug}/stats`);
    return data;
  }
};
