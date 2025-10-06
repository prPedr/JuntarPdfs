# 📄 Unir PDFs - PDF Merger

Um aplicativo web simples e eficiente para unir múltiplos arquivos PDF em um único documento. Desenvolvido com HTML, CSS e JavaScript puro, o projeto é executado inteiramente no navegador do cliente, garantindo a privacidade e a segurança dos seus arquivos.

## ✨ Funcionalidades Principais

* **Seleção Múltipla de Arquivos**: Adicione vários arquivos PDF de uma só vez.
* **Interface Intuitiva**: Visualize a lista de arquivos selecionados antes de uni-los.
* **Remoção de Arquivos**: Exclua arquivos da lista facilmente, um por um.
* **Processamento no Cliente**: Todo o processo de fusão de PDFs ocorre diretamente no seu navegador, sem a necessidade de enviar seus arquivos para um servidor.
* **Notificações Claras**: Receba alertas de sucesso, erro ou avisos usando a biblioteca SweetAlert2.
* **Design Responsivo**: Use a ferramenta em qualquer dispositivo, seja desktop ou mobile.
* **Download Instantâneo**: Baixe o arquivo PDF unido com um único clique.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando tecnologias web modernas e bibliotecas de código aberto:

* **HTML5**: Para a estrutura semântica da página.
* **CSS3**: Para estilização e design responsivo.
* **JavaScript (ES6 Modules)**: Para toda a lógica e interatividade da aplicação.
* **[pdf-lib](https://pdf-lib.js.org/)**: Uma poderosa biblioteca para criar e modificar documentos PDF em JavaScript.
* **[SweetAlert2](https://sweetalert2.github.io/)**: Para criar alertas bonitos, responsivos e personalizáveis.

## 🔧 Como Executar o Projeto Localmente

Para executar este projeto em sua máquina local, siga os passos abaixo.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    ```

2.  **Navegue até o diretório do projeto:**
    ```bash
    cd seu-repositorio
    ```

3.  **Abra o arquivo `index.html` em um servidor local.**
    Como o projeto utiliza Módulos ES6 (`import`/`export`), abrir o `index.html` diretamente no navegador pode causar erros de CORS. A maneira mais fácil de contornar isso é usando um servidor local.

    Se você usa o **Visual Studio Code**, pode instalar a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) e clicar em "Go Live" no canto inferior direito.

    Alternativamente, se você tem o Python instalado, pode executar um dos seguintes comandos no terminal, dentro da pasta do projeto:

    *Para Python 3.x:*
    ```bash
    python -m http.server
    ```
    *Para Python 2.x:*
    ```bash
    python -m SimpleHTTPServer
    ```
    Depois, acesse `http://localhost:8000` (ou a porta indicada) no seu navegador.

## 📂 Estrutura do Projeto

O código está organizado nos seguintes arquivos:

* `index.html`: Contém a estrutura da interface do usuário, incluindo o formulário de upload, a lista de arquivos e o botão para unir os PDFs.
* `style.css`: Responsável por toda a estilização da página. Define o layout, as cores, as fontes e a responsividade da aplicação.
* `script.js`: O cérebro do projeto. Contém toda a lógica em JavaScript para manipular os arquivos, renderizar a lista, interagir com a biblioteca `pdf-lib` para unir os documentos e gerar o arquivo final para download.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.