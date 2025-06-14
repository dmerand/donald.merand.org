#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const config = require('./config');

// Get all backup files sorted by date (newest first)
function getBackupFiles() {
  if (!fs.existsSync(config.paths.backups)) {
    console.log('❌ No backup directory found');
    return [];
  }
  
  const files = fs.readdirSync(config.paths.backups)
    .filter(file => file.startsWith('blog-post-') && file.endsWith('.md'))
    .map(file => {
      const stats = fs.statSync(path.join(config.paths.backups, file));
      return {
        name: file,
        path: path.join(config.paths.backups, file),
        date: stats.mtime
      };
    })
    .sort((a, b) => b.date - a.date); // Newest first
  
  return files;
}

// Format date for display
function formatDate(date) {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Restore from selected backup
function restoreBackup(backupPath, backupName) {
  try {
    console.log(`🔄 Restoring from backup: ${backupName}`);
    
    // Create a backup of the current corrupted version first
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const corruptedBackupPath = path.join(config.paths.backups, `blog-post-corrupted-${timestamp}.md`);
    
    if (fs.existsSync(config.paths.blogPost)) {
      fs.copyFileSync(config.paths.blogPost, corruptedBackupPath);
      console.log(`💾 Current corrupted version backed up as: blog-post-corrupted-${timestamp}.md`);
    }
    
    // Restore from backup
    fs.copyFileSync(backupPath, config.paths.blogPost);
    console.log('✅ Blog post restored successfully!');
    console.log(`📝 Restored to: ${config.paths.blogPost}`);
    
  } catch (error) {
    console.error('❌ Error restoring backup:', error.message);
  }
}

// Main function
function main() {
  console.log('🔧 Guitar Scale Visualizer - Blog Post Restore Tool\n');
  
  const backups = getBackupFiles();
  
  if (backups.length === 0) {
    console.log('❌ No backup files found in', config.paths.backups);
    rl.close();
    return;
  }
  
  console.log(`📁 Found ${backups.length} backup files:\n`);
  
  backups.forEach((backup, index) => {
    console.log(`${index + 1}. ${backup.name}`);
    console.log(`   Date: ${formatDate(backup.date)}`);
    console.log(`   Size: ${(fs.statSync(backup.path).size / 1024).toFixed(1)} KB\n`);
  });
  
  rl.question('Select a backup to restore (enter number, or 0 to cancel): ', (answer) => {
    const choice = parseInt(answer);
    
    if (choice === 0) {
      console.log('❌ Restore cancelled');
      rl.close();
      return;
    }
    
    if (choice < 1 || choice > backups.length) {
      console.log('❌ Invalid selection');
      rl.close();
      return;
    }
    
    const selectedBackup = backups[choice - 1];
    
    console.log(`\n⚠️  This will restore the blog post from:`);
    console.log(`   File: ${selectedBackup.name}`);
    console.log(`   Date: ${formatDate(selectedBackup.date)}`);
    console.log(`   The current blog post will be backed up before restoration.\n`);
    
    rl.question('Are you sure you want to proceed? (y/N): ', (confirm) => {
      if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        restoreBackup(selectedBackup.path, selectedBackup.name);
      } else {
        console.log('❌ Restore cancelled');
      }
      rl.close();
    });
  });
}

if (require.main === module) {
  main();
}

module.exports = { getBackupFiles, restoreBackup };
