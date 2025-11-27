import { PDFDocument } from "pdf-lib";

declare const Swal: any;

let inputArquivoPdf: HTMLInputElement | null = null;
let containerListaDeArquivos: HTMLDivElement | null = null;
let botaoJuntar: HTMLButtonElement | null = null;

let arquivosSelecionados: File[] = [];

function renderizarListaDeArquivos(): void {
    // 1. Criamos uma referência LOCAL para as variáveis globais
    const container = containerListaDeArquivos;
    const botao = botaoJuntar;

    // 2. Verificamos as locais
    if (!container || !botao) return;

    container.innerHTML = ''; // Agora o TS sabe que 'container' é seguro

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

    if (arquivosSelecionados.length >= 2) {
        botao.disabled = false;
        botao.textContent = `Juntar ${arquivosSelecionados.length} PDFs`;
    } else {
        botao.disabled = true;
        botao.textContent = 'Juntar PDFs';
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

async function juntarPdfs(): Promise<void> {
    if (!botaoJuntar) return;

    if (arquivosSelecionados.length < 2) {
        Swal.fire({
            title: 'Atenção!',
            text: 'Por favor, selecione pelo menos dois arquivos PDF para unir.',
            icon: 'warning',
            confirmButtonColor: '#007bff'
        });
        return;
    }

    const textoOriginalBotao = botaoJuntar.textContent || 'Juntar PDFs';
    botaoJuntar.textContent = "Processando...";
    botaoJuntar.disabled = true;

    try {
        const pdfFinal = await PDFDocument.create();

        for (const arquivo of arquivosSelecionados) {
            const conteudoArquivo = await arquivo.arrayBuffer();
            const pdfParaJuntar = await PDFDocument.load(conteudoArquivo);
            const paginasCopiadas = await pdfFinal.copyPages(pdfParaJuntar, pdfParaJuntar.getPageIndices());
            paginasCopiadas.forEach(pagina => pdfFinal.addPage(pagina));
        }

        const bytesPdfFinal = await pdfFinal.save();

        Swal.fire({
            title: 'Sucesso!',
            text: 'Seus PDFs foram unidos e o download começará em breve.',
            icon: 'success',
            confirmButtonColor: '#28a745'
        });

        setTimeout(() => {
            const blob = new Blob([bytesPdfFinal as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "PDFs_unidos.pdf";
            link.click();
            URL.revokeObjectURL(url);
        }, 100);

    } catch (erro) {
        console.error("Erro ao juntar os PDFs:", erro);
        Swal.fire({
            title: 'Ocorreu um Erro!',
            text: 'Não foi possível unir os arquivos. Verifique se todos são PDFs válidos e tente novamente.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    } finally {
        botaoJuntar.textContent = textoOriginalBotao;
        botaoJuntar.disabled = (arquivosSelecionados.length < 2);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    inputArquivoPdf = document.getElementById("pdfInput") as HTMLInputElement | null;
    containerListaDeArquivos = document.getElementById("fileList") as HTMLDivElement | null;
    botaoJuntar = document.getElementById("juntar") as HTMLButtonElement | null;

    if (inputArquivoPdf) {
        inputArquivoPdf.addEventListener('change', tratarSelecaoDeArquivos);
        console.log("Sistema de PDF iniciado com sucesso.");
    } else {
        console.error("Erro: Input 'pdfInput' não encontrado no HTML.");
    }

    if (botaoJuntar) {
        botaoJuntar.addEventListener('click', juntarPdfs);
    }
});