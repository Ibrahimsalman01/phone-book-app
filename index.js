const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// middleware
const requestLogger = (request, response, next) => {
  console.log('Method: ', request.method);
  console.log('Path:   ', request.path);
  console.log('Body:   ', request.body);
  console.log('---------------------------\n');
  next();
}

const unknownEndPoint = (request, response) => {
  response.status(404).send({ error: 'unkown endpoint' })
}

morgan.token('bodyContent', (request, response) => {
  return JSON.stringify(request.body);
})

app.use(express.json());
app.use(express.static('build'));
app.use(requestLogger);
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :bodyContent'));
app.use(cors());

let persons = [
    {
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

// method to get id from a resource
const getId = request => {
  return Number(request.params.id);
}

// method to generate random id
const generateId = () => {
  return Math.floor(Math.random() * 10000);
}

app.get('/info', (request, response) => {
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date().toString()}</p>
  `);
})

app.get('/api/persons', (request, response) => {
    response.json(persons);
})

app.get('/api/persons/:id', (request, response) => {
  const id = getId(request);
  const person = persons.find(p => p.id === id);
  
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = getId(request);
  persons = persons.filter(p => p.id !== id);
  
  response.status(204).end();
})

app.post('/api/persons', (request, response) => {
  const body = request.body;
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Content missing'
    });
  } else if (persons.find(p => p.name === body.name)) {
    return response.status(409).json({
      error: 'name must be unique'
    });
  }

  const newPerson = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(newPerson);
  response.json(newPerson);
})

app.use(unknownEndPoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})