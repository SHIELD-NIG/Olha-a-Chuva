// Configurações e inicialização do Firebase
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Api da WeatherAPI
const apiKey = "";

firebase.initializeApp(firebaseConfig);

// Criar uma referência para o banco de dados do Firebase
const db = firebase.database();
const auth = firebase.auth();
const messaging = firebase.messaging();

// Definir os limites do mapa para o bairro da Luz em Nova Iguaçu, RJ
const bounds = [
  [-22.7485, -43.4849],
  [-22.7696, -43.4555],
];

var luzBounds = L.latLngBounds(
  L.latLng(-22.755, -43.455), 
  L.latLng(-22.765, -43.465),  
);

let map = L.map("map", {
  maxBounds: bounds, // Definir os limites do mapa
  maxBoundsViscosity: 1.0, // Impedir que o usuário mova o mapa para fora dos limites
  zoom: 17,
  minZoom: 13, // Definir o nível mínimo de zoom
  tap: true,
  zoomControl: false,
});
obterLocalizacaoUsuario();
// Ajustar o mapa para caber nos limites
window.addEventListener("resize", function () {
  setTimeout(function () {
    map.invalidateSize();
    map.fitBounds(bounds);
  }, 200); // Ajuste este valor conforme necessário
});
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 19,
}).addTo(map);

const markersLayer = {};
