const db = require('quick.db');

db.set('test', 'ça marche');
console.log(db.get('test')); // doit afficher "ça marche"