// Variables globales
let emailHTML = '';
let emailDoc = null;

// Éléments DOM
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const fileInfo = document.getElementById('file-info');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const analyzeBtn = document.getElementById('analyze-btn');
const resultsSection = document.getElementById('results-section');
const resetBtn = document.getElementById('reset-btn');

// Mots spam courants
const SPAM_WORDS = [
    'gratuit', 'free', 'urgent', 'cliquez ici', 'click here', 'garantie',
    'argent facile', 'gagner', 'prize', 'winner', 'congratulations',
    'act now', 'limited time', 'offre limitée', 'millionaire', 'casino',
    '100%', 'satisfaction garantie', 'risque zéro', 'viagra', 'lottery'
];

// Gestion du drag & drop
uploadArea.addEventListener('click', () => fileInput.click());
browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    handleFile(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
});

// Gérer le fichier uploadé
function handleFile(file) {
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
        alert('Veuillez sélectionner un fichier HTML');
        return;
    }

    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = 'flex';

    const reader = new FileReader();
    reader.onload = (e) => {
        emailHTML = e.target.result;
        const parser = new DOMParser();
        emailDoc = parser.parseFromString(emailHTML, 'text/html');
    };
    reader.readAsText(file);
}

// Analyser l'email
analyzeBtn.addEventListener('click', () => {
    if (!emailHTML || !emailDoc) {
        alert('Veuillez d\'abord charger un fichier HTML');
        return;
    }

    const results = analyzeEmail();
    displayResults(results);
});

// Fonction principale d'analyse
function analyzeEmail() {
    return {
        structure: analyzeStructure(),
        content: analyzeContent(),
        images: analyzeImages(),
        links: analyzeLinks(),
        performance: analyzePerformance()
    };
}

// Analyse de la structure HTML
function analyzeStructure() {
    const checks = [];
    let score = 0;
    const maxScore = 100;

    // DOCTYPE
    const hasDoctype = emailHTML.toLowerCase().includes('<!doctype');
    checks.push({
        pass: hasDoctype,
        title: 'DOCTYPE déclaré',
        description: hasDoctype ? 'Le DOCTYPE est présent' : 'Ajoutez un DOCTYPE HTML pour une meilleure compatibilité'
    });
    if (hasDoctype) score += 15;

    // Balise <title>
    const hasTitle = emailDoc.querySelector('title') !== null;
    checks.push({
        pass: hasTitle,
        title: 'Balise <title>',
        description: hasTitle ? 'La balise title est présente' : 'Ajoutez une balise <title> pour identifier l\'email'
    });
    if (hasTitle) score += 10;

    // Utilisation de tableaux
    const tables = emailDoc.querySelectorAll('table');
    const hasTables = tables.length > 0;
    checks.push({
        pass: hasTables,
        title: 'Utilisation de tableaux',
        description: hasTables
            ? `${tables.length} tableau(x) utilisé(s) - Bonne pratique pour la compatibilité`
            : 'Utilisez des tableaux pour la mise en page (meilleure compatibilité)'
    });
    if (hasTables) score += 20;

    // CSS inline
    const elementsWithStyle = emailDoc.querySelectorAll('[style]');
    const inlineStylesCount = elementsWithStyle.length;
    const externalStyles = emailDoc.querySelectorAll('link[rel="stylesheet"]');
    const hasExternalCSS = externalStyles.length > 0;

    checks.push({
        pass: !hasExternalCSS,
        title: 'CSS externe',
        description: hasExternalCSS
            ? 'CSS externe détecté - Utilisez plutôt du CSS inline'
            : 'Pas de CSS externe - Excellent'
    });
    if (!hasExternalCSS) score += 20;

    checks.push({
        pass: inlineStylesCount > 0,
        title: 'CSS inline',
        description: inlineStylesCount > 0
            ? `${inlineStylesCount} éléments avec du style inline - Bonne pratique`
            : 'Ajoutez du CSS inline pour une meilleure compatibilité'
    });
    if (inlineStylesCount > 0) score += 20;

    // Largeur fixe
    const bodyOrTable = emailDoc.querySelector('body > table, body > div > table');
    let hasFixedWidth = false;
    if (bodyOrTable) {
        const width = bodyOrTable.getAttribute('width') || bodyOrTable.style.width;
        hasFixedWidth = width && (width.includes('600') || width.includes('650'));
    }

    checks.push({
        pass: hasFixedWidth,
        title: 'Largeur recommandée (600-650px)',
        description: hasFixedWidth
            ? 'Largeur optimale pour les emails'
            : 'Recommandé : 600-650px de largeur max pour compatibilité mobile'
    });
    if (hasFixedWidth) score += 15;

    return {
        score: Math.round(score),
        maxScore,
        checks
    };
}

