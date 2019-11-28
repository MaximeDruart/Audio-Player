import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();


// // 1 : FETCH :
// // fetch va aller chercher des données à une adresse x et les return.
// // La particularité de fetch c'est que c'est une promesse
// // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
// //https://mdn.mozillademos.org/files/15911/promises.png
// // donc une promesse a la particularité d'etre asynchrone, ce qui veut dire que le code que tu vas chain (avec then) va attendre que la promesse ne soit plus en statut "attente" (soit pending, cf. schema)
// // Une fois plus en attente, la promesse peut avoir 2 statuts : réussite ou échec.
// // Si c'est une réussite, on va éxécuter le .then(), si c'est un échec le .catch() (mais bon tu t'en fous de l'échec en vrai)
// let data
// fetch("https://ladressedetonfichier.com") // on fetch a l'adresse
// .then((fetchedData) => { // si le promesse a un statut "succès", le .then() est lu. Il aura en parametre ce que fetch est allé chercher
//     fetchedData.json() // si les données sont de type JSON il faut lui appliquer la méthode donnée.json() pour le transformer en un objet standard
// })
// .then((jsonData) => { // json() renvoie une promesse je sais pas pq, mais donc tu peux la rechain et la stocker
//     data = jsonData
// }) 


// // MAIS : tout ca sert a rien si ton fichier est local parce que il y aura pas le délai qui vient d'une requete faite sur internet et donc pas besoin d'écrire du code asynchrone (promesse)
// // Tu peux juste avoir ton fichier mesDonnees.json avec tes fichiers
// // Dans tes scripts tu l'importes comme si c'était un fichier js standard et le lire en tant qu'objet.
// // Dans ce cas la le json est pas du tout nécessaire mais c'est une manière pratique de stocker une quantité de donnée importante sans que ca pollue ton javascript