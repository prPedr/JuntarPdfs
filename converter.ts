declare const Swal: any;

// Elementos
const inputArquivo = document.getElementById("pdfInput") as HTMLInputElement;
const btnConverter = document.getElementById("btnConverter") as HTMLButtonElement; // Crie esse botão no HTML
let arquivoSelecionado: File | null = null;

// Reutilize a lógica de Drag and Drop que criamos antes para preencher 'arquivoSelecionado'
// ... (Lógica de Drag & Drop igual ao anterior, mas para 1 arquivo apenas)

async function converterParaWord() {
    if (!arquivoSelecionado) {
        Swal.fire('Atenção', 'Selecione um arquivo PDF primeiro.', 'warning');
        return;
    }

    // Feedback visual
    const textoOriginal = btnConverter.innerHTML;
    btnConverter.innerHTML = `<span>Convertendo... (Isso pode demorar um pouco)</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
    btnConverter.disabled = true;

    const formData = new FormData();
    formData.append('pdf', arquivoSelecionado);

    try {
        // Chama o seu backend Python
        const response = await fetch('http://127.0.0.1:5000/converter-pdf-word', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Erro no servidor');

        // Recebe o binário do arquivo Word
        const blob = await response.blob();
        
        // Faz o download
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
            text: 'Arquivo convertido e baixado.',
            icon: 'success',
            confirmButtonColor: '#10b981'
        });

    } catch (error) {
        console.error(error);
        Swal.fire('Erro', 'Não foi possível converter o arquivo. Verifique se o servidor Python está rodando.', 'error');
    } finally {
        btnConverter.innerHTML = textoOriginal;
        btnConverter.disabled = false;
    }
}

// Event Listeners
btnConverter?.addEventListener('click', converterParaWord);