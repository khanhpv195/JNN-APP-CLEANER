import { useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SELECTED_DATE_KEY = '@cleaner_app/selected_date';

export const useCalendar = (tasks = []) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    const today = useMemo(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }, []);

    const normalizeDate = useCallback((date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
    }, []);

    const loadPersistedDate = useCallback(async () => {
        try {
            const savedDateStr = await AsyncStorage.getItem(SELECTED_DATE_KEY);
            if (savedDateStr) {
                const savedDate = new Date(savedDateStr);
                const daysDiff = Math.abs(today - savedDate) / (1000 * 60 * 60 * 24);
                
                if (!isNaN(savedDate.getTime()) && daysDiff <= 30) {
                    const normalizedDate = normalizeDate(savedDate);
                    setSelectedDate(normalizedDate);
                    setSelectedMonth(normalizedDate);
                    return;
                }
            }
            setSelectedDate(today);
            setSelectedMonth(today);
        } catch (error) {
            setSelectedDate(today);
            setSelectedMonth(today);
        }
    }, [today, normalizeDate]);

    const persistDate = useCallback(async (date) => {
        try {
            await AsyncStorage.setItem(SELECTED_DATE_KEY, date.toISOString());
        } catch (error) {
            console.warn('Failed to persist date:', error);
        }
    }, []);

    const generateWeekDays = useCallback((centerDate = selectedDate) => {
        const baseDate = normalizeDate(centerDate);
        const days = [];
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = -3; i <= 3; i++) {
            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() + i);
            
            const isToday = date.getTime() === today.getTime();
            const tasksForDay = tasks.filter(task => {
                const taskDate = normalizeDate(task.checkOutDate || task.reservationDetails?.checkOut);
                return taskDate.getTime() === date.getTime();
            });

            days.push({
                date: date.getDate(),
                fullDate: date,
                day: daysOfWeek[date.getDay()],
                hasTask: tasksForDay.length > 0,
                isToday,
                tasksCount: tasksForDay.length
            });
        }

        return days;
    }, [selectedDate, tasks, today, normalizeDate]);

    const generateMonthDays = useCallback((monthDate = selectedMonth) => {
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        const days = [];

        // Empty days for alignment
        for (let j = 0; j < firstDayOfMonth; j++) {
            days.push({ empty: true, day: '' });
        }

        // Actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            
            const tasksForDay = tasks.filter(task => {
                const taskDate = normalizeDate(task.checkOutDate || task.reservationDetails?.checkOut);
                return taskDate.getTime() === date.getTime();
            });

            days.push({
                day,
                fullDate: date,
                isToday,
                hasTask: tasksForDay.length > 0,
                tasksCount: tasksForDay.length
            });
        }

        return {
            year,
            month,
            monthName: monthDate.toLocaleString('en-US', { month: 'long' }),
            days
        };
    }, [selectedMonth, tasks, today, normalizeDate]);

    const selectDate = useCallback((date) => {
        const newDate = normalizeDate(date);
        setSelectedDate(newDate);
        persistDate(newDate);

        if (newDate.getMonth() !== selectedMonth.getMonth() ||
            newDate.getFullYear() !== selectedMonth.getFullYear()) {
            setSelectedMonth(newDate);
        }
    }, [selectedMonth, normalizeDate, persistDate]);

    const selectMonth = useCallback((monthIndex) => {
        if (typeof monthIndex !== 'number' || monthIndex < 0 || monthIndex > 11) {
            return;
        }

        const newMonth = new Date(selectedMonth.getFullYear(), monthIndex, 1);
        setSelectedMonth(newMonth);

        // Always update selectedDate to first day of new month for consistent behavior
        const newSelectedDate = new Date(newMonth);
        setSelectedDate(newSelectedDate);
        persistDate(newSelectedDate);
    }, [selectedMonth, persistDate]);

    const navigateYear = useCallback((direction) => {
        const currentYear = selectedMonth.getFullYear();
        const newYear = currentYear + direction;
        
        // Limit year range to 2025-2026 only
        if (newYear < 2025 || newYear > 2026) {
            return;
        }
        
        const newDate = new Date(selectedMonth);
        newDate.setFullYear(newYear);
        setSelectedMonth(newDate);
        
        // Update selected date to maintain consistency
        const newSelectedDate = new Date(newDate);
        setSelectedDate(newSelectedDate);
        persistDate(newSelectedDate);
    }, [selectedMonth, persistDate]);

    const goToToday = useCallback(() => {
        setSelectedDate(today);
        setSelectedMonth(today);
        persistDate(today);
    }, [today, persistDate]);

    const findNextDateWithTasks = useCallback((fromDate = selectedDate) => {
        const currentDate = normalizeDate(fromDate);
        
        const futureTasks = tasks.filter(task => {
            const taskDate = normalizeDate(task.checkOutDate || task.reservationDetails?.checkOut);
            return taskDate > currentDate;
        });

        if (futureTasks.length > 0) {
            const sortedTasks = futureTasks.sort((a, b) => {
                const dateA = normalizeDate(a.checkOutDate || a.reservationDetails?.checkOut);
                const dateB = normalizeDate(b.checkOutDate || b.reservationDetails?.checkOut);
                return dateA - dateB;
            });
            return normalizeDate(sortedTasks[0].checkOutDate || sortedTasks[0].reservationDetails?.checkOut);
        }

        return null;
    }, [tasks, selectedDate, normalizeDate]);

    return {
        selectedDate,
        selectedMonth,
        today,
        loadPersistedDate,
        generateWeekDays,
        generateMonthDays,
        selectDate,
        selectMonth,
        navigateYear,
        goToToday,
        findNextDateWithTasks,
        normalizeDate
    };
};