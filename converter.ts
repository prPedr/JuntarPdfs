declare const Swal: any;

// --- Estado ---
let arquivoSelecionado: File | null = null;

// --- Elementos do DOM ---
const inputArquivoPdf = document.getElementById("pdfInput") as HTMLInputElement;
const dropZone = document.getElementById("dropZone") as HTMLDivElement;
const containerLista = document.getElementById("fileList") as HTMLDivElement;
const btnConverter = document.getElementById("btnConverter") as HTMLButtonElement;

/**
 * Renderiza apenas o arquivo selecionado (Substitui o anterior se houver)
 */
function renderizarArquivo(): void {
    if (!containerLista || !btnConverter) return;

    containerLista.innerHTML = '';

    if (arquivoSelecionado) {
        const itemArquivo = document.createElement('div');
        itemArquivo.className = 'file-item';
        // Cursor normal, pois não tem reordenação aqui
        itemArquivo.style.cursor = 'default';

        const iconPdf = document.createElement('i');
        iconPdf.className = 'fa-regular fa-file-pdf file-icon-item';

        const nomeArquivo = document.createElement('span');
        nomeArquivo.className = 'file-item-name';
        nomeArquivo.textContent = arquivoSelecionado.name;

        const botaoExcluir = document.createElement('button');
        botaoExcluir.className = 'delete-btn';
        botaoExcluir.innerHTML = '<i class="fa-solid fa-trash"></i>';
        botaoExcluir.addEventListener('click', (e) => {
            arquivoSelecionado = null;
            renderizarArquivo();
        });

        itemArquivo.appendChild(iconPdf);
        itemArquivo.appendChild(nomeArquivo);
        itemArquivo.appendChild(botaoExcluir);
        containerLista.appendChild(itemArquivo);

        // Habilita botão
        btnConverter.disabled = false;
        btnConverter.innerHTML = `<span>Converter Arquivo</span> <i class="fa-solid fa-wand-magic-sparkles"></i>`;
    } else {
        // Desabilita botão se não tem arquivo
        btnConverter.disabled = true;
        btnConverter.innerHTML = `<span>Escolha um Arquivo</span>`;
    }
}

/**
 * Processa o arquivo vindo do Input ou Drop
 */
function processarArquivo(files: FileList | null): void {
    if (!files || files.length === 0) return;

    const arquivo = files[0];

    if (arquivo.type !== 'application/pdf') {
        Swal.fire({
            title: 'Arquivo Inválido',
            text: 'Por favor, selecione apenas arquivos PDF.',
            icon: 'error',
            background: '#1e293b', color: '#fff'
        });
        return;
    }

    // Substitui o arquivo atual
    arquivoSelecionado = arquivo;
    renderizarArquivo();
}

/**
 * Envia para o Python e faz o Download
 */
async function converterParaWord(): Promise<void> {
    if (!arquivoSelecionado) return;

    // Loading UI
    const textoOriginal = btnConverter.innerHTML;
    btnConverter.innerHTML = `<span>Processando...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
    btnConverter.disabled = true;

    const formData = new FormData();
    formData.append('pdf', arquivoSelecionado);

    try {
        // Chama o backend (Verifique se o python app.py está rodando)
        const response = await fetch('http://127.0.0.1:5000/converter-pdf-word', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Erro na resposta do servidor Python');

        const blob = await response.blob();
        
        // Trigger Download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = arquivoSelecionado.name.replace('.pdf', '.docx');
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        Swal.fire({
            title: 'Sucesso!',
            text: 'Conversão concluída. O download iniciará em breve.',
            icon: 'success',
            confirmButtonColor: '#10b981',
            background: '#1e293b', color: '#fff'
        });

    } catch (error) {
        console.error(error);
        Swal.fire({
            title: 'Servidor Offline',
            text: 'Não foi possível conectar ao conversor. Verifique se o terminal Python está aberto.',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            background: '#1e293b', color: '#fff'
        });
    } finally {
        // Restaura o botão
        btnConverter.disabled = false;
        btnConverter.innerHTML = textoOriginal;
    }
}

// --- Inicialização ---
document.addEventListener("DOMContentLoaded", () => {
    // Input tradicional
    if (inputArquivoPdf) {
        inputArquivoPdf.addEventListener('change', (e) => {
            processarArquivo((e.target as HTMLInputElement).files);
            (e.target as HTMLInputElement).value = '';
        });
    }

    // Botão de Converter
    if (btnConverter) {
        btnConverter.addEventListener('click', converterParaWord);
    }
    
    // Drag & Drop
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
            dropZone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); });
        });
        dropZone.addEventListener('dragover', () => dropZone.classList.add('drag-over'));
        ['dragleave', 'drop'].forEach(evt => {
            dropZone.addEventListener(evt, () => dropZone.classList.remove('drag-over'));
        });
        dropZone.addEventListener('drop', (e: DragEvent) => {
            const dt = e.dataTransfer;
            if (dt) processarArquivo(dt.files);
        });
    }
});