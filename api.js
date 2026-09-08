// api.js
const personalKey = "maxim-fedoretc";
const baseHost = "https://webdev-hw-api.vercel.app";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

export function getUserPosts({ token, userId }) {
  return fetch(`${postsHost}/user-posts/${userId}`, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Такой пользователь уже существует");
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Неверный логин или пароль");
    }
    return response.json();
  });
}

export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    return response.json();
  });
}

export function addPost({ token, description, imageUrl }) {
  if (!description || !imageUrl) {
    return Promise.reject(new Error("Заполните все поля"));
  }

  const body = JSON.stringify({ description, imageUrl });

  return fetch(postsHost, {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: body,
  })
    .then((response) => {
      return response.text().then((text) => {
        try {
          const data = JSON.parse(text);
          if (data.error) {
            throw new Error(data.error);
          }
          return data;
        } catch (e) {
          throw new Error("Сервер вернул ошибку: " + text);
        }
      });
    });
}

export function likePost({ token, postId }) {
  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }
    return response.json();
  });
}

export function dislikePost({ token, postId }) {
  return fetch(`${postsHost}/${postId}/dislike`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }
    return response.json();
  });
}