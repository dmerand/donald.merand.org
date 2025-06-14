#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const BLOG_POST_PATH = path.join(__dirname, '..', '..', '..', '_posts', '2025-01-11-unified-guitar-scale-pattern-visualizer.md');

// Get all backup files sorted by date (newest first)
function getBackupFiles() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('❌ No backup directory found');
    return [];
  }
  
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('blog-post-') && file.endsWith('.md'))
    .map(file => {
      const stats = fs.statSync(path.join(BACKUP_DIR, file));
      return {
        name: file,
        path: path.join(BACKUP_DIR, file),
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
    const corruptedBackupPath = path.join(BACKUP_DIR, `blog-post-corrupted-${timestamp}.md`);
    
    if (fs.existsSync(BLOG_POST_PATH)) {
      fs.copyFileSync(BLOG_POST_PATH, corruptedBackupPath);
      console.log(`💾 Current corrupted version backed up as: blog-post-corrupted-${timestamp}.md`);
    }
    
    // Restore from backup
    fs.copyFileSync(backupPath, BLOG_POST_PATH);
    console.log('✅ Blog post restored successfully!');
    console.log(`📝 Restored to: ${BLOG_POST_PATH}`);
    
  } catch (error) {
    console.error('❌ Error restoring backup:', error.message);
  }
}

// Main function
function main() {
  console.log('🔧 Guitar Scale Visualizer - Blog Post Restore Tool\n');
  
  const backups = getBackupFiles();
  
  if (backups.length === 0) {
    console.log('❌ No backup files found in', BACKUP_DIR);
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
