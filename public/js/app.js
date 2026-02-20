import { checkAuth, getUser, saveAuth, logout } from './auth.js';
import {
  fetchPost,
  fetchInquiries,
  createPost,
  updatePost,
  createInquiry,
  deletePost,
  signup,
  login,
} from './api.js';
import { openModal, closeModal } from './components/modal.js';
import { createInquiryCard } from './components/inquiryCard.js';
import { renderHome } from './pages/home.js';
import { renderMyPosts } from './pages/myPosts.js';
import { formatDate } from './utils.js';

const main = document.getElementById('main-content');
const navRight = document.getElementById('nav-right');
const logoLink = document.getElementById('logo-link');
const createPostBtn = document.getElementById('create-post-btn');

const CATEGORIES = [
  'Programming',
  'Music',
  'Language',
  'Sports',
  'Art',
  'Academics',
  'Other',
];

function updateNav() {
  const user = getUser();
  if (user) {
    navRight.innerHTML = `
      <span class="nav-user-name">${user.name}</span>
      <button class="btn btn-secondary" id="my-posts-btn">My Posts</button>
      <button class="btn btn-secondary" id="logout-btn">Log Out</button>
    `;
    document
      .getElementById('my-posts-btn')
      .addEventListener('click', showMyPosts);
    document
      .getElementById('logout-btn')
      .addEventListener('click', handleLogout);
    createPostBtn.classList.remove('hidden');
  } else {
    navRight.innerHTML = `
      <button class="btn btn-secondary" id="login-btn">Log In</button>
      <button class="btn btn-primary" id="signup-btn">Sign Up</button>
    `;
    document
      .getElementById('login-btn')
      .addEventListener('click', () => showAuthModal('login'));
    document
      .getElementById('signup-btn')
      .addEventListener('click', () => showAuthModal('signup'));
    createPostBtn.classList.add('hidden');
  }
}

function handleLogout() {
  logout();
  updateNav();
  showHome();
}

async function showHome() {
  await renderHome(main, showPostDetail);
}

async function showMyPosts() {
  await renderMyPosts(main, showPostDetail, showEditPostModal);
}

async function showPostDetail(postId) {
  const post = await fetchPost(postId);
  const inquiries = await fetchInquiries(postId);
  const user = getUser();
  const isOwner = user && user.id === post.userId;

  openModal(() => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Post Details</h2>
        <button class="modal-close" id="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <span class="badge">${post.category}</span>
        <p><strong>Offering:</strong> ${post.skillOffered}</p>
        <p><strong>Wants to Learn:</strong> ${post.skillWanted}</p>
        <p><strong>Description:</strong> ${post.description}</p>
        <p><strong>Posted by:</strong> ${post.name} on ${formatDate(post.createdAt)}</p>
        <div class="modal-tags">
          ${(post.tags || []).map((t) => `<span class="badge">${t}</span>`).join('')}
        </div>
      </div>
    `;

    div.querySelector('#close-modal').addEventListener('click', closeModal);

    // Inquiries section
    if (inquiries.length > 0) {
      const section = document.createElement('div');
      section.innerHTML = `<h3 class="modal-section-title">Inquiries (${inquiries.length})</h3>`;
      inquiries.forEach((inq) => {
        section.appendChild(createInquiryCard(inq, isOwner));
      });
      div.appendChild(section);
    }

    // Owner actions or inquiry form
    if (isOwner) {
      const actions = document.createElement('div');
      actions.className = 'form-actions';
      actions.innerHTML = `
        <button class="btn btn-secondary" id="modal-edit-btn">Edit Post</button>
        <button class="btn btn-danger" id="modal-delete-btn">Delete Post</button>
      `;
      div.appendChild(actions);
      actions.querySelector('#modal-edit-btn').addEventListener('click', () => {
        closeModal();
        showEditPostModal(post);
      });
      actions
        .querySelector('#modal-delete-btn')
        .addEventListener('click', async () => {
          if (confirm('Delete this post?')) {
            await deletePost(post._id);
            closeModal();
            showHome();
          }
        });
    } else if (user) {
      const form = document.createElement('div');
      form.innerHTML = `
        <h3 class="modal-section-title">Send an Inquiry</h3>
        <div class="form-group">
          <label for="inquiry-name">Your Name</label>
          <input type="text" id="inquiry-name" value="${user.name}" readonly />
        </div>
        <div class="form-group">
          <label for="inquiry-contact">Your Contact</label>
          <input type="text" id="inquiry-contact" value="${user.email}" />
        </div>
        <div class="form-group">
          <label for="inquiry-message">Message</label>
          <textarea id="inquiry-message" placeholder="Introduce yourself and what you can offer"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" id="send-inquiry-btn">Send Inquiry</button>
        </div>
      `;
      div.appendChild(form);
      form
        .querySelector('#send-inquiry-btn')
        .addEventListener('click', async () => {
          const message = document
            .getElementById('inquiry-message')
            .value.trim();
          const senderContact = document
            .getElementById('inquiry-contact')
            .value.trim();
          if (!message) return;
          await createInquiry(post._id, { message, senderContact });
          closeModal();
          showPostDetail(postId);
        });
    } else {
      const prompt = document.createElement('p');
      prompt.className = 'modal-login-prompt';
      prompt.textContent = 'Log in to send an inquiry';
      div.appendChild(prompt);
    }

    return div;
  });
}

// Auth modal
function showAuthModal(tab) {
  openModal(() => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Welcome</h2>
        <button class="modal-close" id="close-modal">&times;</button>
      </div>
      <div class="auth-tabs">
        <button class="auth-tab ${tab === 'login' ? 'active' : ''}" data-tab="login">Log In</button>
        <button class="auth-tab ${tab === 'signup' ? 'active' : ''}" data-tab="signup">Sign Up</button>
      </div>
      <div id="auth-error" class="auth-error hidden"></div>
      <div id="auth-form-container"></div>
    `;

    div.querySelector('#close-modal').addEventListener('click', closeModal);

    const tabs = div.querySelectorAll('.auth-tab');
    tabs.forEach((t) => {
      t.addEventListener('click', () => {
        tabs.forEach((x) => x.classList.remove('active'));
        t.classList.add('active');
        renderAuthForm(div, t.dataset.tab);
      });
    });

    renderAuthForm(div, tab);
    return div;
  });
}

