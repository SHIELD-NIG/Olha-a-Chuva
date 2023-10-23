async function criarMarcadoresAutomaticos() {
    const ruasCoordenadas = [
      [-22.7606296, -43.46515581], // avenida luz
      [-22.6878083, -43.44313962], // rua bernadino de mello
      [-22.8999660, -43.18921613], // rua barao de sao felix
      [-22.7611621, -43.45933125], // avenida abilio augusto tavora
      [-22.7530705, -43.47515201], // rua gerson chernicharo
      [-22.7583138, -43.47666151], // rua dom torquato
      //todo rj
    ];
  
    try {
      for (const coordenadas of ruasCoordenadas) {
        const latitude = coordenadas[0];
        const longitude = coordenadas[1];
  
        // Obtenha as condições climáticas da área da API de tempo
        const weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}`;
  
        const response = await fetch(weatherApiUrl);
        const data = await response.json();
  
        // Analise as condições climáticas e decida onde criar os marcadores automáticos
        const nivelRisco = analisarCondicoesClimaticas(data);
  
        if (nivelRisco) {
          const comentario = `Marcador automático com base nas condições climáticas.`;
          salvarMarcador(latitude, longitude, nivelRisco, comentario, null);
          exibirMarcadores();
        }
      }
    } catch (error) {
      console.error("Erro ao criar marcadores automáticos: ", error);
    }
  }

  async function salvarMarcador(lat, lng, nivelRisco, comentario, videoURL) {
    const user = firebase.auth().currentUser;
    if (user) {
      const userId = user.uid;
  
      // Verificar riscos usando a função de verificação da WeatherAPI
      const riscoVerificado = await verificarRiscos(lat, lng, nivelRisco);
  
      if (!riscoVerificado) {
        console.log("Risco não verificado, o marcador não será salvo.");
        return;
      }
  
      const newMarkerRef = db.ref("markers").push();
      newMarkerRef.set(
        {
          userId: userId,
          latitude: lat,
          longitude: lng,
          nivelRisco: nivelRisco,
          comentario: comentario,
          videoURL: videoURL,
        },
        (error) => {
          if (error) {
            console.error("Erro ao salvar marcador: ", error);
          } else {
            console.log("Marcador salvo com chave: ", newMarkerRef.key);
            exibirMarcadores();
          }
        }
      );
    } else {
      console.error(
        "Usuário não autenticado. Faça login para salvar marcadores."
      );
      alert("Faça login para salvar o marcador.");
    }
  }

  function exibirMarcadores() {
    db.ref("markers").on("value", (snapshot) => {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker && !layer.isLocationMarker) {
          map.removeLayer(layer);
        }
      });
  
      snapshot.forEach((childSnapshot) => {
        const markerData = childSnapshot.val();
        var customIcon = L.Icon.extend({
          options: {
            iconSize: [75, 75],
            shadowSize: [50, 64],
            iconAnchor: [37.5, 75],
            shadowAnchor: [4, 62],
            popupAnchor: [-5, -80],
            className: "custom-icon",
          },
        });
  
        var alto = new customIcon({
          iconUrl: "./assets/alto.png",
          shadowUrl: "",
        });
  
        var medio = new customIcon({
          iconUrl: "./assets/medio.png",
          shadowUrl: "",
        });
  
        var baixo = new customIcon({
          iconUrl: "./assets/baixo.png",
          shadowUrl: "",
        });
  
        const marker = L.marker([
          markerData.latitude,
          markerData.longitude,
        ]).addTo(map);
  
        if (markerData.nivelRisco === "alto") {
          marker.setIcon(alto);
        } else if (markerData.nivelRisco === "medio") {
          marker.setIcon(medio);
        } else if (markerData.nivelRisco === "baixo") {
          marker.setIcon(baixo);
        }
  
        /*const circleOptions = {
            color: 'red', // Cor vermelha
            fillColor: 'red', // Cor de preenchimento vermelha
            fillOpacity: 0.3, // Opacidade do preenchimento
            radius: 50, // Raio do círculo (ajuste conforme necessário)
            interactive: false, // Desabilita interação com o círculo
          };
          
          const circle = L.circle([markerData.latitude, markerData.longitude], circleOptions).addTo(map);
  
          marker.on('mouseover', function () {
            map.addLayer(circle); // Exibe o círculo ao passar o mouse
          });
    
          // Adicionar evento de tirar o mouse do marcador
          marker.on('mouseout', function () {
            map.removeLayer(circle); // Remove o círculo ao tirar o mouse
          });*/
  
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${markerData.latitude},${markerData.longitude}`;
  
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            const rainfall = data.current.precip_mm;
            // Adicione o valor de rainfall ao conteúdo do popup
  
            let riskLevelHtml = "";
            if (markerData.nivelRisco === "alto") {
              riskLevelHtml =
                '<div style="background-color: rgba(255, 0, 0, 0.15); padding: 0.5rem; margin-bottom: 0.25rem; border-radius: 0.25rem;"><i class="fas fa-exclamation-triangle fa-lg"></i> <b>Nível de Risco:</b> Alto</div>';
            } else if (markerData.nivelRisco === "medio") {
              riskLevelHtml =
                '<div style="background-color: rgba(255, 255, 0, 0.15); padding: 0.5rem; margin-bottom: 0.25rem; border-radius: 0.25rem;"><i class="fas fa-exclamation-circle fa-lg"></i> <b>Nível de Risco:</b> Médio</div>';
            } else if (markerData.nivelRisco === "baixo") {
              riskLevelHtml =
                '<div style="background-color: rgba(0, 128, 0, 0.20); padding: 0.5rem; margin-bottom: 0.25rem; border-radius: 0.25rem;"><i class="fas fa-check-circle fa-lg"></i> <b>Nível de Risco:</b> Baixo</div>';
            }
  
            let videoHtml = "";
            if (markerData.videoURL) {
              const videoElement = document.createElement("video");
              videoElement.src = markerData.videoURL;
              videoElement.width = 240;
              videoElement.height = 180;
              videoElement.autoplay = false; 
              videoElement.style.display = "block";
              videoElement.style.margin = "0 auto";
              videoElement.controls = true;
              videoElement.style.marginTop = "0.5rem";
  
              videoHtml = `<b>Vídeo:</b><br>${videoElement.outerHTML}`;
            }
  
            let popupContent = `
            <div class="card" style="width: 18rem;">
              <div class="card-body">
                <h5 class="card-title" style="line-height: 1.2;"> Informações do Marcador</h5>
                ${riskLevelHtml}
                <p class="card-text" style="margin-bottom: 0; line-height: 1;">
                  <i class="fas fa-comment-dots" style="line-height: 0.8;"></i> <b>Comentário:</b> ${markerData.comentario}<br>
                </p>
                <p class="card-text" style="margin-top: 0.5rem; margin-bottom: 1.5rem; line-height: 1;">
                  <i class="fas fa-cloud-rain" style="line-height: 0.8;"></i> <b>Quantidade de Chuva:</b> ${rainfall} mm<br>
                </p>
                ${videoHtml}
                <a href="#" class="marker-details-link" data-marker-id="${childSnapshot.key}" style="display: block; margin-top: 2rem; text-align: center;"><i class="fas fa-external-link-alt"></i> Detalhes</a>
              </div>
            </div>
          `;
          
          
          
          
  
        
            marker.bindPopup(popupContent, {
              autoPan: true,
              autoPanPadding: [2, 87],
            });
          });
      
    
  
        marker.on("touchstart", function (e) {
          // adiciona um evento de toque no marcador
          this.openPopup(); // abre o popup
        });
        marker.on("touchend", function (e) {
          // adiciona um evento de tirar o toque do marcador
          this.closePopup(); // fecha o popup
        });
  
  
        // Adicionar círculo de risco ao clicar no marcador
        marker.on("click", function () {
          // Obtém a latitude e longitude do marcador
          const markerLatLng = this.getLatLng();
  
          // Calcula a nova latitude do centro do mapa
          const centerLat = markerLatLng.lat + 0.001; // ajuste este valor conforme necessário
  
          // Centraliza o mapa na nova localização e ajusta o zoom
          map.setView([centerLat, markerLatLng.lng], 16.5, {
            animate: true,
            duration: 1.0, // ajuste este valor conforme necessário
            easeLinearity: 0.25, // ajuste este valor conforme necessário
          });
        });
      });
    });
  }

  // Event listener para abrir o modal de seleção do marcador quando o mapa for clicado
