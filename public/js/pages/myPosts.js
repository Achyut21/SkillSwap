import { fetchPosts, deletePost } from '../api.js';
import { getUser } from '../auth.js';
import { createPostCard } from '../components/postCard.js';

export async function renderMyPosts(main, onCardClick, onEditClick) {
  main.innerHTML = `
    <div class="my-posts-header">
      <h2>My Posts</h2>
    </div>
    <div class="post-grid" id="post-grid"></div>
  `;

  const grid = document.getElementById('post-grid');
  const user = getUser();
  const allPosts = await fetchPosts();
  const myPosts = allPosts.filter((p) => p.userId === user.id);

  if (myPosts.length === 0) {
    grid.innerHTML =
      '<p class="no-posts-message">You have no posts yet. Click + to create one.</p>';
    return;
  }

  myPosts.forEach((post) => {
    const card = createPostCard(post, { showActions: true });
    card.addEventListener('click', async (e) => {
      if (e.target.classList.contains('btn-edit')) {
        e.stopPropagation();
        onEditClick(post);
        return;
      }
      if (e.target.classList.contains('btn-delete')) {
        e.stopPropagation();
        if (confirm('Delete this post?')) {
          await deletePost(post._id);
          renderMyPosts(main, onCardClick, onEditClick);
        }
        return;
      }
      onCardClick(post._id);
    });
    grid.appendChild(card);
  });
}
