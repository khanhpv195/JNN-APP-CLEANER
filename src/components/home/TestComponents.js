// Simple test to check if components work
import { View, Text } from 'react-native';
import CalendarHeader from './CalendarHeader';
import TaskCard from './TaskCard';
import TaskList from './TaskList';

const TestComponents = () => {
    const testDate = new Date();
    const testTask = {
        _id: 'test-1',
        propertyId: { name: 'Test Property' },
        checkOutDate: testDate.toISOString(),
        checkInDate: testDate.toISOString(),
        reservationDetails: { guest: { name: 'Test Guest' } },
        reservationId: 'TEST123'
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text>Component Test</Text>
            
            <CalendarHeader
                selectedDate={testDate}
                selectedMonth={testDate}
                isExpanded={false}
                onToggleExpanded={() => {}}
                onPrevYear={() => {}}
                onNextYear={() => {}}
            />
            
            <TaskCard
                task={testTask}
                onPress={() => {}}
                onBookingInfoPress={() => {}}
            />
        </View>
    );
};

export default TestComponents;