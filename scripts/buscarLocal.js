var input = document.getElementById("searchInput");
var list = document.getElementById("myList");
var url = "https://photon.komoot.io/api/?q=";

input.addEventListener("input", function () {
  // Obtenha a consulta de pesquisa digitada pelo usuário
  var query = input.value.trim();

  // Normalize a consulta de pesquisa
  var queryNormalized = unorm.nfd(query).replace(/[\u0300-\u036f]/g, "");

  // Crie a consulta final
  var consultaFinal = `Rua ${queryNormalized}, Bairro da Luz, Nova Iguaçu`;

  fetch(url + consultaFinal)
    .then((response) => response.json())
    .then((data) => {
      var suggestions = data.features.map((feature) => feature.properties.name);
      list.innerHTML = "";
      suggestions.forEach((suggestion) => {
        var option = document.createElement("option");
        option.value = suggestion;
        list.appendChild(option);

        // Adicione um evento de clique às opções para acionar a função buscarLocal
        input.addEventListener("change", function () {
          // Quando o valor da caixa de entrada muda (quando uma sugestão é selecionada), chame a função buscarLocal
          buscarLocal("searchInput");
          input.value = ""; // Remove o texto dentro de searchInput
          input.blur(); // Remove o foco do elemento de entrada de texto
        });
      });
    });
});

function buscarLocal(inputId) {
  const searchInput = document.getElementById(inputId).value;

  if (searchInput.trim() === "") {
    // Se o campo de busca estiver vazio, não fazemos nada
    return Promise.resolve();
  }

  // Fazer a busca usando a API Nominatim do OpenStreetMap
  return fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      searchInput
    )}&format=json`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        // Encontrou resultados, vamos exibir o primeiro resultado no mapa
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        const boundsBuscar = [
          [-22.7696, -43.4849], // menor latitude, menor longitude
          [-22.7485, -43.4555], // maior latitude, maior longitude
        ];

        if (lat < boundsBuscar[0][0] || lat > boundsBuscar[1][0] || lon < boundsBuscar[0][1] || lon > boundsBuscar[1][1]) {
          alert('Você está pesquisando lugares fora dos limites do Bairro da Luz!');
          return;
        }

        // Atualizar o mapa com a nova localização e aumentar o zoom
        if (inputId === "searchInput") {
          map.flyTo([lat, lon], 18);
        }

        return { lat, lon };
      } else {
        // Nenhum resultado encontrado
        throw new Error(
          "Local não encontrado. Verifique o nome da rua ou CEP digitado."
        );
      }
    });
}

function obterCoordenadasDoEndereco(endereco) {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      endereco
    )}&format=json`;
  
    return fetch(nominatimUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const latitude = data[0].lat;
          const longitude = data[0].lon;
          return { latitude, longitude };
        } else {
          throw new Error("Endereço não encontrado");
        }
      });
  }
  