
// Seleciona a barra de pesquisa
const searchInput = document.querySelector('#searchInput');

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    buscarLocal('searchInput');
    searchInput.value = ''; // Remove o texto dentro de searchInput
    searchInput.blur(); // Remove o foco do elemento de entrada de texto
  }
});

if (window.innerWidth <= 600) {
  document.querySelector('#signInButtonPc').classList.add('hide')
} else {
  document.querySelector('#signInButtonPc').classList.remove('hide')
}

// Adiciona um ouvinte de evento para o evento 'focus'
searchInput.addEventListener('focus', () => {
  if (window.innerWidth <= 600) {
    // Adiciona a classe 'hide' aos itens da navbar
    document.querySelector('.logo').classList.add('hide');
    document.querySelector('#userDropdown').classList.add('hide');
    document.querySelector('#signInButton').classList.add('hide');
    document.querySelector('#main').classList.add('hide');
    document.querySelector('#pesquisar').classList.add('hide');
    document.querySelector('.search-icon').classList.add('hide');
    document.querySelector('.search-bar').classList.add('sidebar-open')
  } 
});

// Adiciona um ouvinte de evento para o evento 'blur'
searchInput.addEventListener('blur', () => {
  if (window.innerWidth <= 600) {
    // Remove a classe 'hide' dos itens da navbar
    document.querySelector('#userDropdown').classList.remove('hide');
    document.querySelector('#signInButton').classList.remove('hide');
    document.querySelector('.logo').classList.remove('hide');
    document.querySelector('#main').classList.remove('hide');
    document.querySelector('#pesquisar').classList.remove('hide');
    document.querySelector('.search-bar').classList.remove('sidebar-open')
    document.querySelector('.search-icon').classList.remove('hide');
  } 
});

function openNav() {
  document.getElementById('overlay').style.display = 'block';

  document.querySelector('.logo').style.display = 'none';
  document.querySelector('.search-icon').classList.toggle('hide');
  document.querySelector('.search-bar').classList.toggle('hide');
  document.querySelector('.openbtn').style.display = 'none';

  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";

  document.querySelector('.search-bar').classList.add('sidebar-open');
  document.querySelector('#pesquisar').classList.add('hide');
  document.querySelector('.search-icon').classList.add('hide');
}

function closeNav() {
  document.getElementById('overlay').style.display = 'none';

  document.querySelector('.logo').style.display = 'block';
  document.querySelector('.openbtn').style.display = 'block';
  document.querySelector('.search-icon').classList.remove('hide');
  document.querySelector('.search-bar').classList.remove('hide');

  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft= "0";

  document.querySelector('.search-bar').classList.remove('sidebar-open');
  document.querySelector('#pesquisar').classList.remove('hide');
  document.querySelector('.search-icon').classList.remove('hide');
}
