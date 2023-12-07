require('dotenv').config({path: __dirname + '/.env'});
const express = require('express');
const cors = require('cors');
const app = express();
const Person = require('./models/person');

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

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
}

app.use(express.json());
app.use(express.static('build'));
app.use(requestLogger);
app.use(cors());

// let persons = [
//     {
//       "id": 1,
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": 2,
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": 3,
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": 4,
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]

// method to get id from a resource
const getId = request => {
  return Number(request.params.id);
}

app.get('/info', (request, response) => {
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date().toString()}</p>
  `);
});

app.get('/api/persons', (request, response) => {
  Person
    .find({})
    .then(persons => {
      response.json(persons);
    })
});

app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then(person => {
      response.json(person);
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response) => {
  Person
    .findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person
    .save()
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  Person
    .findByIdAndUpdate(
      request.params.id, 
      { name, number }, 
      { new: true, runValidators: true, context: 'query' }
    )
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => next(error));
});

app.use(unknownEndPoint);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})