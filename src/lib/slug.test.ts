import { describe, expect, it } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('lowercases and dashes', () => {
    expect(slugify('Pštrosie Vajcia')).toBe('pstrosie-vajcia');
  });

  it('strips Slovak diacritics', () => {
    expect(slugify('Križovany nad Dudváhom')).toBe('krizovany-nad-dudvahom');
  });

  it('collapses runs and trims edges', () => {
    expect(slugify('  Pšt!ros — 2026  ')).toBe('pst-ros-2026');
  });
});
