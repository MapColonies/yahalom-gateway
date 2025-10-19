import tsBaseConfig from '@map-colonies/eslint-config/ts-base';
import jestConfig from '@map-colonies/eslint-config/jest';
import { config } from '@map-colonies/eslint-config/helpers';

/** @type {import('eslint').Linter.FlatConfig[]} */
const baseConfigs = config(jestConfig, tsBaseConfig);

const customImportResolver = {
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
      node: {
        extensions: ['.js', '.ts', '.json'],
        project: './tsconfig.json',
      },
    },
  },
};

export default [...baseConfigs, customImportResolver];
