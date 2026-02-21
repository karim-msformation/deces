document.addEventListener('DOMContentLoaded', () => {
  loadDetail();
});

const detailContainer = document.getElementById('detail-container');
const messageEl = document.getElementById('detail-message');
const headerNameEl = document.getElementById('deceased-name');
const headerDatesEl = document.getElementById('deceased-dates');

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

function getIndexFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const indexStr = params.get('index');
  if (indexStr === null) return null;
  const idx = Number.parseInt(indexStr, 10);
  return Number.isNaN(idx) ? null : idx;
}

/**
 * Normalise une date venant de matchID :
 * - "YYYYMMDD" -> "YYYY-MM-DD"
 * - "YYYY-MM-DD" -> inchangé
 * - autre format -> renvoyé tel quel
 */
function normalizeIsoDate(str) {
  if (!str) return null;
  const s = String(str).trim();
  if (/^\d{8}$/.test(s)) {
    // 19480805 -> 1948-08-05
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }
  return s;
}

// Formate "YYYY-MM-DD" ou "YYYYMMDD" -> "DD/MM/YYYY"
function formatDateFr(raw) {
  const iso = normalizeIsoDate(raw);
  if (!iso) return '—';
  const parts = iso.split('-');
  if (parts.length !== 3) return raw || '—';
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

// Calcule l'âge au décès en années pleines
function computeAgeAtDeath(birthRaw, deathRaw) {
  const birthIso = normalizeIsoDate(birthRaw);
  const deathIso = normalizeIsoDate(deathRaw);
  if (!birthIso || !deathIso) return null;

  const birth = new Date(birthIso);
  const death = new Date(deathIso);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(death.getTime())) return null;

  let age = death.getFullYear() - birth.getFullYear();
  const deathMonth = death.getMonth();
  const deathDay = death.getDate();
  const birthMonth = birth.getMonth();
  const birthDay = birth.getDate();

  if (
    deathMonth < birthMonth ||
    (deathMonth === birthMonth && deathDay < birthDay)
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

function renderPerson(person) {
  detailContainer.innerHTML = '';

  if (!person) {
    showMessage('Fiche introuvable.');
    return;
  }

  const nom = `${person.name?.last || ''}`.trim();
  const prenom = `${person.name?.first || ''}`.trim();
  const fullName = [nom, prenom].filter(Boolean).join(' ') || '(Nom inconnu)';

  const birthRaw = person.birth?.date || null;   // ex: "19480805"
  const deathRaw = person.death?.date || null;   // ex: "20011216"

  const birthDateFr = birthRaw ? formatDateFr(birthRaw) : '—';
  const deathDateFr = deathRaw ? formatDateFr(deathRaw) : '—';
  const ageAtDeath = computeAgeAtDeath(birthRaw, deathRaw);

  // Remplir la carte du haut
  if (headerNameEl) {
    headerNameEl.textContent = fullName;
  }

  if (headerDatesEl) {
    let text = '';

    if (birthRaw) {
      text += `Né(e) le ${birthDateFr}`;
    }

    if (deathRaw) {
      if (text) text += ' - ';
      text += `Décédé(e) le ${deathDateFr}`;
      if (ageAtDeath !== null) {
        text += ` (${ageAtDeath} ans)`;
      }
    }

    headerDatesEl.textContent = text || '';
  }

  // Construire le tableau de détails
  const table = document.createElement('table');
  table.className = 'detail-table';

  const rows = [
    ['Sexe', person.sex === 'M' ? 'Homme' : person.sex === 'F' ? 'Femme' : '—'],
    ['Nom', nom || '—'],
    ['Prénom(s)', prenom || '—'],
    ['Date de naissance', birthDateFr],
    [
      'Lieu de naissance',
      person.birth?.location
        ? [
            person.birth.location.city,
            person.birth.location.country
          ].filter(Boolean).join(' - ') || '—'
        : '—'
    ],
    [
      'Date de décès',
      deathRaw
        ? ageAtDeath !== null
          ? `${deathDateFr} (${ageAtDeath} ans)`
          : deathDateFr
        : '—'
    ],
    [
      'Lieu de décès',
      person.death?.location
        ? person.death.location.city || '—'
        : '—'
    ],
    ['Acte de décès', person.death?.certificateId || '—'],
    ['Succession', '—']
  ];

  rows.forEach(([label, value]) => {
    const tr = document.createElement('tr');
    const tdLabel = document.createElement('td');
    const tdValue = document.createElement('td');

    tdLabel.textContent = label;
    tdValue.textContent = value;

    tr.appendChild(tdLabel);
    tr.appendChild(tdValue);
    table.appendChild(tr);
  });

  detailContainer.appendChild(table);
}

function loadDetail() {
  const index = getIndexFromQuery();
  if (index === null) {
    showMessage('Paramètre "index" manquant ou invalide dans l’URL.');
    return;
  }

  const stored = sessionStorage.getItem('lastSearchResults');
  if (!stored) {
    showMessage('Aucun résultat en mémoire. Veuillez relancer une recherche.');
    return;
  }

  let results;
  try {
    results = JSON.parse(stored);
  } catch (e) {
    console.error('Erreur parse lastSearchResults:', e);
    showMessage('Erreur interne. Veuillez relancer une recherche.');
    return;
  }

  const person = results[index];
  if (!person) {
    showMessage('Fiche introuvable pour cet index.');
    return;
  }

  clearMessage();
  renderPerson(person);
}
