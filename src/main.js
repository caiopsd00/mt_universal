const fs = require('fs');

let saidaData = '';
class TuringMachine {
  constructor(states, inputAlphabet, tapeAlphabet, transitions, initialState, finalStates, rejectStates, blankSymbol) {
    this.states = new Set(states);
    this.inputAlphabet = new Set(inputAlphabet);
    this.tapeAlphabet = new Set(tapeAlphabet);
    this.transitions = transitions;
    this.initialState = initialState;
    this.finalStates = new Set(finalStates);
    this.rejectStates = new Set(rejectStates);
    this.blankSymbol = blankSymbol;
  }

  execute(input) {
    let tape = [this.blankSymbol, ...input.split(''), this.blankSymbol];
    let currentState = this.initialState;
    let headPosition = 1;
    tape.splice((headPosition - 1), 0, currentState);
    let stop = false;

    while (!stop) {
      tape.forEach(elemento => {
        if (elemento === (headPosition - 1)) {
          process.stdout.write(`{${elemento}}`);
          saidaData += `{${elemento}}`;
        } else {
          process.stdout.write(elemento);
          saidaData += `${elemento}`;
        }
      });
      saidaData += '\n';
      console.log('\n');

      const currentSymbol = tape[headPosition];
      const transition = this.findTransition(currentState, currentSymbol);

      if (!transition) {
        break;
      }

      const [newState, writeSymbol, moveDirection] = transition;
      tape[headPosition] = writeSymbol;

      if (moveDirection === 'D') {
        tape[headPosition - 1] = tape[headPosition];
        tape[headPosition] = newState;
        headPosition++;

        if (headPosition === tape.length) {
          tape.push(this.blankSymbol);
        }
      } else if (moveDirection === 'E') {
        if (headPosition === 1) {
          tape.unshift(this.blankSymbol);   
          headPosition++;
        }

        tape[headPosition - 1] = tape[headPosition - 2];
        tape[headPosition - 2] = newState;        
        headPosition--;
      }

      currentState = newState;
    }

    let palavraAceita = false;
    this.finalStates.forEach(elemento => {
      if (elemento === currentState) {
        palavraAceita = true;
      }
    });

    if (palavraAceita) {
      saidaData += 'Aceita';
      console.log('Aceita');
    } else {
      saidaData += 'Rejeita';
      console.log('Rejeita');
    }

    return tape.join('');
  }

  findTransition(state, symbol) {
    // Procura por uma transição que corresponda ao estado e símbolo atual
    for (const transition of this.transitions) {
      const [transitionState, transitionSymbol] = transition;
      if (transitionState === state && transitionSymbol === symbol) {
        return transition.slice(2); // Retorna a parte da transição após o estado e símbolo
      }
    }

    return null;
  }
}

function parseTransitions(transitionsString) {
  // Regex para extrair as transições
  const transitionRegex = /\(([^)]+)\)->\(([^)]+)\)/g;
  const transitions = [];

  let match;
  while ((match = transitionRegex.exec(transitionsString)) !== null) {
    const [fromState, readSymbol] = match[1].split(',');
    const [toState, writeSymbol, moveDirection] = match[2].split(',');

    transitions.push([fromState, readSymbol, toState, writeSymbol, moveDirection]);
  }

  return transitions;
}

function lerConfiguracaoArquivo(nomeArquivo) {
  const conteudo = fs.readFileSync(nomeArquivo, 'utf8');

  const [input, ...configArray] = conteudo.split(',');
  const configContent = configArray.join(',');

  // Ajuste do regex para capturar corretamente o blankSymbol sem o '}' final
  const regex = /\{\s*([^,{}]+(?:,[^,{}]+)*)\s*\},\s*\{\s*([^,{}]+(?:,[^,{}]+)*)\s*\},\s*\{\s*([^,{}]+(?:,[^,{}]+)*)\s*\},\s*\{\s*([^}]+)\s*\},\s*([^,]+),\s*\{\s*([^,{}]+(?:,[^,{}]+)*)\s*\},\s*\{\s*([^,{}]+(?:,[^,{}]+)*)\s*\},\s*([^,]+)}/;

  const match = configContent.match(regex);

  if (!match || match.length !== 9) {
    throw new Error('Formato de arquivo inválido');
  }

  const [_, states, inputAlphabet, tapeAlphabet, transitionsString, initialState, finalStates, rejectStates, blankSymbol] = match;

  const machine = new TuringMachine(
    states.split(',').map(s => s.trim()),
    inputAlphabet.split(',').map(s => s.trim()),
    tapeAlphabet.split(',').map(s => s.trim()),
    parseTransitions(transitionsString),
    initialState.trim(),
    finalStates.split(',').map(s => s.trim()),
    rejectStates.split(',').map(s => s.trim()),
    blankSymbol.trim()
  );

  return { machine, input: input.trim() };
}

function main() {
  if (process.argv.length !== 4) {
    console.log('Uso: node script.js <arquivo de configuração> <saida>');
    return;
  }

  const arquivoConfiguracao = process.argv[2];
  const saida = process.argv[3];

  const { machine, input } = lerConfiguracaoArquivo(arquivoConfiguracao);
  machine.execute(input);
  const writeStream = fs.createWriteStream(saida);
  writeStream.write(saidaData, 'utf-8');
}

main();
