const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log('enter password');
    process.exit(1);
}

const password = process.argv[2];

const url = 
`mongodb+srv://ibrahimsalman:${password}@cluster0.3vdgrst.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema);

const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
})

if (process.argv.length === 3) {
    Person
        .find({})
        .then(result => {
            console.log('phonebook:');
            result.forEach(note => {
                console.log(`${note.name} ${note.number}`);
        })
        mongoose.connection.close();
    });
} else if (process.argv.length === 5) {
    person.save().then(result => {
        console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`);
        mongoose.connection.close();
    })
}