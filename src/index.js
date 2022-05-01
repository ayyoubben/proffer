const express = require("express")
const cors = require("cors");
const app = express();
require("./db/db_connection")

const soumissionnaireRouter = require("./routers/Soumissionnaire")
const inscriptionRouter = require("./routers/Inscription")
const evaluateurRouter = require("./routers/Evaluateur")
const adminRouter = require("./routers/Admin")

app.use(cors())
app.use(express.json())

app.use(soumissionnaireRouter)
app.use(inscriptionRouter)
app.use(adminRouter)
app.use(evaluateurRouter)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
})