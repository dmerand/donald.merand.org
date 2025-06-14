#!/usr/bin/env node

/**
 * Deploy tool for the guitar scale visualizer
 * Updates the blog post with the latest built widget code
 */

const fs = require('fs');
const path = require('path');
const { build } = require('./build');

const BLOG_POST_PATH = path.join(__dirname, '../../../_posts/2025-01-11-unified-guitar-scale-pattern-visualizer.md');
const TEMPLATE_PATH = path.join(__dirname, '../src/template.html');
const BACKUP_DIR = path.join(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create backup of current blog post
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `blog-post-${timestamp}.md`);
  
  if (fs.existsSync(BLOG_POST_PATH)) {
    fs.copyFileSync(BLOG_POST_PATH, backupPath);
    console.log(`💾 Backup created: ${backupPath}`);
    return backupPath;
  }
  
  throw new Error(`Blog post not found: ${BLOG_POST_PATH}`);
}

// Extract current script and HTML sections from blog post
function extractCurrentSections(blogContent) {
  const scriptStart = blogContent.indexOf('<script>');
  const scriptEnd = blogContent.indexOf('</script>') + '</script>'.length;
  
  if (scriptStart === -1 || scriptEnd === -1) {
    throw new Error('Could not find <script> tags in blog post');
  }
  
  // Find the instrument visualizer div
  const visualizerStart = blogContent.indexOf('<div id="instrument-visualizer"');
  
  // Find the last </div> before the script section (this closes the instrument-visualizer)
  let visualizerEnd = blogContent.lastIndexOf('</div>', scriptStart);
  visualizerEnd += '</div>'.length;
  
  if (visualizerStart === -1 || visualizerEnd === -1) {
    throw new Error('Could not find instrument-visualizer div boundaries in blog post');
  }
  
  return {
    beforeVisualizer: blogContent.substring(0, visualizerStart),
    currentVisualizer: blogContent.substring(visualizerStart, visualizerEnd),
    afterVisualizerBeforeScript: blogContent.substring(visualizerEnd, scriptStart),
    currentScript: blogContent.substring(scriptStart, scriptEnd),
    afterScript: blogContent.substring(scriptEnd)
  };
}

// Extract visualizer HTML from template
function extractTemplateVisualizer() {
  const templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  
  // Find the instrument visualizer div start
  const visualizerStart = templateContent.indexOf('<div id="instrument-visualizer"');
  
  if (visualizerStart === -1) {
    throw new Error('Could not find instrument-visualizer div in template');
  }
  
  // Find the version footer div end to get all content we want
  const versionFooterStart = templateContent.indexOf('<div class="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-200">');
  if (versionFooterStart === -1) {
    throw new Error('Could not find version footer div in template');
  }
  
  const versionFooterEnd = templateContent.indexOf('</div>', versionFooterStart) + '</div>'.length;
  
  if (versionFooterEnd === -1) {
    throw new Error('Could not find closing div for version footer in template');
  }
  
  let visualizerHtml = templateContent.substring(visualizerStart, versionFooterEnd);
  
  // Remove leading whitespace from each line to prevent Jekyll from treating as code blocks
  visualizerHtml = visualizerHtml
    .split('\n')
    .map(line => line.replace(/^\s+/, '')) // Remove ALL leading whitespace
    .join('\n')
    .trim();
  
  return visualizerHtml;
}

// Update blog post with new script and HTML
function updateBlogPost(newScript) {
  console.log('📝 Updating blog post...');
  
  // Read current blog post
  const blogContent = fs.readFileSync(BLOG_POST_PATH, 'utf8');
  
  // Extract sections
  const { beforeVisualizer, currentVisualizer, afterVisualizerBeforeScript, currentScript, afterScript } = extractCurrentSections(blogContent);
  
  // Get updated HTML from template
  const newVisualizerHtml = extractTemplateVisualizer();
  
  console.log(`📏 Current script size: ${(currentScript.length / 1024).toFixed(1)}KB`);
  console.log(`📏 New script size: ${(newScript.length / 1024).toFixed(1)}KB`);
  console.log(`🎨 Updating HTML structure from template`);
  
  // Create new content with updated HTML and script
  const newBlogContent = beforeVisualizer + newVisualizerHtml + '\n\n' + newScript + afterScript;
  
  // Write updated blog post
  fs.writeFileSync(BLOG_POST_PATH, newBlogContent);
  
  console.log(`✅ Blog post updated: ${BLOG_POST_PATH}`);
  
  return {
    oldSize: currentScript.length,
    newSize: newScript.length,
    sizeDiff: newScript.length - currentScript.length
  };
}

