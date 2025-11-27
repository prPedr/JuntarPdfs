// import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib";

// const inputArquivoPdf = document.getElementById("pdfInput");
// const containerListaDeArquivos = document.getElementById("fileList");
// const botaoJuntar = document.getElementById("juntar");

// let arquivosSelecionados = [];

// function renderizarListaDeArquivos() {
//     containerListaDeArquivos.innerHTML = '';

//     arquivosSelecionados.forEach(arquivo => {
//         const itemArquivo = document.createElement('div');
//         itemArquivo.className = 'file-item';
//         const nomeArquivo = document.createElement('span');
//         nomeArquivo.className = 'file-item-name';
//         nomeArquivo.textContent = arquivo.name;
//         const botaoExcluir = document.createElement('button');
//         botaoExcluir.className = 'delete-btn';
//         botaoExcluir.textContent = '×';
//         botaoExcluir.dataset.filename = arquivo.name;

//         botaoExcluir.addEventListener('click', () => {
//             arquivosSelecionados = arquivosSelecionados.filter(f => f.name !== arquivo.name);
//             renderizarListaDeArquivos();
//         });

//         itemArquivo.appendChild(nomeArquivo);
//         itemArquivo.appendChild(botaoExcluir);
//         containerListaDeArquivos.appendChild(itemArquivo);
//     });

//     if (arquivosSelecionados.length >= 2) {
//         botaoJuntar.disabled = false;
//         botaoJuntar.textContent = `Juntar ${arquivosSelecionados.length} PDFs`;
//     } else {
//         botaoJuntar.disabled = true;
//         botaoJuntar.textContent = 'Juntar PDFs';
//     }
// }

// function tratarSelecaoDeArquivos(evento) {
//     const novosArquivos = Array.from(evento.target.files);

//     novosArquivos.forEach(novoArquivo => {
//         if (!arquivosSelecionados.some(arquivoExistente => arquivoExistente.name === novoArquivo.name)) {
//             arquivosSelecionados.push(novoArquivo);
//         }
//     });

//     inputArquivoPdf.value = '';
//     renderizarListaDeArquivos();
// }

// async function juntarPdfs() {
//     if (arquivosSelecionados.length < 2) {
//         Swal.fire({
//             title: 'Atenção!',
//             text: 'Por favor, selecione pelo menos dois arquivos PDF para unir.',
//             icon: 'warning',
//             confirmButtonColor: '#007bff'
//         });
//         return;
//     }

//     const textoOriginalBotao = botaoJuntar.textContent;
//     botaoJuntar.textContent = "Processando...";
//     botaoJuntar.disabled = true;

//     try {
//         const pdfFinal = await PDFDocument.create();

//         for (const arquivo of arquivosSelecionados) {
//             const conteudoArquivo = await arquivo.arrayBuffer();
//             const pdfParaJuntar = await PDFDocument.load(conteudoArquivo);
//             const paginasCopiadas = await pdfFinal.copyPages(pdfParaJuntar, pdfParaJuntar.getPageIndices());
//             paginasCopiadas.forEach(pagina => pdfFinal.addPage(pagina));
//         }

//         const bytesPdfFinal = await pdfFinal.save();

//         Swal.fire({
//             title: 'Sucesso!',
//             text: 'Seus PDFs foram unidos e o download começará em breve.',
//             icon: 'success',
//             confirmButtonColor: '#28a745'
//         });

//         setTimeout(() => {
//             const blob = new Blob([bytesPdfFinal], { type: "application/pdf" });
//             const url = URL.createObjectURL(blob);
//             const link = document.createElement("a");
//             link.href = url;
//             link.download = "PDFs_unidos.pdf";
//             link.click();
//             URL.revokeObjectURL(url);
//         }, 100);

//     } catch (erro) {
//         console.error("Erro ao juntar os PDFs:", erro);
//         Swal.fire({
//             title: 'Ocorreu um Erro!',
//             text: 'Não foi possível unir os arquivos. Verifique se todos são PDFs válidos e tente novamente.',
//             icon: 'error',
//             confirmButtonColor: '#dc3545'
//         });
//     } finally {
//         botaoJuntar.textContent = textoOriginalBotao;
//         botaoJuntar.disabled = (arquivosSelecionados.length < 2);
//     }
// }

// inputArquivoPdf.addEventListener('change', tratarSelecaoDeArquivos);
// botaoJuntar.addEventListener('click', juntarPdfs);