let allSpots = [];

// Show splash for 2s
// Splash → check login state
setTimeout(() => {
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log("User already logged in:", user.email);
      showScreen("map");
      if (!map) initMap();
      loadSpots();
    } else {
      showScreen("explore");
    }
  });
}, 2000);


function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

let map; // global map instance
let markers = [];

// Go to map screen and initialize if needed
function goToMap() {
  showScreen("map");
  if (!map) {
    initMap();
  }
  loadSpots();
}

// Initialize Leaflet map
function initMap() {
  map = L.map("mapid").setView([6.5244, 3.3792], 12); // Lagos coords

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);
}

// Custom red marker icon
const redIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ---- Load spots from backend
async function loadSpots() {
  const container = document.getElementById("spots");
  container.innerHTML = "<p>Loading spots...</p>";

  markers.forEach(m => map.removeLayer(m));
  markers = [];

  try {
    const res = await fetch(
      "https://web-production-be18e.up.railway.app/spots"
    );
    allSpots = await res.json(); // ✅ save globally
    renderSpots(allSpots);       // ✅ render initial list
  } catch (err) {
    container.innerHTML = `<p class="text-red-500">Failed to load spots 😢</p>`;
  }
}

// ---- Render spots (cards + markers)
function renderSpots(list) {
  const container = document.getElementById("spots");
  container.innerHTML = "";

  markers.forEach(m => map.removeLayer(m));
  markers = [];

  list.forEach((s, index) => {
    const div = document.createElement("div");
    div.className = "spot-card";
    div.id = `spot-${index}`;

    div.dataset.status = s.status || "proposed";
    div.dataset.rating = s.rating || 4;
    div.dataset.distance = s.distanceKm || 0;

    const imgUrl =
      s.images && s.images.length > 0
        ? s.images[0]
        : "https://via.placeholder.com/64?text=🍲";

    div.innerHTML = `
      <img src="${imgUrl}" class="w-16 h-16 object-cover rounded-lg" />
      <div class="flex-1">
        <h4 class="font-bold text-gray-800">${s.name} <span class="px-2 py-0.5 text-xs rounded-full 
        ${s.status === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}">
        ${s.status || "proposed"}
      </span></h4>
        <p class="text-sm text-gray-600">${s.address}</p>
        <p class="text-yellow-500">${"⭐".repeat(s.rating || 4)}</p>
      </div>
      <button class="text-amber-500 text-xl">♡</button>
    `;

    container.appendChild(div);

    // Add map marker
    if (s.location && s.location.latitude && s.location.longitude) {
      const marker = L.marker(
        [s.location.latitude, s.location.longitude],
        { icon: redIcon }
      )
        .addTo(map)
        .bindPopup(`<b>${s.name}</b><br>${s.address}`);

      div.marker = marker;

      // Marker click → highlight + scroll + open auth
      marker.on("click", () => {
  document.querySelectorAll(".spot-card")
    .forEach(c => c.classList.remove("highlight"));
  div.classList.add("highlight");
  div.scrollIntoView({ behavior: "smooth", block: "center" });

  if (!auth.currentUser) {
    showScreen("auth"); // only if user not logged in
  } else {
    map.setView([s.location.latitude, s.location.longitude], 15);
    marker.openPopup();
  }
});

div.onclick = () => {
  if (!auth.currentUser) {
    showScreen("auth");
  } else {
    map.setView([s.location.latitude, s.location.longitude], 15);
    marker.openPopup();
  }
};

      markers.push(marker);
    }
  });
}


// ---- Apply filters (manual on Apply button click)
function applyFilters() {
  const query = document.getElementById("search").value.toLowerCase();
  const dist = document.getElementById("filter-distance").value;
  const status = document.getElementById("filter-status").value;
  const rating = document.getElementById("filter-rating").value;

  let filtered = allSpots;

  // Search
  if (query) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(query)
    );
  }

  // Distance
  if (dist) {
    filtered = filtered.filter(
      s => (s.distanceKm || 0) <= parseFloat(dist)
    );
  }

  // Status
  if (status) {
    filtered = filtered.filter(
      s => (s.status || "proposed") === status
    );
  }

  // Rating
  if (rating) {
    filtered = filtered.filter(
      s => (s.rating || 0) >= parseInt(rating)
    );
  }

  renderSpots(filtered);
}

// ---- Live search as you type
document.getElementById("search").addEventListener("input", () => {
  applyFilters();
});

