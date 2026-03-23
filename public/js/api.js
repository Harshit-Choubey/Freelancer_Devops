class ApiService {
    constructor() {
        this.baseURL = '/api';
        this.token = localStorage.getItem('token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { Authorization: `Bearer ${this.token}` })
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth methods
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async verifyEmail(email, otp) {
        return this.request('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ email, otp })
        });
    }

    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.token) {
            this.setToken(response.token);
        }
        
        return response;
    }

    async forgotPassword(email) {
        return this.request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async resetPassword(token, newPassword) {
        return this.request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, newPassword })
        });
    }

    async getProfile() {
        return this.request('/auth/me');
    }

    // Job methods
    async createJob(jobData) {
        return this.request('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });
    }

    async getAllJobs(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = this.token ? '/jobs/browse' : '/jobs';
        return this.request(`${endpoint}${queryString ? '?' + queryString : ''}`);
    }

    async getJobById(id) {
        return this.request(`/jobs/${id}`);
    }

    async updateJob(id, jobData) {
        return this.request(`/jobs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(jobData)
        });
    }

    async deleteJob(id) {
        return this.request(`/jobs/${id}`, {
            method: 'DELETE'
        });
    }

    async applyToJob(id, applicationData) {
        return this.request(`/jobs/${id}/apply`, {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
    }

    async getMyJobs(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/jobs/my/jobs${queryString ? '?' + queryString : ''}`);
    }

    async getMyApplications(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/jobs/my/applications${queryString ? '?' + queryString : ''}`);
    }

    async getJobApplications(jobId) {
        return this.request(`/jobs/${jobId}/applications`);
    }

    async updateApplicationStatus(applicationId, status) {
        return this.request(`/jobs/applications/${applicationId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async sendMessage(jobId, content) {
        return this.request('/messages', {
            method: 'POST',
            body: JSON.stringify({ jobId, content })
        });
    }

    async getJobMessages(jobId) {
        return this.request(`/messages/job/${jobId}`);
    }

    async getMyConversations() {
        return this.request('/messages/conversations');
    }

    // User methods
    async updateProfile(profileData) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async changePassword(passwordData) {
        return this.request('/users/password', {
            method: 'PUT',
            body: JSON.stringify(passwordData)
        });
    }

    async getFreelancers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/users/freelancers${queryString ? '?' + queryString : ''}`);
    }

    async getFreelancerById(id) {
        return this.request(`/users/freelancers/${id}`);
    }

    async getDashboardStats() {
        return this.request('/users/dashboard/stats');
    }

    async uploadProfilePicture(formData) {
        // Remove Content-Type header to let browser set it with boundary for FormData
        const config = {
            method: 'POST',
            body: formData,
            headers: {
                ...(this.token && { Authorization: `Bearer ${this.token}` })
            }
        };
        
        // Remove Content-Type to let browser handle it for FormData
        delete config.headers['Content-Type'];
        
        return this.request('/users/profile/picture', config);
    }



    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('token');
    }
}

const api = new ApiService();
