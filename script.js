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
      li.classList.add("show");
    }, index * 100);
  });
}

// Animate genre heading
function updateHeading(text) {
  const heading = document.getElementById("genre-heading");
  heading.classList.remove("show");
  heading.textContent = text;
  setTimeout(() => heading.classList.add("show"), 50);
}

function filterAnime(genre) {
  if (genre === "All") {
    displayAnime(allAnime);
    updateHeading("");
  } else if (genre === "Alphabetical") {
    const sorted = [...allAnime].sort((a, b) => a.node.title.localeCompare(b.node.title));
    displayAnime(sorted);
    updateHeading("Alphabetical Animes");
  } else if (genre === "Favorites") {
    const favList = allAnime.filter(item => favorites.has(item.node.id));
    displayAnime(favList);
    updateHeading("Favorite Animes");
  } else {
    const filtered = allAnime.filter(item =>
      item.node.genres?.some(g => g.name === genre)
    );
    displayAnime(filtered);
    updateHeading(`${genre} Animes`);
  }
  document.getElementById("filter-panel").classList.remove("active");
  document.body.classList.remove("filter-open");
}

function searchAnime() {
  const query = document.getElementById("search").value.toLowerCase();
  const filtered = allAnime.filter(item =>
    (item.node.alternative_titles?.en || item.node.title).toLowerCase().includes(query)
  );
  displayAnime(filtered);
  updateHeading(`Search results for "${query}"`);
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
  document.body.classList.toggle("filter-open", panel.classList.contains("active"));
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
  updateHeading("");
}
function showPopular() {
  const sorted = [...allAnime].sort((a, b) => (b.node.mean || 0) - (a.node.mean || 0));
  displayAnime(sorted);
  updateHeading("Popular Animes");
}
function showRecent() {
  const sorted = [...allAnime].sort((a, b) =>
    new Date(b.node.start_date || 0) - new Date(a.node.start_date || 0)
  );
  displayAnime(sorted);
  updateHeading("Recently Added Animes");
}
function syncAnimeList() {
  fetchAnimeList();
  updateHeading("Synced with MAL");
}
