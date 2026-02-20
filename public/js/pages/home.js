import { fetchPosts } from '../api.js';
import { createPostCard } from '../components/postCard.js';

const CATEGORIES = [
  'All',
  'Programming',
  'Music',
  'Language',
  'Sports',
  'Art',
  'Academics',
  'Other',
];

let debounceTimer;

export async function renderHome(main, onCardClick) {
  main.innerHTML = `
    <div class="filter-bar">
      <input type="text" id="search-input" placeholder="Search skills or keywords" />
      <select id="category-filter">
        ${CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('')}
      </select>
      <select id="sort-filter">
        <option value="newest">Newest First</option>
        <option value="inquiries">Most Inquiries</option>
      </select>
    </div>
    <div class="post-grid" id="post-grid"></div>
  `;

  const grid = document.getElementById('post-grid');
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const sortFilter = document.getElementById('sort-filter');

  async function loadPosts() {
    const params = {};
    const search = searchInput.value.trim();
    const category = categoryFilter.value;
    const sort = sortFilter.value;
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    if (sort) params.sort = sort;

    const posts = await fetchPosts(params);
    grid.innerHTML = '';

    if (posts.length === 0) {
      grid.innerHTML = '<p class="no-posts-message">No posts found</p>';
      return;
    }

    posts.forEach((post) => {
      const card = createPostCard(post);
      card.addEventListener('click', () => onCardClick(post._id));
      grid.appendChild(card);
    });
  }

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadPosts, 300);
  });
  categoryFilter.addEventListener('change', loadPosts);
  sortFilter.addEventListener('change', loadPosts);

  await loadPosts();
}