map.on("click", function (e) {
    // Abrir o modal de seleção do marcador
    $("#markerModal").modal("show");
  
    // Obter as coordenadas do clique
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
  
    // Armazenar as coordenadas nos campos ocultos do formulário
    document.getElementById("latitudeInput").value = lat;
    document.getElementById("longitudeInput").value = lng;
  });
  
  // Função para salvar o marcador no Firebase quando o botão "Salvar" do modal for clicado
  function saveMarker() {
    // Obter os valores selecionados do formulário do modal
    const lat = parseFloat(document.getElementById("latitudeInput").value);
    const lng = parseFloat(document.getElementById("longitudeInput").value);
    const nivelRisco = document.getElementById("riskLevel").value;
    const comentario = document.getElementById("comment").value;
    const videoFile = document.getElementById("video").files[0]; // Obter o arquivo de vídeo
  
    if (!nivelRisco || !comentario) {
      alert("Por favor, preencha o nível de risco e o comentário.");
      return;
    }
  
    // Chamar a função para salvar o vídeo no Firebase Storage
    salvarVideoNoStorage(videoFile, lat, lng, nivelRisco, comentario);
  }
  
  
  function salvarVideoNoStorage(videoFile, lat, lng, nivelRisco, comentario) {
    // Verificar se o videoFile não é nulo
    if (videoFile) {
  
      if (videoFile.size > 50 * 1024 * 1024) { // 50MB em bytes
        alert("O tamanho do vídeo excede 50MB. Por favor, escolha um vídeo menor.");
        return;
      }
  
      document.getElementById("uploadMessage").style.display = "block";
  
      // Criar uma referência para o Firebase Storage
      const storageRef = firebase.storage().ref();
  
      // Gerar um nome único para o arquivo de vídeo
      const videoFileName = Date.now() + "_" + videoFile.name;
  
      // Upload do vídeo para o Firebase Storage
      const uploadTask = storageRef.child(videoFileName).put(videoFile);
  
      // Monitorar o progresso do upload
      uploadTask.on(
        "state_changed",
        null,
        function (error) {
          // Em caso de erro no upload do vídeo
          console.error("Erro ao fazer upload do vídeo:", error);
          alert("Erro ao fazer upload do vídeo: " + error);
          
          // Ocultar a mensagem de carregamento em caso de erro
          document.getElementById("uploadMessage").style.display = "none";
        },
        function () {
          // Upload do vídeo concluído com sucesso
          console.log("Vídeo enviado com sucesso!");
  
          // Obter a URL de download do vídeo
          uploadTask.snapshot.ref
            .getDownloadURL()
            .then(function (downloadURL) {
              // Chamar a função para salvar o marcador no Firebase Firestore
              salvarMarcador(lat, lng, nivelRisco, comentario, downloadURL);
  
              // Fechar o modal após salvar o marcador
              $("#markerModal").modal("hide");
  
              // Ocultar a mensagem de carregamento após o upload bem-sucedido
              document.getElementById("uploadMessage").style.display = "none";
            })
            .catch(function (error) {
              console.error("Erro ao obter URL do vídeo:", error);
              alert("Erro ao obter URL do vídeo: " + error);
              
              // Ocultar a mensagem de carregamento em caso de erro
              document.getElementById("uploadMessage").style.display = "none";
            });
        }
      );
    } else {
      // Caso o videoFile seja nulo, chame a função para salvar o marcador sem o vídeo
      salvarMarcador(lat, lng, nivelRisco, comentario, "");
      $("#markerModal").modal("hide");
    }
  }
  
  
  
  // Chamar a função para exibir os marcadores existentes no carregamento da página
  exibirMarcadores();
  
  var userMarker = null;
  const bairroDaLuzBounds = L.latLngBounds(
    L.latLng(-22.7485, -43.4849), //todo rj
    L.latLng(-22.7696, -43.4555) //todo rj
  );

  function exibirMeusMarcadores() {
    const userId = firebase.auth().currentUser.uid;
  
    // Consultar os marcadores do usuário no Firebase Realtime Database
    db.ref("markers")
      .orderByChild("userId")
      .equalTo(userId)
      .once("value")
      .then((snapshot) => {
        const myMarkersList = document.getElementById("myMarkersList");
        myMarkersList.innerHTML = "";
  
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const markerData = childSnapshot.val();
            const markerItem = document.createElement("div");
            markerItem.innerHTML = `
                      <div class="marker-item">
                          <i class="fas fa-trash-alt mr-2" style="cursor: pointer;" onclick="excluirMarcador('${childSnapshot.key}')"></i>
                          <b>Nível de Risco:</b> ${markerData.nivelRisco}<br><b>Comentário:</b> ${markerData.comentario}<br><b>Vídeo:</b> <a href="${markerData.videoURL}" target="_blank">Assistir ao vídeo</a>
                      </div>
                  `;
            myMarkersList.appendChild(markerItem);
          });
        } else {
          myMarkersList.innerHTML = "<p><b>Nenhum marcador encontrado.</b></p>";
        }
      });
  
    // Abrir o modal de marcadores do usuário
    $("#myMarkersModal").modal("show");
  }
  
  function excluirMarcador(markerId) {
    const userId = firebase.auth().currentUser.uid;
  
    // Verificar se o marcador pertence ao usuário
    db.ref("markers")
      .child(markerId)
      .once("value")
      .then((snapshot) => {
        const markerData = snapshot.val();
  
        if (markerData && markerData.userId === userId) {
          // Excluir o marcador do Firebase Realtime Database
          db.ref("markers")
            .child(markerId)
            .remove()
            .then(() => {
              alert("Seu marcador foi excluído com sucesso.");
  
              // Remover o marcador do mapa
              const mapLayers = map._layers;
              for (const layerId in mapLayers) {
                if (mapLayers[layerId] instanceof L.Marker) {
                  const markerLatLng = mapLayers[layerId].getLatLng();
                  if (
                    markerLatLng.lat === markerData.latitude &&
                    markerLatLng.lng === markerData.longitude
                  ) {
                    map.removeLayer(mapLayers[layerId]);
                    break;
                  }
                }
              }
  
              exibirMeusMarcadores();
            })
            .catch((error) => {
              console.error("Erro ao excluir o marcador: ", error);
              alert(
                "Ocorreu um erro ao excluir o marcador. Por favor, tente novamente mais tarde."
              );
            });
        } else {
          alert("Você não tem permissão para excluir este marcador.");
        }
      });
  }