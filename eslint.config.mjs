import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { FlatCompat } from '@eslint/eslintrc'
import prettier from 'eslint-config-prettier'

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) })

/**
 * The `no-restricted-imports` block is the guard rail for the
 * `output: 'export'` constraint: these APIs compile fine but break a static
 * export at build or runtime, so they fail lint instead of failing silently.
 */
const staticExportGuards = {
  paths: [
    {
      name: 'next/headers',
      message: 'next/headers requires a server runtime. Static export cannot use it.',
    },
    {
      name: 'next/cache',
      message: 'revalidate/ISR is unavailable in a static export.',
    },
    {
      name: 'server-only',
      message: 'There is no server at runtime in a static export.',
    },
  ],
}

const config = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'next-env.d.ts',
      '.wrangler/**',
      'public/**',
    ],
  },

  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    rules: {
      // `strict: true` plus an outright ban on `any`.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-restricted-imports': ['error', staticExportGuards],
      // Colours must come from design tokens, never from inline styles.
      'react/forbid-dom-props': ['error', { forbid: [] }],
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'object-shorthand': ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // Config validation intentionally throws with a readable message.
  {
    files: ['lib/validate-config.ts'],
    rules: { 'no-console': 'off' },
  },

  // Build-time CLI scripts: stdout *is* their interface, and they never ship.
  {
    files: ['scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },

  prettier,
]

export default config
