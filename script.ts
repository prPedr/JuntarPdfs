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
            
            // Copia todas as páginas
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
            const blob = new Blob([bytesPdfFinal as unknown as BlobPart], { type: "application/pdf" });
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

if (inputArquivoPdf) {
    inputArquivoPdf.addEventListener('change', tratarSelecaoDeArquivos);
}

if (botaoJuntar) {
    botaoJuntar.addEventListener('click', juntarPdfs);
}