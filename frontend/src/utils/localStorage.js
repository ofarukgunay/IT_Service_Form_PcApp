// Local storage utilities for form data management

export const storageKeys = {
  CURRENT_FORM: 'serviceFormCurrent',
  SAVED_FORMS: 'serviceFormsSaved',
  FORM_SETTINGS: 'serviceFormSettings'
};

// Save current form data to localStorage
export const saveCurrentForm = (formData, customApplications) => {
  try {
    const data = {
      formData,
      customApplications,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(storageKeys.CURRENT_FORM, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving current form:', error);
    return false;
  }
};

// Load current form data from localStorage
export const loadCurrentForm = () => {
  try {
    const data = localStorage.getItem(storageKeys.CURRENT_FORM);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading current form:', error);
    return null;
  }
};

// Save form to saved forms list
export const saveFormToList = (formData, customApplications, formName) => {
  try {
    const savedForms = getSavedForms();
    const newForm = {
      id: Date.now(),
      name: formName,
      date: new Date().toISOString(),
      data: formData,
      customApplications: customApplications || []
    };
    
    const updatedForms = [...savedForms, newForm];
    localStorage.setItem(storageKeys.SAVED_FORMS, JSON.stringify(updatedForms));
    return newForm;
  } catch (error) {
    console.error('Error saving form to list:', error);
    return null;
  }
};

// Get all saved forms
export const getSavedForms = () => {
  try {
    const data = localStorage.getItem(storageKeys.SAVED_FORMS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting saved forms:', error);
    return [];
  }
};

// Delete a saved form
export const deleteSavedForm = (formId) => {
  try {
    const savedForms = getSavedForms();
    const updatedForms = savedForms.filter(form => form.id !== formId);
    localStorage.setItem(storageKeys.SAVED_FORMS, JSON.stringify(updatedForms));
    return true;
  } catch (error) {
    console.error('Error deleting saved form:', error);
    return false;
  }
};

// Clear current form
export const clearCurrentForm = () => {
  try {
    localStorage.removeItem(storageKeys.CURRENT_FORM);
    return true;
  } catch (error) {
    console.error('Error clearing current form:', error);
    return false;
  }
};

// Export all forms data (for backup)
export const exportAllForms = () => {
  try {
    const savedForms = getSavedForms();
    const currentForm = loadCurrentForm();
    
    const exportData = {
      savedForms,
      currentForm,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting forms:', error);
    return null;
  }
};

// Import forms data (for restore)
export const importForms = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.savedForms) {
      localStorage.setItem(storageKeys.SAVED_FORMS, JSON.stringify(data.savedForms));
    }
    
    if (data.currentForm) {
      localStorage.setItem(storageKeys.CURRENT_FORM, JSON.stringify(data.currentForm));
    }
    
    return true;
  } catch (error) {
    console.error('Error importing forms:', error);
    return false;
  }
};

// Get storage usage information
export const getStorageInfo = () => {
  try {
    const savedForms = getSavedForms();
    const currentForm = loadCurrentForm();
    
    const savedFormsSize = JSON.stringify(savedForms).length;
    const currentFormSize = currentForm ? JSON.stringify(currentForm).length : 0;
    
    return {
      savedFormsCount: savedForms.length,
      savedFormsSize: `${(savedFormsSize / 1024).toFixed(2)} KB`,
      currentFormSize: `${(currentFormSize / 1024).toFixed(2)} KB`,
      totalSize: `${((savedFormsSize + currentFormSize) / 1024).toFixed(2)} KB`
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
};