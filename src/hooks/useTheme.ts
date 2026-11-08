/// <reference types="@mui/x-date-pickers/themeAugmentation" />
import { createTheme, darken, lighten } from "@mui/material";
import { csCZ, enUS } from "@mui/material/locale";
import { csCZ as datePickersCsCz, enUS as datePickersEnUs } from "@mui/x-date-pickers/locales";
import { WISTRON_PRIMARY_COLOR, WISTRON_SECONDARY_COLOR } from "wcz-layout";

const MUI_LOCALE_MAP = {
  en: [datePickersEnUs, enUS],
  cs: [datePickersCsCz, csCZ],
};

type SupportedLocale = keyof typeof MUI_LOCALE_MAP;

export function useTheme(locale: string) {
  const localeKey: SupportedLocale = isSupportedLocale(locale) ? locale : "en";

  return createTheme(
    {
      cssVariables: {
        colorSchemeSelector: "data-mui-color-scheme",
      },
      colorSchemes: {
        light: {
          palette: {
            primary: { main: WISTRON_PRIMARY_COLOR },
            secondary: { main: WISTRON_SECONDARY_COLOR },
          },
        },
        dark: {
          palette: {
            primary: { main: lighten(WISTRON_PRIMARY_COLOR, 0.5) },
            secondary: { main: darken(WISTRON_SECONDARY_COLOR, 0.5) },
          },
        },
      },
      components: {
        MuiTextField: {
          defaultProps: {
            size: "small",
          },
          styleOverrides: {
            root: { maxWidth: "100%" },
          },
        },
        MuiAutocomplete: {
          defaultProps: {
            autoHighlight: true,
          },
          styleOverrides: {
            root: { maxWidth: "100%" },
          },
        },
        MuiDatePicker: {
          defaultProps: {
            slotProps: {
              textField: { size: "small" },
            },
          },
        },
        MuiTimePicker: {
          defaultProps: {
            slotProps: {
              textField: { size: "small" },
            },
          },
        },
        MuiDateTimePicker: {
          defaultProps: {
            slotProps: {
              textField: { size: "small" },
            },
          },
        },
      },
    },
    ...MUI_LOCALE_MAP[localeKey],
  );
}

const isSupportedLocale = (locale: string): locale is SupportedLocale => locale in MUI_LOCALE_MAP;
