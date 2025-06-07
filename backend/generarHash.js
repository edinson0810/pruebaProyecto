import bcrypt from 'bcryptjs';

const password = 'TuContraseñaAqui'; // cambia esto por la contraseña real que quieres usar

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Hash generado:', hash);
});

