import type { CSSObject, Breakpoint, TypographyVariantsOptions } from '@mui/material/styles';

import { pxToRem, setFont } from 'minimal-shared/utils';

import { createTheme as getTheme } from '@mui/material/styles';

import { themeConfig } from '../theme-config';

// ----------------------------------------------------------------------

/**
 * TypeScript (type definition and extension)
 * @to {@link file://./../extend-theme-types.d.ts}
 */
export type FontStyleExtend = {
  fontWeightSemiBold: CSSObject['fontWeight'];
  fontSecondaryFamily: CSSObject['fontFamily'];
};

export type ResponsiveFontSizesInput = Partial<Record<Breakpoint, number>>;
export type ResponsiveFontSizesResult = Record<string, { fontSize: string }>;

const defaultMuiTheme = getTheme();

function responsiveFontSizes(obj: ResponsiveFontSizesInput): ResponsiveFontSizesResult {
  const breakpoints: Breakpoint[] = defaultMuiTheme.breakpoints.keys;

  return breakpoints.reduce((acc, breakpoint) => {
    const value = obj[breakpoint];

    if (value !== undefined && value >= 0) {
      acc[defaultMuiTheme.breakpoints.up(breakpoint)] = {
        fontSize: pxToRem(value),
      };
    }

    return acc;
  }, {} as ResponsiveFontSizesResult);
}

// ----------------------------------------------------------------------

const primaryFont = setFont(themeConfig.fontFamily.primary);
const secondaryFont = setFont(themeConfig.fontFamily.secondary);

export const typography: TypographyVariantsOptions = {
  fontFamily: primaryFont,
  fontSecondaryFamily: secondaryFont,
  fontWeightLight: '300',
  fontWeightRegular: '400',
  fontWeightMedium: '500',
  fontWeightSemiBold: '600',
  fontWeightBold: '700',
  h1: {
    fontFamily: secondaryFont,
    fontWeight: 800,
    lineHeight: 1.2,
    fontSize: pxToRem(44),
    letterSpacing: '-0.02em',
    ...responsiveFontSizes({ sm: 56, md: 60, lg: 64 }),
  },
  h2: {
    fontFamily: secondaryFont,
    fontWeight: 800,
    lineHeight: 1.2,
    fontSize: pxToRem(36),
    letterSpacing: '-0.01em',
    ...responsiveFontSizes({ sm: 42, md: 46, lg: 48 }),
  },
  h3: {
    fontFamily: secondaryFont,
    fontWeight: 700,
    lineHeight: 1.3,
    fontSize: pxToRem(28),
    ...responsiveFontSizes({ sm: 30, md: 32, lg: 34 }),
  },
  h4: {
    fontWeight: 700,
    lineHeight: 1.4,
    fontSize: pxToRem(24),
    ...responsiveFontSizes({ md: 26, lg: 28 }),
  },
  h5: {
    fontWeight: 600,
    lineHeight: 1.4,
    fontSize: pxToRem(20),
    ...responsiveFontSizes({ sm: 21, lg: 22 }),
  },
  h6: {
    fontWeight: 600,
    lineHeight: 1.5,
    fontSize: pxToRem(18),
    ...responsiveFontSizes({ sm: 19 }),
  },
  subtitle1: {
    fontWeight: 600,
    lineHeight: 1.5,
    fontSize: pxToRem(16),
    letterSpacing: '0.01em',
  },
  subtitle2: {
    fontWeight: 600,
    lineHeight: 1.5,
    fontSize: pxToRem(14),
    letterSpacing: '0.01em',
  },
  body1: {
    lineHeight: 1.6,
    fontSize: pxToRem(16),
    letterSpacing: '0.01em',
  },
  body2: {
    lineHeight: 1.5,
    fontSize: pxToRem(14),
    letterSpacing: '0.01em',
  },
  caption: {
    lineHeight: 1.4,
    fontSize: pxToRem(12),
    letterSpacing: '0.02em',
  },
  overline: {
    fontWeight: 700,
    lineHeight: 1.4,
    fontSize: pxToRem(12),
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  button: {
    fontWeight: 600,
    lineHeight: 1.5,
    fontSize: pxToRem(14),
    textTransform: 'unset',
    letterSpacing: '0.02em',
  },
};