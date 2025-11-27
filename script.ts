import { PDFDocument } from "pdf-lib";

// Declaração global para o SweetAlert2 (caso esteja usando via CDN)
// Se estiver usando via npm: import Swal from 'sweetalert2';
declare const Swal: any;

// Seleção de elementos com Casting (Tipagem explícita)
const inputArquivoPdf = document.getElementById("pdfInput") as HTMLInputElement | null;
const containerListaDeArquivos = document.getElementById("fileList") as HTMLDivElement | null;
const botaoJuntar = document.getElementById("juntar") as HTMLButtonElement | null;

// Tipagem do estado: Array de objetos File
let arquivosSelecionados: File[] = [];

// Função para renderizar a lista visual
function renderizarListaDeArquivos(): void {
    if (!containerListaDeArquivos || !botaoJuntar) return;

    containerListaDeArquivos.innerHTML = '';

    arquivosSelecionados.forEach(arquivo => {
        const itemArquivo = document.createElement('div');
        itemArquivo.className = 'file-item';

        const nomeArquivo = document.createElement('span');
        nomeArquivo.className = 'file-item-name';
        nomeArquivo.textContent = arquivo.name;

        const botaoExcluir = document.createElement('button');
        botaoExcluir.className = 'delete-btn';
        botaoExcluir.textContent = '×';
        
        // Não é estritamente necessário dataset aqui se usarmos o closure, 
        // mas mantive a lógica limpa.
        botaoExcluir.addEventListener('click', () => {
            arquivosSelecionados = arquivosSelecionados.filter(f => f.name !== arquivo.name);
            renderizarListaDeArquivos();
        });

        itemArquivo.appendChild(nomeArquivo);
        itemArquivo.appendChild(botaoExcluir);
        containerListaDeArquivos.appendChild(itemArquivo);
    });

    // Controle do estado do botão
    if (arquivosSelecionados.length >= 2) {
        botaoJuntar.disabled = false;
        botaoJuntar.textContent = `Juntar ${arquivosSelecionados.length} PDFs`;
    } else {
        botaoJuntar.disabled = true;
        botaoJuntar.textContent = 'Juntar PDFs';
    }
}