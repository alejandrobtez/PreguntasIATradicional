// Base de conocimiento cargada desde el JSON
let knowledgeBase = [];

// Cargar preguntas y respuestas una sola vez
fetch("./pokemon.json")
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(data => {
    knowledgeBase = data;
    console.log(`✅ Cargados ${data.length} preguntas de Pokémon`);
  })
  .catch(error => {
    console.error('❌ Error cargando pokemon.json:', error);
    showAnswer("❌ Error al cargar pokemon.json. Revisa F12 → Console.");
  });

/**
 * Normaliza el texto: minúsculas, sin tildes, sin signos raros
 */
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "");
}

// Busca la mejor coincidencia en la base de conocimiento
function findBestMatch(userQuestionRaw) {
  const query = normalize(userQuestionRaw).trim();
  if (!query || !knowledgeBase.length) return null;

  // 1) Coincidencia exacta
  let exact = knowledgeBase.find(item =>
    normalize(item.question) === query
  );
  if (exact) return exact;

  // 2) Coincidencia por inclusión de frase
  let partial = knowledgeBase.find(item =>
    normalize(item.question).includes(query)
  );
  if (partial) return partial;

  // 3) Coincidencia por palabras sueltas con puntuación
  const words = query.split(/\s+/).filter(w => w.length > 2);
  let bestItem = null;
  let bestScore = 0;

  knowledgeBase.forEach(item => {
    const q = normalize(item.question);
    let score = 0;

    words.forEach(w => {
      if (q.includes(w)) score++;
    });

    score = score / (words.length || 1); // 0..1

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  });

  // Umbral mínimo
  if (bestScore >= 0.3) return bestItem;
  return null;
}

/**
 * Maneja la pregunta del usuario
 */
function askQuestion() {
  const input = document.getElementById("questionInput");
  const userQuestion = input.value;

  if (!userQuestion.trim()) {
    showAnswer("Escribe una pregunta sobre Pokémon (1ª generación).");
    return;
  }

  const match = findBestMatch(userQuestion);

  if (match) {
    showAnswer(match.answer);
  } else {
    showAnswer("No encontré una respuesta para esa pregunta sobre Pokémon. Intenta con otras palabras.");
  }
}

/**
 * Muestra la respuesta con animación
 */
function showAnswer(text) {
  const answerBox = document.getElementById("answerBox");

  answerBox.textContent = text;
  answerBox.classList.remove("hidden");
  answerBox.classList.remove("show");

  // Forzar repaint para que la animación se reinicie
  void answerBox.offsetWidth;

  answerBox.classList.add("show");
}

// Event listeners (esperar a que el DOM esté listo)
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("askBtn").addEventListener("click", askQuestion);
  document.getElementById("questionInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      askQuestion();
    }
  });
});
