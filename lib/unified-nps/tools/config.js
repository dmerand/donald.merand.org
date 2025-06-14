/**
 * Shared configuration for build tools
 * Centralizes all file paths and project settings
 */

const fs = require('fs');
const path = require('path');

// Read package.json to get configuration
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Get the paths configuration from package.json
const rawPaths = packageJson.config?.paths || {};

// Resolve all paths relative to the tools directory
const paths = {};
for (const [key, relativePath] of Object.entries(rawPaths)) {
  paths[key] = path.join(__dirname, relativePath);
}

// Export configuration object
module.exports = {
  // Project metadata
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  
  // Resolved file paths
  paths,
  
  // Utility function to get a path safely
  getPath: (pathKey) => {
    if (!paths[pathKey]) {
      throw new Error(`Path '${pathKey}' not found in configuration. Available paths: ${Object.keys(paths).join(', ')}`);
    }
    return paths[pathKey];
  },
  
  // Utility function to ensure a directory exists
  ensureDir: (dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
};