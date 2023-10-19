function excluirComentario(markerId, commentId) {
    db.ref(`markers/${markerId}/comments/${commentId}`)
      .remove()
      .then(() => {
        // Comentário excluído com sucesso, atualize a lista de comentários
        carregarComentarios(markerId);
      })
      .catch((error) => {
        console.error("Erro ao excluir comentário:", error);
      });
  }
  
  let currentCommentsListener; // Variável para armazenar o ouvinte de comentários atual
  
  function carregarComentarios(markerId) {
    const commentsList = document.getElementById("commentsList");
    commentsList.innerHTML = "";
  
    const user = firebase.auth().currentUser;
  
    // Remove o ouvinte anterior, se houver
    if (currentCommentsListener) {
      db.ref(`markers/${markerId}/comments`).off(
        "child_added",
        currentCommentsListener
      );
    }
  
    // Adiciona o novo ouvinte e armazena a referência
    currentCommentsListener = db
      .ref(`markers/${markerId}/comments`)
      .on("child_added", (snapshot) => {
        const commentData = snapshot.val();
  
        const isCurrentUser = user && user.displayName === commentData.username;
  
        // Verifica se há uma URL de foto de perfil e atribui uma URL padrão se não houver
        const userPhotoUrl = commentData.userPhoto || "URL_PADRAO_DA_FOTO";
  
        const commentElement = `
            <div class="comment">
                <div class="user-info">
                    <div class="user-details">
                        <p><strong>${commentData.username}</strong>: <p>${
          commentData.comment
        }</p></p>
                    </div>
                </div>
                ${
                  isCurrentUser
                    ? `<button class="delete-comment-btn" data-comment-id="${snapshot.key}">
                    <i class="fa fa-trash"></i> Excluir</button>`
                    : ""
                }
            </div>
        `;
        commentsList.insertAdjacentHTML("beforeend", commentElement);
      });
  }
  
  function enviarComentario(markerId, comentario) {
    const user = firebase.auth().currentUser;
    if (user) {
      const commentData = {
        username: user.displayName,
        comment: comentario,
      };
      db.ref(`markers/${markerId}/comments`).push(commentData);
    } else {
      //todo
    }
  }

  function abrirModalDetalhes(markerId) {
    // Obter os dados do marcador com base no markerId
    db.ref("markers")
      .child(markerId)
      .once("value")
      .then((snapshot) => {
        const markerData = snapshot.val();
        preencherModalDetalhes(markerData);
        // Abra o modal
        $("#markerInfoModal").modal("show");
      });
  }
  
  function preencherModalDetalhes(markerData) {
    const modalContent = document.getElementById("enchentesList");
    modalContent.innerHTML = `
        <p><b>Nível de Risco:</b> ${markerData.nivelRisco}</p>
        <p><b>Comentário:</b> ${markerData.comentario}</p>
        <!-- Adicione outras informações do marcador aqui -->
    `;
  }
  
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("marker-details-link")) {
      event.preventDefault();
      const markerId = event.target.getAttribute("data-marker-id");
      abrirModalDetalhes(markerId);
    }
  });
  
  
  // ...
  
  let currentMarkerId; // Variável para armazenar o ID do marcador atual
  
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("marker-details-link")) {
      event.preventDefault();
      currentMarkerId = event.target.getAttribute("data-marker-id"); // Armazena o ID do marcador atual
      abrirModalDetalhes(currentMarkerId);
      carregarComentarios(currentMarkerId);
    }
  
    if (event.target.classList.contains("delete-comment-btn")) {
      const commentId = event.target.getAttribute("data-comment-id");
      excluirComentario(currentMarkerId, commentId);
    }
  });
  
  const commentForm = document.getElementById("commentForm");
  commentForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const commentText = document.getElementById("commentText").value;
    enviarComentario(currentMarkerId, commentText); // Usa o ID do marcador atual
    document.getElementById("commentText").value = ""; // Limpa o campo do formulário após enviar o comentário
  });
  
  
  
  