function renderAuthForm(parent, tab) {
  const container = parent.querySelector('#auth-form-container');
  const errorEl = parent.querySelector('#auth-error');
  errorEl.classList.add('hidden');

  if (tab === 'login') {
    container.innerHTML = `
      <div class="form-group">
        <label for="auth-email">Email</label>
        <input type="email" id="auth-email" />
      </div>
      <div class="form-group">
        <label for="auth-password">Password</label>
        <input type="password" id="auth-password" />
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" id="auth-submit">Log In</button>
      </div>
    `;
    container
      .querySelector('#auth-submit')
      .addEventListener('click', async () => {
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const result = await login({ email, password });
        if (result.ok) {
          saveAuth(result.data.token, result.data.user);
          closeModal();
          updateNav();
          showHome();
        } else {
          errorEl.textContent = result.data.error;
          errorEl.classList.remove('hidden');
        }
      });
  } else {
    container.innerHTML = `
      <div class="form-group">
        <label for="auth-name">Name</label>
        <input type="text" id="auth-name" />
      </div>
      <div class="form-group">
        <label for="auth-email">Email</label>
        <input type="email" id="auth-email" />
      </div>
      <div class="form-group">
        <label for="auth-password">Password</label>
        <input type="password" id="auth-password" />
      </div>
      <div class="form-group">
        <label for="auth-confirm">Confirm Password</label>
        <input type="password" id="auth-confirm" />
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" id="auth-submit">Sign Up</button>
      </div>
    `;
    container
      .querySelector('#auth-submit')
      .addEventListener('click', async () => {
        const name = document.getElementById('auth-name').value.trim();
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const confirm = document.getElementById('auth-confirm').value;

        if (password !== confirm) {
          errorEl.textContent = 'Passwords do not match';
          errorEl.classList.remove('hidden');
          return;
        }

        const result = await signup({ name, email, password });
        if (result.ok) {
          saveAuth(result.data.token, result.data.user);
          closeModal();
          updateNav();
          showHome();
        } else {
          errorEl.textContent = result.data.error;
          errorEl.classList.remove('hidden');
        }
      });
  }
}

// Create post modal
function showCreatePostModal() {
  showPostFormModal('Create Post', {}, async (data) => {
    await createPost(data);
  });
}

function showEditPostModal(post) {
  showPostFormModal('Edit Post', post, async (data) => {
    await updatePost(post._id, data);
  });
}

function showPostFormModal(title, existing, onSubmit) {
  openModal(() => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="modal-close" id="close-modal">&times;</button>
      </div>
      <div class="form-group">
        <label for="post-offered">Skill You Offer</label>
        <input type="text" id="post-offered" value="${existing.skillOffered || ''}" />
      </div>
      <div class="form-group">
        <label for="post-wanted">Skill You Want</label>
        <input type="text" id="post-wanted" value="${existing.skillWanted || ''}" />
      </div>
      <div class="form-group">
        <label for="post-category">Category</label>
        <select id="post-category">
          ${CATEGORIES.map(
            (c) =>
              `<option value="${c}" ${c === existing.category ? 'selected' : ''}>${c}</option>`,
          ).join('')}
        </select>
      </div>
      <div class="form-group">
        <label for="post-description">Description</label>
        <textarea id="post-description">${existing.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label for="post-tags">Tags (comma separated)</label>
        <input type="text" id="post-tags" value="${(existing.tags || []).join(', ')}" />
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" id="cancel-post">Cancel</button>
        <button class="btn btn-primary" id="submit-post">Save</button>
      </div>
    `;

    div.querySelector('#close-modal').addEventListener('click', closeModal);
    div.querySelector('#cancel-post').addEventListener('click', closeModal);
    div.querySelector('#submit-post').addEventListener('click', async () => {
      const data = {
        skillOffered: document.getElementById('post-offered').value.trim(),
        skillWanted: document.getElementById('post-wanted').value.trim(),
        category: document.getElementById('post-category').value,
        description: document.getElementById('post-description').value.trim(),
        tags: document
          .getElementById('post-tags')
          .value.split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (!data.skillOffered || !data.skillWanted || !data.description) return;
      await onSubmit(data);
      closeModal();
      showHome();
    });

    return div;
  });
}

// Init
async function init() {
  await checkAuth();
  updateNav();
  showHome();

  logoLink.addEventListener('click', (e) => {
    e.preventDefault();
    showHome();
  });

  createPostBtn.addEventListener('click', showCreatePostModal);
}

init();
