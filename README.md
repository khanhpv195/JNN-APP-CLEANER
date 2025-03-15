# CRM Mobile App

## Project Structure

```
/src
  /components          # Reusable UI components
    /ui                # Simple UI elements
    ThemedText.js      # Theme-aware text component
    ThemedButton.js    # Theme-aware button component
    ThemedStatusBar.js # Theme-aware status bar
  /features            # Feature-specific components
    /property          # Property management features
    /dashboard         # Dashboard features
    /message           # Messaging features
    /chat              # Chat features
  /hooks               # Custom React hooks
    useProperty.js     # Property data hook
    useGetMessage.js   # Messages data hook
    useThemedStyles.js # Theme styling hook
  /navigation          # Navigation configuration
  /redux               # State management
  /screens             # Screen components
  /services            # API services
  /shared              # Shared utilities and helpers
    /api               # API clients
    /constants         # Constants like colors
    /theme             # Theming system
      index.js         # Theme context and exports
      ThemeManager.js  # Theme state management
      ThemedComponent.js # Theme utility components
```

## Theme System

The app uses a custom theming system that allows full customization of colors and styles. All UI components automatically adapt to theme changes.

### Using themed components:

```jsx
import { ThemedText, ThemedButton } from '@/components';
import { useTheme } from '@/shared/theme';

const MyComponent = () => {
  const { theme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.background }}>
      <ThemedText>This text uses theme colors</ThemedText>
      <ThemedButton title="Themed Button" />
    </View>
  );
};
```

### Creating themed styles:

```jsx
import { useThemedStyles } from '@/hooks';

const MyComponent = () => {
  const styles = useThemedStyles((theme) => ({
    container: {
      backgroundColor: theme.background,
    },
    title: {
      color: theme.text,
      fontSize: 20,
    }
  }));
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Using theme styles</Text>
    </View>
  );
};
```

## Adding New Features

1. Create components in the appropriate feature folder
2. Use the `useTheme` hook for theme-aware styling
3. Leverage existing themed components
4. For screens that need theme customization, use dynamic styles with `useThemedStyles`

## Settings Screen

Admins can customize:
- Theme colors (primary, secondary, accent, background, etc.)
- Service pricing (cleaner, maintenance hourly rates)

Changes are saved to AsyncStorage and persist between app sessions.