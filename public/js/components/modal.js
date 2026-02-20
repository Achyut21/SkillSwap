const overlay = document.getElementById('modal-overlay');
const container = document.getElementById('modal-container');

export function openModal(contentFn) {
  container.innerHTML = '';
  const content = contentFn();
  container.appendChild(content);
  overlay.classList.remove('hidden');
}

export function closeModal() {
  overlay.classList.add('hidden');
  container.innerHTML = '';
}

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
