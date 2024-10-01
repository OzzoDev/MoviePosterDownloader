const OMDB_API_KEY = "2cd2930"; // Replace with your OMDb API key
const TMDB_API_KEY = "6fce5dc0eac5cff8681173a7cac2cf9d"; // Replace with your TMDb API key
const movieDropdown = document.getElementById("movieDropdown");
const fetchPosterButton = document.getElementById("fetchPosterButton");
const posterContainer = document.getElementById("posterContainer");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const downloadButton = document.getElementById("downloadButton");

let currentPosterUrl = ""; // Variable to store the current poster URL

async function searchMovies(query) {
  const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.results; // Return the array of movies
}

async function populateDropdown(movies) {
  movieDropdown.innerHTML = ""; // Clear previous options
  movies.forEach((movie) => {
    const option = document.createElement("option");
    option.value = movie.title;
    option.textContent = movie.title;
    movieDropdown.appendChild(option);
  });
}

async function fetchMoviePoster(title) {
  const response = await fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
  const data = await response.json();
  if (data.Response === "True") {
    return data.Poster;
  } else {
    throw new Error("Movie not found");
  }
}

searchButton.addEventListener("click", async () => {
  const query = searchInput.value;
  if (query) {
    const movies = await searchMovies(query);
    await populateDropdown(movies);
  }
});

fetchPosterButton.addEventListener("click", async () => {
  const selectedMovie = movieDropdown.value;
  posterContainer.innerHTML = ""; // Clear previous poster
  try {
    currentPosterUrl = await fetchMoviePoster(selectedMovie); // Store the poster URL
    const img = document.createElement("img");
    img.src = currentPosterUrl;
    posterContainer.appendChild(img);

    // Show download button
    downloadButton.style.display = "block";
  } catch (error) {
    posterContainer.innerHTML = `<p>${error.message}</p>`;
  }
});

// Function to download the image in WebP format
downloadButton.addEventListener("click", async () => {
  if (currentPosterUrl) {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Handle CORS
    img.src = currentPosterUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // Convert to WebP and download
      canvas.toBlob((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "poster.webp"; // Set the download file name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href); // Clean up the URL object
      }, "image/webp");
    };

    img.onerror = () => {
      console.error("Image loading error");
      posterContainer.innerHTML = "<p>Error loading image.</p>";
    };
  }
});
