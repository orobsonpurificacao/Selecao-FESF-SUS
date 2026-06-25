# Seleção FESF-SUS – 1 F.C

Sistema web para gestão de atividades dos residentes do Programa Integrado de Residências FESF-SUS.

## Stack

- **Backend:** Python 3.11 · FastAPI · SQLAlchemy · SQLite
- **Frontend:** React 18 · Vite
- **Infra:** Docker · Docker Compose · Nginx

## Funcionalidades

- Listagem de residentes com especialidade e unidade de saúde
- CRUD completo de tarefas por residente
- Filtro de tarefas por status (todas / pendentes / concluídas)
- Marcar tarefa como concluída / reabrir
- Seed automático com dados fictícios ao iniciar
- API documentada via Swagger (`/docs`) e ReDoc (`/redoc`)

## Como executar

### Com Docker (recomendado)

```bash
docker compose up --build
```

- Frontend: http://localhost
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

### Sem Docker

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# acesse http://localhost:5173
```

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /residentes | Lista todos os residentes com tarefas |
| POST | /residentes | Cadastra novo residente |
| GET | /residentes/{id} | Busca residente por ID |
| DELETE | /residentes/{id} | Remove residente e suas tarefas |
| GET | /tarefas | Lista tarefas (filtro: residente_id, concluida) |
| POST | /tarefas | Cria nova tarefa |
| GET | /tarefas/{id} | Busca tarefa por ID |
| PATCH | /tarefas/{id} | Atualiza tarefa parcialmente |
| DELETE | /tarefas/{id} | Remove tarefa |

## Estrutura

```
.
├── backend/
│   ├── main.py        # Endpoints FastAPI
│   ├── models.py      # Modelos SQLAlchemy
│   ├── database.py    # Configuração do banco
│   ├── seed.py        # Dados fictícios iniciais
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx    # Componente principal React
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
```