// Validate that the updated blog post is functional
function validateDeployment() {
  console.log('🔍 Validating deployment...');
  
  const blogContent = fs.readFileSync(BLOG_POST_PATH, 'utf8');
  
  // Enhanced validation checks
  const checks = [
    {
      name: 'Has script tags',
      test: () => blogContent.includes('<script>') && blogContent.includes('</script>')
    },
    {
      name: 'Has StringedInstrumentVisualizer class',
      test: () => blogContent.includes('class StringedInstrumentVisualizer')
    },
    {
      name: 'Has DOMContentLoaded listener',
      test: () => blogContent.includes('DOMContentLoaded')
    },
    {
      name: 'Has core modules',
      test: () => blogContent.includes('MusicalTheory') && blogContent.includes('ScalePatterns')
    },
    {
      name: 'Has preset management buttons',
      test: () => blogContent.includes('Save as new preset') && blogContent.includes('💾') && blogContent.includes('🗑️')
    },
    {
      name: 'Has required button IDs',
      test: () => blogContent.includes('id="save-preset-button"') && 
                 blogContent.includes('id="update-preset-button"') && 
                 blogContent.includes('id="delete-preset-button"')
    },
    {
      name: 'Has SVG container with save button',
      test: () => blogContent.includes('id="fretboard-container"') && 
                 blogContent.includes('id="save-svg-button"') &&
                 blogContent.includes('<svg id="fretboard"')
    },
    {
      name: 'Has version footer',
      test: () => blogContent.includes('Version 1.0.0') && 
                 blogContent.includes('Last updated:') &&
                 blogContent.includes('Source code')
    },
    {
      name: 'Balanced HTML div tags',
      test: () => {
        const openDivs = (blogContent.match(/<div[^>]*>/g) || []).length;
        const closeDivs = (blogContent.match(/<\/div>/g) || []).length;
        console.log(`   Debug: Found ${openDivs} opening divs and ${closeDivs} closing divs`);
        return openDivs === closeDivs;
      }
    },
    {
      name: 'No leading spaces on HTML elements (Jekyll-safe)',
      test: () => {
        const htmlLines = blogContent.split('\n');
        const htmlElementLines = htmlLines.filter(line => 
          line.trim().startsWith('<div') || 
          line.trim().startsWith('<button') || 
          line.trim().startsWith('<svg')
        );
        const problematicLines = htmlElementLines.filter(line => line.match(/^\s+</));
        if (problematicLines.length > 0) {
          console.log(`   Debug: Found ${problematicLines.length} lines with leading spaces:`, problematicLines.slice(0, 3));
        }
        return htmlElementLines.every(line => !line.match(/^\s+</)); // No leading spaces at all
      }
    },
    {
      name: 'Main instrument-visualizer container present',
      test: () => blogContent.includes('<div id="instrument-visualizer"') && 
                 blogContent.includes('class="bg-white rounded-lg shadow-lg p-6 mt-8"')
    },
    {
      name: 'All required form elements present',
      test: () => blogContent.includes('id="tuning-preset"') && 
                 blogContent.includes('id="scale-type"') &&
                 blogContent.includes('id="root-note"') &&
                 blogContent.includes('id="notes-per-string"')
    }
  ];
  
  const results = checks.map(check => ({
    ...check,
    passed: check.test()
  }));
  
  const allPassed = results.every(r => r.passed);
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`   ${icon} ${result.name}`);
  });
  
  if (!allPassed) {
    throw new Error('Deployment validation failed');
  }
  
  console.log('✅ Deployment validation passed');
  return true;
}

// Main deploy function
function deploy(options = {}) {
  console.log('🚀 Deploying Guitar Scale Visualizer to blog...');
  
  try {
    // Create backup first
    const backupPath = createBackup();
    
    // Build the widget
    console.log('🔨 Building widget...');
    const buildResult = build({ minify: options.minify !== false });
    
    if (!buildResult.success) {
      throw new Error(`Build failed: ${buildResult.error}`);
    }
    
    // Create script tag with new content
    const newScript = `<script>\n${buildResult.source}\n</script>`;
    
    // Update blog post
    const updateResult = updateBlogPost(newScript);
    
    // Validate deployment
    validateDeployment();
    
    console.log(`\n🎉 Deployment successful!`);
    console.log(`📊 Size change: ${updateResult.sizeDiff > 0 ? '+' : ''}${(updateResult.sizeDiff / 1024).toFixed(1)}KB`);
    console.log(`💾 Backup saved: ${backupPath}`);
    console.log(`📝 Blog post updated: ${BLOG_POST_PATH}`);
    
    return {
      success: true,
      backupPath,
      sizeChange: updateResult.sizeDiff,
      buildSize: buildResult.size
    };
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
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
    minify: args.includes('--minify')
  };
  
  const result = deploy(options);
  process.exit(result.success ? 0 : 1);
}

module.exports = { deploy };
