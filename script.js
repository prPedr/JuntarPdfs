// import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib";

// document.getElementById("juntar").addEventListener("click", async () => {
//   const arquivo1 = document.getElementById("pdf1").files[0];
//   const arquivo2 = document.getElementById("pdf2").files[0];

//   if (!arquivo1 || !arquivo2) {
//     alert("Selecione dois PDFs!");
//     return;
//   }

//   const pdfFinal = await PDFDocument.create();

//   for (const arquivo of [arquivo1, arquivo2]) {
//     const conteudo = await arquivo.arrayBuffer();
//     const pdfCarregado = await PDFDocument.load(conteudo);
//     const paginasCopiadas = await pdfFinal.copyPages(pdfCarregado, pdfCarregado.getPageIndices());
//     paginasCopiadas.forEach((pagina) => pdfFinal.addPage(pagina));
//   }

//   const bytesFinal = await pdfFinal.save();

//   const blob = new Blob([bytesFinal], { type: "application/pdf" });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = "saida.pdf";
//   link.click();
//   URL.revokeObjectURL(url);
// });
