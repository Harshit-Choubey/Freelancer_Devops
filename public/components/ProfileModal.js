import { Modals } from './Modals.js';
import { Toast } from './Toast.js';

export const ProfileModal = {
  render: (user) => `
    <div id="profileModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Your Profile</h3>
          <button class="modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div style="text-align: center; margin-bottom: 2rem;">
            <div style="width: 100px; height: 100px; background: linear-gradient(135deg, ${user.role === 'CLIENT' ? '#3b82f6, #1e40af' : '#10b981, #059669'}); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: bold; margin: 0 auto 1rem; overflow: hidden; box-shadow: 0 8px 25px rgba(${user.role === 'CLIENT' ? '59, 130, 246' : '16, 185, 129'}, 0.3);">
                ${user.profilePicture ? 
                    `<img src="${user.profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">` :
                    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                }
            </div>
            <h3 style="margin-bottom: 0.5rem; font-size: 1.5rem; font-weight: 700;">${user.firstName} ${user.lastName}</h3>
            <p style="color: #6b7280; margin: 0.5rem 0; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                <i class="fas fa-envelope" style="font-size: 0.875rem;"></i>
                ${user.email}
            </p>
            <span style="background: linear-gradient(135deg, ${user.role === 'CLIENT' ? '#3b82f6, #1e40af' : '#10b981, #059669'}); color: white; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; box-shadow: 0 4px 12px rgba(${user.role === 'CLIENT' ? '59, 130, 246' : '16, 185, 129'}, 0.3);">
                ${user.role === 'CLIENT' ? '👔 Client' : '💼 Freelancer'}
            </span>
          </div>
          
          <div style="margin-bottom: 2rem;">
            ${user.phone ? `
                <div style="margin-bottom: 1rem;">
                    <label style="font-weight: 600; color: #374151; display: block; margin-bottom: 0.5rem; font-size: 0.875rem;">Phone Number</label>
                    <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
                        <i class="fas fa-phone" style="color: #6b7280; font-size: 0.875rem;"></i>
                        <span>${user.phone}</span>
                    </div>
                </div>
            ` : ''}
            
            ${user.bio ? `
                <div style="margin-bottom: 1rem;">
                    <label style="font-weight: 600; color: #374151; display: block; margin-bottom: 0.5rem; font-size: 0.875rem;">Bio</label>
                    <div style="padding: 0.75rem; background: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb; line-height: 1.6;">
                        ${user.bio}
                    </div>
                </div>
            ` : ''}
            
            ${user.role === 'FREELANCER' && user.skills && user.skills.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <label style="font-weight: 600; color: #374151; display: block; margin-bottom: 0.5rem; font-size: 0.875rem;">Skills</label>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0.75rem; background: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
                        ${user.skills.map(skill => 
                            `<span style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 0.375rem 0.75rem; border-radius: 50px; font-size: 0.8rem; font-weight: 500; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">${skill}</span>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `,

  show: (user) => {
    Modals.show(ProfileModal.render(user));
  }
};
