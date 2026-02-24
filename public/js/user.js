/*document.addEventListener('DOMContentLoaded', async () => {
  const user = localStorage.getItem('ch_user') || 'user';

  const map = L.map('userMap').setView([21.1702, 72.8311], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const hotspotLayer = L.layerGroup().addTo(map);

  async function loadHotspots() {
    hotspotLayer.clearLayers();
    const res = await fetch('/api/get-hotspots?top=10');
    const json = await res.json();
    json.hotspots.forEach(h => {
      L.circle([h.centroid.lat, h.centroid.lon], {
        radius: Math.max(120, h.count * 60),
        color: 'green',
        fillOpacity: 0.4
      }).bindPopup(`Hotspot (count: ${h.count})`).addTo(hotspotLayer);
    });
    if (json.hotspots.length) map.fitBounds(hotspotLayer.getBounds(), { maxZoom: 13 });
  }
  await loadHotspots();

  async function loadMyReports() {
    const res = await fetch(`/api/get-reports?user=${encodeURIComponent(user)}`);
    const data = await res.json();
    document.getElementById('myReports').innerHTML =
      data.map(r => `<li>${r.date} - ${r.crime_type} (${r.lat}, ${r.lon}) - ${r.description}</li>`).join('') 
      || '<li>No reports yet</li>';
  }
  await loadMyReports();

  document.getElementById('crimeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      date: new Date().toISOString().split('T')[0],
      crime_type: fd.get('type'),
      lat: parseFloat(fd.get('lat')),
      lon: parseFloat(fd.get('lon')),
      description: fd.get('description'),
      user
    };
    const res = await fetch('/api/report-crime', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    const json = await res.json();
    alert(json.message || 'Reported');
    await loadMyReports();
  });

  setTimeout(() => { map.invalidateSize(); }, 200);
});
*/