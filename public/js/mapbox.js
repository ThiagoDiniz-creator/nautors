const locations = JSON.parse(document.getElementById('map').dataset.locations);

// eslint-disable-next-line no-undef
mapboxgl.accessToken =
  'pk.eyJ1IjoidGhpYWdvZGluaXotYnIiLCJhIjoiY2w5bXhnNm1rMDI5NjN2bzdmd2tlbnpzaSJ9.KfEpGp925WCrm8nvrY8gYg';
// eslint-disable-next-line no-undef
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/thiagodiniz-br/cl9lnjjfh000p14rk5gn2xna6/draft',
  scrollZoom: false,
  // center: [...locations[0].coordinates],
  // interactive: false,
});

// eslint-disable-next-line no-undef
const bounds = new mapboxgl.LngLatBounds();

locations.forEach(({ coordinates, day, description }) => {
  // Add a marker
  const el = document.createElement('div');
  el.className = 'marker';

  // eslint-disable-next-line no-undef
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(coordinates)
    .addTo(map);

  bounds.extend(coordinates);

  // Add a popup
  // eslint-disable-next-line no-undef
  new mapboxgl.Popup({ offset: 35 })
    .setLngLat(coordinates)
    .setHTML(`<p>Day ${day}: ${description}</p>`)
    .addTo(map);
});

map.fitBounds(bounds, {
  padding: { top: 170, bottom: 60, left: 60, right: 60 },
});
