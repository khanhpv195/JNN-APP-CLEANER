// Production-ready data utilities for handling missing/incomplete data

/**
 * Safely extracts guest information from task data
 * @param {Object} task - Task object
 * @returns {Object} Guest info with validation flags
 */
export const extractGuestInfo = (task) => {
  // Null safety check
  if (!task || typeof task !== 'object') {
    return {
      name: null,
      reservationId: null,
      hasGuestData: false,
      hasReservationId: false
    };
  }

  const guestName = task.reservationDetails?.guest?.name || 
                   task.guest?.name || 
                   task.guestName || 
                   null;

  const reservationId = task.reservationId || 
                       task.reservationDetails?.id ||
                       task.id ||
                       null;

  return {
    name: guestName,
    reservationId: reservationId,
    hasGuestData: Boolean(guestName),
    hasReservationId: Boolean(reservationId)
  };
};

/**
 * Safely extracts property information from task data
 * @param {Object} task - Task object  
 * @returns {Object} Property info with validation flags
 */
export const extractPropertyInfo = (task) => {
  // Null safety check
  if (!task || typeof task !== 'object') {
    return {
      name: null,
      address: null,
      hasPropertyData: false,
      hasAddress: false
    };
  }

  const propertyName = task.propertyId?.name || 
                      task.property?.name || 
                      task.propertyName ||
                      null;

  const propertyAddress = task.propertyId?.address || 
                         task.property?.address ||
                         task.propertyAddress ||
                         null;

  return {
    name: propertyName,
    address: propertyAddress,
    hasPropertyData: Boolean(propertyName),
    hasAddress: Boolean(propertyAddress)
  };
};

/**
 * Formats reservation ID for display
 * @param {string} reservationId - Raw reservation ID
 * @returns {string|null} Formatted ID or null
 */
export const formatReservationId = (reservationId) => {
  if (!reservationId || typeof reservationId !== 'string') {
    return null;
  }
  
  // Take last 8 characters and uppercase for consistency
  if (reservationId.length >= 8) {
    return reservationId.slice(-8).toUpperCase();
  }
  
  // If shorter than 8 chars, just uppercase
  return reservationId.toUpperCase();
};

/**
 * Creates guest display text with proper fallbacks
 * @param {Object} guestInfo - Guest info object from extractGuestInfo
 * @returns {Object} Display text and visibility flags
 */
export const createGuestDisplayText = (guestInfo) => {
  const { name, reservationId, hasGuestData, hasReservationId } = guestInfo;
  
  // Case 1: Have both guest name and reservation ID
  if (hasGuestData && hasReservationId) {
    const formattedId = formatReservationId(reservationId);
    return {
      text: `#${formattedId} ${name}`,
      showField: true,
      isComplete: true
    };
  }
  
  // Case 2: Have only guest name
  if (hasGuestData && !hasReservationId) {
    return {
      text: name,
      showField: true,
      isComplete: false,
      missingData: 'reservation ID'
    };
  }
  
  // Case 3: Have only reservation ID
  if (!hasGuestData && hasReservationId) {
    const formattedId = formatReservationId(reservationId);
    return {
      text: `#${formattedId}`,
      showField: true,
      isComplete: false,
      missingData: 'guest name'
    };
  }
  
  // Case 4: Have neither - hide field completely
  return {
    text: null,
    showField: false,
    isComplete: false,
    missingData: 'guest information'
  };
};

/**
 * Validates task data completeness for UI decisions
 * @param {Object} task - Task object
 * @returns {Object} Validation results
 */
export const validateTaskData = (task) => {
  // Null safety check
  if (!task || typeof task !== 'object') {
    return {
      guest: { hasGuestData: false, hasReservationId: false },
      property: { hasPropertyData: false, hasAddress: false },
      hasCheckInDate: false,
      hasCheckOutDate: false,
      isDataComplete: false
    };
  }

  const guestInfo = extractGuestInfo(task);
  const propertyInfo = extractPropertyInfo(task);
  
  return {
    guest: guestInfo,
    property: propertyInfo,
    hasCheckInDate: Boolean(task.checkInDate),
    hasCheckOutDate: Boolean(task.checkOutDate),
    isDataComplete: guestInfo.hasGuestData && 
                   guestInfo.hasReservationId && 
                   propertyInfo.hasPropertyData &&
                   Boolean(task.checkInDate) &&
                   Boolean(task.checkOutDate)
  };
};

/**
 * Gets appropriate empty state message based on missing data
 * @param {Object} validationResult - Result from validateTaskData
 * @returns {string} User-friendly message
 */
export const getDataIncompleteMessage = (validationResult) => {
  const missing = [];
  
  if (!validationResult.guest.hasGuestData) missing.push('guest information');
  if (!validationResult.property.hasPropertyData) missing.push('property details');
  if (!validationResult.hasCheckInDate) missing.push('check-in date');
  if (!validationResult.hasCheckOutDate) missing.push('check-out date');
  
  if (missing.length === 0) return null;
  
  if (missing.length === 1) {
    return `Missing ${missing[0]}`;
  }
  
  if (missing.length === 2) {
    return `Missing ${missing[0]} and ${missing[1]}`;
  }
  
  return `Missing ${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}`;
};

/**
 * Safe date formatter that handles null/undefined dates
 * @param {string|Date} dateString - Date to format
 * @returns {Object} Formatted date and time or fallback values
 */
export const safeFormatDateTime = (dateString) => {
  if (!dateString) {
    return { 
      date: null, 
      time: null, 
      hasDate: false,
      displayDate: 'Date not set',
      displayTime: 'Time not set'
    };
  }
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return { 
        date: null, 
        time: null, 
        hasDate: false,
        displayDate: 'Invalid date',
        displayTime: 'Invalid time'
      };
    }
    
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      hasDate: true,
      displayDate: null,
      displayTime: null
    };
  } catch (error) {
    console.warn('Date formatting error:', error);
    return { 
      date: null, 
      time: null, 
      hasDate: false,
      displayDate: 'Invalid date',
      displayTime: 'Invalid time'
    };
  }
};