document.addEventListener("DOMContentLoaded", () => {
    if (Notification.permission === 'granted') {
      console.log('Permissão para notificações já concedida.');
      obterTokenENotificar();
    } else {
      console.log('Solicitando permissão para notificações...');
      Notification.requestPermission()
        .then((permission) => {
          if (permission === 'granted') {
            console.log('Permissão concedida.');
            obterTokenENotificar();
          } else {
            console.log('Permissão negada.');
          }
        })
        .catch((error) => {
          console.error("Erro ao solicitar permissão para notificações:", error);
        });
    }
  });
  
  function obterTokenENotificar() {
    navigator.serviceWorker.register("./sw.js")
      .then((registration) => {
        return messaging.getToken({
          serviceWorkerRegistration: registration,
        });
      })
      .then((token) => {
        console.log('Token de notificação:', token);
        // Agora que você tem o token, chame a função enviarNotificacaoChuva
        const lat = -22.7562; // Substitua com a latitude desejada
        const lon = -43.4605; // Substitua com a longitude desejada
        enviarNotificacaoChuva(lat, lon, token);
      })
      .catch((error) => {
        console.error("Erro ao obter token de notificação:", error);
      });
  }

  function enviarNotificacaoChuva(lat, lon, token) {
    // Obter dados de chuva da WeatherAPI
    const weatherAPIUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`;
  
    fetch(weatherAPIUrl)
      .then((response) => response.json())
      .then((data) => {
        const nivelChuva = data.current.precip_mm; // Nível de chuva em mm/h
        let mensagem = "";
  
        // Exemplo: Enviar notificação baseada no nível de chuva
        if (nivelChuva >= 10) {
          mensagem = "Alerta de chuva intensa!";
        } else if (nivelChuva >= 5) {
          mensagem = "Alerta de chuva moderada!";
        } else if (nivelChuva <= 1) {
          mensagem = "Alerta de chuva leve!";
        }
  
        if (mensagem) {
          // Enviar notificação para o token
          const serverKey =
            "AAAAg46gTQo:APA91bFn4StXAPNfbroapAmB2OmEpZs7U76Asy5nEbx4hQBSX7-oETXZuitTp-XgyITNaClJTkh9pNbUfwpGj-m_1IDw3pDI-ZzOxIXyjwreyXbphlCi1RN9coK3trunE40G2T6KYx4R";
          const payload = {
            to: token, // Certifique-se de que 'token' esteja definido nesta função
            notification: {
              title: "Alerta de Chuva",
              body: mensagem,
            },
            
          };
  
          return fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `key=${serverKey}`,
            },
            body: JSON.stringify(payload),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Notificação enviada com sucesso:", data);
            })
            .catch((error) => {
              console.error("Erro ao enviar notificação:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Erro ao obter dados de chuva:", error);
      });
  }
  
  function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }