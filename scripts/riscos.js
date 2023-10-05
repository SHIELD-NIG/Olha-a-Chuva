async function verificarRiscos(lat, lng, nivelRisco) {
    const weatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lng}&days=1`;
  
    try {
      const response = await fetch(weatherApiUrl);
      const data = await response.json();
  

      const riscoVerificado = data.current.precip_mm <= 1;
      const quantidadeChuvaMM = data.current.precip_mm; // Nova linha para obter a quantidade de chuva em milímetros
      return { riscoVerificado, quantidadeChuvaMM };
    } catch (error) {
      console.error("Erro ao verificar riscos: ", error);
      return { riscoVerificado: false, quantidadeChuvaMM: 0 };
    }
  }

  function analisarCondicoesClimaticas(data) {
    const precipitacao = data.current.precip_mm; // Obtém a quantidade de precipitação em mm
  
    if (precipitacao >= 20) {
      // Nível de chuva alto, risco alto
      return "alto";
    } else if (precipitacao >= 10) {
      // Nível de chuva médio, risco médio
      return "medio";
    } else if (precipitacao <= 1) {
      // Nível de chuva baixo, risco baixo
      return "baixo"; // Retorna baixo para ignorar a criação do marcador
    }
  }