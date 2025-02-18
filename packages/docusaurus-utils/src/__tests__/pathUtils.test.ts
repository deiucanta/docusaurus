/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  isNameTooLong,
  shortName,
  escapePath,
  posixPath,
  aliasedSitePath,
  toMessageRelativeFilePath,
  addTrailingPathSeparator,
} from '../pathUtils';
import path from 'path';

describe('isNameTooLong', () => {
  test('behaves correctly', () => {
    const asserts = {
      '': false,
      'foo-bar-096': false,
      'foo-bar-1df': false,
      'endi-lie-9fa': false,
      'endi-lie-fd3': false,
      'yangshun-tay-48d': false,
      'yangshun-tay-f3b': false,
      'foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-d46':
        true,
      'foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-test-1-test-2-787':
        true,
      // Every Hanzi is three bytes
      字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字:
        {apfs: false, xfs: true},
    };
    const oldProcessPlatform = process.platform;
    Object.defineProperty(process, 'platform', {value: 'darwin'});
    Object.keys(asserts).forEach((file) => {
      expect(isNameTooLong(file)).toBe(
        typeof asserts[file] === 'boolean' ? asserts[file] : asserts[file].apfs,
      );
    });
    Object.defineProperty(process, 'platform', {value: 'win32'});
    Object.keys(asserts).forEach((file) => {
      expect(isNameTooLong(file)).toBe(
        typeof asserts[file] === 'boolean' ? asserts[file] : asserts[file].apfs,
      );
    });
    Object.defineProperty(process, 'platform', {value: 'android'});
    Object.keys(asserts).forEach((file) => {
      expect(isNameTooLong(file)).toBe(
        typeof asserts[file] === 'boolean' ? asserts[file] : asserts[file].xfs,
      );
    });
    Object.defineProperty(process, 'platform', {value: oldProcessPlatform});
  });
});

describe('shortName', () => {
  test('works', () => {
    const asserts = {
      '': '',
      'foo-bar': 'foo-bar',
      'endi-lie': 'endi-lie',
      'yangshun-tay': 'yangshun-tay',
      'foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar':
        'foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-',
      'foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-test-1-test-2':
        'foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-foo-bar-test-1-test-',
      字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字:
        {
          apfs: '字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字',
          // This is pretty bad (a character clipped in half), but I doubt if it
          // ever happens
          xfs: '字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字�',
        },
    };
    const oldProcessPlatform = process.platform;
    Object.defineProperty(process, 'platform', {value: 'darwin'});
    Object.keys(asserts).forEach((file) => {
      expect(shortName(file)).toBe(
        typeof asserts[file] === 'string' ? asserts[file] : asserts[file].apfs,
      );
    });
    Object.defineProperty(process, 'platform', {value: 'win32'});
    Object.keys(asserts).forEach((file) => {
      expect(shortName(file)).toBe(
        typeof asserts[file] === 'string' ? asserts[file] : asserts[file].apfs,
      );
    });
    Object.defineProperty(process, 'platform', {value: 'android'});
    Object.keys(asserts).forEach((file) => {
      expect(shortName(file)).toBe(
        typeof asserts[file] === 'string' ? asserts[file] : asserts[file].xfs,
      );
    });
    Object.defineProperty(process, 'platform', {value: oldProcessPlatform});
  });

  // Based on https://github.com/gatsbyjs/gatsby/pull/21518/files

  const SHORT_PATH = `/short/path/without/trailing/slash`;
  const VERY_LONG_PATH = `/${`x`.repeat(256)}/`;
  const VERY_LONG_PATH_NON_LATIN = `/${`あ`.repeat(255)}/`;

  test('Truncates long paths correctly', () => {
    const truncatedPathLatin = shortName(VERY_LONG_PATH);
    const truncatedPathNonLatin = shortName(VERY_LONG_PATH_NON_LATIN);
    expect(truncatedPathLatin.length).toBeLessThanOrEqual(255);
    expect(truncatedPathNonLatin.length).toBeLessThanOrEqual(255);
  });

  test('Does not truncate short paths', () => {
    const truncatedPath = shortName(SHORT_PATH);
    expect(truncatedPath).toEqual(SHORT_PATH);
  });
});

test('toMessageRelativeFilePath', () => {
  jest
    .spyOn(process, 'cwd')
    .mockImplementationOnce(() => path.join(__dirname, '..'));
  expect(toMessageRelativeFilePath(path.join(__dirname, 'foo/bar.js'))).toEqual(
    '__tests__/foo/bar.js',
  );
});

test('escapePath', () => {
  const asserts: Record<string, string> = {
    'c:/aaaa\\bbbb': 'c:/aaaa\\\\bbbb',
    'c:\\aaaa\\bbbb\\★': 'c:\\\\aaaa\\\\bbbb\\\\★',
    '\\\\?\\c:\\aaaa\\bbbb': '\\\\\\\\?\\\\c:\\\\aaaa\\\\bbbb',
    'c:\\aaaa\\bbbb': 'c:\\\\aaaa\\\\bbbb',
    'foo\\bar': 'foo\\\\bar',
    'foo\\bar/lol': 'foo\\\\bar/lol',
    'website\\docs/**/*.{md,mdx}': 'website\\\\docs/**/*.{md,mdx}',
  };
  Object.keys(asserts).forEach((file) => {
    expect(escapePath(file)).toBe(asserts[file]);
  });
});

test('posixPath', () => {
  const asserts: Record<string, string> = {
    'c:/aaaa\\bbbb': 'c:/aaaa/bbbb',
    'c:\\aaaa\\bbbb\\★': 'c:\\aaaa\\bbbb\\★',
    '\\\\?\\c:\\aaaa\\bbbb': '\\\\?\\c:\\aaaa\\bbbb',
    'c:\\aaaa\\bbbb': 'c:/aaaa/bbbb',
    'foo\\bar': 'foo/bar',
    'foo\\bar/lol': 'foo/bar/lol',
    'website\\docs/**/*.{md,mdx}': 'website/docs/**/*.{md,mdx}',
  };
  Object.keys(asserts).forEach((file) => {
    expect(posixPath(file)).toBe(asserts[file]);
  });
});

test('aliasedSitePath', () => {
  const asserts: Record<string, string> = {
    'user/website/docs/asd.md': '@site/docs/asd.md',
    'user/website/versioned_docs/foo/bar.md': '@site/versioned_docs/foo/bar.md',
    'user/docs/test.md': '@site/../docs/test.md',
  };
  Object.keys(asserts).forEach((file) => {
    expect(posixPath(aliasedSitePath(file, 'user/website'))).toBe(
      asserts[file],
    );
  });
});

test('addTrailingPathSeparator', () => {
  expect(addTrailingPathSeparator('foo')).toEqual(
    process.platform === 'win32' ? 'foo\\' : 'foo/',
  );
  expect(addTrailingPathSeparator('foo/')).toEqual(
    process.platform === 'win32' ? 'foo\\' : 'foo/',
  );
});
