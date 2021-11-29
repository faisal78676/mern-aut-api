const express = require('express');
const PORT = 4000;
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes =  require('./src/routes/auth');
// console.log('db',process.env.DATABASE);
mongoose.connect(process.env.DATABASE,{
    useNewUrlParser:true
})
.then(()=>{
    console.log('Database is Connected');
})
.catch(err=>{
    console.log('Could not connect to DB',err);
});

app.use(morgan('dev'));
app.use(express.json());
if(process.env.NODE_ENV = 'development'){
    app.use(cors({origin:'http://localhost:3000'}))
}



app.use('/api',authRoutes);


app.listen(PORT,()=>{
    console.log('Server Running on PORT 4000');
})