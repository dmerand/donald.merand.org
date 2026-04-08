/**
 * Shared configuration for build tools
 */

const fs = require('fs');
const path = require('path');

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const rawPaths = packageJson.config?.paths || {};

const paths = {};
for (const [key, relativePath] of Object.entries(rawPaths)) {
  paths[key] = path.join(__dirname, relativePath);
}

module.exports = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  paths,
  getPath: (pathKey) => {
    if (!paths[pathKey]) {
      throw new Error(`Path '${pathKey}' not found. Available: ${Object.keys(paths).join(', ')}`);
    }
    return paths[pathKey];
  },
  ensureDir: (dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
};
