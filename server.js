import exp from 'express'
import {connect} from 'mongoose'
const app= exp()
async function connectToDb(){
    try{
        await connect("mongodb://localhost:27017/jobportal")
    }catch(err)
    {
        console.log("err in database connection")
    }
}
connectToDb();
app.listen(4000,()=>{
    "server listening on port 4000"
})

