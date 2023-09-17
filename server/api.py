import os
import sys
import time
import openai
from langchain.chains import ConversationalRetrievalChain
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import GCSDirectoryLoader
from langchain.embeddings import OpenAIEmbeddings
from langchain.indexes import VectorstoreIndexCreator
from langchain.indexes.vectorstore import VectorStoreIndexWrapper
from langchain.vectorstores import Chroma
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from google.cloud import storage
from flask_cors import CORS  # Import the CORS extension
import shutil

# Load environment variables from .env file
load_dotenv()

# Set your OpenAI API key
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

# Set your Google Cloud project and bucket
PROJECT_NAME = os.getenv("PROJECT")
BUCKET_NAME = os.getenv("BUCKET")

# Enable to save to disk & reuse the model (for repeated queries on the same data)
PERSIST = True


def init_chain(index=None):
    if index is None:
        if PERSIST and os.path.exists("persist"):
            print("Reusing index...\n")
            vectorstore = Chroma(persist_directory="persist", embedding_function=OpenAIEmbeddings())
            index = VectorStoreIndexWrapper(vectorstore=vectorstore)
        else:

            # Initialize the GCS directory loader
            loader = GCSDirectoryLoader(project_name=PROJECT_NAME, bucket=BUCKET_NAME)

            if PERSIST:
                index = VectorstoreIndexCreator(vectorstore_kwargs={"persist_directory": "persist"}).from_loaders([loader])
            else:
                index = VectorstoreIndexCreator().from_loaders([loader])

    return ConversationalRetrievalChain.from_llm(
        llm=ChatOpenAI(model="gpt-3.5-turbo"),
        # k = pages of reading
        retriever=index.vectorstore.as_retriever(search_kwargs={"k": 100}),
    )

    # loader= GCSDirectoryLoader(project_name=PROJECT_NAME, bucket=BUCKET_NAME)
    # global index
    # index = VectorstoreIndexCreator().from_loaders([loader])

    # return ConversationalRetrievalChain.from_llm(
    #     llm=ChatOpenAI(model="gpt-3.5-turbo"),
    #     retriever=index.vectorstore.as_retriever(search_kwargs={"k": 100}),
    # )

# global chain
chain = init_chain()

def init_gcs_client():
    return storage.Client(project=PROJECT_NAME)

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for the entire application
CORS(app)

@app.route('/api/query', methods=['POST'])
def handle_query():
    print(f"incoming json:{request.json}")
    query = request.json.get('query', '')
    print(f"PRINT THIS: {query}")
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    
    result = chain({"question": query, "chat_history": chat_history})
    response = {'answer': result['answer']}

    chat_history.append((query, result['answer']))

    return jsonify(response)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    #global chain
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    #filename needs to be absolute
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        # Securely save the file with a unique name
        filename = secure_filename(file.filename)
        storage_client = init_gcs_client()
        blob = storage_client.bucket(BUCKET_NAME).blob(filename)

        # Upload the file to GCS
        blob.upload_from_file(file)

       # Re-init the global chain for the updated file structure
        #delete persist dir
        shutil.rmtree('persist')
        loader = GCSDirectoryLoader(project_name=PROJECT_NAME, bucket=BUCKET_NAME)
        index = VectorstoreIndexCreator(vectorstore_kwargs={"persist_directory": "persist"}).from_loaders([loader])
        global chain
        chain = init_chain(index=index)
        
        return jsonify({'message': 'File uploaded successfully'}), 200

@app.route('/api/list-files', methods=['GET'])
def list_files():
    storage_client = init_gcs_client()
    blobs = storage_client.list_blobs(BUCKET_NAME)

    file_info = [{"name": blob.name, "size": blob.size} for blob in blobs]

    return jsonify(file_info)

if __name__ == '__main__':

    chat_history = []

    app.run(host='0.0.0.0', port=5000)
