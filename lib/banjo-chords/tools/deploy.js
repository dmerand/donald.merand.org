#!/usr/bin/env node

/**
 * Deploy tool for the banjo chord transposer
 * Updates the blog post with the latest built widget code
 */

const fs = require('fs');
const path = require('path');
const { build } = require('./build');
const config = require('./config');

config.ensureDir(config.paths.backups);

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(config.paths.backups, `blog-post-${timestamp}.md`);

  if (fs.existsSync(config.paths.blogPost)) {
    fs.copyFileSync(config.paths.blogPost, backupPath);
    console.log(`Backup created: ${backupPath}`);
    return backupPath;
  }

  throw new Error(`Blog post not found: ${config.paths.blogPost}`);
}

function updateBlogPost(newScriptContent) {
  console.log('Updating blog post...');

  const blogContent = fs.readFileSync(config.paths.blogPost, 'utf8');

  const scriptStart = blogContent.indexOf('<script>');
  const scriptEnd = blogContent.indexOf('</script>') + '</script>'.length;

  if (scriptStart === -1 || scriptEnd === -1) {
    throw new Error('Could not find <script> tags in blog post');
  }

  const currentScript = blogContent.substring(scriptStart, scriptEnd);
  const newScript = `<script>\n${newScriptContent}\n</script>`;

  const newBlogContent = blogContent.substring(0, scriptStart) + newScript + blogContent.substring(scriptEnd);

  fs.writeFileSync(config.paths.blogPost, newBlogContent);

  console.log(`Old script: ${(currentScript.length / 1024).toFixed(1)}KB`);
  console.log(`New script: ${(newScript.length / 1024).toFixed(1)}KB`);
  console.log(`Blog post updated: ${config.paths.blogPost}`);

  return {
    oldSize: currentScript.length,
    newSize: newScript.length,
  };
}

function validateDeployment() {
  console.log('Validating deployment...');

  const blogContent = fs.readFileSync(config.paths.blogPost, 'utf8');

  const checks = [
    ['Has script tags', () => blogContent.includes('<script>') && blogContent.includes('</script>')],
    ['Has BanjoToolController', () => blogContent.includes('class BanjoToolController')],
    ['Has DOMContentLoaded', () => blogContent.includes('DOMContentLoaded')],
    ['Has core modules', () => blogContent.includes('MusicalTheory') && blogContent.includes('BanjoVoicer')],
    ['Has banjo-tool container', () => blogContent.includes('id="banjo-tool"')],
    ['Balanced divs', () => {
      const opens = (blogContent.match(/<div[^>]*>/g) || []).length;
      const closes = (blogContent.match(/<\/div>/g) || []).length;
      return opens === closes;
    }],
  ];

  let allPassed = true;
  for (const [name, test] of checks) {
    const passed = test();
    console.log(`  ${passed ? 'OK' : 'FAIL'} ${name}`);
    if (!passed) allPassed = false;
  }

  if (!allPassed) throw new Error('Deployment validation failed');
  console.log('Validation passed');
}

function deploy() {
  console.log('Deploying Mini Banjo Chord Transposer...');

  try {
    const backupPath = createBackup();
    const buildResult = build();

    if (!buildResult.success) {
      throw new Error(`Build failed: ${buildResult.error}`);
    }

    updateBlogPost(buildResult.source);
    validateDeployment();

    console.log('\nDeployment successful!');
    console.log(`Backup: ${backupPath}`);

    return { success: true, backupPath };
  } catch (error) {
    console.error('Deployment failed:', error.message);
    return { success: false, error: error.message };
  }
}

if (require.main === module) {
  const result = deploy();
  process.exit(result.success ? 0 : 1);
}

module.exports = { deploy };
