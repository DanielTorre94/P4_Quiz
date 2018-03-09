const model = require('./model');
const {log, biglog, errorlog, colorize} = require("./out");



/**
 * Función de ayuda para los diversos comandos.
 *
 * @param rl  Objeto readline usado para implementar el CLI.
 */
 exports.helpCmd = rl => {
		log("Commandos:");
  		log(" h|help - Muestra esta ayuda.");
  		log(" show <id> - Muestra la pregunta y la respuesta el quiz indicado");
  		log(" add - Añadir un nuevo quiz interactivamente.");
  		log(" delete <id> - Borrar el quiz indicado.");
  		log(" edit <id> - Editar el quiz indicado.");
  	    log(" test <id> - Probar ek quiz indicado.");
  		log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
  		log(" credits - Créditos.");
  		log(" q|quit - Salir del programa.");
  		rl.prompt();
 }

/**
 * Lista de todos los quizzes existentes en el modelo.
 *
 * @param rl  Objeto readline usado para implementar el CLI.
 */
 exports.listCmd = rl => {

 		model.getAll().forEach((quiz, id) => {
 			log(` [${colorize(id, 'magenta')}]: ${quiz.question} `);
 		});

 		rl.prompt();
 }

/**
 * Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 * @param rl  Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a mostrar.
 */
 exports.showCmd = (rl, id) => {
 		
 		if(typeof id === "undefined"){
 			errorlog(`Falta el parámetro id.`);
 		} else {
 			try{
 				const quiz = model.getByIndex(id);
 				log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer} `);
 			} catch(error) {
 				errorlog(error.message);
 			}	
 		}

 		rl.prompt();
 }

 /**
 * Añade un nuevo quiz al modelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 *
 * Hay que recordar que el funcionamiento de la función rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada rl.prompt() se debe hacer en la callback de la segunda llamada
 * a rl.question.
 *
 * @param rl  Objeto readline usado para implementar el CLI.
 */
 exports.addCmd = rl => {
 		
 		rl.question(colorize('Introduzca una pregunta: ', 'green'), question => {
 			rl.question(colorize('Introduzca la respuesta: ', 'green'), answer => {
 				model.add(question, answer);
 				log(` ${colorize('Se ha añadido', 'magenta')}: ${colorize(question, 'cyan')} ${colorize('=>', 'magenta')} ${colorize(answer, 'cyan')}`);
 				rl.prompt();
 			});
 		});

 		rl.prompt();
 }

 /**
 * Prueba un quiz del modelo.
 *
 * @param rl  Objeto readline usado para implementar el CLI.
 * @param id clave del quiz a probar.
 */
 exports.testCmd = (rl, id) => {

 		if(typeof id === "undefined"){
 			errorlog(`Falta el parámetro id.`);
 			rl.prompt();
 		} else {
 			try{
 				const quiz = model.getByIndex(id);
 				log(`La pregunta es : ${quiz.question}`);

 				rl.question(`Introduce la respuesta: `, answer => {
 					// Respuesta del jugador
	 			 var answerSimbol = answer.replace(/[^a-zA-Z 0-9.]+/g,' ');	// eliminar símbolos raros
	 			 var answerSpace = answerSimbol.replace(/\s+/g,' ');   	// eliminar espacios
	 			 var answerToCmp = answerSpace.toLowerCase().trim();			// cambio de mayusculas a minusculas

	 			 	// Respuesta correcta del test
	 			 var goodAnswer = quiz.answer.toLowerCase().trim();				// cambiar de mayusculas a minusculas
 					if(answerToCmp === goodAnswer){
 						log('Su respuesta es: ');
 						biglog('CORRECTA','green');
 					} else {
 						log('Su respuesta es: ');
 						biglog('INCORRECTA','red');
 					}
 					rl.prompt();
 				});
 			} catch (error){
 				errorlog(error.message);
 				rl.prompt();
 			}
 		}	
 };

 /**
 * Pregunta todos los quizzes existentes de forma aleatoria.
 * Se gana si se contesta todos satisfactoriamente.
 *
 * @param rl  Objeto readline usado para implementar el CLI.
 */
 exports.playCmd = rl => {

 		if(model.count() == 0){
 			log('No hay preguntas para jugar');
 			rl.prompt();
 			return;
 		}

 		var score = 0;
 		var toBeResolved = [];						// es un array para cada id
 		toBeResolved.lenght = model.count();  		// inicio de array con el numero de preguntas que hay
 		var long = toBeResolved.lenght;

 		for (var i=0; i<toBeResolved.lenght; i++){
 			toBeResolved.push(i);					// introducir los indices en un array
 		}

 		const playOne = () => {
 			var randomId = Math.floor(Math.random()*(long-score));	// numero al azar para el array de id
 			var idRandom = toBeResolved[randomId];
 			const quiz = model.getByIndex(idRandom);

 			log(`${quiz.question}? `);								//Se lanza la pregunta
 			rl.question('Introduce la respuesta: ', answer => {
	 			 	// Respuesta del jugador
	 			 var answerSimbol = answer.replace(/[^a-zA-Z 0-9.]+/g,' ');	// eliminar símbolos raros
	 			 var answerSpace = answerSimbol.replace(/\s+/g,' ');   	// eliminar espacios
	 			 var answerToCmp = answerSpace.toLowerCase().trim();			// cambio de mayusculas a minusculas

	 			 	// Respuesta correcta del test
	 			 var goodAnswer = quiz.answer.toLowerCase().trim();				// cambiar de mayusculas a minusculas

	 			 if (answerToCmp === goodAnswer){
	 			 	log(`Su respuesta es: CORRECTA `);
	 			 	++score;
	 			 	if(score < long){
	 			 		toBeResolved.splice(randomId, 1);		// eliminar 1 elemento desde la posición randomId
	 			 		rl.prompt();
	 					playOne();								// ejecución recursiva
	 		 		} else {
	 		 			log(' HAS ACERTADO TODAS LAS PREGUNTAS, ENHORABUENA!!');
	 		 			rl.prompt();
	 		 		}
	 		 	} else {
			 		log(`Su respuesta es: INCORRECTA`);
	 			 	log(`Ha acertado: ${score} de ${long} preguntas`);
	 			 	log('FIN DEL JUEGO', 'yellow');
	 			 	rl.prompt();
	 			}
 			});
 		}
 		playOne();

 	};

 /**
 * Borra el quiz del modelo.
 *
 * @param rl  Objeto readline usado para implementar el CLI.
 * @param id clave del quiz a borrar.
 */
 exports.deleteCmd = (rl, id) => {
 		
 		if(typeof id === "undefined"){
 			errorlog(`Falta el parámetro id.`);
 		} else {
 			try{
 				model.deleteByIndex(id);
 			} catch(error) {
 				errorlog(error.message);
 			}	
 		}

 		rl.prompt();
 };

 /**
 * Edita el quiz del modelo.
 *
 * Hay que recordar que el funcionamiento de la función rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada rl.prompt() se debe hacer en la callback de la segunda llamada
 * a rl.question.
 *
 * @param rl  Objeto readline usado para implementar el CLI.
 * @param id clave del quiz a editar.
 */
 exports.editCmd = (rl, id) => {
 		
 		if(typeof id === "undefined"){
 			errorlog(`Falta el parámetro id.`);
 			rl.prompt();
 		} else {
 			try{
 				const quiz = model.getByIndex(id);

 				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);    //genera la pregunta (ya escrita) para poder editarlo
 				rl.question(colorize('Introduzca una pregunta: ', 'green'), question => {
 					process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0); //genera la respuesta (ya escrita) para poder editarlo
 					rl.question(colorize('Introduzca la respuesta: ', 'green'), answer => {
 						model.update(id, question, answer);
 						log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${colorize(question, 'cyan')} ${colorize('=>', 'magenta')} ${colorize(answer, 'cyan')}`);
 						rl.prompt();
 					});
 				});
 			} catch(error) {
 				errorlog(error.message);
 				rl.prompt();
 			}	
 		}
 };

 /**
 * Creditos y nombres de los autores del proyecto.
 *
 * @param rl  Objeto readline usado para implementar el CLI.
 */
 exports.creditsCmd = rl => {
 		log('Autores de la práctica:');
  		log('	1) DANIEL DE LA TORRE LAZARO');
  		log('	2) PABLO PLANELLO SAN SEGUNDO');
  		rl.prompt();
 };

 /**
 * Terminar el programa.
 *
 * @param rl  Objeto readline usado para implemtentar el CLI
 */
 exports.quitCmd = rl => {
  		rl.close();
 };