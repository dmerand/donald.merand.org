#!/usr/bin/env node

/**
 * Development server for the guitar scale visualizer
 * Serves the template.html with live reload capability
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const config = require('./config');

const PORT = process.env.PORT || 3000;

// Simple file server
function serveFile(res, filePath, contentType) {
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
  }
}

// Get content type based on file extension
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  };
  return contentTypes[ext] || 'text/plain';
}

const server = http.createServer((req, res) => {
  // Add CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  let requestPath = req.url;
  
  // Default to template.html
  if (requestPath === '/' || requestPath === '/index.html') {
    requestPath = '/template.html';
  }

  const filePath = path.join(config.paths.src, requestPath);
  const contentType = getContentType(filePath);

  // Security check - ensure we're serving from src directory
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(config.paths.src)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access denied');
    return;
  }

  console.log(`Serving: ${requestPath}`);
  serveFile(res, filePath, contentType);
});

server.listen(PORT, () => {
  console.log(`🎸 Guitar Scale Visualizer Development Server`);
  console.log(`📍 Running at: http://localhost:${PORT}`);
  console.log(`📁 Serving from: ${config.paths.src}`);
  console.log(`✨ Ready for development!`);
  console.log(`\n🔄 To test changes:`);
  console.log(`   1. Edit files in src/`);
  console.log(`   2. Refresh browser to see changes`);
  console.log(`   3. Run tests: npm test`);
  console.log(`\n📦 To deploy to blog:`);
  console.log(`   npm run build && npm run deploy`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down development server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});