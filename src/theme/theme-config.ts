import type { CommonColors } from '@mui/material/styles';

import type { ThemeCssVariables } from './types';
import type { PaletteColorNoChannels } from './core/palette';

// ----------------------------------------------------------------------

type ThemeConfig = {
  classesPrefix: string;
  cssVariables: ThemeCssVariables;
  fontFamily: Record<'primary' | 'secondary', string>;
  palette: Record<
    'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error',
    PaletteColorNoChannels
  > & {
    common: Pick<CommonColors, 'black' | 'white'>;
    grey: Record<
      '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
      string
    >;
  };
};

export const themeConfig: ThemeConfig = {
  /** **************************************
   * Base
   *************************************** */
  classesPrefix: 'minimal',
  /** **************************************
   * Typography
   *************************************** */
  fontFamily: {
    primary: 'DM Sans Variable',
    secondary: 'Barlow',
  },
  /** **************************************
   * Palette - MODERNIZADA
   *************************************** */
  palette: {
    primary: {
      lighter: '#E3F2FD',
      light: '#64B5F6',
      main: '#2196F3', // Azul moderno vibrante
      dark: '#1565C0',
      darker: '#0D47A1',
      contrastText: '#FFFFFF',
    },
    secondary: {
      lighter: '#F3E5F5',
      light: '#CE93D8',
      main: '#9C27B0', // Púrpura moderno
      dark: '#7B1FA2',
      darker: '#4A148C',
      contrastText: '#FFFFFF',
    },
    info: {
      lighter: '#E1F5FE',
      light: '#4FC3F7',
      main: '#03A9F4',
      dark: '#0277BD',
      darker: '#01579B',
      contrastText: '#FFFFFF',
    },
    success: {
      lighter: '#E8F5E8',
      light: '#81C784',
      main: '#4CAF50', // Verde moderno
      dark: '#388E3C',
      darker: '#1B5E20',
      contrastText: '#FFFFFF',
    },
    warning: {
      lighter: '#FFF8E1',
      light: '#FFD54F',
      main: '#FFC107',
      dark: '#FF8F00',
      darker: '#FF6F00',
      contrastText: '#1C252E',
    },
    error: {
      lighter: '#FFEBEE',
      light: '#E57373',
      main: '#F44336',
      dark: '#D32F2F',
      darker: '#B71C1C',
      contrastText: '#FFFFFF',
    },
    grey: {
      '50': '#FAFAFA',
      '100': '#F5F5F5',
      '200': '#EEEEEE',
      '300': '#E0E0E0',
      '400': '#BDBDBD',
      '500': '#9E9E9E',
      '600': '#757575',
      '700': '#616161',
      '800': '#424242',
      '900': '#212121',
    },
    common: { black: '#000000', white: '#FFFFFF' },
  },
  /** **************************************
   * Css variables
   *************************************** */
  cssVariables: {
    cssVarPrefix: '',
    colorSchemeSelector: 'data-color-scheme',
  },
};