// Analyse du contenu
function analyzeContent() {
    const checks = [];
    let score = 0;
    const maxScore = 100;

    // Texte du contenu
    const textContent = emailDoc.body.textContent || '';
    const textLength = textContent.trim().length;

    checks.push({
        pass: textLength > 50,
        title: 'Longueur du texte',
        description: textLength > 50
            ? `${textLength} caractères - Suffisant`
            : 'Augmentez le contenu textuel (minimum 50 caractères)'
    });
    if (textLength > 50) score += 20;

    // Ratio texte/HTML
    const htmlLength = emailHTML.length;
    const textRatio = (textLength / htmlLength) * 100;

    checks.push({
        pass: textRatio > 20,
        title: 'Ratio texte/HTML',
        description: `${textRatio.toFixed(1)}% de texte - ${textRatio > 20 ? 'Bon équilibre' : 'Trop de code HTML, ajoutez plus de texte'}`
    });
    if (textRatio > 20) score += 25;

    // Mots spam
    const lowerContent = textContent.toLowerCase();
    const spamWordsFound = SPAM_WORDS.filter(word => lowerContent.includes(word.toLowerCase()));

    checks.push({
        pass: spamWordsFound.length === 0,
        title: 'Mots déclencheurs de spam',
        description: spamWordsFound.length === 0
            ? 'Aucun mot spam détecté'
            : `${spamWordsFound.length} mot(s) spam détecté(s): ${spamWordsFound.slice(0, 3).join(', ')}...`
    });
    if (spamWordsFound.length === 0) score += 30;
    else if (spamWordsFound.length < 3) score += 15;

    // Majuscules excessives
    const uppercaseRatio = (textContent.match(/[A-Z]/g) || []).length / textContent.length * 100;
    checks.push({
        pass: uppercaseRatio < 30,
        title: 'Utilisation des majuscules',
        description: uppercaseRatio < 30
            ? `${uppercaseRatio.toFixed(1)}% de majuscules - Correct`
            : 'Trop de majuscules - Évitez l\'abus de capitales'
    });
    if (uppercaseRatio < 30) score += 15;

    // Points d'exclamation
    const exclamationCount = (textContent.match(/!/g) || []).length;
    checks.push({
        pass: exclamationCount < 5,
        title: 'Points d\'exclamation',
        description: exclamationCount < 5
            ? `${exclamationCount} point(s) d'exclamation - Acceptable`
            : 'Trop de points d\'exclamation - Réduisez pour éviter l\'aspect spam'
    });
    if (exclamationCount < 5) score += 10;

    return {
        score: Math.round(score),
        maxScore,
        checks
    };
}

