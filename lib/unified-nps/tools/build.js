#!/usr/bin/env node

/**
 * Build tool for the guitar scale visualizer
 * Combines core modules and widget into a single minified script for blog deployment
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

// Ensure dist directory exists
config.ensureDir(config.paths.dist);

// Read and combine source files
function combineSourceFiles() {
  console.log('📦 Combining source files...');

  const coreFiles = [
    'core/musical-theory.js',
    'core/scale-patterns.js', 
    'core/fretboard-algorithm.js',
    'core/scale-visualizer.js',
    'core/preset-manager.js',
    'core/ui-controller.js'
  ];

  const widgetFile = 'widget.js';

  let combinedSource = '';

  // Add core modules
  coreFiles.forEach(file => {
    const filePath = path.join(config.paths.src, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Remove CommonJS exports for browser compatibility
    const browserContent = content
      .replace(/\/\/ Export for both CommonJS.*[\s\S]*?window\.\w+ = \w+;\s*}/g, '')
      .replace(/if \(typeof module.*[\s\S]*?}/g, '');
    
    combinedSource += `// === ${file} ===\n`;
    combinedSource += browserContent;
    combinedSource += '\n\n';
  });

  // Add widget
  const widgetPath = path.join(config.paths.src, widgetFile);
  const widgetContent = fs.readFileSync(widgetPath, 'utf8');
  
  combinedSource += `// === ${widgetFile} ===\n`;
  combinedSource += widgetContent;

  return combinedSource;
}

// Basic minification (remove comments and extra whitespace)
function minify(source) {
  console.log('🗜️  Minifying code...');
  
  return source
    // Remove single line comments
    .replace(/\/\/.*$/gm, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove whitespace around operators and punctuation
    .replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1')
    // Remove leading/trailing whitespace
    .trim();
}

// Add build metadata
function addBuildMetadata(source) {
  const timestamp = new Date().toISOString();
  const version = config.version;
  
  const header = `/*
 * Guitar Scale Visualizer
 * Version: ${version}
 * Built: ${timestamp}
 * Generated automatically - do not edit directly
 */\n`;
  
  return header + source;
}

// Main build function
function build(options = {}) {
  console.log('🎸 Building Guitar Scale Visualizer...');
  
  try {
    // Combine source files
    let combinedSource = combineSourceFiles();
    
    // Minify if requested
    if (options.minify !== false) {
      combinedSource = minify(combinedSource);
    }
    
    // Add metadata
    const finalSource = addBuildMetadata(combinedSource);
    
    // Write to dist
    const outputPath = path.join(config.paths.dist, 'guitar-scale-visualizer.js');
    fs.writeFileSync(outputPath, finalSource);
    
    console.log(`✅ Build complete: ${outputPath}`);
    console.log(`📊 Size: ${(finalSource.length / 1024).toFixed(1)}KB`);
    
    return {
      success: true,
      outputPath,
      source: finalSource,
      size: finalSource.length
    };
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    minify: !args.includes('--no-minify')
  };
  
  const result = build(options);
  process.exit(result.success ? 0 : 1);
}

module.exports = { build };
