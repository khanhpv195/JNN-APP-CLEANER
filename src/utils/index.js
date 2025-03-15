export const convertDate = (dateString) => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error converting date:', error);
    return 'Error';
  }
};

export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  try {
    return url.startsWith('http://') || url.startsWith('https://');
  } catch (error) {
    return false;
  }
};