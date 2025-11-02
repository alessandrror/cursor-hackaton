/**
 * Simple language detection utility
 * Detects common languages based on text patterns
 */

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'auto'

export function detectLanguage(text: string): SupportedLanguage {
  if (!text || text.trim().length === 0) {
    return 'en' // Default to English
  }

  const normalizedText = text.toLowerCase().trim()
  
  // Simplified language detection using common words and characters
  
  // Spanish detection
  const spanishWords = ['de', 'la', 'el', 'en', 'por', 'para', 'con', 'del', 'las', 'los', 'una', 'este', 'esta', 'cada', 'estudiante', 'actividad', 'evaluada', 'foro', 'individual', 'asignación', 'participar', 'documento', 'dimensión', 'política', 'fe', 'opción', 'pobres', 'experiencia', 'eclesial', 'salvador', 'centroamérica', 'mons', 'oscar', 'arnulfo', 'romero', 'cristiano', 'pensamiento', 'social', 'indicaciones', 'unidad', 'parte', 'grupal', 'cuartetos', 'tarea', 'grupo', 'trabajo', 'entregada', 'páginas', 'portada', 'carátula', 'asignatura', 'actividad', 'nómina', 'integrantes', 'orden', 'alfabético', 'apellido', 'número', 'carné', 'fecha', 'entrega', 'evidencias', 'esfuerzo', 'colaboración', 'plagio', 'copia', 'pega', 'información', 'revisar', 'indicaciones', 'rúbrica', 'integrante', 'procede', 'subir', 'formato', 'word', 'entregas', 'realizarlas', 'lunes', 'octubre', 'última', 'sábado', 'pm', 'tener', 'presente', 'entrega', 'trabajos', 'pasada', 'revisa', 'califica', 'encuentra', 'apartado', 'calificados', 'avisa', 'estudiantes', 'observaciones', 'nota', 'obtenida', 'comunicarse', 'docente', 'reclamo', 'calificado', 'conocer', 'obtenida', 'días', 'presentar', 'finalmente', 'sube', 'notas', 'portal', 'web', 'individual', 'grupal', 'condiciones', 'olvidar', 'motivo', 'elaboración', 'evitar', 'cualquier', 'tipo', 'presentarlo', 'propio', 'asignatura', 'fín', 'obtener', 'calificación', 'reglamento', 'general', 'cap', 'derechos', 'deberes', 'estudiantes', 'art', 'inciso', 'relacionada', 'tema', 'notarse', 'perspectiva', 'jóvenes', 'universitarios', 'propuesta', 'solución', 'ofrece', 'psc', 'mostrar', 'aceptable', 'cantidad', 'fuentes', 'citas', 'ordenadas', 'redactar', 'coherencia', 'ideas', 'párrafo', 'buena', 'ortografía', 'puntuación', 'lean', 'muy', 'bien', 'redacción', 'deben', 'citar', 'documentos', 'utilizados', 'cuerpo', 'siguiendo', 'normas', 'apa', 'ideas', 'encuentran', 'alguna', 'fuente', 'consultada', 'ver', 'enlaces', 'muestran', 'ejemplos', 'citar', 'según', 'normas', 'apa', 'ex-aula', 'debe', 'entregada', 'formato', 'word', 'tipo', 'letra', 'calibri', 'tamaño', 'interlineado', 'múltiple', 'breve', 'espacio', 'párrafos', 'alinear', 'izquierda', 'realiza', 'grupos', 'organizados', 'cuartetos', 'solamente', 'estudiantes', 'tienen', 'grupo', 'harán', 'individual', 'conocer', 'criterios', 'evaluación', 'deben', 'leer', 'rúbrica', 'evaluar', 'reporte', 'análisis', 'problemáticas', 'propuesta', 'solución', 'alcancen', 'buen', 'desempeño', 'final', 'desarrollador', 'desarrolladora', 'desarrollo', 'tecnología', 'tecnologías', 'frontend', 'backend', 'fullstack', 'aplicación', 'aplicaciones', 'proyecto', 'proyectos', 'empresa', 'empresas', 'cliente', 'clientes', 'equipo', 'equipos', 'colaboración', 'colaboraciones', 'implementación', 'implementaciones', 'solución', 'soluciones', 'mejora', 'mejoras', 'optimización', 'optimizaciones', 'experiencia', 'experiencias', 'profesional', 'profesionales', 'competencias', 'habilidades', 'conocimientos', 'certificaciones', 'educación', 'formación', 'académica', 'universidad', 'universidades', 'grado', 'título', 'especialización', 'curso', 'cursos', 'certificado', 'certificados', 'idioma', 'idiomas', 'español', 'inglés', 'francés', 'alemán', 'italiano', 'portugués', 'año', 'años', 'mes', 'meses', 'fecha', 'fechas', 'inicio', 'fin', 'actual', 'actualmente', 'responsabilidades', 'responsabilidad', 'logros', 'logro', 'méritos', 'mérito', 'reconocimientos', 'reconocimiento', 'herramientas', 'herramienta', 'frameworks', 'framework', 'librerías', 'librería', 'bibliotecas', 'biblioteca', 'lenguajes', 'lenguaje', 'programación', 'programador', 'programadora', 'ingeniero', 'ingeniera', 'ingeniería', 'sistemas', 'computación', 'informática', 'software', 'hardware', 'redes', 'servidores', 'bases', 'datos', 'base', 'dato', 'diseño', 'diseñador', 'diseñadora', 'interfaz', 'usuario', 'usabilidad', 'accesibilidad', 'rendimiento', 'rendimientos', 'escalabilidad', 'seguridad', 'pruebas', 'prueba', 'testing', 'desarrollo', 'desarrollos', 'mantenimiento', 'soporte', 'documentación', 'código', 'códigos', 'repositorio', 'repositorios', 'control', 'versiones', 'versión', 'git', 'github', 'gitlab', 'bitbucket', 'metodologías', 'metodología', 'ágil', 'scrum', 'kanban', 'sprint', 'sprints', 'reuniones', 'reunión', 'comunicación', 'comunicaciones', 'presentaciones', 'presentación', 'reportes', 'reporte', 'análisis', 'requisitos', 'requisito', 'planificación', 'planificaciónes', 'estimación', 'estimaciones', 'seguimiento', 'seguimientos', 'evaluación', 'evaluaciones', 'retrospectiva', 'retrospectivas', 'mejora', 'mejoras', 'continua', 'continuo', 'continuos', 'mejora', 'mejoras', 'continua', 'continuo', 'continuos']
  const spanishChars = /[ñáéíóúü]/
  
  // French detection  
  const frenchWords = ['de', 'la', 'le', 'les', 'du', 'des', 'en', 'avec', 'pour', 'que', 'comme', 'mais', 'si', 'ne', 'pas', 'très', 'plus', 'aussi', 'même', 'autre', 'tout', 'tous', 'toutes', 'rien', 'quelque', 'seulement', 'après', 'avant', 'maintenant', 'toujours', 'jamais', 'ici', 'là', 'où', 'quand', 'parce', 'comment', 'qui', 'ceux', 'est', 'sont', 'suis', 'sommes', 'a', 'ont', 'ai', 'avons', 'peut', 'peuvent', 'peux', 'pouvons', 'doit', 'doivent', 'dois', 'devons', 'fait', 'font', 'fais', 'faisons', 'dit', 'disent', 'dis', 'disons', 'vient', 'viennent', 'viens', 'venons', 'va', 'vont', 'vais', 'allons', 'sort', 'sortent', 'sors', 'sortons', 'reste', 'restent', 'sait', 'savent', 'sais', 'savons', 'voit', 'voient', 'vois', 'voyons', 'entend', 'entendent', 'entends', 'entendons', 'met', 'mettent', 'mets', 'mettons', 'apporte', 'apportent', 'cherche', 'cherchent', 'trouve', 'trouvent', 'pense', 'pensent', 'comprend', 'comprennent', 'comprends', 'comprenons', 'sent', 'sentent', 'sens', 'sentons', 'parle', 'parlent', 'travaille', 'travaillent', 'vit', 'vivent', 'vis', 'vivons', 'aide', 'aident', 'compte', 'comptent', 'appelle', 'appellent', 'porte', 'portent', 'passe', 'passent', 'suit', 'suivent', 'ouvre', 'ouvrent', 'ferme', 'ferment', 'commence', 'commencent', 'termine', 'terminent', 'besoin', 'veut', 'veulent', 'veux', 'voulons', 'plaît', 'plaisent', 'préfère', 'préfèrent', 'attend', 'attendent', 'essaie', 'essaient', 'réussit', 'réussissent', 'obtient', 'obtiennent', 'semble', 'semblent', 'devient', 'deviennent', 'signifie', 'signifient', 'inclut', 'incluent', 'contient', 'contiennent', 'représente', 'représentent', 'forme', 'forment', 'crée', 'créent', 'produit', 'produisent', 'développe', 'développent', 'établit', 'établissent', 'maintient', 'maintiennent', 'continue', 'continuent', 'change', 'changent', 'améliore', 'améliorent', 'augmente', 'augmentent', 'réduit', 'réduisent', 'diminue', 'diminuent', 'grandit', 'grandissent', 'descend', 'descendent', 'monte', 'montent', 'arrive', 'arrivent', 'entre', 'entrent', 'revient', 'reviennent', 'retourne', 'retournent', 'laisse', 'laissent', 'permet', 'permettent', 'évite', 'évitent', 'prévient', 'préviennent', 'protège', 'protègent', 'soutient', 'soutiennent', 'facilite', 'facilitent', 'complique', 'compliquent', 'difficulte', 'difficultent', 'simplifie', 'simplifient', 'aggrave', 'aggravent', 'bonjour', 'merci', 'plaît', 'excusez-moi', 'désolé', 'bonne', 'journée', 'après-midi', 'soirée', 'revoir', 'bientôt', 'plus', 'tard', 'allez-vous', 'ça', 'passe-t-il', 'bien', 'parfait', 'excellent', 'fantastique', 'génial', 'incroyable', 'merveilleux', 'formidable', 'phénoménal', 'terrible', 'horrible', 'mauvais', 'bon', 'meilleur', 'pire', 'grand', 'petit', 'haut', 'bas', 'nouveau', 'vieux', 'jeune', 'aîné', 'premier', 'deuxième', 'troisième', 'dernier', 'suivant', 'précédent', 'différent', 'égal', 'semblable', 'similaire', 'distinct', 'aucun', 'certains', 'beaucoup', 'peu', 'plusieurs', 'trop', 'assez', 'suffisant', 'nécessaire', 'possible', 'impossible', 'important', 'intéressant', 'utile', 'facile', 'difficile', 'simple', 'complexe', 'clair', 'confus', 'évident', 'sûr', 'incertain', 'libre', 'occupé', 'disponible', 'manquant', 'présent', 'absent', 'actif', 'inactif', 'ouvert', 'fermé', 'public', 'privé', 'gratuit', 'payant', 'marché', 'cher', 'rapide', 'lent', 'tôt', 'tard', 'prochain', 'loin', 'proche', 'près', 'dedans', 'dehors', 'devant', 'derrière', 'gauche', 'droite', 'nord', 'sud', 'est', 'ouest', 'centre', 'coin', 'moitié', 'partie', 'chose', 'quelqu\'un', 'personne']
  const frenchChars = /[àâäéèêëïîôöùûüÿç]/
  
  // German detection
  const germanWords = ['ist', 'eine', 'der', 'die', 'das', 'den', 'dem', 'des', 'von', 'zu', 'mit', 'für', 'dass', 'wie', 'aber', 'wenn', 'nicht', 'sehr', 'mehr', 'auch', 'gleich', 'ander', 'alle', 'alles', 'nichts', 'etwas', 'nur', 'nach', 'vor', 'jetzt', 'immer', 'nie', 'hier', 'dort', 'wo', 'wann', 'weil', 'wer', 'was', 'welche', 'sind', 'bin', 'hat', 'haben', 'habe', 'kann', 'können', 'muss', 'müssen', 'soll', 'sollen', 'darf', 'dürfen', 'wird', 'werden', 'macht', 'machen', 'mache', 'sagt', 'sagen', 'sage', 'kommt', 'kommen', 'komme', 'geht', 'gehen', 'gehe', 'bleibt', 'bleiben', 'bleibe', 'weiß', 'wissen', 'sieht', 'sehen', 'sehe', 'hört', 'hören', 'höre', 'legt', 'legen', 'lege', 'bringt', 'bringen', 'bringe', 'sucht', 'suchen', 'suche', 'findet', 'finden', 'finde', 'denkt', 'denken', 'denke', 'versteht', 'verstehen', 'verstehe', 'fühlt', 'fühlen', 'fühle', 'spricht', 'sprechen', 'spreche', 'arbeitet', 'arbeiten', 'arbeite', 'lebt', 'leben', 'lebe', 'hilft', 'helfen', 'helfe', 'zählt', 'zählen', 'zähle', 'ruft', 'rufen', 'rufe', 'trägt', 'tragen', 'trage', 'folgt', 'folgen', 'folge', 'öffnet', 'öffnen', 'öffne', 'schließt', 'schließen', 'schließe', 'beginnt', 'beginnen', 'beginne', 'endet', 'enden', 'ende', 'braucht', 'brauchen', 'brauche', 'will', 'wollen', 'mag', 'mögen', 'bevorzugt', 'bevorzugen', 'bevorzuge', 'wartet', 'warten', 'warte', 'versucht', 'versuchen', 'versuche', 'schafft', 'schaffen', 'schaffe', 'bekommt', 'bekommen', 'bekomme', 'scheint', 'scheinen', 'scheine', 'bedeutet', 'bedeuten', 'bedeute', 'enthält', 'enthalten', 'enthalte', 'stellt', 'dar', 'stelle', 'bildet', 'bilden', 'bilde', 'erstellt', 'erstellen', 'erstelle', 'produziert', 'produzieren', 'produziere', 'entwickelt', 'entwickeln', 'entwickle', 'hält', 'halten', 'halte', 'setzt', 'fort', 'setzen', 'setze', 'ändert', 'ändern', 'ändere', 'verbessert', 'verbessern', 'verbessere', 'erhöht', 'erhöhen', 'erhöhe', 'reduziert', 'reduzieren', 'reduziere', 'verringert', 'verringern', 'verringere', 'wächst', 'wachsen', 'wachse', 'fällt', 'fallen', 'falle', 'steigt', 'steigen', 'steige', 'kommt', 'an', 'kommen', 'geht', 'raus', 'gehen', 'gehe', 'geht', 'rein', 'kehrt', 'zurück', 'kehren', 'kehre', 'lässt', 'lassen', 'lasse', 'erlaubt', 'erlauben', 'erlaube', 'vermeidet', 'vermeiden', 'vermeide', 'verhindert', 'verhindern', 'verhindere', 'schützt', 'schützen', 'schütze', 'unterstützt', 'unterstützen', 'unterstütze', 'erleichtert', 'erleichtern', 'erleichtere', 'erschwert', 'erschweren', 'erschwere', 'macht', 'machen', 'mache', 'vereinfacht', 'vereinfachen', 'vereinfache', 'verschlechtert', 'verschlechtern', 'verschlechtere', 'hallo', 'danke', 'bitte', 'entschuldigung', 'tut', 'mir', 'leid', 'guten', 'morgen', 'tag', 'abend', 'wiedersehen', 'bald', 'später', 'geht', 'es', 'ist', 'los', 'gut', 'perfekt', 'ausgezeichnet', 'fantastisch', 'großartig', 'unglaublich', 'wunderbar', 'phänomenal', 'schrecklich', 'schlecht', 'besser', 'schlechter', 'groß', 'klein', 'hoch', 'niedrig', 'neu', 'alt', 'jung', 'älter', 'jünger', 'erste', 'zweite', 'dritte', 'letzte', 'nächste', 'vorherige', 'gleiche', 'anders', 'ähnlich', 'verschieden', 'anderer', 'keine', 'einige', 'viele', 'wenige', 'mehrere', 'viele', 'genug', 'ausreichend', 'notwendig', 'möglich', 'unmöglich', 'wichtig', 'interessant', 'nützlich', 'einfach', 'schwer', 'komplex', 'klar', 'verwirrend', 'offensichtlich', 'sicher', 'unsicher', 'frei', 'beschäftigt', 'verfügbar', 'fehlend', 'vorhanden', 'abwesend', 'aktiv', 'inaktiv', 'offen', 'geschlossen', 'öffentlich', 'privat', 'kostenlos', 'bezahlt', 'billig', 'teuer', 'schnell', 'langsam', 'früh', 'spät', 'nächste', 'weit', 'nah', 'drinnen', 'draußen', 'oben', 'unten', 'vorne', 'hinten', 'links', 'rechts', 'norden', 'süden', 'osten', 'westen', 'zentrum', 'ecke', 'hälfte', 'teil', 'jemand', 'niemand']
  const germanChars = /[äöüß]/
  
  // Italian detection
  const italianWords = ['è', 'una', 'il', 'la', 'lo', 'gli', 'le', 'di', 'del', 'della', 'dei', 'delle', 'in', 'con', 'per', 'che', 'come', 'ma', 'se', 'non', 'molto', 'più', 'anche', 'stesso', 'altro', 'tutto', 'tutti', 'tutte', 'niente', 'qualcosa', 'solo', 'dopo', 'prima', 'ora', 'sempre', 'mai', 'qui', 'là', 'dove', 'quando', 'perché', 'chi', 'quali', 'sono', 'ho', 'abbiamo', 'ha', 'hanno', 'hai', 'avete', 'può', 'possono', 'puoi', 'potete', 'deve', 'devono', 'devi', 'dovete', 'fa', 'fanno', 'fai', 'fate', 'dice', 'dicono', 'dici', 'dite', 'viene', 'vengono', 'vieni', 'venite', 'va', 'vanno', 'vai', 'andate', 'esce', 'escono', 'esci', 'uscite', 'rimane', 'rimangono', 'rimani', 'rimanete', 'sa', 'sanno', 'sai', 'sapete', 'vede', 'vedono', 'vedi', 'vedete', 'sente', 'sentono', 'senti', 'sentite', 'mette', 'mettiamo', 'metti', 'mettete', 'porta', 'portano', 'porti', 'portate', 'cerca', 'cercano', 'cerchi', 'cercate', 'trova', 'trovano', 'trovi', 'trovate', 'pensa', 'pensano', 'pensi', 'pensate', 'capisce', 'capiscono', 'capisci', 'capite', 'parla', 'parlano', 'parli', 'parlate', 'lavora', 'lavorano', 'lavori', 'lavorate', 'vive', 'vivono', 'vivi', 'vivete', 'aiuta', 'aiutano', 'aiuti', 'aiutate', 'conta', 'contano', 'conti', 'contate', 'chiama', 'chiamano', 'chiami', 'chiamate', 'passa', 'passano', 'passi', 'passate', 'segue', 'seguono', 'segui', 'seguite', 'apre', 'aprono', 'apri', 'aprite', 'chiude', 'chiudono', 'chiudi', 'chiudete', 'inizia', 'iniziano', 'inizi', 'iniziate', 'finisce', 'finiscono', 'finisci', 'finite', 'bisogno', 'hanno', 'hai', 'avete', 'vuole', 'vogliono', 'vuoi', 'volete', 'piace', 'piacciono', 'piaci', 'piacete', 'preferisce', 'preferiscono', 'preferisci', 'preferite', 'aspetta', 'aspettano', 'aspetti', 'aspettate', 'prova', 'provano', 'provi', 'provate', 'riesce', 'riescono', 'riesci', 'riuscite', 'ottiene', 'ottengono', 'ottieni', 'ottenete', 'sembra', 'sembrano', 'sembri', 'sembrate', 'diventa', 'diventano', 'diventi', 'diventate', 'significa', 'significano', 'significhi', 'significate', 'include', 'includono', 'includi', 'includete', 'contiene', 'contengono', 'contieni', 'contente', 'rappresenta', 'rappresentano', 'rappresenti', 'rappresentate', 'forma', 'formano', 'formi', 'formate', 'crea', 'creano', 'crei', 'create', 'produce', 'producono', 'produci', 'producete', 'sviluppa', 'sviluppano', 'sviluppi', 'sviluppate', 'stabilisce', 'stabiliscono', 'stabilisci', 'stabilite', 'mantiene', 'mantengono', 'mantieni', 'mantenete', 'continua', 'continuano', 'continui', 'continuate', 'cambia', 'cambiano', 'cambi', 'cambiate', 'migliora', 'migliorano', 'migliori', 'migliorate', 'aumenta', 'aumentano', 'aumenti', 'aumentate', 'riduce', 'riducono', 'riduci', 'riducete', 'diminuisce', 'diminuiscono', 'diminuisci', 'diminuite', 'cresce', 'crescono', 'cresci', 'crescete', 'scende', 'scendono', 'scendi', 'scendete', 'sale', 'salgo', 'salite', 'salgono', 'sali', 'arriva', 'arrivano', 'arrivi', 'arrivate', 'entra', 'entrano', 'entri', 'entrate', 'ritorna', 'ritornano', 'ritorni', 'ritornate', 'torna', 'tornano', 'torni', 'tornate', 'lascia', 'lasciano', 'lasci', 'lasciate', 'permette', 'permettono', 'permetti', 'permettete', 'evita', 'evitano', 'eviti', 'evitate', 'previene', 'prevengono', 'previeni', 'prevenite', 'protegge', 'proteggono', 'proteggi', 'proteggete', 'sostiene', 'sostengono', 'sostieni', 'sostenete', 'facilita', 'facilitano', 'faciliti', 'facilitate', 'complica', 'complicano', 'complichi', 'complicate', 'rende', 'difficile', 'rendono', 'rendi', 'rendete', 'semplifica', 'semplificano', 'semplifichi', 'semplificate', 'peggiora', 'peggiorano', 'peggiori', 'peggiorate', 'ciao', 'grazie', 'favore', 'scusi', 'dispiace', 'buongiorno', 'pomeriggio', 'buonasera', 'arrivederci', 'presto', 'vediamo', 'va', 'stai', 'succede', 'bene', 'perfetto', 'eccellente', 'fantastico', 'incredibile', 'meraviglioso', 'stupendo', 'fenomenale', 'terribile', 'orribile', 'cattivo', 'buono', 'migliore', 'peggiore', 'grande', 'piccolo', 'alto', 'basso', 'nuovo', 'vecchio', 'giovane', 'anziano', 'giovane', 'primo', 'secondo', 'terzo', 'ultimo', 'prossimo', 'precedente', 'diverso', 'uguale', 'simile', 'diverso', 'altro', 'stesso', 'tutti', 'nessuno', 'alcuni', 'molti', 'pochi', 'diversi', 'troppi', 'abbastanza', 'sufficiente', 'necessario', 'possibile', 'impossibile', 'importante', 'interessante', 'utile', 'facile', 'difficile', 'semplice', 'complesso', 'chiaro', 'confuso', 'ovvio', 'sicuro', 'insicuro', 'libero', 'occupato', 'disponibile', 'mancante', 'presente', 'assente', 'attivo', 'inattivo', 'aperto', 'chiuso', 'pubblico', 'privato', 'gratuito', 'pagamento', 'economico', 'caro', 'veloce', 'lento', 'presto', 'tardi', 'prossimo', 'lontano', 'vicino', 'lontano', 'vicino', 'dentro', 'fuori', 'sopra', 'sotto', 'davanti', 'dietro', 'sinistra', 'destra', 'nord', 'sud', 'est', 'ovest', 'centro', 'angolo', 'metà', 'parte', 'qualcuno', 'nessuno']
  const italianChars = /[àèéìíîòóù]/
  
  // Portuguese detection
  const portugueseWords = ['é', 'uma', 'o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'em', 'com', 'por', 'para', 'que', 'como', 'mas', 'se', 'não', 'muito', 'mais', 'também', 'mesmo', 'outro', 'todo', 'todos', 'todas', 'nada', 'algo', 'só', 'depois', 'antes', 'agora', 'sempre', 'nunca', 'aqui', 'ali', 'onde', 'quando', 'porque', 'quem', 'quais', 'são', 'sou', 'somos', 'tem', 'têm', 'tenho', 'temos', 'pode', 'podem', 'posso', 'podemos', 'deve', 'devem', 'devo', 'devemos', 'faz', 'fazem', 'faço', 'fazemos', 'diz', 'dizem', 'digo', 'dizemos', 'vem', 'vêm', 'venho', 'vimos', 'vai', 'vão', 'vou', 'vamos', 'sai', 'saem', 'saio', 'saímos', 'fica', 'ficam', 'fico', 'ficamos', 'sabe', 'sabem', 'sei', 'sabemos', 'vê', 'veem', 'vejo', 'vemos', 'ouve', 'ouvem', 'ouço', 'ouvimos', 'põe', 'põem', 'ponho', 'pomos', 'traz', 'trazem', 'trago', 'trazemos', 'procura', 'procuram', 'procuro', 'procuramos', 'encontra', 'encontram', 'encontro', 'encontramos', 'pensa', 'pensam', 'penso', 'pensamos', 'entende', 'entendem', 'entendo', 'entendemos', 'sente', 'sentem', 'sinto', 'sentimos', 'fala', 'falam', 'falo', 'falamos', 'trabalha', 'trabalham', 'trabalho', 'trabalhamos', 'vive', 'vivem', 'vivo', 'vivemos', 'ajuda', 'ajudam', 'ajudo', 'ajudamos', 'conta', 'contam', 'conto', 'contamos', 'chama', 'chamam', 'chamo', 'chamamos', 'leva', 'levam', 'levo', 'levamos', 'passa', 'passam', 'passo', 'passamos', 'segue', 'seguem', 'sigo', 'seguimos', 'abre', 'abrem', 'abro', 'abrimos', 'fecha', 'fecham', 'feicho', 'fechamos', 'começa', 'começam', 'começo', 'começamos', 'termina', 'terminam', 'termino', 'terminamos', 'precisa', 'precisam', 'preciso', 'precisamos', 'quer', 'querem', 'quero', 'queremos', 'gosta', 'gostam', 'gosto', 'gostamos', 'prefere', 'preferem', 'prefiro', 'preferimos', 'espera', 'esperam', 'espero', 'esperamos', 'tenta', 'tentam', 'tento', 'tentamos', 'consegue', 'conseguem', 'conseguo', 'conseguimos', 'parece', 'parecem', 'pareço', 'parecemos', 'torna-se', 'tornam-se', 'torno-me', 'tornamo-nos', 'significa', 'significam', 'significo', 'significamos', 'inclui', 'incluem', 'incluo', 'incluímos', 'contém', 'contêm', 'contenho', 'contemos', 'representa', 'representam', 'represento', 'representamos', 'forma', 'formam', 'formo', 'formamos', 'cria', 'criam', 'crio', 'criamos', 'produz', 'produzem', 'produzo', 'produzimos', 'desenvolve', 'desenvolvem', 'desenvolvo', 'desenvolvemos', 'estabelece', 'estabelecem', 'estabeleço', 'estabelecemos', 'mantém', 'mantêm', 'mantuho', 'mantemos', 'continua', 'continuam', 'continuo', 'continuamos', 'muda', 'mudam', 'mudo', 'mudamos', 'melhora', 'melhoram', 'melhoro', 'melhoramos', 'aumenta', 'aumentam', 'aumento', 'aumentamos', 'reduz', 'reduzem', 'reduzo', 'reduzimos', 'diminui', 'diminuem', 'diminuo', 'diminuimos', 'cresce', 'crescem', 'cresço', 'crescemos', 'desce', 'descem', 'desço', 'descemos', 'sobe', 'sobem', 'subo', 'subimos', 'chega', 'chegam', 'chego', 'chegamos', 'entra', 'entram', 'entro', 'entramos', 'volta', 'voltam', 'volto', 'voltamos', 'retorna', 'retornam', 'retorno', 'retornamos', 'deixa', 'deixam', 'deixo', 'deixamos', 'permite', 'permitem', 'permito', 'permitimos', 'evita', 'evitam', 'evito', 'evitamos', 'previne', 'previnem', 'prevenho', 'prevenimos', 'protege', 'protegem', 'protejo', 'protegemos', 'apoia', 'apóiam', 'apóio', 'apóiamos', 'facilita', 'facilitam', 'facilito', 'facilitamos', 'complica', 'complicam', 'complico', 'complicamos', 'dificulta', 'dificultam', 'dificulto', 'dificultamos', 'simplifica', 'simplificam', 'simplifico', 'simplificamos', 'piora', 'pioram', 'piro', 'pioramos', 'olá', 'obrigado', 'favor', 'desculpe', 'sinto', 'muito', 'dia', 'tarde', 'noite', 'tchau', 'até', 'logo', 'vemos', 'vai', 'acontece', 'bem', 'perfeito', 'excelente', 'fantástico', 'incrível', 'maravilhoso', 'estupendo', 'fenomenal', 'terrível', 'horrível', 'ruim', 'melhor', 'pior', 'grande', 'pequeno', 'alto', 'baixo', 'novo', 'velho', 'jovem', 'velho', 'jovem', 'primeiro', 'segundo', 'terceiro', 'último', 'próximo', 'anterior', 'diferente', 'igual', 'similar', 'diferente', 'outro', 'mesmo', 'nenhum', 'alguns', 'muitos', 'poucos', 'vários', 'demais', 'bastante', 'suficiente', 'necessário', 'possível', 'impossível', 'importante', 'interessante', 'útil', 'fácil', 'difícil', 'simples', 'complexo', 'claro', 'confuso', 'óbvio', 'certo', 'incerto', 'livre', 'ocupado', 'disponível', 'faltando', 'presente', 'ausente', 'ativo', 'inativo', 'aberto', 'fechado', 'público', 'privado', 'gratuito', 'pago', 'barato', 'caro', 'rápido', 'lento', 'cedo', 'tarde', 'próximo', 'longe', 'perto', 'longe', 'perto', 'dentro', 'fora', 'acima', 'abaixo', 'frente', 'atrás', 'esquerda', 'direita', 'norte', 'sul', 'leste', 'oeste', 'centro', 'canto', 'metade', 'parte', 'alguém', 'ninguém']
  const portugueseChars = /[ãõç]/

  // Count matches for each language
  let spanishScore = 0
  let frenchScore = 0
  let germanScore = 0
  let italianScore = 0
  let portugueseScore = 0

  // Check Spanish patterns
  // Spanish-specific words that don't exist in Portuguese (containing ñ or unique Spanish forms)
  const spanishSpecificWords = ['año', 'años', 'español', 'española', 'diseño', 'diseñador', 'diseñadora', 'tecnología', 'tecnologías', 'programación', 'programador', 'programadora', 'ingeniería', 'informática', 'educación', 'formación', 'certificación', 'certificaciones', 'universidad', 'universidades', 'grado', 'título', 'especialización', 'curso', 'cursos', 'certificado', 'certificados', 'idioma', 'idiomas', 'inglés', 'francés', 'alemán', 'italiano', 'portugués', 'mes', 'meses', 'fecha', 'fechas', 'inicio', 'fin', 'actual', 'actualmente', 'responsabilidades', 'responsabilidad', 'logros', 'logro', 'méritos', 'mérito', 'reconocimientos', 'reconocimiento', 'herramientas', 'herramienta', 'frameworks', 'framework', 'librerías', 'librería', 'bibliotecas', 'biblioteca', 'lenguajes', 'lenguaje', 'sistemas', 'computación', 'redes', 'servidores', 'bases', 'datos', 'base', 'dato', 'usuario', 'usabilidad', 'accesibilidad', 'rendimiento', 'rendimientos', 'escalabilidad', 'seguridad', 'pruebas', 'prueba', 'testing', 'desarrollos', 'mantenimiento', 'soporte', 'documentación', 'código', 'códigos', 'repositorio', 'repositorios', 'control', 'versiones', 'versión', 'git', 'github', 'gitlab', 'bitbucket', 'metodologías', 'metodología', 'ágil', 'scrum', 'kanban', 'sprint', 'sprints', 'reuniones', 'reunión', 'comunicación', 'comunicaciones', 'presentaciones', 'presentación', 'reportes', 'reporte', 'análisis', 'requisitos', 'requisito', 'planificación', 'planificaciónes', 'estimación', 'estimaciones', 'seguimiento', 'seguimientos', 'evaluación', 'evaluaciones', 'retrospectiva', 'retrospectivas']
  
  for (const word of spanishWords) {
    const regex = new RegExp('\\b' + word + '\\b', 'g')
    const matches = normalizedText.match(regex)
    if (matches) {
      // Give extra weight to Spanish-specific words
      if (spanishSpecificWords.includes(word)) {
        spanishScore += matches.length * 2
      } else {
        spanishScore += matches.length
      }
    }
  }
  
  // Check for Spanish-specific character "ñ" (unique to Spanish)
  if (/ñ/.test(text)) {
    spanishScore += 10 // Strong boost for ñ character
  }
  
  // Boost for other Spanish characters
  if (spanishChars.test(text)) {
    spanishScore += 5
  }
  
  // Penalize Portuguese if Spanish indicators are present
  if (/ñ/.test(text)) {
    portugueseScore = Math.max(0, portugueseScore - 10) // Strong penalty if ñ is present
  }

  // Check French patterns
  for (const word of frenchWords) {
    const regex = new RegExp('\\b' + word + '\\b', 'g')
    const matches = normalizedText.match(regex)
    if (matches) {
      frenchScore += matches.length
    }
  }
  if (frenchChars.test(text)) {
    frenchScore += 5 // Boost score for French characters
  }

  // Check German patterns
  for (const word of germanWords) {
    const regex = new RegExp('\\b' + word + '\\b', 'g')
    const matches = normalizedText.match(regex)
    if (matches) {
      germanScore += matches.length
    }
  }
  if (germanChars.test(text)) {
    germanScore += 5 // Boost score for German characters
  }

  // Check Italian patterns
  for (const word of italianWords) {
    const regex = new RegExp('\\b' + word + '\\b', 'g')
    const matches = normalizedText.match(regex)
    if (matches) {
      italianScore += matches.length
    }
  }
  if (italianChars.test(text)) {
    italianScore += 5 // Boost score for Italian characters
  }

  // Check Portuguese patterns
  // Portuguese-specific words that don't exist in Spanish
  const portugueseSpecificWords = ['você', 'vocês', 'não', 'também']
  
  for (const word of portugueseWords) {
    const regex = new RegExp('\\b' + word + '\\b', 'g')
    const matches = normalizedText.match(regex)
    if (matches) {
      // Give extra weight to Portuguese-specific words
      if (portugueseSpecificWords.includes(word)) {
        portugueseScore += matches.length * 2
      } else {
        portugueseScore += matches.length
      }
    }
  }
  
  // Check for Portuguese-specific characters (ã, õ, ç)
  if (/[ãõ]/.test(text)) {
    portugueseScore += 10 // Strong boost for Portuguese-specific characters
  }
  
  if (portugueseChars.test(text)) {
    portugueseScore += 5 // Boost score for Portuguese characters
  }

  // Find the language with the highest score
  const scores = {
    es: spanishScore,
    fr: frenchScore,
    de: germanScore,
    it: italianScore,
    pt: portugueseScore,
  }

  const maxScore = Math.max(...Object.values(scores))
  
  // If no significant patterns found, default to English
  if (maxScore < 5) {
    return 'en'
  }

  // Return the language with the highest score
  const detectedLanguage = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as SupportedLanguage
  
  return detectedLanguage || 'en'
}

export function getLanguageName(language: SupportedLanguage): string {
  const languageNames: Record<SupportedLanguage, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French', 
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    auto: 'Auto-detect',
  }
  
  return languageNames[language] || 'English'
}