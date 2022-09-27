const express = require("express")
const app = express();
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")

const path = require("path")
module.exports = app;
app.use(express.json());
const CricketPath = path.join(__dirname, "cricketMatchDetails.db")

let db  = null;

const InitializationDBtoServer = async() =>{
    try{
    db = await open({
    filename: CricketPath,
    driver: sqlite3.Database,
});
app.listen(3000, ()=>
    console.log("Server is running at https://localhost:3000/")
);
}catch(e){
    console.log(`DBError: ${e.message}`)
    process.exit(1)
};
}

InitializationDBtoServer();

const plyer = (dbobject) =>{
    return {
        plyerId: dbobject.player_id,
        playerName: dbobject.player_name,        
    }
      
 }

const match = (dbobject) =>{
    return{
        matchId:dbobject.match_id,
        match:dbobject.match,
        year:dbobject.year,        
    }
}

const playerMatchDetails = (dbobject)=>{
    return{
    playerMatchId:dbobject.player_match_id,
    playerId:dbobject.player_id,
    matchId:dbobject.match_id,
    score:dbobject.score,
    fours:dbobject.fours,
    sixes:dbobject.sixes,        
    }
}


app.get("/players/", async (request,response) =>{
    const getPlayers = `SELECT * FROM player_details;`;
    const result = await db.all(getPlayers)  
    response.send(result.map((each) => player(each)))                 
})

app.get("/players/:playerId/", async (request,response) =>{
    const{playerId} = request.params;
    const getQuery =`SELECT * FROM player_details WHERE player_id = ${playerId};`
    const getplayer = await db.get(getQuery);
    response.send(player(getplayer))        
})