// Analyse des images
function analyzeImages() {
    const checks = [];
    let score = 0;
    const maxScore = 100;

    const images = emailDoc.querySelectorAll('img');
    const imageCount = images.length;

    // Nombre d'images
    checks.push({
        pass: imageCount > 0 && imageCount < 15,
        title: 'Nombre d\'images',
        description: imageCount === 0
            ? 'Aucune image - Ajoutez des visuels'
            : imageCount < 15
                ? `${imageCount} image(s) - Quantité appropriée`
                : 'Trop d\'images - Réduisez pour améliorer le temps de chargement'
    });
    if (imageCount > 0 && imageCount < 15) score += 25;
    else if (imageCount === 0) score += 10;

    // Attributs alt
    let imagesWithAlt = 0;
    images.forEach(img => {
        if (img.hasAttribute('alt')) imagesWithAlt++;
    });

    const altRatio = imageCount > 0 ? (imagesWithAlt / imageCount) * 100 : 100;
    checks.push({
        pass: altRatio === 100,
        title: 'Attributs alt sur les images',
        description: imageCount === 0
            ? 'Pas d\'images'
            : altRatio === 100
                ? 'Toutes les images ont un attribut alt - Excellent'
                : `${imagesWithAlt}/${imageCount} images avec alt - Ajoutez alt sur toutes les images`
    });
    if (altRatio === 100) score += 30;
    else if (altRatio > 50) score += 15;

    // Dimensions spécifiées
    let imagesWithDimensions = 0;
    images.forEach(img => {
        if ((img.hasAttribute('width') && img.hasAttribute('height')) ||
            (img.style.width && img.style.height)) {
            imagesWithDimensions++;
        }
    });

    const dimensionsRatio = imageCount > 0 ? (imagesWithDimensions / imageCount) * 100 : 100;
    checks.push({
        pass: dimensionsRatio > 80,
        title: 'Dimensions des images',
        description: imageCount === 0
            ? 'Pas d\'images'
            : `${imagesWithDimensions}/${imageCount} images avec dimensions - ${dimensionsRatio > 80 ? 'Excellent' : 'Spécifiez width et height'}`
    });
    if (dimensionsRatio > 80) score += 25;
    else if (dimensionsRatio > 50) score += 12;

    // Images hébergées
    let externalImages = 0;
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
            externalImages++;
        }
    });

    checks.push({
        pass: externalImages === imageCount,
        title: 'Hébergement des images',
        description: imageCount === 0
            ? 'Pas d\'images'
            : externalImages === imageCount
                ? 'Toutes les images sont hébergées en ligne - Excellent'
                : 'Certaines images ne sont pas hébergées - Utilisez des URLs absolues'
    });
    if (imageCount === 0 || externalImages === imageCount) score += 20;

    return {
        score: Math.round(score),
        maxScore,
        checks
    };
}

// Analyse des liens
function analyzeLinks() {
    const checks = [];
    let score = 0;
    const maxScore = 100;

    const links = emailDoc.querySelectorAll('a');
    const linkCount = links.length;

    // Nombre de liens
    checks.push({
        pass: linkCount > 0 && linkCount < 30,
        title: 'Nombre de liens',
        description: linkCount === 0
            ? 'Aucun lien - Ajoutez au moins un CTA'
            : linkCount < 30
                ? `${linkCount} lien(s) - Quantité appropriée`
                : 'Trop de liens - Limitez à 30 maximum'
    });
    if (linkCount > 0 && linkCount < 30) score += 25;

    // Protocole HTTPS
    let httpsLinks = 0;
    let httpLinks = 0;
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            if (href.startsWith('https://')) httpsLinks++;
            else if (href.startsWith('http://')) httpLinks++;
        }
    });

    checks.push({
        pass: httpLinks === 0,
        title: 'Protocole HTTPS',
        description: httpLinks === 0
            ? 'Tous les liens utilisent HTTPS - Sécurisé'
            : `${httpLinks} lien(s) en HTTP - Utilisez HTTPS pour tous les liens`
    });
    if (httpLinks === 0) score += 30;
    else if (httpLinks < 3) score += 15;

    // Lien de désinscription
    let hasUnsubscribe = false;
    links.forEach(link => {
        const text = link.textContent.toLowerCase();
        const href = (link.getAttribute('href') || '').toLowerCase();
        if (text.includes('unsubscribe') || text.includes('désinscrire') ||
            text.includes('désinscription') || href.includes('unsubscribe')) {
            hasUnsubscribe = true;
        }
    });

    checks.push({
        pass: hasUnsubscribe,
        title: 'Lien de désinscription',
        description: hasUnsubscribe
            ? 'Lien de désinscription présent - Excellent'
            : 'Ajoutez un lien de désinscription visible'
    });
    if (hasUnsubscribe) score += 25;

    // Texte des liens
    let linksWithText = 0;
    links.forEach(link => {
        const text = link.textContent.trim();
        if (text.length > 0 && !text.toLowerCase().includes('cliquez ici') &&
            !text.toLowerCase().includes('click here')) {
            linksWithText++;
        }
    });

    const textLinkRatio = linkCount > 0 ? (linksWithText / linkCount) * 100 : 100;
    checks.push({
        pass: textLinkRatio > 80,
        title: 'Texte descriptif des liens',
        description: linkCount === 0
            ? 'Pas de liens'
            : `${textLinkRatio.toFixed(0)}% de liens avec texte descriptif - ${textLinkRatio > 80 ? 'Excellent' : 'Évitez "Cliquez ici"'}`
    });
    if (textLinkRatio > 80) score += 20;

    return {
        score: Math.round(score),
        maxScore,
        checks
    };
}

