import { PDFDocument } from "pdf-lib";

// Declaração global para o SweetAlert2 (caso esteja usando via CDN)
// Se estiver usando via npm: import Swal from 'sweetalert2';
declare const Swal: any;

// Seleção de elementos com Casting (Tipagem explícita)
const inputArquivoPdf = document.getElementById("pdfInput") as HTMLInputElement | null;
const containerListaDeArquivos = document.getElementById("fileList") as HTMLDivElement | null;
const botaoJuntar = document.getElementById("juntar") as HTMLButtonElement | null;

// Tipagem do estado: Array de objetos File
let arquivosSelecionados: File[] = [];