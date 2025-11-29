import { PDFDocument } from "pdf-lib";

declare const Swal: any;

// --- Estado ---
let arquivosSelecionados: File[] = [];
let dragStartIndex: number | null = null;

// --- Elementos do DOM ---
const inputArquivoPdf = document.getElementById("pdfInput") as HTMLInputElement;
const dropZone = document.getElementById("dropZone") as HTMLDivElement;
const containerListaDeArquivos = document.getElementById("fileList") as HTMLDivElement;
const btnJuntar = document.getElementById("btnJuntar") as HTMLButtonElement;

/**
 * Renderiza a lista com lógica de Reordenação (Drag & Drop na lista)
 */
function renderizarListaDeArquivos(): void {
    if (!containerListaDeArquivos || !btnJuntar) return;

    containerListaDeArquivos.innerHTML = '';

    arquivosSelecionados.forEach((arquivo, index) => {
        const itemArquivo = document.createElement('div');
        itemArquivo.className = 'file-item';
        
        // Atributos para Drag na Lista
        itemArquivo.setAttribute('draggable', 'true');
        itemArquivo.setAttribute('data-index', index.toString());

        // Eventos de Drag & Drop para reordenar
        itemArquivo.addEventListener('dragstart', () => {
            dragStartIndex = index;
            itemArquivo.classList.add('dragging');
            setTimeout(() => itemArquivo.style.opacity = '0.5', 0);
        });

        itemArquivo.addEventListener('dragend', () => {
            itemArquivo.classList.remove('dragging');
            itemArquivo.style.opacity = '1';
            dragStartIndex = null;
            document.querySelectorAll('.file-item').forEach(el => el.classList.remove('drag-over-target'));
        });

        itemArquivo.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (dragStartIndex !== null && dragStartIndex !== index) {
                itemArquivo.classList.add('drag-over-target');
            }
        });

        itemArquivo.addEventListener('dragleave', () => {
            itemArquivo.classList.remove('drag-over-target');
        });

        itemArquivo.addEventListener('drop', (e) => {
            e.preventDefault();
            itemArquivo.classList.remove('drag-over-target');
            if (dragStartIndex !== null && dragStartIndex !== index) {
                trocarPosicaoArray(dragStartIndex, index);
            }
        });

        // Conteúdo do Card
        const iconPdf = document.createElement('i');
        iconPdf.className = 'fa-regular fa-file-pdf file-icon-item';

        const nomeArquivo = document.createElement('span');
        nomeArquivo.className = 'file-item-name';
        nomeArquivo.textContent = arquivo.name;

        const botaoExcluir = document.createElement('button');
        botaoExcluir.className = 'delete-btn';
        botaoExcluir.innerHTML = '<i class="fa-solid fa-trash"></i>';
        botaoExcluir.addEventListener('click', (e) => {
            e.stopPropagation();
            removerArquivo(index);
        });

        itemArquivo.appendChild(iconPdf);
        itemArquivo.appendChild(nomeArquivo);
        itemArquivo.appendChild(botaoExcluir);
        containerListaDeArquivos.appendChild(itemArquivo);
    });

    atualizarBotao();
}

function atualizarBotao() {
    if (!btnJuntar) return;
    
    if (arquivosSelecionados.length >= 2) {
        btnJuntar.disabled = false;
        btnJuntar.innerHTML = `<span>Juntar ${arquivosSelecionados.length} PDFs</span> <i class="fa-solid fa-arrow-right"></i>`;
    } else {
        btnJuntar.disabled = true;
        btnJuntar.innerHTML = `<span>Mesclar Arquivos</span> <i class="fa-solid fa-arrow-right"></i>`;
    }
}

function trocarPosicaoArray(fromIndex: number, toIndex: number): void {
    const itemMovido = arquivosSelecionados.splice(fromIndex, 1)[0];
    arquivosSelecionados.splice(toIndex, 0, itemMovido);
    renderizarListaDeArquivos();
}

function removerArquivo(index: number): void {
    arquivosSelecionados.splice(index, 1);
    renderizarListaDeArquivos();
}

// --- Upload Logic ---
function processarArquivos(files: FileList | null): void {
    if (!files) return;
    const novosArquivos = Array.from(files);
    let adicionou = false;

    novosArquivos.forEach(novo => {
        if (novo.type === "application/pdf" && !arquivosSelecionados.some(e => e.name === novo.name)) {
            arquivosSelecionados.push(novo);
            adicionou = true;
        }
    });

    if (adicionou) renderizarListaDeArquivos();
}

function configurarDragAndDropUpload(): void {
    if (!dropZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault(); e.stopPropagation();
        }, false);
    });

    dropZone.addEventListener('dragover', () => dropZone.classList.add('drag-over'));
    
    ['dragleave', 'drop'].forEach(evt => {
        dropZone.addEventListener(evt, () => dropZone.classList.remove('drag-over'));
    });

    dropZone.addEventListener('drop', (e: DragEvent) => {
        const dt = e.dataTransfer;
        if (dt) processarArquivos(dt.files);
    });
}

// --- Ação Principal (Juntar) ---
async function juntarPdfs(): Promise<void> {
    if (arquivosSelecionados.length < 2) return;

    const textoOriginal = btnJuntar.innerHTML;
    btnJuntar.innerHTML = `<span>Processando...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
    btnJuntar.disabled = true;

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

        // Download
        const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `mesclado_${Date.now()}.pdf`;
        link.click();
        URL.revokeObjectURL(url);

    } catch (erro) {
        console.error(erro);
        Swal.fire({ title: 'Erro', text: 'Falha ao unir arquivos.', icon: 'error', background: '#1e293b', color: '#fff' });
    } finally {
        // Restaura botão
        if (arquivosSelecionados.length >= 2) {
            btnJuntar.disabled = false;
            btnJuntar.innerHTML = `<span>Juntar ${arquivosSelecionados.length} PDFs</span> <i class="fa-solid fa-arrow-right"></i>`;
        } else {
            btnJuntar.innerHTML = textoOriginal;
        }
    }
}

// --- Inicialização ---
document.addEventListener("DOMContentLoaded", () => {
    if (inputArquivoPdf) {
        inputArquivoPdf.addEventListener('change', (e) => {
            processarArquivos((e.target as HTMLInputElement).files);
            (e.target as HTMLInputElement).value = '';
        });
    }

    if (btnJuntar) {
        btnJuntar.addEventListener('click', juntarPdfs);
    }
    
    configurarDragAndDropUpload();
});