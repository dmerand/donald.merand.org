#!/usr/bin/env node

/**
 * Build tool for the banjo chord transposer
 * Combines core modules and widget into a single script for blog deployment
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

config.ensureDir(config.paths.dist);

function combineSourceFiles() {
  console.log('Combining source files...');

  const coreFiles = [
    'core/musical-theory.js',
    'core/chord-library.js',
    'core/banjo-tunings.js',
    'core/banjo-voicer.js',
    'core/storage-manager.js',
  ];

  const otherFiles = [
    'chord-diagram-renderer.js',
    'widget.js',
  ];

  let combined = '';

  for (const file of [...coreFiles, ...otherFiles]) {
    const filePath = path.join(config.paths.src, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove CommonJS exports for browser compatibility
    content = content.replace(/\/\/ Export for both CommonJS.*[\s\S]*?}/g, '');
    content = content.replace(/if \(typeof module.*[\s\S]*?}/g, '');

    combined += `// === ${file} ===\n`;
    combined += content.trim();
    combined += '\n\n';
  }

  return combined;
}

function addBuildMetadata(source) {
  const timestamp = new Date().toISOString();
  return `/*\n * Mini Banjo Chord Transposer\n * Version: ${config.version}\n * Built: ${timestamp}\n * Generated automatically - do not edit directly\n */\n` + source;
}

function build() {
  console.log('Building Mini Banjo Chord Transposer...');

  try {
    let source = combineSourceFiles();
    const final = addBuildMetadata(source);

    const outputPath = path.join(config.paths.dist, 'banjo-chord-transposer.js');
    fs.writeFileSync(outputPath, final);

    console.log(`Build complete: ${outputPath}`);
    console.log(`Size: ${(final.length / 1024).toFixed(1)}KB`);

    return { success: true, outputPath, source: final, size: final.length };
  } catch (error) {
    console.error('Build failed:', error.message);
    return { success: false, error: error.message };
  }
}

if (require.main === module) {
  const result = build();
  process.exit(result.success ? 0 : 1);
}

module.exports = { build };
