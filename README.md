# Codetutorium

# Terminal 1 - Start Backend
cd phone-mirror-tool/server
npm install
npm run dev

# Terminal 2 - Start Frontend
cd phone-mirror-tool/frontend
pip install -r requirements.txt
npm start

# Terminal 3 - Connect Device (Python)
cd phone-mirror-tool/client
pip install -r requirements.txt
python mirror_client.py --server http://localhost:3000 --session-id <ID> --session-token <TOKEN>
