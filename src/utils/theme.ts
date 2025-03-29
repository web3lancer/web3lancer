import { createTheme } from "@mui/material/styles";
import { componentStyles } from "./themeComponents";
import { themePalette } from "./themePalette";
import { themeTypography } from "./themeTypography";

export const theme = createTheme({
  palette: themePalette,
  components: componentStyles,
  typography: themeTypography,
  shape: {
    borderRadius: 14,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.05)',
    '0 4px 8px rgba(0,0,0,0.08)',
    '0 8px 16px rgba(0,0,0,0.08)',
    '0 12px 24px rgba(0,0,0,0.1)',
    '0 16px 32px rgba(0,0,0,0.1)',
    '0 20px 40px rgba(0,0,0,0.12)',
    '0 24px 48px rgba(0,0,0,0.12)',
    '0 32px 64px rgba(0,0,0,0.12)',
    '0 40px 80px rgba(0,0,0,0.15)',
    '0 48px 96px rgba(0,0,0,0.15)',
    '0 56px 112px rgba(0,0,0,0.15)',
    '0 64px 128px rgba(0,0,0,0.15)',
    '0 72px 144px rgba(0,0,0,0.15)',
    '0 80px 160px rgba(0,0,0,0.15)',
    '0 88px 176px rgba(0,0,0,0.15)',
    '0 96px 192px rgba(0,0,0,0.15)',
    '0 104px 208px rgba(0,0,0,0.15)',
    '0 112px 224px rgba(0,0,0,0.15)',
    '0 120px 240px rgba(0,0,0,0.15)',
    '0 128px 256px rgba(0,0,0,0.15)',
    '0 136px 272px rgba(0,0,0,0.15)',
    '0 144px 288px rgba(0,0,0,0.15)',
    '0 152px 304px rgba(0,0,0,0.15)',
    '0 160px 320px rgba(0,0,0,0.15)',
  ],
});