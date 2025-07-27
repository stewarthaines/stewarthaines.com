#!/usr/bin/env node

const fs = require('fs');

// Original translations based on session summary
const translations = {
  // Page and section headers
  "page_title": {
    "en": "EDITME.html",
    "es": "EDITME.html", 
    "fr": "EDITME.html",
    "de": "EDITME.html"
  },
  "hero_description": {
    "en": "Convert plain text to EPUB - the simplest way to create EPUB files",
    "es": "Convierte texto plano a EPUB - la forma más simple de crear archivos EPUB",
    "fr": "Convertir du texte brut en EPUB - le moyen le plus simple de créer des fichiers EPUB", 
    "de": "Einfachen Text in EPUB umwandeln - der einfachste Weg, EPUB-Dateien zu erstellen"
  },
  
  // Audience selector labels
  "audience_authors": {
    "en": "Book Authors",
    "es": "Autores de Libros",
    "fr": "Auteurs de Livres",
    "de": "Buchautoren"
  },
  "audience_designers": {
    "en": "Book Designers", 
    "es": "Diseñadores de Libros",
    "fr": "Concepteurs de Livres",
    "de": "Buchdesigner"
  },
  "audience_developers": {
    "en": "Book Developers",
    "es": "Desarrolladores de Libros", 
    "fr": "Développeurs de Livres",
    "de": "Buchentwickler"
  },
  
  // Authors features
  "feature_plain_text": {
    "en": "Plain Text Input",
    "es": "Entrada de Texto Plano",
    "fr": "Saisie de Texte Brut",
    "de": "Einfacher Text"
  },
  "feature_plain_text_desc": {
    "en": "Write your content in simple plain text format. No complex markup required.",
    "es": "Escribe tu contenido en formato de texto plano. No se requiere marcado complejo.",
    "fr": "Rédigez votre contenu en format texte brut simple. Aucun balisage complexe requis.",
    "de": "Schreiben Sie Ihren Inhalt im einfachen Textformat. Keine komplexe Auszeichnung erforderlich."
  },
  "feature_instant_epub": {
    "en": "Instant EPUB",
    "es": "EPUB Instantáneo", 
    "fr": "EPUB Instantané",
    "de": "Sofort-EPUB"
  },
  "feature_instant_epub_desc": {
    "en": "Generate valid EPUB 3.2 files instantly with proper structure and metadata.",
    "es": "Genera archivos EPUB 3.2 válidos al instante con estructura y metadatos adecuados.",
    "fr": "Générez instantanément des fichiers EPUB 3.2 valides avec une structure et des métadonnées appropriées.",
    "de": "Erstellen Sie sofort gültige EPUB 3.2-Dateien mit ordnungsgemäßer Struktur und Metadaten."
  },
  "feature_no_install": {
    "en": "No Installation",
    "es": "Sin Instalación",
    "fr": "Aucune Installation", 
    "de": "Keine Installation"
  },
  "feature_no_install_desc": {
    "en": "Browser-based tool that works offline. No software to download or install.",
    "es": "Herramienta basada en navegador que funciona sin conexión. No hay software que descargar o instalar.",
    "fr": "Outil basé sur navigateur qui fonctionne hors ligne. Aucun logiciel à télécharger ou installer.",
    "de": "Browser-basiertes Tool, das offline funktioniert. Keine Software zum Herunterladen oder Installieren."
  },
  
  // Designers features  
  "feature_live_preview": {
    "en": "Live Layout Preview",
    "es": "Vista Previa en Vivo",
    "fr": "Aperçu en Direct",
    "de": "Live-Layout-Vorschau"
  },
  "feature_live_preview_desc": {
    "en": "See real-time layout changes across different device screens and orientations.",
    "es": "Ve cambios de diseño en tiempo real en diferentes pantallas y orientaciones de dispositivos.",
    "fr": "Voyez les changements de mise en page en temps réel sur différents écrans et orientations d'appareils.", 
    "de": "Sehen Sie Layout-Änderungen in Echtzeit auf verschiedenen Gerätebildschirmen und Ausrichtungen."
  },
  "feature_responsive_design": {
    "en": "Responsive Design Testing",
    "es": "Pruebas de Diseño Responsivo",
    "fr": "Test de Design Réactif",
    "de": "Responsive Design-Tests"
  },
  "feature_responsive_design_desc": {
    "en": "Test typography, margins, and layouts on mobile, tablet, and desktop instantly.",
    "es": "Prueba tipografía, márgenes y diseños en móvil, tablet y escritorio al instante.",
    "fr": "Testez la typographie, les marges et les mises en page sur mobile, tablette et bureau instantanément.",
    "de": "Testen Sie Typografie, Ränder und Layouts auf Mobilgeräten, Tablets und Desktop sofort."
  },
  "feature_visual_feedback": {
    "en": "Visual Design Feedback",
    "es": "Retroalimentación Visual",
    "fr": "Retour Visuel", 
    "de": "Visuelles Feedback"
  },
  "feature_visual_feedback_desc": {
    "en": "Immediate visual feedback for cover design, chapter breaks, and formatting choices.",
    "es": "Retroalimentación visual inmediata para diseño de portada, saltos de capítulo y elecciones de formato.",
    "fr": "Retour visuel immédiat pour la conception de couverture, les sauts de chapitre et les choix de formatage.",
    "de": "Sofortiges visuelles Feedback für Cover-Design, Kapitelumbrüche und Formatierungsoptionen."
  },
  
  // Developers features
  "feature_rapid_iteration": {
    "en": "Rapid Iteration",
    "es": "Iteración Rápida",
    "fr": "Itération Rapide", 
    "de": "Schnelle Iteration"
  },
  "feature_rapid_iteration_desc": {
    "en": "Quick testing of custom JavaScript behaviors and interactive elements.",
    "es": "Pruebas rápidas de comportamientos JavaScript personalizados y elementos interactivos.",
    "fr": "Test rapide de comportements JavaScript personnalisés et d'éléments interactifs.",
    "de": "Schnelles Testen von benutzerdefinierten JavaScript-Verhalten und interaktiven Elementen."
  },
  "feature_third_party": {
    "en": "Third-Party Integration", 
    "es": "Integración de Terceros",
    "fr": "Intégration Tierce",
    "de": "Drittanbieter-Integration"
  },
  "feature_third_party_desc": {
    "en": "Test external libraries, analytics, and custom scripts within the EPUB environment.",
    "es": "Prueba librerías externas, analíticas y scripts personalizados dentro del entorno EPUB.",
    "fr": "Testez des bibliothèques externes, des analyses et des scripts personnalisés dans l'environnement EPUB.",
    "de": "Testen Sie externe Bibliotheken, Analytik und benutzerdefinierte Skripte in der EPUB-Umgebung."
  },
  "feature_debugging": {
    "en": "Browser-Based Debugging",
    "es": "Depuración en Navegador", 
    "fr": "Débogage en Navigateur",
    "de": "Browser-basiertes Debugging"
  },
  "feature_debugging_desc": {
    "en": "Use familiar developer tools for debugging scripts and performance optimization.",
    "es": "Usa herramientas de desarrollador familiares para depurar scripts y optimización de rendimiento.",
    "fr": "Utilisez des outils de développement familiers pour déboguer les scripts et l'optimisation des performances.",
    "de": "Verwenden Sie vertraute Entwicklertools zum Debuggen von Skripten und zur Leistungsoptimierung."
  },
  
  // iframe title
  "iframe_title": {
    "en": "EDITME.html - EPUB Creation Tool",
    "es": "EDITME.html - Herramienta de Creación EPUB", 
    "fr": "EDITME.html - Outil de Création EPUB",
    "de": "EDITME.html - EPUB-Erstellungstool"
  }
};

