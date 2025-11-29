import { PDFDocument } from "pdf-lib";

declare const Swal: any;

let arquivosSelecionados: File[] = [];

// Elementos do DOM
let inputArquivoPdf: HTMLInputElement | null = null;
let dropZone: HTMLDivElement | null = null;
let containerListaDeArquivos: HTMLDivElement | null = null;
let botaoJuntar: HTMLButtonElement | null = null;

/**
 * Atualiza a visualização da lista de arquivos no HTML
 */
function renderizarListaDeArquivos(): void {
    const container = containerListaDeArquivos;
    const botao = botaoJuntar;

    if (!container) return;

    container.innerHTML = '';

    arquivosSelecionados.forEach((arquivo, index) => {
        // Cria o card do arquivo
        const itemArquivo = document.createElement('div');
        itemArquivo.className = 'file-item';

        // Cria o ícone de PDF
        const iconPdf = document.createElement('i');
        iconPdf.className = 'fa-regular fa-file-pdf file-icon-item';

        // Cria o span com o nome
        const nomeArquivo = document.createElement('span');
        nomeArquivo.className = 'file-item-name';
        nomeArquivo.textContent = arquivo.name;

        // Cria o botão de excluir com ícone de lixeira
        const botaoExcluir = document.createElement('button');
        botaoExcluir.className = 'delete-btn';
        botaoExcluir.innerHTML = '<i class="fa-solid fa-trash"></i>';
        
        // Evento de remover
        botaoExcluir.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita cliques indesejados
            removerArquivo(index);
        });

        // Monta o item
        itemArquivo.appendChild(iconPdf);
        itemArquivo.appendChild(nomeArquivo);
        itemArquivo.appendChild(botaoExcluir);
        container.appendChild(itemArquivo);
    });

    // Atualiza estado do botão principal
    if (botao) {
        if (arquivosSelecionados.length >= 2) {
            botao.disabled = false;
            // Usamos innerHTML para manter o ícone de seta
            botao.innerHTML = `<span>Juntar ${arquivosSelecionados.length} PDFs</span> <i class="fa-solid fa-arrow-right"></i>`;
        } else {
            botao.disabled = true;
            botao.innerHTML = `<span>Mesclar Arquivos</span> <i class="fa-solid fa-arrow-right"></i>`;
        }
    }
}

/**
 * Remove um arquivo específico do array e renderiza novamente
 */
function removerArquivo(index: number): void {
    arquivosSelecionados.splice(index, 1);
    renderizarListaDeArquivos();
}

/**
 * Processa arquivos vindos do Input ou do Drag&Drop
 */
function processarArquivos(files: FileList | null): void {
    if (!files) return;

    const novosArquivos = Array.from(files);
    let adicionou = false;

    novosArquivos.forEach(novoArquivo => {
        // Validação simples de tipo e duplicidade
        if (novoArquivo.type === "application/pdf" && 
            !arquivosSelecionados.some(existente => existente.name === novoArquivo.name)) {
            arquivosSelecionados.push(novoArquivo);
            adicionou = true;
        }
    });

    if (adicionou) {
        renderizarListaDeArquivos();
    }
}

/**
 * Evento do Input File tradicional
 */
function tratarSelecaoInput(evento: Event): void {
    const target = evento.target as HTMLInputElement;
    processarArquivos(target.files);
    // Limpa o input para permitir selecionar o mesmo arquivo novamente se necessário
    target.value = '';
}

/**
 * Configura os eventos de Drag & Drop (Arrastar e Soltar)
 */
function configurarDragAndDrop(): void {
    if (!dropZone) return;

    // Previne comportamento padrão do navegador
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone?.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    // Adiciona efeito visual
    dropZone.addEventListener('dragover', () => {
        dropZone?.classList.add('drag-over');
    });

    // Remove efeito visual
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone?.addEventListener(eventName, () => {
            dropZone?.classList.remove('drag-over');
        });
    });

    // Captura os arquivos soltos
    dropZone.addEventListener('drop', (e: DragEvent) => {
        const dt = e.dataTransfer;
        if (dt) {
            processarArquivos(dt.files);
        }
    });
}

/**
 * Lógica principal de junção dos PDFs
 */
async function juntarPdfs(): Promise<void> {
    if (!botaoJuntar) return;

    if (arquivosSelecionados.length < 2) {
        Swal.fire({
            title: 'Ops!',
            text: 'Você precisa de pelo menos 2 arquivos para mesclar.',
            icon: 'warning',
            confirmButtonColor: '#6366f1', // Cor Indigo do tema
            background: '#1e293b',
            color: '#fff'
        });
        return;
    }

    // Estado de Loading
    const conteudoOriginal = botaoJuntar.innerHTML;
    botaoJuntar.innerHTML = `<span>Processando...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
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

        // Alerta de Sucesso estilizado
        await Swal.fire({
            title: 'Pronto!',
            text: 'Seus PDFs foram unidos com sucesso.',
            icon: 'success',
            confirmButtonColor: '#10b981', // Verde Emerald
            background: '#1e293b',
            color: '#fff'
        });

        // Download automático
        const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `mesclado_${new Date().getTime()}.pdf`;
        link.click();
        URL.revokeObjectURL(url);

    } catch (erro) {
        console.error(erro);
        Swal.fire({
            title: 'Erro!',
            text: 'Ocorreu um problema ao processar os arquivos.',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            background: '#1e293b',
            color: '#fff'
        });
    } finally {
        if (botaoJuntar) {
            botaoJuntar.disabled = (arquivosSelecionados.length < 2);
            // Se ainda tiver arquivos (não limpamos a lista), volta o texto normal
            if (arquivosSelecionados.length >= 2) {
                botaoJuntar.innerHTML = `<span>Juntar ${arquivosSelecionados.length} PDFs</span> <i class="fa-solid fa-arrow-right"></i>`;
            } else {
                botaoJuntar.innerHTML = conteudoOriginal;
            }
        }
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    inputArquivoPdf = document.getElementById("pdfInput") as HTMLInputElement | null;
    dropZone = document.getElementById("dropZone") as HTMLDivElement | null;
    containerListaDeArquivos = document.getElementById("fileList") as HTMLDivElement | null;
    botaoJuntar = document.getElementById("juntar") as HTMLButtonElement | null;

    if (inputArquivoPdf) {
        inputArquivoPdf.addEventListener('change', tratarSelecaoInput);
    }

    if (botaoJuntar) {
        botaoJuntar.addEventListener('click', juntarPdfs);
    }

    // Inicia ouvintes de Drag & Drop
    configurarDragAndDrop();
});