// Analyse de la performance
function analyzePerformance() {
    const checks = [];
    let score = 0;
    const maxScore = 100;

    // Taille du fichier
    const fileSize = new Blob([emailHTML]).size;
    const fileSizeKB = fileSize / 1024;

    checks.push({
        pass: fileSizeKB < 100,
        title: 'Taille du fichier',
        description: fileSizeKB < 100
            ? `${fileSizeKB.toFixed(1)} KB - Optimal`
            : `${fileSizeKB.toFixed(1)} KB - Réduisez la taille (max recommandé: 100KB)`
    });
    if (fileSizeKB < 100) score += 35;
    else if (fileSizeKB < 200) score += 20;

    // Nombre de requêtes (images + liens externes)
    const images = emailDoc.querySelectorAll('img[src^="http"]');
    const externalResources = emailDoc.querySelectorAll('link[href^="http"], script[src^="http"]');
    const totalRequests = images.length + externalResources.length;

    checks.push({
        pass: totalRequests < 20,
        title: 'Requêtes externes',
        description: `${totalRequests} requête(s) externe(s) - ${totalRequests < 20 ? 'Acceptable' : 'Réduisez le nombre de ressources externes'}`
    });
    if (totalRequests < 20) score += 25;
    else if (totalRequests < 40) score += 12;

    // JavaScript
    const scripts = emailDoc.querySelectorAll('script');
    const hasScripts = scripts.length > 0;

    checks.push({
        pass: !hasScripts,
        title: 'JavaScript',
        description: hasScripts
            ? 'JavaScript détecté - La plupart des clients mail bloquent JS'
            : 'Pas de JavaScript - Excellent'
    });
    if (!hasScripts) score += 20;

    // Forms
    const forms = emailDoc.querySelectorAll('form');
    const hasForms = forms.length > 0;

    checks.push({
        pass: !hasForms,
        title: 'Formulaires',
        description: hasForms
            ? 'Formulaires détectés - Non supportés par beaucoup de clients mail'
            : 'Pas de formulaires - Bon'
    });
    if (!hasForms) score += 20;

    return {
        score: Math.round(score),
        maxScore,
        checks
    };
}

