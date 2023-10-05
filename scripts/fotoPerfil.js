const user = firebase.auth().currentUser;

// Verifica se o usuário está logado
if (user) {
  // Obtém a URL da foto do perfil do usuário
  const photoURL = user.photoURL;

  // Cria um elemento de imagem para exibir a foto do perfil
  const profileImage = document.createElement('img');
  profileImage.src = photoURL;
  profileImage.alt = 'Foto do perfil';

  // Adiciona o elemento de imagem ao DOM somente em dispositivos móveis
  const userIconContainer = document.querySelector('#userIconContainer');
  console.log('Largura da tela:', window.innerWidth);
  if (window.innerWidth <= 600) {
    // Remove o conteúdo existente da div (como "Olá, <span id="userName"></span>")
    userIconContainer.innerHTML = '';

    // Adiciona a imagem do perfil do usuário na div
    userIconContainer.appendChild(profileImage);
    console.log('Largura da tela não atendeu à condição.');
  }
}
