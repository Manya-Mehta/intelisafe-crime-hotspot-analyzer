/*document.addEventListener('DOMContentLoaded', async () => {
  const map = L.map('policeMap').setView([21.1702, 72.8311], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let hotspotLayer = L.layerGroup().addTo(map);

  async function loadHotspots() {
    hotspotLayer.clearLayers();
    const top = parseInt(document.getElementById('topN').value) || 10;
    const res = await fetch(`/api/get-hotspots?top=${top}`);
    const json = await res.json();

    json.hotspots.forEach(h => {
      L.circle([h.centroid.lat, h.centroid.lon], {
        radius: Math.max(150, h.count * 70),
        color: 'orange',
        fillOpacity: 0.5
      }).bindPopup(`Hotspot (count: ${h.count})`).addTo(hotspotLayer);
    });

    if (json.hotspots.length) map.fitBounds(hotspotLayer.getBounds(), { maxZoom: 13 });
  }

  document.getElementById('loadHotspotsBtn').addEventListener('click', loadHotspots);
  await loadHotspots();

  document.getElementById('downloadBtn').addEventListener('click', async () => {
    const res = await fetch('/api/download-crimes');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crimes.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  setTimeout(() => { map.invalidateSize(); }, 200);
});
*/