// ---- Reset filters
function resetFilters() {
  document.getElementById("search").value = "";
  document.getElementById("filter-distance").value = "";
  document.getElementById("filter-status").value = "";
  document.getElementById("filter-rating").value = "";
  renderSpots(allSpots);
}


function registerUser(event) {
  event.preventDefault();

  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const location = document.getElementById("regLocation").value;
  const phone = document.getElementById("regPhone").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;

      // Optional: Save extra profile fields in Firestore
      firebase.firestore().collection("users").doc(user.uid).set({
        name,
        email,
        location,
        phone,
        createdAt: new Date()
      });

      alert("Registration successful ✅");
      showScreen("map");
      loadSpots();
    })
    .catch(error => {
      alert("Error: " + error.message);
    });
}


function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      alert("Welcome back, " + userCredential.user.email);
      showScreen("map");
      loadSpots();
    })
    .catch(error => {
      alert("Login failed: " + error.message);
    });
}


// Listen for login state
auth.onAuthStateChanged(user => {
  const btn = document.getElementById("authButton");
  if (!btn) return; // just in case

  if (user) {
    // Logged in
    btn.textContent = "Logout";
    btn.onclick = () => {
      auth.signOut().then(() => {
        alert("Logged out");
        showScreen("login");
      });
    };
  } else {
    // Not logged in
    btn.textContent = "Login";
    btn.onclick = () => {
      showScreen("login");
    };
  }
});


function handleAddSpotClick() {
  if (!auth.currentUser) {
    // Not logged in → show registration modal
    showScreen("auth");
  } else {
    // Logged in → show Add Spot modal
    showScreen("addspot");
  }
}


async function addSpot(event) {
  event.preventDefault();

  if (!auth.currentUser) {
    alert("❌ You must log in first");
    showScreen("auth");
    return;
  }

  const name = document.getElementById("spotName").value;
  const addressInput = document.getElementById("spotAddress");
  const address = addressInput.value;
  const previewEl = document.getElementById("locationPreview");

  let lat = addressInput.dataset.lat;
  let lon = addressInput.dataset.lon;

  try {
    // If no lat/lon from autocomplete → fallback to geocoding
    if (!lat || !lon) {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const geoData = await geoRes.json();

      if (!geoData || geoData.length === 0) {
        alert("❌ Could not find location for this address.");
        return;
      }

      lat = geoData[0].lat;
      lon = geoData[0].lon;
      previewEl.textContent = `📍 Detected: ${geoData[0].display_name}`;
    }

    // Save to backend
    const res = await fetch("https://web-production-be18e.up.railway.app/spot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        address,
        rating: 5,
        userId: auth.currentUser.uid,
        location: { latitude: parseFloat(lat), longitude: parseFloat(lon) }
      })
    });

    const data = await res.json(); // ✅ Parse response JSON safely

    if (!res.ok) {
      throw new Error(data.message || "Failed to save spot");
    }

    alert("✅ Spot added successfully!");

    // Clear form fields
    document.getElementById("spotName").value = "";
    addressInput.value = "";
    addressInput.dataset.lat = "";
    addressInput.dataset.lon = "";
    previewEl.textContent = "";

    // ✅ Go back to map screen after success
    showScreen("map");
    loadSpots();

  } catch (err) {
    console.error("Add Spot Error:", err);
    alert("❌ Error adding spot: " + err.message);
  }
}



// --- Autocomplete ---
async function autocompleteAddress() {
  const input = document.getElementById("spotAddress");
  const suggestionsBox = document.getElementById("addressSuggestions");
  const query = input.value.trim();

  if (query.length < 3) {
    suggestionsBox.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query + ", Lagos, Nigeria")}`
    );
    const data = await res.json();

    suggestionsBox.innerHTML = "";
    if (data.length === 0) {
      suggestionsBox.classList.add("hidden");
      return;
    }

    data.forEach(place => {
      const li = document.createElement("li");
      li.textContent = place.display_name;
      li.className = "p-2 hover:bg-gray-100 cursor-pointer";

      li.onclick = () => {
        input.value = place.display_name;
        input.dataset.lat = place.lat;
        input.dataset.lon = place.lon;
        suggestionsBox.classList.add("hidden");
      };

      suggestionsBox.appendChild(li);
    });

    suggestionsBox.classList.remove("hidden");
  } catch (err) {
    console.error("Autocomplete error:", err);
  }
}