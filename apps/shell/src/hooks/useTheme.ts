// Re-export from ThemeContext — theme is now shared via React Context
// so all components in the same tab see the same reactive state.
export { useTheme, ThemeProvider, type Theme } from './ThemeContext'
