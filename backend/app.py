import os
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from pdf2docx import Converter
import tempfile

app = Flask(__name__)
# Permite que seu frontend (localhost:5500 ou similar) fale com esse backend
CORS(app) 

@app.route('/converter-pdf-word', methods=['POST'])
def converter_pdf_word():
    if 'pdf' not in request.files:
        return jsonify({"erro": "Nenhum arquivo enviado"}), 400

    arquivo = request.files['pdf']
    
    if arquivo.filename == '':
        return jsonify({"erro": "Nome de arquivo inválido"}), 400

    # Cria arquivos temporários para não encher seu servidor de lixo
    fd_pdf, path_pdf = tempfile.mkstemp(suffix=".pdf")
    fd_docx, path_docx = tempfile.mkstemp(suffix=".docx")

    try:
        # 1. Salva o PDF recebido no temporário
        with os.fdopen(fd_pdf, 'wb') as tmp:
            arquivo.save(tmp)

        # 2. Converte usando o pdf2docx (Mantém layout e tabelas)
        cv = Converter(path_pdf)
        # start=0, end=None converte todas as páginas
        cv.convert(path_docx, start=0, end=None)
        cv.close()

        # 3. Envia o arquivo Word de volta para o navegador
        return send_file(
            path_docx, 
            as_attachment=True, 
            download_name=f"{os.path.splitext(arquivo.filename)[0]}.docx",
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )

    except Exception as e:
        print(f"Erro na conversão: {e}")
        return jsonify({"erro": "Falha ao converter o arquivo."}), 500
        
    finally:
        # Limpeza: Remove os arquivos temporários do servidor
        if os.path.exists(path_pdf):
            os.remove(path_pdf)
        # O arquivo docx removemos após o envio ou se der erro? 
        # O Flask tenta remover após o envio se usarmos uma callback, 
        # mas para simplificar, em produção idealmente usa-se uma task de limpeza.
        # Aqui deixaremos o SO limpar a pasta temp eventualmente ou limpamos explicitamente se der erro.

if __name__ == '__main__':
    print("Servidor de Conversão Rodando na porta 5000...")
    app.run(debug=True, port=5000)