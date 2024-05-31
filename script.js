const express = require('express')
const sqlite3 = require('sqlite3')
const cookieParser = require('cookie-parser');
const app = express()
const port  = 3000
app.use(cookieParser());
// ejs config
app.set('view engine', 'ejs')
app.use(express.static('public'))

// middleware to parse req body
app.use(express.urlencoded({extended:true}))

// db config
const db = new sqlite3.Database('./db/db_task.db')

// Authendication functionalities
app.post('/reg',(req,res)=>{
    const {name,age,email,password} = req.body
    console.log(name , age,email,password)

    db.run(
        'INSERT INTO auth (name,age,email,password) VALUES (?,?,?,?)',
        [name,age,email,password],
        (err)=>{
            console.log(err)
            if(err){
                return res.render('reg',{error:'Registration Failed. Email may already be in use.'})
            }
            res.redirect('/login')
        }
    )
})

app.post('/login',(req,res)=>{
    const {email,password} = req.body
    console.log(email,password)
    
    db.get('SELECT * FROM auth WHERE email = ? AND password = ?',
        [email,password],
        (err,user)=>{
            if(err || !user){
                return res.render('login',{error: 'Invalid email or password.'})
            }
            if (user){
                var userid=user.id
                res.cookie('userid',String(userid), { maxAge: 900000, httpOnly: true });
            }
            
            res.redirect('/task')
        }
    )
})

app.get('/task',(req,res)=>{
    res.render('task')
})
 app.post('/task',(req,res)=>{
    const userid=req.cookies.userid
    console.log(userid)
    const {title,desc,date} = req.body
    console.log(title,desc,date)

    db.run(
        'INSERT INTO task (title,description,date,user_id) VALUES (?,?,?,?)',
        [title,desc,date,userid],
        (err)=>{
            console.log(err)
            if(err){
                return res.render('task',{error:'error while entering on the db'})
            }
            res.redirect('/tasks_list')
        }
    )
 })

app.get('/',(req,res)=>{
    res.render('index',{message:'hello'})
})

app.get('/login',(req,res)=>{
    res.render('login',{error:''})
})

app.get('/reg',(req,res)=>{
    res.render('reg',{error:''})
    
})
app.get('/tasks_list',(req,res)=>{
    const userid=req.cookies.userid
    db.all('SELECT title,description,date,id FROM task WHERE user_id = ?',[userid],(error,tasks)=>{
     if(error){
         res.status(500).send('Internal Server Error')
         return 
    }
    res.render('tasks_list',{tasks})
 }) 

   
})
app.get('/edit_page/:taskid',(req,res)=>{
    const taskid=req.params.taskid
    db.get('SELECT title,description,date,id FROM task WHERE id = ?',
        [taskid],
        (err,task)=>{
            if(err || !task){
                return res.render('edit',{error: 'Invalid task id'})
            }
            res.render('edit',{error:'',task})   
        }
    )
   
})
app.get('/delete/:taskid',(req,res)=>{
    const taskid=req.params.taskid
    db.run('DELETE  FROM task  WHERE id = ?',
        [taskid],
        (err)=>{
            if(err){
                return res.redirect('/tasks_list')

            }
    res.redirect('/tasks_list')

        }
    ) 
        
})
app.post('/edit/:taskid',(req,res)=>{
    const taskid=req.params.taskid
    const {title,desc,date} = req.body
    console.log(title,desc,date)
    db.run('UPDATE task SET title = ?,description = ?, date = ? WHERE id = ?',
        [title,desc,date,taskid],
        (err)=>{
            if(err){
                return res.render('edit',{error: 'Invalid task id'})
            }
        }
    ) 
    res.redirect('/tasks_list')
   
})




app.listen(port,()=>{
    console.log('server is running at http://localhost:3000')
})