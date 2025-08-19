const fs = require('fs');
const path = require('path');

// Transform filename to display name
function formatDisplayName(filename) {
  const nameWithoutExtension = filename.replace('.epub', ''); // Remove extension
  
  // Check if filename contains ' - ' separator (book - author - date format)
  if (nameWithoutExtension.includes(' - ')) {
    // Extract just the first part (book title)
    return nameWithoutExtension.split(' - ')[0].trim();
  }
  
  // Fall back to original logic for files with hyphen-separated words
  return nameWithoutExtension
    .split('-') // Split on hyphens
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' '); // Join with spaces
}

// Extract date from filename for sorting
function extractDate(filename) {
  const nameWithoutExtension = filename.replace('.epub', '');
  
  // Look for date pattern YYYY-MM-DD at the end after ' - '
  const parts = nameWithoutExtension.split(' - ');
  if (parts.length >= 3) {
    const datePart = parts[parts.length - 1].trim();
    // Check if it matches YYYY-MM-DD pattern
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return new Date(datePart);
    }
  }
  
  // If no date found, return epoch (will sort to end)
  return new Date(0);
}

// Scan directory for .epub files
function scanDirectory(audienceDir) {
  const fullPath = path.join('epub/samples', audienceDir);
  
  try {
    const files = fs.readdirSync(fullPath);
    return files
      .filter(file => file.endsWith('.epub'))
      .map(filename => ({
        filename,
        displayName: formatDisplayName(filename),
        path: `/epub/samples/${audienceDir}/${filename}`
      }))
      .sort((a, b) => {
        const dateA = extractDate(a.filename);
        const dateB = extractDate(b.filename);
        return dateB - dateA; // Sort most recent first
      });
  } catch (error) {
    console.warn(`Could not read directory ${fullPath}:`, error.message);
    return [];
  }
}

module.exports = {
  writers: scanDirectory('writers'),
  designers: scanDirectory('designers'),
  developers: scanDirectory('developers')
};