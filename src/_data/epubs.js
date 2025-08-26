const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const { DOMParser } = require('@xmldom/xmldom');

async function extractEpubMetadata(filePath) {
  try {
    // Extract container.xml to get the rootfile path
    const zip = await unzipper.Open.file(filePath);
    
    // Get container.xml
    const containerEntry = zip.files.find(file => file.path === 'META-INF/container.xml');
    if (!containerEntry) {
      throw new Error('No container.xml found');
    }
    
    const containerContent = await containerEntry.buffer();
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerContent.toString(), 'text/xml');
    
    // Get the rootfile path (typically OEBPS/content.opf)
    const rootfileElement = containerDoc.getElementsByTagName('rootfile')[0];
    if (!rootfileElement) {
      throw new Error('No rootfile found in container.xml');
    }
    
    const opfPath = rootfileElement.getAttribute('full-path');
    
    // Extract the OPF file
    const opfEntry = zip.files.find(file => file.path === opfPath);
    if (!opfEntry) {
      throw new Error(`OPF file not found: ${opfPath}`);
    }
    
    const opfContent = await opfEntry.buffer();
    const opfDoc = parser.parseFromString(opfContent.toString(), 'text/xml');
    
    // Extract metadata from OPF
    const packageElement = opfDoc.documentElement; // <package> is root
    const uniqueIdentifier = packageElement.getAttribute('unique-identifier');
    
    // Get the identifier with the matching id
    const identifiers = opfDoc.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'identifier');
    let uuid = null;
    for (let i = 0; i < identifiers.length; i++) {
      if (identifiers[i].getAttribute('id') === uniqueIdentifier) {
        uuid = identifiers[i].textContent;
        break;
      }
    }
    
    // Extract other metadata
    const titleElement = opfDoc.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'title')[0];
    const title = titleElement ? titleElement.textContent : null;
    
    const creatorElements = opfDoc.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'creator');
    const authors = Array.from(creatorElements).map(el => el.textContent);
    
    const descriptionElement = opfDoc.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'description')[0];
    const description = descriptionElement ? descriptionElement.textContent : null;
    
    const languageElement = opfDoc.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'language')[0];
    const language = languageElement ? languageElement.textContent : null;
    
    const publisherElement = opfDoc.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'publisher')[0];
    const publisher = publisherElement ? publisherElement.textContent : null;
    
    const subjectElements = opfDoc.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'subject');
    const subjects = Array.from(subjectElements).map(el => el.textContent);
    
    // Get dcterms:modified for EPUB 3
    const metaElements = opfDoc.getElementsByTagName('meta');
    let modified = null;
    for (let i = 0; i < metaElements.length; i++) {
      if (metaElements[i].getAttribute('property') === 'dcterms:modified') {
        modified = metaElements[i].textContent;
        break;
      }
    }
    
    return {
      uuid,
      title,
      authors,
      description,
      language,
      publisher,
      subjects,
      modified,
      filePath
    };
    
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

module.exports = async function() {
  const samplesDir = path.join(__dirname, '../../epub/samples');
  const categories = {};
  
  try {
    // Read each category directory
    const categoryDirs = fs.readdirSync(samplesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const categoryName of categoryDirs) {
      const categoryPath = path.join(samplesDir, categoryName);
      const epubFiles = fs.readdirSync(categoryPath)
        .filter(filename => filename.endsWith('.epub'))
        .map(filename => path.join(categoryPath, filename));
      
      // Extract metadata from each EPUB in this category
      const categoryBooks = [];
      for (const epubFile of epubFiles) {
        const metadata = await extractEpubMetadata(epubFile);
        if (metadata) {
          // Add relative path for OPDS links
          const relativePath = path.relative(
            path.join(__dirname, '../../epub'),
            epubFile
          ).replace(/\\/g, '/'); // Normalize path separators
          
          categoryBooks.push({
            ...metadata,
            category: categoryName,
            relativePath
          });
        }
      }
      
      // Sort books by modified date (oldest first)
      categoryBooks.sort((a, b) => {
        const dateA = new Date(a.modified || '9999-12-31');
        const dateB = new Date(b.modified || '9999-12-31');
        return dateA - dateB;
      });
      categories[categoryName] = categoryBooks;
    }
    
    return categories;
    
  } catch (error) {
    console.error('Error scanning EPUB files:', error);
    return {};
  }
};