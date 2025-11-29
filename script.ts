import { PDFDocument } from "pdf-lib";

declare const Swal: any;

// --- Tipos e Estado ---
type ModoApp = 'merge' | 'convert';

let arquivosSelecionados: File[] = [];
let dragStartIndex: number | null = null; 
let modoAtual: ModoApp = 'merge'; // O padrão começa em "Juntar"

// --- Elementos do DOM ---
// Inputs e Containers
const inputArquivoPdf = document.getElementById("pdfInput") as HTMLInputElement;
const dropZone = document.getElementById("dropZone") as HTMLDivElement;
const containerListaDeArquivos = document.getElementById("fileList") as HTMLDivElement;
const btnAcao = document.getElementById("btnAcao") as HTMLButtonElement; // Lembre de mudar o ID no HTML para btnAcao
const botoesAba = document.querySelectorAll('.tab-btn');

// Elementos de Texto/Visual que mudam
const headerIcon = document.getElementById("headerIcon");
const tituloFerramenta = document.getElementById("tituloFerramenta");
const descFerramenta = document.getElementById("descFerramenta");
const hintUpload = document.getElementById("hintUpload");

/**
 * CONFIGURAÇÃO DAS ABAS (Alternar Modos)
 */
botoesAba.forEach(btn => {
    btn.addEventListener('click', () => {
        // 1. Visual da aba
        botoesAba.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 2. Define o modo
        modoAtual = btn.getAttribute('data-mode') as ModoApp;
        
        // 3. Reseta a lista para evitar confusão
        arquivosSelecionados = [];
        renderizarListaDeArquivos();

        // 4. Atualiza textos e ícones da tela
        atualizarInterfacePorModo();
    });
});

function atualizarInterfacePorModo() {
    if (!headerIcon || !tituloFerramenta || !descFerramenta || !hintUpload || !inputArquivoPdf) return;

    if (modoAtual === 'merge') {
        headerIcon.innerHTML = '<i class="fa-solid fa-layer-group"></i>';
        tituloFerramenta.textContent = 'Mesclar PDFs';
        descFerramenta.textContent = 'Organize seus documentos em um único arquivo.';
        hintUpload.textContent = 'Arraste ou selecione múltiplos arquivos';
        inputArquivoPdf.multiple = true; 
    } else {
        headerIcon.innerHTML = '<i class="fa-solid fa-file-word"></i>';
        tituloFerramenta.textContent = 'PDF para Word';
        descFerramenta.textContent = 'Converta seu PDF mantendo a formatação original.';
        hintUpload.textContent = 'Selecione apenas 1 arquivo';
        inputArquivoPdf.multiple = false;
    }
}

/**
 * RENDERIZAÇÃO DA LISTA (Visual)
 */
