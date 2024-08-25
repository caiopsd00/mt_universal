NODE = node
REQUIRED_NODE_VERSION = 18.17.0
SRCDIR = ./src
TESTDIR = ./testes
SCRIPT = $(SRCDIR)/main.js
DEFAULT_INPUT = input-base.txt

# Preparação do ambiente
all: remove_conflicting_packages install_node_without_nvm

# Remove pacotes conflitantes
remove_conflicting_packages:
	@echo "Removendo pacotes conflitantes..."; \
	sudo apt-get remove --purge nodejs libnode72 -y || true; \
	sudo apt-get autoremove -y || true; \
	sudo apt-get clean || true;

# Instalação do Node.js diretamente (sem nvm)
install_node_without_nvm:
	@echo "Instalando Node.js versão $(REQUIRED_NODE_VERSION)..."; \
	sudo apt-get install -y curl; \
	curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -; \
	sudo apt-get install -y nodejs; \
	node -v

# Regra para rodar ambos os algoritmos com o arquivo padrão ou especificado
run:
	$(NODE) $(SCRIPT) $(TESTDIR)/$(input) saida.txt

# Regras para rodar testes individuais de força bruta
run-1:
	$(NODE) $(SCRIPT) $(TESTDIR)/input-1.txt saida.txt

run-2:
	$(NODE) $(SCRIPT) $(TESTDIR)/input-2.txt saida.txt

run-3:
	$(NODE) $(SCRIPT) $(TESTDIR)/input-3.txt saida.txt

run-4:
	$(NODE) $(SCRIPT) $(TESTDIR)/input-4.txt saida.txt

run-5:
	$(NODE) $(SCRIPT) $(TESTDIR)/input-5.txt saida.txt

run-6:
	$(NODE) $(SCRIPT) $(TESTDIR)/input-6.txt saida.txt

run-7:
	$(NODE) $(SCRIPT) $(TESTDIR)/input-7.txt saida.txt

run-8:
	$(NODE) $(SCRIPT) $(TESTDIR)/input-8.txt saida.txt

run-9:
	$(NODE) $(SCRIPT) $(TESTDIR)/input-9.txt saida.txt

# Valor padrão para a variável input
input ?= $(DEFAULT_INPUT)

# Limpar arquivos de logs
clean:
	rm -f *.log