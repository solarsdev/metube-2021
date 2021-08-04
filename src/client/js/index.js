import '../scss/styles.scss';

const init = () => {
  const avatar = document.querySelector('.header__avatar');
  avatar.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    userMenu.classList.toggle('user-menu--hide');
  });
};

init();
