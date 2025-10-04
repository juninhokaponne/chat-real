import React, { useState } from 'react';
import { 
  MdAccountCircle, 
  MdEmail, 
  MdEdit, 
  MdSave, 
  MdCancel,
  MdArrowBack,
  MdCameraAlt
} from 'react-icons/md';
import { User } from '../../types';
import styles from './Profile.module.css';

interface ProfileProps {
  user: User;
  onBack: () => void;
  onUpdateUser?: (updatedUser: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onBack, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(user);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser(user);
  };

  const handleSave = () => {
    if (onUpdateUser) {
      onUpdateUser(editedUser);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <button className={styles.backButton} onClick={onBack}>
          <MdArrowBack size={24} />
          Back
        </button>
        
        <div className={styles.headerActions}>
          {!isEditing ? (
            <button className={styles.editButton} onClick={handleEdit}>
              <MdEdit size={20} />
              Edit Profile
            </button>
          ) : (
            <div className={styles.editActions}>
              <button className={styles.saveButton} onClick={handleSave}>
                <MdSave size={20} />
                Save
              </button>
              <button className={styles.cancelButton} onClick={handleCancel}>
                <MdCancel size={20} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.profileContent}>
        <div className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className={styles.avatar} />
              ) : (
                <MdAccountCircle size={80} className={styles.defaultAvatar} />
              )}
              {isEditing && (
                <button className={styles.avatarEditButton}>
                  <MdCameraAlt size={20} />
                </button>
              )}
            </div>
            <div className={styles.userInfo}>
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={styles.nameInput}
                  placeholder="Full Name"
                />
              ) : (
                <h1 className={styles.userName}>{user.name}</h1>
              )}
              <p className={styles.userEmail}>
                <MdEmail size={16} />
                {isEditing ? (
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={styles.emailInput}
                    placeholder="Email address"
                  />
                ) : (
                  user.email
                )}
              </p>
            </div>
          </div>

          <div className={styles.detailsSection}>
            <h2 className={styles.sectionTitle}>Account Details</h2>
            
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>User ID</span>
              <span className={styles.detailValue}>{user.id}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Member Since</span>
              <span className={styles.detailValue}>
                {formatDate(user.createdAt)}
              </span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Last Active</span>
              <span className={styles.detailValue}>
                {formatDate(user.lastActive)}
              </span>
            </div>
          </div>

          <div className={styles.statsSection}>
            <h2 className={styles.sectionTitle}>Activity Stats</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>0</span>
                <span className={styles.statLabel}>Total Calls</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>0</span>
                <span className={styles.statLabel}>Hours Talked</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>0</span>
                <span className={styles.statLabel}>Rooms Created</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
