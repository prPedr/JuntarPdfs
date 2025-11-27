import { PDFDocument } from "pdf-lib";

declare const Swal: any;

const inputArquivoPdf = document.getElementById("pdfInput") as HTMLInputElement | null;
const containerListaDeArquivos = document.getElementById("fileList") as HTMLDivElement | null;
const botaoJuntar = document.getElementById("juntar") as HTMLButtonElement | null;

let arquivosSelecionados: File[] = [];

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

        botaoExcluir.addEventListener('click', () => {
            arquivosSelecionados = arquivosSelecionados.filter(f => f.name !== arquivo.name);
            renderizarListaDeArquivos();
        });

        itemArquivo.appendChild(nomeArquivo);
        itemArquivo.appendChild(botaoExcluir);
        containerListaDeArquivos.appendChild(itemArquivo);
    });

    if (arquivosSelecionados.length >= 2) {
        botaoJuntar.disabled = false;
        botaoJuntar.textContent = `Juntar ${arquivosSelecionados.length} PDFs`;
    } else {
        botaoJuntar.disabled = true;
        botaoJuntar.textContent = 'Juntar PDFs';
    }
}

function tratarSelecaoDeArquivos(evento: Event): void {
    const target = evento.target as HTMLInputElement;

    if (!target.files) return;

    const novosArquivos = Array.from(target.files);

    novosArquivos.forEach(novoArquivo => {
        if (!arquivosSelecionados.some(arquivoExistente => arquivoExistente.name === novoArquivo.name)) {
            arquivosSelecionados.push(novoArquivo);
        }
    });

    if (inputArquivoPdf) {
        inputArquivoPdf.value = '';
    }
    
    renderizarListaDeArquivos();
}