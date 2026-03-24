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
    title.textContent = item.node.title;
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

    // Click → show modal with favorite option
    li.onclick = () => {
      document.getElementById("modal-title").textContent = title.textContent;
      document.getElementById("modal-genres").textContent =
        item.node.genres?.map(g => g.name).join(", ") || "No genres";

      // Add favorite toggle inside modal
      const modalContent = document.querySelector(".modal-content");
      let favBtn = document.getElementById("fav-btn");
      if (!favBtn) {
        favBtn = document.createElement("button");
        favBtn.id = "fav-btn";
        modalContent.appendChild(favBtn);
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

function filterAnime(genre) {
  let heading = document.getElementById("genre-heading");
  if (genre === "All") {
    displayAnime(allAnime);
    heading.textContent = "";
  } else if (genre === "Alphabetical") {
    const sorted = [...allAnime].sort((a, b) => a.node.title.localeCompare(b.node.title));
    displayAnime(sorted);
    heading.textContent = "Alphabetical Animes";
  } else if (genre === "Favorites") {
    const favList = allAnime.filter(item => favorites.has(item.node.id));
    displayAnime(favList);
    heading.textContent = "Favorite Animes";
  } else {
    const filtered = allAnime.filter(item =>
      item.node.genres?.some(g => g.name === genre)
    );
    displayAnime(filtered);
    heading.textContent = `${genre} Animes`;
  }
  // Auto-close panel
  document.getElementById("filter-panel").classList.remove("active");
}

function searchAnime() {
  const query = document.getElementById("search").value.toLowerCase();
  const filtered = allAnime.filter(item =>
    item.node.title.toLowerCase().includes(query)
  );
  displayAnime(filtered);
  document.getElementById("genre-heading").textContent = `Search results for "${query}"`;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("darkMode", "enabled");
    document.getElementById("dark-toggle").textContent = "Light Mode";
  } else {
    localStorage.setItem("darkMode", "disabled");
    document.getElementById("dark-toggle").textContent = "Dark Mode";
  }
}

function closeModal() {
  document.getElementById("anime-modal").style.display = "none";
}

function toggleFilterPanel() {
  const panel = document.getElementById("filter-panel");
  panel.classList.toggle("active");
}

function populateGenres(list) {
  const genreButtons = document.getElementById("genre-buttons");
  genreButtons.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.textContent = "All";
  allBtn.onclick = () => filterAnime("All");
  genreButtons.appendChild(allBtn);

  const alphaBtn = document.createElement("button");
  alphaBtn.textContent = "Alphabetical";
  alphaBtn.onclick = () => filterAnime("Alphabetical");
  genreButtons.appendChild(alphaBtn);

  // Favorites option after Alphabetical
  const favBtn = document.createElement("button");
  favBtn.textContent = "Favorites";
  favBtn.onclick = () => filterAnime("Favorites");
  genreButtons.appendChild(favBtn);

  const genres = new Set();
  list.forEach(item => {
    item.node.genres?.forEach(g => genres.add(g.name));
  });

  genres.forEach(genre => {
    const btn = document.createElement("button");
    btn.textContent = genre;
    btn.onclick = () => filterAnime(genre);
    genreButtons.appendChild(btn);
  });
}

// Extra top bar buttons
function goHome() {
  displayAnime(allAnime);
  document.getElementById("genre-heading").textContent = "";
}
function showPopular() {
  const sorted = [...allAnime].sort((a, b) => {
    const scoreA = a.node.mean || 0;
    const scoreB = b.node.mean || 0;
    return scoreB - scoreA;
  });
  displayAnime(sorted);
  document.getElementById("genre-heading").textContent = "Popular Animes";
}
function showRecent() {
  const sorted = [...allAnime].sort((a, b) => {
    const dateA = new Date(a.node.start_date || 0);
    const dateB = new Date(b.node.start_date || 0);
    return dateB - dateA;
  });
  displayAnime(sorted);
  document.getElementById("genre-heading").textContent = "Recently Added Animes";
}
function syncAnimeList() {
  fetchAnimeList();
  document.getElementById("genre-heading").textContent = "Synced with MAL";
}


fetch("https://anime-watchlist-2g18.onrender.com/animelist")
  .then(response => response.json())
  .then(data => {
    const animeList = document.getElementById("anime-list");
    animeList.innerHTML = "";

    data.data.forEach((anime, index) => {
      const animeCard = document.createElement("div");
      animeCard.classList.add("anime-card");

      // Use English title if available, otherwise fallback
      const title = anime.node.alternative_titles?.en || anime.node.title;

      animeCard.innerHTML = `
        <div class="anime-number">${index + 1}</div>
        <img src="${anime.node.main_picture?.medium}" alt="${title}">
        <h3>${title}</h3>
      `;

      animeList.appendChild(animeCard);
    });
  })
  .catch(error => console.error("Error fetching anime list:", error));
