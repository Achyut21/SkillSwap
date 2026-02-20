import { formatDate } from '../utils.js';

export function createPostCard(post, options = {}) {
  const card = document.createElement('article');
  card.className = 'post-card';
  card.dataset.id = post._id;

  card.innerHTML = `
    <span class="badge">${post.category}</span>
    <h3 class="post-card-skill">Offering: ${post.skillOffered}</h3>
    <p class="post-card-swap">Wants to learn: ${post.skillWanted}</p>
    <div class="post-card-footer">
      <span class="post-card-meta">${post.name} · ${formatDate(post.createdAt)}</span>
      <span class="post-card-inquiries">${post.inquiryCount} inquiries</span>
    </div>
  `;

  if (options.showActions) {
    const actions = document.createElement('div');
    actions.className = 'post-card-actions';
    actions.innerHTML = `
      <button class="btn btn-secondary btn-edit" data-id="${post._id}">Edit</button>
      <button class="btn btn-danger btn-delete" data-id="${post._id}">Delete</button>
    `;
    card.appendChild(actions);
  }

  return card;
}