// Function to update a .po file with translations
function updatePoFile(lang, translations) {
  const poFile = `locales/${lang}.po`;
  
  if (!fs.existsSync(poFile)) {
    console.error(`Error: ${poFile} not found`);
    return;
  }
  
  let content = fs.readFileSync(poFile, 'utf8');
  let updatedCount = 0;
  
  // For each translation key, update the msgstr
  Object.keys(translations).forEach(key => {
    if (translations[key][lang]) {
      const translatedText = translations[key][lang];
      
      // For English, also handle cases where msgstr already has the key as value
      const emptyPattern = new RegExp(`(msgid "${key}"\\s*\\n)(msgstr "")`, 'g');
      const keyPattern = new RegExp(`(msgid "${key}"\\s*\\n)(msgstr "${key}")`, 'g');
      const replacement = `$1msgstr "${translatedText}"`;
      
      if (content.match(emptyPattern)) {
        content = content.replace(emptyPattern, replacement);
        updatedCount++;
      } else if (content.match(keyPattern)) {
        content = content.replace(keyPattern, replacement);
        updatedCount++;
      }
    }
  });
  
  fs.writeFileSync(poFile, content);
  console.log(`Updated ${updatedCount} translations in ${poFile}`);
}

// Update all language files
const languages = ['en', 'es', 'fr', 'de'];
console.log('Restoring original translations to .po files...');

languages.forEach(lang => {
  updatePoFile(lang, translations);
});

console.log('\nTranslations restored successfully!');
console.log('Next steps:');
console.log('1. Run: npm run po-to-json');
console.log('2. Run: npm run build');
console.log('3. Test translations in browser');