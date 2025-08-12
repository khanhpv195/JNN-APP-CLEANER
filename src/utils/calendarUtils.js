// Calendar utilities for dot indicators and enhanced visual features

/**
 * Task indicator dot configuration
 */
export const DOT_CONFIG = {
  COLORS: {
    TASK_INDICATOR: '#007AFF',      // iOS blue for task dots
    TODAY_HIGHLIGHT: '#00BFA6',     // Brand teal for today
    MULTI_TASK: '#FF6B35',          // Orange for busy days
    SELECTED: '#00BFA6'             // Selected day color
  },
  
  SIZES: {
    SMALL_DOT: 6,                   // Single task
    LARGE_DOT: 8,                   // Multiple tasks  
    TASK_COUNT: 16                  // Task count bubble
  },
  
  THRESHOLDS: {
    MULTI_TASK_MIN: 2,              // Show larger dot if >= 2 tasks
    SHOW_COUNT_MIN: 3,              // Show number if >= 3 tasks
    MAX_DISPLAY_COUNT: 9            // Show "9+" for > 9 tasks
  }
};

/**
 * Enhanced day data structure with task indicators
 */
export const createEnhancedDayData = (date, tasks = []) => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filter tasks for this specific day
  const dayTasks = tasks.filter(task => {
    const taskDate = new Date(task.checkOutDate || task.reservationDetails?.checkOut);
    if (!taskDate || isNaN(taskDate.getTime())) return false;
    
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === normalizedDate.getTime();
  });
  
  const taskCount = dayTasks.length;
  
  return {
    date: normalizedDate.getDate(),
    fullDate: normalizedDate,
    dayName: normalizedDate.toLocaleDateString('en-US', { weekday: 'short' }),
    isToday: normalizedDate.getTime() === today.getTime(),
    isTomorrow: normalizedDate.getTime() === (today.getTime() + 24 * 60 * 60 * 1000),
    
    // Task indicator data
    hasTask: taskCount > 0,
    tasksCount: taskCount,
    
    // Visual indicator configuration
    dotConfig: getDotConfiguration(taskCount, normalizedDate.getTime() === today.getTime()),
    
    // Task data for quick access
    tasks: dayTasks
  };
};

/**
 * Determines dot visual configuration based on task count and day type
 */
export const getDotConfiguration = (taskCount, isToday = false) => {
  const config = {
    showDot: taskCount > 0,
    showCount: taskCount >= DOT_CONFIG.THRESHOLDS.SHOW_COUNT_MIN,
    dotSize: taskCount >= DOT_CONFIG.THRESHOLDS.MULTI_TASK_MIN 
      ? DOT_CONFIG.SIZES.LARGE_DOT 
      : DOT_CONFIG.SIZES.SMALL_DOT,
    
    dotColor: isToday 
      ? DOT_CONFIG.COLORS.TODAY_HIGHLIGHT
      : taskCount >= DOT_CONFIG.THRESHOLDS.MULTI_TASK_MIN
        ? DOT_CONFIG.COLORS.MULTI_TASK  
        : DOT_CONFIG.COLORS.TASK_INDICATOR,
    
    displayCount: taskCount > DOT_CONFIG.THRESHOLDS.MAX_DISPLAY_COUNT 
      ? '9+' 
      : taskCount.toString(),
      
    priority: isToday ? 'high' : taskCount >= DOT_CONFIG.THRESHOLDS.MULTI_TASK_MIN ? 'medium' : 'normal'
  };
  
  return config;
};

/**
 * Enhanced week generation with task indicators
 */
export const generateWeekWithIndicators = (centerDate, tasks = []) => {
  const baseDate = new Date(centerDate);
  baseDate.setHours(0, 0, 0, 0);
  
  const weekDays = [];
  
  // Generate 7 days centered around the given date
  for (let i = -3; i <= 3; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    
    weekDays.push(createEnhancedDayData(date, tasks));
  }
  
  return weekDays;
};

/**
 * Enhanced month generation with task indicators
 */
export const generateMonthWithIndicators = (monthDate, tasks = []) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const monthDays = [];
  
  // Empty days for alignment
  for (let j = 0; j < firstDayOfMonth; j++) {
    monthDays.push({ 
      empty: true, 
      day: '', 
      dotConfig: { showDot: false } 
    });
  }
  
  // Actual days with task indicators
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    monthDays.push(createEnhancedDayData(date, tasks));
  }
  
  return {
    year,
    month,
    monthName: monthDate.toLocaleString('en-US', { month: 'long' }),
    days: monthDays
  };
};

/**
 * Task color assignment based on patterns or data
 */
export const TASK_COLORS = {
  STANDARD: {
    border: '#8E44AD',    // Purple (like reference)
    background: 'rgba(142, 68, 173, 0.05)',
    name: 'Standard Cleaning'
  },
  DEEP: {
    border: '#00BFA6',    // Teal (brand color)  
    background: 'rgba(0, 191, 166, 0.05)',
    name: 'Deep Cleaning'
  },
  MAINTENANCE: {
    border: '#FF6B35',    // Orange
    background: 'rgba(255, 107, 53, 0.05)',
    name: 'Maintenance'
  }
};

/**
 * Assigns task color based on task data or patterns
 */
export const getTaskColor = (task) => {
  // Smart color assignment logic
  const duration = calculateTaskDuration(task);
  const description = (task.description || '').toLowerCase();
  const propertyType = (task.propertyId?.type || '').toLowerCase();
  
  // Color assignment rules
  if (description.includes('maintenance') || description.includes('repair')) {
    return TASK_COLORS.MAINTENANCE;
  }
  
  if (duration > 4 || description.includes('deep') || description.includes('thorough')) {
    return TASK_COLORS.DEEP;
  }
  
  // Default to standard
  return TASK_COLORS.STANDARD;
};

/**
 * Calculates task duration in hours
 */
export const calculateTaskDuration = (task) => {
  const startTime = task.checkInDate || task.startTime;
  const endTime = task.checkOutDate || task.endTime;
  
  if (!startTime || !endTime) return 0;
  
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  } catch (error) {
    console.warn('Error calculating task duration:', error);
    return 0;
  }
};

/**
 * Smart date header text generation (like "Today - Sat, Aug 2 2025")
 */
export const generateDateHeaderText = (date, includeContext = true) => {
  if (!date) return 'All Tasks';
  
  const targetDate = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  // Normalize dates for comparison
  [targetDate, today, tomorrow].forEach(d => d.setHours(0, 0, 0, 0));
  
  let contextText = '';
  let formattedDate = targetDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: targetDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
  
  if (includeContext) {
    if (targetDate.getTime() === today.getTime()) {
      contextText = 'Today - ';
    } else if (targetDate.getTime() === tomorrow.getTime()) {
      contextText = 'Tomorrow - ';
    }
  }
  
  return `${contextText}${formattedDate}`;
};