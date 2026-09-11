import app from './src/app/app.js';
import config from './src/config/config.js'
import connectToDB from './src/config/dbConnect.js';





const port = config.PORT

await connectToDB()

app.listen(port , () => {
    console.log(`Server is running on port = ${port}`)
})