// components/add-post-page-component.js
import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";

  const render = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="form">
          <h3 class="form-title">Добавить пост</h3>
          <div class="form-inputs">
            <div class="upload-image-container"></div>
            <textarea 
              id="description-input" 
              class="input textarea" 
              placeholder="Опишите ваш пост..."
              rows="4"
            ></textarea>
            <div class="form-error"></div>
            <button class="button" id="add-button">Опубликовать</button>
          </div>
        </div>
      </div>
    `;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    const uploadImageContainer = appEl.querySelector(".upload-image-container");
    if (uploadImageContainer) {
      renderUploadImageComponent({
        element: uploadImageContainer,
        onImageUrlChange(newImageUrl) {
          imageUrl = newImageUrl;
        },
      });
    }

    const descriptionInput = document.getElementById("description-input");
    const errorEl = document.querySelector(".form-error");

    document.getElementById("add-button").addEventListener("click", () => {
      errorEl.textContent = "";
      const description = descriptionInput.value.trim();

      if (!description) {
        errorEl.textContent = "Введите описание поста";
        return;
      }

      if (!imageUrl) {
        errorEl.textContent = "Загрузите фотографию";
        return;
      }

      onAddPostClick({ description, imageUrl });
    });
  };

  render();
}