function renderizarListaDeArquivos(): void {
    if (!containerListaDeArquivos) return;

    containerListaDeArquivos.innerHTML = '';

    arquivosSelecionados.forEach((arquivo, index) => {
        const itemArquivo = document.createElement('div');
        itemArquivo.className = 'file-item';
        
        // --- Lógica de Reordenação (Só ativa no modo Merge) ---
        if (modoAtual === 'merge') {
            itemArquivo.setAttribute('draggable', 'true');
            itemArquivo.style.cursor = 'grab';

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
        } else {
            // Modo Convert não precisa reordenar (só tem 1 arquivo)
            itemArquivo.style.cursor = 'default';
        }
        // --- Fim da Lógica de Reordenação ---

        // Ícone
        const iconPdf = document.createElement('i');
        iconPdf.className = 'fa-regular fa-file-pdf file-icon-item';

        // Nome
        const nomeArquivo = document.createElement('span');
        nomeArquivo.className = 'file-item-name';
        nomeArquivo.textContent = arquivo.name;

        // Botão Excluir
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

    atualizarBotaoAcao();
}

function atualizarBotaoAcao() {
    if (!btnAcao) return;
    
    btnAcao.disabled = true;

    if (modoAtual === 'merge') {
        if (arquivosSelecionados.length >= 2) {
            btnAcao.disabled = false;
            btnAcao.innerHTML = `<span>Juntar ${arquivosSelecionados.length} PDFs</span> <i class="fa-solid fa-arrow-right"></i>`;
        } else {
            btnAcao.innerHTML = `<span>Mesclar Arquivos</span> <i class="fa-solid fa-arrow-right"></i>`;
        }
    } else {
        // Modo Convert
        if (arquivosSelecionados.length === 1) {
            btnAcao.disabled = false;
            btnAcao.innerHTML = `<span>Converter para Word</span> <i class="fa-solid fa-file-export"></i>`;
        } else {
            btnAcao.innerHTML = `<span>Escolha 1 Arquivo</span>`;
        }
    }
}

// Helpers de Array
function trocarPosicaoArray(fromIndex: number, toIndex: number): void {
    const itemMovido = arquivosSelecionados.splice(fromIndex, 1)[0];
    arquivosSelecionados.splice(toIndex, 0, itemMovido);
    renderizarListaDeArquivos();
}

function removerArquivo(index: number): void {
    arquivosSelecionados.splice(index, 1);
    renderizarListaDeArquivos();
}

/**
 * PROCESSAMENTO DE INPUT / DROP
 */
function processarArquivos(files: FileList | null): void {
    if (!files) return;
    const novosArquivos = Array.from(files);

    if (modoAtual === 'convert') {
        // Modo Converter: Aceita apenas 1 PDF. Substitui o anterior se houver.
        const pdf = novosArquivos.find(f => f.type === 'application/pdf');
        if (pdf) {
            arquivosSelecionados = [pdf];
            renderizarListaDeArquivos();
        } else {
            // Se o usuário soltou algo que não é PDF
            if (novosArquivos.length > 0) {
                Swal.fire('Formato Inválido', 'Por favor, selecione apenas arquivos PDF.', 'error');
            }
        }
    } else {
        // Modo Merge: Adiciona à lista existente
        let adicionou = false;
        novosArquivos.forEach(novo => {
            if (novo.type === "application/pdf" && !arquivosSelecionados.some(e => e.name === novo.name)) {
                arquivosSelecionados.push(novo);
                adicionou = true;
            }
        });
        if (adicionou) renderizarListaDeArquivos();
    }
}

function configurarDragAndDrop(): void {
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

/**
 * EXECUÇÃO DAS AÇÕES (Onde a mágica acontece)
 */
async function executarAcaoPrincipal() {
    if (modoAtual === 'merge') {
        await juntarPdfs();
    } else {
        await converterParaWord();
    }
}

// 1. JUNTAR PDFs (Lógica Frontend Pura)
async function juntarPdfs(): Promise<void> {
    const textoOriginal = btnAcao.innerHTML;
    btnAcao.innerHTML = `<span>Processando...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
    btnAcao.disabled = true;

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
        atualizarBotaoAcao();
    }
}

// 2. CONVERTER PARA WORD (Chama Backend Python)
async function converterParaWord(): Promise<void> {
    const arquivo = arquivosSelecionados[0];
    if (!arquivo) return;

    const textoOriginal = btnAcao.innerHTML;
    btnAcao.innerHTML = `<span>Enviando...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
    btnAcao.disabled = true;

    const formData = new FormData();
    formData.append('pdf', arquivo);

    try {
        // Tenta conectar no backend Python local
        const response = await fetch('http://127.0.0.1:5000/converter-pdf-word', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Erro na resposta do servidor Python');

        const blob = await response.blob();
        
        // Download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = arquivo.name.replace('.pdf', '.docx');
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        Swal.fire({
            title: 'Convertido!',
            text: 'O download deve começar em instantes.',
            icon: 'success',
            confirmButtonColor: '#10b981',
            background: '#1e293b',
            color: '#fff'
        });

    } catch (error) {
        console.error(error);
        Swal.fire({
            title: 'Servidor Offline',
            text: 'Não conseguimos conectar ao Python. Rode "python app.py" no terminal.',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            background: '#1e293b',
            color: '#fff'
        });
    } finally {
        atualizarBotaoAcao();
    }
}

// --- Inicialização ---
document.addEventListener("DOMContentLoaded", () => {
    // Inputs
    if (inputArquivoPdf) {
        inputArquivoPdf.addEventListener('change', (e) => {
            processarArquivos((e.target as HTMLInputElement).files);
            (e.target as HTMLInputElement).value = '';
        });
    }

    // Botão Principal
    if (btnAcao) {
        btnAcao.addEventListener('click', executarAcaoPrincipal);
    }
    
    configurarDragAndDrop();
    atualizarInterfacePorModo(); // Garante estado inicial correto
});