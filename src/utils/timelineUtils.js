// Timeline utilities - Pure functions for better maintainability and testing

export const VIEW_MODES = {
  ALL_UPCOMING: 'all_upcoming',
  DATE_FILTER: 'date_filter', 
  TODAY_ONLY: 'today_only'
};

// Date utilities
export const DateUtils = {
  normalizeDate: (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  },

  isSameDay: (date1, date2) => {
    const d1 = DateUtils.normalizeDate(date1);
    const d2 = DateUtils.normalizeDate(date2);
    return d1.getTime() === d2.getTime();
  },

  isToday: (date) => {
    const today = DateUtils.normalizeDate(new Date());
    return DateUtils.isSameDay(date, today);
  },

  isTomorrow: (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return DateUtils.isSameDay(date, tomorrow);
  },

  isUpcoming: (date) => {
    const today = DateUtils.normalizeDate(new Date());
    const targetDate = DateUtils.normalizeDate(date);
    return targetDate >= today;
  }
};

// Pure function to group tasks by date
export const groupTasksByDate = (tasks = []) => {
  const groupedTasks = {};
  
  tasks.forEach(task => {
    const taskDate = task.checkOutDate || task.reservationDetails?.checkOut;
    if (!taskDate) return;
    
    const normalizedDate = DateUtils.normalizeDate(taskDate);
    const dateKey = normalizedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    if (!groupedTasks[dateKey]) {
      groupedTasks[dateKey] = {
        date: taskDate,
        dateObj: normalizedDate,
        tasks: [],
        isToday: DateUtils.isToday(normalizedDate),
        isTomorrow: DateUtils.isTomorrow(normalizedDate)
      };
    }
    
    groupedTasks[dateKey].tasks.push(task);
  });

  return Object.values(groupedTasks);
};

// Pure function to filter groups based on view mode
export const applyViewModeFilter = (groups, viewMode, filterDate = null) => {
  switch (viewMode) {
    case VIEW_MODES.ALL_UPCOMING:
      return groups.filter(group => DateUtils.isUpcoming(group.dateObj));
    
    case VIEW_MODES.DATE_FILTER:
      if (!filterDate) return [];
      return groups.filter(group => DateUtils.isSameDay(group.dateObj, filterDate));
    
    case VIEW_MODES.TODAY_ONLY:
      return groups.filter(group => DateUtils.isToday(group.dateObj));
    
    default:
      return groups;
  }
};

// Pure function to sort timeline groups
export const sortTimelineGroups = (groups) => {
  return groups.sort((a, b) => {
    // Today first
    if (a.isToday && !b.isToday) return -1;
    if (b.isToday && !a.isToday) return 1;
    
    // Tomorrow second  
    if (a.isTomorrow && !b.isTomorrow) return -1;
    if (b.isTomorrow && !a.isTomorrow) return 1;
    
    // Then chronological order
    return a.dateObj - b.dateObj;
  });
};

// Main timeline data processor
export const createTimelineData = (tasks, viewMode, selectedDate = null) => {
  // Step 1: Group tasks by date
  const groupedTasks = groupTasksByDate(tasks);
  
  // Step 2: Apply view mode filter
  const filteredGroups = applyViewModeFilter(groupedTasks, viewMode, selectedDate);
  
  // Step 3: Sort groups
  const sortedGroups = sortTimelineGroups(filteredGroups);
  
  return sortedGroups;
};

// Helper to determine current view mode based on selected date
export const determineViewMode = (selectedDate) => {
  if (!selectedDate) {
    return VIEW_MODES.ALL_UPCOMING;
  }
  
  if (DateUtils.isToday(selectedDate)) {
    return VIEW_MODES.TODAY_ONLY;
  }
  
  return VIEW_MODES.DATE_FILTER;
};

// Helper to get view mode display text
export const getViewModeText = (viewMode, selectedDate = null) => {
  switch (viewMode) {
    case VIEW_MODES.ALL_UPCOMING:
      return 'All Upcoming Tasks';
    
    case VIEW_MODES.TODAY_ONLY:
      return 'Today\'s Tasks';
    
    case VIEW_MODES.DATE_FILTER:
      if (selectedDate) {
        const dateStr = selectedDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        return `Tasks for ${dateStr}`;
      }
      return 'Filtered Tasks';
    
    default:
      return 'Tasks';
  }
};

// Helper to get empty state message
export const getEmptyStateMessage = (viewMode, selectedDate = null) => {
  switch (viewMode) {
    case VIEW_MODES.ALL_UPCOMING:
      return 'No upcoming tasks scheduled';
    
    case VIEW_MODES.TODAY_ONLY:
      return 'No tasks scheduled for today';
    
    case VIEW_MODES.DATE_FILTER:
      if (selectedDate) {
        const dateStr = selectedDate.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric' 
        });
        return `No tasks scheduled for ${dateStr}`;
      }
      return 'No tasks found for selected date';
    
    default:
      return 'No tasks available';
  }
};