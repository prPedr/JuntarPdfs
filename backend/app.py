import os
import tempfile
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from pdf2docx import Converter

app = Flask(__name__)
CORS(app) # Permite que o navegador (frontend) converse com o Python

@app.route('/converter-pdf-word', methods=['POST'])
def converter_pdf_word():
    if 'pdf' not in request.files:
        return jsonify({"erro": "Nenhum arquivo enviado"}), 400

    arquivo = request.files['pdf']
    
    if arquivo.filename == '':
        return jsonify({"erro": "Nome de arquivo inválido"}), 400

    # Cria arquivos temporários
    fd_pdf, path_pdf = tempfile.mkstemp(suffix=".pdf")
    fd_docx, path_docx = tempfile.mkstemp(suffix=".docx")

    try:
        # 1. Salva o PDF
        with os.fdopen(fd_pdf, 'wb') as tmp:
            arquivo.save(tmp)

        # 2. Converte (Onde a mágica acontece)
        cv = Converter(path_pdf)
        cv.convert(path_docx, start=0, end=None)
        cv.close()

        # 3. Retorna o DOCX
        nome_original = os.path.splitext(arquivo.filename)[0]
        return send_file(
            path_docx, 
            as_attachment=True, 
            download_name=f"{nome_original}.docx",
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )

    except Exception as e:
        print(f"Erro no servidor: {e}")
        return jsonify({"erro": "Falha na conversão"}), 500
        
    finally:
        # Limpa o arquivo PDF temporário (o docx o sistema limpa depois)
        if os.path.exists(path_pdf):
            os.remove(path_pdf)

if __name__ == '__main__':
    print("--- Servidor de Conversão Pronto (Porta 5000) ---")
    app.run(debug=True, port=5000)