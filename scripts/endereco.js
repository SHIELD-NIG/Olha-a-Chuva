function salvarEndereco() {
    const enderecoInput = document.getElementById("endereco");
    const endereco = enderecoInput.value;
  
    // Obtém o usuário logado
    const user = auth.currentUser;
  
    if (user) {
      const userID = user.uid;
      // Salva o endereço no banco de dados
      db.ref(`usuarios/${userID}/endereco`)
        .set(endereco)
        .then(() => {
          // Obter coordenadas do endereço
          return buscarLocal("endereco")
            .then((coordenadas) => {
              const lat = coordenadas.lat;
              const lon = coordenadas.lon;
  
              // Chame a função enviarNotificacaoChuva com as coordenadas
              enviarNotificacaoChuva(lat, lon);
            })
            .catch((error) => {
              console.error("Erro ao obter coordenadas:", error);
            });
        })
        .catch((error) => {
          console.error("Erro ao salvar endereço no banco de dados:", error);
        });
    }
  }
  