import { View } from "react-native";
import { LineChart } from 'react-native-chart-kit';

const Chart = () => {
  const performanceData = {
    labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    datasets: [{
      data: [50, 45, 35, 40, 45, 35],
    }],
  };

  return (
    <View style={{/* was: className="p-4" */}}>
      <LineChart
        data={performanceData}
        width={350}
        height={200}
        withDots={false}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(72, 187, 120, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          formatYLabel: (y) => `$${y}`
        }}
        yAxisLabel = "$"
        yAxisSuffix= "k"
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
}

export default Chart