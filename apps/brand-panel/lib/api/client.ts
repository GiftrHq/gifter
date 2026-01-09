import qs from 'qs'
import type { PayloadResponse, PayloadDoc, PayloadError } from '../types/payload'

const API_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001'

class PayloadAPIClient {
  private baseURL: string

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL
  }

  private async getToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('payload-token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `JWT ${token}`
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      const error: PayloadError = await response.json().catch(() => ({
        message: response.statusText,
      }))
      throw new Error(error.message || 'API request failed')
    }

    return response.json()
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string; exp: number }>(
      '/api/users/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    )
  }

  async logout() {
    return this.request('/api/users/logout', { method: 'POST' })
  }

  async me() {
    return this.request<{ user: any }>('/api/users/me')
  }

  async forgotPassword(email: string) {
    return this.request('/api/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string) {
    return this.request('/api/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  }

  // Generic CRUD operations
  async find<T>(
    collection: string,
    params?: {
      where?: any
      limit?: number
      page?: number
      sort?: string
      depth?: number
      draft?: boolean
    }
  ): Promise<PayloadResponse<T>> {
    const query = qs.stringify(
      {
        where: params?.where,
        limit: params?.limit,
        page: params?.page,
        sort: params?.sort,
        depth: params?.depth,
        draft: params?.draft,
      },
      {
        addQueryPrefix: true,
        encodeValuesOnly: true, // important: keeps brackets readable for Payload
        skipNulls: true,
      }
    )

    const url = `/api/${collection}${query}`
    return this.request<PayloadResponse<T>>(url)
  }

  async findByID<T>(
    collection: string,
    id: string,
    depth?: number
  ): Promise<T> {
    const params = depth ? `?depth=${depth}` : ''
    return this.request<T>(`/api/${collection}/${id}${params}`)
  }

  async create<T>(collection: string, data: Record<string, unknown>): Promise<T> {
    const response = await this.request<{ doc: T }>(`/api/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.doc
  }

  async update<T>(
    collection: string,
    id: string,
    data: Record<string, unknown>
  ): Promise<T> {
    const response = await this.request<{ doc: T }>(`/api/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return response.doc
  }

  async delete(collection: string, id: string): Promise<void> {
    return this.request(`/api/${collection}/${id}`, {
      method: 'DELETE',
    })
  }

  // File upload
  async upload(file: File, alt?: string): Promise<any> {
    const token = await this.getToken()
    const formData = new FormData()
    formData.append('file', file)
    if (alt) {
      formData.append('alt', alt)
    }

    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `JWT ${token}`
    }

    const response = await fetch(`${this.baseURL}/api/media`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const result = await response.json()
    return result.doc
  }

  // Custom endpoint for Stripe onboarding
  async getStripeOnboardingLink(brandId: string): Promise<{ url: string }> {
    return this.request<{ url: string }>(
      `/api/brands/${brandId}/stripe/onboard`,
      {
        method: 'POST',
      }
    )
  }
}

export const apiClient = new PayloadAPIClient()
