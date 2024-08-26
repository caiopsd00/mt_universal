const fs = require('fs'); // Módulo para operações de sistema de arquivos

let saidaData = ''; // Variável global para armazenar a saída da execução da máquina

// Classe que define a Máquina de Turing
class TuringMachine {
  constructor(states, inputAlphabet, tapeAlphabet, transitions, initialState, finalStates, rejectStates, blankSymbol) {
    this.states = new Set(states); // Conjunto de estados da máquina
    this.inputAlphabet = new Set(inputAlphabet); // Alfabeto de entrada permitido
    this.tapeAlphabet = new Set(tapeAlphabet); // Alfabeto de símbolos na fita
    this.transitions = transitions; // Regras de transição da máquina
    this.initialState = initialState; // Estado inicial da máquina
    this.finalStates = new Set(finalStates); // Conjunto de estados de aceitação
    this.rejectStates = new Set(rejectStates); // Conjunto de estados de rejeição
    this.blankSymbol = blankSymbol; // Símbolo em branco da fita (usado para espaços em branco)
  }

  // Método principal para executar a Máquina de Turing dada uma palavra de entrada
  execute(input) {
    // Inicializa a fita com símbolos em branco nas extremidades e a entrada no meio
    let tape = [this.blankSymbol, ...input.split(''), this.blankSymbol];
    let currentState = this.initialState; // Define o estado atual como o estado inicial da máquina
    let headPosition = 1; // Posição inicial da cabeça de leitura/escrita na fita
    tape.splice((headPosition - 1), 0, currentState); // Insere o estado inicial na fita na posição correta
    let stop = false; // Controle do loop de execução

    // Loop principal que continua até a máquina parar
    while (!stop) {
      // Exibe a fita no console e armazena a saída
      tape.forEach((elemento, index) => {
        if (index === headPosition - 1) { // Identifica a posição atual da cabeça de leitura/escrita
          process.stdout.write(`{${elemento}}`);
          saidaData += `{${elemento}}`;
        } else {
          process.stdout.write(elemento);
          saidaData += `${elemento}`;
        }
      });
      saidaData += '\n';
      console.log('\n');

      // Identifica o símbolo atual sob a cabeça de leitura/escrita
      const currentSymbol = tape[headPosition];
      // Encontra a transição apropriada baseada no estado atual e símbolo
      const transition = this.findTransition(currentState, currentSymbol);

      // Se não houver transição aplicável, a máquina para
      if (!transition) {
        break;
      }

      // Extrai as partes da transição: novo estado, símbolo a ser escrito e direção do movimento
      const [newState, writeSymbol, moveDirection] = transition;
      tape[headPosition] = writeSymbol; // Escreve o novo símbolo na posição da cabeça de leitura/escrita

      // Movimenta a cabeça de leitura/escrita na direção especificada
      if (moveDirection === 'D') { // Movimento para a direita
        tape[headPosition - 1] = tape[headPosition];
        tape[headPosition] = newState;
        headPosition++;

        // Expande a fita se necessário (caso chegue à borda)
        if (headPosition === tape.length) {
          tape.push(this.blankSymbol);
        }
      } else if (moveDirection === 'E') { // Movimento para a esquerda
        if (headPosition === 1) { // Expande a fita para a esquerda, se necessário
          tape.unshift(this.blankSymbol);   
          headPosition++;
        }

        tape[headPosition - 1] = tape[headPosition - 2];
        tape[headPosition - 2] = newState;        
        headPosition--;
      }

      currentState = newState; // Atualiza o estado atual
    }

    // Verifica se a palavra foi aceita ou rejeitada
    let palavraAceita = this.finalStates.has(currentState);

    if (palavraAceita) {
      saidaData += 'Aceita'; // Se o estado atual é um estado de aceitação
      console.log('Aceita');
    } else {
      saidaData += 'Rejeita'; // Caso contrário, rejeita
      console.log('Rejeita');
    }

    return tape.join(''); // Retorna a fita final como uma string
  }

  // Método para encontrar a transição correspondente ao estado e símbolo atual
  findTransition(state, symbol) {
    for (const transition of this.transitions) {
      const [transitionState, transitionSymbol] = transition;
      if (transitionState === state && transitionSymbol === symbol) {
        return transition.slice(2); // Retorna o novo estado, símbolo a ser escrito e direção
      }
    }

    return null; // Retorna null se não houver transição correspondente
  }
}

// Função para interpretar as transições a partir de uma string de configuração
function parseTransitions(transitionsString) {
  const transitionRegex = /\(([^)]+)\)->\(([^)]+)\)/g;
  const transitions = [];
  let match;

  while ((match = transitionRegex.exec(transitionsString)) !== null) {
    const [fromState, readSymbol] = match[1].split(',');
    const [toState, writeSymbol, moveDirection] = match[2].split(',');
    transitions.push([fromState, readSymbol, toState, writeSymbol, moveDirection]); // Adiciona a transição ao array
  }

  return transitions; // Retorna o array de transições
}

// Função para ler e interpretar o arquivo de configuração da Máquina de Turing
function lerConfiguracaoArquivo(nomeArquivo) {
  const conteudo = fs.readFileSync(nomeArquivo, 'utf8'); // Lê o conteúdo do arquivo

  // Separa a entrada da máquina do resto da configuração
  const [input, ...configArray] = conteudo.split(',');
  const configContent = configArray.join(',');

  // Regex para capturar todos os elementos da configuração
  const regex = /\{\s*([^,{}]+(?:,[^,{}]+)*)\s*\},\s*\{\s*([^,{}]+(?:,[^,{}]+)*)\s*\},\s*\{\s*([^,{}]+(?:,[^,{}]+)*)\s*\},\s*\{\s*([^}]+)\s*\},\s*([^,]+),\s*\{\s*([^,{}]+(?:,[^,{}]+)*)\s*\},\s*\{\s*([^,{}]+(?:,[^,{}]+)*)\s*\},\s*([^,]+)}/;

  const match = configContent.match(regex); // Aplica o regex ao conteúdo de configuração

  // Verifica se a correspondência foi bem-sucedida e se todos os elementos foram capturados
  if (!match || match.length !== 9) {
    throw new Error('Formato de arquivo inválido');
  }

  // Extrai os elementos da configuração da máquina
  const [_, states, inputAlphabet, tapeAlphabet, transitionsString, initialState, finalStates, rejectStates, blankSymbol] = match;

  // Cria uma instância da Máquina de Turing com a configuração fornecida
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

  return { machine, input: input.trim() }; // Retorna a máquina e a entrada
}

// Função principal que coordena a execução do simulador
function main() {
  if (process.argv.length !== 4) { // Verifica se o número de argumentos está correto
    console.log('Uso: node script.js <arquivo de configuração> <saida>');
    return;
  }

  const arquivoConfiguracao = process.argv[2]; // Arquivo de configuração da Máquina de Turing
  const saida = process.argv[3]; // Arquivo onde a saída será salva

  // Lê o arquivo de configuração
  const { machine, input } = lerConfiguracaoArquivo(arquivoConfiguracao);
  machine.execute(input); // Executa a máquina de Turing com a entrada fornecida

  const writeStream = fs.createWriteStream(saida); // Cria um fluxo de escrita para o arquivo de saída
  writeStream.write(saidaData, 'utf-8'); // Escreve a saída no arquivo
}

main(); // Executa a função principal
