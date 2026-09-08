// components/user-posts-page-component.js
import { renderHeaderComponent } from "./header-component.js";
import { goToPage, user, posts as globalPosts } from "../index.js";
import { likePost, dislikePost } from "../api.js";
import { escapeHtml } from "../utils.js";

const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

function formatDate(isoString) {
  if (!isoString) return "неизвестно";
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function renderUserPostsPageComponent({ appEl, userId, posts }) {
  const userName = posts.length > 0 ? posts[0].user.name : "Пользователь";
  const userImage =
    posts.length > 0
      ? posts[0].user.imageUrl
      : "https://www.imgonline.com.ua/examples/bee-on-daisy.jpg";

  if (!posts || posts.length === 0) {
    appEl.innerHTML = `
      <div class="page-container">
        <div class="header-container"></div>
        <p style="text-align:center; margin-top:40px;">У пользователя пока нет постов</p>
      </div>
    `;
    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });
    return;
  }

  const postsHtml = posts
    .filter((post) => post && post.id)
    .map((post) => {
      const postDate = formatDate(post.createdAt);
      const isLiked = post.isLiked || false;
      const likesCount = post.likes?.length || 0;
      const userNamePost = escapeHtml(post.user?.name || "Неизвестный");
      const userImagePost =
        post.user?.imageUrl ||
        "https://www.imgonline.com.ua/examples/bee-on-daisy.jpg";
      const imageUrl = post.imageUrl || "https://via.placeholder.com/500x500?text=Нет+фото";
      const safeDescription = escapeHtml(post.description || "");

      return `
        <li class="post" data-post-id="${post.id}">
          <div class="post-header" data-user-id="${post.user?.id || ""}">
              <img src="${userImagePost}" class="post-header__user-image">
              <p class="post-header__user-name">${userNamePost}</p>
          </div>
          <div class="post-image-container">
            <img class="post-image" src="${imageUrl}">
          </div>
          <div class="post-likes">
            <button data-post-id="${post.id}" class="like-button ${isLiked ? "-active-like" : ""}">
              <img src="./assets/images/${isLiked ? "like-active.svg" : "like-not-active.svg"}">
            </button>
            <p class="post-likes-text">
              Нравится: <strong>${likesCount}</strong>
            </p>
          </div>
          <p class="post-text">
            <span class="user-name">${userNamePost}</span>
            ${safeDescription}
          </p>
          <p class="post-date">
            ${postDate}
          </p>
        </li>
      `;
    })
    .join("");

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="posts-user-header">
        <img src="${userImage}" class="posts-user-header__user-image">
        <p class="posts-user-header__user-name">${escapeHtml(userName)}</p>
      </div>
      <ul class="posts">
        ${postsHtml}
      </ul>
    </div>
  `;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage("user-posts", {
        userId: userEl.dataset.userId,
      });
    });
  }

  for (let likeButton of document.querySelectorAll(".like-button")) {
  likeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const postId = likeButton.dataset.postId;
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;

    const currentPost = posts[postIndex];
    const isLiked = currentPost.isLiked;

    const likeAction = isLiked ? dislikePost : likePost;

    likeAction({ token: getToken(), postId })
      .then((response) => {
        const updatedPost = response.post;

        posts[postIndex] = updatedPost;

        // Синхронизация с глобальным массивом
        const globalIndex = globalPosts.findIndex((p) => p.id === postId);
        if (globalIndex !== -1) {
          globalPosts[globalIndex] = updatedPost;
        }

        const likeImg = likeButton.querySelector("img");
        const likesText = likeButton
          .closest(".post-likes")
          .querySelector(".post-likes-text strong");
        const newLikesCount = updatedPost.likes.length;

        likesText.textContent = String(newLikesCount);
        if (updatedPost.isLiked) {
          likeImg.src = "./assets/images/like-active.svg";
          likeButton.classList.add("-active-like");
        } else {
          likeImg.src = "./assets/images/like-not-active.svg";
          likeButton.classList.remove("-active-like");
        }
      })
      .catch((error) => {
        console.error(error);
        alert(error.message);
      });
  });
}
}