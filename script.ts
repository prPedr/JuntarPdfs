import { PDFDocument } from "pdf-lib";

declare const Swal: any;

let arquivosSelecionados: File[] = [];
let dragStartIndex: number | null = null;

let inputArquivoPdf: HTMLInputElement | null = null;
let dropZone: HTMLDivElement | null = null;
let containerListaDeArquivos: HTMLDivElement | null = null;
let botaoJuntar: HTMLButtonElement | null = null;

function renderizarListaDeArquivos(): void {
    const container = containerListaDeArquivos;
    const botao = botaoJuntar;

    if (!container) return;

    container.innerHTML = '';

    arquivosSelecionados.forEach((arquivo, index) => {
        // Cria o card do arquivo
        const itemArquivo = document.createElement('div');
        itemArquivo.className = 'file-item';
        
        // --- LÓGICA DE REORDENAÇÃO (Drag & Drop na Lista) ---
        itemArquivo.setAttribute('draggable', 'true');
        itemArquivo.setAttribute('data-index', index.toString());

        // 1. Início do arrasto
        itemArquivo.addEventListener('dragstart', () => {
            dragStartIndex = index;
            itemArquivo.classList.add('dragging');
            // Timeout para o efeito visual fantasma funcionar
            setTimeout(() => itemArquivo.style.opacity = '0.5', 0);
        });

        // 2. Fim do arrasto
        itemArquivo.addEventListener('dragend', () => {
            itemArquivo.classList.remove('dragging');
            itemArquivo.style.opacity = '1';
            dragStartIndex = null;
            
            // Limpa estilos visuais de todos os itens
            document.querySelectorAll('.file-item').forEach(el => 
                el.classList.remove('drag-over-target')
            );
        });

        // 3. Arrastando por cima de outro item
        itemArquivo.addEventListener('dragover', (e) => {
            e.preventDefault(); // Permite o drop
            if (dragStartIndex !== null && dragStartIndex !== index) {
                itemArquivo.classList.add('drag-over-target');
            }
        });

        // 4. Saiu de cima
        itemArquivo.addEventListener('dragleave', () => {
            itemArquivo.classList.remove('drag-over-target');
        });

        // 5. Soltou o item
        itemArquivo.addEventListener('drop', (e) => {
            e.preventDefault();
            itemArquivo.classList.remove('drag-over-target');
            
            if (dragStartIndex !== null && dragStartIndex !== index) {
                trocarPosicaoArray(dragStartIndex, index);
            }
        });
        // --- FIM DA LÓGICA DE REORDENAÇÃO ---

        // Ícone de PDF
        const iconPdf = document.createElement('i');
        iconPdf.className = 'fa-regular fa-file-pdf file-icon-item';

        // Nome do arquivo
        const nomeArquivo = document.createElement('span');
        nomeArquivo.className = 'file-item-name';
        nomeArquivo.textContent = arquivo.name;

        // Botão de Excluir
        const botaoExcluir = document.createElement('button');
        botaoExcluir.className = 'delete-btn';
        botaoExcluir.innerHTML = '<i class="fa-solid fa-trash"></i>';
        
        botaoExcluir.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita conflito com drag
            removerArquivo(index);
        });

        // Montagem do item
        itemArquivo.appendChild(iconPdf);
        itemArquivo.appendChild(nomeArquivo);
        itemArquivo.appendChild(botaoExcluir);
        container.appendChild(itemArquivo);
    });

    // Atualiza estado do botão principal
    if (botao) {
        if (arquivosSelecionados.length >= 2) {
            botao.disabled = false;
            botao.innerHTML = `<span>Juntar ${arquivosSelecionados.length} PDFs</span> <i class="fa-solid fa-arrow-right"></i>`;
        } else {
            botao.disabled = true;
            botao.innerHTML = `<span>Mesclar Arquivos</span> <i class="fa-solid fa-arrow-right"></i>`;
        }
    }
}

/**
 * Helper para trocar itens de posição no Array
 */
function trocarPosicaoArray(fromIndex: number, toIndex: number): void {
    const itemMovido = arquivosSelecionados.splice(fromIndex, 1)[0];
    arquivosSelecionados.splice(toIndex, 0, itemMovido);
    renderizarListaDeArquivos();
}

/**
 * Remove um arquivo e atualiza a tela
 */
function removerArquivo(index: number): void {
    arquivosSelecionados.splice(index, 1);
    renderizarListaDeArquivos();
}

/**
 * Processa novos arquivos (Input ou DropZone)
 */
function processarArquivos(files: FileList | null): void {
    if (!files) return;

    const novosArquivos = Array.from(files);
    let adicionou = false;

    novosArquivos.forEach(novoArquivo => {
        // Verifica tipo e duplicidade
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
 * Handler do Input File padrão
 */
function tratarSelecaoInput(evento: Event): void {
    const target = evento.target as HTMLInputElement;
    processarArquivos(target.files);
    target.value = ''; // Reset para permitir selecionar o mesmo arquivo
}

/**
 * Configura Drag & Drop da Zona de Upload (DropZone)
 */
function configurarDragAndDropUpload(): void {
    if (!dropZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone?.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    dropZone.addEventListener('dragover', () => {
        dropZone?.classList.add('drag-over');
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone?.addEventListener(eventName, () => {
            dropZone?.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('drop', (e: DragEvent) => {
        const dt = e.dataTransfer;
        if (dt) {
            processarArquivos(dt.files);
        }
    });
}

/**
 * Lógica Principal de Junção
 */
async function juntarPdfs(): Promise<void> {
    if (!botaoJuntar) return;

    if (arquivosSelecionados.length < 2) {
        Swal.fire({
            title: 'Ops!',
            text: 'Você precisa de pelo menos 2 arquivos para mesclar.',
            icon: 'warning',
            confirmButtonColor: '#6366f1',
            background: '#1e293b',
            color: '#fff'
        });
        return;
    }

    // Estado de Carregamento
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

        Swal.fire({
            title: 'Pronto!',
            text: 'Seus PDFs foram unidos com sucesso.',
            icon: 'success',
            confirmButtonColor: '#10b981',
            background: '#1e293b',
            color: '#fff'
        });

        // Correção do erro de Blob usando 'as any'
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
            // Restaura o botão se ainda houver arquivos na lista
            if (arquivosSelecionados.length >= 2) {
                botaoJuntar.disabled = false;
                botaoJuntar.innerHTML = `<span>Juntar ${arquivosSelecionados.length} PDFs</span> <i class="fa-solid fa-arrow-right"></i>`;
            } else {
                botaoJuntar.innerHTML = conteudoOriginal;
                botaoJuntar.disabled = true; // Garante que volta desativado se o usuário limpou a lista durante o processo (raro, mas seguro)
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

    configurarDragAndDropUpload();
});