import { useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateWeekWithIndicators, generateMonthWithIndicators } from '../utils/calendarUtils';

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
        return generateWeekWithIndicators(baseDate, tasks);
    }, [selectedDate, tasks, normalizeDate]);

    const generateMonthDays = useCallback((monthDate = selectedMonth) => {
        return generateMonthWithIndicators(monthDate, tasks);
    }, [selectedMonth, tasks]);

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