// Afficher les résultats
function displayResults(results) {
    // Calculer le score global
    const totalScore = Math.round(
        (results.structure.score / results.structure.maxScore +
         results.content.score / results.content.maxScore +
         results.images.score / results.images.maxScore +
         results.links.score / results.links.maxScore +
         results.performance.score / results.performance.maxScore) / 5 * 100
    );

    // Afficher le score
    const scoreCircle = document.getElementById('score-circle');
    const scoreValue = document.getElementById('score-value');
    const scoreStatus = document.getElementById('score-status');

    scoreValue.textContent = totalScore;
    scoreCircle.style.setProperty('--score-deg', `${totalScore * 3.6}deg`);

    // Déterminer le statut
    let status, statusClass;
    if (totalScore >= 90) {
        status = 'Excellent';
        statusClass = 'excellent';
    } else if (totalScore >= 75) {
        status = 'Bon';
        statusClass = 'good';
    } else if (totalScore >= 60) {
        status = 'Moyen';
        statusClass = 'average';
    } else if (totalScore >= 40) {
        status = 'Faible';
        statusClass = 'poor';
    } else {
        status = 'Mauvais';
        statusClass = 'bad';
    }

    scoreStatus.textContent = status;
    scoreStatus.className = `score-status ${statusClass}`;

    // Afficher les détails par catégorie
    displayCategory('structure', results.structure);
    displayCategory('content', results.content);
    displayCategory('images', results.images);
    displayCategory('links', results.links);
    displayCategory('performance', results.performance);

    // Générer les recommandations
    generateRecommendations(results);

    // Afficher la section résultats
    document.querySelector('.upload-section').style.display = 'none';
    resultsSection.style.display = 'block';
}

// Afficher une catégorie
function displayCategory(categoryName, categoryData) {
    const scoreElement = document.getElementById(`${categoryName}-score`);
    const itemsElement = document.getElementById(`${categoryName}-items`);

    const scorePercent = Math.round((categoryData.score / categoryData.maxScore) * 100);
    scoreElement.textContent = `${scorePercent}%`;

    let scoreClass;
    if (scorePercent >= 90) scoreClass = 'excellent';
    else if (scorePercent >= 75) scoreClass = 'good';
    else if (scorePercent >= 60) scoreClass = 'average';
    else if (scorePercent >= 40) scoreClass = 'poor';
    else scoreClass = 'bad';

    scoreElement.className = `category-score ${scoreClass}`;

    // Afficher les checks
    itemsElement.innerHTML = categoryData.checks.map(check => {
        const status = check.pass ? 'pass' : 'fail';
        const icon = check.pass ? '✓' : '✗';

        return `
            <div class="check-item ${status}">
                <div class="check-icon">${icon}</div>
                <div class="check-content">
                    <div class="check-title">${check.title}</div>
                    <div class="check-description">${check.description}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Générer les recommandations prioritaires
function generateRecommendations(results) {
    const recommendations = [];

    // Collecter tous les checks qui ont échoué
    Object.values(results).forEach(category => {
        category.checks.forEach(check => {
            if (!check.pass) {
                recommendations.push({
                    text: check.description,
                    priority: determinePriority(check.title)
                });
            }
        });
    });

    // Trier par priorité
    recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Afficher les 5 premières recommandations
    const recommendationsList = document.getElementById('recommendations-list');
    if (recommendations.length === 0) {
        recommendationsList.innerHTML = '<p style="color: #4CAF50; font-weight: 600;">Aucune recommandation - Votre email respecte toutes les bonnes pratiques !</p>';
    } else {
        recommendationsList.innerHTML = recommendations.slice(0, 5).map(rec => `
            <div class="recommendation-item">
                <div class="recommendation-priority ${rec.priority}">${rec.priority.toUpperCase()}</div>
                <div class="recommendation-text">${rec.text}</div>
            </div>
        `).join('');
    }
}

// Déterminer la priorité d'une recommandation
function determinePriority(checkTitle) {
    const highPriority = ['Attributs alt', 'Protocole HTTPS', 'Mots déclencheurs', 'Lien de désinscription'];
    const mediumPriority = ['CSS externe', 'DOCTYPE', 'Ratio texte/HTML', 'JavaScript'];

    if (highPriority.some(p => checkTitle.includes(p))) return 'high';
    if (mediumPriority.some(p => checkTitle.includes(p))) return 'medium';
    return 'low';
}

// Réinitialiser
resetBtn.addEventListener('click', () => {
    emailHTML = '';
    emailDoc = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    resultsSection.style.display = 'none';
    document.querySelector('.upload-section').style.display = 'block';
});

// Utilitaires
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
