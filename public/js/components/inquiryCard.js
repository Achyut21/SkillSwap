import { formatDate } from '../utils.js';

export function createInquiryCard(inquiry, isOwner) {
  const card = document.createElement('div');
  card.className = 'inquiry-card';

  let contactHtml = '';
  if (isOwner) {
    contactHtml = `<p class="inquiry-card-contact">${inquiry.senderContact}</p>`;
  }

  card.innerHTML = `
    <p class="inquiry-card-name">${inquiry.senderName}</p>
    ${contactHtml}
    <p class="inquiry-card-message">${inquiry.message}</p>
    <div class="inquiry-card-footer">
      <span class="inquiry-card-date">${formatDate(inquiry.createdAt)}</span>
    </div>
  `;

  return card;
}
