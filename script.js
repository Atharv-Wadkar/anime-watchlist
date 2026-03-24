let allAnime = [];
let favorites = new Set(JSON.parse(localStorage.getItem("favorites")) || []);

function showLoading() {
  document.getElementById("loading").style.display = "flex";
}
function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

function fetchAnimeList() {
  showLoading();
  fetch("https://anime-watchlist-2g18.onrender.com/animelist")
    .then(response => response.json())
    .then(data => {
      hideLoading();
      if (data.error) {
        document.getElementById("anime-list").innerHTML = `<p>Error: ${data.error}</p>`;
        return;
      }
      if (!data.data) {
        document.getElementById("anime-list").innerHTML = "<p>No anime list found.</p>";
        return;
      }
      allAnime = data.data;
      displayAnime(allAnime);
      populateGenres(allAnime);
    })
    .catch(error => {
      hideLoading();
      console.error(error);
    });
}

// Initial load
fetchAnimeList();

function displayAnime(list) {
  const animeList = document.getElementById("anime-list");
  animeList.innerHTML = "";

  const sorted = list.sort((a, b) => a.node.title.localeCompare(b.node.title));

  sorted.forEach((item, index) => {
    const li = document.createElement("li");
    li.style.opacity = "0";
    li.style.transform = "translateY(20px)";
    li.style.transition = "all 0.4s ease";

    const img = document.createElement("img");
    img.src = item.node.main_picture?.medium || "";
    img.alt = item.node.title;

    const title = document.createElement("p");
    title.textContent = item.node.alternative_titles?.en || item.node.title;
    li.appendChild(img);
    li.appendChild(title);

    if (item.node.num_episodes && item.node.num_episodes > 0) {
      const episodes = document.createElement("p");
      episodes.textContent = `Episodes: ${item.node.num_episodes}`;
      li.appendChild(episodes);
    }

    if (item.node.status) {
      const status = document.createElement("p");
      status.textContent = `Status: ${item.node.status}`;
      li.appendChild(status);
    }

    // Click → show modal with number + favorite option
    li.onclick = () => {
      document.getElementById("modal-title").textContent =
        `${index + 1}. ${title.textContent}`;
      document.getElementById("modal-genres").textContent =
        item.node.genres?.map(g => g.name).join(", ") || "No genres";

      // Add favorite toggle inside modal
      const modalContent = document.querySelector(".modal-content");
      let favBtn = document.getElementById("fav-btn");
      if (!favBtn) {
        favBtn = document.createElement("button");
        favBtn.id = "fav-btn";
        modalContent.insertBefore(favBtn, document.getElementById("back-btn"));
      }
      favBtn.textContent = favorites.has(item.node.id) ? "★ Favorite" : "☆ Add Favorite";
      favBtn.onclick = () => {
        if (favorites.has(item.node.id)) {
          favorites.delete(item.node.id);
          favBtn.textContent = "☆ Add Favorite";
        } else {
          favorites.add(item.node.id);
          favBtn.textContent = "★ Favorite";
        }
        localStorage.setItem("favorites", JSON.stringify([...favorites]));
      };

      document.getElementById("anime-modal").style.display = "block";
    };

    animeList.appendChild(li);

    // Fade-in animation staggered
    setTimeout(() => {
      li.style.opacity = "1";
      li.style.transform = "translateY(0)";
    }, index * 100);
  });
}

function filterAnime(genre) { /* unchanged */ }
function searchAnime() { /* unchanged */ }
function toggleDarkMode() { /* unchanged */ }
function closeModal() {
  document.getElementById("anime-modal").style.display = "none";
}
function toggleFilterPanel() { /* unchanged */ }
function populateGenres(list) { /* unchanged */ }
function goHome() { /* unchanged */ }
function showPopular() { /* unchanged */ }
function showRecent() { /* unchanged */ }
function syncAnimeList() { /* unchanged */ }
