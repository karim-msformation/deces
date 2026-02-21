document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const resultsContainer = document.getElementById('results-container');
  const messageEl = document.getElementById('message');

  function showMessage(text) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.style.display = 'block';
  }

  function clearMessage() {
    if (!messageEl) return;
    messageEl.textContent = '';
    messageEl.style.display = 'none';
  }

  function renderResults(results) {
    resultsContainer.innerHTML = '';

    if (!results || results.length === 0) {
      showMessage('Aucun résultat trouvé.');
      return;
    }

    results.forEach((person, index) => {
      const item = document.createElement('div');
      item.className = 'result-item';

      const nom = `${person.name?.last || ''}`.trim();
      const prenom = `${person.name?.first || ''}`.trim();
      const fullName = [nom, prenom].filter(Boolean).join(' ');

      const birthDate = person.birth?.date || '';
      const birthPlace = person.birth?.location?.city || '';
      const deathDate = person.death?.date || '';
      const deathPlace = person.death?.location?.city || '';

      const titleLink = document.createElement('a');
      // On passe l'index dans l'URL
      titleLink.href = `detail.html?index=${index}`;
      titleLink.textContent = fullName || '(Nom inconnu)';

      const meta = document.createElement('div');
      meta.className = 'result-meta';
      meta.textContent = [
        birthDate ? `Né(e) le ${birthDate}` : '',
        birthPlace ? `à ${birthPlace}` : '',
        deathDate ? `Décès le ${deathDate}` : '',
        deathPlace ? `à ${deathPlace}` : ''
      ].filter(Boolean).join(' · ');

      item.appendChild(titleLink);
      if (meta.textContent) {
        item.appendChild(meta);
      }

      resultsContainer.appendChild(item);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();
    resultsContainer.innerHTML = '';

    const nom = document.getElementById('nom').value.trim();
    const prenom = document.getElementById('prenom').value.trim();
    const datenaissance = document.getElementById('datenaissance').value;
    const lieunaissance = document.getElementById('lieunaissance').value.trim();

    if (!nom && !prenom) {
      showMessage('Veuillez saisir au moins un nom ou un prénom.');
      return;
    }

    const params = new URLSearchParams();
    if (nom) params.set('nom', nom);
    if (prenom) params.set('prenom', prenom);
    if (datenaissance) params.set('datenaissance', datenaissance);
    if (lieunaissance) params.set('lieunaissance', lieunaissance);

    try {
      showMessage('Recherche en cours...');
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la recherche.');
      }

      clearMessage();

      // On garde les résultats en mémoire de session
      sessionStorage.setItem('lastSearchResults', JSON.stringify(data.results));

      renderResults(data.results);
    } catch (err) {
      console.error(err);
      showMessage('Erreur lors de la recherche. Veuillez réessayer.');
    }
  });
});
