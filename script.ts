import { PDFDocument } from "pdf-lib";

declare const Swal: any;

let arquivosSelecionados: File[] = [];

let inputArquivoPdf: HTMLInputElement | null = null;
let containerListaDeArquivos: HTMLDivElement | null = null;
let botaoJuntar: HTMLButtonElement | null = null;

function renderizarListaDeArquivos(): void {
    const container = containerListaDeArquivos;
    const botao = botaoJuntar;

    if (!container) {
        console.error("Erro: Container 'fileList' não encontrado no DOM.");
        return;
    }

    container.innerHTML = '';

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
        container.appendChild(itemArquivo);
    });

    if (botao) {
        if (arquivosSelecionados.length >= 2) {
            botao.disabled = false;
            botao.textContent = `Juntar ${arquivosSelecionados.length} PDFs`;
        } else {
            botao.disabled = true;
            botao.textContent = 'Juntar PDFs';
        }
    }
}

function tratarSelecaoDeArquivos(evento: Event): void {
    const target = evento.target as HTMLInputElement;
    if (!target.files) return;

    const novosArquivos = Array.from(target.files);

    novosArquivos.forEach(novoArquivo => {
        if (!arquivosSelecionados.some(existente => existente.name === novoArquivo.name)) {
            arquivosSelecionados.push(novoArquivo);
        }
    });

    if (inputArquivoPdf) {
        inputArquivoPdf.value = '';
    }
    
    renderizarListaDeArquivos();
}

async function juntarPdfs(): Promise<void> {
    if (!botaoJuntar) return;

    if (arquivosSelecionados.length < 2) {
        Swal.fire({
            title: 'Atenção!',
            text: 'Selecione pelo menos dois arquivos PDF.',
            icon: 'warning',
            confirmButtonColor: '#007bff'
        });
        return;
    }

    const textoOriginal = botaoJuntar.textContent || 'Juntar PDFs';
    botaoJuntar.textContent = "Processando...";
    botaoJuntar.disabled = true;

    try {
        const pdfFinal = await PDFDocument.create();

        for (const arquivo of arquivosSelecionados) {
            const buffer = await arquivo.arrayBuffer();
            const pdfOrigem = await PDFDocument.load(buffer);
            const paginas = await pdfFinal.copyPages(pdfOrigem, pdfOrigem.getPageIndices());
            paginas.forEach(p => pdfFinal.addPage(p));
        }

        const pdfBytes = await pdfFinal.save();

        Swal.fire({
            title: 'Sucesso!',
            text: 'PDFs unidos com sucesso!',
            icon: 'success',
            confirmButtonColor: '#28a745'
        });

        setTimeout(() => {
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "PDFs_unidos.pdf";
            link.click();
            URL.revokeObjectURL(url);
        }, 100);

    } catch (erro) {
        console.error(erro);
        Swal.fire({
            title: 'Erro!',
            text: 'Não foi possível processar os arquivos.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    } finally {
        if (botaoJuntar) {
            botaoJuntar.textContent = textoOriginal;
            botaoJuntar.disabled = (arquivosSelecionados.length < 2);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    inputArquivoPdf = document.getElementById("pdfInput") as HTMLInputElement | null;
    containerListaDeArquivos = document.getElementById("fileList") as HTMLDivElement | null;
    botaoJuntar = document.getElementById("juntar") as HTMLButtonElement | null;

    if (inputArquivoPdf) {
        inputArquivoPdf.addEventListener('change', tratarSelecaoDeArquivos);
    } else {
        console.error("Input 'pdfInput' não encontrado.");
    }

    if (botaoJuntar) {
        botaoJuntar.addEventListener('click', juntarPdfs);
    }
});