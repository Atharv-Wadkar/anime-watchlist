function addAnime() {
  const input = document.getElementById("anime-input");
  const list = document.getElementById("anime-list");
  if (input.value.trim() !== "") {
    const li = document.createElement("li");
    li.textContent = input.value;
    list.appendChild(li);
    input.value = "";
  }
}
