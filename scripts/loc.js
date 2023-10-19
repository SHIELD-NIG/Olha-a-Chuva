function obterLocalizacaoUsuario() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const userIcon = L.icon({
          iconUrl: './assets/usuario.png', 
          iconSize: [75, 75], 
        });

        userMarker = L.marker([lat, lng], {icon: userIcon}).addTo(map);
        userMarker.bindPopup("Você está aqui!");

        userMarker.isLocationMarker = true;

        // Centralizar o mapa na localização do usuário
        map.setView([lat, lng], 13);
      },
      function (error) {
        // Em caso de erro na obtenção da localização
        if (error.code === error.PERMISSION_DENIED) {
          console.error("Permissão negada para obter a localização.");
          alert(
            "Você negou a permissão para obter a localização. Por favor, permita o acesso à sua localização para utilizar essa funcionalidade."
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          console.error("Localização indisponível no momento.");
          //alert("Não foi possível obter a sua localização no momento. Verifique se você está conectado à internet e tente novamente mais tarde.");
        } else if (error.code === error.TIMEOUT) {
          console.error("Tempo limite excedido para obter a localização.");
          alert(
            "O tempo limite para obter a sua localização foi excedido. Verifique se você está conectado à internet e tente novamente."
          );
        } else {
          console.error(
            "Erro desconhecido na obtenção da localização:",
            error.message
          );
          alert(
            "Ocorreu um erro ao obter a sua localização. Verifique se você está conectado à internet e tente novamente."
          );
        }

        // Inicializar o mapa com uma localização padrão (por exemplo, Rio de Janeiro)
      }
    );
  } else {
    // O navegador não suporta a API Geolocation
    console.error("Seu navegador não suporta Geolocation.");
    // Inicializar o mapa com uma localização padrão
  }
}
  
  function irParaMarcadorUsuario() {
    if (userMarker) {
      if (bairroDaLuzBounds.contains(userMarker.getLatLng())) {
        map.flyTo(userMarker.getLatLng());
      } else {
        alert("Você está fora dos limites do Bairro da Luz!");
      }
    } else {
      console.error("Marcador do usuário não encontrado.");
    }
  }
  
  // Chamar a função para iniciar o mapa com a localização do dispositivo do usuário
  obterLocalizacaoUsuario();

  document.getElementById('centralizarLoc').addEventListener('click', irParaMarcadorUsuario);