const modalWindow = document.querySelector('.js-modal');
const modalOverlay = document.querySelector('.js-modaloverlay');
const closeModal = document.querySelector('.js-modalclose');
const openModal = document.querySelector('.js-modalopen');

closeModal.addEventListener('click', function () {
   modalWindow.classList.toggle('closed');
   modalOverlay.classList.toggle('closed');
});

modalOverlay.addEventListener('click', function () {
   modalWindow.classList.toggle('closed');
   modalOverlay.classList.toggle('closed');
});

openModal.addEventListener('click', function () {
   modalWindow.classList.toggle('closed');
   modalOverlay.classList.toggle('closed');

});

