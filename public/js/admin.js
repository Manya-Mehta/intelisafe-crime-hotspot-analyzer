/*document.addEventListener('DOMContentLoaded', async () => {
  const crimeTableBody = document.querySelector('#crimeTable tbody');
  const map = L.map('map').setView([21.1702, 72.8311], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let markersLayer = L.layerGroup().addTo(map);

  async function loadCrimes() {
    const res = await fetch('/api/get-crimes');
    const crimes = await res.json();
    crimeTableBody.innerHTML = '';
    markersLayer.clearLayers();
    crimes.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${c.date}</td><td>${c.crime_type}</td><td>${c.lat}</td><td>${c.lon}</td><td>${c.severity||''}</td>`;
      crimeTableBody.appendChild(tr);

      if (isFinite(c.lat) && isFinite(c.lon)) {
        L.circleMarker([c.lat, c.lon], {
          radius: 5,
          color: "blue"
        }).bindPopup(`${c.crime_type} (${c.date})`).addTo(markersLayer);
      }
    });
    if (crimes.length) map.fitBounds(markersLayer.getBounds(), { maxZoom: 13 });
  }
  await loadCrimes();

  document.getElementById('uploadBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) return alert('Select CSV file first');
    const fd = new FormData();
    fd.append('file', fileInput.files[0]);
    document.getElementById('uploadStatus').innerText = 'Uploading...';
    const res = await fetch('/api/upload-data', { method: 'POST', body: fd });
    const data = await res.json();
    document.getElementById('uploadStatus').innerText = data.message || JSON.stringify(data);
    await loadCrimes();
  });

  document.getElementById('predictBtn').addEventListener('click', async () => {
    const grid = parseFloat(document.getElementById('gridInput').value) || 0.01;
    const threshold = parseInt(document.getElementById('thresholdInput').value) || 3;
    const res = await fetch(`/api/get-hotspots?grid=${grid}&threshold=${threshold}`);
    const json = await res.json();
    document.getElementById('predictionResult').innerText = `Found ${json.hotspots.length} hotspots.`;

    markersLayer.clearLayers();
    await loadCrimes();

    const hotspotLayer = L.layerGroup().addTo(map);
    json.hotspots.forEach(h => {
      const circle = L.circle([h.centroid.lat, h.centroid.lon], {
        radius: Math.max(150, h.count * 80),
        color: 'red',
        fillOpacity: 0.4
      }).bindPopup(`Hotspot (count: ${h.count})`);
      circle.addTo(hotspotLayer);
    });

    if (json.hotspots.length) map.fitBounds(hotspotLayer.getBounds(), { maxZoom: 13 });
  });

  setTimeout(() => { map.invalidateSize(); }, 200);
}); */